import { NextRequest, NextResponse } from "next/server";
import { getStateBySlug } from "@/data/states";

const GHL_API_KEY = process.env.GHL_API_KEY!;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID!;
const GHL_PIPELINE_ID = process.env.GHL_PIPELINE_ID!;
const GHL_STAGE_INFO_SUBMITTED = process.env.GHL_STAGE_INFO_SUBMITTED!;
const SITE_NAME = process.env.SITE_NAME || "online-tint-exemption";
const GHL_BASE = "https://services.leadconnectorhq.com";

// $250+ orders cannot pay until medical docs are uploaded. We surface this to
// the client so the booking form can branch into the no-docs follow-up path;
// the gate itself is ENFORCED server-side in /api/create-checkout.
const DOCS_REQUIRED_MIN_PRICE = Number(process.env.DOCS_REQUIRED_MIN_PRICE || "250");

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
  dateOfBirth: string;
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
    dateOfBirth: data.dateOfBirth,
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
    pipelineStageId: GHL_STAGE_INFO_SUBMITTED,
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
    if (!body.firstName || !body.lastName || !body.email || !body.phone || !body.dateOfBirth) {
      return NextResponse.json(
        { error: "Missing required patient information.", stage },
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

    // Whether this order must have medical docs before we can take payment.
    const requiresDocs = priceDollars >= DOCS_REQUIRED_MIN_PRICE;

    // Upsert the GHL contact FIRST. The lead is ALWAYS captured here — even a
    // $250+ applicant who never uploads docs becomes a contact we can follow up
    // with. Payment is a separate, gated step in /api/create-checkout.
    stage = "ghl-contact";
    const contactId = await findOrCreateContact(body);

    // Opportunity creation IS best-effort.
    stage = "ghl-opportunity";
    let opportunityId: string | undefined;
    try {
      opportunityId = await createOpportunity(contactId, body, priceDollars);
    } catch (oppErr) {
      console.error("GHL opportunity creation failed:", oppErr);
    }

    return NextResponse.json({
      success: true,
      contactId,
      opportunityId,
      requiresDocs,
      price: priceDollars,
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
