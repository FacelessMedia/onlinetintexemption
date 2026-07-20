import { createHash, randomUUID } from "node:crypto";
import { isStrictSecurityEnforcement } from "./request-security.ts";

const completedMemoryEvents = new Map<string, number>();
const lockedMemoryEvents = new Map<
  string,
  { ownerToken: string; expiresAt: number }
>();

const PROCESSING_TTL_SECONDS = 5 * 60;
const COMPLETED_TTL_SECONDS = 90 * 24 * 60 * 60;

const COMPLETE_IF_OWNER_SCRIPT = [
  "if redis.call('GET', KEYS[1]) == ARGV[1] then",
  "  redis.call('SET', KEYS[1], 'complete', 'EX', ARGV[2])",
  "  return 1",
  "end",
  "return 0",
].join("\n");

const RELEASE_IF_OWNER_SCRIPT = [
  "if redis.call('GET', KEYS[1]) == ARGV[1] then",
  "  return redis.call('DEL', KEYS[1])",
  "end",
  "return 0",
].join("\n");

function redisConfig() {
  return {
    url: process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "") || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  };
}

async function redisCommand(command: Array<string | number>): Promise<unknown> {
  const { url, token } = redisConfig();
  if (!url || !token) return undefined;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`idempotency store status=${response.status}`);
  const json = (await response.json()) as { result?: unknown };
  return json.result;
}

export type StripeEventClaim =
  | { status: "claimed"; ownerToken: string }
  | { status: "complete" }
  | { status: "processing" };

export async function claimStripeEvent(eventId: string): Promise<StripeEventClaim> {
  const key = stripeEventKey(eventId);
  const ownerToken = randomUUID();
  const processingValue = `processing:${ownerToken}`;
  const strict = isStrictSecurityEnforcement();
  try {
    const result = await redisCommand([
      "SET",
      key,
      processingValue,
      "NX",
      "EX",
      PROCESSING_TTL_SECONDS,
    ]);
    if (result === "OK") return { status: "claimed", ownerToken };
    if (result !== undefined) {
      const current = await redisCommand(["GET", key]);
      return current === "complete"
        ? { status: "complete" }
        : { status: "processing" };
    }
    if (strict) throw new Error("Distributed idempotency is not configured");
  } catch {
    console.error("Stripe idempotency store unavailable");
    if (strict) throw new Error("Distributed idempotency is unavailable");
  }
  const now = Date.now();
  if ((completedMemoryEvents.get(key) || 0) > now) {
    return { status: "complete" };
  }
  const currentLock = lockedMemoryEvents.get(key);
  if (currentLock && currentLock.expiresAt > now) {
    return { status: "processing" };
  }
  lockedMemoryEvents.set(key, {
    ownerToken,
    expiresAt: now + PROCESSING_TTL_SECONDS * 1_000,
  });
  return { status: "claimed", ownerToken };
}

/**
 * Mark an event complete only while this worker still owns the processing
 * lock. A delayed worker can never overwrite a newer worker's lock.
 */
export async function completeStripeEvent(
  eventId: string,
  ownerToken: string
): Promise<boolean> {
  const key = stripeEventKey(eventId);
  const processingValue = `processing:${ownerToken}`;
  try {
    const result = await redisCommand([
      "EVAL",
      COMPLETE_IF_OWNER_SCRIPT,
      "1",
      key,
      processingValue,
      COMPLETED_TTL_SECONDS,
    ]);
    if (result !== undefined) return Number(result) === 1;
    if (isStrictSecurityEnforcement()) {
      throw new Error("Distributed idempotency is not configured");
    }
  } catch {
    console.error("Could not persist completed Stripe event");
    if (isStrictSecurityEnforcement()) {
      throw new Error("Distributed idempotency is unavailable");
    }
  }
  const now = Date.now();
  const currentLock = lockedMemoryEvents.get(key);
  if (
    !currentLock ||
    currentLock.ownerToken !== ownerToken ||
    currentLock.expiresAt <= now
  ) {
    return false;
  }
  lockedMemoryEvents.delete(key);
  completedMemoryEvents.set(key, Date.now() + 24 * 60 * 60_000);
  return true;
}

/** Delete only this worker's lock; never release another worker's retry. */
export async function releaseStripeEvent(
  eventId: string,
  ownerToken: string
): Promise<boolean> {
  const key = stripeEventKey(eventId);
  const processingValue = `processing:${ownerToken}`;
  try {
    const result = await redisCommand([
      "EVAL",
      RELEASE_IF_OWNER_SCRIPT,
      "1",
      key,
      processingValue,
    ]);
    if (result !== undefined) return Number(result) === 1;
  } catch {
    console.error("Could not release failed Stripe event lock");
  }
  const currentLock = lockedMemoryEvents.get(key);
  if (!currentLock || currentLock.ownerToken !== ownerToken) return false;
  lockedMemoryEvents.delete(key);
  return true;
}

function stripeEventKey(eventId: string): string {
  return `tint:stripe-event:${createHash("sha256").update(eventId).digest("hex")}`;
}
