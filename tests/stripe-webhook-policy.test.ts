import assert from "node:assert/strict";
import test from "node:test";
import {
  checkoutChargeDisposition,
  disputeDisposition,
  parseFleetPaymentContext,
  refundDisposition,
  safeTelemetryCode,
  SUPPORTED_STRIPE_EVENT_TYPES,
} from "../src/lib/stripe-webhook-policy.ts";

const validMetadata = {
  source_system: "tint-exemption-sites",
  site: "https://www.texastintexemption.com",
  state: "Texas",
  state_slug: "texas",
  ghl_contact_id: "contact_123",
  ghl_opportunity_id: "opportunity_123",
  docs_current_submission: "no",
  order_jti: "ef349f3a-9f2f-4ef0-8b6d-f5947f0038a6",
};

test("fleet payment metadata is exact-host, exact-state, and amount bound", () => {
  const context = parseFleetPaymentContext(validMetadata, 22_500, "USD");
  assert.ok(context);
  assert.equal(context.sourceHost, "texastintexemption.com");
  assert.equal(context.stateName, "Texas");
  assert.equal(context.expectedPrice, 225);
  assert.equal(context.hasCurrentSubmissionDocs, false);

  assert.equal(
    parseFleetPaymentContext({ source_system: "another-system" }, 22_500, "usd"),
    null
  );
  assert.throws(() =>
    parseFleetPaymentContext(
      { ...validMetadata, site: "californiatintexemption.com" },
      22_500,
      "usd"
    )
  );
  assert.throws(() =>
    parseFleetPaymentContext(validMetadata, 25_000, "usd")
  );
  assert.throws(() =>
    parseFleetPaymentContext(
      { ...validMetadata, ghl_contact_id: "../contacts/attacker" },
      22_500,
      "usd"
    )
  );
});

test("current charge state prevents stale paid events from restoring won", () => {
  assert.equal(
    checkoutChargeDisposition({
      amount: 22_500,
      amountRefunded: 22_500,
      fullyRefunded: true,
      disputed: false,
    }).status,
    "lost"
  );
  assert.equal(
    checkoutChargeDisposition({
      amount: 22_500,
      amountRefunded: 5_000,
      fullyRefunded: false,
      disputed: false,
    }).status,
    "open"
  );
  assert.equal(
    checkoutChargeDisposition({
      amount: 22_500,
      amountRefunded: 0,
      fullyRefunded: false,
      disputed: true,
    }).status,
    "open"
  );
  assert.equal(
    checkoutChargeDisposition({
      amount: 22_500,
      amountRefunded: 0,
      fullyRefunded: false,
      disputed: false,
    }).status,
    "won"
  );
});

test("refund and dispute policies fail safe into review/lost states", () => {
  assert.equal(
    refundDisposition({
      refundStatus: "succeeded",
      refundAmount: 25_000,
      chargeAmount: 25_000,
      chargeAmountRefunded: 25_000,
      chargeFullyRefunded: true,
    }).status,
    "lost"
  );
  assert.equal(
    refundDisposition({
      refundStatus: null,
      refundAmount: 25_000,
      chargeAmount: 25_000,
      chargeAmountRefunded: 25_000,
      chargeFullyRefunded: true,
    }).status,
    "lost",
    "the current Charge remains authoritative for older webhook API versions"
  );
  assert.equal(
    refundDisposition({
      refundStatus: "succeeded",
      refundAmount: 5_000,
      chargeAmount: 25_000,
      chargeAmountRefunded: 5_000,
      chargeFullyRefunded: false,
    }).status,
    "open"
  );
  assert.equal(
    refundDisposition({
      refundStatus: "failed",
      refundAmount: 25_000,
      chargeAmount: 25_000,
      chargeAmountRefunded: 0,
      chargeFullyRefunded: false,
    }).status,
    undefined
  );
  assert.equal(disputeDisposition("lost").status, "lost");
  const partialLost = disputeDisposition("lost", 5_000, 25_000);
  assert.equal(partialLost.status, "open");
  assert.equal(partialLost.tag, "payment-dispute-partial-lost-review");
  assert.equal(disputeDisposition("needs_response").status, "open");
  assert.equal(
    disputeDisposition("won").status,
    "open",
    "a won dispute still requires review for separate refunds or disputes"
  );
});

test("failure telemetry stays bounded and relevant event types are explicit", () => {
  assert.equal(safeTelemetryCode("insufficient_funds"), "insufficient_funds");
  assert.equal(safeTelemetryCode("customer@example.test"), "unknown");
  assert.ok(SUPPORTED_STRIPE_EVENT_TYPES.has("checkout.session.expired"));
  assert.ok(SUPPORTED_STRIPE_EVENT_TYPES.has("payment_intent.payment_failed"));
  assert.ok(SUPPORTED_STRIPE_EVENT_TYPES.has("refund.created"));
  assert.ok(SUPPORTED_STRIPE_EVENT_TYPES.has("charge.dispute.created"));
});
