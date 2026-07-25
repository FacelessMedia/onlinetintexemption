import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Refund terms and request instructions for Online Tint Exemption services coordinated through MyEyeRx.",
  robots: { index: false, follow: true },
};

export default function RefundPolicyPage() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Refund Policy</span>
        </div>

        <h1 className="mb-8 text-3xl font-bold text-foreground sm:text-4xl">
          Refund Policy
        </h1>

        <div className="space-y-6 leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">Effective Date:</strong> January
            1, 2026
          </p>
          <p>
            <strong className="text-foreground">Last Updated:</strong> July 14,
            2026
          </p>

          <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-5">
            <h2 className="text-lg font-bold text-foreground">
              Documents Are Required Before Payment
            </h2>
            <p className="mt-2">
              Stripe checkout cannot begin until the secure intake confirms a
              current-application document upload. If you are unsure what record
              may be useful, call{" "}
              <a
                href="tel:+17343388453"
                className="font-semibold text-primary hover:underline"
              >
                (734) 338-8453
              </a>{" "}
              before paying. The team can explain common document types and the
              secure-upload process, but only an independent licensed clinician
              can make a clinical decision, and the responsible state agency
              makes its own decision.
            </p>
          </div>

          <h2 className="pt-4 text-xl font-bold text-foreground">
            Review Before Filing
          </h2>
          <p>
            MyEyeRx coordinates a pre-filing review of the information and
            documents you provide. The team may request additional records. If
            the available information is not sufficient to support filing,
            MyEyeRx will not knowingly submit the application merely to obtain a
            state rejection. This review is intended to reduce avoidable
            filings, but it is not a guarantee of clinical approval, filing,
            agency acceptance, or any particular tint allowance.
          </p>

          <h2 className="pt-4 text-xl font-bold text-foreground">
            State Rejection and Refund Review
          </h2>
          <p>
            A state agency&apos;s decision remains independent. If MyEyeRx
            actually filed your application and the state then rejected it, you
            may contact MyEyeRx to request a refund review. This describes the
            review that is available; it does not promise a state outcome or
            create an automatic refund without confirming what was filed and
            what the state decided.
          </p>

          <h2 className="pt-4 text-xl font-bold text-foreground">
            Common Supporting Records
          </h2>
          <p>Records that may be useful for initial review include:</p>
          <ul className="ml-6 list-disc space-y-1">
            <li>A medical record, visit summary, or letter showing your name</li>
            <li>
              The treating professional or facility&apos;s identifying
              information
            </li>
            <li>The relevant condition, symptoms, treatment, or surgery</li>
            <li>
              For surgery-related requests, a facility letter confirming
              treatment may help with initial review
            </li>
          </ul>
          <p>
            The examples above are general guidance, not a promise that a
            particular record will be sufficient. Requirements and clinical
            judgments can vary.
          </p>

          <h2 className="pt-4 text-xl font-bold text-foreground">
            How to Request Refund Review
          </h2>
          <p>Contact the MyEyeRx support team:</p>
          <ul className="ml-6 list-disc space-y-1">
            <li>
              Email:{" "}
              <a
                href="mailto:tory@myeyerx.net"
                className="text-primary hover:underline"
              >
                tory@myeyerx.net
              </a>
            </li>
            <li>
              Phone:{" "}
              <a
                href="tel:+17343388453"
                className="text-primary hover:underline"
              >
                (734) 338-8453
              </a>
            </li>
          </ul>
          <p>
            If a refund is approved, it is returned to the original payment
            method. Bank and card-network posting times vary.
          </p>

          <h2 className="pt-4 text-xl font-bold text-foreground">Contact Us</h2>
          <p>
            If you have questions about this policy, contact{" "}
            <a
              href="mailto:tory@myeyerx.net"
              className="text-primary hover:underline"
            >
              tory@myeyerx.net
            </a>
            . Do not send medical records by ordinary email; use the secure
            intake uploader.
          </p>
        </div>
      </div>
    </section>
  );
}
