import type { NextRequest } from "next/server";
import { createHmac, randomBytes } from "node:crypto";

interface MemoryRateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryRateLimits = new Map<string, MemoryRateLimitEntry>();
const localRateLimitHashSecret = randomBytes(32).toString("hex");

export function isStrictSecurityEnforcement(): boolean {
  // Production is fail-closed even if the mode was omitted or accidentally
  // left as observation. Observation mode is a local/preview rollout aid only.
  return (
    process.env.NODE_ENV === "production" ||
    process.env.SECURITY_ENFORCEMENT_MODE === "strict"
  );
}

export class RateLimitUnavailableError extends Error {
  constructor() {
    super("Rate-limit service unavailable");
    this.name = "RateLimitUnavailableError";
  }
}

export class RequestBodyError extends Error {
  readonly status: 400 | 413 | 415;

  constructor(status: 400 | 413 | 415, message: string) {
    super(message);
    this.status = status;
    this.name = "RequestBodyError";
  }
}

/**
 * Read a small JSON request without ever buffering more than maxBytes. The
 * declared length is an early rejection only; the streamed byte count remains
 * authoritative because clients can omit or forge Content-Length.
 */
export async function readBoundedJson(
  request: Request,
  maxBytes: number
): Promise<unknown> {
  const contentType = request.headers.get("content-type") || "";
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    throw new RequestBodyError(415, "Unsupported request content type");
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength) {
    if (!/^\d+$/.test(declaredLength.trim())) {
      throw new RequestBodyError(400, "Invalid request length");
    }
    if (Number(declaredLength) > maxBytes) {
      throw new RequestBodyError(413, "Request body is too large");
    }
  }

  if (!request.body) throw new RequestBodyError(400, "Invalid JSON request");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const textParts: string[] = [];
  let bytesRead = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      if (bytesRead > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError(413, "Request body is too large");
      }
      textParts.push(decoder.decode(value, { stream: true }));
    }
    textParts.push(decoder.decode());
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError(400, "Invalid JSON request");
  }

  try {
    return JSON.parse(textParts.join("")) as unknown;
  } catch {
    throw new RequestBodyError(400, "Invalid JSON request");
  }
}

export function getClientIp(request: NextRequest): string {
  const forwarded = (
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for")
  )?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Stable, non-identifying abuse signal for provider-side safety monitoring. */
export function clientSafetyIdentifier(request: NextRequest): string {
  const hashSecret =
    process.env.RATE_LIMIT_HASH_SECRET ||
    process.env.ORDER_TOKEN_SECRET ||
    localRateLimitHashSecret;
  return createHmac("sha256", hashSecret)
    .update(`support-chat|${getClientIp(request)}`)
    .digest("hex");
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfter: number }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const strict = isStrictSecurityEnforcement();
  const hashSecret =
    process.env.RATE_LIMIT_HASH_SECRET ||
    process.env.ORDER_TOKEN_SECRET ||
    localRateLimitHashSecret;
  // Hash identifiers before they leave the app. Raw IP addresses, order IDs,
  // emails, or phones must never become visible Redis keys.
  const namespacedKey = `tint:${createHmac("sha256", hashSecret)
    .update(key)
    .digest("hex")}`;

  if (redisUrl && redisToken) {
    try {
      const response = await fetch(`${redisUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", namespacedKey],
          ["EXPIRE", namespacedKey, windowSeconds, "NX"],
          ["TTL", namespacedKey],
        ]),
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
      if (!response.ok) throw new Error(`rate-limit store status=${response.status}`);
      const result = (await response.json()) as Array<{ result?: number }>;
      const count = Number(result?.[0]?.result || 0);
      const ttl = Math.max(1, Number(result?.[2]?.result || windowSeconds));
      return { allowed: count <= limit, retryAfter: ttl };
    } catch {
      console.error("Distributed rate-limit service unavailable");
      if (strict) throw new RateLimitUnavailableError();
    }
  } else if (strict) {
    throw new RateLimitUnavailableError();
  }

  const now = Date.now();
  if (memoryRateLimits.size > 5_000) {
    for (const [storedKey, entry] of memoryRateLimits) {
      if (entry.resetAt <= now) memoryRateLimits.delete(storedKey);
    }
  }
  const existing = memoryRateLimits.get(namespacedKey);
  const entry = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + windowSeconds * 1000 }
    : existing;
  entry.count += 1;
  memoryRateLimits.set(namespacedKey, entry);
  return {
    allowed: entry.count <= limit,
    retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

export async function verifyBotChallenge(
  token: string | undefined,
  request: NextRequest
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY || "";
  if (!secret) return !isStrictSecurityEnforcement();
  if (!token) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: getClientIp(request),
  });
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      }
    );
    if (!response.ok) return false;
    const result = (await response.json()) as {
      success?: boolean;
      hostname?: string;
    };
    return (
      result.success === true &&
      result.hostname === new URL(getCanonicalOrigin()).hostname
    );
  } catch {
    console.error("Turnstile verification failed");
    return false;
  }
}

export function getCanonicalOrigin(): string {
  const raw = process.env.SITE_URL || "https://www.onlinetintexemption.com";
  const parsed = new URL(raw);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new Error("SITE_URL must be a public HTTPS origin");
  }
  return parsed.origin;
}

export function isSameOriginRequest(request: NextRequest): boolean {
  const canonicalOrigin = getCanonicalOrigin();
  const supplied = request.headers.get("origin") || request.headers.get("referer");
  if (!supplied) return false;
  try {
    return new URL(supplied).origin === canonicalOrigin;
  } catch {
    return false;
  }
}

export type SecurityConfigurationScope =
  | "intake"
  | "checkout"
  | "upload"
  | "webhook"
  | "support";

/**
 * Validate only the controls an endpoint actually depends on. In particular,
 * $225 intake/checkout must not be disabled by a missing $250+ CRM stage or
 * follow-up workflow. Production still fails closed for every relevant
 * anti-bot, distributed rate-limit, webhook-idempotency, and malware control.
 */
export function securityConfigurationErrors(
  scope: SecurityConfigurationScope
): string[] {
  if (!isStrictSecurityEnforcement()) return [];
  const missing: string[] = [];

  if (!process.env.UPSTASH_REDIS_REST_URL) missing.push("UPSTASH_REDIS_REST_URL");
  if (!process.env.UPSTASH_REDIS_REST_TOKEN) missing.push("UPSTASH_REDIS_REST_TOKEN");

  if (scope !== "webhook") {
    if (!process.env.SITE_URL) {
      missing.push("SITE_URL");
    } else {
      try {
        const siteUrl = new URL(process.env.SITE_URL);
        if (
          siteUrl.protocol !== "https:" ||
          siteUrl.username ||
          siteUrl.password ||
          siteUrl.pathname !== "/" ||
          siteUrl.search ||
          siteUrl.hash
        ) {
          missing.push("SITE_URL (exact public HTTPS origin)");
        }
      } catch {
        missing.push("SITE_URL (valid URL)");
      }
    }
    if (scope !== "support") {
      if ((process.env.ORDER_TOKEN_SECRET || "").length < 32) {
        missing.push("ORDER_TOKEN_SECRET (32+ characters)");
      }
      const uploadReceiptSecret = process.env.UPLOAD_RECEIPT_SECRET;
      if (uploadReceiptSecret && uploadReceiptSecret.length < 32) {
        missing.push("UPLOAD_RECEIPT_SECRET (32+ characters when set)");
      }
    }
    if (!process.env.RATE_LIMIT_HASH_SECRET && !process.env.ORDER_TOKEN_SECRET) {
      missing.push("RATE_LIMIT_HASH_SECRET or ORDER_TOKEN_SECRET");
    }
  }

  if (scope === "intake" || scope === "support") {
    if (!process.env.TURNSTILE_SECRET_KEY) missing.push("TURNSTILE_SECRET_KEY");
    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      missing.push("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
    }
  }

  if (scope === "upload") {
    if (!process.env.MALWARE_SCAN_WEBHOOK_URL) {
      missing.push("MALWARE_SCAN_WEBHOOK_URL");
    } else {
      try {
        const scannerUrl = new URL(process.env.MALWARE_SCAN_WEBHOOK_URL);
        if (
          scannerUrl.protocol !== "https:" ||
          scannerUrl.username ||
          scannerUrl.password
        ) {
          missing.push("MALWARE_SCAN_WEBHOOK_URL (public HTTPS URL)");
        }
      } catch {
        missing.push("MALWARE_SCAN_WEBHOOK_URL (valid URL)");
      }
    }
    if (!process.env.MALWARE_SCAN_API_KEY) missing.push("MALWARE_SCAN_API_KEY");
    if (process.env.MALWARE_SCAN_REQUIRED !== "true") {
      missing.push("MALWARE_SCAN_REQUIRED=true");
    }
  }

  return missing;
}
