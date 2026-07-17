import assert from "node:assert/strict";
import test from "node:test";
import {
  ContactIdentityConfigurationError,
  deriveContactIdentityDigest,
  exactContactReuseEnabled,
  matchesExactContactIdentity,
  normalizeSubmittedContactIdentity,
  withExactContactIdentityLock,
  type GhlContactIdentityRecord,
  type SubmittedContactIdentity,
} from "../src/lib/contact-identity.ts";

const submitted: SubmittedContactIdentity = {
  firstName: "  Ana   María ",
  lastName: " O’Neil ",
  email: " ANA.ONEIL@Example.Test ",
  phone: "(734) 555-1212",
  dateOfBirth: "1980-01-02",
  addressLine1: "123 Main St.",
  addressLine2: "Apartment 4",
  city: " Ann Arbor ",
  state: "MI",
  postalCode: "48104-1234",
  country: "US",
};

const existing: GhlContactIdentityRecord = {
  id: "contact-123",
  firstName: "ana maría",
  lastName: "O'Neil",
  email: "ana.oneil@example.test",
  phone: "+17345551212",
  dateOfBirth: "1980-01-02T00:00:00.000Z",
  address1: "123 Main St, Apartment 4",
  city: "Ann Arbor",
  state: "mi",
  postalCode: "481041234",
  country: "us",
};

test("normalization is conservative and exact across all required identity fields", () => {
  const normalized = normalizeSubmittedContactIdentity(submitted);
  assert.ok(normalized);
  assert.equal(normalized.firstName, "ana maría");
  assert.equal(normalized.lastName, "o'neil");
  assert.equal(normalized.email, "ana.oneil@example.test");
  assert.equal(normalized.phone, "+17345551212");
  assert.equal(normalized.dateOfBirth, "1980-01-02");
  assert.equal(normalized.address1, "123 main st apartment 4");
  assert.equal(normalized.postalCode, "481041234");
  assert.equal(matchesExactContactIdentity(existing, submitted), true);
});
test("any identity difference or missing GHL field prevents contact reuse", () => {
  const differences: Array<[keyof GhlContactIdentityRecord, unknown]> = [
    ["firstName", "Ann"],
    ["lastName", "Oneil"],
    ["email", "other@example.test"],
    ["phone", "+17345550000"],
    ["dateOfBirth", "1980-01-03"],
    ["address1", "123 Main St, Apartment 5"],
    ["city", "Detroit"],
    ["state", "OH"],
    ["postalCode", "48105"],
    ["country", ""],
  ];
  for (const [field, value] of differences) {
    assert.equal(
      matchesExactContactIdentity({ ...existing, [field]: value }, submitted),
      false,
      `expected a mismatch for ${String(field)}`
    );
  }
});

test("HMAC identity digests are stable, contain no PII, and include the unit", () => {
  const secret = "test-secret-that-is-at-least-32-bytes-long";
  const first = deriveContactIdentityDigest(submitted, secret);
  const second = deriveContactIdentityDigest(
    { ...submitted, email: "ana.oneil@example.test" },
    secret
  );
  const differentUnit = deriveContactIdentityDigest(
    { ...submitted, addressLine2: "Apartment 5" },
    secret
  );
  assert.equal(first, second);
  assert.notEqual(first, differentUnit);
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(first, /ana|734|1980|48104/i);
});

test("exact mode is disabled by default and rejects ambiguous configuration values", () => {
  assert.equal(exactContactReuseEnabled({}), false);
  assert.equal(
    exactContactReuseEnabled({ GHL_EXACT_CONTACT_REUSE_MODE: "enabled" }),
    true
  );
  assert.throws(
    () => exactContactReuseEnabled({ GHL_EXACT_CONTACT_REUSE_MODE: "true" }),
    ContactIdentityConfigurationError
  );
});

test("fleet lock fails closed unless duplicate contacts are confirmed", async () => {
  await assert.rejects(
    withExactContactIdentityLock(
      submitted,
      async () => "never",
      {
        GHL_EXACT_CONTACT_REUSE_MODE: "enabled",
        GHL_CONTACT_IDENTITY_SECRET:
          "test-secret-that-is-at-least-32-bytes-long",
        UPSTASH_REDIS_REST_URL: "https://redis.example.test",
        UPSTASH_REDIS_REST_TOKEN: "token",
      }
    ),
    ContactIdentityConfigurationError
  );
});

test("fleet lock sends only an opaque HMAC key to Redis", async () => {
  const originalFetch = globalThis.fetch;
  const bodies: string[] = [];
  globalThis.fetch = async (_input, init) => {
    bodies.push(String(init?.body));
    return Response.json({ result: 1 });
  };
  try {
    const result = await withExactContactIdentityLock(
      submitted,
      async () => "resolved",
      {
        GHL_EXACT_CONTACT_REUSE_MODE: "enabled",
        GHL_DUPLICATE_CONTACTS_CONFIRMED: "true",
        GHL_CONTACT_IDENTITY_SECRET:
          "test-secret-that-is-at-least-32-bytes-long",
        UPSTASH_REDIS_REST_URL: "https://redis.example.test",
        UPSTASH_REDIS_REST_TOKEN: "token",
      }
    );
    assert.equal(result, "resolved");
    assert.equal(bodies.length, 2);
    const serialized = bodies.join("\n").toLowerCase();
    for (const pii of [
      "ana",
      "example.test",
      "7345551212",
      "1980-01-02",
      "main st",
      "48104",
    ]) {
      assert.equal(serialized.includes(pii), false, `Redis payload exposed ${pii}`);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
