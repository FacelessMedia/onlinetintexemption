import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  addTagToContact,
  addTagsToContact,
  ghlConfig,
  GHL_TAGS,
  moveOpportunityStage,
  opportunityLifecycleTag,
  routeMissingDocsLead,
} from "@/lib/ghl";
import {
  claimStripeEvent,
  completeStripeEvent,
  releaseStripeEvent,
} from "@/lib/idempotency";
import { requiresDocumentsForPrice } from "@/lib/docs-policy";
import { securityConfigurationErrors } from "@/lib/request-security";
import {
  checkoutChargeDisposition,
  disputeDisposition,
  type FleetPaymentContext,
  paidStageForContext,
  parseFleetPaymentContext,
  refundDisposition,
  safeTelemetryCode,
  SUPPORTED_STRIPE_EVENT_TYPES,
  type OpportunityDisposition,
} from "@/lib/stripe-webhook-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getStripe(): Stripe {
  const key =
    process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY || "";
  if (!key) throw new Error("Stripe is not configured");
  return new Stripe(key);
}

async function notifyDiscord(content: string): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL || "";
  if (!url) return;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      console.error(`Discord notification failed status=${response.status}`);
    }
  } catch {
    // Discord is optional, non-authoritative telemetry. Never log its secret URL.
    console.error("Discord notification failed");
  }
}

function objectId(
  value: string | { id: string } | null | undefined,
  prefix: "pi_" | "ch_"
): string {
  const id = typeof value === "string" ? value : value?.id || "";
  if (!id.startsWith(prefix) || !/^[A-Za-z0-9_]+$/.test(id)) {
    throw new Error("Stripe related object id is invalid");
  }
  return id;
}

async function resolvePaymentIntent(
  stripe: Stripe,
  value: string | Stripe.PaymentIntent | null | undefined,
  eventLivemode: boolean
): Promise<Stripe.PaymentIntent> {
  const paymentIntent =
    typeof value === "object" && value?.object === "payment_intent"
      ? value
      : await stripe.paymentIntents.retrieve(objectId(value, "pi_"));
  if (paymentIntent.livemode !== eventLivemode) {
    throw new Error("Stripe PaymentIntent mode mismatch");
  }
  return paymentIntent;
}

async function resolveCharge(
  stripe: Stripe,
  value: string | Stripe.Charge | null | undefined,
  eventLivemode: boolean
): Promise<Stripe.Charge> {
  const charge =
    typeof value === "object" && value?.object === "charge"
      ? value
      : await stripe.charges.retrieve(objectId(value, "ch_"));
  if (charge.livemode !== eventLivemode) {
    throw new Error("Stripe Charge mode mismatch");
  }
  return charge;
}

async function paymentContextFromIntent(
  paymentIntent: Stripe.PaymentIntent
): Promise<FleetPaymentContext | null> {
  return parseFleetPaymentContext(
    paymentIntent.metadata,
    paymentIntent.amount,
    paymentIntent.currency
  );
}

function claimsFleetSource(metadata: Stripe.Metadata | null | undefined): boolean {
  return metadata?.source_system === "tint-exemption-sites";
}

async function paymentIntentFromCharge(
  stripe: Stripe,
  charge: Stripe.Charge,
  eventLivemode: boolean
): Promise<Stripe.PaymentIntent | null> {
  if (!charge.payment_intent) {
    if (claimsFleetSource(charge.metadata)) {
      throw new Error("Fleet Stripe Charge has no PaymentIntent");
    }
    return null;
  }
  return resolvePaymentIntent(stripe, charge.payment_intent, eventLivemode);
}

function ensureChargeMatchesIntent(
  charge: Stripe.Charge,
  paymentIntent: Stripe.PaymentIntent
): void {
  if (
    charge.amount !== paymentIntent.amount ||
    charge.currency.toLowerCase() !== paymentIntent.currency.toLowerCase() ||
    objectId(charge.payment_intent, "pi_") !== paymentIntent.id
  ) {
    throw new Error("Stripe Charge failed PaymentIntent validation");
  }
}

function paidStage(context: FleetPaymentContext): string {
  return paidStageForContext(context, {
    docsSubmitted: ghlConfig.stageDocsSubmitted,
    noDocs: ghlConfig.stageNoDocs,
  });
}

function paymentContextsMatch(
  left: FleetPaymentContext,
  right: FleetPaymentContext
): boolean {
  return (
    left.contactId === right.contactId &&
    left.opportunityId === right.opportunityId &&
    left.stateSlug === right.stateSlug &&
    left.stateName === right.stateName &&
    left.expectedPrice === right.expectedPrice &&
    left.sourceHost === right.sourceHost &&
    left.hasCurrentSubmissionDocs === right.hasCurrentSubmissionDocs &&
    left.orderJti === right.orderJti
  );
}

async function applyReviewDisposition(
  context: FleetPaymentContext,
  disposition: OpportunityDisposition
): Promise<void> {
  if (disposition.status) {
    await moveOpportunityStage(
      context.opportunityId,
      paidStage(context),
      disposition.status
    );
  }
  await addTagsToContact(context.contactId, [
    disposition.tag,
    opportunityLifecycleTag("payment-review", context.opportunityId),
  ]);
}

function telemetry(
  label: string,
  context: FleetPaymentContext,
  stripeObjectId: string,
  detail?: string
): string {
  const suffix = stripeObjectId.slice(-8);
  const detailText = detail ? ` | ${detail}` : "";
  return `${label}: ${context.sourceHost} | ${context.stateName} | ...${suffix}${detailText}`;
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  event: Stripe.Event,
  session: Stripe.Checkout.Session
): Promise<string | null> {
  if (session.payment_status !== "paid") return null;

  const context = parseFleetPaymentContext(
    session.metadata,
    session.amount_total,
    session.currency
  );
  if (!context) return null;
  if (
    session.client_reference_id !== context.contactId ||
    session.mode !== "payment" ||
    session.status !== "complete"
  ) {
    throw new Error("Stripe Checkout Session failed fulfillment validation");
  }

  // Stripe does not guarantee event delivery order. Read the current payment
  // state before writing `won`, otherwise a delayed checkout event could undo a
  // refund/dispute event already processed by this webhook.
  const paymentIntent = await resolvePaymentIntent(
    stripe,
    session.payment_intent,
    event.livemode
  );
  const intentContext = await paymentContextFromIntent(paymentIntent);
  if (!intentContext || !paymentContextsMatch(intentContext, context)) {
    throw new Error("Stripe Checkout Session and PaymentIntent do not match");
  }
  if (paymentIntent.status !== "succeeded") {
    throw new Error("Stripe PaymentIntent is not currently succeeded");
  }
  const charge = await resolveCharge(
    stripe,
    paymentIntent.latest_charge,
    event.livemode
  );
  ensureChargeMatchesIntent(charge, paymentIntent);

  const currentDisposition = checkoutChargeDisposition({
    amount: charge.amount,
    amountRefunded: charge.amount_refunded,
    fullyRefunded: charge.refunded,
    disputed: charge.disputed,
  });
  if (currentDisposition.status !== "won") {
    await applyReviewDisposition(context, currentDisposition);
    return telemetry(
      "Stripe paid-order review",
      context,
      session.id,
      currentDisposition.telemetry
    );
  }

  const hasDocs = context.hasCurrentSubmissionDocs;
  // $225/no-doc is an ordinary paid path. A $250+ no-doc payment can only be a
  // legacy or anomalous Session because current checkout creation blocks it.
  // Preserve and route that paid customer, but alert Tory for manual recovery.
  if (requiresDocumentsForPrice(context.expectedPrice) && !hasDocs) {
    const notification = await routeMissingDocsLead(
      context.contactId,
      context.opportunityId,
      context.stateName,
      context.expectedPrice
    );
    if (!notification.emailQueued) {
      throw new Error("Missing-document anomaly notification was not queued");
    }
  }
  await addTagToContact(context.contactId, GHL_TAGS.paid);
  await moveOpportunityStage(context.opportunityId, paidStage(context), "won");

  const amount = (context.expectedPrice).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const anomaly = requiresDocumentsForPrice(context.expectedPrice) && !hasDocs
    ? " | alert=current application document proof missing"
    : "";
  return telemetry(
    `Stripe sale ${amount}`,
    context,
    session.id,
    anomaly ? anomaly.slice(3) : undefined
  );
}

async function handleCheckoutExpired(
  event: Stripe.Event,
  session: Stripe.Checkout.Session
): Promise<string | null> {
  const context = parseFleetPaymentContext(
    session.metadata,
    session.amount_total,
    session.currency
  );
  if (!context) return null;
  if (
    session.livemode !== event.livemode ||
    session.mode !== "payment" ||
    session.status !== "expired" ||
    session.client_reference_id !== context.contactId
  ) {
    throw new Error("Expired Checkout Session failed validation");
  }
  await addTagsToContact(context.contactId, [
    "checkout-expired",
    opportunityLifecycleTag("checkout-expired", context.opportunityId),
  ]);
  return telemetry("Stripe checkout expired", context, session.id);
}

async function handleCheckoutPaymentFailed(
  event: Stripe.Event,
  session: Stripe.Checkout.Session
): Promise<string | null> {
  const context = parseFleetPaymentContext(
    session.metadata,
    session.amount_total,
    session.currency
  );
  if (!context) return null;
  if (
    session.livemode !== event.livemode ||
    session.mode !== "payment" ||
    session.client_reference_id !== context.contactId
  ) {
    throw new Error("Failed Checkout Session failed validation");
  }
  await addTagsToContact(context.contactId, [
    "payment-failed",
    opportunityLifecycleTag("payment-failed", context.opportunityId),
  ]);
  return telemetry("Stripe payment failed", context, session.id, "async failure");
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<string | null> {
  const context = await paymentContextFromIntent(paymentIntent);
  if (!context) return null;
  await addTagsToContact(context.contactId, [
    "payment-failed",
    opportunityLifecycleTag("payment-failed", context.opportunityId),
  ]);
  const code = safeTelemetryCode(
    paymentIntent.last_payment_error?.decline_code ||
      paymentIntent.last_payment_error?.code
  );
  return telemetry(
    "Stripe payment failed",
    context,
    paymentIntent.id,
    `code=${code}`
  );
}

async function handleChargeFailed(
  stripe: Stripe,
  event: Stripe.Event,
  charge: Stripe.Charge
): Promise<string | null> {
  if (charge.livemode !== event.livemode) {
    throw new Error("Stripe Charge mode mismatch");
  }
  const paymentIntent = await paymentIntentFromCharge(
    stripe,
    charge,
    event.livemode
  );
  if (!paymentIntent) return null;
  ensureChargeMatchesIntent(charge, paymentIntent);
  const context = await paymentContextFromIntent(paymentIntent);
  if (!context) return null;
  await addTagsToContact(context.contactId, [
    "payment-failed",
    opportunityLifecycleTag("payment-failed", context.opportunityId),
  ]);
  return telemetry(
    "Stripe charge failed",
    context,
    charge.id,
    `code=${safeTelemetryCode(charge.failure_code || charge.outcome?.reason)}`
  );
}

async function handleRefund(
  stripe: Stripe,
  event: Stripe.Event,
  refund: Stripe.Refund
): Promise<string | null> {
  if (!refund.charge) {
    if (refund.payment_intent) {
      const paymentIntent = await resolvePaymentIntent(
        stripe,
        refund.payment_intent,
        event.livemode
      );
      if (await paymentContextFromIntent(paymentIntent)) {
        throw new Error("Fleet Stripe Refund has no Charge");
      }
    } else if (claimsFleetSource(refund.metadata)) {
      throw new Error("Fleet Stripe Refund has no related payment");
    }
    return null;
  }
  const charge = await resolveCharge(stripe, refund.charge, event.livemode);
  const paymentIntent = refund.payment_intent
    ? await resolvePaymentIntent(stripe, refund.payment_intent, event.livemode)
    : await paymentIntentFromCharge(stripe, charge, event.livemode);
  if (!paymentIntent) return null;
  ensureChargeMatchesIntent(charge, paymentIntent);
  const context = await paymentContextFromIntent(paymentIntent);
  if (!context) return null;
  if (
    refund.currency.toLowerCase() !== "usd" ||
    !Number.isSafeInteger(refund.amount) ||
    refund.amount <= 0 ||
    refund.amount > charge.amount
  ) {
    throw new Error("Stripe Refund failed amount validation");
  }

  const disposition = refundDisposition({
    refundStatus: refund.status,
    refundAmount: refund.amount,
    chargeAmount: charge.amount,
    chargeAmountRefunded: charge.amount_refunded,
    chargeFullyRefunded: charge.refunded,
  });
  await applyReviewDisposition(context, disposition);
  return telemetry(
    "Stripe refund review",
    context,
    refund.id,
    disposition.telemetry
  );
}

async function handleChargeRefunded(
  stripe: Stripe,
  event: Stripe.Event,
  charge: Stripe.Charge
): Promise<string | null> {
  if (charge.livemode !== event.livemode) {
    throw new Error("Stripe Charge mode mismatch");
  }
  const paymentIntent = await paymentIntentFromCharge(
    stripe,
    charge,
    event.livemode
  );
  if (!paymentIntent) return null;
  ensureChargeMatchesIntent(charge, paymentIntent);
  const context = await paymentContextFromIntent(paymentIntent);
  if (!context) return null;
  if (charge.amount_refunded <= 0) {
    throw new Error("Stripe refunded Charge has no refunded amount");
  }
  const disposition = refundDisposition({
    refundStatus: "succeeded",
    refundAmount: charge.amount_refunded,
    chargeAmount: charge.amount,
    chargeAmountRefunded: charge.amount_refunded,
    chargeFullyRefunded: charge.refunded,
  });
  await applyReviewDisposition(context, disposition);
  return telemetry(
    "Stripe charge refund review",
    context,
    charge.id,
    disposition.telemetry
  );
}

async function handleDispute(
  stripe: Stripe,
  event: Stripe.Event,
  eventDispute: Stripe.Dispute
): Promise<string | null> {
  if (!/^dp_[A-Za-z0-9]+$/.test(eventDispute.id)) {
    throw new Error("Stripe Dispute id is invalid");
  }
  // Webhook delivery order is not guaranteed. Always retrieve the current
  // dispute so a delayed `created`/`updated` event cannot overwrite its final
  // outcome in GHL.
  const dispute = await stripe.disputes.retrieve(eventDispute.id);
  if (dispute.livemode !== event.livemode) {
    throw new Error("Stripe Dispute mode mismatch");
  }
  const charge = await resolveCharge(stripe, dispute.charge, event.livemode);
  let paymentIntent: Stripe.PaymentIntent | null;
  if (dispute.payment_intent) {
    paymentIntent = await resolvePaymentIntent(
      stripe,
      dispute.payment_intent,
      event.livemode
    );
  } else {
    paymentIntent = await paymentIntentFromCharge(
      stripe,
      charge,
      event.livemode
    );
  }
  if (!paymentIntent) return null;
  ensureChargeMatchesIntent(charge, paymentIntent);
  const context = await paymentContextFromIntent(paymentIntent);
  if (!context) return null;
  if (
    dispute.currency.toLowerCase() !== "usd" ||
    !Number.isSafeInteger(dispute.amount) ||
    dispute.amount <= 0 ||
    dispute.amount > paymentIntent.amount
  ) {
    throw new Error("Stripe Dispute failed amount validation");
  }
  const disposition = disputeDisposition(
    dispute.status,
    dispute.amount,
    paymentIntent.amount
  );
  await applyReviewDisposition(context, disposition);
  return telemetry(
    "Stripe dispute review",
    context,
    dispute.id,
    disposition.telemetry
  );
}

async function handleSupportedEvent(
  stripe: Stripe,
  event: Stripe.Event
): Promise<string | null> {
  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutCompleted(
        stripe,
        event,
        event.data.object as Stripe.Checkout.Session
      );
    case "checkout.session.expired":
      return handleCheckoutExpired(
        event,
        event.data.object as Stripe.Checkout.Session
      );
    case "checkout.session.async_payment_failed":
      return handleCheckoutPaymentFailed(
        event,
        event.data.object as Stripe.Checkout.Session
      );
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      if (paymentIntent.livemode !== event.livemode) {
        throw new Error("Stripe PaymentIntent mode mismatch");
      }
      return handlePaymentIntentFailed(paymentIntent);
    }
    case "charge.failed":
      return handleChargeFailed(
        stripe,
        event,
        event.data.object as Stripe.Charge
      );
    case "charge.refunded":
      return handleChargeRefunded(
        stripe,
        event,
        event.data.object as Stripe.Charge
      );
    case "refund.created":
    case "refund.updated":
    case "refund.failed":
      return handleRefund(stripe, event, event.data.object as Stripe.Refund);
    case "charge.dispute.created":
    case "charge.dispute.updated":
    case "charge.dispute.closed":
    case "charge.dispute.funds_withdrawn":
    case "charge.dispute.funds_reinstated":
      return handleDispute(stripe, event, event.data.object as Stripe.Dispute);
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  const securityErrors = securityConfigurationErrors("webhook");
  if (securityErrors.length > 0) {
    console.error("Strict security configuration is incomplete:", securityErrors);
    return NextResponse.json(
      { error: "Webhook security is not configured" },
      { status: 500 }
    );
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const signature = request.headers.get("stripe-signature") || "";
  if (!webhookSecret) {
    console.error("stripe-webhook: STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  let stripe: Stripe;
  try {
    stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret
    );
  } catch {
    console.error("stripe-webhook signature verification failed");
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (!SUPPORTED_STRIPE_EVENT_TYPES.has(event.type)) {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  let claim: Awaited<ReturnType<typeof claimStripeEvent>>;
  try {
    claim = await claimStripeEvent(event.id);
  } catch {
    // Fail closed so Stripe retries; never fulfill without a durable lock in
    // strict mode.
    return NextResponse.json(
      { error: "Webhook processing is temporarily unavailable" },
      { status: 503 }
    );
  }
  if (claim.status === "complete") {
    return NextResponse.json({ received: true, duplicate: true });
  }
  if (claim.status === "processing") {
    // A live lock is not proof of fulfillment. Ask Stripe to retry rather than
    // acknowledging an event whose first worker could still fail.
    return NextResponse.json(
      { error: "Webhook processing is already in progress" },
      { status: 503, headers: { "Retry-After": "5" } }
    );
  }

  const ownerToken = claim.ownerToken;
  try {
    const notification = await handleSupportedEvent(stripe, event);
    if (!(await completeStripeEvent(event.id, ownerToken))) {
      throw new Error("Webhook event lock ownership was lost");
    }
    if (notification) await notifyDiscord(notification);
    return NextResponse.json({ received: true });
  } catch {
    await releaseStripeEvent(event.id, ownerToken);
    console.error("stripe-webhook processing failed; Stripe should retry");
    // A non-2xx response is intentional: Stripe retries transient Stripe/CRM
    // failures instead of silently dropping a paid customer or reversal.
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
