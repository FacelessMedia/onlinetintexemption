/**
 * Clover **Hosted Checkout** session helper.
 *
 * Why this exists: Clover's Ecommerce `/v1/charges` endpoint (our old
 * inline-card flow) has NO cardholder/customer field, so the merchant
 * dashboard recorded every ecom charge with a blank buyer ("null" in
 * reporting). The sister project MyEyeRx solved this by switching to
 * Clover's Platform **Hosted Checkout** API: the card is collected on
 * Clover's own hosted page, so Clover records the buyer natively
 * (`order.shipping.name` / `customer`).
 *
 * We pre-fill the customer block with the name/email/phone we already
 * collect on our form, then redirect the buyer to the returned `href`.
 *
 * IMPORTANT — shared merchant: this Clover merchant is shared with
 * myeyerx.net. Their reconciler pulls `/v1/charges` and would sync OUR
 * buyers into THEIR CRM unless we tag each session so their
 * `shouldSkipForeignCharge` filter skips it. We stamp:
 *   metadata.source_system = "tint-exemption-sites"
 *   metadata.site          = "<this site url>"
 *   metadata.ghl_synced    = "true"
 * which matches three of their four skip rules.
 *
 * Auth: the Platform/Hosted-Checkout API authenticates with a Clover
 * **merchant API token** (NOT the Ecommerce private key — that returns
 * 401 UNAUTHORIZED on this endpoint), sent as a Bearer token plus an
 * `X-Clover-Merchant-Id` header. The sister site myeyerx.net uses the
 * same merchant, so its `CLOVER_API_TOKEN` value works here verbatim.
 *
 * Required env vars:
 *   CLOVER_API_TOKEN    Clover merchant API / Hosted Checkout token.
 *                       Falls back to CLOVER_PRIVATE only for local dev
 *                       convenience (will 401 against the real endpoint).
 *   CLOVER_MERCHANT_ID  13-char merchant id. Falls back to
 *                       NEXT_PUBLIC_CLOVER_MERCHANT_ID if unset.
 * Optional:
 *   CLOVER_ENV          'production' (default) | 'sandbox'
 *
 * Refs:
 *   https://docs.clover.com/dev/docs/creating-a-hosted-checkout-session
 */

const PLATFORM_BASES = {
  production: "https://api.clover.com",
  sandbox: "https://apisandbox.dev.clover.com",
} as const;

function getCloverCheckoutConfig() {
  const env = (process.env.CLOVER_ENV || "production") as "sandbox" | "production";
  return {
    env,
    platformBase: PLATFORM_BASES[env] ?? PLATFORM_BASES.production,
    // Prefer the dedicated Hosted Checkout token. Fall back to the Ecommerce
    // private key only so local dev fails loudly with 401 rather than a
    // missing-config error — production MUST set CLOVER_API_TOKEN.
    apiToken: process.env.CLOVER_API_TOKEN || process.env.CLOVER_PRIVATE || "",
    merchantId:
      process.env.CLOVER_MERCHANT_ID ||
      process.env.NEXT_PUBLIC_CLOVER_MERCHANT_ID ||
      "",
  };
}

export interface CreateCheckoutSessionInput {
  /** Human-readable product name shown on the Hosted Checkout page. */
  productName: string;
  /** Unit price in cents (e.g. 22500 for $225.00). */
  amountCents: number;
  /** Quantity; defaults to 1. */
  quantity?: number;
  /** Pre-fill for Clover's hosted page. */
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
  /**
   * String key/value pairs propagated onto the resulting Clover order.
   * We use this to (a) tag the charge so the shared-merchant sister site
   * skips it, and (b) carry GHL contactId/state/email for our own
   * reconciliation.
   */
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResponse {
  /** URL the customer should be redirected to to pay. Short-lived (~15 min). */
  href: string;
  /** UUID — appears as `event.data` in the Hosted Checkout webhook. */
  checkoutSessionId: string;
  createdTime?: number;
  expirationTime?: number;
}

/**
 * Create a Clover Hosted Checkout session via the Platform API. The
 * returned `href` is single-use and expires ~15 minutes after creation,
 * so call this at the moment the customer is ready to pay — never cache it.
 */
export async function createHostedCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<CheckoutSessionResponse> {
  const { platformBase, apiToken, merchantId } = getCloverCheckoutConfig();
  if (!apiToken) throw new Error("CLOVER_API_TOKEN is not configured");
  if (!merchantId) throw new Error("CLOVER_MERCHANT_ID is not configured");
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    throw new Error(`createHostedCheckoutSession: invalid amountCents=${input.amountCents}`);
  }

  const body: Record<string, unknown> = {
    customer: {
      // Clover requires `customer` to be present; fields may be empty.
      email: input.customer?.email || "",
      firstName: input.customer?.firstName || "",
      lastName: input.customer?.lastName || "",
      phoneNumber: input.customer?.phoneNumber || "",
    },
    shoppingCart: {
      lineItems: [
        {
          name: input.productName,
          price: Math.round(input.amountCents),
          unitQty: input.quantity ?? 1,
        },
      ],
    },
  };
  if (input.metadata && Object.keys(input.metadata).length > 0) {
    body.metadata = input.metadata;
  }

  const url = `${platformBase}/invoicingcheckoutservice/v1/checkouts`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      authorization: `Bearer ${apiToken}`,
      "X-Clover-Merchant-Id": merchantId,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const respText = await res.text().catch(() => "");
    throw new Error(
      `Clover POST /invoicingcheckoutservice/v1/checkouts failed (${res.status}): ${respText.slice(0, 800)}`
    );
  }

  const json = (await res.json()) as CheckoutSessionResponse;
  if (!json.href || !json.checkoutSessionId) {
    throw new Error(
      `Clover checkout session response missing href/checkoutSessionId: ${JSON.stringify(json).slice(0, 400)}`
    );
  }
  return json;
}
