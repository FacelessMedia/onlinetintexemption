export const SUPPORT_PHONE_DISPLAY = "734-338-9453";
export const SUPPORT_PHONE_HREF = "tel:+17343389453";
export const SUPPORT_EMAIL = "Tory@myeyerx.net";

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const SSN_PATTERN = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/;
const PHONE_PATTERN = /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/;
const DOB_PATTERN = /\b(?:dob|date of birth|birthdate|birthday|born)\b[^\n\d]{0,12}(?:\d{1,2}[/-]\d{1,2}[/-](?:19|20)\d{2}|(?:19|20)\d{2}[/-]\d{1,2}[/-]\d{1,2})\b/i;
const ADDRESS_PATTERN = /\b\d{1,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,5}\s+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|court|ct|parkway|pkwy|highway|hwy|circle|cir)\b/i;
const RECORD_PASTE_PATTERN = /\b(?:patient\s*(?:name|id)|medical\s*record(?:\s*(?:number|#))?\s*:|visit\s*summary\s*:|clinical\s*note\s*:|mrn|diagnosis\s*:|lab\s*results?\s*:|operative\s*note\s*:|provider\s*:|date\s*of\s*birth\s*:)\b/i;
const PERSONAL_CONTEXT_PATTERN =
  /\b(?:i|i'm|im|i've|ive|me|my|mine|we|our|he|his|she|her|they|their|patient|spouse|child|son|daughter)\b/i;
const HEALTH_TERM_PATTERN =
  /\b(?:medical|health|condition|symptom|diagnos(?:is|ed)|treat(?:ment|ed)|doctor|clinician|provider|medication|medicine|prescription|surgery|operation|injury|pain|rash|seizure|headache|migraine|lupus|psoriasis|arthritis|crohn'?s|photophobia|photosensitiv(?:e|ity)|albinism|cataract|glaucoma|macular|cornea|corneal|lasik|dry eyes?|eye allergies?|multiple sclerosis|sinus infection|antihistamine|antidepressant)\b/i;

export type SensitiveDataKind =
  | "email"
  | "phone"
  | "ssn"
  | "card"
  | "dob"
  | "address"
  | "medical-record"
  | "health";

export function detectSensitiveData(text: string): SensitiveDataKind | null {
  if (EMAIL_PATTERN.test(text)) return "email";
  if (SSN_PATTERN.test(text)) return "ssn";
  if (PHONE_PATTERN.test(text)) return "phone";
  if (DOB_PATTERN.test(text)) return "dob";
  if (ADDRESS_PATTERN.test(text)) return "address";
  if (RECORD_PASTE_PATTERN.test(text)) return "medical-record";
  // Do not send a person's condition or symptom disclosure to OpenAI even
  // when it is not formatted like a pasted medical record.
  if (PERSONAL_CONTEXT_PATTERN.test(text) && HEALTH_TERM_PATTERN.test(text)) {
    return "health";
  }

  const digitRuns = text.match(/(?:\d[ -]?){13,19}/g) || [];
  if (digitRuns.some((value) => isLuhnValid(value.replace(/\D/g, "")))) {
    return "card";
  }
  return null;
}

function isLuhnValid(digits: string): boolean {
  if (digits.length < 13 || digits.length > 19 || /^(\d)\1+$/.test(digits)) {
    return false;
  }
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let value = Number(digits[index]);
    if (double) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
    double = !double;
  }
  return sum % 10 === 0;
}

export function sensitiveDataRefusal(): string {
  return `For your privacy, please do not share medical records, dates of birth, addresses, email addresses, phone numbers, payment-card details, or identification numbers in chat. Use the secure intake form, or contact MyEyeRx at ${SUPPORT_PHONE_DISPLAY} or ${SUPPORT_EMAIL}.`;
}
