import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getAllConditions } from "@/data/conditions";

export const metadata: Metadata = {
  title: "Medical Conditions and Window Tint Exemptions",
  description:
    "Educational information about light-sensitive symptoms, medical documentation, and state-specific window tint exemption rules.",
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
              Medical Conditions and Light Sensitivity
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Learn how light-sensitive symptoms may relate to state window tint
              exemption rules and what documentation an independent clinician may
              need to review. A diagnosis alone does not guarantee eligibility.
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
            Not Sure What Documentation You Need?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Requirements vary by state. Start the secure intake or contact us before
            paying if you have questions. Clinical decisions are made only by an
            independent licensed provider; review our refund policy for the terms
            that apply to your order.
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
