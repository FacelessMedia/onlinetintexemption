"use client";

import { useState, useRef } from "react";
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
import {
  qualifyingConditions,
  durationOptions,
  frequencyOptions,
  timeZoneOptions,
  requiredDocumentation,
  isPrequalified,
} from "@/lib/prequalification";
import {
  CloverPaymentFields,
  translateCloverError,
  type CloverPaymentFieldsHandle,
} from "@/components/clover-payment-fields";

const SITE_NAME = "Online Tint Exemption";

type Step = 1 | 2 | 3;

interface BookingFormProps {
  stateName: string;
  stateSlug: string;
  price: number;
  originalPrice: number;
}

interface FormData {
  // Step 1 — Prequalification
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
  agreesNoRefund: boolean;
  // Step 3 — Patient Info + Payment
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timeZone: string;
  medicalDetails: string;
  medications: string;
  numberOfVehicles: string;
  howDidYouHear: string;
  agreeToTerms: boolean;
  agreesToLiability: boolean;
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
  agreesNoRefund: false,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  timeZone: "",
  medicalDetails: "",
  medications: "",
  numberOfVehicles: "",
  howDidYouHear: "",
  agreeToTerms: false,
  agreesToLiability: false,
};

// When NEXT_PUBLIC_CLOVER_TEST_MODE is "true", the server charges $1.00 instead
// of the per-state price. Mirror that in the UI so users see what will actually
// post to their card. Both flags must be unset on Vercel to go live.
const IS_TEST_MODE = process.env.NEXT_PUBLIC_CLOVER_TEST_MODE === "true";
const TEST_MODE_PRICE = "$1.00";

// Shared field styles (onlinetint token theme)
const inputClass =
  "mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring";
const cardClass = "rounded-xl border border-border bg-card p-6 sm:p-8";

export function BookingForm({
  stateName,
  stateSlug,
  price,
  originalPrice,
}: BookingFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const disqualifyRef = useRef<HTMLDivElement>(null);
  const cloverRef = useRef<CloverPaymentFieldsHandle>(null);
  const [disqualifyReason, setDisqualifyReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fullPrice = `$${price}`;
  const displayPrice = IS_TEST_MODE ? TEST_MODE_PRICE : fullPrice;

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
    const result = isPrequalified({
      conditions: form.conditions,
      duration: form.duration,
      frequency: form.frequency,
      isLicensedDriver: form.isLicensedDriver,
      isIntendedDriver: form.isIntendedDriver,
      hasSeenDoctor: form.hasSeenDoctor,
    });
    if (!result.qualified) {
      setDisqualifyReason(result.reason || "You do not qualify at this time.");
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

  // Per-file upload tracking. Files are CHOSEN (held in browser memory) during
  // Step 2 but only uploaded to GHL AFTER payment succeeds, when we have the
  // contactId returned by /api/submit-order. Uploading post-payment lets us
  // attach files directly to the contact's HIPAA-scoped FILE_UPLOAD custom
  // field rather than to a public-CDN media library.
  type UploadStatus = "ready" | "uploading" | "done" | "error";
  interface UploadedDoc {
    file: File;
    fileName: string;
    size: number;
    status: UploadStatus;
    error?: string;
  }
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [contactId, setContactId] = useState<string | null>(null);
  const isAnyUploading = uploadedDocs.some((d) => d.status === "uploading");
  const hasUploadError = uploadedDocs.some((d) => d.status === "error");
  const allUploadsDone =
    uploadedDocs.length > 0 && uploadedDocs.every((d) => d.status === "done");

  async function uploadOne(file: File, indexInState: number, cId: string) {
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
      fd.append("contactId", cId);
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
        return;
      }
      setUploadedDocs((prev) =>
        prev.map((d, i) =>
          i === indexInState ? { ...d, status: "done", error: undefined } : d
        )
      );
    } catch (err) {
      console.error("[upload-doc] network error:", err);
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
    if (!contactId) return;
    const doc = uploadedDocs[index];
    if (doc) void uploadOne(doc.file, index, contactId);
  }

  function handleStep2Submit() {
    if (!form.agreesNoRefund || !form.docUploadChoice) return;
    // Files are NOT uploaded yet at this point — they're held in memory and
    // will upload AFTER payment using the contactId we get back.
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleStep3Submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Tokenize card via Clover iframe (card data never touches our server).
      if (!cloverRef.current) {
        throw new Error("Payment form is still loading. Please wait a moment.");
      }
      let sourceToken: string;
      try {
        sourceToken = await cloverRef.current.tokenize();
      } catch (cloverErr) {
        const msg =
          cloverErr instanceof Error
            ? translateCloverError(cloverErr.message)
            : translateCloverError(String(cloverErr));
        throw new Error(msg);
      }

      // 2. Submit order with the source token. We send stateSlug so the SERVER
      // can look up the authoritative price — the client-sent amount is never
      // trusted for the charge.
      const res = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          state: stateName,
          stateSlug,
          condition: form.conditions.join(", "),
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
          sourceToken,
        }),
      });

      if (!res.ok) {
        let serverMessage = "";
        let stage: string | undefined;
        let detail: string | undefined;
        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          try {
            const data = await res.json();
            serverMessage = String(data?.error ?? data?.message ?? "");
            stage = data?.stage;
            detail = data?.detail;
            console.error("[submit-order] error response:", {
              status: res.status,
              error: serverMessage,
              stage,
              detail,
              data,
            });
          } catch (parseErr) {
            console.error("[submit-order] failed to parse JSON error:", parseErr);
          }
        } else {
          try {
            serverMessage = (await res.text()).slice(0, 500);
            console.error("[submit-order] non-JSON error response:", {
              status: res.status,
              statusText: res.statusText,
              body: serverMessage,
            });
          } catch {}
        }
        if (!serverMessage) {
          serverMessage = `Unexpected server response (${res.status}). Please try again or contact support.`;
        }
        throw new Error(serverMessage);
      }

      // Capture contactId from the server's success payload — we need it to
      // attach uploaded files to the contact's FILE_UPLOAD custom field.
      let returnedContactId: string | null = null;
      try {
        const successData = await res.json();
        if (typeof successData?.contactId === "string" && successData.contactId) {
          returnedContactId = successData.contactId;
          setContactId(returnedContactId);
        }
      } catch {
        // Non-JSON or parse error — request still succeeded; we just can't
        // auto-trigger uploads. The customer can email docs as a fallback.
      }
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Kick off file uploads in parallel for any files staged during Step 2.
      if (returnedContactId && form.docUploadChoice === "now") {
        uploadedDocs.forEach((doc, idx) => {
          if (doc.status === "ready") {
            void uploadOne(doc.file, idx, returnedContactId as string);
          }
        });
      }
    } catch (err) {
      console.error("[booking-form] submit failed:", err);
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
    const showUploads =
      form.docUploadChoice === "now" && uploadedDocs.length > 0;
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-green-500/30 bg-green-500/10 p-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold text-green-300">
            Payment Received
          </h2>
          <p className="mt-3 text-green-200/90">
            Thank you, {form.firstName}! Your {stateName} window tint medical
            exemption application has been received. A licensed physician will
            review your documentation within 24 hours.
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
                All documents securely attached to your patient record.
              </p>
            )}
            <div className="mt-3 space-y-2">
              {uploadedDocs.map((doc, idx) => {
                const tone =
                  doc.status === "done"
                    ? "border-green-500/30 bg-green-500/10 text-green-300"
                    : doc.status === "error"
                      ? "border-red-500/30 bg-red-500/10 text-red-300"
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
                      <p className="mt-1 text-xs text-red-300">{doc.error}</p>
                    )}
                  </div>
                );
              })}
            </div>
            {hasUploadError && (
              <p className="mt-3 text-xs text-red-300">
                Some files didn&apos;t upload. Click <strong>Retry</strong> to
                try again, or email them to{" "}
                <a
                  href={`mailto:${legal.contactEmail}`}
                  className="font-semibold underline"
                >
                  {legal.contactEmail}
                </a>{" "}
                and reference your name and email ({form.email}). Your payment is
                already secure — we just need the documents to process your
                exemption.
              </p>
            )}
          </div>
        )}

        {form.docUploadChoice === "later" && (
          <div className="mt-6 rounded-lg border border-secondary/30 bg-secondary/10 p-4 text-left">
            <p className="text-sm text-foreground">
              <strong>Next step:</strong> we&apos;ll email you shortly with
              instructions to upload your medical documentation. Your exemption
              cannot be issued until those documents are received.
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-green-200/80">
          We will reach out to <strong>{form.email}</strong> with next steps.
          Please check your inbox (and spam folder).
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Prequalification", Icon: Stethoscope },
            { num: 2, label: "Documentation", Icon: Shield },
            { num: 3, label: "Payment", Icon: CreditCard },
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

      {/* STEP 1 — Prequalification */}
      {step === 1 && (
        <div className={cardClass}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Medical Prequalification
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Answer the questions below to see if you prequalify for a{" "}
              {stateName} window tint medical exemption.
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
                  <p className="text-sm font-medium text-red-300">
                    {disqualifyReason}
                  </p>
                  <p className="mt-1 text-xs text-red-300/80">
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
          {/* Pre-Approved Banner */}
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-5 text-center">
            <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
            <h2 className="mt-3 text-xl font-bold text-green-300 sm:text-2xl">
              You Are Pre-Approved!
            </h2>
            <p className="mt-2 text-sm text-green-200/90">
              Based on your responses, you prequalify for a {stateName} window
              tint medical exemption. Please read the documentation requirements
              below carefully before proceeding.
            </p>
          </div>

          {/* IMPORTANT WARNING */}
          <div className="mb-6 rounded-lg border-2 border-red-500/40 bg-red-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />
              <div>
                <h3 className="text-base font-bold text-red-300">
                  Important: Read Before Paying
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-red-200/90">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span>
                      If you purchase this service{" "}
                      <strong>without having proper medical documentation</strong>
                      , your application <strong>will be denied</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span>
                      It is <strong>your responsibility</strong> to have
                      legitimate medical records, a doctor&apos;s note, or
                      specialist documentation that confirms your qualifying
                      condition.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span>
                      <strong>All sales are final.</strong> No refunds will be
                      issued if you fail to provide acceptable documentation.
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
                  <strong className="text-foreground">
                    Call us BEFORE paying
                  </strong>{" "}
                  and we will verify your documentation is acceptable. This
                  protects you from purchasing a service you cannot use.
                </p>
              </div>
            </div>
          </div>

          {/* Required Documentation List */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground">
              Required Documentation
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You must provide at least one of the following:
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
              Uploading your documents now will{" "}
              <strong className="text-foreground">expedite the process</strong>{" "}
              of getting your exemption. You may also upload them later after
              purchase.
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
                    Faster processing
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
                  <span className="block font-semibold">Upload Later</span>
                  <span className="block text-xs text-muted-foreground">
                    After purchase
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
                    PDF, JPG, PNG, or HEIC up to 4MB each
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.heic"
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
                          className="shrink-0 text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadedDocs.length > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Files will be securely uploaded to your patient record after
                    payment is complete.
                  </p>
                )}
              </div>
            )}

            {form.docUploadChoice === "later" && (
              <div className="mt-4 rounded-lg border border-secondary/30 bg-secondary/10 p-3">
                <p className="text-sm text-foreground">
                  You will receive an email after purchase with instructions on
                  how to upload your documentation.{" "}
                  <strong>
                    Your exemption cannot be processed until documentation is
                    received.
                  </strong>
                </p>
              </div>
            )}
          </div>

          {/* No Refund Agreement */}
          <div className="mt-6">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-red-500/30 bg-red-500/10 p-4 hover:bg-red-500/15">
              <input
                type="checkbox"
                checked={form.agreesNoRefund}
                onChange={(e) => updateField("agreesNoRefund", e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-red-400 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-red-200/90">
                <strong className="text-red-300">I understand and agree:</strong>{" "}
                If I purchase this service without having legitimate medical
                documentation to support my condition, my application will be
                denied and <strong>no refund will be issued</strong>. It is my
                responsibility to ensure I have proper paperwork. If I am unsure
                whether my documentation qualifies, I will call before paying.
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
              disabled={!form.agreesNoRefund || !form.docUploadChoice}
              className="order-1 flex flex-1 items-center justify-center rounded-lg bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:order-2"
            >
              Proceed to Payment <ArrowRight className="ml-2 h-5 w-5" />
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
                Patient Information &amp; Payment
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                All information is kept confidential and HIPAA compliant.
              </p>

              {error && (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <p className="text-sm text-red-300">{error}</p>
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

                {/* Payment Section — Clover iframe (card data never touches our server) */}
                <CloverPaymentFields ref={cloverRef} />

                {/* Co-branding + privacy notice so the MyEyeRx receipt is never a surprise */}
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    For your privacy, your card statement and emailed receipt
                    will appear as{" "}
                    <strong className="text-foreground">
                      {legal.providerName}
                    </strong>{" "}
                    — never your medical condition. Your payment is secured with
                    256-bit encryption and your card is never stored on our
                    servers.
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
                      <a href="/privacy-policy" className="text-primary underline">
                        Privacy Policy
                      </a>{" "}
                      and{" "}
                      <a href="/refund-policy" className="text-primary underline">
                        Refund Policy
                      </a>
                      . By providing my phone number and email, I agree to
                      receive communications regarding my application.
                    </span>
                  </label>
                </div>

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
                      loading || !form.agreeToTerms || !form.agreesToLiability
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
                        Submit Application — {displayPrice}{" "}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  Payments processed securely. Your data is encrypted and HIPAA
                  compliant.
                </p>
              </div>
            </div>

            {/* Order Summary Sidebar (Step 3 only) */}
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-base font-bold text-foreground">
                  Order Summary
                </h3>
                {IS_TEST_MODE && (
                  <div className="mt-3 rounded-md border border-secondary/40 bg-secondary/10 p-3 text-xs text-foreground">
                    <strong>Test Mode:</strong> your card will be charged{" "}
                    {TEST_MODE_PRICE} instead of {fullPrice}. All other logic is
                    live (real Clover charge, real GHL contact).
                  </div>
                )}
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Medical Consultation
                    </span>
                    <span className="font-medium text-foreground">
                      {displayPrice}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Documentation Review
                    </span>
                    <span className="font-medium text-green-400">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Exemption Certificate
                    </span>
                    <span className="font-medium text-green-400">Included</span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">{displayPrice}</span>
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
                    "Licensed physician consultation",
                    "Medical condition assessment",
                    "Official exemption certificate",
                    "Digital delivery (instant)",
                    "Valid for vehicle registration",
                    "Customer support",
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
