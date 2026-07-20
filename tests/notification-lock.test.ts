import assert from "node:assert/strict";
import test from "node:test";
import {
  claimNotificationLock,
  finishNotificationLock,
  releaseNotificationLock,
} from "../src/lib/notification-lock.ts";

function installRedisMock() {
  const values = new Map<string, string>();
  const calls: unknown[][] = [];
  const fetchMock: typeof fetch = async (_input, init) => {
    const command = JSON.parse(String(init?.body)) as unknown[];
    calls.push(command);
    assert.equal(command[0], "EVAL");
    const script = String(command[1]);
    const key = String(command[3]);
    const owner = String(command[4]);
    const current = values.get(key);
    let result = 0;
    if (script.includes('redis.call("DEL"')) {
      if (current === owner) {
        values.delete(key);
        result = 1;
      }
    } else if (script.includes('"sent", "EX"')) {
      if (current === "sent") result = 2;
      else if (current === owner) {
        values.set(key, "sent");
        result = 1;
      }
    } else if (current === "sent") {
      result = 2;
    } else if (current === undefined) {
      values.set(key, owner);
      result = 1;
    }
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  return { calls, fetchMock };
}

test("Redis notification lock is owner-safe and distinguishes busy from sent", async () => {
  const mutableEnv = process.env as Record<string, string | undefined>;
  const originalUrl = mutableEnv.UPSTASH_REDIS_REST_URL;
  const originalToken = mutableEnv.UPSTASH_REDIS_REST_TOKEN;
  const originalFetch = globalThis.fetch;
  mutableEnv.UPSTASH_REDIS_REST_URL = "https://redis.example.test";
  mutableEnv.UPSTASH_REDIS_REST_TOKEN = "test-token";
  const { calls, fetchMock } = installRedisMock();
  globalThis.fetch = fetchMock;

  try {
    const identity = `submission-${crypto.randomUUID()}`;
    const first = await claimNotificationLock(identity);
    assert.equal(first.status, "claimed");
    if (first.status !== "claimed") throw new Error("expected lock owner");

    assert.equal((await claimNotificationLock(identity)).status, "busy");
    await releaseNotificationLock({
      ...first,
      ownerToken: `owner:${crypto.randomUUID()}`,
    });
    assert.equal((await claimNotificationLock(identity)).status, "busy");

    await releaseNotificationLock(first);
    const retry = await claimNotificationLock(identity);
    assert.equal(retry.status, "claimed");
    if (retry.status !== "claimed") throw new Error("expected retry owner");
    assert.notEqual(retry.ownerToken, first.ownerToken);
    assert.equal(await finishNotificationLock(retry), true);
    assert.equal((await claimNotificationLock(identity)).status, "sent");
    assert.ok(calls.length >= 7);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete mutableEnv.UPSTASH_REDIS_REST_URL;
    else mutableEnv.UPSTASH_REDIS_REST_URL = originalUrl;
    if (originalToken === undefined) delete mutableEnv.UPSTASH_REDIS_REST_TOKEN;
    else mutableEnv.UPSTASH_REDIS_REST_TOKEN = originalToken;
  }
});

test("notification lock keeps an owner-safe in-memory fallback without Redis", async () => {
  const mutableEnv = process.env as Record<string, string | undefined>;
  const originalUrl = mutableEnv.UPSTASH_REDIS_REST_URL;
  const originalToken = mutableEnv.UPSTASH_REDIS_REST_TOKEN;
  const originalFallbackUrl = mutableEnv.RATE_LIMIT_REDIS_REST_URL;
  const originalFallbackToken = mutableEnv.RATE_LIMIT_REDIS_REST_TOKEN;
  delete mutableEnv.UPSTASH_REDIS_REST_URL;
  delete mutableEnv.UPSTASH_REDIS_REST_TOKEN;
  delete mutableEnv.RATE_LIMIT_REDIS_REST_URL;
  delete mutableEnv.RATE_LIMIT_REDIS_REST_TOKEN;

  try {
    const identity = `local-${crypto.randomUUID()}`;
    const first = await claimNotificationLock(identity);
    assert.equal(first.status, "claimed");
    if (first.status !== "claimed") throw new Error("expected local owner");
    assert.equal((await claimNotificationLock(identity)).status, "busy");
    await releaseNotificationLock({ ...first, ownerToken: "owner:not-owner" });
    assert.equal((await claimNotificationLock(identity)).status, "busy");
    await releaseNotificationLock(first);
    const retry = await claimNotificationLock(identity);
    assert.equal(retry.status, "claimed");
    assert.equal(await finishNotificationLock(retry), true);
    assert.equal((await claimNotificationLock(identity)).status, "sent");
  } finally {
    if (originalUrl === undefined) delete mutableEnv.UPSTASH_REDIS_REST_URL;
    else mutableEnv.UPSTASH_REDIS_REST_URL = originalUrl;
    if (originalToken === undefined) delete mutableEnv.UPSTASH_REDIS_REST_TOKEN;
    else mutableEnv.UPSTASH_REDIS_REST_TOKEN = originalToken;
    if (originalFallbackUrl === undefined) delete mutableEnv.RATE_LIMIT_REDIS_REST_URL;
    else mutableEnv.RATE_LIMIT_REDIS_REST_URL = originalFallbackUrl;
    if (originalFallbackToken === undefined) delete mutableEnv.RATE_LIMIT_REDIS_REST_TOKEN;
    else mutableEnv.RATE_LIMIT_REDIS_REST_TOKEN = originalFallbackToken;
  }
});
