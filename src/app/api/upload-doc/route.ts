import { NextRequest, NextResponse } from "next/server";
import {
  addTagsToContact,
  GHL_BASE,
  ghlConfig,
  GHL_MEDICAL_DOCS_FIELD_ID,
  GHL_TAGS,
  moveOpportunityStage,
  opportunityLifecycleTag,
  removeTagFromContact,
} from "@/lib/ghl";
import { detectDocumentType, scanFileForMalware } from "@/lib/malware-scan";
import { verifyOrderToken } from "@/lib/order-token";
import { issueUploadReceipt } from "@/lib/upload-receipt";
import {
  checkRateLimit,
  getClientIp,
  isSameOriginRequest,
  securityConfigurationErrors,
} from "@/lib/request-security";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 256 * 1024;

async function restoreUploadedOpportunityStage(opportunityId: string) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await moveOpportunityStage(
        opportunityId,
        ghlConfig.stageInfoSubmitted,
        "open"
      );
      return true;
    } catch {
      console.error(`Post-upload opportunity stage attempt ${attempt} failed`);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 300));
      }
    }
  }
  return false;
}

const MIME_BY_TYPE = {
  pdf: new Set(["application/pdf", "application/octet-stream", ""]),
  jpeg: new Set(["image/jpeg", "image/jpg", "application/octet-stream", ""]),
  png: new Set(["image/png", "application/octet-stream", ""]),
} as const;

export async function POST(request: NextRequest) {
  const securityErrors = securityConfigurationErrors("upload");
  if (securityErrors.length > 0) {
    console.error("Strict security configuration is incomplete:", securityErrors);
    return NextResponse.json({ error: "Document upload is temporarily unavailable." }, { status: 503 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const ip = getClientIp(request);
  let ipRate: Awaited<ReturnType<typeof checkRateLimit>>;
  try {
    ipRate = await checkRateLimit(`upload-ip:${ip}`, 15, 10 * 60);
  } catch {
    return NextResponse.json(
      { error: "Security service is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
  if (!ipRate.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(ipRate.retryAfter) } }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  if (!/^multipart\/form-data\s*;/i.test(contentType)) {
    return NextResponse.json(
      { error: "Content-Type must be multipart/form-data." },
      { status: 415 }
    );
  }
  const rawContentLength = request.headers.get("content-length") || "";
  if (!/^\d+$/.test(rawContentLength)) {
    return NextResponse.json(
      { error: "A valid upload size is required." },
      { status: 411 }
    );
  }
  const contentLength = Number(rawContentLength);
  if (
    !Number.isSafeInteger(contentLength) ||
    contentLength <= 0 ||
    contentLength > MAX_REQUEST_BYTES
  ) {
    return NextResponse.json(
      { error: "File is too large. Maximum size is 4 MB per file." },
      { status: 413 }
    );
  }

  if (!ghlConfig.apiKey || !ghlConfig.locationId || !GHL_MEDICAL_DOCS_FIELD_ID) {
    console.error("upload-doc missing GHL configuration");
    return NextResponse.json(
      { error: "Document upload is temporarily unavailable." },
      { status: 503 }
    );
  }

  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const file = incoming.get("file");
  const rawToken = String(incoming.get("orderToken") || "");
  let order;
  try {
    order = verifyOrderToken(rawToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid order session";
    return NextResponse.json({ error: message }, { status: 401 });
  }
  if (order.siteName !== ghlConfig.siteName) {
    return NextResponse.json({ error: "Invalid order session." }, { status: 401 });
  }

  let orderRate: Awaited<ReturnType<typeof checkRateLimit>>;
  try {
    orderRate = await checkRateLimit(`upload-order:${order.jti}`, 8, 30 * 60);
  } catch {
    return NextResponse.json(
      { error: "Security service is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
  if (!orderRate.allowed) {
    return NextResponse.json(
      { error: "Upload limit reached for this application. Please contact support." },
      { status: 429, headers: { "Retry-After": String(orderRate.retryAfter) } }
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Maximum size is 4 MB per file." },
      { status: 413 }
    );
  }

  const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const detectedType = detectDocumentType(header);
  if (!detectedType || !MIME_BY_TYPE[detectedType].has(file.type)) {
    return NextResponse.json(
      { error: "The file contents do not match an allowed PDF, JPG, or PNG document." },
      { status: 415 }
    );
  }

  const safeName = (file.name || `document.${detectedType}`)
    .replace(/[^A-Za-z0-9._-]/g, "_")
    .slice(0, 120);

  try {
    await scanFileForMalware(file, safeName);

    const fileFieldId = `${GHL_MEDICAL_DOCS_FIELD_ID}_${crypto.randomUUID()}`;
    const ghlForm = new FormData();
    ghlForm.append(fileFieldId, file, safeName);
    const url = new URL(`${GHL_BASE}/forms/upload-custom-files`);
    url.searchParams.set("contactId", order.contactId);
    url.searchParams.set("locationId", ghlConfig.locationId);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ghlConfig.apiKey}`,
        Version: "2021-07-28",
      },
      body: ghlForm,
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      console.error(`GHL document upload failed status=${response.status}`);
      return NextResponse.json(
        { error: "We could not attach that document. Please try again." },
        { status: 502 }
      );
    }

    // The receipt is authoritative proof that this order—not merely a reused
    // contact with an older file—completed a successful secure upload. Issue it
    // after the file save so a stage outage never forces duplicate medical-file
    // uploads; create-checkout re-confirms the exact opportunity stage.
    const uploadReceipt = issueUploadReceipt({
      orderJti: order.jti,
      contactId: order.contactId,
      siteName: order.siteName,
    });

    const opportunityStageRestored = await restoreUploadedOpportunityStage(
      order.opportunityId
    );
    if (!opportunityStageRestored) {
      console.error("Post-upload opportunity stage is pending checkout retry");
    }

    // Contact-tag markers are best-effort after the authoritative file save and
    // required opportunity transition. A transient tag failure must never force
    // a duplicate upload.
    // Contact-wide tags and workflow membership can represent several open
    // applications. Never clear them here: doing so for this upload could make
    // another no-document opportunity disappear from outreach. Paid routing
    // remains opportunity-stage based in the Stripe webhook.
    const cleanupResults = await Promise.allSettled([
      addTagsToContact(order.contactId, [
        GHL_TAGS.docsUploaded,
        opportunityLifecycleTag(GHL_TAGS.docsUploaded, order.opportunityId),
      ]),
      removeTagFromContact(
        order.contactId,
        opportunityLifecycleTag(GHL_TAGS.needsDocs, order.opportunityId)
      ),
    ]);
    if (cleanupResults.some((result) => result.status === "rejected")) {
      console.error("Post-upload GHL lifecycle cleanup was partially unavailable");
    }

    return NextResponse.json({
      success: true,
      uploadReceipt,
      fileName: safeName,
      size: file.size,
      detectedType,
      statusPending: !opportunityStageRestored,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Document upload failed";
    // Do not log provider error objects: upload/scanner errors can contain file
    // names, request details, or other sensitive metadata.
    console.error("Secure document upload failed");
    const userMessage = /security scan|scanning|did not pass/i.test(message)
      ? message
      : "We could not finish uploading that document. Please try again.";
    return NextResponse.json({ error: userMessage }, { status: 502 });
  }
}
