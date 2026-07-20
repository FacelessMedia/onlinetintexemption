import { createHash, randomUUID } from "node:crypto";

const LOCK_TTL_SECONDS = 60;
const MAX_ATTEMPTS = 8;

const CLAIM_SCRIPT = `
if not redis.call("GET", KEYS[1]) then
  redis.call("SET", KEYS[1], ARGV[1], "EX", tonumber(ARGV[2]))
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

interface MemoryLock {
  owner: string;
  expiresAt: number;
}

const memoryLocks = new Map<string, MemoryLock>();

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

function lockKey(opportunityId: string) {
  const digest = createHash("sha256").update(opportunityId).digest("hex");
  return `tint:opportunity-stage:${digest}`;
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
    throw new Error(`Opportunity stage lock status=${response.status}`);
  }
  const payload = (await response.json()) as { result?: unknown };
  return payload.result;
}

function claimMemory(key: string, owner: string) {
  const now = Date.now();
  const current = memoryLocks.get(key);
  if (current && current.expiresAt <= now) memoryLocks.delete(key);
  if (memoryLocks.has(key)) return false;
  memoryLocks.set(key, {
    owner,
    expiresAt: now + LOCK_TTL_SECONDS * 1_000,
  });
  return true;
}

function releaseMemory(key: string, owner: string) {
  const current = memoryLocks.get(key);
  if (current?.owner === owner) memoryLocks.delete(key);
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Serializes every stage mutation for one GHL opportunity across all sites and
 * the central webhook. The key is an opaque hash of the opportunity id, so all
 * projects derive the same lock without placing customer data in Redis keys.
 */
export async function withOpportunityStageLock<T>(
  opportunityId: string,
  work: () => Promise<T>
): Promise<T> {
  if (!opportunityId) throw new Error("Opportunity stage lock identity missing");
  const key = lockKey(opportunityId);
  const owner = `owner:${randomUUID()}`;
  const redis = redisConfig();
  const strict = process.env.SECURITY_ENFORCEMENT_MODE === "strict";

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    let backend: "redis" | "memory" | null = null;
    try {
      const result = await redisEval(CLAIM_SCRIPT, key, [
        owner,
        LOCK_TTL_SECONDS,
      ]);
      if (result !== undefined) {
        if (Number(result) === 1) backend = "redis";
      } else if (!strict && claimMemory(key, owner)) {
        backend = "memory";
      } else if (strict && (!redis.url || !redis.token)) {
        throw new Error("Opportunity stage lock configuration missing");
      }
    } catch (error) {
      if (strict) throw error;
      if (claimMemory(key, owner)) backend = "memory";
    }

    if (backend) {
      try {
        return await work();
      } finally {
        if (backend === "redis") {
          try {
            await redisEval(RELEASE_SCRIPT, key, [owner]);
          } catch {
            console.error("Opportunity stage lock release failed");
          }
        } else {
          releaseMemory(key, owner);
        }
      }
    }

    if (attempt < MAX_ATTEMPTS - 1) await wait(75 * (attempt + 1));
  }

  throw new Error("Opportunity stage update is busy");
}
