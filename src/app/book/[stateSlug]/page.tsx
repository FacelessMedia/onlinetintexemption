import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  FileText,
  ClipboardList,
  Phone as PhoneIcon,
  Mail,
  Shield,
} from "lucide-react";
import { getStateBySlug, getAllStates } from "@/data/states";

interface PageProps {
  params: Promise<{ stateSlug: string }>;
}

export async function generateStaticParams() {
  return getAllStates()
    .filter((s) => s.offered)
    .map((s) => ({ stateSlug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const state = getStateBySlug(resolved.stateSlug);
  if (!state) return {};
  return {
    title: `Book ${state.name} Tint Exemption Consultation`,
    description: `Book your medical window tint exemption consultation for ${state.name}. Licensed physicians, $${state.price}, 24-48 hour delivery.`,
  };
}

export default async function BookStatePage({ params }: PageProps) {
  const resolved = await params;
  const state = getStateBySlug(resolved.stateSlug);
  if (!state || !state.offered) notFound();

  return (
    <>
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/book" className="hover:text-primary transition-colors">Book</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{state.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Form Area */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                {state.name} Tint Exemption
              </h1>
              <h2 className="mt-2 text-xl text-muted-foreground">
                Start Your Application
              </h2>
              <p className="mt-2 text-muted-foreground">
                Complete the form below to begin your consultation
              </p>

              {/* Documentation Warning */}
              <div className="mt-8 rounded-xl border border-secondary/30 bg-secondary/10 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      IMPORTANT: Medical Documentation Required
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You <strong className="text-foreground">MUST</strong> have medical
                      documentation of your condition to receive an exemption.
                      Our physicians practice legitimately and can only write
                      prescriptions for verified medical conditions.
                    </p>
                  </div>
                </div>

                <div className="mt-4 ml-9">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Acceptable documentation includes:
                  </div>
                  <ul className="space-y-1.5 ml-6 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Doctor&apos;s diagnosis letter or medical records
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Previous prescriptions for your condition
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Specialist referral or treatment documentation
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Hospital discharge papers mentioning your condition
                    </li>
                  </ul>
                </div>

                <div className="mt-4 ml-9 flex items-start gap-2 rounded-lg bg-background p-3 border border-border">
                  <span className="text-secondary font-bold text-sm">$25</span>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">NON-REFUNDABLE FEE:</strong> If you
                    attend your consultation WITHOUT proper medical
                    documentation, a $25 processing fee will be deducted from
                    any refund. This covers physician time and processing costs.
                  </p>
                </div>
              </div>

              {/* Form Placeholder — GHL Integration */}
              <div className="mt-8 rounded-xl border border-border bg-card p-8">
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    Booking Form
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Go High Level intake form will be embedded here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Form fields: Full Name, Email, Phone Number, Medical Condition, Documentation Upload
                  </p>

                  {/* Placeholder phone input */}
                  <div className="mt-8 max-w-md mx-auto text-left">
                    <label className="block text-sm font-medium text-card-foreground mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      We&apos;ll call this number for your consultation
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      disabled
                      className="inline-flex items-center justify-center rounded-lg bg-primary/50 px-8 py-3 text-base font-semibold text-primary-foreground cursor-not-allowed"
                    >
                      Submit Application — ${state.price}
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                  <span>•</span>
                  <Link href="/refund-policy" className="hover:text-primary transition-colors">
                    Refund Policy
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar — Order Summary */}
            <aside className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-lg font-bold text-card-foreground mb-1">
                    Order Summary
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Full refund if you don&apos;t qualify for an exemption
                  </p>

                  <div className="flex items-start gap-2 rounded-lg bg-secondary/10 border border-secondary/20 p-3 mb-4">
                    <AlertTriangle className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Bring proof of your medical condition. $25 fee applies
                      without documentation.
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <h4 className="text-sm font-semibold text-card-foreground">
                      What&apos;s Included:
                    </h4>
                    {[
                      "Phone consultation with licensed physician",
                      "Medical exemption certificate",
                      "No DMV filing needed",
                      "Lifetime customer support",
                      `Valid in ${state.name}`,
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 mb-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-foreground">${state.price}</span>
                        <span className="ml-2 text-sm line-through text-muted-foreground">${state.originalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-card-foreground">
                      What Happens Next?
                    </h4>
                    {[
                      { icon: FileText, text: "Complete this form and payment" },
                      { icon: PhoneIcon, text: "We'll call you within 24 hours for your consultation" },
                      { icon: Mail, text: "Receive your certificate via email" },
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {i + 1}
                        </span>
                        {step.text}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <p className="text-sm text-muted-foreground">Questions?</p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center text-sm text-primary font-medium mt-1 hover:underline"
                  >
                    Contact us <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
