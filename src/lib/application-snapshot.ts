import { ghlFetch } from "./ghl.ts";

export interface ApplicationSnapshotInput {
  contactId: string;
  opportunityId: string;
  submissionReference: string;
  siteName: string;
  stateName: string;
  priceDollars: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  conditions: string[];
  otherCondition?: string;
  details: string;
  medications?: string;
  duration: string;
  frequency: string;
  hasSeenDoctor: string;
  hasTintedBefore: string;
  currentTintPercent?: string;
  isLicensedDriver: string;
  isIntendedDriver: string;
  numberOfVehicles?: string;
  timeZone: string;
  howDidYouHear?: string;
  docUploadChoice: string;
}

function oneLine(value: unknown, maxLength: number): string {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function buildSnapshotBody(input: ApplicationSnapshotInput): string {
  const marker = `Website intake snapshot [${oneLine(input.submissionReference, 80)}]`;
  const address = [
    oneLine(input.addressLine1, 120),
    oneLine(input.addressLine2, 100),
    oneLine(input.city, 80),
    oneLine(input.stateName, 80),
    oneLine(input.postalCode, 10),
  ].filter(Boolean).join(", ");
  const lines = [
    marker,
    `Opportunity: ${oneLine(input.opportunityId, 100)}`,
    `Site: ${oneLine(input.siteName, 120)}`,
    `State/service: ${oneLine(input.stateName, 80)} ($${input.priceDollars})`,
    `Applicant at submission: ${oneLine(input.firstName, 60)} ${oneLine(input.lastName, 60)}`,
    `Email at submission: ${oneLine(input.email, 254)}`,
    `Phone at submission: ${oneLine(input.phone, 30)}`,
    `DOB at submission: ${oneLine(input.dateOfBirth, 10)}`,
    `Address at submission: ${address}`,
    `Selected conditions: ${input.conditions.map((value) => oneLine(value, 100)).filter(Boolean).join("; ")}`,
    `Other condition: ${oneLine(input.otherCondition, 160) || "Not provided"}`,
    `Details: ${oneLine(input.details, 1_800)}`,
    `Medications: ${oneLine(input.medications, 900) || "Not provided"}`,
    `Duration: ${oneLine(input.duration, 80)}`,
    `Frequency: ${oneLine(input.frequency, 80)}`,
    `Seen doctor: ${oneLine(input.hasSeenDoctor, 10)}`,
    `Previously used tint: ${oneLine(input.hasTintedBefore, 10)}`,
    `Current tint: ${oneLine(input.currentTintPercent, 40) || "Not provided"}`,
    `Licensed driver: ${oneLine(input.isLicensedDriver, 10)}`,
    `Intended driver/passenger: ${oneLine(input.isIntendedDriver, 10)}`,
    `Vehicles: ${oneLine(input.numberOfVehicles, 20) || "Not provided"}`,
    `Time zone: ${oneLine(input.timeZone, 40)}`,
    `How heard: ${oneLine(input.howDidYouHear, 200) || "Not provided"}`,
    `Document choice: ${oneLine(input.docUploadChoice, 20)}`,
  ];
  return lines.join("\n").slice(0, 4_950);
}

/**
 * Preserve each submission as an immutable-style GHL note before checkout.
 * Contact custom fields remain useful for the latest application, while this
 * marker-bound snapshot prevents a repeat upsert from erasing prior answers.
 */
export async function ensureApplicationSnapshot(
  input: ApplicationSnapshotInput
): Promise<void> {
  const marker = `Website intake snapshot [${oneLine(input.submissionReference, 80)}]`;
  const notesResponse = await ghlFetch(
    `/contacts/${encodeURIComponent(input.contactId)}/notes`,
    {
      method: "GET",
      headers: { Version: "v3", Accept: "application/json" },
      cache: "no-store",
    }
  );
  if (!notesResponse.ok) {
    throw new Error(`GHL application snapshot lookup failed status=${notesResponse.status}`);
  }
  const notesJson = await notesResponse.json();
  const notes: Array<{ body?: string }> = Array.isArray(notesJson?.notes)
    ? notesJson.notes
    : Array.isArray(notesJson?.data?.notes)
      ? notesJson.data.notes
      : Array.isArray(notesJson?.data)
        ? notesJson.data
        : [];
  if (notes.some((note) => note.body?.includes(marker))) return;

  const createResponse = await ghlFetch(
    `/contacts/${encodeURIComponent(input.contactId)}/notes`,
    {
      method: "POST",
      headers: { Version: "v3", Accept: "application/json" },
      body: JSON.stringify({ body: buildSnapshotBody(input) }),
    }
  );
  if (!createResponse.ok) {
    throw new Error(`GHL application snapshot creation failed status=${createResponse.status}`);
  }
}
