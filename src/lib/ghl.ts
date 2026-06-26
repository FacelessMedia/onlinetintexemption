/**
 * Shared GoHighLevel (LeadConnector) helpers.
 *
 * Centralizes the GHL REST calls used across the booking flow so that
 * /api/submit-order (lead capture), /api/create-checkout (payment gate),
 * /api/stripe-webhook (paid status), and /api/upload-doc (HIPAA docs) all
 * talk to the same location with identical auth + field mappings.
 *
 * All values come from env so the same code ships to every site:
 *   GHL_API_KEY          Location-level private token (Bearer)
 *   GHL_LOCATION_ID      Sub-account id
 *   GHL_PIPELINE_ID      Opportunities pipeline id
 *   GHL_STAGE_INFO_SUBMITTED  Stage for a brand-new lead (pre-payment)
 *   GHL_STAGE_DOCS_SUBMITTED  Stage for a paid customer who uploaded docs
 *   GHL_STAGE_NO_DOCS         Stage for a paid customer with no docs yet
 *   GHL_STAGE_NEEDS_DOCS      Stage for an UNPAID lead blocked on docs ($250+)
 *   GHL_MEDICAL_DOCS_FIELD_ID FILE_UPLOAD custom field id ("Medical Documentation")
 *   SITE_NAME                 Source/tag stamp
 */

export const GHL_BASE = "https://services.leadconnectorhq.com";

export const GHL_MEDICAL_DOCS_FIELD_ID =
  process.env.GHL_MEDICAL_DOCS_FIELD_ID || "OsDZ0lLR3SytKhzcup93";

// Tags written by the flow (also used by GHL automations for follow-up).
export const GHL_TAGS = {
  intake: "website-intake",
  docsUploaded: "docs-uploaded",
  checkoutStarted: "checkout-started",
  needsDocs: "needs-docs-followup",
  paid: "paid",
} as const;

export const ghlConfig = {
  apiKey: process.env.GHL_API_KEY || "",
  locationId: process.env.GHL_LOCATION_ID || "",
  pipelineId: process.env.GHL_PIPELINE_ID || "",
  // Stage fallbacks keep the flow working even if the optional stage env vars
  // aren't set on a given project: a brand-new lead falls back to NO_DOCS, and
  // the unpaid "needs docs" lead also falls back to NO_DOCS.
  stageInfoSubmitted:
    process.env.GHL_STAGE_INFO_SUBMITTED || process.env.GHL_STAGE_NO_DOCS || "",
  stageDocsSubmitted: process.env.GHL_STAGE_DOCS_SUBMITTED || "",
  stageNoDocs: process.env.GHL_STAGE_NO_DOCS || "",
  stageNeedsDocs:
    process.env.GHL_STAGE_NEEDS_DOCS || process.env.GHL_STAGE_NO_DOCS || "",
  siteName: process.env.SITE_NAME || "online-tint-exemption",
};

// GHL contact custom-field IDs — mapped from the (shared) location's custom
// fields. Identical across the portfolio because every site uses the same
// GoHighLevel location.
export const GHL_FIELDS = {
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

export async function ghlFetch(path: string, options: RequestInit = {}) {
  return fetch(`${GHL_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${ghlConfig.apiKey}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
      ...((options.headers as Record<string, string>) || {}),
    },
  });
}

export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
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
  docUploadChoice: string;
}

/**
 * Upsert the lead's contact. Uses /contacts/upsert because the location dedups
 * on phone (a plain POST would 400 for households sharing a number). Returns the
 * contactId. Throws on failure — we never proceed to payment without a record.
 */
export async function upsertContact(data: ContactInput): Promise<string> {
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

  const upsertPayload = {
    locationId: ghlConfig.locationId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    source: ghlConfig.siteName,
    tags: [
      ghlConfig.siteName,
      GHL_TAGS.intake,
      data.docUploadChoice === "now" ? "docs-pending-upload" : "docs-later",
    ],
    customFields,
  };

  const res = await ghlFetch("/contacts/upsert", {
    method: "POST",
    body: JSON.stringify(upsertPayload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ghl-contact upsert failed status=${res.status} body=${errText.slice(0, 400)}`);
  }

  const upserted = await res.json();
  const contactId = upserted?.contact?.id || upserted?.id || upserted?.contactId;
  if (!contactId) {
    throw new Error(`ghl-contact upsert returned no id: ${JSON.stringify(upserted).slice(0, 300)}`);
  }
  return contactId;
}

export async function addTagToContact(contactId: string, tag: string) {
  return ghlFetch(`/contacts/${contactId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tags: [tag] }),
  });
}

/**
 * Upsert (create or update) the opportunity. /opportunities/upsert avoids the
 * 400 "Can not create duplicate opportunity" for returning customers. Returns
 * the opportunity id, or undefined on failure (callers treat this best-effort).
 */
export async function upsertOpportunity(
  contactId: string,
  name: string,
  priceDollars: number,
  stageId: string,
  status: "open" | "won" | "lost" = "open"
): Promise<string | undefined> {
  const payload: Record<string, unknown> = {
    pipelineId: ghlConfig.pipelineId,
    locationId: ghlConfig.locationId,
    contactId,
    name,
    status,
    source: ghlConfig.siteName,
    monetaryValue: priceDollars,
  };
  if (stageId) payload.pipelineStageId = stageId;

  const res = await ghlFetch("/opportunities/upsert", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error("GHL upsert opportunity error:", res.status, await res.text().catch(() => ""));
    return undefined;
  }
  const json = await res.json();
  return json.opportunity?.id || json.id;
}

/** Move an existing opportunity to a stage (and optionally set status). */
export async function moveOpportunityStage(
  opportunityId: string,
  stageId: string,
  status?: "open" | "won" | "lost"
) {
  if (!opportunityId || !stageId) return;
  const payload: Record<string, unknown> = { pipelineStageId: stageId };
  if (status) payload.status = status;
  const res = await ghlFetch(`/opportunities/${opportunityId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error("GHL move opportunity stage error:", res.status, await res.text().catch(() => ""));
  }
}

/**
 * Server-side proof that the lead has uploaded medical docs. Returns true if
 * the contact carries the docs-uploaded tag OR the FILE_UPLOAD custom field is
 * non-empty. This is the authoritative check behind the $250+ payment gate — it
 * cannot be bypassed by the client. Fails CLOSED (returns false) on read error.
 */
export async function contactHasDocs(contactId: string): Promise<boolean> {
  try {
    const res = await ghlFetch(`/contacts/${contactId}`);
    if (!res.ok) return false;
    const json = await res.json();
    const contact = json?.contact || json;

    const tags: string[] = Array.isArray(contact?.tags) ? contact.tags : [];
    if (tags.includes(GHL_TAGS.docsUploaded)) return true;

    const fields: Array<{ id?: string; value?: unknown }> =
      contact?.customFields || contact?.customField || [];
    const docField = fields.find((f) => f.id === GHL_MEDICAL_DOCS_FIELD_ID);
    if (docField) {
      const v = docField.value;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "string") return v.trim().length > 0;
      return !!v;
    }
    return false;
  } catch (err) {
    console.error("contactHasDocs read error:", err);
    return false;
  }
}
