// Shared business / legal constants for the tint-exemption sites.
//
// There is one operating business (MyEyeRx) behind every brand, including the
// multi-state onlinetintexemption.com. State-specific values (state name,
// price) come from the per-state data instead, so this file stays identical
// across the portfolio.

export const legal = {
  // The medical service provider / covered entity that operates the brand.
  providerName: "MyEyeRx",
  providerUrl: "https://myeyerx.net",
  providerShort: "MyEyeRx",

  // Public contact used on legal + privacy pages.
  contactEmail: "tory@myeyerx.net",
  privacyEmail: "tory@myeyerx.net",

  // Optional postal address for formal notices. Leave empty to hide the line.
  mailingAddress: "",

  // Effective date shown on the legal documents. Update when content changes.
  effectiveDate: "2026-06-02",

  // Compliance posture (confirmed by the business: GHL HIPAA plan active,
  // BAAs signed, attorney sign-off complete).
  hipaaCompliant: true,
} as const;

export type Legal = typeof legal;
