import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Dr. B - Medical Director",
  description:
    "Board-certified physician and Medical Director at Online Tint Exemption, specializing in light-sensitive medical conditions and telemedicine consultations.",
};

export default function DrBPage() {
  return (
    <>
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Dr. B</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              <div className="flex items-start gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
                  DB
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Dr. B</h1>
                  <p className="mt-1 text-lg text-primary font-medium">
                    Medical Director, Board Certified Physician
                  </p>
                </div>
              </div>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">About Dr. B</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Board-certified physician and Medical Director at Online Tint
                  Exemption, specializing in light-sensitive medical conditions
                  and telemedicine consultations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Credentials</h2>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Board Certified Physician
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Medical Director, Online Tint Exemption
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Areas of Expertise</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Telemedicine consultations",
                    "Light-sensitive medical conditions",
                    "Medical exemption evaluations",
                    "Photophobia assessment",
                    "Autoimmune conditions & sun sensitivity",
                    "Post-surgical light sensitivity",
                  ].map((area) => (
                    <div key={area} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <span className="text-sm text-card-foreground">{area}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <div className="rounded-xl border border-primary/30 bg-card p-6 text-center">
                  <h3 className="font-semibold text-card-foreground mb-2">Need a Consultation?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our team is here to help you get your medical window tint exemption.
                  </p>
                  <Link
                    href="/book"
                    className="block w-full text-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-card-foreground mb-3">Our Team</h3>
                  <div className="space-y-3">
                    <Link
                      href="/about/toriano-dewberry"
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        TD
                      </div>
                      Toriano Dewberry — Founder
                    </Link>
                    <Link
                      href="/about"
                      className="inline-flex items-center text-sm text-primary font-medium hover:underline"
                    >
                      About Online Tint Exemption <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-card-foreground">
            Trusted by Thousands of Patients
          </h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Our team of licensed professionals is dedicated to helping
            light-sensitive patients get the relief they need through legal
            medical exemptions.
          </p>
          <Link
            href="/book"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Check If You Qualify <ChevronRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
