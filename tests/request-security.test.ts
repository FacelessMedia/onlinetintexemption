import assert from "node:assert/strict";
import test from "node:test";
import {
  clientSafetyIdentifier,
  readBoundedJson,
  RequestBodyError,
  isStrictSecurityEnforcement,
  securityConfigurationErrors,
} from "../src/lib/request-security.ts";

test("support safety identifier is stable, bounded, and does not expose the IP", () => {
  const mutableEnv = process.env as Record<string, string | undefined>;
  const originalSecret = mutableEnv.RATE_LIMIT_HASH_SECRET;
  mutableEnv.RATE_LIMIT_HASH_SECRET = "test-safety-secret";
  try {
    const request = new Request("https://example.test/api", {
      headers: { "x-forwarded-for": "192.0.2.42" },
    }) as never;
    const first = clientSafetyIdentifier(request);
    const second = clientSafetyIdentifier(request);
    assert.equal(first, second);
    assert.match(first, /^[0-9a-f]{64}$/);
    assert.equal(first.includes("192.0.2.42"), false);
  } finally {
    if (originalSecret === undefined) delete mutableEnv.RATE_LIMIT_HASH_SECRET;
    else mutableEnv.RATE_LIMIT_HASH_SECRET = originalSecret;
  }
});

test("bounded JSON reader accepts valid JSON within the byte limit", async () => {
  const request = new Request("https://example.test/api", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ ok: true }),
  });
  assert.deepEqual(await readBoundedJson(request, 1_024), { ok: true });
});

test("production security cannot silently fall back to observation mode", () => {
  const mutableEnv = process.env as Record<string, string | undefined>;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalMode = process.env.SECURITY_ENFORCEMENT_MODE;
  try {
    mutableEnv.NODE_ENV = "production";
    process.env.SECURITY_ENFORCEMENT_MODE = "observation";
    assert.equal(isStrictSecurityEnforcement(), true);

    mutableEnv.NODE_ENV = "test";
    assert.equal(isStrictSecurityEnforcement(), false);
    process.env.SECURITY_ENFORCEMENT_MODE = "strict";
    assert.equal(isStrictSecurityEnforcement(), true);
  } finally {
    if (originalNodeEnv === undefined) delete mutableEnv.NODE_ENV;
    else mutableEnv.NODE_ENV = originalNodeEnv;
    if (originalMode === undefined) delete process.env.SECURITY_ENFORCEMENT_MODE;
    else process.env.SECURITY_ENFORCEMENT_MODE = originalMode;
  }
});

test("bounded JSON reader rejects unsupported media types", async () => {
  const request = new Request("https://example.test/api", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "{}",
  });
  await assert.rejects(
    readBoundedJson(request, 1_024),
    (error: unknown) =>
      error instanceof RequestBodyError && error.status === 415
  );
});

test("bounded JSON reader enforces declared and actual byte limits", async () => {
  const declared = new Request("https://example.test/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": "2048",
    },
    body: "{}",
  });
  await assert.rejects(
    readBoundedJson(declared, 1_024),
    (error: unknown) =>
      error instanceof RequestBodyError && error.status === 413
  );

  const actual = new Request("https://example.test/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "x".repeat(2_000) }),
  });
  await assert.rejects(
    readBoundedJson(actual, 1_024),
    (error: unknown) =>
      error instanceof RequestBodyError && error.status === 413
  );
});

test("strict configuration remains endpoint-scoped from CRM workflow settings", () => {
  const mutableEnv = process.env as Record<string, string | undefined>;
  const keys = [
    "NODE_ENV",
    "SECURITY_ENFORCEMENT_MODE",
    "SITE_URL",
    "ORDER_TOKEN_SECRET",
    "UPLOAD_RECEIPT_SECRET",
    "RATE_LIMIT_HASH_SECRET",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "TURNSTILE_SECRET_KEY",
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    "MALWARE_SCAN_WEBHOOK_URL",
    "MALWARE_SCAN_API_KEY",
    "MALWARE_SCAN_REQUIRED",
    "GHL_STAGE_NEEDS_DOCS",
    "GHL_MISSING_DOCS_WORKFLOW_ID",
    "GHL_INTERNAL_NOTIFICATION_CONTACT_ID",
  ] as const;
  const original = new Map(keys.map((key) => [key, mutableEnv[key]]));
  try {
    for (const key of keys) delete mutableEnv[key];
    mutableEnv.NODE_ENV = "production";
    mutableEnv.SITE_URL = "https://www.onlinetintexemption.com";
    mutableEnv.ORDER_TOKEN_SECRET = "a".repeat(32);
    mutableEnv.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    mutableEnv.UPSTASH_REDIS_REST_TOKEN = "redis-token";

    assert.deepEqual(securityConfigurationErrors("checkout"), []);
    assert.ok(
      securityConfigurationErrors("intake").includes("TURNSTILE_SECRET_KEY")
    );
    assert.ok(
      securityConfigurationErrors("upload").includes("MALWARE_SCAN_API_KEY")
    );

    delete mutableEnv.SITE_URL;
    delete mutableEnv.ORDER_TOKEN_SECRET;
    assert.deepEqual(securityConfigurationErrors("webhook"), []);
  } finally {
    for (const key of keys) {
      const value = original.get(key);
      if (value === undefined) delete mutableEnv[key];
      else mutableEnv[key] = value;
    }
  }
});
