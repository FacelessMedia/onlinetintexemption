import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund Policy for Online Tint Exemption. 100% money-back guarantee if you don't qualify.",
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
          <p><strong className="text-foreground">Last Updated:</strong> January 1, 2026</p>

          <h2 className="text-xl font-bold text-foreground pt-4">100% Money-Back Guarantee</h2>
          <p>
            At Online Tint Exemption, we stand behind our service with a 100% money-back guarantee.
            If our licensed physician determines that you do not qualify for a medical window tint
            exemption based on your condition, you will receive a full refund. No questions asked.
          </p>

          <h2 className="text-xl font-bold text-foreground pt-4">Eligibility for Full Refund</h2>
          <p>You are eligible for a full refund if:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Our physician determines you do not qualify for a medical exemption</li>
            <li>We are unable to schedule your consultation within our standard timeframe</li>
            <li>Technical issues on our end prevent completion of your consultation</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground pt-4">Non-Refundable Processing Fee</h2>
          <p>
            A <strong className="text-foreground">$25 non-refundable processing fee</strong> will be
            deducted from your refund if you attend your consultation{" "}
            <strong className="text-foreground">without proper medical documentation</strong> of your
            condition. This fee covers physician time and administrative processing costs.
          </p>
          <p>Acceptable medical documentation includes:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Doctor&apos;s diagnosis letter or medical records</li>
            <li>Previous prescriptions for your condition</li>
            <li>Specialist referral or treatment documentation</li>
            <li>Hospital discharge papers mentioning your condition</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground pt-4">How to Request a Refund</h2>
          <p>To request a refund, please contact our support team:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              Email:{" "}
              <a href="mailto:support@onlinetintexemption.com" className="text-primary hover:underline">
                support@onlinetintexemption.com
              </a>
            </li>
            <li>Phone: (734) 338-8453</li>
          </ul>
          <p>
            Refunds are typically processed within 5-10 business days and will be returned to
            the original payment method.
          </p>

          <h2 className="text-xl font-bold text-foreground pt-4">Non-Refundable Situations</h2>
          <p>Refunds will not be issued in the following situations:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>You received your medical exemption certificate successfully</li>
            <li>You failed to attend your scheduled consultation without prior notice</li>
            <li>You provided false or misleading information during the application process</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground pt-4">Contact Us</h2>
          <p>
            If you have questions about our refund policy, please contact us at{" "}
            <a href="mailto:support@onlinetintexemption.com" className="text-primary hover:underline">
              support@onlinetintexemption.com
            </a>
          </p>

          <div className="rounded-lg border border-border bg-card p-4 mt-8">
            <p className="text-sm text-muted-foreground">
              <strong className="text-card-foreground">Note:</strong> This refund policy is a template and should be
              reviewed by a legal professional before final publication.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
