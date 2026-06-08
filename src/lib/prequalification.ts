// Qualifying medical conditions — matches GHL custom field "Medical Issues".
// All conditions qualify for preapproval. User can add more later.
export const qualifyingConditions = [
  "Migraines",
  "Psoriatic Arthritis",
  "Eye Injury",
  "Eye Surgery",
  "Head Trauma",
  "Chronic Dry Eyes",
  "PMLE / Polymorphic Light Eruption",
  "Cornea Abrasion",
  "Scars on the Eye",
  "Crohn's Disease",
  "Lazy Eye (Amblyopia)",
  "Photophobia",
  "Lupus",
  "Contacts or Eyeglasses",
  "Any Corneal Pathologies",
  "Light Color Eyes",
  "Psoriasis",
  "Taking Antihistamines",
  "Taking Antidepressants",
  "LASIK Surgery",
  "RCE / Recurrent Corneal Erosions",
  "Multiple Sclerosis",
  "Eye Allergies",
  "Sinus Infection",
  "Any HLA/B27 Ailments",
  "Other",
] as const;

export type QualifyingCondition = (typeof qualifyingConditions)[number];

// How long have you had these issues — matches GHL custom field
export const durationOptions = [
  "Less than 6 months",
  "6 months to 1 year",
  "1 to 5 years",
  "Over 5 years",
] as const;

// How often do symptoms affect you — matches GHL custom field
export const frequencyOptions = [
  "Not at all",
  "1 to 3 times a week",
  "4+ days a week",
] as const;

// Time zone options — matches GHL custom field
export const timeZoneOptions = [
  "Pacific Time",
  "Mountain Time",
  "Central Time",
  "Eastern Time",
] as const;

// Required documentation list for Step 2
export const requiredDocumentation = [
  {
    title: "Medical Records or Doctor's Note",
    description:
      "Documentation from your physician, ophthalmologist, dermatologist, or specialist that confirms your qualifying condition. This is the only document required — do NOT upload a driver's license, ID, or vehicle information.",
  },
] as const;

// Prequalification gate logic
export interface PrequalificationAnswers {
  conditions: string[];
  duration: string;
  frequency: string;
  isLicensedDriver: string;
  isIntendedDriver: string;
  hasSeenDoctor: string;
}

export function isPrequalified(answers: PrequalificationAnswers): {
  qualified: boolean;
  reason?: string;
} {
  if (answers.conditions.length === 0) {
    return {
      qualified: false,
      reason:
        "You must select at least one qualifying medical condition to proceed.",
    };
  }

  if (answers.isLicensedDriver !== "Yes") {
    return {
      qualified: false,
      reason:
        "You must be a licensed driver to apply for a window tint medical exemption.",
    };
  }

  if (answers.isIntendedDriver !== "Yes") {
    return {
      qualified: false,
      reason:
        "You must be the intended driver or primary passenger of the vehicle.",
    };
  }

  return { qualified: true };
}
