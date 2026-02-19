"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, Phone, Shield } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const popularStates = [
  { name: "Texas", slug: "texas" },
  { name: "California", slug: "california" },
  { name: "Florida", slug: "florida" },
  { name: "New York", slug: "new-york" },
  { name: "Ohio", slug: "ohio" },
  { name: "Michigan", slug: "michigan" },
];

const popularConditions = [
  { name: "Migraines", slug: "migraines" },
  { name: "Lupus", slug: "lupus" },
  { name: "Photophobia", slug: "photophobia" },
  { name: "Melanoma", slug: "melanoma" },
  { name: "Cataracts", slug: "cataracts" },
  { name: "Albinism", slug: "albinism" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [statesOpen, setStatesOpen] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar */}
      <div className="bg-primary/10 text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-1.5">
          <a
            href="tel:+17343388453"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Questions? Call (734) 338-8453</span>
          </a>
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span>Licensed Physicians · All 50 States</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              OT
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-foreground text-lg leading-tight">
                Online Tint Exemption
              </div>
              <div className="text-xs text-muted-foreground leading-tight">
                Medical Tint Exemptions
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
            >
              How It Works
            </Link>

            {/* States dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setStatesOpen(true)}
              onMouseLeave={() => setStatesOpen(false)}
            >
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted">
                States <ChevronDown className="h-4 w-4" />
              </button>
              {statesOpen && (
                <div className="absolute top-full left-0 pt-2 z-50">
                <div className="w-64 rounded-lg border border-border bg-card shadow-lg p-3">
                  <div className="grid gap-1">
                    {popularStates.map((state) => (
                      <Link
                        key={state.slug}
                        href={`/${state.slug}-window-tint-medical-exemption`}
                        className="block px-3 py-2 text-sm text-card-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        {state.name}
                      </Link>
                    ))}
                    <hr className="my-1 border-border" />
                    <Link
                      href="/#states"
                      className="block px-3 py-2 text-sm font-medium text-primary hover:bg-muted rounded-md transition-colors"
                    >
                      View All 50 States →
                    </Link>
                  </div>
                </div>
                </div>
              )}
            </div>

            {/* Conditions dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setConditionsOpen(true)}
              onMouseLeave={() => setConditionsOpen(false)}
            >
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted">
                Conditions <ChevronDown className="h-4 w-4" />
              </button>
              {conditionsOpen && (
                <div className="absolute top-full left-0 pt-2 z-50">
                <div className="w-72 rounded-lg border border-border bg-card shadow-lg p-3">
                  <div className="grid gap-1">
                    {popularConditions.map((condition) => (
                      <Link
                        key={condition.slug}
                        href={`/conditions/${condition.slug}`}
                        className="block px-3 py-2 text-sm text-card-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        {condition.name}
                      </Link>
                    ))}
                    <hr className="my-1 border-border" />
                    <Link
                      href="/conditions"
                      className="block px-3 py-2 text-sm font-medium text-primary hover:bg-muted rounded-md transition-colors"
                    >
                      View All Conditions →
                    </Link>
                  </div>
                </div>
                </div>
              )}
            </div>

            <Link
              href="/blog"
              className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
            >
              Blog
            </Link>
            <Link
              href="/faq"
              className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
            >
              FAQ
            </Link>
            <Link
              href="/about"
              className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
            >
              About
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/book"
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Your Exemption
            </Link>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted rounded-md"
            >
              How It Works
            </Link>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Popular States
            </div>
            {popularStates.map((state) => (
              <Link
                key={state.slug}
                href={`/${state.slug}-window-tint-medical-exemption`}
                onClick={() => setMobileOpen(false)}
                className="block px-6 py-2 text-sm text-card-foreground hover:bg-muted rounded-md"
              >
                {state.name}
              </Link>
            ))}
            <Link
              href="/#states"
              onClick={() => setMobileOpen(false)}
              className="block px-6 py-2 text-sm font-medium text-primary hover:bg-muted rounded-md"
            >
              View All 50 States →
            </Link>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Conditions
            </div>
            {popularConditions.map((condition) => (
              <Link
                key={condition.slug}
                href={`/conditions/${condition.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block px-6 py-2 text-sm text-card-foreground hover:bg-muted rounded-md"
              >
                {condition.name}
              </Link>
            ))}
            <Link
              href="/conditions"
              onClick={() => setMobileOpen(false)}
              className="block px-6 py-2 text-sm font-medium text-primary hover:bg-muted rounded-md"
            >
              View All Conditions →
            </Link>
            <hr className="border-border" />
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted rounded-md"
            >
              Blog
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted rounded-md"
            >
              FAQ
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted rounded-md"
            >
              About
            </Link>
            <Link
              href="/book"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Your Exemption
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
