import { z } from "zod";
import {
  qualifyingConditions,
  durationOptions,
  frequencyOptions,
  timeZoneOptions,
} from "@/lib/prequalification";
import { isValidDateOfBirth, normalizeUsPhone } from "@/lib/intake-values";

const shortText = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);

const dateOfBirth = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date of birth")
  .refine(isValidDateOfBirth, "Enter a valid date of birth");

const phone = z
  .string()
  .trim()
  .min(10)
  .max(30)
  .transform((value, context) => {
    const normalized = normalizeUsPhone(value);
    if (!normalized) {
      context.addIssue({
        code: "custom",
        message: "Enter a valid 10-digit US phone number",
      });
      return z.NEVER;
    }
    return normalized;
  });

export const submitOrderSchema = z
  .object({
    firstName: shortText(1, 60),
    lastName: shortText(1, 60),
    email: z.string().trim().email().max(254),
    phone,
    dateOfBirth,
    addressLine1: shortText(3, 100),
    addressLine2: z.string().trim().max(100).default(""),
    city: shortText(2, 80),
    postalCode: z.string().trim().regex(/^\d{5}(?:-\d{4})?$/, "Enter a valid ZIP code"),
    submissionId: z.string().uuid(),
    stateSlug: z.string().trim().regex(/^[a-z0-9-]{2,60}$/),
    conditions: z.array(z.enum(qualifyingConditions)).min(1).max(12),
    otherCondition: z.string().trim().max(160).default(""),
    details: shortText(10, 2_000),
    medications: z.string().trim().max(1_000).default(""),
    duration: z.enum(durationOptions),
    frequency: z.enum(frequencyOptions),
    hasSeenDoctor: z.enum(["Yes", "No"]),
    hasTintedBefore: z.enum(["Yes", "No"]),
    currentTintPercent: z.string().trim().max(40).default(""),
    isLicensedDriver: z.literal("Yes"),
    isIntendedDriver: z.literal("Yes"),
    numberOfVehicles: z.string().trim().max(20).default(""),
    timeZone: z.enum(timeZoneOptions),
    howDidYouHear: z.string().trim().max(200).default(""),
    docUploadChoice: z.enum(["now", "later"]),
    acknowledgesDocumentation: z.literal(true),
    agreeToTerms: z.literal(true),
    agreesToLiability: z.literal(true),
    acknowledgesRefundFee: z.literal(true),
    botToken: z.string().max(2_048).optional(),
    website: z.string().max(0).optional().default(""),
    formStartedAt: z.number().int().positive(),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.conditions.includes("Other") && data.otherCondition.length < 3) {
      context.addIssue({
        code: "custom",
        path: ["otherCondition"],
        message: "Describe the other medical condition",
      });
    }
  });

export type SubmitOrderInput = z.infer<typeof submitOrderSchema>;

export const createCheckoutSchema = z
  .object({
    orderToken: z.string().min(40).max(4_096),
    uploadReceipt: z.string().min(40).max(2_048).optional(),
  })
  .strict();

export function firstValidationError(error: z.ZodError): string {
  return error.issues[0]?.message || "Please check the form and try again.";
}
