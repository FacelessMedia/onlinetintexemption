import Link from "next/link";
import type { Metadata } from "next";
import { Mail, MessageCircle, Clock, HelpCircle, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Have questions about medical window tint exemptions? Contact our support team. We typically respond within 24 hours.",
};

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "For general inquiries and support",
    action: "support@onlinetintexemption.com",
    href: "mailto:support@onlinetintexemption.com",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our support team",
    action: "Start a chat",
    href: "#",
  },
  {
    icon: Clock,
    title: "Business Hours",
    description: "Monday - Friday: 9am - 6pm EST\nSaturday: 10am - 4pm EST\nSunday: Closed",
    action: null,
    href: null,
  },
  {
    icon: HelpCircle,
    title: "Quick Answers",
    description: "Many questions can be answered in our FAQ section.",
    action: "Visit FAQ",
    href: "/faq",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Contact Us
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Have questions? We&apos;re here to help. Reach out and our team
              will get back to you shortly.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="rounded-xl border border-border bg-background p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <method.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{method.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                  {method.description}
                </p>
                {method.action && method.href && (
                  method.href.startsWith("mailto:") || method.href.startsWith("#") ? (
                    <a
                      href={method.href}
                      className="mt-3 inline-flex items-center text-sm text-primary font-medium hover:underline"
                    >
                      {method.action}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      href={method.href}
                      className="mt-3 inline-flex items-center text-sm text-primary font-medium hover:underline"
                    >
                      {method.action}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            Send Us a Message
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            We typically respond within 24 hours
          </p>

          <div className="rounded-xl border border-border bg-card p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us more about your question..."
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <button className="w-full rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Send Message
              </button>
              <p className="text-xs text-muted-foreground text-center">
                This form will be integrated with Go High Level for lead capture.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
