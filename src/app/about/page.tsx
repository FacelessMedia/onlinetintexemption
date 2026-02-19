import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Heart, Eye, Award, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Online Tint Exemption — our mission to make medical tint exemptions accessible to everyone.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Integrity",
    description: "We only approve exemptions for legitimate medical needs. No shortcuts, no compromises.",
  },
  {
    icon: Eye,
    title: "Accessibility",
    description: "Everyone deserves access to medical care, regardless of location or schedule.",
  },
  {
    icon: Award,
    title: "Quality",
    description: "All our physicians are board-certified and licensed in the states they serve.",
  },
  {
    icon: Heart,
    title: "Care",
    description: "We treat every patient with compassion and respect their medical privacy.",
  },
];

const whyChoose = [
  "No in-person visits required",
  "Licensed physicians in all 50 states",
  "Fast 24-hour approval process",
  "100% money-back guarantee",
  "Secure & confidential",
  "Lifetime customer support",
];

const team = [
  {
    initials: "TD",
    name: "Toriano Dewberry",
    role: "Founder & Licensed Optician & CEO",
    bio: "Licensed optician dedicated to helping light-sensitive patients get the relief they deserve through accessible telemedicine solutions.",
    href: "/about/toriano-dewberry",
  },
  {
    initials: "DB",
    name: "Dr. B",
    role: "Medical Director, Board Certified Physician",
    bio: "Board-certified physician specializing in telemedicine consultations for light-sensitive medical conditions and exemption evaluations.",
    href: "/about/dr-b",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Making Medical Tint Exemptions Accessible to{" "}
              <span className="text-primary">Everyone</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              We believe that people with legitimate medical conditions
              shouldn&apos;t have to struggle to get the protection they need.
              That&apos;s why we created Online Tint Exemption.
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-card-foreground">Born from a Real Need</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Online Tint Exemption was founded when our team member struggled
                to get a medical tint exemption for their photosensitivity
                condition. The process was frustrating – multiple doctor visits,
                confusing paperwork, and weeks of waiting.
              </p>
              <p>
                We knew there had to be a better way. So we built a platform
                that connects patients directly with licensed physicians who
                specialize in these exemptions.
              </p>
              <p>
                Today, we&apos;ve helped thousands of people across all 50
                states get the legal protection they need, quickly and
                affordably.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center">What We Stand For</h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <v.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-card-foreground">
              Why People Choose Online Tint Exemption
            </h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {whyChoose.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Telemedicine */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-foreground">Telemedicine Done Right</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                We&apos;re not just another online form. Our platform connects
                you with real, licensed physicians who take the time to
                understand your condition.
              </p>
              <p>
                Every consultation is thorough, every exemption is legitimate,
                and every customer is treated with care.
              </p>
              <p>
                If you don&apos;t qualify for an exemption, we&apos;ll tell you
                honestly – and refund your money completely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-card-foreground">Meet the Team</h2>
            <p className="mt-4 text-muted-foreground">
              Dedicated professionals committed to helping light-sensitive
              patients get the care they deserve.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {team.map((member) => (
              <Link
                key={member.name}
                href={member.href}
                className="group rounded-xl border border-border bg-background p-6 hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold mb-4">
                  {member.initials}
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {member.name}
                </h3>
                <p className="text-sm text-primary font-medium mt-1">{member.role}</p>
                <p className="text-sm text-muted-foreground mt-3">{member.bio}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground">Ready to Get Your Exemption?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who got their medical tint
            exemption through Online Tint Exemption.
          </p>
          <div className="mt-8">
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
