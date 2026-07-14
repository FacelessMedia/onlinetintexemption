import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";

const RECEIPT_VERSION = 1;
const DEFAULT_TTL_SECONDS = 30 * 60;

export interface UploadReceiptSubject {
  orderJti: string;
  contactId: string;
  siteName: string;
}

interface UploadReceiptPayload {
  v: number;
  iat: number;
  exp: number;
  receiptJti: string;
  orderJti: string;
  contactBinding: string;
  siteBinding: string;
}

function getSecret(): string {
  const secret =
    process.env.UPLOAD_RECEIPT_SECRET || process.env.ORDER_TOKEN_SECRET || "";
  if (secret.length < 32) {
    throw new Error("UPLOAD_RECEIPT_SECRET or ORDER_TOKEN_SECRET must be at least 32 characters");
  }
  return secret;
}

function binding(label: string, value: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`${label}:${value}`)
    .digest("base64url");
}

function signature(value: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(value).digest();
}

export function issueUploadReceipt(
  subject: UploadReceiptSubject,
  nowSeconds = Math.floor(Date.now() / 1000)
): string {
  if (!subject.orderJti || !subject.contactId || !subject.siteName) {
    throw new Error("Invalid upload receipt subject");
  }
  const secret = getSecret();
  const configuredTtl = Number(process.env.UPLOAD_RECEIPT_TTL_SECONDS || "");
  const ttl = Number.isFinite(configuredTtl) && configuredTtl >= 60
    ? Math.min(configuredTtl, 30 * 60)
    : DEFAULT_TTL_SECONDS;
  const payload: UploadReceiptPayload = {
    v: RECEIPT_VERSION,
    iat: nowSeconds,
    exp: nowSeconds + ttl,
    receiptJti: randomUUID(),
    orderJti: subject.orderJti,
    contactBinding: binding("contact", subject.contactId, secret),
    siteBinding: binding("site", subject.siteName, secret),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signedValue = `ur${RECEIPT_VERSION}.${encodedPayload}`;
  return `${signedValue}.${signature(signedValue, secret).toString("base64url")}`;
}

export function verifyUploadReceipt(
  receipt: string,
  expected: UploadReceiptSubject,
  nowSeconds = Math.floor(Date.now() / 1000)
): void {
  if (!receipt || receipt.length > 2_048) throw new Error("Invalid upload receipt");
  const [version, encodedPayload, encodedSignature, extra] = receipt.split(".");
  if (
    version !== `ur${RECEIPT_VERSION}` ||
    !encodedPayload ||
    !encodedSignature ||
    !/^[A-Za-z0-9_-]+$/.test(encodedPayload) ||
    !/^[A-Za-z0-9_-]+$/.test(encodedSignature) ||
    extra
  ) {
    throw new Error("Invalid upload receipt");
  }

  const secret = getSecret();
  const expectedSignature = signature(`${version}.${encodedPayload}`, secret);
  let suppliedSignature: Buffer;
  try {
    suppliedSignature = Buffer.from(encodedSignature, "base64url");
  } catch {
    throw new Error("Invalid upload receipt");
  }
  if (
    suppliedSignature.toString("base64url") !== encodedSignature ||
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    throw new Error("Invalid upload receipt");
  }

  let payload: UploadReceiptPayload;
  try {
    const payloadBytes = Buffer.from(encodedPayload, "base64url");
    if (payloadBytes.toString("base64url") !== encodedPayload) {
      throw new Error("Non-canonical upload receipt");
    }
    payload = JSON.parse(payloadBytes.toString("utf8")) as UploadReceiptPayload;
  } catch {
    throw new Error("Invalid upload receipt");
  }

  if (
    payload.v !== RECEIPT_VERSION ||
    !payload.receiptJti ||
    payload.orderJti !== expected.orderJti ||
    payload.contactBinding !== binding("contact", expected.contactId, secret) ||
    payload.siteBinding !== binding("site", expected.siteName, secret) ||
    !Number.isFinite(payload.iat) ||
    !Number.isFinite(payload.exp) ||
    payload.iat > nowSeconds + 60 ||
    payload.exp <= payload.iat
  ) {
    throw new Error("Invalid upload receipt");
  }
  if (payload.exp < nowSeconds) throw new Error("Upload receipt expired");
}
