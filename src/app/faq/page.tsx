import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Everything you need to know about getting your medical tint exemption. Common questions answered.",
};

const faqItems = [
  {
    q: "What medical conditions qualify for a tint exemption?",
    a: "Common qualifying conditions include lupus, photosensitivity, melanoma/skin cancer history, migraines, albinism, cataracts, macular degeneration, and various eye conditions that cause light sensitivity. During your consultation, our licensed physician will evaluate your specific condition to determine if you qualify.",
  },
  {
    q: "How long does the process take?",
    a: "Most customers receive their medical tint exemption certificate within 24-48 hours of completing their phone consultation. The initial intake form takes about 5 minutes, and the phone consultation is typically 10-15 minutes.",
  },
  {
    q: "Do I need to visit a doctor in person?",
    a: "No. The entire process is done remotely. You'll complete an online intake form and then have a brief phone consultation with a licensed physician. There's no need to leave your home.",
  },
  {
    q: "What if I don't qualify?",
    a: "We offer a 100% money-back guarantee. If our physician determines that you don't qualify for a medical tint exemption based on your condition, you'll receive a full refund. No questions asked.",
  },
  {
    q: "Is a medical tint exemption legal?",
    a: "Yes, medical exemptions for window tinting are legal in most states when properly documented by a licensed physician. Your exemption certificate serves as legal proof of your medical need and is accepted by law enforcement.",
  },
  {
    q: "How dark can I tint my windows?",
    a: "The allowed tint level varies by state and depends on your specific medical condition. Your physician will specify the appropriate darkness level on your exemption certificate based on your medical needs and state regulations.",
  },
  {
    q: "Do I need to register with the DMV?",
    a: "This depends on your state. Some states require DMV registration, while others only require you to carry the prescription in your vehicle. We'll provide detailed instructions for your specific state's requirements.",
  },
  {
    q: "Is my information secure?",
    a: "Absolutely. We use bank-level encryption to protect your personal and medical information. Your data is never shared with third parties and all consultations are completely confidential.",
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
              Everything you need to know about getting your medical tint exemption
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

      {/* CTA */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who got their tint exemption
            through Online Tint Exemption.
          </p>
          <div className="mt-8">
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Your Exemption Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
