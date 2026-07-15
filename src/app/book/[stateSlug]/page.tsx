import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getStateBySlug, getAllStates } from "@/data/states";
import { BookingForm } from "@/components/booking-form";
import { DocsExplainer } from "@/components/docs-explainer";

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
    description: `Start a $${state.price} ${state.name} medical window tint exemption intake coordinated by MyEyeRx. Timing and clinical decisions vary.`,
    robots: { index: false, follow: true },
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

          <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {state.name} Tint Exemption
            </h1>
            <p className="mt-2 text-muted-foreground">
              Complete the form below to begin your medical exemption
              intake. MyEyeRx coordinates review by an independent licensed
              provider. Timing depends on document completeness, provider
              availability, and state-specific requirements.
            </p>

            <div className="mt-8">
              <DocsExplainer />
              <BookingForm
                stateName={state.name}
                stateSlug={state.slug}
                price={state.price}
                originalPrice={state.originalPrice}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
