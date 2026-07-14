import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund terms and request instructions for Online Tint Exemption services coordinated through MyEyeRx.",
  robots: { index: false, follow: true },
};

export default function RefundPolicyPage() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Refund Policy</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Refund Policy</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p><strong className="text-foreground">Effective Date:</strong> January 1, 2026</p>
          <p><strong className="text-foreground">Last Updated:</strong> July 14, 2026</p>

          <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-5">
            <h2 className="text-lg font-bold text-foreground">Questions About Documents? Contact Us Before Paying</h2>
            <p className="mt-2">
              The single best way to protect your payment is to{" "}
              <strong className="text-foreground">call us before you purchase</strong> for help
              assessing whether your document appears suitable for initial review. Only the
              independent licensed clinician can make the final clinical decision. If you buy this service{" "}
              <strong className="text-foreground">without legitimate medical documentation</strong>{" "}
              that supports your condition, your application will be denied and{" "}
              <strong className="text-foreground">no refund will be issued — all sales are final in
              that case</strong>. It is your responsibility to ensure you have proper paperwork. If you
              are unsure whether your documents qualify, please call{" "}
              <a href="tel:+17343389453" className="text-primary hover:underline font-semibold">(734) 338-9453</a>{" "}
              before paying and our team will explain the intake requirements.
            </p>
          </div>

          <h2 className="text-xl font-bold text-foreground pt-4">Clinical Ineligibility After Documentation Review</h2>
          <p>
            We stand behind our service. If you submit{" "}
            <strong className="text-foreground">legitimate medical documentation</strong> and our
            independent licensed clinician still determines that your records do not support a medical window
            tint exemption, you may request a full refund under this policy. This provision applies only when proper
            documentation was provided for review — it does not cover purchases made without
            acceptable medical documentation (see &quot;Call Before You Pay&quot; above).
          </p>

          <h2 className="text-xl font-bold text-foreground pt-4">Eligibility for Full Refund</h2>
          <p>You are eligible for a full refund if:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>You provided proper medical documentation and an independent licensed clinician determines that it does not support a medical exemption</li>
            <li>We are unable to provide the purchased consultation/review service</li>
            <li>Technical issues on our end prevent completion of your consultation</li>
            <li>A verified duplicate charge was created for the same purchase</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground pt-4">No Refund Without Proper Documentation</h2>
          <p>
            If you purchase this service{" "}
            <strong className="text-foreground">without legitimate medical documentation</strong> that
            is suitable for the requested clinical review, your application may be unable to proceed and{" "}
            <strong className="text-foreground">no refund will be issued</strong>. All such sales are
            final. This is exactly why we strongly encourage you to{" "}
            <a href="tel:+17343389453" className="text-primary hover:underline font-semibold">call (734) 338-9453</a>{" "}
            before paying so we can explain what is generally useful for initial review.
          </p>
          <p>Acceptable medical documentation includes:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>A medical record, visit summary, or letter showing your name</li>
            <li>The treating professional or facility&apos;s identifying information</li>
            <li>The relevant condition, symptoms, treatment, or surgery</li>
            <li>For surgery-related requests, a facility letter confirming treatment may help with initial review</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground pt-4">How to Request a Refund</h2>
          <p>To request a refund, please contact our support team:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              Email:{" "}
              <a href="mailto:Tory@myeyerx.net" className="text-primary hover:underline">
                Tory@myeyerx.net
              </a>
            </li>
            <li>Phone: (734) 338-9453</li>
          </ul>
          <p>
            Approved refunds are returned to the original payment method. Bank and card-network
            posting times vary.
          </p>

          <h2 className="text-xl font-bold text-foreground pt-4">Non-Refundable Situations</h2>
          <p>Refunds will not be issued in the following situations:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              You purchased without legitimate medical documentation to support your condition (all
              sales are final in this case — call us first to avoid this)
            </li>
            <li>The purchased consultation/review and any agreed deliverables were completed</li>
            <li>You failed to attend your scheduled consultation without prior notice</li>
            <li>You provided false or misleading information during the application process</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground pt-4">Contact Us</h2>
          <p>
            If you have questions about our refund policy, please contact us at{" "}
              <a href="mailto:Tory@myeyerx.net" className="text-primary hover:underline">
              Tory@myeyerx.net
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
