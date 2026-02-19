import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Clock } from "lucide-react";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Toriano Dewberry - Founder & Licensed Optician",
  description:
    "Licensed optician and founder of Online Tint Exemption, dedicated to helping light-sensitive patients get the relief they deserve.",
};

export default function TorianoDewberryPage() {
  const articles = blogPosts.filter((p) => p.authorSlug === "toriano-dewberry");

  return (
    <>
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Toriano Dewberry</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main */}
            <div className="lg:col-span-2 space-y-10">
              <div className="flex items-start gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
                  TD
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                    Toriano Dewberry
                  </h1>
                  <p className="mt-1 text-lg text-primary font-medium">
                    Founder & Licensed Optician & CEO
                  </p>
                </div>
              </div>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  About Toriano Dewberry
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Licensed optician and founder of Online Tint Exemption,
                  dedicated to helping light-sensitive patients get the relief
                  they deserve through accessible telemedicine solutions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Credentials</h2>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Licensed Optician
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Founder & CEO, Online Tint Exemption
                  </li>
                </ul>
              </section>

              {articles.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Articles by Toriano Dewberry
                  </h2>
                  <div className="space-y-3">
                    {articles.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary transition-colors"
                      >
                        <span className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                          {post.title}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-4">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readTime}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
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
                      href="/about/dr-b"
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        DB
                      </div>
                      Dr. B — Medical Director
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

      {/* Trust CTA */}
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
