import Link from "next/link";
import { Mail, Phone, Shield, Clock, FileCheck } from "lucide-react";

const quickLinks = [
  { name: "How It Works", href: "/" },
  { name: "FAQ", href: "/faq" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Get Your Exemption", href: "/book" },
];

const popularStates = [
  { name: "Texas Tint Exemption", href: "/texas-window-tint-medical-exemption" },
  { name: "California Tint Exemption", href: "/california-window-tint-medical-exemption" },
  { name: "Florida Tint Exemption", href: "/florida-window-tint-medical-exemption" },
  { name: "New York Tint Exemption", href: "/new-york-window-tint-medical-exemption" },
  { name: "Ohio Tint Exemption", href: "/ohio-window-tint-medical-exemption" },
  { name: "Michigan Tint Exemption", href: "/michigan-window-tint-medical-exemption" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Refund Policy", href: "/refund-policy" },
  { name: "Window Tint Laws", href: "https://windowtintlaws.us", external: true },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      {/* Trust bar */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-semibold text-card-foreground">Money-Back Guarantee</div>
                <div className="text-xs text-muted-foreground">Full refund if you don&apos;t qualify</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-semibold text-card-foreground">Fast Approval</div>
                <div className="text-xs text-muted-foreground">Certificate in 24-48 hours</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-semibold text-card-foreground">All 50 States</div>
                <div className="text-xs text-muted-foreground">Licensed physicians nationwide</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                OT
              </div>
              <span className="font-bold text-lg text-card-foreground">
                Online Tint Exemption
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Get your medical window tint exemption online. Licensed physicians, fast approval, all 50 states.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:support@onlinetintexemption.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                support@onlinetintexemption.com
              </a>
              <a
                href="tel:+17343388453"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                (734) 338-8453
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-card-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular States */}
          <div>
            <h4 className="text-sm font-semibold text-card-foreground mb-4">Popular States</h4>
            <ul className="space-y-2.5">
              {popularStates.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-card-foreground mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>
              Medical Disclaimer: This service provides telemedicine consultations with licensed physicians. Exemption approval is based on medical evaluation.
            </p>
            <p className="shrink-0">© 2026 Online Tint Exemption. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
