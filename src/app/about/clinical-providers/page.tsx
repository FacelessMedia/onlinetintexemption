import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Independent Clinical Providers",
  description:
    "How independent licensed clinicians participate in medical tint-exemption reviews coordinated through MyEyeRx.",
  alternates: {
    canonical:
      "https://www.onlinetintexemption.com/about/clinical-providers",
  },
};

export default function ClinicalProvidersPage() {
  return (
    <main className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/about" className="hover:text-primary">About</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Clinical Providers</span>
        </nav>

        <div className="rounded-2xl border border-border bg-card p-7 sm:p-10">
          <ShieldCheck className="h-11 w-11 text-primary" aria-hidden="true" />
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">
            Independent clinical review
          </h1>
          <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
            <p>
              Online Tint Exemption is a state-focused education and intake
              service. MyEyeRx is the official consultation-booking, referral,
              and administrative partner for applications started here.
            </p>
            <p>
              Medical evaluations and any clinical documentation are handled by
              independent, appropriately licensed physicians or optometrists.
              Those clinicians—not this website, its editorial team, or MyEyeRx
              administrative staff—make clinical decisions and may request more
              information, approve, or decline a request.
            </p>
            <p>
              We do not publish a clinician profile until the clinician&apos;s full
              name, degree, role, applicable license information, and permission
              to publish have been verified. A prior abbreviated provider page
              was retired because it did not meet that standard.
            </p>
            <p>
              An intake screening is not a diagnosis, prescription, legal
              opinion, or guarantee that an exemption will be issued or accepted
              by a government agency or law-enforcement officer.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Start the intake
            </Link>
            <a
              href="https://www.myeyerx.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 font-semibold text-foreground hover:bg-muted"
            >
              Visit MyEyeRx
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
