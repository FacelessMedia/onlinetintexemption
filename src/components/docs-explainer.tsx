import { FileCheck2, Phone, ShieldCheck } from "lucide-react";
import { validatedDocsExplainerVideoUrl } from "@/lib/docs-explainer-video";

const SUPPORT_PHONE_DISPLAY = "734-338-8453";
const SUPPORT_PHONE_HREF = "tel:+17343388453";

export function DocsExplainer() {
  const videoUrl = validatedDocsExplainerVideoUrl(
    process.env.NEXT_PUBLIC_DOCS_EXPLAINER_VIDEO_URL
  );

  return (
    <section
      aria-labelledby="documents-explainer-title"
      className="mb-6 rounded-xl border border-border bg-primary/5 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <FileCheck2
          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h2
            id="documents-explainer-title"
            className="text-base font-semibold text-foreground"
          >
            What to upload
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            A relevant supporting document is required before checkout. If a record is not ready, you may still submit the intake&mdash;no payment is taken and the team follows up.
          </p>
        </div>
      </div>

      {videoUrl && (
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-black">
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
      )}

      <ul className="mt-3 flex flex-col gap-x-6 gap-y-1.5 text-sm leading-relaxed text-muted-foreground sm:flex-row sm:flex-wrap">
        <li className="flex gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Your name.
        </li>
        <li className="flex gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          The doctor, licensed professional, or facility.
        </li>
        <li className="flex gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          The relevant condition, symptoms, treatment, or surgery.
        </li>
      </ul>

      <details className="mt-3 text-sm text-muted-foreground">
        <summary className="cursor-pointer select-none font-medium text-primary">
          More about acceptable records
        </summary>
        <div className="mt-2 space-y-2 leading-relaxed">
          <p>
            Upload a readable PDF, JPG/JPEG, or PNG, up to 4 MB per file. A
            driver&apos;s license, vehicle registration, insurance card, blank
            page, or unrelated image is not medical proof by itself.
          </p>
          <p>
            For a surgery-related request, a short letter on the provider&apos;s
            letterhead confirming treatment at that facility may be useful for
            initial review. The team may request a clearer or additional record.
          </p>
          <p>
            Submit records only through the secure uploader&mdash;not chat,
            ordinary email, or text. MyEyeRx reviews the material before filing
            and does not send an application it believes lacks the required
            support. Clinical and state decisions remain independent and are not
            guaranteed.
          </p>
        </div>
      </details>

      <a
        href={SUPPORT_PHONE_HREF}
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <Phone className="h-4 w-4" aria-hidden="true" />
        Questions? Call {SUPPORT_PHONE_DISPLAY}
      </a>
    </section>
  );
}
