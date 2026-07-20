import assert from "node:assert/strict";
import test from "node:test";
import {
  claimStripeEvent,
  completeStripeEvent,
  releaseStripeEvent,
} from "../src/lib/idempotency.ts";

test("Stripe event locks distinguish processing from completed fulfillment", async () => {
  const mutableEnv = process.env as Record<string, string | undefined>;
  const originalNodeEnv = mutableEnv.NODE_ENV;
  const originalMode = mutableEnv.SECURITY_ENFORCEMENT_MODE;
  const originalUrl = mutableEnv.UPSTASH_REDIS_REST_URL;
  const originalToken = mutableEnv.UPSTASH_REDIS_REST_TOKEN;
  mutableEnv.NODE_ENV = "test";
  delete mutableEnv.SECURITY_ENFORCEMENT_MODE;
  delete mutableEnv.UPSTASH_REDIS_REST_URL;
  delete mutableEnv.UPSTASH_REDIS_REST_TOKEN;
  const eventId = `evt_test_${crypto.randomUUID()}`;

  try {
    const firstClaim = await claimStripeEvent(eventId);
    assert.equal(firstClaim.status, "claimed");
    assert.equal((await claimStripeEvent(eventId)).status, "processing");
    assert.equal(
      await completeStripeEvent(eventId, crypto.randomUUID()),
      false,
      "a worker that does not own the lock cannot complete it"
    );
    assert.equal((await claimStripeEvent(eventId)).status, "processing");
    assert.equal(
      await releaseStripeEvent(eventId, crypto.randomUUID()),
      false,
      "a worker that does not own the lock cannot release it"
    );
    assert.equal((await claimStripeEvent(eventId)).status, "processing");
    assert.equal(firstClaim.status, "claimed");
    assert.equal(
      await completeStripeEvent(eventId, firstClaim.ownerToken),
      true
    );
    assert.equal((await claimStripeEvent(eventId)).status, "complete");

    const retryableEventId = `evt_test_${crypto.randomUUID()}`;
    const retryableClaim = await claimStripeEvent(retryableEventId);
    assert.equal(retryableClaim.status, "claimed");
    assert.equal(retryableClaim.status, "claimed");
    assert.equal(
      await releaseStripeEvent(retryableEventId, retryableClaim.ownerToken),
      true
    );
    const replacementClaim = await claimStripeEvent(retryableEventId);
    assert.equal(replacementClaim.status, "claimed");
    assert.equal(replacementClaim.status, "claimed");
    assert.notEqual(replacementClaim.ownerToken, retryableClaim.ownerToken);
    assert.equal(
      await releaseStripeEvent(retryableEventId, retryableClaim.ownerToken),
      false,
      "an old owner cannot release a replacement worker's lock"
    );
    assert.equal((await claimStripeEvent(retryableEventId)).status, "processing");
    assert.equal(
      await releaseStripeEvent(retryableEventId, replacementClaim.ownerToken),
      true
    );
  } finally {
    if (originalNodeEnv === undefined) delete mutableEnv.NODE_ENV;
    else mutableEnv.NODE_ENV = originalNodeEnv;
    if (originalMode === undefined) delete mutableEnv.SECURITY_ENFORCEMENT_MODE;
    else mutableEnv.SECURITY_ENFORCEMENT_MODE = originalMode;
    if (originalUrl === undefined) delete mutableEnv.UPSTASH_REDIS_REST_URL;
    else mutableEnv.UPSTASH_REDIS_REST_URL = originalUrl;
    if (originalToken === undefined) delete mutableEnv.UPSTASH_REDIS_REST_TOKEN;
    else mutableEnv.UPSTASH_REDIS_REST_TOKEN = originalToken;
  }
});

test("Redis completion and release compare the unique lock owner atomically", async () => {
  const mutableEnv = process.env as Record<string, string | undefined>;
  const originalNodeEnv = mutableEnv.NODE_ENV;
  const originalMode = mutableEnv.SECURITY_ENFORCEMENT_MODE;
  const originalUrl = mutableEnv.UPSTASH_REDIS_REST_URL;
  const originalToken = mutableEnv.UPSTASH_REDIS_REST_TOKEN;
  const originalFetch = globalThis.fetch;
  const redis = new Map<string, string>();
  mutableEnv.NODE_ENV = "test";
  mutableEnv.SECURITY_ENFORCEMENT_MODE = "strict";
  mutableEnv.UPSTASH_REDIS_REST_URL = "https://redis.example.test";
  mutableEnv.UPSTASH_REDIS_REST_TOKEN = "test-token";

  globalThis.fetch = async (_input, init) => {
    const command = JSON.parse(String(init?.body)) as Array<string | number>;
    const operation = command[0];
    let result: string | number | null = null;
    if (operation === "SET") {
      const key = String(command[1]);
      if (!redis.has(key)) {
        redis.set(key, String(command[2]));
        result = "OK";
      }
    } else if (operation === "GET") {
      result = redis.get(String(command[1])) ?? null;
    } else if (operation === "EVAL") {
      const script = String(command[1]);
      const key = String(command[3]);
      const expectedOwner = String(command[4]);
      if (redis.get(key) === expectedOwner) {
        if (script.includes("redis.call('SET'")) {
          redis.set(key, "complete");
        } else {
          redis.delete(key);
        }
        result = 1;
      } else {
        result = 0;
      }
    } else {
      throw new Error(`Unexpected Redis command: ${String(operation)}`);
    }
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const eventId = `evt_redis_${crypto.randomUUID()}`;
    const first = await claimStripeEvent(eventId);
    assert.equal(first.status, "claimed");
    assert.equal(first.status, "claimed");
    assert.equal(await completeStripeEvent(eventId, crypto.randomUUID()), false);
    assert.equal(await releaseStripeEvent(eventId, crypto.randomUUID()), false);
    assert.equal((await claimStripeEvent(eventId)).status, "processing");
    assert.equal(await releaseStripeEvent(eventId, first.ownerToken), true);

    const replacement = await claimStripeEvent(eventId);
    assert.equal(replacement.status, "claimed");
    assert.equal(replacement.status, "claimed");
    assert.notEqual(replacement.ownerToken, first.ownerToken);
    assert.equal(await releaseStripeEvent(eventId, first.ownerToken), false);
    assert.equal(
      await completeStripeEvent(eventId, replacement.ownerToken),
      true
    );
    assert.equal((await claimStripeEvent(eventId)).status, "complete");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalNodeEnv === undefined) delete mutableEnv.NODE_ENV;
    else mutableEnv.NODE_ENV = originalNodeEnv;
    if (originalMode === undefined) delete mutableEnv.SECURITY_ENFORCEMENT_MODE;
    else mutableEnv.SECURITY_ENFORCEMENT_MODE = originalMode;
    if (originalUrl === undefined) delete mutableEnv.UPSTASH_REDIS_REST_URL;
    else mutableEnv.UPSTASH_REDIS_REST_URL = originalUrl;
    if (originalToken === undefined) delete mutableEnv.UPSTASH_REDIS_REST_TOKEN;
    else mutableEnv.UPSTASH_REDIS_REST_TOKEN = originalToken;
  }
});
