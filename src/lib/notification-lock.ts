import { createHmac, randomUUID } from "node:crypto";

const LOCK_TTL_SECONDS = 5 * 60;
const SENT_TTL_SECONDS = 90 * 24 * 60 * 60;

const CLAIM_SCRIPT = `
local current = redis.call("GET", KEYS[1])
if current == "sent" then
  return 2
end
if not current then
  redis.call("SET", KEYS[1], ARGV[1], "EX", tonumber(ARGV[2]))
  return 1
end
return 0
`;

const FINISH_SCRIPT = `
local current = redis.call("GET", KEYS[1])
if current == "sent" then
  return 2
end
if current == ARGV[1] then
  redis.call("SET", KEYS[1], "sent", "EX", tonumber(ARGV[2]))
  return 1
end
return 0
`;

const RELEASE_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
return 0
`;

interface OwnedNotificationClaim {
  status: "claimed";
  backend: "redis" | "memory";
  key: string;
  ownerToken: string;
}

export type NotificationLockClaim =
  | OwnedNotificationClaim
  | { status: "sent" | "busy" };

interface MemoryEntry {
  value: string;
  expiresAt: number;
}

const memoryEntries = new Map<string, MemoryEntry>();

function redisConfig() {
  return {
    url: (
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.RATE_LIMIT_REDIS_REST_URL ||
      ""
    ).replace(/\/$/, ""),
    token:
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      process.env.RATE_LIMIT_REDIS_REST_TOKEN ||
      "",
  };
}

function lockKey(identity: string) {
  const secret =
    process.env.RATE_LIMIT_HASH_SECRET ||
    process.env.ORDER_TOKEN_SECRET ||
    "development-notification-key";
  const digest = createHmac("sha256", secret)
    .update(identity)
    .digest("hex")
    .slice(0, 40);
  return `tint:missing-docs-email:${digest}`;
}

async function redisEval(
  script: string,
  key: string,
  args: Array<string | number>
): Promise<unknown> {
  const { url, token } = redisConfig();
  if (!url || !token) return undefined;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["EVAL", script, "1", key, ...args]),
    cache: "no-store",
    signal: AbortSignal.timeout(4_000),
  });
  if (!response.ok) {
    throw new Error(`notification idempotency status=${response.status}`);
  }
  const json = (await response.json()) as { result?: unknown };
  return json.result;
}

function memoryClaim(key: string, ownerToken: string): NotificationLockClaim {
  const now = Date.now();
  const current = memoryEntries.get(key);
  if (current && current.expiresAt <= now) memoryEntries.delete(key);
  const live = memoryEntries.get(key);
  if (live?.value === "sent") return { status: "sent" };
  if (live) return { status: "busy" };
  memoryEntries.set(key, {
    value: ownerToken,
    expiresAt: now + LOCK_TTL_SECONDS * 1_000,
  });
  return { status: "claimed", backend: "memory", key, ownerToken };
}

/**
 * Atomically claims a per-submission email send. The random owner token keeps
 * a timed-out worker from completing or deleting a newer worker's lock.
 */
export async function claimNotificationLock(
  identity: string
): Promise<NotificationLockClaim> {
  const key = lockKey(identity);
  const ownerToken = `owner:${randomUUID()}`;
  try {
    const result = await redisEval(CLAIM_SCRIPT, key, [
      ownerToken,
      LOCK_TTL_SECONDS,
    ]);
    if (result !== undefined) {
      const code = Number(result);
      if (code === 2) return { status: "sent" };
      if (code === 1) {
        return { status: "claimed", backend: "redis", key, ownerToken };
      }
      return { status: "busy" };
    }
  } catch {
    console.error(
      "Notification idempotency store unavailable; using local fallback"
    );
  }
  return memoryClaim(key, ownerToken);
}

/** Persist the sent state only while this worker still owns the lock. */
export async function finishNotificationLock(
  claim: NotificationLockClaim
): Promise<boolean> {
  if (claim.status !== "claimed") return claim.status === "sent";
  if (claim.backend === "redis") {
    try {
      const result = await redisEval(FINISH_SCRIPT, claim.key, [
        claim.ownerToken,
        SENT_TTL_SECONDS,
      ]);
      return Number(result) === 1 || Number(result) === 2;
    } catch {
      console.error("Notification sent marker could not be persisted");
      return false;
    }
  }
  const current = memoryEntries.get(claim.key);
  if (current && current.expiresAt <= Date.now()) {
    memoryEntries.delete(claim.key);
    return false;
  }
  if (current?.value === "sent") return true;
  if (current?.value !== claim.ownerToken) return false;
  memoryEntries.set(claim.key, {
    value: "sent",
    expiresAt: Date.now() + SENT_TTL_SECONDS * 1_000,
  });
  return true;
}

/** Release a failed send only if this worker still owns the lock. */
export async function releaseNotificationLock(
  claim: NotificationLockClaim
): Promise<void> {
  if (claim.status !== "claimed") return;
  if (claim.backend === "redis") {
    try {
      await redisEval(RELEASE_SCRIPT, claim.key, [claim.ownerToken]);
    } catch {
      console.error("Notification lock could not be released");
    }
    return;
  }
  const current = memoryEntries.get(claim.key);
  if (current && current.expiresAt <= Date.now()) {
    memoryEntries.delete(claim.key);
    return;
  }
  if (current?.value === claim.ownerToken) {
    memoryEntries.delete(claim.key);
  }
}
