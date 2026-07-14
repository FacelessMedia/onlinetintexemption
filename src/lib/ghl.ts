/**
 * Shared GoHighLevel (LeadConnector) helpers.
 *
 * Centralizes the GHL REST calls used across the booking flow so that
 * /api/submit-order (lead capture), /api/create-checkout (payment gate),
 * /api/stripe-webhook (paid status), and /api/upload-doc (medical documents) all
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

import { requiresDocumentsForPrice } from "./docs-policy.ts";
import {
  claimNotificationLock,
  finishNotificationLock,
  releaseNotificationLock,
} from "./notification-lock.ts";

export const GHL_BASE = "https://services.leadconnectorhq.com";

export const GHL_MEDICAL_DOCS_FIELD_ID =
  process.env.GHL_MEDICAL_DOCS_FIELD_ID || "OsDZ0lLR3SytKhzcup93";

// Tags written by the flow (also used by GHL automations for follow-up).
export const GHL_TAGS = {
  intake: "website-intake",
  docsPendingUpload: "docs-pending-upload",
  docsLater: "docs-later",
  docsUploaded: "docs-uploaded",
  checkoutStarted: "checkout-started",
  needsDocs: "needs-docs-followup",
  missingDocsNotified: "missing-docs-internal-email-queued",
  paid: "paid",
} as const;

/**
 * Contact tags are shared by every application on that contact. Suffix any
 * per-application marker with the opportunity id so one upload cannot clear or
 * mislabel a different open application.
 */
export function opportunityLifecycleTag(prefix: string, opportunityId: string) {
  const safeOpportunityId = opportunityId
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(-32);
  if (!safeOpportunityId) throw new Error("Invalid opportunity lifecycle tag");
  return `${prefix}-${safeOpportunityId}`;
}

export const ghlConfig = {
  apiKey: process.env.GHL_API_KEY || "",
  locationId: process.env.GHL_LOCATION_ID || "",
  pipelineId: process.env.GHL_PIPELINE_ID || "",
  stageInfoSubmitted: process.env.GHL_STAGE_INFO_SUBMITTED || "",
  stageDocsSubmitted: process.env.GHL_STAGE_DOCS_SUBMITTED || "",
  stageNoDocs: process.env.GHL_STAGE_NO_DOCS || "",
  stageNeedsDocs:
    process.env.GHL_STAGE_NEEDS_DOCS || process.env.GHL_STAGE_INFO_SUBMITTED || "",
  internalNotificationContactId:
    process.env.GHL_INTERNAL_NOTIFICATION_CONTACT_ID || "",
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
    signal: options.signal ?? AbortSignal.timeout(12_000),
  });
}

export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  state: string;
  stateCode: string;
  conditions: string[];
  otherCondition: string;
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
  const conditionSummary = data.conditions
    .map((condition) =>
      condition === "Other" && data.otherCondition.trim()
        ? `Other: ${data.otherCondition.trim()}`
        : condition
    )
    .join(", ");
  const customFields = [
    { id: GHL_FIELDS.state, value: data.state },
    { id: GHL_FIELDS.medicalIssues, value: data.conditions },
    { id: GHL_FIELDS.medicalIssuesText, value: conditionSummary },
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
    dateOfBirth: data.dateOfBirth,
    address1: [data.addressLine1, data.addressLine2].filter(Boolean).join(", "),
    city: data.city,
    // GHL's standard address field receives the USPS abbreviation while the
    // existing medical-intake custom field above retains the full state name.
    state: data.stateCode,
    postalCode: data.postalCode,
    country: "US",
    source: ghlConfig.siteName,
    customFields,
  };

  const res = await ghlFetch("/contacts/upsert", {
    method: "POST",
    body: JSON.stringify(upsertPayload),
  });

  if (!res.ok) {
    throw new Error(`GHL contact upsert failed status=${res.status}`);
  }

  const upserted = await res.json();
  const contactId = upserted?.contact?.id || upserted?.id || upserted?.contactId;
  if (!contactId) {
    throw new Error("GHL contact upsert returned no id");
  }
  // Upsert's `tags` field replaces the contact's complete tag list. Always use
  // the dedicated Add Tags endpoint so existing workflow/customer tags survive.
  try {
    await addTagsToContact(contactId, [
      ghlConfig.siteName,
      GHL_TAGS.intake,
      data.docUploadChoice === "now"
        ? GHL_TAGS.docsPendingUpload
        : GHL_TAGS.docsLater,
    ]);
  } catch {
    // The contact itself is the authoritative lead record. A noncritical tag
    // outage must not discard the lead or prevent a $225 customer from paying.
    console.error("Post-upsert GHL tag operation failed");
  }
  return contactId;
}

export async function addTagToContact(contactId: string, tag: string) {
  return addTagsToContact(contactId, [tag]);
}

export async function addTagsToContact(contactId: string, tags: string[]) {
  const res = await ghlFetch(`/contacts/${contactId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tags: [...new Set(tags.filter(Boolean))] }),
  });
  if (!res.ok) {
    throw new Error(`GHL add tag failed status=${res.status}`);
  }
}

export async function removeTagFromContact(contactId: string, tag: string) {
  const res = await ghlFetch(`/contacts/${contactId}/tags`, {
    method: "DELETE",
    body: JSON.stringify({ tags: [tag] }),
  });
  if (!res.ok) {
    throw new Error(`GHL remove tag failed status=${res.status}`);
  }
}

/** Create a distinct opportunity for every form submission. */
export async function createOpportunity(
  contactId: string,
  name: string,
  priceDollars: number,
  stageId: string,
  submissionReference: string,
  status: "open" | "won" | "lost" = "open"
): Promise<string> {
  const existingOpportunityId = await findOpportunityBySubmissionReference(
    contactId,
    submissionReference
  );
  if (existingOpportunityId) return existingOpportunityId;

  const payload: Record<string, unknown> = {
    pipelineId: ghlConfig.pipelineId,
    locationId: ghlConfig.locationId,
    contactId,
    name: `${name} [${submissionReference}]`,
    status,
    source: ghlConfig.siteName,
    monetaryValue: priceDollars,
    externalObjectId: submissionReference,
  };
  if (stageId) payload.pipelineStageId = stageId;

  const res = await ghlFetch("/opportunities/", {
    method: "POST",
    headers: { Version: "v3", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    // A browser retry can race the first create. Resolve the record that won
    // before surfacing an error or creating duplicate pipeline entries.
    const racedOpportunityId = await findOpportunityBySubmissionReference(
      contactId,
      submissionReference
    ).catch(() => null);
    if (racedOpportunityId) return racedOpportunityId;
    throw new Error(`GHL opportunity creation failed status=${res.status}`);
  }
  const json = await res.json();
  const opportunityId = json.opportunity?.id || json.id;
  if (!opportunityId) throw new Error("GHL opportunity creation returned no id");
  return opportunityId;
}

async function findOpportunityBySubmissionReference(
  contactId: string,
  submissionReference: string
): Promise<string | null> {
  const query = new URLSearchParams({
    locationId: ghlConfig.locationId,
    pipelineId: ghlConfig.pipelineId,
    contactId,
    q: submissionReference,
    limit: "20",
  });
  const res = await ghlFetch(`/opportunities/search?${query.toString()}`, {
    method: "GET",
    headers: { Version: "v3", Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    // Fail rather than blindly create: a temporary search outage must not turn
    // a browser retry into a duplicate opportunity.
    throw new Error(`GHL opportunity idempotency search failed status=${res.status}`);
  }
  const json = await res.json();
  const opportunities: Array<{
    id?: string;
    contactId?: string;
    externalObjectId?: string;
    name?: string;
  }> = Array.isArray(json?.opportunities)
    ? json.opportunities
    : Array.isArray(json?.data)
      ? json.data
      : [];
  const exact = opportunities.find(
    (opportunity) =>
      opportunity.contactId === contactId &&
      (opportunity.externalObjectId === submissionReference ||
        opportunity.name?.includes(`[${submissionReference}]`))
  );
  return exact?.id || null;
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
    headers: { Version: "v3", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`GHL move opportunity failed status=${res.status}`);
  }
}

export async function contactHasTag(contactId: string, tag: string): Promise<boolean> {
  const res = await ghlFetch(`/contacts/${contactId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GHL contact tag read failed status=${res.status}`);
  const json = await res.json();
  const contact = json?.contact || json;
  const tags: string[] = Array.isArray(contact?.tags) ? contact.tags : [];
  return tags.includes(tag);
}

async function sendMissingDocsInternalEmail(
  leadContactId: string,
  opportunityId: string,
  stateName: string,
  priceDollars: number
): Promise<void> {
  if (!ghlConfig.internalNotificationContactId) {
    throw new Error("GHL internal notification contact is not configured");
  }
  const secureContactUrl =
    `https://app.gohighlevel.com/v2/location/${encodeURIComponent(ghlConfig.locationId)}` +
    `/contacts/detail/${encodeURIComponent(leadContactId)}`;
  const submissionSuffix =
    opportunityId.replace(/[^A-Za-z0-9_-]/g, "").slice(-8) || "unknown";
  const subject = `Action needed: $250+ intake missing documents [${submissionSuffix}]`;
  const message = [
    "A website intake requires document follow-up before payment can be accepted.",
    `Site: ${ghlConfig.siteName}`,
    `State: ${stateName}`,
    `Price: $${priceDollars}`,
    `Submission: ...${submissionSuffix}`,
    `Open the secure GHL contact record: ${secureContactUrl}`,
  ].join("\n");
  const html = [
    "<p>A website intake requires document follow-up before payment can be accepted.</p>",
    `<p><strong>Site:</strong> ${escapeHtml(ghlConfig.siteName)}<br>`,
    `<strong>State:</strong> ${escapeHtml(stateName)}<br>`,
    `<strong>Price:</strong> $${priceDollars}</p>`,
    `<p><strong>Submission:</strong> ...${escapeHtml(submissionSuffix)}</p>`,
    `<p><a href="${secureContactUrl}">Open the secure GHL contact record</a></p>`,
  ].join("");

  const res = await ghlFetch("/conversations/messages", {
    method: "POST",
    headers: { Version: "v3" },
    body: JSON.stringify({
      type: "Email",
      contactId: ghlConfig.internalNotificationContactId,
      status: "pending",
      subject,
      message,
      html,
    }),
  });
  if (!res.ok) {
    throw new Error(`GHL internal email queue failed status=${res.status}`);
  }
}

async function sendMissingDocsInternalEmailWithRetry(
  leadContactId: string,
  opportunityId: string,
  stateName: string,
  priceDollars: number
): Promise<boolean> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await sendMissingDocsInternalEmail(
        leadContactId,
        opportunityId,
        stateName,
        priceDollars
      );
      return true;
    } catch {
      console.error(`Missing-doc internal email attempt ${attempt} failed`);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 300));
      }
    }
  }
  return false;
}

function missingDocsNotificationTag(opportunityId: string): string {
  const safeOpportunityId = opportunityId
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 48);
  return `missing-docs-notified-${safeOpportunityId}`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] || character);
}

/**
 * Put an unpaid $250+ applicant in the explicit missing-docs opportunity path.
 * Tory's internal notification is queued directly below and receives a per-
 * opportunity idempotency marker. Contact-wide recurring nurture is
 * intentionally not enrolled because one contact can have several submissions.
 */
export async function routeMissingDocsLead(
  contactId: string,
  opportunityId: string,
  stateName: string,
  priceDollars: number
): Promise<{ workflowQueued: boolean; emailQueued: boolean }> {
  if (!requiresDocumentsForPrice(priceDollars)) {
    throw new Error("Missing-document routing is only valid for $250+ orders");
  }
  try {
    await addTagsToContact(contactId, [
      GHL_TAGS.needsDocs,
      opportunityLifecycleTag(GHL_TAGS.needsDocs, opportunityId),
    ]);
  } catch {
    console.error("Missing-doc tag operation failed");
  }
  if (ghlConfig.stageNeedsDocs) {
    try {
      await moveOpportunityStage(opportunityId, ghlConfig.stageNeedsDocs, "open");
    } catch {
      console.error("Missing-doc stage operation failed");
    }
  }

  // Do not enroll a contact-wide recurring nurture here. One GHL contact can
  // have several opportunities, so an upload for one application cannot safely
  // start/stop a workflow for the others. Tory receives a direct, per-
  // opportunity alert below and the exact opportunity stays in the unpaid
  // missing-doc stage for manual follow-up.
  const workflowQueued = false;

  const submissionNotificationTag =
    missingDocsNotificationTag(opportunityId);
  let alreadyNotified = false;
  try {
    alreadyNotified = await contactHasTag(
      contactId,
      submissionNotificationTag
    );
  } catch {
    // The direct Tory notification remains independent of a contact-tag read.
    console.error("Missing-doc notification marker read failed");
  }

  if (alreadyNotified) return { workflowQueued, emailQueued: true };

  // The GHL tag is a durable secondary marker, but its read/send/write cycle is
  // not atomic. This owner-token lock makes only one worker eligible to send.
  const claim = await claimNotificationLock(opportunityId);
  if (claim.status === "sent") {
    return { workflowQueued, emailQueued: true };
  }
  if (claim.status === "busy") {
    // A live lock means another worker is still sending, not that GHL accepted
    // the message. Keep the API's existing retry path pending until confirmed.
    return { workflowQueued, emailQueued: false };
  }

  const emailSent = await sendMissingDocsInternalEmailWithRetry(
    contactId,
    opportunityId,
    stateName,
    priceDollars
  );
  if (!emailSent) {
    await releaseNotificationLock(claim);
    console.error("Missing-doc internal email was not queued");
    return { workflowQueued, emailQueued: false };
  }

  const sentMarkerPersisted = await finishNotificationLock(claim);
  if (!sentMarkerPersisted) {
    // The successful response from GHL above is itself confirmed acceptance;
    // this redundant marker failure must not turn that success into a retry.
    console.error("Missing-doc Redis sent marker could not be recorded");
  }
  try {
    // The per-opportunity marker is written only after the direct email API
    // succeeds, so a later submission on the same contact gets its own alert.
    await addTagsToContact(contactId, [
      GHL_TAGS.missingDocsNotified,
      submissionNotificationTag,
    ]);
  } catch {
    console.error("Missing-doc notification marker write failed");
  }
  return { workflowQueued, emailQueued: true };
}

/**
 * Server-side proof that the lead has uploaded medical docs. Only a non-empty
 * FILE_UPLOAD custom field counts. Tags are derived workflow markers and are
 * never accepted as proof. This is the authoritative $250+ payment gate; it
 * cannot be bypassed by the client. Throws on GHL read errors so checkout and
 * webhook fulfillment retry instead of misclassifying an unavailable record as
 * a customer with no documents.
 */
export async function contactHasDocs(contactId: string): Promise<boolean> {
  const res = await ghlFetch(`/contacts/${contactId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`GHL contact read failed status=${res.status}`);
  }
  const json = await res.json();
  const contact = json?.contact || json;

  const fields: Array<{ id?: string; value?: unknown; fieldValue?: unknown }> =
    contact?.customFields || contact?.customField || [];
  const docField = fields.find((field) => field.id === GHL_MEDICAL_DOCS_FIELD_ID);
  if (!docField) return false;
  return hasNonEmptyDocumentValue(docField.value ?? docField.fieldValue);
}

function hasNonEmptyDocumentValue(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasNonEmptyDocumentValue);
  if (value && typeof value === "object") {
    return Object.values(value).some(hasNonEmptyDocumentValue);
  }
  return false;
}
