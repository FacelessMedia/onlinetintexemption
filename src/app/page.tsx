import Link from "next/link";
import {
  Shield,
  Clock,
  FileCheck,
  Stethoscope,
  BadgeCheck,
  HeadsetIcon,
  ChevronRight,
  ClipboardList,
  Phone,
  Mail,
  CheckCircle,
} from "lucide-react";
import { getAllStates } from "@/data/states";
import { USMap } from "@/components/us-map";

const steps = [
  {
    icon: ClipboardList,
    title: "Select Your State",
    description:
      "Choose your state to see specific requirements and available consultation times.",
  },
  {
    icon: FileCheck,
    title: "Complete Intake Form",
    description:
      "Answer a few simple questions about your medical condition. Takes about 5 minutes.",
  },
  {
    icon: Phone,
    title: "Phone Consultation",
    description:
      "Brief 10-15 minute call with a licensed physician to evaluate your condition.",
  },
  {
    icon: Mail,
    title: "Receive Certificate",
    description:
      "Get your signed medical exemption certificate via email within 24-48 hours.",
  },
];

const trustFeatures = [
  {
    icon: Shield,
    title: "100% Money-Back Guarantee",
    description:
      "Bring legitimate proof of your medical condition. If our physician determines you don't qualify, you'll receive a full refund. No questions asked.",
  },
  {
    icon: Clock,
    title: "Fast 24-48 Hour Approval",
    description:
      "Get your medical tint exemption certificate delivered to your email within 1-2 business days.",
  },
  {
    icon: Stethoscope,
    title: "Licensed Physicians",
    description:
      "All consultations are conducted by board-certified physicians licensed in your state.",
  },
  {
    icon: BadgeCheck,
    title: "Legally Valid Documentation",
    description:
      "Your exemption certificate meets all state requirements and is accepted by law enforcement.",
  },
  {
    icon: CheckCircle,
    title: "Hundreds of Happy Customers",
    description:
      "We've helped hundreds of people across all 50 states get their legal tint exemptions.",
  },
  {
    icon: HeadsetIcon,
    title: "Dedicated Support",
    description:
      "Our team is here to help you through every step of the process. Questions? Just ask.",
  },
];

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

export default function Home() {
  const allStates = getAllStates();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Get Your Medical Window Tint Exemption{" "}
              <span className="text-primary">Online</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl">
              Skip the in-person visits. Get your legal tint exemption
              certificate from a licensed physician in as little as 24 hours.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Your Exemption Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3.5 text-base font-semibold text-foreground hover:bg-muted transition-colors"
              >
                See How It Works
              </a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="text-2xl font-bold text-foreground">$249</span>
                <span className="line-through text-muted-foreground">$349</span>
              </span>
              <span className="rounded-full bg-secondary/20 text-secondary px-3 py-1 text-xs font-semibold">
                Save $100
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-card py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground">
              How to Get Your Medical Tint Exemption
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process makes it easy to get your legal window
              tint exemption without leaving home.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start Your Application
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Takes less than 5 minutes to complete
            </p>
          </div>
        </div>
      </section>

      {/* Select Your State */}
      <section id="states" className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Select Your State to Get Started
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our licensed physicians can issue medical tint exemptions for all
              50 states. Select your state to see specific requirements.
            </p>
          </div>
          {/* Interactive Map - Desktop only */}
          <div className="mt-12 hidden lg:block">
            <USMap />
          </div>

          {/* Grid - Mobile / Tablet */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 lg:hidden">
            {allStates.map((state) => (
              <Link
                key={state.slug}
                href={`/${state.slug}-window-tint-medical-exemption`}
                className="group flex items-center gap-2.5 rounded-lg border border-border bg-card p-3 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {state.abbreviation}
                </div>
                <span className="font-medium text-card-foreground text-sm truncate">
                  {state.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="bg-card py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground">
              The Trusted Choice for Medical Tint Exemptions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;ve streamlined the entire process so you can get your
              legal exemption without the hassle.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {trustFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-background p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about getting your medical tint
              exemption
            </p>
          </div>
          <div className="mt-12 max-w-3xl mx-auto divide-y divide-border">
            {faqItems.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between font-medium text-foreground">
                  {item.q}
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">Still have questions?</p>
            <Link
              href="/contact"
              className="inline-flex items-center text-primary font-medium mt-1 hover:underline"
            >
              Contact our support team
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-card py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground">
            Ready to Get Your Legal Window Tint Exemption?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of satisfied customers who got their medical tint
            exemption through Online Tint Exemption. Fast, legal, and
            hassle-free.
          </p>
          <div className="mt-8">
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Your Exemption Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-foreground">$249</span>
              <span className="text-lg line-through text-muted-foreground">
                $349
              </span>
              <span className="rounded-full bg-secondary/20 text-secondary px-3 py-1 text-xs font-semibold">
                Save $100
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
