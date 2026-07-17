import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Online Tint Exemption. Learn how we collect, use, and protect your personal information.",
};

const supportChatEnabled =
  process.env.NEXT_PUBLIC_SUPPORT_CHAT_ENABLED === "true";

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
          <p><strong className="text-foreground">Effective Date:</strong> January 1, 2026</p>
          <p><strong className="text-foreground">Last Updated:</strong> July 17, 2026</p>

          <p>
            Online Tint Exemption (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to
            protecting your personal information. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you visit our website onlinetintexemption.com
            and use our services.
          </p>

          <h2 className="text-xl font-bold text-foreground pt-4">1. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Personal identification information (name, date of birth, residential address, email address, and phone number)</li>
            <li>Medical information related to your condition (as provided during consultation)</li>
            <li>Medical documentation you choose to submit through the secure uploader</li>
            <li>Payment information (processed securely through our payment provider)</li>
            <li>State of residence</li>
            <li>Usage data and analytics</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground pt-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Operate the intake and coordinate next steps with MyEyeRx and independent licensed providers</li>
            <li>Process eligible payments through Stripe</li>
            <li>Communicate with you about your application and requested documentation</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground pt-4">3. Information Security</h2>
          <p>
            We use administrative, technical, and access controls intended to protect personal
            information, including encrypted network connections where supported. No system can
            guarantee absolute security, so medical records should be submitted only through the
            secure intake uploader and never through chat or ordinary email.
          </p>

          <h2 className="text-xl font-bold text-foreground pt-4">4. Information Sharing</h2>
          <p>
            We do not sell personal information. We disclose information as needed to operate the
            requested service, including to:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>MyEyeRx for consultation-booking, referral, and administrative coordination</li>
            <li>Independent licensed providers conducting clinical review</li>
            <li>GoHighLevel for intake and customer-relationship operations</li>
            <li>Stripe for eligible payment processing</li>
            <li>Document-security and malware-scanning providers that inspect uploads before they enter our records platform</li>
            {supportChatEnabled && (
              <li>
                OpenAI for the optional automated support chat. Text typed into
                that chat may be processed under the applicable OpenAI service
                terms and account data controls. Do not enter medical records,
                dates of birth, addresses, payment details, or other sensitive
                personal information in chat.
              </li>
            )}
            <li>Hosting, security, and support vendors acting on our instructions</li>
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

        </div>
      </div>
    </section>
  );
}
