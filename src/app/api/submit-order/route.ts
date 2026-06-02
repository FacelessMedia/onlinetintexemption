import { NextRequest, NextResponse } from "next/server";
import { getStateBySlug } from "@/data/states";

const GHL_API_KEY = process.env.GHL_API_KEY!;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID!;
const GHL_PIPELINE_ID = process.env.GHL_PIPELINE_ID!;
const GHL_STAGE_DOCS_SUBMITTED = process.env.GHL_STAGE_DOCS_SUBMITTED!;
const GHL_STAGE_NO_DOCS = process.env.GHL_STAGE_NO_DOCS!;
const SITE_NAME = process.env.SITE_NAME || "online-tint-exemption";
const GHL_BASE = "https://services.leadconnectorhq.com";

// Clover (production)
const CLOVER_PRIVATE = process.env.CLOVER_PRIVATE!;
const CLOVER_CHARGES_URL = "https://scl.clover.com/v1/charges";
const CLOVER_TEST_MODE = process.env.CLOVER_TEST_MODE === "true";

// GHL custom field IDs — mapped from the (shared) location's custom fields.
// Identical to the single-state EMD sites because onlinetint uses the same
// GoHighLevel location.
const GHL_FIELDS = {
  state: "XYQinArWW9sHqQZMIMEL",
  medicalIssues: "oCh0o1ch55zwKdM2W0e6",
  medicalIssuesText: "2x3CtqgF32e6tZMiMH7k",
  duration: "OZVR1tucQFKB69RM0U3Z",
  frequency: "gaSMDFh4EtJ6tw9Lz5Kx",
  hasSeenDoctor: "xAGfArcF3iLVRliKmeeM",
  medications: "DLH2T0Beg09osYaySXiQ",
  drivenTinted: "tz6tTXap2lGEnARMRL5J",
  hadTinted: "MSLxqlfFvOun75DoYJHO",
  tintPercent: "oogyg75OAKYLhdvgGM9K",
  intendedDriver: "U7PA0hWgBwpKFbdPQQLH",
  licensedDriver: "pg0vaf0q4aXNiQm7rhwm",
  numVehicles: "kjrEm3wAT6gTW8A8EQcb",
  howHeard: "s5Q7T4sinBIQyh1NFjxy",
  liability: "Xasl2bCtEg8E5xeHyzZJ",
  timeZone: "X7kro9snPBsIpGjnlPaN",
  checkAllThatApply: "g9zWzdDXFsE7fodaTSRI",
  explainExemption: "1w9p2gMshNniCi269qQw",
};

interface OrderPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  condition: string;
  details: string;
  medications: string;
  duration: string;
  frequency: string;
  hasSeenDoctor: string;
  hasTintedBefore: string;
  currentTintPercent: string;
  isLicensedDriver: string;
  isIntendedDriver: string;
  numberOfVehicles: string;
  timeZone: string;
  howDidYouHear: string;
  state: string;
  // Slug is used SERVER-SIDE to look up the authoritative price — the client
  // never dictates the charge amount.
  stateSlug: string;
  docUploadChoice: string;
  // Clover source token from iframe SDK — raw card never touches our server
  sourceToken: string;
}

// ------- GHL Helpers -------

async function ghlFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${GHL_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
      ...((options.headers as Record<string, string>) || {}),
    },
  });
  return res;
}

async function findOrCreateContact(data: OrderPayload) {
  const customFields = [
    { id: GHL_FIELDS.state, value: data.state },
    { id: GHL_FIELDS.medicalIssues, value: data.condition.split(", ") },
    { id: GHL_FIELDS.medicalIssuesText, value: data.condition },
    { id: GHL_FIELDS.duration, value: data.duration },
    { id: GHL_FIELDS.frequency, value: data.frequency },
    { id: GHL_FIELDS.hasSeenDoctor, value: data.hasSeenDoctor },
    { id: GHL_FIELDS.medications, value: data.medications },
    { id: GHL_FIELDS.drivenTinted, value: data.hasTintedBefore },
    { id: GHL_FIELDS.tintPercent, value: data.currentTintPercent },
    { id: GHL_FIELDS.intendedDriver, value: data.isIntendedDriver },
    { id: GHL_FIELDS.licensedDriver, value: data.isLicensedDriver },
    { id: GHL_FIELDS.numVehicles, value: data.numberOfVehicles },
    { id: GHL_FIELDS.howHeard, value: data.howDidYouHear },
    { id: GHL_FIELDS.liability, value: "Yes" },
    { id: GHL_FIELDS.timeZone, value: data.timeZone },
    { id: GHL_FIELDS.explainExemption, value: data.details },
  ];

  // /contacts/upsert handles email+phone dedup atomically and returns the
  // contact id either way. This location is configured with duplicate
  // detection on `phone`, so a plain POST /contacts/ would fail with HTTP 400
  // whenever a household shares a phone number.
  const upsertPayload = {
    locationId: GHL_LOCATION_ID,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    source: SITE_NAME,
    tags: [
      SITE_NAME,
      "website-intake",
      data.docUploadChoice === "now" ? "docs-uploaded" : "docs-pending",
    ],
    customFields,
  };

  const upsertRes = await ghlFetch("/contacts/upsert", {
    method: "POST",
    body: JSON.stringify(upsertPayload),
  });

  if (!upsertRes.ok) {
    const errText = await upsertRes.text();
    console.error("GHL upsert contact error:", upsertRes.status, errText);
    throw new StageError(
      "ghl-contact",
      "We couldn't sync your information to our records system. Your payment was not charged.",
      `ghl_status=${upsertRes.status} ghl_body=${errText.slice(0, 400)}`
    );
  }

  const upserted = await upsertRes.json();
  const contactId =
    upserted?.contact?.id || upserted?.id || upserted?.contactId;

  if (!contactId) {
    console.error("GHL upsert returned no contactId:", upserted);
    throw new StageError(
      "ghl-contact",
      "We couldn't sync your information to our records system. Your payment was not charged.",
      `ghl_response_missing_id: ${JSON.stringify(upserted).slice(0, 300)}`
    );
  }

  return contactId;
}

async function addTagToContact(contactId: string, tag: string) {
  await ghlFetch(`/contacts/${contactId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tags: [tag] }),
  });
}

async function createOpportunity(
  contactId: string,
  data: OrderPayload,
  priceDollars: number
) {
  // /opportunities/upsert avoids 400 "Can not create duplicate opportunity"
  // for returning customers — it creates a new opp or updates the existing
  // open one, keeping the customer in the pipeline either way.
  const oppPayload = {
    pipelineId: GHL_PIPELINE_ID,
    pipelineStageId:
      data.docUploadChoice === "now"
        ? GHL_STAGE_DOCS_SUBMITTED
        : GHL_STAGE_NO_DOCS,
    locationId: GHL_LOCATION_ID,
    contactId,
    name: `${data.firstName} ${data.lastName} - ${data.state} Tint Exemption`,
    status: "open",
    source: SITE_NAME,
    monetaryValue: priceDollars,
  };

  const res = await ghlFetch("/opportunities/upsert", {
    method: "POST",
    body: JSON.stringify(oppPayload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("GHL upsert opportunity error:", res.status, err);
    throw new Error(`Failed to upsert opportunity in GHL (status=${res.status})`);
  }

  const upserted = await res.json();
  return upserted.opportunity?.id || upserted.id;
}

// ------- Clover Charge -------

interface CloverChargeResult {
  chargeId: string;
  status: string;
  amount: number;
}

async function processCloverCharge(
  data: OrderPayload,
  amount: number,
  contactId: string | undefined,
  clientIp: string
): Promise<CloverChargeResult> {
  if (!CLOVER_PRIVATE) {
    throw new Error("Payment processor is not configured. Please contact support.");
  }

  // External reference id — Clover enforces a HARD 12-character limit.
  const externalReferenceId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  const body = {
    amount,
    currency: "usd",
    source: data.sourceToken,
    ecomind: "ecom",
    description: `Window Tint Medical Exemption - ${data.state} - ${SITE_NAME}${
      CLOVER_TEST_MODE ? " [TEST]" : ""
    }${contactId ? ` ghl=${contactId}` : ""}`,
    external_reference_id: externalReferenceId,
    receipt_email: data.email,
  };

  const res = await fetch(CLOVER_CHARGES_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${CLOVER_PRIVATE}`,
      "Content-Type": "application/json",
      // Required by Clover's /v1/charges API. Unique per logical attempt;
      // reusing the same key for a network retry prevents double charges.
      "idempotency-key": crypto.randomUUID(),
      "x-forwarded-for": clientIp,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Clover charge error:", res.status, res.statusText, errText);
    let userMsg = `Your payment could not be processed. Please check your card details and try again.`;
    let extracted: string | undefined;
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.message && typeof parsed.message === "string") {
        extracted = parsed.message;
      } else if (parsed?.error?.message && typeof parsed.error.message === "string") {
        extracted = parsed.error.message;
      } else if (parsed?.error && typeof parsed.error === "string") {
        extracted = parsed.error;
      }
    } catch {
      // not JSON
    }
    if (extracted && !/^[1-5]\d{2}\s/.test(extracted) && extracted.toLowerCase() !== "bad request") {
      userMsg = extracted;
    }
    throw new StageError(
      "clover-charge",
      userMsg,
      `clover_status=${res.status} clover_body=${errText.slice(0, 400)}`
    );
  }

  const chargeData = await res.json();
  return {
    chargeId: chargeData.id || `CLOVER-${Date.now()}`,
    status: chargeData.status || "unknown",
    amount,
  };
}

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "0.0.0.0";
}

// StageError carries the failing pipeline stage along with the user-facing
// message, so client and server logs can pinpoint exactly where things broke.
class StageError extends Error {
  stage: string;
  detail?: string;
  constructor(stage: string, message: string, detail?: string) {
    super(message);
    this.stage = stage;
    this.detail = detail;
  }
}

// ------- Main Handler -------

export async function POST(request: NextRequest) {
  let stage = "start";
  try {
    stage = "parse-body";
    const body: OrderPayload = await request.json();

    stage = "validate";
    if (!body.firstName || !body.lastName || !body.email || !body.phone) {
      return NextResponse.json(
        { error: "Missing required patient information.", stage },
        { status: 400 }
      );
    }
    if (!body.sourceToken || typeof body.sourceToken !== "string") {
      return NextResponse.json(
        { error: "Missing payment information. Please re-enter your card.", stage },
        { status: 400 }
      );
    }

    // SERVER-SIDE price lookup — the authoritative source of truth. We never
    // trust a client-sent amount for the charge.
    stage = "price-lookup";
    const stateData = getStateBySlug(body.stateSlug);
    if (!stateData || !stateData.offered || !stateData.price || stateData.price <= 0) {
      return NextResponse.json(
        {
          error:
            "We don't currently offer online exemption service for that state. Please contact support.",
          stage,
        },
        { status: 400 }
      );
    }
    const priceDollars = stateData.price;
    // Keep the displayed state name consistent with our data.
    body.state = stateData.name;

    stage = "env-check";
    const missingEnv: string[] = [];
    if (!CLOVER_PRIVATE) missingEnv.push("CLOVER_PRIVATE");
    if (!GHL_API_KEY) missingEnv.push("GHL_API_KEY");
    if (!GHL_LOCATION_ID) missingEnv.push("GHL_LOCATION_ID");
    if (!GHL_PIPELINE_ID) missingEnv.push("GHL_PIPELINE_ID");
    if (missingEnv.length > 0) {
      console.error("submit-order missing env:", missingEnv);
      throw new StageError(
        "env-check",
        "Server is not fully configured. Please contact support.",
        `missing: ${missingEnv.join(", ")}`
      );
    }

    const clientIp = getClientIp(request);
    const amount = CLOVER_TEST_MODE ? 100 : priceDollars * 100;

    // Step 1: Upsert GHL contact FIRST. We INTENTIONALLY do NOT swallow
    // failures here — if we can't sync the customer to GHL we should not
    // charge their card.
    stage = "ghl-contact";
    const contactId = await findOrCreateContact(body);

    // Step 1b: Opportunity creation IS best-effort.
    stage = "ghl-opportunity";
    try {
      await createOpportunity(contactId, body, priceDollars);
    } catch (oppErr) {
      console.error("GHL opportunity creation failed:", oppErr);
    }

    // Step 2: Process Clover charge — failures here ARE fatal, customer retries.
    stage = "clover-charge";
    const payment = await processCloverCharge(body, amount, contactId, clientIp);

    // Step 3: Tag GHL contact with payment info — best-effort, never fatal.
    stage = "ghl-tag";
    if (contactId) {
      try {
        await addTagToContact(contactId, "paid");
        await addTagToContact(contactId, `txn-${payment.chargeId}`);
      } catch (tagErr) {
        console.error("GHL tag update failed (charge succeeded):", tagErr);
      }
    }

    return NextResponse.json({
      success: true,
      chargeId: payment.chargeId,
      status: payment.status,
      amount: payment.amount,
      contactId,
    });
  } catch (err) {
    console.error(`Submit order error at stage=${stage}:`, err);
    const isStageErr = err instanceof StageError;
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json(
      {
        error: message,
        stage: isStageErr ? err.stage : stage,
        detail: isStageErr ? err.detail : undefined,
      },
      { status: 500 }
    );
  }
}
