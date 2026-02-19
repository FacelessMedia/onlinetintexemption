import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getAllConditions } from "@/data/conditions";

export const metadata: Metadata = {
  title: "Medical Conditions That Qualify for Tint Exemptions",
  description:
    "Learn about medical conditions that qualify for window tint exemptions. Migraines, lupus, photophobia, cataracts, and more.",
};

export default function ConditionsHub() {
  const conditions = getAllConditions();

  return (
    <>
      {/* Hero */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Medical Conditions That Qualify for Tint Exemptions
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Many light-sensitive medical conditions qualify for window tint
              exemptions. Learn about your condition and how to get protected.
            </p>
          </div>
        </div>
      </section>

      {/* Conditions Grid */}
      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {conditions.map((condition) => (
              <Link
                key={condition.slug}
                href={`/conditions/${condition.slug}`}
                className="group rounded-xl border border-border bg-background p-6 hover:border-primary hover:shadow-lg transition-all"
              >
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {condition.name}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {condition.shortDescription}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                  Learn more
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Not Sure If Your Condition Qualifies?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our licensed physicians will evaluate your specific situation during
            your consultation. If you don&apos;t qualify, you get a full refund.
          </p>
          <div className="mt-8">
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start Your Application
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
