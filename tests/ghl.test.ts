import assert from "node:assert/strict";
import test from "node:test";
import {
  createOpportunity,
  ghlConfig,
  moveOpportunityStage,
  routeMissingDocsLead,
  upsertContact,
} from "../src/lib/ghl.ts";

test("GHL upsert omits tags, writes address/DOB, and survives tag failure", async () => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  console.error = () => undefined;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.endsWith("/contacts/upsert")) {
      return new Response(JSON.stringify({ contact: { id: "contact-123" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.endsWith("/contacts/contact-123/tags")) {
      return new Response("", { status: 503 });
    }
    throw new Error(`Unexpected test request: ${url}`);
  };

  try {
    const contactId = await upsertContact({
      firstName: "Test",
      lastName: "Customer",
      email: "customer@example.test",
      phone: "7343389453",
      dateOfBirth: "1980-01-02",
      addressLine1: "123 Main St",
      addressLine2: "Unit 4",
      city: "Austin",
      postalCode: "78701",
      state: "Texas",
      stateCode: "TX",
      conditions: ["Photophobia", "Other"],
      otherCondition: "Migraine aura",
      details: "Light sensitivity while driving.",
      medications: "",
      duration: "More than 1 year",
      frequency: "Daily",
      hasSeenDoctor: "Yes",
      hasTintedBefore: "No",
      currentTintPercent: "",
      isLicensedDriver: "Yes",
      isIntendedDriver: "Yes",
      numberOfVehicles: "1",
      timeZone: "Central",
      howDidYouHear: "Search",
      docUploadChoice: "later",
    });

    assert.equal(contactId, "contact-123");
    assert.equal(calls.length, 2);
    const upsertBody = JSON.parse(String(calls[0]?.init?.body)) as Record<string, unknown>;
    assert.equal("tags" in upsertBody, false);
    assert.equal(upsertBody.dateOfBirth, "1980-01-02");
    assert.equal(upsertBody.address1, "123 Main St, Unit 4");
    assert.equal(upsertBody.city, "Austin");
    assert.equal(upsertBody.state, "TX");
    assert.equal(upsertBody.postalCode, "78701");
    const customFields = upsertBody.customFields as Array<{
      id: string;
      value: string | string[];
    }>;
    assert.deepEqual(
      customFields.find(({ value }) => Array.isArray(value))?.value,
      ["Photophobia", "Other"]
    );
    assert.ok(
      customFields.some(({ value }) =>
        typeof value === "string" &&
        value.includes("Photophobia, Other: Migraine aura")
      )
    );

    const tagBody = JSON.parse(String(calls[1]?.init?.body)) as { tags?: string[] };
    assert.ok(tagBody.tags?.includes("website-intake"));
    assert.ok(tagBody.tags?.includes("docs-later"));
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  }
});

test("exact contact mode reuses a full identity match without ordinary upsert", async () => {
  const originalFetch = globalThis.fetch;
  const originalConfig = { ...ghlConfig };
  const mutableEnv = process.env as Record<string, string | undefined>;
  const envKeys = [
    "GHL_EXACT_CONTACT_REUSE_MODE",
    "GHL_DUPLICATE_CONTACTS_CONFIRMED",
    "GHL_CONTACT_IDENTITY_SECRET",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
  ] as const;
  const originalEnv = Object.fromEntries(
    envKeys.map((key) => [key, mutableEnv[key]])
  );
  Object.assign(mutableEnv, {
    GHL_EXACT_CONTACT_REUSE_MODE: "enabled",
    GHL_DUPLICATE_CONTACTS_CONFIRMED: "true",
    GHL_CONTACT_IDENTITY_SECRET:
      "test-secret-that-is-at-least-32-bytes-long",
    UPSTASH_REDIS_REST_URL: "https://redis.example.test",
    UPSTASH_REDIS_REST_TOKEN: "redis-token",
  });
  Object.assign(ghlConfig, {
    apiKey: "test-token",
    locationId: "location-123",
    siteName: "online-tint-exemption",
  });
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    if (url === "https://redis.example.test") {
      return Response.json({ result: 1 });
    }
    if (url.endsWith("/contacts/search")) {
      return Response.json({ contacts: [{ id: "exact-contact" }], total: 1 });
    }
    if (url.endsWith("/contacts/exact-contact") && init?.method === "PUT") {
      return Response.json({ contact: { id: "exact-contact" } });
    }
    if (url.endsWith("/contacts/exact-contact") && !init?.method) {
      return Response.json({
        contact: {
          id: "exact-contact",
          firstName: "Test",
          lastName: "Customer",
          email: "customer@example.test",
          phone: "+17343389453",
          dateOfBirth: "1980-01-02T00:00:00.000Z",
          address1: "123 Main St, Unit 4",
          city: "Austin",
          state: "TX",
          postalCode: "78701",
          country: "US",
        },
      });
    }
    if (url.endsWith("/contacts/exact-contact/tags")) {
      return new Response(null, { status: 200 });
    }
    throw new Error(`Unexpected test request: ${url}`);
  };

  try {
    const contactId = await upsertContact({
      firstName: "Test",
      lastName: "Customer",
      email: "customer@example.test",
      phone: "7343389453",
      dateOfBirth: "1980-01-02",
      addressLine1: "123 Main St",
      addressLine2: "Unit 4",
      city: "Austin",
      postalCode: "78701",
      state: "Texas",
      stateCode: "TX",
      conditions: ["Photophobia"],
      otherCondition: "",
      details: "Light sensitivity while driving.",
      medications: "",
      duration: "More than 1 year",
      frequency: "Daily",
      hasSeenDoctor: "Yes",
      hasTintedBefore: "No",
      currentTintPercent: "",
      isLicensedDriver: "Yes",
      isIntendedDriver: "Yes",
      numberOfVehicles: "1",
      timeZone: "Central",
      howDidYouHear: "Search",
      docUploadChoice: "later",
    });
    assert.equal(contactId, "exact-contact");
    assert.equal(calls.some(({ url }) => url.endsWith("/contacts/upsert")), false);
    assert.equal(
      calls.some(
        ({ url, init }) => url.endsWith("/contacts/") && init?.method === "POST"
      ),
      false
    );
    assert.ok(
      calls.some(
        ({ url, init }) =>
          url.endsWith("/contacts/exact-contact") && init?.method === "PUT"
      )
    );
  } finally {
    globalThis.fetch = originalFetch;
    Object.assign(ghlConfig, originalConfig);
    for (const key of envKeys) {
      const value = originalEnv[key];
      if (value === undefined) delete mutableEnv[key];
      else mutableEnv[key] = value;
    }
  }
});

test("GHL opportunity calls use v3 camelCase search and remain retry-safe", async () => {
  const originalFetch = globalThis.fetch;
  const originalConfig = { ...ghlConfig };
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  Object.assign(ghlConfig, {
    apiKey: "test-token",
    locationId: "location-123",
    pipelineId: "pipeline-123",
  });
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.includes("/opportunities/search?")) {
      return new Response(JSON.stringify({ opportunities: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.endsWith("/opportunities/") && init?.method === "POST") {
      return new Response(JSON.stringify({ opportunity: { id: "opp-123" } }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.endsWith("/opportunities/opp-123") && init?.method === "PUT") {
      return new Response(null, { status: 200 });
    }
    throw new Error(`Unexpected test request: ${url}`);
  };

  try {
    const opportunityId = await createOpportunity(
      "contact-123",
      "Test Customer - Texas Tint Exemption",
      250,
      "stage-123",
      "web-submission-123"
    );
    assert.equal(opportunityId, "opp-123");
    await moveOpportunityStage(opportunityId, "paid-stage-123", "won");

    assert.equal(calls.length, 3);
    const searchUrl = new URL(calls[0]!.url);
    assert.equal(searchUrl.searchParams.get("locationId"), "location-123");
    assert.equal(searchUrl.searchParams.get("pipelineId"), "pipeline-123");
    assert.equal(searchUrl.searchParams.get("contactId"), "contact-123");
    assert.equal(searchUrl.searchParams.get("q"), "web-submission-123");
    assert.equal(searchUrl.searchParams.has("location_id"), false);
    assert.equal(new Headers(calls[0]!.init?.headers).get("Version"), "v3");

    const createBody = JSON.parse(String(calls[1]!.init?.body));
    assert.equal(createBody.externalObjectId, "web-submission-123");
    assert.equal(createBody.monetaryValue, 250);
    assert.equal(new Headers(calls[1]!.init?.headers).get("Version"), "v3");
    assert.equal(new Headers(calls[2]!.init?.headers).get("Version"), "v3");
  } finally {
    globalThis.fetch = originalFetch;
    Object.assign(ghlConfig, originalConfig);
  }
});

test("an open-stage token replay cannot move a won opportunity", async () => {
  const originalFetch = globalThis.fetch;
  const mutableEnv = process.env as Record<string, string | undefined>;
  const originalMode = mutableEnv.SECURITY_ENFORCEMENT_MODE;
  const originalRedisUrl = mutableEnv.UPSTASH_REDIS_REST_URL;
  const originalRedisToken = mutableEnv.UPSTASH_REDIS_REST_TOKEN;
  delete mutableEnv.SECURITY_ENFORCEMENT_MODE;
  delete mutableEnv.UPSTASH_REDIS_REST_URL;
  delete mutableEnv.UPSTASH_REDIS_REST_TOKEN;
  let putCalls = 0;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith("/opportunities/terminal-opp") && !init?.method) {
      return Response.json({ opportunity: { status: "won" } });
    }
    if (url.endsWith("/opportunities/terminal-opp") && init?.method === "PUT") {
      putCalls += 1;
      return new Response(null, { status: 200 });
    }
    throw new Error(`Unexpected test request: ${url}`);
  };

  try {
    const moved = await moveOpportunityStage(
      "terminal-opp",
      "info-submitted-stage",
      "open"
    );
    assert.equal(moved, false);
    assert.equal(putCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalMode === undefined) delete mutableEnv.SECURITY_ENFORCEMENT_MODE;
    else mutableEnv.SECURITY_ENFORCEMENT_MODE = originalMode;
    if (originalRedisUrl === undefined) delete mutableEnv.UPSTASH_REDIS_REST_URL;
    else mutableEnv.UPSTASH_REDIS_REST_URL = originalRedisUrl;
    if (originalRedisToken === undefined) delete mutableEnv.UPSTASH_REDIS_REST_TOKEN;
    else mutableEnv.UPSTASH_REDIS_REST_TOKEN = originalRedisToken;
  }
});

test("a $225 missing-doc alert remains single-send and pending until GHL accepts it", async () => {
  const mutableEnv = process.env as Record<string, string | undefined>;
  const originalUrl = mutableEnv.UPSTASH_REDIS_REST_URL;
  const originalToken = mutableEnv.UPSTASH_REDIS_REST_TOKEN;
  const originalFetch = globalThis.fetch;
  const originalConfig = { ...ghlConfig };
  mutableEnv.UPSTASH_REDIS_REST_URL = "https://redis.example.test";
  mutableEnv.UPSTASH_REDIS_REST_TOKEN = "test-token";
  Object.assign(ghlConfig, {
    locationId: "location-race",
    stageNeedsDocs: "stage-needs-docs",
    internalNotificationContactId: "internal-contact",
  });

  const redisValues = new Map<string, string>();
  const sharedOpportunityId = `opportunity-race-${crypto.randomUUID()}`;
  let emailCalls = 0;
  let announceEmailStarted: (() => void) | undefined;
  let acceptEmail: (() => void) | undefined;
  const emailStarted = new Promise<void>((resolve) => {
    announceEmailStarted = resolve;
  });
  const emailAccepted = new Promise<void>((resolve) => {
    acceptEmail = resolve;
  });

  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url === "https://redis.example.test") {
      const command = JSON.parse(String(init?.body)) as unknown[];
      const script = String(command[1]);
      const key = String(command[3]);
      const owner = String(command[4]);
      const current = redisValues.get(key);
      let result = 0;
      if (script.includes('redis.call("DEL"')) {
        if (current === owner) {
          redisValues.delete(key);
          result = 1;
        }
      } else if (script.includes('"sent", "EX"')) {
        if (current === "sent") result = 2;
        else if (current === owner) {
          redisValues.set(key, "sent");
          result = 1;
        }
      } else if (current === "sent") {
        result = 2;
      } else if (current === undefined) {
        redisValues.set(key, owner);
        result = 1;
      }
      return Response.json({ result });
    }
    if (url.endsWith("/contacts/contact-race")) {
      return Response.json({ contact: { tags: [] } });
    }
    if (url.endsWith("/contacts/contact-race/tags")) {
      return new Response(null, { status: 200 });
    }
    if (
      url.endsWith(`/opportunities/${sharedOpportunityId}`) &&
      !init?.method
    ) {
      return Response.json({ opportunity: { status: "open" } });
    }
    if (
      url.endsWith(`/opportunities/${sharedOpportunityId}`) &&
      init?.method === "PUT"
    ) {
      return new Response(null, { status: 200 });
    }
    if (url.endsWith("/conversations/messages")) {
      emailCalls += 1;
      announceEmailStarted?.();
      await emailAccepted;
      return new Response(null, { status: 202 });
    }
    throw new Error(`Unexpected test request: ${url}`);
  };

  try {
    const first = routeMissingDocsLead(
      "contact-race",
      sharedOpportunityId,
      "Texas",
      225
    );
    await emailStarted;
    // Both calls use the same application id; the second must not interpret
    // the first worker's live lock as a successfully queued email.
    const second = await routeMissingDocsLead(
      "contact-race",
      sharedOpportunityId,
      "Texas",
      225
    );
    assert.equal(second.emailQueued, false);
    assert.equal(emailCalls, 1);

    acceptEmail?.();
    const firstResult = await first;
    assert.equal(firstResult.emailQueued, true);
    assert.equal(emailCalls, 1);
  } finally {
    acceptEmail?.();
    globalThis.fetch = originalFetch;
    Object.assign(ghlConfig, originalConfig);
    if (originalUrl === undefined) delete mutableEnv.UPSTASH_REDIS_REST_URL;
    else mutableEnv.UPSTASH_REDIS_REST_URL = originalUrl;
    if (originalToken === undefined) delete mutableEnv.UPSTASH_REDIS_REST_TOKEN;
    else mutableEnv.UPSTASH_REDIS_REST_TOKEN = originalToken;
  }
});

test("missing-doc routing fails closed when its durable GHL stage cannot be written", async () => {
  const originalFetch = globalThis.fetch;
  const originalConfig = { ...ghlConfig };
  const originalConsoleError = console.error;
  const opportunityId = `opportunity-stage-failure-${crypto.randomUUID()}`;
  let emailCalls = 0;
  Object.assign(ghlConfig, {
    locationId: "location-stage-failure",
    stageNeedsDocs: "stage-needs-docs",
    internalNotificationContactId: "internal-contact",
  });
  console.error = () => undefined;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith("/contacts/contact-stage-failure/tags")) {
      return new Response(null, { status: 200 });
    }
    if (url.endsWith(`/opportunities/${opportunityId}`) && !init?.method) {
      return Response.json({ opportunity: { status: "open" } });
    }
    if (
      url.endsWith(`/opportunities/${opportunityId}`) &&
      init?.method === "PUT"
    ) {
      return new Response(null, { status: 503 });
    }
    if (url.endsWith("/conversations/messages")) {
      emailCalls += 1;
      return new Response(null, { status: 202 });
    }
    throw new Error(`Unexpected test request: ${url}`);
  };

  try {
    await assert.rejects(
      routeMissingDocsLead(
        "contact-stage-failure",
        opportunityId,
        "Texas",
        225
      ),
      /GHL move opportunity failed status=503/
    );
    assert.equal(emailCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
    Object.assign(ghlConfig, originalConfig);
  }
});

test("missing-doc routing rejects reuse of another lifecycle stage", async () => {
  const originalConfig = { ...ghlConfig };
  Object.assign(ghlConfig, {
    stageInfoSubmitted: "shared-stage",
    stageDocsSubmitted: "",
    stageNoDocs: "",
    stageNeedsDocs: "shared-stage",
  });
  try {
    await assert.rejects(
      routeMissingDocsLead(
        "contact-stage-collision",
        `opportunity-stage-collision-${crypto.randomUUID()}`,
        "Texas",
        225
      ),
      /dedicated unpaid stage/
    );
  } finally {
    Object.assign(ghlConfig, originalConfig);
  }
});
