import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Online Tint Exemption. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Privacy Policy</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p><strong className="text-foreground">Effective Date:</strong> January 1, 2025</p>
          <p><strong className="text-foreground">Last Updated:</strong> January 1, 2025</p>

          <p>
            Online Tint Exemption (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to
            protecting your personal information. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you visit our website onlinetintexemption.com
            and use our services.
          </p>

          <h2 className="text-xl font-bold text-foreground pt-4">1. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Personal identification information (name, email address, phone number)</li>
            <li>Medical information related to your condition (as provided during consultation)</li>
            <li>Payment information (processed securely through our payment provider)</li>
            <li>State of residence</li>
            <li>Usage data and analytics</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground pt-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Facilitate telemedicine consultations with licensed physicians</li>
            <li>Process payments and issue medical exemption certificates</li>
            <li>Communicate with you about your consultation and certificate</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground pt-4">3. Information Security</h2>
          <p>
            We implement bank-level encryption (SSL/TLS) and industry-standard security measures
            to protect your personal and medical information. Your data is transmitted and stored
            using encrypted protocols.
          </p>

          <h2 className="text-xl font-bold text-foreground pt-4">4. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties.
            Your information may be shared only with:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Licensed physicians conducting your consultation</li>
            <li>Payment processors for transaction completion</li>
            <li>As required by law or legal process</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground pt-4">5. Cookies and Tracking</h2>
          <p>
            We may use cookies and similar tracking technologies to improve your browsing experience
            and analyze site traffic. You can control cookie preferences through your browser settings.
          </p>

          <h2 className="text-xl font-bold text-foreground pt-4">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Access your personal information</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground pt-4">7. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:{" "}
            <a href="mailto:support@onlinetintexemption.com" className="text-primary hover:underline">
              support@onlinetintexemption.com
            </a>
          </p>

          <div className="rounded-lg border border-border bg-card p-4 mt-8">
            <p className="text-sm text-muted-foreground">
              <strong className="text-card-foreground">Note:</strong> This privacy policy is a template and should be
              reviewed by a legal professional before final publication.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
