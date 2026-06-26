import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  addTagToContact,
  moveOpportunityStage,
  ghlConfig,
  GHL_TAGS,
} from "@/lib/ghl";

// Stripe needs the raw, unparsed body to verify the signature, so this must run
// on the Node runtime (not edge) and never go through JSON body parsing.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe(): Stripe {
  const key = process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY || "";
  if (!key) throw new Error("Stripe is not configured");
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const signature = request.headers.get("stripe-signature") || "";

  if (!webhookSecret) {
    console.error("stripe-webhook: STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("stripe-webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook signature error: ${message}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Only act on actually-paid sessions (ignore unpaid/expired).
      if (session.payment_status && session.payment_status !== "paid") {
        return NextResponse.json({ received: true, ignored: session.payment_status });
      }

      const md = session.metadata || {};
      const contactId = md.ghl_contact_id;
      const opportunityId = md.ghl_opportunity_id;
      const hasDocs = md.docs === "yes";

      if (contactId) {
        await addTagToContact(contactId, GHL_TAGS.paid).catch(() => {});
      }
      if (opportunityId) {
        const wonStage = hasDocs ? ghlConfig.stageDocsSubmitted : ghlConfig.stageNoDocs;
        await moveOpportunityStage(opportunityId, wonStage, "won").catch(() => {});
      }

      console.log(
        `stripe-webhook: payment confirmed contact=${contactId || "?"} opp=${opportunityId || "?"} amount=${session.amount_total}`
      );
    }

    // Acknowledge everything else so Stripe stops retrying.
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("stripe-webhook handler error:", err);
    // Return 200 so Stripe doesn't hammer retries for a transient GHL hiccup;
    // the payment itself already succeeded and is visible in Stripe.
    return NextResponse.json({ received: true, warning: "handler error logged" });
  }
}
