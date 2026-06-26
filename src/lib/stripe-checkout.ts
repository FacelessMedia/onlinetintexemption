/**
 * Stripe **Hosted Checkout** session helper.
 *
 * Direct replacement for the Clover hosted-checkout flow: we create a Checkout
 * Session server-side and redirect the buyer to Stripe's hosted page (the card
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

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
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
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    metadata,
    // Mirror metadata onto the PaymentIntent so any downstream reconciler that
    // reads charges/payment-intents (not just checkout sessions) sees identity.
    payment_intent_data: { metadata, receipt_email: input.customer?.email || undefined },
    allow_promotion_codes: false,
  });

  if (!session.url || !session.id) {
    throw new Error(`Stripe checkout session missing url/id: ${JSON.stringify(session).slice(0, 300)}`);
  }
  return { href: session.url, checkoutSessionId: session.id };
}
