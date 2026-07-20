/**
 * Checked-in webhook allowlist generated from content_engine/vercel_projects.json.
 * The webhook must never read parent-workspace files at runtime.
 */
export const NATIONAL_FLEET_SITE_HOSTS = [
  "onlinetintexemption.com",
  "tintprescription.com",
  "windowtintexemption.com",
  "windowtintmedicalexemption.com",
  "windowtintprescription.com",
  "tintwaiver.com",
  "medicalexemptionforwindowtint.com",
  "medicalexemptionwindowtint.com",
  "howtogettintexemption.com",
  "tintexemption.net",
] as const;

/** The nine newly generated multi-state sites governed by the new policy matrix. */
export const NEW_NATIONAL_FLEET_SITE_HOSTS = [
  "tintprescription.com",
  "windowtintexemption.com",
  "windowtintmedicalexemption.com",
  "windowtintprescription.com",
  "tintwaiver.com",
  "medicalexemptionforwindowtint.com",
  "medicalexemptionwindowtint.com",
  "howtogettintexemption.com",
  "tintexemption.net",
] as const;

export const FLEET_SITE_HOSTS = [
  "arizonatintexemption.com",
  "arkansastintexemption.com",
  "californiatintexemption.com",
  "delawaretintexemption.com",
  "empiretintexemption.com",
  "floridatintexemption.com",
  "floridatintlaw.com",
  "floridawindowtintexemption.com",
  "georgiatintexemption.com",
  "idahotintexemption.com",
  "illinoistintexemption.com",
  "indianatintexemption.com",
  "kansastintexemption.com",
  "marylandtintwaiver.com",
  "massachusettstintexemption.com",
  "michigantintexemption.com",
  "minnesotatintexemption.com",
  "missouritintexemption.com",
  "montanatintexemption.com",
  "nctintexemption.com",
  "nevadatintexemption.com",
  "newmexicotintexemption.com",
  "newyorktintexemption.com",
  "newyorktintlaw.com",
  "newyorkwindowtintexemption.com",
  "njtintexemption.com",
  "ohiotintexemption.com",
  "oklahomatintexemption.com",
  "oregontintexemption.com",
  "patintexemption.com",
  "rhodeislandtintexemption.com",
  "southcarolinatintexemption.com",
  "sunshinestatetintexemption.com",
  "tennesseetintexemption.com",
  "texastintexemption.com",
  "virginiatintexemption.com",
  "washingtondctintexemption.com",
  "washingtontintexemption.com",
  "westvirginiatintexemption.com",
  "wisconsintintexemption.com",
  "wyomingtintexemption.com",
  ...NATIONAL_FLEET_SITE_HOSTS,
] as const;

const FLEET_SITE_SET = new Set<string>(FLEET_SITE_HOSTS);

/**
 * States whose canonical prices must remain known for legacy/dedicated-site
 * reconciliation, but which current legal research does not permit the
 * national portfolio to admit to a generic checkout.
 */
export const NATIONAL_FLEET_BLOCKED_STATE_SLUGS = [
  "california",
  "kansas",
  "oregon",
  "pennsylvania",
] as const;

const LEGACY_NATIONAL_OFFERED_STATE_SLUGS = [
  "arizona", "arkansas", "california", "florida", "georgia", "idaho",
  "illinois", "indiana", "kansas", "maryland", "michigan", "minnesota",
  "missouri", "montana", "nevada", "new-jersey", "new-mexico", "new-york",
  "north-carolina", "ohio", "oklahoma", "oregon", "pennsylvania",
  "rhode-island", "south-carolina", "tennessee", "texas", "virginia",
  "washington", "washington-dc", "west-virginia", "wisconsin", "wyoming",
] as const;

const NATIONAL_OFFERED_STATE_SLUGS = [
  "arizona", "arkansas", "florida", "georgia", "idaho",
  "illinois", "indiana", "maryland", "michigan", "minnesota",
  "missouri", "montana", "nevada", "new-jersey", "new-mexico", "new-york",
  "north-carolina", "ohio", "oklahoma", "rhode-island", "south-carolina",
  "tennessee", "texas", "virginia",
  "washington", "washington-dc", "west-virginia", "wisconsin", "wyoming",
] as const;

const NATIONAL_FLEET_SITE_STATE_SLUGS: Record<
  (typeof NATIONAL_FLEET_SITE_HOSTS)[number],
  readonly string[]
> = {
  "onlinetintexemption.com": LEGACY_NATIONAL_OFFERED_STATE_SLUGS,
  "tintprescription.com": NATIONAL_OFFERED_STATE_SLUGS,
  "windowtintexemption.com": NATIONAL_OFFERED_STATE_SLUGS,
  "windowtintmedicalexemption.com": NATIONAL_OFFERED_STATE_SLUGS,
  "windowtintprescription.com": NATIONAL_OFFERED_STATE_SLUGS,
  "tintwaiver.com": NATIONAL_OFFERED_STATE_SLUGS,
  "medicalexemptionforwindowtint.com": NATIONAL_OFFERED_STATE_SLUGS,
  "medicalexemptionwindowtint.com": NATIONAL_OFFERED_STATE_SLUGS,
  "howtogettintexemption.com": NATIONAL_OFFERED_STATE_SLUGS,
  "tintexemption.net": NATIONAL_OFFERED_STATE_SLUGS,
};

/** Exact source-host to state pairing accepted by the central Stripe webhook. */
export const FLEET_SITE_STATE_SLUGS = {
  "arizonatintexemption.com": ["arizona"],
  "arkansastintexemption.com": ["arkansas"],
  "californiatintexemption.com": ["california"],
  "delawaretintexemption.com": ["delaware"],
  "empiretintexemption.com": ["new-york"],
  "floridatintexemption.com": ["florida"],
  "floridatintlaw.com": ["florida"],
  "floridawindowtintexemption.com": ["florida"],
  "georgiatintexemption.com": ["georgia"],
  "idahotintexemption.com": ["idaho"],
  "illinoistintexemption.com": ["illinois"],
  "indianatintexemption.com": ["indiana"],
  "kansastintexemption.com": ["kansas"],
  "marylandtintwaiver.com": ["maryland"],
  "massachusettstintexemption.com": ["massachusetts"],
  "michigantintexemption.com": ["michigan"],
  "minnesotatintexemption.com": ["minnesota"],
  "missouritintexemption.com": ["missouri"],
  "montanatintexemption.com": ["montana"],
  "nctintexemption.com": ["north-carolina"],
  "nevadatintexemption.com": ["nevada"],
  "newmexicotintexemption.com": ["new-mexico"],
  "newyorktintexemption.com": ["new-york"],
  "newyorktintlaw.com": ["new-york"],
  "newyorkwindowtintexemption.com": ["new-york"],
  "njtintexemption.com": ["new-jersey"],
  "ohiotintexemption.com": ["ohio"],
  "oklahomatintexemption.com": ["oklahoma"],
  "oregontintexemption.com": ["oregon"],
  "patintexemption.com": ["pennsylvania"],
  "rhodeislandtintexemption.com": ["rhode-island"],
  "southcarolinatintexemption.com": ["south-carolina"],
  "sunshinestatetintexemption.com": ["florida"],
  "tennesseetintexemption.com": ["tennessee"],
  "texastintexemption.com": ["texas"],
  "virginiatintexemption.com": ["virginia"],
  "washingtondctintexemption.com": ["washington-dc"],
  "washingtontintexemption.com": ["washington"],
  "westvirginiatintexemption.com": ["west-virginia"],
  "wisconsintintexemption.com": ["wisconsin"],
  "wyomingtintexemption.com": ["wyoming"],
  ...NATIONAL_FLEET_SITE_STATE_SLUGS,
} as const satisfies Record<(typeof FLEET_SITE_HOSTS)[number], readonly string[]>;

export const FLEET_STATE_PRICES: Readonly<Record<string, number>> = {
  arizona: 275,
  arkansas: 225,
  california: 250,
  delaware: 250,
  florida: 250,
  georgia: 250,
  idaho: 225,
  illinois: 225,
  indiana: 250,
  kansas: 250,
  maryland: 250,
  massachusetts: 250,
  michigan: 225,
  minnesota: 225,
  missouri: 250,
  montana: 250,
  nevada: 250,
  "new-jersey": 250,
  "new-mexico": 225,
  "new-york": 350,
  "north-carolina": 250,
  ohio: 250,
  oklahoma: 250,
  oregon: 225,
  pennsylvania: 250,
  "rhode-island": 250,
  "south-carolina": 225,
  tennessee: 250,
  texas: 225,
  virginia: 250,
  washington: 225,
  "washington-dc": 250,
  "west-virginia": 250,
  wisconsin: 225,
  wyoming: 250,
};

export function normalizeFleetSiteHost(value: string): string {
  const candidate = value.trim().toLowerCase();
  if (!candidate) return "";
  try {
    const parsed = new URL(
      candidate.includes("://") ? candidate : `https://${candidate}`
    );
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password
    ) {
      return "";
    }
    const hostname = parsed.hostname.replace(/\.$/, "");
    return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  } catch {
    return "";
  }
}

export function isAllowedFleetSite(value: string): boolean {
  return FLEET_SITE_SET.has(normalizeFleetSiteHost(value));
}

export function isAllowedFleetSiteState(
  siteValue: string,
  stateSlug: string
): boolean {
  const host = normalizeFleetSiteHost(siteValue);
  if (!isAllowedFleetSite(host)) return false;
  const allowedStates = FLEET_SITE_STATE_SLUGS[
    host as keyof typeof FLEET_SITE_STATE_SLUGS
  ];
  return allowedStates.includes(
    stateSlug.trim().toLowerCase() as never
  );
}

export function getFleetStatePrice(stateSlug: string): number | undefined {
  return FLEET_STATE_PRICES[stateSlug.trim().toLowerCase()];
}
