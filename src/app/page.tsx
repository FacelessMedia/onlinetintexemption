import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Medical Window Tint Exemption Information & Intake | Online Tint Exemption",
  description:
    "Review state-specific medical window tint information and begin a secure intake coordinated with MyEyeRx and independent licensed clinicians. Pricing starts at $225.",
  keywords: [
    "medical window tint exemption",
    "window tint medical exemption online",
    "tint exemption certificate",
    "medical tint permit",
    "window tint prescription",
    "state window tint exemption requirements",
    "legal window tint exemption",
    "photosensitivity tint exemption",
    "lupus window tint",
    "migraine window tint exemption",
  ],
  alternates: {
    canonical: "https://www.onlinetintexemption.com",
  },
  openGraph: {
    title: "Medical Window Tint Exemption Online | Online Tint Exemption",
    description:
      "State-specific medical window tint education and secure intake coordinated with MyEyeRx and independent licensed clinicians.",
    url: "https://www.onlinetintexemption.com",
    siteName: "Online Tint Exemption",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Medical Window Tint Exemption Online | Online Tint Exemption",
    description:
      "State-specific medical window tint education and secure intake coordinated with MyEyeRx and independent licensed clinicians.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

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
      "Answer a short set of questions about your symptoms and medical history.",
  },
  {
    icon: Phone,
    title: "MyEyeRx Coordination",
    description:
      "MyEyeRx coordinates consultation booking, referrals, and any needed follow-up.",
  },
  {
    icon: Mail,
    title: "Independent Clinical Review",
    description:
      "An appropriately licensed independent clinician makes the clinical decision and may request more information.",
  },
];

const trustFeatures = [
  {
    icon: Shield,
    title: "Clear Documentation Rules",
    description:
      "Requirements vary by state. Useful records generally identify you, the treating professional or facility, and the relevant condition or treatment.",
  },
  {
    icon: Clock,
    title: "No False Approval Promise",
    description:
      "Screening and intake are not approval. Timing depends on documentation, provider review, and state requirements.",
  },
  {
    icon: Stethoscope,
    title: "Independent Licensed Clinicians",
    description:
      "Clinical decisions are made by independent, appropriately licensed physicians or optometrists—not by this website.",
  },
  {
    icon: BadgeCheck,
    title: "State-Specific Guidance",
    description:
      "State rules differ and can change. Confirm final filing, vehicle, and enforcement requirements with the relevant authority.",
  },
  {
    icon: CheckCircle,
    title: "MyEyeRx Partnership",
    description:
      "MyEyeRx is the official partner for consultation booking, referrals, and administrative follow-up.",
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
    a: "Light-sensitive symptoms and medical histories vary. Selecting a condition only allows you to continue an initial screening; an independent licensed clinician makes the final clinical decision under the applicable state rules.",
  },
  {
    q: "How long does the process take?",
    a: "Timing varies with document completeness, provider availability, and state-specific requirements. MyEyeRx will contact you if more information is needed; no approval or delivery time is guaranteed.",
  },
  {
    q: "Do I need to visit a doctor in person?",
    a: "The intake starts online. The reviewing provider determines the appropriate consultation and whether any additional or in-person care is needed.",
  },
  {
    q: "What if I don't qualify?",
    a: "Qualification is not guaranteed. Review the current refund policy before purchase or contact MyEyeRx at 734-338-8453 for an answer about your specific situation.",
  },
  {
    q: "Is a medical tint exemption legal?",
    a: "Many jurisdictions have a medical-exemption process, but the rules, forms, windows, filing steps, and enforcement treatment vary. Confirm current requirements with the relevant state authority. This site does not provide legal advice or guarantee acceptance.",
  },
  {
    q: "How dark can I tint my windows?",
    a: "Do not assume an exemption permits any particular tint percentage or window. Follow the reviewing clinician's documentation and the current rules of the relevant state authority and law enforcement.",
  },
  {
    q: "Do I need to register with the DMV?",
    a: "This depends on the state and can change. Use the current instructions from the relevant agency; MyEyeRx can help you understand the next administrative step after review.",
  },
  {
    q: "Is my information secure?",
    a: "The intake uses access controls, upload validation, and Stripe-hosted card entry. Personal information is shared only as described in the Privacy Policy, including with service providers needed to process the intake. No online system can promise absolute security.",
  },
];

export default function Home() {
  const allStates = getAllStates();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Online Tint Exemption",
    url: "https://www.onlinetintexemption.com",
    logo: "https://www.onlinetintexemption.com/logo.png",
    description:
      "State-specific education and secure intake for medical window tint exemption reviews, officially partnered with MyEyeRx.",
    telephone: "+1-734-338-8453",
    email: "Tory@myeyerx.net",
    founder: {
      "@type": "Person",
      name: "Toriano Dewberry",
      jobTitle: "Founder & Licensed Optician",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    areaServed: getAllStates().map((state) => ({
      "@type": "State",
      name: state.name,
    })),
    priceRange: "$225–$350",
    sameAs: [],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Medical Window Tint Exemption Intake Coordination",
    description:
      "State-specific education, secure intake, document collection, and consultation coordination through MyEyeRx.",
    serviceType: "Medical window tint exemption intake coordination",
    provider: {
      "@type": "Organization",
      name: "Online Tint Exemption",
      url: "https://www.onlinetintexemption.com",
    },
    offers: {
      "@type": "Offer",
      price: "225",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://www.onlinetintexemption.com/book",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.onlinetintexemption.com",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Medical Window Tint Exemption{" "}
              <span className="text-primary">Information &amp; Intake</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl">
              Review state-specific guidance and begin a secure intake. MyEyeRx
              coordinates consultation booking and referrals; an independent
              licensed clinician makes any clinical decision.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start Secure Intake
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
              <span className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">From</span>
                <span className="text-2xl font-bold text-foreground">$225</span>
                <span className="line-through text-muted-foreground">$325</span>
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
              How the Intake and Review Process Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              The process begins online. Documentation, consultation format,
              timing, and state filing steps depend on your situation.
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
              We currently issue medical tint exemptions in 32 states + DC.
              Select your state on the map below to check availability,
              pricing, and requirements.
            </p>
          </div>
          {/* Interactive Map - Desktop only */}
          <div className="mt-12 hidden lg:block">
            <USMap />
          </div>

          {/* Grid - Mobile / Tablet */}
          <div className="mt-12 lg:hidden">
            {/* Status legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-5 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Available now</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">Allowed — not offered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-muted-foreground">No exemption</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allStates.map((state) => {
                const dotColor = !state.allowsMedicalExemption
                  ? "bg-red-500"
                  : state.offered
                  ? "bg-green-500"
                  : "bg-yellow-500";
                return (
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
                    <span
                      className={`ml-auto h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`}
                      title={
                        !state.allowsMedicalExemption
                          ? "No medical exemption"
                          : state.offered
                          ? "Available now"
                          : "Exemption allowed — not offered by us"
                      }
                    />
                  </Link>
                );
              })}
            </div>
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
              <span className="text-sm font-medium text-muted-foreground">From</span>
              <span className="text-2xl font-bold text-foreground">$225</span>
              <span className="text-lg line-through text-muted-foreground">
                $325
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
