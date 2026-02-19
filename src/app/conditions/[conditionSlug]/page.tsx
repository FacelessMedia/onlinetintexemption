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
  return {
    title: condition.metaTitle,
    description: condition.shortDescription,
  };
}

export default async function ConditionPage({ params }: PageProps) {
  const resolved = await params;
  const condition = getConditionBySlug(resolved.conditionSlug);
  if (!condition) notFound();

  return (
    <>
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
                Get Your Exemption
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

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
                Why {condition.name} Qualifies for a Window Tint Exemption
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {condition.whyQualifies}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                How to Get a Tint Exemption for {condition.name} in 2025
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {condition.howToGet}
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
                Questions Your Doctor May Ask About {condition.name}
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
              <h2 className="text-2xl font-bold text-foreground mb-4">Get Your Exemption by State</h2>
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
                View all 50 states <ChevronRight className="ml-1 h-4 w-4" />
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
                If you are living with {condition.name.toLowerCase()} and struggle with light sensitivity, a window tint exemption could significantly improve your driving experience. Take the first step by consulting with your healthcare provider and exploring the application process in your state. You deserve to drive safely and comfortably.
              </p>
              <Link
                href="/book"
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
                <h3 className="text-lg font-bold text-card-foreground mb-4">Get Your Exemption</h3>
                <ul className="space-y-3 mb-6">
                  {[
                    "Licensed physician consultation",
                    "24-hour certificate delivery",
                    "100% money-back guarantee",
                    "All 50 states covered",
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
                  Get Started Now
                </Link>
                <p className="mt-2 text-center text-xs text-muted-foreground">Takes less than 5 minutes</p>
                <p className="mt-1 text-center text-xs text-muted-foreground">Secure • Confidential • Licensed</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-card-foreground">Not Sure If You Qualify?</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Our physicians will evaluate your condition during the consultation.
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
