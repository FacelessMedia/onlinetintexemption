import assert from "node:assert/strict";
import test from "node:test";
import { ensureApplicationSnapshot } from "../src/lib/application-snapshot.ts";
import { ghlConfig } from "../src/lib/ghl.ts";

const snapshot = {
  contactId: "contact-123",
  opportunityId: "opportunity-123",
  submissionReference: "web-submission-123",
  siteName: "example.test",
  stateName: "Texas",
  priceDollars: 225,
  firstName: "Test",
  lastName: "Customer",
  email: "customer@example.test",
  phone: "7343389453",
  dateOfBirth: "1980-01-02",
  addressLine1: "123 Main St",
  city: "Austin",
  postalCode: "78701",
  conditions: ["Photophobia"],
  details: "Light sensitivity while driving.",
  duration: "1 to 5 years",
  frequency: "4+ days a week",
  hasSeenDoctor: "Yes",
  hasTintedBefore: "No",
  isLicensedDriver: "Yes",
  isIntendedDriver: "Yes",
  timeZone: "Central Time",
  docUploadChoice: "later",
};

test("application snapshot writes a marker-bound GHL note", async () => {
  const originalFetch = globalThis.fetch;
  const originalConfig = { ...ghlConfig };
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  Object.assign(ghlConfig, {
    apiKey: "test-token",
    locationId: "location-123",
  });
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    if (init?.method === "GET") {
      return new Response(JSON.stringify({ notes: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ note: { id: "note-123" } }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    await ensureApplicationSnapshot(snapshot);
    assert.equal(calls.length, 2);
    assert.equal(new Headers(calls[0]!.init?.headers).get("Version"), "v3");
    const payload = JSON.parse(String(calls[1]!.init?.body));
    assert.match(payload.body, /Website intake snapshot \[web-submission-123\]/);
    assert.match(payload.body, /Opportunity: opportunity-123/);
    assert.match(payload.body, /DOB at submission: 1980-01-02/);
    assert.match(payload.body, /Selected conditions: Photophobia/);
    assert.ok(payload.body.length <= 4_950);
  } finally {
    globalThis.fetch = originalFetch;
    Object.assign(ghlConfig, originalConfig);
  }
});

test("application snapshot is idempotent when its marker already exists", async () => {
  const originalFetch = globalThis.fetch;
  const originalConfig = { ...ghlConfig };
  let calls = 0;
  Object.assign(ghlConfig, {
    apiKey: "test-token",
    locationId: "location-123",
  });
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(
      JSON.stringify({
        notes: [{ body: "Website intake snapshot [web-submission-123]" }],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };
  try {
    await ensureApplicationSnapshot(snapshot);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    Object.assign(ghlConfig, originalConfig);
  }
});

