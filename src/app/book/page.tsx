import Link from "next/link";
import type { Metadata } from "next";
import {
  ChevronRight,
  AlertTriangle,
  ClipboardList,
  FileCheck,
  Phone,
  Mail,
} from "lucide-react";
import { getOfferedStates } from "@/data/states";

export const metadata: Metadata = {
  title: "Book Your Consultation | Get Your Tint Exemption",
  description:
    "Select your state to book a medical window tint exemption consultation. Licensed physicians, all 50 states, $249.",
};

const steps = [
  { icon: ClipboardList, label: "Select State", sub: "Choose your state above" },
  { icon: FileCheck, label: "Intake Form", sub: "5-minute questionnaire" },
  { icon: Phone, label: "Phone Call", sub: "10-15 min consultation" },
  { icon: Mail, label: "Certificate", sub: "Delivered via email" },
];

export default function BookHub() {
  const states = getOfferedStates();

  return (
    <>
      {/* Hero */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Book Your Consultation
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Select your state below to get started with your medical window
              tint exemption
            </p>
          </div>
        </div>
      </section>

      {/* Warning */}
      <section className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start gap-4 rounded-xl border border-secondary/30 bg-secondary/10 p-5">
            <AlertTriangle className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Medical Documentation Required
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You must have medical proof of your condition (doctor&apos;s records,
                diagnosis letter, or prescription) to receive an exemption. Our
                physicians practice legitimately. A{" "}
                <strong className="text-foreground">$25 non-refundable fee</strong> applies
                if you attend without documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* State Selection */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-2">
            Select Your State
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Choose your state to see pricing and book your consultation
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {states.map((state) => (
              <Link
                key={state.slug}
                href={`/book/${state.slug}`}
                className="group flex items-center gap-2.5 rounded-lg border border-border bg-card p-3 hover:border-primary hover:shadow-md transition-all"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {state.abbreviation}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-card-foreground truncate">
                    {state.name}
                  </div>
                  <div className="text-xs text-muted-foreground">${state.price}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What Happens Next */}
      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-card-foreground text-center mb-10">
            What Happens Next?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.label} className="text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <step.icon className="h-7 w-7" />
                  <span className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {i + 1}
                  </span>
                </div>
                <div className="text-sm font-semibold text-card-foreground">{step.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{step.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
