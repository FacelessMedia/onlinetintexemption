import { createHmac, randomUUID } from "node:crypto";

const LOCK_TTL_SECONDS = 120;
const MAX_LOCK_ATTEMPTS = 8;

const CLAIM_SCRIPT = `
if not redis.call("GET", KEYS[1]) then
  redis.call("SET", KEYS[1], ARGV[1], "EX", tonumber(ARGV[2]))
  return 1
end
return 0
`;

const RELEASE_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
return 0
`;

type Environment = Record<string, string | undefined>;

export interface SubmittedContactIdentity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface GhlContactIdentityRecord {
  id?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  phone?: unknown;
  dateOfBirth?: unknown;
  address1?: unknown;
  city?: unknown;
  state?: unknown;
  postalCode?: unknown;
  country?: unknown;
}

export interface NormalizedContactIdentity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export class ContactIdentityConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactIdentityConfigurationError";
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeText(value: unknown): string {
  return text(value)
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2010-\u2015]/g, "-")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en-US");
}

function normalizeAddress(value: unknown): string {
  return normalizeText(value)
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeEmail(value: unknown): string {
  const email = normalizeText(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function normalizePhone(value: unknown): string {
  const raw = text(value).trim();
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (raw.startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }
  return "";
}

function validIsoDate(year: string, month: string, day: string): string {
  const iso = `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const parsed = new Date(`${iso}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso
    ? iso
    : "";
}

function normalizeDateOfBirth(value: unknown): string {
  const raw = text(value).trim();
  const yearFirst = raw.match(/^(\d{4})[-/. _](\d{1,2})[-/. _](\d{1,2})(?:T.*)?$/);
  if (yearFirst) return validIsoDate(yearFirst[1], yearFirst[2], yearFirst[3]);
  const monthFirst = raw.match(/^(\d{1,2})[-/. _](\d{1,2})[-/. _](\d{4})$/);
  if (monthFirst) return validIsoDate(monthFirst[3], monthFirst[1], monthFirst[2]);
  return "";
}

function normalizePostalCode(value: unknown): string {
  const postalCode = text(value).normalize("NFKC").toUpperCase().replace(/[\s-]/g, "");
  return /^\d{5}(?:\d{4})?$/.test(postalCode) ? postalCode : "";
}

function complete(identity: NormalizedContactIdentity): boolean {
  return Object.values(identity).every(Boolean);
}

export function normalizeSubmittedContactIdentity(
  input: SubmittedContactIdentity
): NormalizedContactIdentity | null {
  const identity = {
    firstName: normalizeText(input.firstName),
    lastName: normalizeText(input.lastName),
    email: normalizeEmail(input.email),
    phone: normalizePhone(input.phone),
    dateOfBirth: normalizeDateOfBirth(input.dateOfBirth),
    address1: normalizeAddress(
      [input.addressLine1, input.addressLine2].filter(Boolean).join(", ")
    ),
    city: normalizeText(input.city),
    state: normalizeText(input.state),
    postalCode: normalizePostalCode(input.postalCode),
    country: normalizeText(input.country || "US"),
  };
  return complete(identity) ? identity : null;
}

export function normalizeGhlContactIdentity(
  contact: GhlContactIdentityRecord
): NormalizedContactIdentity | null {
  const identity = {
    firstName: normalizeText(contact.firstName),
    lastName: normalizeText(contact.lastName),
    email: normalizeEmail(contact.email),
    phone: normalizePhone(contact.phone),
    dateOfBirth: normalizeDateOfBirth(contact.dateOfBirth),
    address1: normalizeAddress(contact.address1),
    city: normalizeText(contact.city),
    state: normalizeText(contact.state),
    postalCode: normalizePostalCode(contact.postalCode),
    country: normalizeText(contact.country),
  };
  return complete(identity) ? identity : null;
}

export function matchesExactContactIdentity(
  contact: GhlContactIdentityRecord,
  submitted: SubmittedContactIdentity
): boolean {
  const left = normalizeGhlContactIdentity(contact);
  const right = normalizeSubmittedContactIdentity(submitted);
  if (!left || !right) return false;
  return (Object.keys(right) as Array<keyof NormalizedContactIdentity>).every(
    (key) => left[key] === right[key]
  );
}

function canonicalIdentity(input: SubmittedContactIdentity): string {
  const normalized = normalizeSubmittedContactIdentity(input);
  if (!normalized) {
    throw new ContactIdentityConfigurationError("Exact contact identity is incomplete");
  }
  return JSON.stringify([
    normalized.firstName,
    normalized.lastName,
    normalized.email,
    normalized.phone,
    normalized.dateOfBirth,
    normalized.address1,
    normalized.city,
    normalized.state,
    normalized.postalCode,
    normalized.country,
  ]);
}

export function deriveContactIdentityDigest(
  input: SubmittedContactIdentity,
  secret: string
): string {
  if (Buffer.byteLength(secret, "utf8") < 32) {
    throw new ContactIdentityConfigurationError(
      "Contact identity hash secret must be at least 32 bytes"
    );
  }
  return createHmac("sha256", secret)
    .update("tint-contact-identity-v1\0")
    .update(canonicalIdentity(input))
    .digest("hex");
}

export function exactContactReuseEnabled(env: Environment = process.env): boolean {
  const mode = (env.GHL_EXACT_CONTACT_REUSE_MODE || "disabled")
    .trim()
    .toLowerCase();
  if (mode === "" || mode === "disabled") return false;
  if (mode === "enabled") return true;
  throw new ContactIdentityConfigurationError(
    "GHL_EXACT_CONTACT_REUSE_MODE must be disabled or enabled"
  );
}

function exactModeConfig(env: Environment = process.env) {
  if (!exactContactReuseEnabled(env)) {
    throw new ContactIdentityConfigurationError("Exact contact reuse is disabled");
  }
  if ((env.GHL_DUPLICATE_CONTACTS_CONFIRMED || "").toLowerCase() !== "true") {
    throw new ContactIdentityConfigurationError(
      "HighLevel duplicate contacts have not been confirmed"
    );
  }
  const secret = env.GHL_CONTACT_IDENTITY_SECRET || "";
  if (Buffer.byteLength(secret, "utf8") < 32) {
    throw new ContactIdentityConfigurationError(
      "Contact identity hash secret must be at least 32 bytes"
    );
  }
  const redisUrl = (
    env.UPSTASH_REDIS_REST_URL || env.RATE_LIMIT_REDIS_REST_URL || ""
  ).replace(/\/$/, "");
  const redisToken =
    env.UPSTASH_REDIS_REST_TOKEN || env.RATE_LIMIT_REDIS_REST_TOKEN || "";
  if (!redisUrl || !redisToken) {
    throw new ContactIdentityConfigurationError(
      "Fleet-wide contact identity lock is not configured"
    );
  }
  return { redisUrl, redisToken, secret };
}

async function redisEval(
  url: string,
  token: string,
  script: string,
  key: string,
  args: Array<string | number>
): Promise<unknown> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["EVAL", script, "1", key, ...args]),
    cache: "no-store",
    signal: AbortSignal.timeout(4_000),
  });
  if (!response.ok) throw new Error("Contact identity lock is unavailable");
  const json = (await response.json()) as { result?: unknown };
  return json.result;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Serializes exact-identity lookup/create across the entire fleet. The Redis
 * key is an HMAC digest; no name, email, phone, DOB, or address leaves the
 * process in a lock key or diagnostic message.
 */
export async function withExactContactIdentityLock<T>(
  identity: SubmittedContactIdentity,
  work: () => Promise<T>,
  env: Environment = process.env
): Promise<T> {
  const config = exactModeConfig(env);
  const digest = deriveContactIdentityDigest(identity, config.secret);
  const key = `tint:contact-identity:v1:${digest.slice(0, 48)}`;
  const owner = `owner:${randomUUID()}`;

  for (let attempt = 0; attempt < MAX_LOCK_ATTEMPTS; attempt += 1) {
    const claimed = await redisEval(
      config.redisUrl,
      config.redisToken,
      CLAIM_SCRIPT,
      key,
      [owner, LOCK_TTL_SECONDS]
    );
    if (Number(claimed) === 1) {
      try {
        return await work();
      } finally {
        try {
          await redisEval(
            config.redisUrl,
            config.redisToken,
            RELEASE_SCRIPT,
            key,
            [owner]
          );
        } catch {
          console.error("Contact identity lock release failed");
        }
      }
    }
    if (attempt < MAX_LOCK_ATTEMPTS - 1) await wait(100 * (attempt + 1));
  }
  throw new Error("Contact identity resolution is busy");
}
