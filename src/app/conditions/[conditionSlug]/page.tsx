import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, CheckCircle, HelpCircle } from "lucide-react";
import { getConditionBySlug, getAllConditionSlugs } from "@/data/conditions";

interface PageProps {
  params: Promise<{ conditionSlug: string }>;
}

export async function generateStaticParams() {
  return getAllConditionSlugs().map((slug) => ({ conditionSlug: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const condition = getConditionBySlug(resolved.conditionSlug);
  if (!condition) return {};
  const canonical = `https://www.onlinetintexemption.com/conditions/${condition.slug}`;
  return {
    title: condition.metaTitle,
    description: `${condition.shortDescription} Learn how documentation and state-specific window tint exemption rules may apply. Eligibility is not guaranteed.`,
    keywords: [
      `${condition.name} window tint exemption`,
      `${condition.name} tint exemption`,
      `${condition.name} medical exemption`,
      `${condition.name} driving`,
      "medical window tint exemption",
      "tint exemption for medical condition",
    ],
    alternates: { canonical },
    openGraph: {
      title: condition.metaTitle,
      description: condition.shortDescription,
      url: canonical,
      siteName: "Online Tint Exemption",
      type: "article",
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: condition.metaTitle,
      description: condition.shortDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ConditionPage({ params }: PageProps) {
  const resolved = await params;
  const condition = getConditionBySlug(resolved.conditionSlug);
  if (!condition) notFound();

  const pageUrl = `https://www.onlinetintexemption.com/conditions/${condition.slug}`;

  const conditionSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: condition.heroTitle,
    description: condition.heroDescription,
    url: pageUrl,
    about: {
      "@type": "MedicalCondition",
      name: condition.name,
      description: condition.understandingSection,
    },
    publisher: {
      "@type": "Organization",
      name: "Online Tint Exemption",
      url: "https://www.onlinetintexemption.com",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.onlinetintexemption.com" },
      { "@type": "ListItem", position: 2, name: "Conditions", item: "https://www.onlinetintexemption.com/conditions" },
      { "@type": "ListItem", position: 3, name: condition.name, item: pageUrl },
    ],
  };

  const faqSchema = condition.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: condition.faq.map((f: { question: string; answer: string }) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(conditionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      {/* Hero */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/conditions" className="hover:text-primary transition-colors">Conditions</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{condition.name}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {condition.heroTitle}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {condition.heroDescription}
            </p>
            <div className="mt-6">
              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start Secure Intake
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-muted-foreground">
          This page is general education, not a diagnosis, treatment plan, legal
          advice, or clinical approval. Symptoms, state rules, document
          requirements, and provider decisions vary. Confirm current legal
          requirements with the responsible state agency.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Understanding {condition.name} and Light Sensitivity
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {condition.understandingSection}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                How {condition.name} Affects Your Ability to Drive Safely
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {condition.drivingImpact}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                How State Exemption Rules May Relate to {condition.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {condition.whyQualifies}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Documentation and Application Steps for {condition.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {condition.howToGet}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Explore More Before You Apply
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {condition.name} is one of several conditions associated with light
                sensitivity. Whether it supports an exemption depends on current
                state rules, your symptoms, and an independent clinician&apos;s review.
                Browse our{" "}
                <Link href="/conditions" className="text-primary hover:underline">
                  educational condition guides
                </Link>{" "}
                to see whether others may also apply to you, review common questions
                on our{" "}
                <Link href="/faq" className="text-primary hover:underline">
                  window tint exemption FAQ
                </Link>
                , or{" "}
                <Link href="/book" className="text-primary hover:underline">
                  start your online application
                </Link>{" "}
                  to submit information for review. Online Tint Exemption handles
                  intake and payment; independent licensed providers make clinical
                  decisions through our official partner, MyEyeRx.net.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Living and Driving with {condition.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {condition.livingWith}
              </p>
            </section>

            {/* Doctor Questions */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Topics a Reviewing Provider May Consider for {condition.name}
              </h2>
              <div className="space-y-3">
                {condition.doctorQuestions.map((item, i) => (
                  <div key={i} className="flex gap-3 rounded-lg border border-border bg-card p-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{item.question}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="divide-y divide-border">
                {condition.faq.map((item) => (
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

            {/* State Links */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Review Rules by Available State</h2>
              <p className="text-muted-foreground mb-4">Select your state to learn about specific requirements:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "California", abbr: "CA", slug: "california" },
                  { name: "Florida", abbr: "FL", slug: "florida" },
                  { name: "New York", abbr: "NY", slug: "new-york" },
                  { name: "Texas", abbr: "TX", slug: "texas" },
                ].map((state) => (
                  <Link
                    key={state.slug}
                    href={`/${state.slug}-window-tint-medical-exemption`}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 hover:border-primary transition-colors"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary/10 text-primary font-bold text-xs">
                      {state.abbr}
                    </span>
                    <span className="text-sm font-medium text-card-foreground">{state.name}</span>
                  </Link>
                ))}
              </div>
              <Link href="/" className="inline-flex items-center text-sm text-primary font-medium mt-3 hover:underline">
                View available states <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </section>

            {/* Related Conditions */}
            {condition.relatedConditions.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Related Conditions</h2>
                <div className="space-y-3">
                  {condition.relatedConditions.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/conditions/${related.slug}`}
                      className="block rounded-lg border border-border bg-card p-5 hover:border-primary transition-colors"
                    >
                      <h3 className="font-semibold text-card-foreground">{related.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{related.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom CTA */}
            <section className="rounded-xl border border-border bg-card p-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-2">Take the Next Step</h2>
              <p className="text-muted-foreground mb-6">
                If you live with {condition.name.toLowerCase()} and light sensitivity,
                discuss your symptoms with your healthcare provider and review your
                state&apos;s current requirements. An exemption is not guaranteed, and
                this educational page is not medical or legal advice.
              </p>
              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start Secure Intake
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-xl border border-primary/30 bg-card p-6">
                <h3 className="text-lg font-bold text-card-foreground mb-4">Secure Intake</h3>
                <ul className="space-y-3 mb-6">
                  {[
                    "Independent provider review",
                    "State-specific intake",
                    "Published refund terms",
                    "Available states shown online",
                    "Secure online process",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/book"
                  className="block w-full text-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Start Secure Intake
                </Link>
                <p className="mt-2 text-center text-xs text-muted-foreground">Have your ID and supporting documents ready.</p>
                <p className="mt-1 text-center text-xs text-muted-foreground">Secure &bull; Private &bull; Reviewed</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-card-foreground">Not Sure If You Qualify?</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Requirements vary by state. Contact support before paying if you
                  have questions about acceptable documentation.
                </p>
                <Link href="/faq" className="inline-flex items-center text-sm text-primary font-medium hover:underline">
                  Read FAQ <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
