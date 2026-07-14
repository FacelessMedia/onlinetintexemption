import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Eye, ShieldCheck, Users, ClipboardCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About Online Tint Exemption",
  description:
    "Learn how Online Tint Exemption, MyEyeRx, and independent licensed clinicians work together while maintaining clear roles.",
  alternates: { canonical: "https://www.onlinetintexemption.com/about" },
};

const roles = [
  {
    icon: Eye,
    title: "Online Tint Exemption",
    description:
      "Publishes state-focused education and provides the secure intake experience. It does not diagnose, prescribe, or promise an exemption.",
  },
  {
    icon: Users,
    title: "MyEyeRx",
    description:
      "The official partner for consultation booking, referrals, administrative coordination, and customer follow-up.",
  },
  {
    icon: ClipboardCheck,
    title: "Independent Clinicians",
    description:
      "Appropriately licensed physicians or optometrists make the clinical decision and may request more information, approve, or decline.",
  },
  {
    icon: ShieldCheck,
    title: "State Authorities",
    description:
      "Government agencies and law enforcement determine applicable forms, filing rules, tint limits, and acceptance—not this website.",
  },
] as const;

export default function AboutPage() {
  return (
    <main>
      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="font-semibold text-primary">Who we are</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Clear information, secure intake, and clearly separated roles
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Online Tint Exemption helps visitors understand state-specific
            medical window tint processes and begin an intake. MyEyeRx is our
            official consultation-booking and referral partner. Independent
            licensed clinicians—not the website or administrative staff—make
            clinical decisions.
          </p>
        </div>
      </section>

      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-card-foreground">
            What connects to what
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((role) => (
              <article key={role.title} className="rounded-xl border border-border bg-background p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <role.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{role.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{role.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">What the intake can do</h2>
            <ul className="mt-5 space-y-3 text-muted-foreground">
              <li>• Show the current service price configured for a supported state.</li>
              <li>• Collect required contact, address, condition, and documentation information.</li>
              <li>• Route complete and incomplete documentation into the appropriate follow-up path.</li>
              <li>• Send an eligible order to Stripe-hosted checkout after server-side checks.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">What it cannot promise</h2>
            <ul className="mt-5 space-y-3 text-muted-foreground">
              <li>• A diagnosis, prescription, approval, certificate, or delivery time.</li>
              <li>• That a DMV, court, officer, installer, or another state will accept a document.</li>
              <li>• A particular tint percentage, window, renewal period, or legal outcome.</li>
              <li>• That an online screening replaces medical care or legal advice.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-card-foreground">Learn more or get help</h2>
          <p className="mt-3 text-muted-foreground">
            Read how clinical review works, learn about founder Toriano Dewberry,
            or contact MyEyeRx before submitting if you are unsure about a document.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/about/clinical-providers" className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 font-semibold text-foreground hover:bg-muted">
              Clinical provider roles<ChevronRight className="ml-1 h-4 w-4" />
            </Link>
            <Link href="/about/toriano-dewberry" className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 font-semibold text-foreground hover:bg-muted">
              About Toriano<ChevronRight className="ml-1 h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
              Contact MyEyeRx<ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
