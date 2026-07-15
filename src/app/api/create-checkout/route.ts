import { NextRequest, NextResponse } from "next/server";
import { getStateBySlug } from "@/data/states";
import { requiresDocumentsForPrice } from "@/lib/docs-policy";
import {
  addTagToContact,
  contactHasDocs,
  ghlConfig,
  GHL_TAGS,
  moveOpportunityStage,
  routeMissingDocsLead,
} from "@/lib/ghl";
import { verifyOrderToken } from "@/lib/order-token";
import { verifyUploadReceipt } from "@/lib/upload-receipt";
import {
  checkRateLimit,
  getCanonicalOrigin,
  getClientIp,
  isSameOriginRequest,
  readBoundedJson,
  RequestBodyError,
  securityConfigurationErrors,
} from "@/lib/request-security";
import { createStripeCheckoutSession } from "@/lib/stripe-checkout";
import {
  createCheckoutSchema,
  firstValidationError,
} from "@/lib/validation";

export const runtime = "nodejs";

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function pendingDocumentConfirmation() {
  return NextResponse.json(
    {
      pending: true,
      retryable: true,
      message:
        "Your document was received and is still being confirmed. We are retrying secure payment setup.",
    },
    { status: 202, headers: { "Retry-After": "2" } }
  );
}

function pendingApplicationStatusConfirmation() {
  return NextResponse.json(
    {
      pending: true,
      retryable: true,
      message:
        "Your document is confirmed, but your application status is still updating. We are retrying secure payment setup.",
    },
    { status: 202, headers: { "Retry-After": "2" } }
  );
}

export async function POST(request: NextRequest) {
  const securityErrors = securityConfigurationErrors("checkout");
  if (securityErrors.length > 0) {
    console.error("Strict security configuration is incomplete:", securityErrors);
    return NextResponse.json({ error: "Secure payment is temporarily unavailable." }, { status: 503 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const ip = getClientIp(request);
  let ipRate: Awaited<ReturnType<typeof checkRateLimit>>;
  try {
    // Document/stage propagation retries do not touch Stripe. Give those
    // bounded preflight polls their own budget so a transient GHL delay cannot
    // consume the much tighter payment-session/card-testing budget below.
    ipRate = await checkRateLimit(`checkout-preflight-ip:${ip}`, 30, 60 * 60);
  } catch {
    return NextResponse.json(
      { error: "Security service is temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
  if (!ipRate.allowed) {
    return NextResponse.json(
      { error: "Too many payment attempts. Please wait or contact support." },
      { status: 429, headers: { "Retry-After": String(ipRate.retryAfter) } }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await readBoundedJson(request, 8 * 1024);
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    const message = status === 413
      ? "Request is too large."
      : status === 415
        ? "Content-Type must be application/json."
        : "Invalid request.";
    return NextResponse.json({ error: message }, { status });
  }
  const parsed = createCheckoutSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstValidationError(parsed.error) },
      { status: 400 }
    );
  }

  let order;
  try {
    order = verifyOrderToken(parsed.data.orderToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid order session";
    return NextResponse.json({ error: message }, { status: 401 });
  }
  if (order.siteName !== ghlConfig.siteName) {
    return NextResponse.json({ error: "Invalid order session." }, { status: 401 });
  }

  const state = getStateBySlug(order.stateSlug);
  if (
    !state?.offered ||
    !state.price ||
    state.price <= 0 ||
    state.name !== order.stateName ||
    state.price !== order.priceDollars
  ) {
    return NextResponse.json(
      { error: "This application no longer matches the current state offering. Please restart." },
      { status: 409 }
    );
  }

  try {
    // Validates the server-owned price and applies the code-owned all-orders
    // document policy. Keep this check server-side even though the form mirrors
    // it for the customer experience.
    if (!requiresDocumentsForPrice(state.price)) {
      throw new Error("Checkout document policy is unavailable");
    }
    let receiptConfirmed = false;
    if (parsed.data.uploadReceipt) {
      try {
        verifyUploadReceipt(parsed.data.uploadReceipt, {
          orderJti: order.jti,
          contactId: order.contactId,
          siteName: order.siteName,
        });
        receiptConfirmed = true;
      } catch {
        receiptConfirmed = false;
      }
    }

    if (!receiptConfirmed) {
      const notification = await routeMissingDocsLead(
        order.contactId,
        order.opportunityId,
        state.name,
        state.price
      );
      if (!notification.emailQueued) {
        return NextResponse.json(
          {
            pending: true,
            retryable: true,
            message:
              "Your application is saved, but secure document follow-up is still being confirmed. No payment was taken.",
          },
          { status: 202, headers: { "Retry-After": "3" } }
        );
      }
      return NextResponse.json({
        blocked: true,
        requiresDocs: true,
        notificationQueued: notification.emailQueued,
        workflowQueued: notification.workflowQueued,
        message:
          "Your application is saved. No payment was taken. Our team will contact you about acceptable medical documentation.",
      });
    }

    // A signed receipt proves this order completed an upload, while the GHL
    // FILE_UPLOAD read proves the file was accepted into the CRM. Require both
    // before opening Stripe at every price.
    let hasDocs = false;
    try {
      hasDocs = await contactHasDocs(order.contactId);
      if (!hasDocs) {
        // GHL can be briefly eventually consistent after upload. Poll, but
        // never trust the browser or receipt alone as proof of the stored file.
        for (const delay of [500, 1_000, 1_500]) {
          await sleep(delay);
          hasDocs = await contactHasDocs(order.contactId);
          if (hasDocs) break;
        }
      }
    } catch {
      return pendingDocumentConfirmation();
    }

    if (receiptConfirmed && !hasDocs) {
      // A valid fresh-upload receipt means this is propagation delay, not a
      // no-document lead. Let the browser retry this same signed order.
      return pendingDocumentConfirmation();
    }

    // The upload route attempts this transition immediately, but checkout owns
    // the final clean-data invariant. Never open Stripe while this exact
    // opportunity can still be parked in Docs Needed; a 202 lets the browser
    // retry without asking the customer to upload the medical file again.
    try {
      await moveOpportunityStage(
        order.opportunityId,
        ghlConfig.stageInfoSubmitted,
        "open"
      );
    } catch {
      return pendingApplicationStatusConfirmation();
    }

    const canonicalOrigin = getCanonicalOrigin();
    let paymentIpRate: Awaited<ReturnType<typeof checkRateLimit>>;
    let paymentOrderRate: Awaited<ReturnType<typeof checkRateLimit>>;
    try {
      paymentIpRate = await checkRateLimit(
        `checkout-payment-ip:${ip}`,
        4,
        15 * 60
      );
      paymentOrderRate = await checkRateLimit(
        `checkout-payment-order:${order.jti}`,
        2,
        60 * 60
      );
    } catch {
      return NextResponse.json(
        { error: "Security service is temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }
    if (!paymentIpRate.allowed || !paymentOrderRate.allowed) {
      const retryAfter = Math.max(
        paymentIpRate.retryAfter,
        paymentOrderRate.retryAfter
      );
      return NextResponse.json(
        { error: "A payment session already exists for this application." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const metadata: Record<string, string> = {
      source_system: "tint-exemption-sites",
      site: new URL(canonicalOrigin).hostname,
      site_name: ghlConfig.siteName,
      state: state.name,
      state_slug: state.slug,
      ghl_contact_id: order.contactId,
      ghl_opportunity_id: order.opportunityId,
      docs: "yes",
      docs_current_submission: "yes",
      order_jti: order.jti,
    };

    const session = await createStripeCheckoutSession({
      productName: `${state.name} Tint Exemption`,
      amountCents: state.price * 100,
      customer: {
        firstName: order.firstName,
        lastName: order.lastName,
        email: order.email,
        phoneNumber: order.phone,
      },
      metadata,
      clientReferenceId: order.contactId,
      idempotencyKey: `tint-order-${order.jti}`,
      successUrl: `${canonicalOrigin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${canonicalOrigin}/book/${state.slug}`,
    });

    try {
      await addTagToContact(order.contactId, GHL_TAGS.checkoutStarted);
    } catch {
      // The hosted URL is already created and is the authoritative result. A
      // noncritical lifecycle tag must never hide it and tempt the customer to
      // create another cart.
      console.error("Post-checkout GHL tag operation failed");
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: session.href,
      checkoutSessionId: session.checkoutSessionId,
      amount: state.price * 100,
      provider: "stripe",
    });
  } catch {
    // Stripe/provider error objects can contain request and customer metadata.
    // Keep logs deliberately generic.
    console.error("Secure checkout creation failed");
    return NextResponse.json(
      {
        error:
          "We could not start secure payment. No payment was taken. Please try again or contact support.",
      },
      { status: 502 }
    );
  }
}
