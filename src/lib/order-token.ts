import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";

const TOKEN_VERSION = 1;
const DEFAULT_TTL_SECONDS = 30 * 60;

export interface OrderTokenPayload {
  v: number;
  iat: number;
  exp: number;
  jti: string;
  contactId: string;
  opportunityId: string;
  stateSlug: string;
  stateName: string;
  priceDollars: number;
  siteName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

type NewOrderTokenPayload = Omit<OrderTokenPayload, "v" | "iat" | "exp" | "jti">;

function getEncryptionKey(): Buffer {
  const secret = process.env.ORDER_TOKEN_SECRET || "";
  if (secret.length < 32) {
    throw new Error("ORDER_TOKEN_SECRET must be at least 32 characters");
  }
  return createHash("sha256").update(secret).digest();
}

function stableUuidV4(identity: string): string {
  if (!identity.trim()) throw new Error("Stable order identity is required");
  const bytes = Buffer.from(
    createHmac("sha256", getEncryptionKey())
      .update(`tint-order-jti:${identity}`)
      .digest()
      .subarray(0, 16)
  );
  // Preserve the UUID-v4/variant shape required by the central webhook while
  // deriving it deterministically from this exact scoped submission.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function issueOrderToken(
  data: NewOrderTokenPayload,
  stableIdentity: string
): string {
  const now = Math.floor(Date.now() / 1000);
  const configuredTtl = Number(process.env.ORDER_TOKEN_TTL_SECONDS || "");
  const ttl = Number.isFinite(configuredTtl) && configuredTtl >= 300
    ? Math.min(configuredTtl, 60 * 60)
    : DEFAULT_TTL_SECONDS;
  const payload: OrderTokenPayload = {
    ...data,
    v: TOKEN_VERSION,
    iat: now,
    exp: now + ttl,
    jti: stableUuidV4(stableIdentity),
  };

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  cipher.setAAD(Buffer.from(`tint-order-v${TOKEN_VERSION}`));
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    `v${TOKEN_VERSION}`,
    iv.toString("base64url"),
    ciphertext.toString("base64url"),
    authTag.toString("base64url"),
  ].join(".");
}

export function verifyOrderToken(token: string): OrderTokenPayload {
  if (!token || token.length > 4_096) throw new Error("Invalid order session");
  const [version, encodedIv, encodedCiphertext, encodedAuthTag, extra] = token.split(".");
  if (
    version !== `v${TOKEN_VERSION}` ||
    !encodedIv ||
    !encodedCiphertext ||
    !encodedAuthTag ||
    extra
  ) {
    throw new Error("Invalid order session");
  }

  let payload: OrderTokenPayload;
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(encodedIv, "base64url")
    );
    decipher.setAAD(Buffer.from(`tint-order-v${TOKEN_VERSION}`));
    decipher.setAuthTag(Buffer.from(encodedAuthTag, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(encodedCiphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    payload = JSON.parse(plaintext);
  } catch {
    throw new Error("Invalid order session");
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    payload.v !== TOKEN_VERSION ||
    !payload.jti ||
    !payload.contactId ||
    !payload.opportunityId ||
    !payload.stateSlug ||
    !payload.siteName ||
    !Number.isFinite(payload.priceDollars) ||
    payload.iat > now + 60 ||
    payload.exp < now
  ) {
    throw new Error(payload.exp < now ? "Order session expired" : "Invalid order session");
  }
  return payload;
}
