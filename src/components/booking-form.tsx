"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
  Shield,
  Stethoscope,
  CreditCard,
  Phone,
  Upload,
  Clock,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { legal } from "@/lib/legal";
import { requiresDocumentsForPrice } from "@/lib/docs-policy";
import {
  qualifyingConditions,
  durationOptions,
  frequencyOptions,
  timeZoneOptions,
  requiredDocumentation,
  passesInitialScreening,
} from "@/lib/prequalification";
import { PurchasePauseGate } from "@/components/purchase-pause";
import { TurnstileWidget } from "@/components/turnstile-widget";

const SITE_NAME = "Online Tint Exemption";

type Step = 1 | 2 | 3;

interface BookingFormProps {
  stateName: string;
  stateSlug: string;
  price: number;
  originalPrice: number;
}

interface FormData {
  // Step 1 — preliminary screening (not clinical approval)
  conditions: string[];
  otherCondition: string;
  duration: string;
  frequency: string;
  isLicensedDriver: string;
  isIntendedDriver: string;
  hasSeenDoctor: string;
  hasTintedBefore: string;
  currentTintPercent: string;
  // Step 2 — Documentation
  docUploadChoice: "now" | "later" | "";
  uploadedFileNames: string[];
  acknowledgesDocumentation: boolean;
  // Step 3 — Patient Info + Payment
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  timeZone: string;
  medicalDetails: string;
  medications: string;
  numberOfVehicles: string;
  howDidYouHear: string;
  agreeToTerms: boolean;
  agreesToLiability: boolean;
  website: string;
}

const initialFormData: FormData = {
  conditions: [],
  otherCondition: "",
  duration: "",
  frequency: "",
  isLicensedDriver: "",
  isIntendedDriver: "",
  hasSeenDoctor: "",
  hasTintedBefore: "",
  currentTintPercent: "",
  docUploadChoice: "",
  uploadedFileNames: [],
  acknowledgesDocumentation: false,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  timeZone: "",
  medicalDetails: "",
  medications: "",
  numberOfVehicles: "",
  howDidYouHear: "",
  agreeToTerms: false,
  agreesToLiability: false,
  website: "",
};

const TURNSTILE_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
);

// Shared field styles (onlinetint token theme)
const inputClass =
  "mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring";
const cardClass = "rounded-xl border border-border bg-card p-6 sm:p-8";

export function BookingForm({
  stateName,
  stateSlug,
  price,
}: BookingFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const formStartedAt = useRef(Date.now()).current;
  const submissionId = useRef(crypto.randomUUID()).current;
  const disqualifyRef = useRef<HTMLDivElement>(null);
  const [disqualifyReason, setDisqualifyReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Hosted Stripe Checkout URL returned by /api/create-checkout.
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  // Set only when a $250+ applicant submits without docs: the application is
  // saved for follow-up and Stripe is not opened.
  const [leadOnlyMessage, setLeadOnlyMessage] = useState<string | null>(null);
  const [orderToken, setOrderToken] = useState<string | null>(null);
  const [uploadReceipt, setUploadReceipt] = useState<string | null>(null);
  const [botToken, setBotToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const fullPrice = `$${price}`;
  const displayPrice = fullPrice;
  // This mirrors the server-owned rule for the customer experience. The API
  // independently derives the policy from its own trusted price table.
  const requiresDocs = requiresDocumentsForPrice(price);
  const isLeadOnlyPath =
    requiresDocs && form.docUploadChoice === "later";

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCondition(condition: string) {
    setForm((prev) => {
      const has = prev.conditions.includes(condition);
      return {
        ...prev,
        conditions: has
          ? prev.conditions.filter((c) => c !== condition)
          : [...prev.conditions, condition],
      };
    });
  }

  function handleStep1Submit() {
    setDisqualifyReason(null);
    const result = passesInitialScreening({
      conditions: form.conditions,
      duration: form.duration,
      frequency: form.frequency,
      isLicensedDriver: form.isLicensedDriver,
      isIntendedDriver: form.isIntendedDriver,
      hasSeenDoctor: form.hasSeenDoctor,
    });
    if (!result.canContinue) {
      setDisqualifyReason(
        result.reason || "You cannot continue online based on these responses."
      );
      setTimeout(
        () =>
          disqualifyRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          }),
        100
      );
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Files are held in browser memory during Step 2, then uploaded after the
  // signed order session is created and before Stripe Checkout is requested.
  type UploadStatus = "ready" | "uploading" | "done" | "error";
  interface UploadedDoc {
    file: File;
    fileName: string;
    size: number;
    status: UploadStatus;
    error?: string;
  }
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const isAnyUploading = uploadedDocs.some((d) => d.status === "uploading");
  const hasUploadError = uploadedDocs.some((d) => d.status === "error");
  const allUploadsDone =
    uploadedDocs.length > 0 && uploadedDocs.every((d) => d.status === "done");

  async function uploadOne(
    file: File,
    indexInState: number,
    signedOrderToken: string
  ): Promise<string | null> {
    setUploadedDocs((prev) =>
      prev.map((d, i) =>
        i === indexInState
          ? { ...d, status: "uploading" as UploadStatus, error: undefined }
          : d
      )
    );
    try {
      const fd = new globalThis.FormData();
      fd.append("file", file);
      fd.append("orderToken", signedOrderToken);
      const res = await fetch("/api/upload-doc", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        let msg = `Upload failed (${res.status}).`;
        try {
          const data = await res.json();
          if (data?.error) msg = String(data.error);
        } catch {}
        setUploadedDocs((prev) =>
          prev.map((d, i) =>
            i === indexInState ? { ...d, status: "error", error: msg } : d
          )
        );
        return null;
      }
      const data = (await res.json()) as { uploadReceipt?: unknown };
      if (typeof data.uploadReceipt !== "string" || !data.uploadReceipt) {
        throw new Error("The secure upload confirmation was missing. Please retry.");
      }
      setUploadReceipt(data.uploadReceipt);
      setUploadedDocs((prev) =>
        prev.map((d, i) =>
          i === indexInState ? { ...d, status: "done", error: undefined } : d
        )
      );
      return data.uploadReceipt;
    } catch {
      setUploadedDocs((prev) =>
        prev.map((d, i) =>
          i === indexInState
            ? {
                ...d,
                status: "error",
                error:
                  "Network error during upload. Check your connection and retry.",
              }
            : d
        )
      );
      return null;
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    // Reset the input so picking the same file again re-triggers onChange.
    e.target.value = "";
    setUploadedDocs((prev) => [
      ...prev,
      ...incoming.map((file) => ({
        file,
        fileName: file.name,
        size: file.size,
        status: "ready" as UploadStatus,
      })),
    ]);
    updateField("uploadedFileNames", [
      ...form.uploadedFileNames,
      ...incoming.map((f) => f.name),
    ]);
  }

  function removeFile(index: number) {
    setUploadedDocs((prev) => prev.filter((_, i) => i !== index));
    updateField(
      "uploadedFileNames",
      form.uploadedFileNames.filter((_, i) => i !== index)
    );
  }

  function retryUpload(index: number) {
    if (!orderToken) return;
    const doc = uploadedDocs[index];
    if (doc) void uploadOne(doc.file, index, orderToken);
  }

  function handleStep2Submit() {
    if (!form.acknowledgesDocumentation || !form.docUploadChoice) return;
    // "Upload now" must actually include a file so we never tell an applicant
    // a document was submitted when it was not. At $225 they can instead choose
    // "without docs" and continue to payment; at $250+ that becomes follow-up.
    if (
      form.docUploadChoice === "now" &&
      uploadedDocs.length === 0
    ) {
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleStep3Submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadWarning(null);

    try {
      let newOrderToken: string | null = orderToken;
      // Phase 1 — Lead capture. Always upserts the GHL contact/opportunity (even
      // an applicant who never uploads docs becomes a follow-up lead) and
      // returns whether docs are required. We send stateSlug so the SERVER looks
      // up the authoritative price — the client-sent amount is never trusted.
      // A checkout/provider retry reuses the already signed order instead of
      // creating a fresh order JTI that would invalidate its upload receipt.
      if (!newOrderToken) {
        const res = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          postalCode: form.postalCode,
          submissionId,
          stateSlug,
          conditions: form.conditions,
          otherCondition: form.otherCondition,
          details: form.medicalDetails,
          medications: form.medications,
          duration: form.duration,
          frequency: form.frequency,
          hasSeenDoctor: form.hasSeenDoctor,
          hasTintedBefore: form.hasTintedBefore,
          currentTintPercent: form.currentTintPercent,
          isLicensedDriver: form.isLicensedDriver,
          isIntendedDriver: form.isIntendedDriver,
          numberOfVehicles: form.numberOfVehicles,
          timeZone: form.timeZone,
          howDidYouHear: form.howDidYouHear,
          docUploadChoice: form.docUploadChoice,
          acknowledgesDocumentation: form.acknowledgesDocumentation,
          agreeToTerms: form.agreeToTerms,
          agreesToLiability: form.agreesToLiability,
          botToken: botToken || undefined,
          website: form.website,
          formStartedAt,
        }),
        });

        const ct = res.headers.get("content-type") ?? "";
        const lead = ct.includes("application/json")
          ? await res.json().catch(() => ({}))
          : {};
        if (!res.ok) {
          // A token is returned only after the per-opportunity alert is
          // confirmed. If no token was returned, refresh the single-use bot
          // challenge and retry this same stable submission reference.
          if (typeof lead?.orderToken === "string" && lead.orderToken) {
            newOrderToken = lead.orderToken;
            setOrderToken(lead.orderToken);
          } else {
            setBotToken("");
            setTurnstileResetKey((value) => value + 1);
          }
          throw new Error(
            String(
              lead?.error ||
                lead?.message ||
                `Unexpected server response (${res.status}). Please try again or contact support.`
            )
          );
        }

        newOrderToken =
          typeof lead?.orderToken === "string" && lead.orderToken
            ? lead.orderToken
            : null;
        if (!newOrderToken) {
          throw new Error(
            "We couldn't save your application. Please try again or contact support."
          );
        }
        setOrderToken(newOrderToken);

        if (lead?.blocked) {
          setLeadOnlyMessage(
            String(
              lead?.message ||
                "Your application is saved. No payment was taken. Our team will contact you about the required medical documentation."
            )
          );
          setSuccess(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }

      if (!newOrderToken) throw new Error("Invalid order session.");

      // Phase 2 — If the buyer chose "upload now", push the files to the contact
      // BEFORE creating checkout, because the payment gate verifies docs exist on
      // the contact server-side. A failed upload is never counted as proof and
      // therefore cannot unlock a Stripe Checkout session.
      let confirmedUploadReceipt =
        orderToken === newOrderToken ? uploadReceipt : null;
      if (orderToken !== newOrderToken) setUploadReceipt(null);
      if (form.docUploadChoice === "now") {
        const pending = uploadedDocs
          .map((doc, idx) => ({ doc, idx }))
          .filter(({ doc }) => doc.status === "ready" || doc.status === "error");
        if (pending.length > 0) {
          const results = await Promise.all(
            pending.map(({ doc, idx }) =>
              uploadOne(doc.file, idx, newOrderToken)
            )
          );
          confirmedUploadReceipt =
            results.find((receipt): receipt is string => Boolean(receipt)) ||
            confirmedUploadReceipt;
        }
        if (!confirmedUploadReceipt && requiresDocs) {
          throw new Error(
            "Your application is saved, but no document upload was confirmed. Retry the file shown below; no payment was taken."
          );
        }
      }

      // Phase 3 — Create the gated hosted checkout session. If docs are required
      // but missing, the server returns { blocked: true } and we show the
      // no-charge follow-up message instead of redirecting to payment.
      let coRes: Response | null = null;
      let co: Record<string, unknown> = {};
      for (let attempt = 0; attempt < 4; attempt += 1) {
        coRes = await fetch("/api/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderToken: newOrderToken,
            uploadReceipt: confirmedUploadReceipt || undefined,
          }),
        });
        co = (await coRes.json().catch(() => ({}))) as Record<string, unknown>;
        if (coRes.status !== 202 || co.retryable !== true) break;
        if (attempt === 3) {
          throw new Error(
            String(
              co.message ||
                "Your document is saved but still being confirmed. Please wait a moment and try payment again."
            )
          );
        }
        await new Promise((resolve) =>
          setTimeout(resolve, (attempt + 1) * 1_000)
        );
      }

      if (!coRes) {
        throw new Error("We couldn't start secure payment. Please try again.");
      }

      if (!coRes.ok) {
        throw new Error(
          String(
            co?.error ||
              "We couldn't start secure payment. Please try again or contact support."
          )
        );
      }

      if (co.blocked) {
        // Submitted without docs — lead saved, no payment taken.
        setLeadOnlyMessage(
          String(
            co.message ||
                "Your application is saved. No payment was taken. Our team will contact you about secure document submission and next steps."
          )
        );
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (typeof co.checkoutUrl !== "string" || !co.checkoutUrl) {
        throw new Error(
          "We couldn't start secure payment. Please try again or contact support."
        );
      }

      setCheckoutUrl(co.checkoutUrl);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Hand off to Stripe's secure hosted payment page.
      window.location.href = co.checkoutUrl;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // ---- Success State ----
  if (success) {
    // No-charge follow-up lead submitted without documents.
    if (leadOnlyMessage) {
      return (
        <div className="mx-auto max-w-2xl rounded-xl border border-secondary/30 bg-secondary/10 p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-secondary" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">
            Application Received
          </h2>
          <p className="mt-3 text-muted-foreground">
            Thank you, {form.firstName}! Your {stateName} window tint medical
            exemption application is saved.
          </p>
          <p className="mt-3 text-foreground">{leadOnlyMessage}</p>
          <div className="mt-6 rounded-lg border border-border bg-card p-4 text-left text-sm text-muted-foreground">
            <strong className="text-foreground">No payment was taken.</strong>{" "}
            Our team will use the contact information you provided to explain
            secure document submission and next steps. Payment can be requested
            only after the required upload is confirmed; provider review does
            not guarantee approval or issuance.
          </div>
        </div>
      );
    }
    const showUploads =
      form.docUploadChoice === "now" && uploadedDocs.length > 0;
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-green-500/30 bg-green-500/10 p-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-400" />
          <h2 className="mt-4 text-2xl font-bold text-green-700">
            Redirecting to Secure Payment…
          </h2>
          <p className="mt-3 text-green-800">
            Thank you, {form.firstName}! Your {stateName} window tint medical
            exemption application is saved. We&apos;re sending you to our secure
            payment page to complete your {displayPrice} payment. Please
            don&apos;t close this window.
          </p>

          {checkoutUrl && (
            <a
              href={checkoutUrl}
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-opacity hover:opacity-90 sm:w-auto sm:px-10"
            >
              Continue to Secure Payment — {displayPrice}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          )}
          <p className="mt-3 text-center text-xs text-green-800">
            <Shield className="mr-1 inline h-3.5 w-3.5" />
            If you are not redirected automatically, click the button above.
            Payment is processed securely by our payment provider.
          </p>
        </div>

        {showUploads && (
          <div className="mt-6 rounded-lg border border-green-500/30 bg-card p-4 text-left">
            <h3 className="text-sm font-bold text-foreground">
              Uploading your medical documentation
            </h3>
            {isAnyUploading && (
              <p className="mt-1 text-xs text-secondary">
                <strong>Please don&apos;t close this tab</strong> until every
                file shows a green checkmark.
              </p>
            )}
            {allUploadsDone && (
              <p className="mt-1 text-xs text-green-400">
                All documents securely attached to your access-controlled
                application record.
              </p>
            )}
            <div className="mt-3 space-y-2">
              {uploadedDocs.map((doc, idx) => {
                const tone =
                  doc.status === "done"
                    ? "border-green-500/30 bg-green-500/10 text-green-700"
                    : doc.status === "error"
                      ? "border-red-500/30 bg-red-500/10 text-red-700"
                      : "border-primary/30 bg-primary/10 text-primary";
                return (
                  <div
                    key={idx}
                    className={`rounded-lg border px-3 py-2 ${tone}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2 text-sm">
                        {(doc.status === "uploading" ||
                          doc.status === "ready") && (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                        )}
                        {doc.status === "done" && (
                          <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                        )}
                        {doc.status === "error" && (
                          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                        )}
                        <span className="truncate">{doc.fileName}</span>
                        <span className="shrink-0 text-xs opacity-75">
                          ({(doc.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      {doc.status === "error" && (
                        <button
                          type="button"
                          onClick={() => retryUpload(idx)}
                          className="shrink-0 text-xs font-semibold text-primary hover:underline"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                    {doc.status === "error" && doc.error && (
                      <p className="mt-1 text-xs text-red-700">{doc.error}</p>
                    )}
                  </div>
                );
              })}
            </div>
            {hasUploadError && (
              <p className="mt-3 text-xs text-red-700">
                Some files didn&apos;t upload. Click <strong>Retry</strong>. If the
                problem continues, contact MyEyeRx for a secure-upload option.
                Do not send medical records through ordinary email or chat.
              </p>
            )}
          </div>
        )}

        {form.docUploadChoice === "later" && (
          <div className="mt-6 rounded-lg border border-secondary/30 bg-secondary/10 p-4 text-left">
            <p className="text-sm text-foreground">
              <strong>Next step:</strong> MyEyeRx will contact you with a secure
              upload option. Do not send records through ordinary email. An
              independent clinician makes all clinical decisions after review.
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-green-800">
          We will reach out to <strong>{form.email}</strong> with next steps.
          Please check your inbox (and spam folder).
        </p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-4xl">
      <PurchasePauseGate />
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Initial Screen", Icon: Stethoscope },
            { num: 2, label: "Documentation", Icon: Shield },
            {
              num: 3,
              label: isLeadOnlyPath ? "Application" : "Payment",
              Icon: isLeadOnlyPath ? FileText : CreditCard,
            },
          ].map((s, i) => (
            <div key={s.num} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    step >= s.num
                      ? "bg-primary text-primary-foreground"
                      : "border-2 border-border bg-card text-muted-foreground"
                  }`}
                >
                  {step > s.num ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <s.Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium ${
                    step >= s.num ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded ${
                    step > s.num ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1 — preliminary screening only */}
      {step === 1 && (
        <div className={cardClass}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Initial Eligibility Screening
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Answer the questions below to see whether you can continue to a
              provider review for a {stateName} window tint medical exemption.
              This screen is not a diagnosis or approval.
            </p>
          </div>

          <div className="space-y-6">
            {/* Medical Conditions */}
            <div>
              <label className="block text-sm font-semibold text-foreground">
                Select all medical conditions that apply to you (now or in the
                past) *
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Check ALL that apply.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {qualifyingConditions.map((condition) => (
                  <label
                    key={condition}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-sm transition-colors ${
                      form.conditions.includes(condition)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.conditions.includes(condition)}
                      onChange={() => toggleCondition(condition)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
                    <span className="break-words">{condition}</span>
                  </label>
                ))}
              </div>
              {form.conditions.includes("Other") && (
                <input
                  type="text"
                  placeholder="Please describe your condition..."
                  value={form.otherCondition}
                  onChange={(e) => updateField("otherCondition", e.target.value)}
                  className={inputClass}
                />
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-foreground">
                How long have you had these issues? *
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {durationOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateField("duration", opt)}
                    className={`rounded-lg border p-3 text-center text-sm transition-colors ${
                      form.duration === opt
                        ? "border-primary bg-primary/10 font-medium text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-semibold text-foreground">
                How often do these issues affect your quality of life? *
              </label>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {frequencyOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateField("frequency", opt)}
                    className={`rounded-lg border p-3 text-center text-sm transition-colors ${
                      form.frequency === opt
                        ? "border-primary bg-primary/10 font-medium text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Yes/No Questions */}
            <div className="space-y-4">
              {[
                {
                  key: "hasSeenDoctor" as const,
                  label: "Have you seen another doctor about this issue?",
                },
                {
                  key: "hasTintedBefore" as const,
                  label:
                    "Have you driven a car with tinted windows before? (Note: window tint can restrict visibility in low light conditions.)",
                },
                {
                  key: "isLicensedDriver" as const,
                  label: "Are you a licensed driver? *",
                },
                {
                  key: "isIntendedDriver" as const,
                  label:
                    "Are you the intended driver or primary passenger of the vehicle? *",
                },
              ].map((q) => (
                <div key={q.key}>
                  <label className="block text-sm font-semibold text-foreground">
                    {q.label}
                  </label>
                  <div className="mt-2 flex gap-3">
                    {["Yes", "No"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField(q.key, opt)}
                        className={`flex-1 rounded-lg border p-3 text-center text-sm transition-colors ${
                          form[q.key] === opt
                            ? "border-primary bg-primary/10 font-medium text-foreground"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tint percent (conditional) */}
            {form.hasTintedBefore === "Yes" && (
              <div>
                <label className="block text-sm font-semibold text-foreground">
                  What percent of window tint do you currently have?
                </label>
                <input
                  type="text"
                  placeholder="e.g., 20%"
                  value={form.currentTintPercent}
                  onChange={(e) =>
                    updateField("currentTintPercent", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            )}

            {disqualifyReason && (
              <div
                ref={disqualifyRef}
                className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-700">
                    {disqualifyReason}
                  </p>
                  <p className="mt-1 text-xs text-red-700">
                    If you believe this is an error, please contact us for
                    assistance.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleStep1Submit}
              disabled={
                form.conditions.length === 0 ||
                !form.duration ||
                !form.frequency ||
                !form.isLicensedDriver ||
                !form.isIntendedDriver
              }
              className="flex w-full items-center justify-center rounded-lg bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              Check My Eligibility <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Documentation Check */}
      {step === 2 && (
        <div className={cardClass}>
          {/* Initial screening result — never a clinical approval. */}
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-5 text-center">
            <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
            <h2 className="mt-3 text-xl font-bold text-green-700 sm:text-2xl">
              You May Qualify
            </h2>
            <p className="mt-2 text-sm text-green-800">
              Based on your screening responses, you may continue to a provider
              review for a {stateName} window tint medical exemption. This is not
              a diagnosis or approval. Please review the documentation process
              before proceeding.
            </p>
          </div>

          {/* Documentation and review notice */}
          <div className="mb-6 rounded-lg border-2 border-red-500/40 bg-red-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />
              <div>
                <h3 className="text-base font-bold text-red-700">
                  Documentation and Review Process
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-red-800">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span>
                      Selecting a condition only means you may continue to an
                      independent provider review. It does not guarantee clinical
                      approval or an exemption.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span>
                      Useful documentation generally shows your name, the treating
                      professional or facility, and the relevant condition,
                      symptoms, treatment, or surgery. The reviewing provider may
                      request more information.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span>
                      {requiresDocs
                        ? `Because this intake is ${displayPrice}, MyEyeRx requires a secure document upload before payment. This is an operational review rule, not a statement of state law.`
                        : `For this ${displayPrice} intake, documents are optional before payment. You may upload a useful record now or continue without one; the reviewing provider may still request more information later.`}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call First CTA */}
          <div className="mb-6 rounded-lg border border-secondary/30 bg-secondary/10 p-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-secondary" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Not sure if your paperwork qualifies?
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Call MyEyeRx with general questions before paying. The team can
                  explain common document types and the secure-upload process;
                  only the reviewing provider can determine whether documentation
                  is sufficient. Do not email medical records.
                </p>
              </div>
            </div>
          </div>

          {/* Required Documentation List */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground">
              Documentation That May Be Useful
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Requirements vary by state and reviewing provider. A common example:
            </p>
          </div>

          <div className="space-y-3">
            {requiredDocumentation.map((doc) => (
              <div
                key={doc.title}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
              >
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {doc.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {doc.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Docs Section */}
          <div className="mt-6">
            <h3 className="text-base font-bold text-foreground">
              Upload Your Documentation
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {requiresDocs ? (
                <>
                  This {displayPrice} intake requires a secure document upload
                  before payment. <strong className="text-foreground">Upload it
                  now to continue to payment</strong>, or submit without it and
                  we&apos;ll follow up—no payment will be taken yet.
                </>
              ) : (
                <>
                  Documents are optional for this {displayPrice} intake. Upload a
                  useful record now, or continue without documents and proceed to
                  secure payment.
                </>
              )}
            </p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => updateField("docUploadChoice", "now")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors ${
                  form.docUploadChoice === "now"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <Upload className="h-5 w-5" />
                <div className="text-left">
                  <span className="block font-semibold">Upload Now</span>
                  <span className="block text-xs text-muted-foreground">
                    Submit with intake
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => updateField("docUploadChoice", "later")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors ${
                  form.docUploadChoice === "later"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <Clock className="h-5 w-5" />
                <div className="text-left">
                  <span className="block font-semibold">
                    Submit Without Docs
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {requiresDocs
                      ? "We follow up — no charge now"
                      : "Continue to secure payment"}
                  </span>
                </div>
              </button>
            </div>

            {/* File Upload Area */}
            {form.docUploadChoice === "now" && (
              <div className="mt-4">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background p-6 transition-colors hover:border-primary hover:bg-primary/5">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="mt-2 text-sm font-medium text-foreground">
                    Click to upload files
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    PDF, JPG, or PNG up to 4MB each
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {uploadedDocs.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedDocs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2 text-sm text-foreground">
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{doc.fileName}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            ({(doc.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="shrink-0 text-xs text-red-400 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadedDocs.length > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Files are securely uploaded to your access-controlled
                    application record when you submit your application.
                  </p>
                )}
              </div>
            )}

            {form.docUploadChoice === "later" && (
              <div className="mt-4 rounded-lg border border-secondary/30 bg-secondary/10 p-3">
                <p className="text-sm text-foreground">
                  {requiresDocs ? (
                    <>
                      We&apos;ll save your application and contact you with a secure
                      upload option. Do not send records by ordinary email.{" "}
                      <strong>No payment is taken until your documents are received.</strong>
                    </>
                  ) : (
                    <>
                      You may continue to secure payment without documents for
                      this {displayPrice} intake. The reviewing provider may ask
                      for additional information later. Do not email medical records.
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Documentation acknowledgement */}
          <div className="mt-6">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-red-500/30 bg-red-500/10 p-4 hover:bg-red-500/15">
              <input
                type="checkbox"
                checked={form.acknowledgesDocumentation}
                onChange={(e) =>
                  updateField("acknowledgesDocumentation", e.target.checked)
                }
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-red-400 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-red-800">
                <strong className="text-red-700">I acknowledge:</strong>{" "}
                Selecting a condition does not guarantee qualification or approval.
                An independent licensed provider will review my application and may
                request more information. I will submit records only through the
                secure uploader. {requiresDocs
                  ? "Payment cannot begin until the system confirms a current-application document upload."
                  : "I may continue without documents at this price, but additional information may be requested later."}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="order-2 inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 sm:order-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={handleStep2Submit}
              disabled={
                !form.acknowledgesDocumentation ||
                !form.docUploadChoice ||
                (form.docUploadChoice === "now" &&
                  uploadedDocs.length === 0)
              }
              className="order-1 flex flex-1 items-center justify-center rounded-lg bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:order-2"
            >
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Patient Info + Payment */}
      {step === 3 && (
        <form onSubmit={handleStep3Submit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
            <div className={cardClass}>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                {isLeadOnlyPath
                  ? "Patient Information & Application"
                  : "Patient Information & Payment"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your information is handled according to our Privacy Policy.
              </p>

              {error && (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {uploadWarning && (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-800">{uploadWarning}</p>
                </div>
              )}

              <div className="mt-6 space-y-5">
                {/* Name */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-foreground"
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      value={form.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-foreground"
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      required
                      value={form.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-foreground"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-foreground"
                  >
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    required
                    value={form.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Residential address — stored in GHL standard contact fields */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-foreground">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      autoComplete="street-address"
                      required
                      value={form.addressLine1}
                      onChange={(event) => updateField("addressLine1", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-foreground">
                      Apartment, Suite, or Unit
                    </label>
                    <input
                      type="text"
                      id="addressLine2"
                      autoComplete="address-line2"
                      value={form.addressLine2}
                      onChange={(event) => updateField("addressLine2", event.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-foreground">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        autoComplete="address-level2"
                        required
                        value={form.city}
                        onChange={(event) => updateField("city", event.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-foreground">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        pattern="[0-9]{5}(-[0-9]{4})?"
                        required
                        value={form.postalCode}
                        onChange={(event) => updateField("postalCode", event.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* State (read-only) + Time Zone */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      State
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={stateName}
                      className="mt-1 block w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="timeZone"
                      className="block text-sm font-medium text-foreground"
                    >
                      Time Zone *
                    </label>
                    <select
                      id="timeZone"
                      required
                      value={form.timeZone}
                      onChange={(e) => updateField("timeZone", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      {timeZoneOptions.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Medical Details */}
                <div>
                  <label
                    htmlFor="medicalDetails"
                    className="block text-sm font-medium text-foreground"
                  >
                    Please explain why you need a medical exemption *
                  </label>
                  <textarea
                    id="medicalDetails"
                    required
                    rows={3}
                    value={form.medicalDetails}
                    onChange={(e) =>
                      updateField("medicalDetails", e.target.value)
                    }
                    placeholder="Describe your condition, symptoms, or any relevant medical history..."
                    className={inputClass}
                  />
                </div>

                {/* Medications */}
                <div>
                  <label
                    htmlFor="medications"
                    className="block text-sm font-medium text-foreground"
                  >
                    List any medications you are currently on
                  </label>
                  <textarea
                    id="medications"
                    rows={2}
                    value={form.medications}
                    onChange={(e) => updateField("medications", e.target.value)}
                    placeholder="e.g., Sumatriptan, Hydroxychloroquine..."
                    className={inputClass}
                  />
                </div>

                {/* Vehicles + Referral */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="numberOfVehicles"
                      className="block text-sm font-medium text-foreground"
                    >
                      Number of Vehicles
                    </label>
                    <input
                      type="text"
                      id="numberOfVehicles"
                      value={form.numberOfVehicles}
                      onChange={(e) =>
                        updateField("numberOfVehicles", e.target.value)
                      }
                      placeholder="1"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="howDidYouHear"
                      className="block text-sm font-medium text-foreground"
                    >
                      How did you hear about us?
                    </label>
                    <input
                      type="text"
                      id="howDidYouHear"
                      value={form.howDidYouHear}
                      onChange={(e) =>
                        updateField("howDidYouHear", e.target.value)
                      }
                      placeholder="Google, friend, tint shop..."
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Payment is collected only on allowed paths at Stripe. */}
                {isLeadOnlyPath ? (
                  <div className="rounded-lg border border-secondary/40 bg-secondary/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <FileText className="h-4 w-4 text-secondary" />
                      Application Saved — No Payment Today
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Submit this application without payment. MyEyeRx will contact
                      you with a secure document-upload option. Stripe checkout cannot
                      begin until this application has a confirmed document upload.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Secure Payment — {displayPrice}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      After you submit your application, you&apos;ll be taken to our
                      secure payment processor to complete your {displayPrice}{" "}
                      payment securely. Your card details are entered on
                      an encrypted page and never touch our servers.
                    </p>
                  </div>
                )}

                {/* Co-branding + privacy notice so the MyEyeRx receipt is never a surprise */}
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    {isLeadOnlyPath ? (
                      <>
                        No card information is requested today. {" "}
                        <strong className="text-foreground">{legal.providerName}</strong>{" "}
                        coordinates secure document follow-up before any payment step.
                      </>
                    ) : (
                      <>
                        Payment takes place on Stripe&apos;s hosted checkout page. Stripe
                        handles the card details; this site does not receive or store
                        them. <strong className="text-foreground">{legal.providerName}</strong>{" "}
                        coordinates the service and follow-up.
                      </>
                    )}
                  </p>
                </div>

                {/* Agreements */}
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 text-xs hover:bg-muted/40">
                    <input
                      type="checkbox"
                      required
                      checked={form.agreesToLiability}
                      onChange={(e) =>
                        updateField("agreesToLiability", e.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-input text-primary focus:ring-ring"
                    />
                    <span className="text-muted-foreground">
                      I understand that {SITE_NAME} is not a window tint company
                      and cannot determine what is a safe tint level for my
                      vision. The recommendation for window shade/tint is based
                      upon the information provided by myself. All
                      responsibilities and actions taken by the driver are that
                      of the operator of the vehicle.
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 text-xs hover:bg-muted/40">
                    <input
                      type="checkbox"
                      required
                      checked={form.agreeToTerms}
                      onChange={(e) =>
                        updateField("agreeToTerms", e.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-input text-primary focus:ring-ring"
                    />
                    <span className="text-muted-foreground">
                      I agree to the{" "}
                      <Link href="/privacy-policy" className="text-primary underline">
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link href="/refund-policy" className="text-primary underline">
                        Refund Policy
                      </Link>
                      . By providing my phone number and email, I agree to
                      receive communications regarding my application.
                    </span>
                  </label>
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(event) => updateField("website", event.target.value)}
                  />
                </div>
                <TurnstileWidget
                  onToken={setBotToken}
                  resetKey={turnstileResetKey}
                />

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="order-2 inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 sm:order-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !form.agreeToTerms ||
                      !form.agreesToLiability ||
                      !form.dateOfBirth ||
                      !form.addressLine1 ||
                      !form.city ||
                      !form.postalCode ||
                      (TURNSTILE_ENABLED && !botToken)
                    }
                    className="order-1 flex flex-1 items-center justify-center rounded-lg bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:order-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                        Processing...
                      </>
                    ) : (
                      <>
                        {isLeadOnlyPath
                          ? "Submit Application"
                          : "Submit & Continue to Payment"}{" "}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  {isLeadOnlyPath
                    ? "No payment is requested today. Our team will contact you about secure document submission."
                    : "Payment is processed securely by Stripe. Card details never pass through our servers."}
                </p>
              </div>
            </div>

            {/* Order Summary Sidebar (Step 3 only) */}
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-base font-bold text-foreground">
                  {isLeadOnlyPath ? "Application Summary" : "Order Summary"}
                </h3>
                {isLeadOnlyPath && (
                  <div className="mt-3 rounded-md border border-secondary/40 bg-secondary/10 p-3 text-xs text-foreground">
                    <strong>No payment today.</strong> Submit your application
                    and we&apos;ll collect your documents first. No payment can begin
                    until a secure upload is confirmed.
                  </div>
                )}
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {isLeadOnlyPath
                        ? "Application submission today"
                        : "Intake Review and Coordination"}
                    </span>
                    <span className="font-medium text-foreground">
                      {isLeadOnlyPath ? "$0" : displayPrice}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Secure Document Submission
                    </span>
                    <span className="font-medium text-green-400">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Application Status Support
                    </span>
                    <span className="font-medium text-green-400">Included</span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-foreground">
                        {isLeadOnlyPath ? "Total Due Today" : "Total"}
                      </span>
                      <span className="text-primary">
                        {isLeadOnlyPath ? "$0" : displayPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  What You Selected
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {form.conditions.map((c) => (
                    <span
                      key={c}
                      className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  What&apos;s Included
                </h3>
                <ul className="mt-3 space-y-2">
                  {[
                    "Online intake and preliminary screening",
                    "Coordination through MyEyeRx",
                    "Secure document submission",
                    "Application status support",
                    "Independent licensed clinician makes clinical decisions",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                <Lock className="h-4 w-4 shrink-0" />
                <span>
                  Secure, encrypted connection. Your data is protected.
                </span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
