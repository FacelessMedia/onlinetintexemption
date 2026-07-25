import assert from "node:assert/strict";
import test from "node:test";

process.env.ORDER_TOKEN_SECRET =
  "test-only-order-token-secret-with-at-least-32-characters";

const { issueOrderToken, verifyOrderToken } = await import(
  "../src/lib/order-token.ts"
);

const order = {
  contactId: "contact_123",
  opportunityId: "opportunity_123",
  stateSlug: "texas",
  stateName: "Texas",
  priceDollars: 225,
  siteName: "onlinetintexemption.com",
  firstName: "Test",
  lastName: "Applicant",
  email: "test@example.com",
  phone: "+17343388453",
};

test("same scoped submission receives the same Stripe idempotency JTI", () => {
  const identity = "online:texas:web-reference:opportunity_123";
  const first = issueOrderToken(order, identity);
  const second = issueOrderToken(order, identity);
  assert.notEqual(first, second, "encrypted tokens retain fresh random IVs");
  assert.equal(verifyOrderToken(first).jti, verifyOrderToken(second).jti);
});

test("a genuinely new submission receives a different order JTI", () => {
  const first = issueOrderToken(order, "online:texas:submission-one:opportunity_123");
  const second = issueOrderToken(
    { ...order, opportunityId: "opportunity_456" },
    "online:texas:submission-two:opportunity_456"
  );
  assert.notEqual(verifyOrderToken(first).jti, verifyOrderToken(second).jti);
});
