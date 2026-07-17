import { FileCheck2, FileText, Phone, ShieldCheck } from "lucide-react";
import { validatedDocsExplainerVideoUrl } from "@/lib/docs-explainer-video";

const SUPPORT_PHONE_DISPLAY = "734-338-9453";
const SUPPORT_PHONE_HREF = "tel:+17343389453";

export function DocsExplainer() {
  const videoUrl = validatedDocsExplainerVideoUrl(
    process.env.NEXT_PUBLIC_DOCS_EXPLAINER_VIDEO_URL
  );

  return (
    <section
      aria-labelledby="documents-explainer-title"
      className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="border-b border-border bg-primary/5 px-5 py-5 sm:px-7">
        <div className="flex items-start gap-3">
          <FileCheck2 className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 id="documents-explainer-title" className="text-xl font-semibold text-foreground">
              What to upload and when it is required
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              A relevant supporting document is required before checkout for
              intakes priced at $250 or more. At $225, you may upload a useful
              record now or continue to payment without one.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If a required record is not ready, you may still submit the intake.
              It is saved without payment so the team can follow up securely.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {videoUrl ? (
          <div className="overflow-hidden rounded-xl border border-border bg-black">
            <div className="aspect-video">
              <iframe
                src={videoUrl}
                title="MyEyeRx supporting-document and intake process video"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allow="encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          </div>
        ) : (
          <div className="flex min-h-52 flex-col justify-center rounded-xl border border-border bg-muted/30 p-6">
            <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
            <p className="mt-3 font-semibold text-foreground">Supporting-document guide</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Use the written checklist here while the optional video guide is
              unavailable. You will receive the same instructions in the secure
              intake.
            </p>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-foreground">A useful record commonly shows:</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />Your name.</li>
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />The doctor, licensed professional, or medical facility.</li>
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />The relevant condition, symptoms, treatment, or surgery.</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            For a surgery-related request, a short letter on the provider&apos;s
            letterhead confirming treatment at that facility may be useful for
            initial review. The team may request a clearer or additional record.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Upload a readable PDF, JPG/JPEG, or PNG, up to 4 MB per file. A
            driver&apos;s license, vehicle registration, insurance card, blank
            page, or unrelated image is not medical proof by itself.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Submit records only through the secure uploader—not chat, ordinary
            email, or text. MyEyeRx reviews the material before filing and does
            not send an application it believes lacks the required support.
            Clinical and state decisions remain independent and are not guaranteed.
          </p>
          <a
            href={SUPPORT_PHONE_HREF}
            className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Questions? Call {SUPPORT_PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </section>
  );
}
