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
    description: state.offered
      ? `${state.name} medical window tint exemption education and secure intake. Review state guidance and the currently displayed $${state.price} service price.`
      : `${state.name} window tint laws and medical exemption info. ${state.heroDescription}`,
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
    "@type": "WebPage",
    name: `${state.name} Window Tint Medical Exemption Guide`,
    description: state.heroDescription,
    url: pageUrl,
    mainEntity: {
      "@type": "Service",
      name: `${state.name} Medical Window Tint Exemption Intake Coordination`,
      description: state.whatIsExemption,
      serviceType: "Medical window tint exemption intake coordination",
      provider: {
        "@type": "Organization",
        name: "Online Tint Exemption",
        url: "https://www.onlinetintexemption.com",
        telephone: "+1-734-338-8453",
      },
      ...(state.offered ? {
        offers: {
          "@type": "Offer",
          price: String(state.price),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `https://www.onlinetintexemption.com/book/${state.slug}`,
        },
      } : {}),
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
            {state.offered ? (
              <div className="mt-6">
                <Link
                  href={`/book/${state.slug}`}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Start Secure Intake — ${state.price}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                <p className="text-sm text-foreground font-semibold">
                  Our current service table does not accept paid intake for {state.name}. Verify the current medical-documentation pathway directly with the responsible state agency because rules can change.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            <section className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-5 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Educational information only</p>
              <p className="mt-1">
                This is not legal or medical advice and is not an official state publication. Window, vehicle, filing, documentation, and renewal rules can change. Verify current requirements with the responsible state agency before changing a vehicle. MyEyeRx coordinates intake and referral; an independent licensed clinician makes any clinical decision. No review or payment guarantees documentation, state acceptance, a particular tint level, or protection from a citation.
              </p>
            </section>
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
                    <span className="text-muted-foreground ml-2">— Educational estimate only; verify the current amount and enforcement rules with the responsible agency</span>
                  </div>
                </div>
              )}
            </section>

            {/* Qualifying Conditions */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Conditions and Symptoms That May Be Relevant in {state.name}
              </h2>
              <p className="text-muted-foreground mb-6">
                These examples may be relevant to an individualized review, but no listed condition automatically qualifies. State standards and accepted documentation vary.
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
                How to Review the {state.name} Process in 2026
              </h2>
              <p className="text-muted-foreground mb-6">
                Use these steps as a starting point, then confirm the current state and vehicle requirements with the responsible agency.
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
            {state.offered ? (
              <section className="rounded-xl border border-border bg-card p-8">
                <h2 className="text-2xl font-bold text-card-foreground mb-2">
                  Start the {state.name} Secure Intake
                </h2>
                <p className="text-muted-foreground mb-6">
                  Submit accurate screening information and relevant records for intake coordination through MyEyeRx. An independent licensed clinician decides whether the information supports medical documentation; no outcome or state acceptance is guaranteed.
                </p>
                <Link
                  href={`/book/${state.slug}`}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Start Secure Intake — ${state.price}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </section>
            ) : (
              <section className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-8">
                <h2 className="text-2xl font-bold text-card-foreground mb-2">
                  {state.name} Paid Intake Is Not Currently Available
                </h2>
                <p className="text-muted-foreground mb-4">
                  Our current service table does not accept paid intake for {state.name}. Verify the current medical-documentation pathway, vehicle restrictions, and accepted forms directly with the responsible state agency or a qualified local professional.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Contact Us With Questions
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {state.offered ? (
                <div className="rounded-xl border border-primary/30 bg-card p-6">
                  <h3 className="text-lg font-bold text-card-foreground mb-4">
                    Start {state.name} Intake
                  </h3>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Preliminary suitability screening",
                      "Secure document upload",
                      "MyEyeRx booking and referral coordination",
                      "Independent licensed clinician review",
                      "Stripe-hosted payment when eligible",
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
                    Start Intake — ${state.price}
                  </Link>
                  <p className="mt-1 text-center text-xs text-muted-foreground">Screening is not approval; state rules vary.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-yellow-500/30 bg-card p-6">
                  <h3 className="text-lg font-bold text-card-foreground mb-4">
                    State Process Information
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Paid intake is not currently available for {state.name}. Use the responsible state agency as the authoritative source for current rules and options.
                  </p>
                  <Link
                    href="/contact"
                    className="block w-full text-center rounded-lg border border-border bg-muted px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              )}

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
