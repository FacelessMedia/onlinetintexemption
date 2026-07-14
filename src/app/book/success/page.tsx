import Link from "next/link";
import { AlertCircle, CheckCircle2, FileText, Mail } from "lucide-react";
import { ghlConfig } from "@/lib/ghl";
import { retrieveStripeCheckoutSession } from "@/lib/stripe-checkout";
import { getCanonicalOrigin } from "@/lib/request-security";
import { getStateBySlug } from "@/data/states";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function BookingSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  let verified = false;
  let pending = false;

  if (sessionId) {
    try {
      const session = await retrieveStripeCheckoutSession(sessionId);
      const metadata = session.metadata || {};
      const state = getStateBySlug(metadata.state_slug || "");
      const belongsToThisService =
        metadata.source_system === "tint-exemption-sites" &&
        metadata.site_name === ghlConfig.siteName &&
        metadata.site === new URL(getCanonicalOrigin()).hostname &&
        metadata.state === state?.name &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          metadata.order_jti || ""
        ) &&
        Boolean(metadata.ghl_contact_id) &&
        session.client_reference_id === metadata.ghl_contact_id &&
        session.mode === "payment" &&
        Boolean(state?.offered && state.price) &&
        state!.price * 100 === session.amount_total &&
        session.currency?.toLowerCase() === "usd";
      verified =
        belongsToThisService &&
        session.status === "complete" &&
        session.payment_status === "paid";
      pending = belongsToThisService && !verified;
    } catch {
      // Stripe errors can include request metadata; keep the server log generic.
      console.error("Could not verify booking success session");
    }
  }

  if (!verified) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16">
        <div className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
          <AlertCircle className="mx-auto h-14 w-14 text-amber-600" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
            {pending ? "Payment Is Still Processing" : "We Could Not Verify This Payment"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {pending
              ? "Please wait for your Stripe receipt before closing this page. Our team will contact you if anything else is needed."
              : "No payment confirmation was found for this page. Check your Stripe receipt before trying again, or contact support so we can verify your application."}
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 font-bold text-primary-foreground"
          >
            Contact Support
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16">
      <div className="w-full rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
          <CheckCircle2 className="h-9 w-9 text-green-600" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Payment Confirmed — Thank You!
        </h1>
        <p className="mt-3 text-muted-foreground">
          Stripe confirmed your payment. Our medical-service partner, MyEyeRx,
          will review your application and documentation.
        </p>

        <div className="mt-8 space-y-4 text-left">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm text-foreground">
              <strong>Check your email</strong> for your Stripe receipt and next
              steps from MyEyeRx.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm text-foreground">
              If additional information is needed, the MyEyeRx team will contact
              you using the email address or phone number on your application.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-primary py-3.5 text-base font-bold text-primary-foreground shadow-lg transition-opacity hover:opacity-90 sm:w-auto sm:px-10"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
