import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getStateBySlug } from "@/data/states";
import { requiresDocumentsForPrice } from "@/lib/docs-policy";
import { ensureApplicationSnapshot } from "@/lib/application-snapshot";
import {
  contactHasTag,
  ghlConfig,
  GHL_TAGS,
  opportunityLifecycleTag,
  routeMissingDocsLead,
  upsertContact,
  createOpportunity,
} from "@/lib/ghl";
import { issueOrderToken } from "@/lib/order-token";
import {
  checkRateLimit,
  getClientIp,
  isSameOriginRequest,
  readBoundedJson,
  RequestBodyError,
  securityConfigurationErrors,
  verifyBotChallenge,
} from "@/lib/request-security";
import {
  firstValidationError,
  submitOrderSchema,
} from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const securityErrors = securityConfigurationErrors("intake");
  if (securityErrors.length > 0) {
    console.error("Strict security configuration is incomplete:", securityErrors);
    return NextResponse.json({ error: "Application intake is temporarily unavailable." }, { status: 503 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const ip = getClientIp(request);
  let rate: Awaited<ReturnType<typeof checkRateLimit>>;
  try {
    rate = await checkRateLimit(`submit:${ip}`, 5, 10 * 60);
  } catch {
    return NextResponse.json(
      { error: "Security service is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await readBoundedJson(request, 32 * 1024);
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    const message = status === 413
      ? "Request is too large."
      : status === 415
        ? "Content-Type must be application/json."
        : "Invalid request.";
    return NextResponse.json({ error: message }, { status });
  }

  const parsed = submitOrderSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstValidationError(parsed.error) },
      { status: 400 }
    );
  }
  const body = parsed.data;

  const elapsed = Date.now() - body.formStartedAt;
  if (elapsed < 3_000 || elapsed > 2 * 60 * 60 * 1_000) {
    return NextResponse.json(
      { error: "This form session is invalid or expired. Please refresh and try again." },
      { status: 400 }
    );
  }

  if (!(await verifyBotChallenge(body.botToken, request))) {
    return NextResponse.json(
      { error: "Please complete the security check and try again." },
      { status: 403 }
    );
  }

  let identityRate: Awaited<ReturnType<typeof checkRateLimit>>;
  try {
    identityRate = await checkRateLimit(
      `submit-identity:${body.email.toLowerCase()}:${body.phone.replace(/\D/g, "")}`,
      3,
      60 * 60
    );
  } catch {
    return NextResponse.json(
      { error: "Security service is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
  if (!identityRate.allowed) {
    return NextResponse.json(
      { error: "Too many applications were submitted for this contact information. Please contact support." },
      { status: 429, headers: { "Retry-After": String(identityRate.retryAfter) } }
    );
  }

  const stateData = getStateBySlug(body.stateSlug);
  if (!stateData?.offered || !stateData.price || stateData.price <= 0) {
    return NextResponse.json(
      { error: "We do not currently offer online service for that state." },
      { status: 400 }
    );
  }

  const requiredConfig = [
    ["GHL_API_KEY", ghlConfig.apiKey],
    ["GHL_LOCATION_ID", ghlConfig.locationId],
    ["GHL_PIPELINE_ID", ghlConfig.pipelineId],
    ["GHL_STAGE_INFO_SUBMITTED", ghlConfig.stageInfoSubmitted],
    ["GHL_STAGE_NEEDS_DOCS", ghlConfig.stageNeedsDocs],
    [
      "GHL_INTERNAL_NOTIFICATION_CONTACT_ID",
      ghlConfig.internalNotificationContactId,
    ],
    ["ORDER_TOKEN_SECRET", process.env.ORDER_TOKEN_SECRET || ""],
  ].filter(([, value]) => !value);
  if (requiredConfig.length > 0) {
    console.error(
      "submit-order missing configuration:",
      requiredConfig.map(([name]) => name)
    );
    return NextResponse.json(
      { error: "Application intake is temporarily unavailable. Please contact support." },
      { status: 503 }
    );
  }

  const priceDollars = stateData.price;
  const requiresDocs = requiresDocumentsForPrice(priceDollars);

  try {
    // No checkout is possible unless both the contact and opportunity exist.
    // The contact remains in GHL if opportunity creation fails, preserving the
    // lead for manual recovery while the browser receives a retryable error.
    const contactId = await upsertContact({
      ...body,
      state: stateData.name,
      stateCode: stateData.abbreviation,
    });
    // Scope client retry idempotency to this site and state. Reusing a UUID on
    // another fleet site/state can never attach checkout to the wrong CRM deal.
    const submissionReference = `web-${createHash("sha256")
      .update(`${ghlConfig.siteName}:${stateData.slug}:${body.submissionId}`)
      .digest("hex")
      .slice(0, 32)}`;
    const opportunityId = await createOpportunity(
      contactId,
      `${body.firstName} ${body.lastName} - ${stateData.name} Tint Exemption`,
      priceDollars,
      ghlConfig.stageInfoSubmitted,
      submissionReference,
      "open"
    );
    await ensureApplicationSnapshot({
      contactId,
      opportunityId,
      submissionReference,
      siteName: ghlConfig.siteName,
      stateName: stateData.name,
      priceDollars,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      dateOfBirth: body.dateOfBirth,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2,
      city: body.city,
      postalCode: body.postalCode,
      conditions: body.conditions,
      otherCondition: body.conditions.includes("Other")
        ? body.otherCondition
        : "",
      details: body.details,
      medications: body.medications,
      duration: body.duration,
      frequency: body.frequency,
      hasSeenDoctor: body.hasSeenDoctor,
      hasTintedBefore: body.hasTintedBefore,
      currentTintPercent: body.currentTintPercent,
      isLicensedDriver: body.isLicensedDriver,
      isIntendedDriver: body.isIntendedDriver,
      numberOfVehicles: body.numberOfVehicles,
      timeZone: body.timeZone,
      howDidYouHear: body.howDidYouHear,
      docUploadChoice: body.docUploadChoice,
    });

    // Every application must have either current-application document
    // proof or a confirmed per-opportunity Tory alert before the browser gets
    // a token that can upload or open Stripe. This includes "upload now": the
    // alert is the abandonment safety net and the applicant may still upload
    // immediately afterward. A legacy/retry application with this exact
    // opportunity's server-written upload marker does not need a new alert.
    let currentApplicationDocsConfirmed = false;
    if (requiresDocs) {
      try {
        currentApplicationDocsConfirmed = await contactHasTag(
          contactId,
          opportunityLifecycleTag(GHL_TAGS.docsUploaded, opportunityId)
        );
      } catch {
        // A failed marker read is not proof. Fail toward the notification path.
        console.error("Current-application document marker read failed");
      }
    }

    let notificationQueued = false;
    let workflowQueued = false;
    if (requiresDocs && !currentApplicationDocsConfirmed) {
      const notification = await routeMissingDocsLead(
        contactId,
        opportunityId,
        stateData.name,
        priceDollars
      );
      notificationQueued = notification.emailQueued;
      workflowQueued = notification.workflowQueued;
      if (!notificationQueued) {
        return NextResponse.json(
          {
            saved: true,
            retryable: true,
            error:
              "Your application is saved, but secure follow-up is still being confirmed. Complete the security check and try once more. No payment was taken.",
          },
          { status: 503, headers: { "Retry-After": "3" } }
        );
      }
    }

    const orderToken = issueOrderToken(
      {
        contactId,
        opportunityId,
        stateSlug: stateData.slug,
        stateName: stateData.name,
        priceDollars,
        siteName: ghlConfig.siteName,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
      },
      `${ghlConfig.siteName}:${stateData.slug}:${submissionReference}:${opportunityId}`
    );

    // "Upload later" remains a saved, unpaid lead at every price. "Upload now"
    // receives the token only after the alert above and may proceed through the
    // secure upload.
    if (requiresDocs && body.docUploadChoice === "later") {
      return NextResponse.json({
        success: true,
        blocked: true,
        requiresDocs: true,
        notificationQueued,
        workflowQueued,
        orderToken,
        message:
          "Your application is saved. No payment was taken. Our team will contact you about acceptable medical documentation.",
      });
    }

    return NextResponse.json({
      success: true,
      requiresDocs,
      notificationQueued: requiresDocs
        ? notificationQueued || currentApplicationDocsConfirmed
        : undefined,
      orderToken,
    });
  } catch {
    console.error("Application CRM save failed");
    return NextResponse.json(
      {
        error:
          "We could not finish saving your application. No payment was taken. Please try again or contact support.",
      },
      { status: 502 }
    );
  }
}
