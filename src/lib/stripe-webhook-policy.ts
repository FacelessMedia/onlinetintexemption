import type Stripe from "stripe";
import { getStateBySlug } from "../data/states.ts";
import {
  getFleetStatePrice,
  isAllowedFleetSiteState,
  normalizeFleetSiteHost,
} from "./fleet-sites.ts";

export const SUPPORTED_STRIPE_EVENT_TYPES = new Set<string>([
  "checkout.session.completed",
  "checkout.session.expired",
  "checkout.session.async_payment_failed",
  "payment_intent.payment_failed",
  "charge.failed",
  "charge.refunded",
  "refund.created",
  "refund.updated",
  "refund.failed",
  "charge.dispute.created",
  "charge.dispute.updated",
  "charge.dispute.closed",
  "charge.dispute.funds_withdrawn",
  "charge.dispute.funds_reinstated",
]);

export interface FleetPaymentContext {
  contactId: string;
  opportunityId: string;
  stateSlug: string;
  stateName: string;
  expectedPrice: number;
  sourceHost: string;
  hasCurrentSubmissionDocs: boolean;
  orderJti: string;
}

export type OpportunityPaymentStatus = "open" | "won" | "lost";

export interface OpportunityDisposition {
  status?: OpportunityPaymentStatus;
  tag: string;
  telemetry: string;
}

/**
 * Resolve and validate metadata copied from the signed order onto both the
 * Checkout Session and PaymentIntent. A null result means the event belongs to
 * another Stripe integration; malformed metadata that claims to be ours is an
 * error and must be retried/alerted instead of silently accepted.
 */
export function parseFleetPaymentContext(
  metadata: Stripe.Metadata | null | undefined,
  amountCents: number | null | undefined,
  currency: string | null | undefined
): FleetPaymentContext | null {
  if (metadata?.source_system !== "tint-exemption-sites") return null;

  const contactId = metadata.ghl_contact_id || "";
  const opportunityId = metadata.ghl_opportunity_id || "";
  const stateSlug = metadata.state_slug || "";
  const state = getStateBySlug(stateSlug);
  const expectedPrice = getFleetStatePrice(stateSlug);
  const sourceHost = normalizeFleetSiteHost(metadata.site || "");
  const docsMarker = metadata.docs_current_submission || "";
  const orderJti = metadata.order_jti || "";

  if (
    !sourceHost ||
    !isAllowedFleetSiteState(sourceHost, stateSlug) ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      orderJti
    ) ||
    !/^[A-Za-z0-9_-]{1,100}$/.test(contactId) ||
    !/^[A-Za-z0-9_-]{1,100}$/.test(opportunityId) ||
    !state ||
    metadata.state !== state.name ||
    !expectedPrice ||
    !Number.isSafeInteger(amountCents) ||
    amountCents !== expectedPrice * 100 ||
    currency?.toLowerCase() !== "usd" ||
    !["yes", "no"].includes(docsMarker)
  ) {
    throw new Error("Stripe payment metadata failed fleet validation");
  }

  return {
    contactId,
    opportunityId,
    stateSlug,
    stateName: state.name,
    expectedPrice,
    sourceHost,
    hasCurrentSubmissionDocs: docsMarker === "yes",
    orderJti,
  };
}

export function paidStageForContext(
  context: FleetPaymentContext,
  stages: { docsSubmitted: string; noDocs: string }
): string {
  const stageId = context.hasCurrentSubmissionDocs
    ? stages.docsSubmitted
    : stages.noDocs;
  if (!stageId) throw new Error("Paid opportunity stage is not configured");
  return stageId;
}

export function checkoutChargeDisposition(input: {
  amount: number;
  amountRefunded: number;
  fullyRefunded: boolean;
  disputed: boolean;
}): OpportunityDisposition {
  if (input.fullyRefunded || input.amountRefunded >= input.amount) {
    return {
      status: "lost",
      tag: "payment-refunded-full",
      telemetry: "fully refunded before paid fulfillment",
    };
  }
  if (input.amountRefunded > 0) {
    return {
      status: "open",
      tag: "payment-refunded-partial-review",
      telemetry: "partially refunded before paid fulfillment",
    };
  }
  if (input.disputed) {
    return {
      status: "open",
      tag: "payment-dispute-open",
      telemetry: "disputed before paid fulfillment",
    };
  }
  return { status: "won", tag: "paid", telemetry: "paid" };
}

export function refundDisposition(input: {
  refundStatus: string | null | undefined;
  refundAmount: number;
  chargeAmount: number;
  chargeAmountRefunded: number;
  chargeFullyRefunded: boolean;
}): OpportunityDisposition {
  if (["failed", "canceled"].includes(input.refundStatus || "")) {
    return {
      tag: "payment-refund-failed-review",
      telemetry: `refund ${input.refundStatus}`,
    };
  }

  const effectiveRefunded = Math.max(
    input.refundAmount,
    input.chargeAmountRefunded
  );
  const fullyRefunded =
    input.chargeFullyRefunded || effectiveRefunded >= input.chargeAmount;
  const chargeConfirmsFullRefund =
    input.chargeFullyRefunded ||
    input.chargeAmountRefunded >= input.chargeAmount;
  if (
    fullyRefunded &&
    (input.refundStatus === "succeeded" || chargeConfirmsFullRefund)
  ) {
    return {
      status: "lost",
      tag: "payment-refunded-full",
      telemetry: "full refund succeeded",
    };
  }
  return {
    status: "open",
    tag: fullyRefunded
      ? "payment-refund-pending-review"
      : "payment-refunded-partial-review",
    telemetry: fullyRefunded ? "full refund pending" : "partial refund or adjustment",
  };
}

export function disputeDisposition(
  status: Stripe.Dispute.Status,
  disputeAmount?: number,
  paymentAmount?: number
): OpportunityDisposition {
  if (status === "lost") {
    const isKnownPartial =
      Number.isSafeInteger(disputeAmount) &&
      Number.isSafeInteger(paymentAmount) &&
      (disputeAmount as number) > 0 &&
      (paymentAmount as number) > 0 &&
      (disputeAmount as number) < (paymentAmount as number);
    if (isKnownPartial) {
      return {
        status: "open",
        tag: "payment-dispute-partial-lost-review",
        telemetry: "partial dispute lost; remaining payment review required",
      };
    }
    return {
      status: "lost",
      tag: "payment-dispute-lost",
      telemetry: "dispute lost",
    };
  }
  if (["won", "warning_closed", "prevented"].includes(status)) {
    // Do not automatically restore a won opportunity. A separate refund or a
    // second dispute can exist, and the event does not prove the whole payment
    // is still collectible. Leave an explicit manual-review state instead.
    return {
      status: "open",
      tag: "payment-dispute-resolved-review",
      telemetry: `dispute ${status}; payment review required`,
    };
  }
  return {
    status: "open",
    tag: "payment-dispute-open",
    telemetry: `dispute ${status}`,
  };
}

export function safeTelemetryCode(value: string | null | undefined): string {
  const code = (value || "unknown").trim().toLowerCase();
  return /^[a-z0-9_-]{1,64}$/.test(code) ? code : "unknown";
}
