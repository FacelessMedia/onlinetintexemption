import { NextRequest, NextResponse } from "next/server";

// HIPAA-aware document upload endpoint.
//
// Files are streamed straight from the browser to GoHighLevel's contact-scoped
// custom-field upload endpoint (/forms/upload-custom-files). Each file is
// attached directly to the customer's contact record under the FILE_UPLOAD
// custom field "Medical Documentation" — access is gated by GHL contact-level
// permissions, NOT a public CDN URL. The file body is held in memory by this
// serverless function only for the duration of the request: never written to
// disk, never logged, never persisted on Vercel.
//
// Because the destination is contact-scoped, this endpoint REQUIRES a valid
// contactId for an existing GHL contact. The expected flow is:
//   1. Customer completes payment via /api/submit-order → contact is created
//      and contactId is returned to the browser.
//   2. Browser uploads each medical document here, passing contactId.
//   3. The success state in the booking form shows per-file upload status.

const GHL_API_KEY = process.env.GHL_API_KEY!;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID!;
// FILE_UPLOAD custom-field ID for "Medical Documentation" on the contact.
const GHL_MEDICAL_DOCS_FIELD_ID =
  process.env.GHL_MEDICAL_DOCS_FIELD_ID || "OsDZ0lLR3SytKhzcup93";
const GHL_BASE = "https://services.leadconnectorhq.com";

// Vercel serverless functions cap request body at ~4.5 MB. We enforce 4 MB
// per file so customers see a clear client-side rejection rather than an
// opaque 413 from the platform.
const MAX_FILE_BYTES = 4 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
]);

export async function POST(request: NextRequest) {
  try {
    if (!GHL_API_KEY || !GHL_LOCATION_ID || !GHL_MEDICAL_DOCS_FIELD_ID) {
      console.error(
        "upload-doc missing env: GHL_API_KEY / GHL_LOCATION_ID / GHL_MEDICAL_DOCS_FIELD_ID"
      );
      return NextResponse.json(
        { error: "File upload is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const incoming = await request.formData();
    const file = incoming.get("file");
    const contactId = String(incoming.get("contactId") || "").trim();

    if (!contactId) {
      return NextResponse.json(
        {
          error:
            "Missing contact reference. Please complete checkout before uploading documents.",
        },
        { status: 400 }
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

    if (file.type && !ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload a PDF, JPG, PNG, or HEIC.",
        },
        { status: 415 }
      );
    }

    // Sanitize the original filename for the multipart Content-Disposition.
    const safeName = (file.name || "document")
      .replace(/[^A-Za-z0-9._-]/g, "_")
      .slice(0, 120);

    // Per GHL /forms/upload-custom-files docs: the files need a buffer keyed
    // as "<custom_field_id>_<file_id>". We use a fresh UUID per file so
    // multiple uploads accumulate on the contact's custom field.
    const fileFieldId = `${GHL_MEDICAL_DOCS_FIELD_ID}_${crypto.randomUUID()}`;
    const ghlForm = new FormData();
    ghlForm.append(fileFieldId, file, safeName);

    const url = new URL(`${GHL_BASE}/forms/upload-custom-files`);
    url.searchParams.set("contactId", contactId);
    url.searchParams.set("locationId", GHL_LOCATION_ID);

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: "2021-07-28",
      },
      body: ghlForm,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        "GHL custom-field upload failed:",
        res.status,
        errText.slice(0, 400)
      );
      return NextResponse.json(
        {
          error:
            "We couldn't upload that file. Please try again or contact support.",
          detail: `ghl_status=${res.status} ghl_body=${errText.slice(0, 400)}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName: safeName,
      size: file.size,
      contentType: file.type || "application/octet-stream",
    });
  } catch (err) {
    console.error("upload-doc unhandled error:", err);
    return NextResponse.json(
      { error: "Unexpected error during upload. Please try again." },
      { status: 500 }
    );
  }
}
