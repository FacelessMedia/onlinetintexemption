// Screening condition/symptom categories — matches the GHL custom field
// "Medical Issues". Selecting one only permits the intake to continue; it is
// not clinical approval, a diagnosis, or a legal determination.
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

// General documentation examples for Step 2. Actual requirements vary by
// state and reviewing provider, so this list must not imply approval.
export const requiredDocumentation = [
  {
    title: "Medical record, visit summary, or provider letter",
    description:
      "A document is generally useful when it includes your name, the treating professional or facility, and the relevant condition, symptoms, treatment, or surgery. Do not upload a driver's license, ID, vehicle registration, or unrelated image as medical proof.",
  },
] as const;

// Initial intake screen. The independent reviewing provider makes every
// clinical decision after reviewing the intake and any documentation.
export interface InitialScreeningAnswers {
  conditions: string[];
  duration: string;
  frequency: string;
  isLicensedDriver: string;
  isIntendedDriver: string;
  hasSeenDoctor: string;
}

export function passesInitialScreening(answers: InitialScreeningAnswers): {
  canContinue: boolean;
  reason?: string;
} {
  if (answers.conditions.length === 0) {
    return {
      canContinue: false,
      reason:
        "You must select at least one qualifying medical condition to proceed.",
    };
  }

  if (answers.isLicensedDriver !== "Yes") {
    return {
      canContinue: false,
      reason:
        "You must be a licensed driver to apply for a window tint medical exemption.",
    };
  }

  if (answers.isIntendedDriver !== "Yes") {
    return {
      canContinue: false,
      reason:
        "You must be the intended driver or primary passenger of the vehicle.",
    };
  }

  return { canContinue: true };
}
