import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ChevronRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { getStateBySlug, getAllStateSlugs } from "@/data/states";

interface PageProps {
  params: Promise<{ stateSlug: string }>;
}

const SUFFIX = "-window-tint-medical-exemption";

function extractSlug(param: string): string | null {
  if (param.endsWith(SUFFIX)) {
    return param.slice(0, -SUFFIX.length);
  }
  return null;
}

export async function generateStaticParams() {
  const slugs = getAllStateSlugs();
  return slugs.map((slug) => ({
    stateSlug: `${slug}${SUFFIX}`,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const slug = extractSlug(resolved.stateSlug);
  if (!slug) return {};
  const state = getStateBySlug(slug);
  if (!state) return {};
  const canonical = `https://www.onlinetintexemption.com/${state.slug}-window-tint-medical-exemption`;
  return {
    title: `${state.name} Window Tint Medical Exemption Guide 2026`,
    description: `Get your ${state.name} medical window tint exemption online. ${state.heroDescription} Fast approval, $249 flat rate.`,
    keywords: [
      `${state.name} window tint exemption`,
      `${state.name} medical tint exemption`,
      `${state.name} tint laws`,
      `${state.name} window tint medical exemption`,
      `${state.abbreviation} tint exemption`,
      "medical window tint exemption",
      "window tint prescription",
    ],
    alternates: { canonical },
    openGraph: {
      title: `${state.name} Window Tint Medical Exemption Guide 2026`,
      description: state.heroDescription,
      url: canonical,
      siteName: "Online Tint Exemption",
      type: "article",
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: `${state.name} Window Tint Medical Exemption`,
      description: state.heroDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function StatePage({ params }: PageProps) {
  const resolved = await params;
  const slug = extractSlug(resolved.stateSlug);
  if (!slug) notFound();

  const state = getStateBySlug(slug);
  if (!state) notFound();

  const pageUrl = `https://www.onlinetintexemption.com/${state.slug}-window-tint-medical-exemption`;

  const stateSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `${state.name} Window Tint Medical Exemption Guide`,
    description: state.heroDescription,
    url: pageUrl,
    mainEntity: {
      "@type": "MedicalProcedure",
      name: `${state.name} Medical Window Tint Exemption`,
      description: state.whatIsExemption,
      howPerformed: "Remote telemedicine consultation via phone with a board-certified physician.",
      procedureType: "https://schema.org/NoninvasiveProcedure",
      provider: {
        "@type": "MedicalBusiness",
        name: "Online Tint Exemption",
        url: "https://www.onlinetintexemption.com",
        telephone: "+1-734-338-8453",
      },
      offers: {
        "@type": "Offer",
        price: "249",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `https://www.onlinetintexemption.com/book/${state.slug}`,
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.onlinetintexemption.com" },
      { "@type": "ListItem", position: 2, name: state.name, item: pageUrl },
    ],
  };

  const faqSchema = state.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: state.faq.map((f: { question: string; answer: string }) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(stateSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      {/* Hero */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{state.name}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {state.heroTitle}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {state.heroDescription}
            </p>
            <div className="mt-6">
              <Link
                href={`/book/${state.slug}`}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Your {state.abbreviation} Exemption
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Understanding Section */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Understanding Window Tint Exemptions in {state.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {state.understandingSection}
              </p>
            </section>

            {/* What Is */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                What Is a Medical Window Tint Exemption in {state.name}?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {state.whatIsExemption}
              </p>
            </section>

            {/* Tint Laws */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {state.name} Window Tint Laws in 2026
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {state.tintLawsDescription}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Front Windshield", value: state.tintLaws.frontWindshield },
                  { label: "Front Side Windows", value: state.tintLaws.frontSideWindows },
                  { label: "Back Side Windows", value: state.tintLaws.backSideWindows },
                  { label: "Rear Window", value: state.tintLaws.rearWindow },
                ].map((law) => (
                  <div
                    key={law.label}
                    className="rounded-lg border border-border bg-card p-4 text-center"
                  >
                    <div className="text-xs text-muted-foreground mb-1">{law.label}</div>
                    <div className="text-sm font-semibold text-card-foreground">{law.value}</div>
                  </div>
                ))}
              </div>
              {state.ticketFine !== "Varies" && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-secondary/30 bg-secondary/10 p-4">
                  <AlertTriangle className="h-5 w-5 text-secondary shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">Tint Ticket Fine: {state.ticketFine}</span>
                    <span className="text-muted-foreground ml-2">— Get a medical exemption to avoid costly tickets</span>
                  </div>
                </div>
              )}
            </section>

            {/* Qualifying Conditions */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Medical Conditions That Qualify for Tint Exemption in {state.name}
              </h2>
              <p className="text-muted-foreground mb-6">
                Several medical conditions can qualify individuals for a window tint exemption in {state.name}. Understanding these conditions is vital for those seeking protection from light sensitivity.
              </p>
              <div className="space-y-4">
                {state.qualifyingConditions.map((condition) => (
                  <div key={condition.name} className="rounded-lg border border-border bg-card p-5">
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">{condition.name}</h3>
                    <p className="text-sm text-muted-foreground">{condition.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/conditions/migraines" className="text-sm text-primary hover:underline">Migraines</Link>
                <Link href="/conditions/lupus" className="text-sm text-primary hover:underline">Lupus</Link>
                <Link href="/conditions/photophobia" className="text-sm text-primary hover:underline">Photophobia</Link>
              </div>
            </section>

            {/* How To */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                How to Get Your {state.name} Tint Exemption in 2026
              </h2>
              <p className="text-muted-foreground mb-6">
                Obtaining a medical tint exemption in {state.name} involves several straightforward steps.
              </p>
              <div className="space-y-6">
                {state.howToSteps.map((step, i) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <div className="text-xs text-muted-foreground">DMV Filing</div>
                  <div className="text-sm font-semibold text-card-foreground mt-1">{state.dmvFiling}</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <div className="text-xs text-muted-foreground">Exemption Duration</div>
                  <div className="text-sm font-semibold text-card-foreground mt-1">{state.exemptionDuration}</div>
                </div>
              </div>
            </section>

            {/* Pulled Over */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                What to Do If You&apos;re Pulled Over for Window Tint in {state.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {state.pulledOverAdvice}
              </p>
            </section>

            {/* Common Mistakes */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Common Mistakes to Avoid When Getting a {state.name} Tint Exemption
              </h2>
              <div className="space-y-4">
                {state.commonMistakes.map((mistake) => (
                  <div key={mistake.title} className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground">{mistake.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{mistake.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="divide-y divide-border">
                {state.faq.map((item) => (
                  <details key={item.question} className="group py-4">
                    <summary className="flex cursor-pointer items-center justify-between font-medium text-foreground">
                      {item.question}
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {/* Nearby States */}
            {state.nearbyStates.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Nearby State Exemptions</h2>
                <p className="text-muted-foreground mb-4">
                  Planning to drive in neighboring states? Check their tint exemption requirements:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {state.nearbyStates.map((nearby) => (
                    <Link
                      key={nearby.slug}
                      href={`/${nearby.slug}-window-tint-medical-exemption`}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 hover:border-primary transition-colors"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary/10 text-primary font-bold text-xs">
                        {nearby.abbreviation}
                      </span>
                      <span className="text-sm font-medium text-card-foreground">{nearby.name}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom CTA */}
            <section className="rounded-xl border border-border bg-card p-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-2">
                Get Your {state.name} Window Tint Exemption Today
              </h2>
              <p className="text-muted-foreground mb-6">
                Obtaining a window tint medical exemption in {state.name} is essential for individuals suffering from light sensitivity. Don&apos;t wait—apply for your exemption today to ensure a more pleasant driving experience.
              </p>
              <Link
                href={`/book/${state.slug}`}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-xl border border-primary/30 bg-card p-6">
                <h3 className="text-lg font-bold text-card-foreground mb-4">
                  Get Your {state.name} Exemption
                </h3>
                <ul className="space-y-3 mb-6">
                  {[
                    "Licensed physician consultation",
                    "24-hour certificate delivery",
                    "100% money-back guarantee",
                    `Valid in ${state.name}`,
                    "Secure online process",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/book/${state.slug}`}
                  className="block w-full text-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Get Started Now
                </Link>
                <p className="mt-2 text-center text-xs text-muted-foreground">Takes less than 5 minutes</p>
                <p className="mt-1 text-center text-xs text-muted-foreground">Secure • Confidential • Licensed</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold text-card-foreground mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Our support team is here to answer your questions.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center text-sm text-primary font-medium hover:underline"
                >
                  Contact Support
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
