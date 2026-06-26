import Link from "next/link";
import { CheckCircle2, Mail, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

// Stripe redirects here after a successful Hosted Checkout payment
// (success_url). Payment confirmation + GHL updates happen server-side via the
// /api/stripe-webhook handler — this page is purely the buyer-facing receipt.
export default function BookingSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16">
      <div className="w-full rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
          <CheckCircle2 className="h-9 w-9 text-green-600" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Payment Received — Thank You!
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your application and payment are confirmed. A receipt has been emailed
          to you, and our medical team will begin reviewing your file.
        </p>

        <div className="mt-8 space-y-4 text-left">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm text-foreground">
              <strong>Check your email</strong> for your confirmation and next
              steps. Add us to your contacts so nothing lands in spam.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm text-foreground">
              <strong>Documentation:</strong> if you still need to send medical
              records, reply to your confirmation email with them attached so we
              can finalize your exemption.
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
