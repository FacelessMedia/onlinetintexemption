import Link from "next/link";
import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, HelpCircle, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact MyEyeRx Support",
  description:
    "Contact MyEyeRx, the official consultation-booking and referral partner for Online Tint Exemption.",
  alternates: {
    canonical: "https://www.onlinetintexemption.com/contact",
  },
};

const methods = [
  {
    icon: Phone,
    title: "Call MyEyeRx",
    description: "Questions about documents, intake, or next steps",
    action: "734-338-8453",
    href: "tel:+17343388453",
  },
  {
    icon: Mail,
    title: "Email MyEyeRx",
    description: "Do not attach medical records to ordinary email",
    action: "Tory@myeyerx.net",
    href: "mailto:Tory@myeyerx.net",
  },
  {
    icon: MessageCircle,
    title: "Support Assistant",
    description: "General process questions only; never paste medical records or payment data",
    action: "Open the chat button",
    href: "#support-chat",
  },
  {
    icon: HelpCircle,
    title: "Quick Answers",
    description: "Read general answers about the intake and review process",
    action: "Visit FAQ",
    href: "/faq",
  },
] as const;

export default function ContactPage() {
  return (
    <main>
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Contact MyEyeRx support
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            MyEyeRx is the official consultation-booking, referral, and
            administrative partner for applications started on this site. For
            medical decisions, an independent licensed provider will review the
            appropriate information.
          </p>
        </div>
      </section>

      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {methods.map((method) => {
            const content = (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <method.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">{method.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{method.description}</p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                  {method.action}<ChevronRight className="ml-1 h-4 w-4" />
                </span>
              </>
            );
            return method.href.startsWith("/") ? (
              <Link key={method.title} href={method.href} className="rounded-xl border border-border bg-background p-6 hover:border-primary">
                {content}
              </Link>
            ) : (
              <a key={method.title} href={method.href} className="rounded-xl border border-border bg-background p-6 hover:border-primary">
                {content}
              </a>
            );
          })}
        </div>
      </section>

      <section className="bg-background py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-6 text-sm leading-relaxed text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
            Use the secure intake uploader for supporting medical documents.
            Please do not send medical records, a full date of birth, a full
            residential address, card information, or government identification
            through ordinary email or chat.
          </div>
        </div>
      </section>
    </main>
  );
}
