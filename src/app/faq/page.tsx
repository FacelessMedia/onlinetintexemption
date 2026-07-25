import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "General answers about medical window tint intake, documents, payment routing, MyEyeRx coordination, and independent clinical review.",
  alternates: { canonical: "https://www.onlinetintexemption.com/faq" },
};

const faqItems = [
  {
    q: "What medical conditions qualify for a tint exemption?",
    a: "Requirements vary by state and individual circumstances. Selecting a condition means only that you may continue the initial screening. An independent licensed clinician makes the final clinical decision and may request more information.",
  },
  {
    q: "How long does the process take?",
    a: "Timing depends on document completeness, provider availability, and state-specific requirements. MyEyeRx will contact you if more information is needed. No approval or delivery time is guaranteed.",
  },
  {
    q: "Do I need to visit a doctor in person?",
    a: "The intake begins online. The reviewing provider determines the appropriate consultation format and whether additional records, follow-up, or in-person care are needed.",
  },
  {
    q: "What if I don't qualify?",
    a: "Qualification is not guaranteed. Review the current Refund Policy before paying or call MyEyeRx at 734-338-8453 for help understanding how the policy applies.",
  },
  {
    q: "Is a medical tint exemption legal?",
    a: "Many jurisdictions provide a medical-exemption process, but forms, tint limits, filing steps, and enforcement treatment vary. Confirm current rules with the relevant state authority. We do not provide legal advice or guarantee agency acceptance.",
  },
  {
    q: "How dark can I tint my windows?",
    a: "Do not assume an exemption allows any particular tint percentage or window. Follow the reviewing clinician's documentation and current instructions from the relevant state authority.",
  },
  {
    q: "Do I need to register with the DMV?",
    a: "This depends on the state and can change. Follow the current instructions from the relevant agency. MyEyeRx can help coordinate administrative next steps after review.",
  },
  {
    q: "Is my information secure?",
    a: "The intake uses access controls, file validation, rate limits, and Stripe-hosted card entry. Information is handled and shared as described in the Privacy Policy. No online service can promise absolute security.",
  },
];

export default function FAQPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              General answers about intake, documents, payment, and review
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="divide-y divide-border">
            {faqItems.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between font-medium text-card-foreground text-lg">
                  {item.q}
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-90 shrink-0 ml-4" />
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-muted-foreground">Still have questions?</p>
            <Link
              href="/contact"
              className="inline-flex items-center text-primary font-medium mt-2 hover:underline"
            >
              Contact our support team
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Explore More */}
      <section className="bg-background pb-4">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Explore More</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Link href="/conditions" className="text-primary hover:underline">All qualifying medical conditions</Link>
            <Link href="/conditions/migraines" className="text-primary hover:underline">Tint exemption for migraines</Link>
            <Link href="/conditions/lupus" className="text-primary hover:underline">Tint exemption for lupus</Link>
            <Link href="/conditions/photophobia" className="text-primary hover:underline">Tint exemption for photophobia</Link>
            <Link href="/california-window-tint-medical-exemption" className="text-primary hover:underline">California tint exemption</Link>
            <Link href="/florida-window-tint-medical-exemption" className="text-primary hover:underline">Florida tint exemption</Link>
            <Link href="/texas-window-tint-medical-exemption" className="text-primary hover:underline">Texas tint exemption</Link>
            <Link href="/about" className="text-primary hover:underline">About Online Tint Exemption</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Review your state&apos;s guidance and begin the preliminary intake. This
            is not a diagnosis or promise of approval.
          </p>
          <div className="mt-8">
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start Secure Intake
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
