import { NextRequest, NextResponse } from "next/server";
import { getStateBySlug } from "@/data/states";
import { createStripeCheckoutSession } from "@/lib/stripe-checkout";
import { createHostedCheckoutSession } from "@/lib/clover-checkout";
import {
  addTagToContact,
  contactHasDocs,
  moveOpportunityStage,
  ghlConfig,
  GHL_TAGS,
} from "@/lib/ghl";

export const runtime = "nodejs";

// Which processor to use. Default stays "clover" so flipping to Stripe (and
// rolling back) is a single env change with zero code deploy.
const PAYMENT_PROVIDER = (process.env.PAYMENT_PROVIDER || "clover").toLowerCase();

// $250+ orders may not pay until medical docs are on the contact. Configurable
// so the threshold can change without a code edit.
const DOCS_REQUIRED_MIN_PRICE = Number(process.env.DOCS_REQUIRED_MIN_PRICE || "250");

function isTestMode(): boolean {
  return (
    PAYMENT_PROVIDER === "stripe"
      ? process.env.STRIPE_TEST_MODE
      : process.env.CLOVER_TEST_MODE
  ) === "true";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface CreateCheckoutBody {
  contactId: string;
  opportunityId?: string;
  stateSlug: string;
  // Client hint only — the server re-verifies docs against GHL. Used solely to
  // decide whether a short retry for read-consistency is worthwhile.
  docsUploaded?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export async function POST(request: NextRequest) {
  let stage = "start";
  try {
    stage = "parse-body";
    const body: CreateCheckoutBody = await request.json();

    stage = "validate";
    if (!body.contactId || !body.stateSlug) {
      return NextResponse.json(
        { error: "Missing contact or state reference.", stage },
        { status: 400 }
      );
    }

    // Authoritative server-side price lookup — the client never dictates amount.
    stage = "price-lookup";
    const stateData = getStateBySlug(body.stateSlug);
    if (!stateData || !stateData.offered || !stateData.price || stateData.price <= 0) {
      return NextResponse.json(
        { error: "We don't currently offer online exemption service for that state.", stage },
        { status: 400 }
      );
    }
    const priceDollars = stateData.price;
    const stateName = stateData.name;

    // ---- Payment gate: $250+ requires medical docs on the contact ----
    stage = "doc-gate";
    const requiresDocs = priceDollars >= DOCS_REQUIRED_MIN_PRICE;
    if (requiresDocs) {
      let hasDocs = await contactHasDocs(body.contactId);
      // GHL custom-field writes can lag a beat behind the upload response. If the
      // client just uploaded, retry once before deciding there are no docs.
      if (!hasDocs && body.docsUploaded) {
        await sleep(800);
        hasDocs = await contactHasDocs(body.contactId);
      }
      if (!hasDocs) {
        // Lead is already saved (submit-order). Park them for human follow-up
        // and DO NOT take payment.
        await addTagToContact(body.contactId, GHL_TAGS.needsDocs).catch(() => {});
        if (body.opportunityId && ghlConfig.stageNeedsDocs) {
          await moveOpportunityStage(body.opportunityId, ghlConfig.stageNeedsDocs).catch(() => {});
        }
        return NextResponse.json(
          {
            blocked: true,
            requiresDocs: true,
            message:
              "Your application is saved. We can only process payment once we receive your medical documentation — check your email for upload instructions, or reply with your documents.",
          },
          { status: 200 }
        );
      }
    }

    // ---- Create the hosted checkout session (Stripe or Clover) ----
    stage = "checkout";
    const amount = isTestMode() ? 100 : priceDollars * 100;
    const productName = `${stateName} Tint Exemption${isTestMode() ? " [TEST]" : ""}`;

    const metadata: Record<string, string> = {
      source_system: "tint-exemption-sites",
      // Derived from the request host so this file is identical across every
      // site (no per-domain hardcoding). Informational metadata only.
      site: request.headers.get("host") || "",
      ghl_synced: "true",
      state: stateName,
      state_slug: body.stateSlug,
      email: body.email || "",
      site_name: ghlConfig.siteName,
      ghl_contact_id: body.contactId,
      docs: requiresDocs ? "yes" : (body.docsUploaded ? "yes" : "no"),
    };
    if (body.opportunityId) metadata.ghl_opportunity_id = body.opportunityId;

    let checkoutUrl: string;
    let checkoutSessionId: string;

    if (PAYMENT_PROVIDER === "stripe") {
      const origin =
        request.headers.get("origin") ||
        (request.headers.get("host") ? `https://${request.headers.get("host")}` : "");
      const session = await createStripeCheckoutSession({
        productName,
        amountCents: amount,
        customer: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phoneNumber: body.phone,
        },
        metadata,
        successUrl: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/book/${body.stateSlug}`,
      });
      checkoutUrl = session.href;
      checkoutSessionId = session.checkoutSessionId;
    } else {
      const session = await createHostedCheckoutSession({
        productName,
        amountCents: amount,
        customer: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phoneNumber: body.phone,
        },
        metadata,
      });
      checkoutUrl = session.href;
      checkoutSessionId = session.checkoutSessionId;
    }

    // Best-effort: mark that the buyer reached payment. The webhook flips this
    // to "paid" once Stripe (or the Clover reconciler) confirms settlement.
    stage = "ghl-tag";
    await addTagToContact(body.contactId, GHL_TAGS.checkoutStarted).catch(() => {});

    return NextResponse.json({
      success: true,
      checkoutUrl,
      checkoutSessionId,
      amount,
      provider: PAYMENT_PROVIDER,
    });
  } catch (err) {
    console.error(`create-checkout error at stage=${stage}:`, err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json(
      {
        error: "We couldn't start secure payment. Please try again or contact support.",
        stage,
        detail: message.slice(0, 400),
      },
      { status: 500 }
    );
  }
}
