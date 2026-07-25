/**
 * Stripe **Hosted Checkout** session helper.
 *
 * Creates a Checkout Session server-side and redirects the buyer to Stripe's
 * hosted page (the card
 * never touches our servers — minimal PCI scope). On success Stripe redirects to
 * successUrl and fires the `checkout.session.completed` webhook, which our
 * /api/stripe-webhook uses to flip the GHL opportunity to paid.
 *
 * Required env (server-only — never NEXT_PUBLIC):
 *   STRIPE_RESTRICTED_KEY   Preferred: restricted key with "Checkout Sessions:
 *                           write". Falls back to STRIPE_SECRET_KEY.
 *   STRIPE_SECRET_KEY       Full secret key (sk_live_… / sk_test_…).
 * The webhook needs STRIPE_WEBHOOK_SECRET (used in the webhook route, not here).
 *
 * We do NOT pin apiVersion so the build can't break on an SDK literal-type
 * mismatch; the account's default API version is used.
 */
import Stripe from "stripe";
import { REFUND_FEE_CHECKOUT_MESSAGE } from "./refund-fee.ts";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  const key = process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY || "";
  if (!key) {
    throw new Error("Stripe is not configured (STRIPE_RESTRICTED_KEY / STRIPE_SECRET_KEY)");
  }
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

export interface CreateStripeCheckoutInput {
  /** Human-readable product name shown on the Stripe Checkout page. */
  productName: string;
  /** Unit price in cents (e.g. 25000 for $250.00). */
  amountCents: number;
  /** Quantity; defaults to 1. */
  quantity?: number;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
  /** String-only key/values propagated onto the session + payment intent. */
  metadata?: Record<string, string>;
  /** Absolute URL Stripe redirects to on success (may include the
   *  {CHECKOUT_SESSION_ID} template literal). */
  successUrl: string;
  /** Absolute URL Stripe redirects to if the buyer cancels. */
  cancelUrl: string;
  /** Binds the Stripe session to the CRM contact for reconciliation. */
  clientReferenceId: string;
  /** Makes retries return the same cart rather than creating a new one. */
  idempotencyKey: string;
}

export interface StripeCheckoutResponse {
  /** URL to redirect the buyer to in order to pay. */
  href: string;
  /** Stripe Checkout Session id (cs_…) — appears in the webhook event. */
  checkoutSessionId: string;
}

export async function createStripeCheckoutSession(
  input: CreateStripeCheckoutInput
): Promise<StripeCheckoutResponse> {
  const stripe = getStripe();
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    throw new Error(`createStripeCheckoutSession: invalid amountCents=${input.amountCents}`);
  }

  const metadata = input.metadata || {};

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      client_reference_id: input.clientReferenceId,
      line_items: [
        {
          quantity: input.quantity ?? 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(input.amountCents),
            product_data: { name: input.productName },
          },
        },
      ],
      customer_email: input.customer?.email || undefined,
      billing_address_collection: "required",
      payment_method_types: ["card"],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      metadata,
      // Mirror metadata onto the PaymentIntent so reconciliation can recover a
      // paid customer even if a webhook delivery is delayed.
      payment_intent_data: {
        metadata,
        receipt_email: input.customer?.email || undefined,
      },
      custom_text: {
        submit: { message: REFUND_FEE_CHECKOUT_MESSAGE },
      },
      allow_promotion_codes: false,
    },
    { idempotencyKey: input.idempotencyKey }
  );

  if (!session.url || !session.id) {
    throw new Error("Stripe checkout session response was incomplete");
  }
  return { href: session.url, checkoutSessionId: session.id };
}

export async function retrieveStripeCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  if (!/^cs_(?:test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    throw new Error("Invalid Checkout Session id");
  }
  return getStripe().checkout.sessions.retrieve(sessionId);
}
