"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Lock, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Clover?: new (
      apiAccessKey: string,
      options?: { merchantId?: string; locale?: string }
    ) => CloverInstance;
  }
}

interface CloverInstance {
  elements: () => CloverElements;
  createToken: () => Promise<CloverTokenResult>;
}

interface CloverElements {
  create: (
    type: "CARD_NUMBER" | "CARD_DATE" | "CARD_CVV" | "CARD_POSTAL_CODE",
    styles?: Record<string, unknown>
  ) => CloverElement;
}

interface CloverElement {
  mount: (selector: string) => void;
  unmount?: () => void;
  addEventListener: (
    event: "change" | "blur" | "focus",
    handler: (e: CloverChangeEvent) => void
  ) => void;
}

interface CloverChangeEvent {
  CARD_NUMBER?: { error?: string; touched?: boolean };
  CARD_DATE?: { error?: string; touched?: boolean };
  CARD_CVV?: { error?: string; touched?: boolean };
  CARD_POSTAL_CODE?: { error?: string; touched?: boolean };
}

interface CloverTokenResult {
  token?: string;
  errors?: Record<string, string>;
  error?: { message?: string } | string;
}

export interface CloverPaymentFieldsHandle {
  tokenize: () => Promise<string>;
  isReady: () => boolean;
}

// Translate raw Clover SDK error strings into user-friendly messages.
// Exported so the booking form can run the same translation on errors
// that bubble up from the API route.
export function translateCloverError(input: unknown): string {
  const raw = (
    typeof input === "string"
      ? input
      : input && typeof input === "object" && "message" in input
      ? String((input as { message?: unknown }).message ?? "")
      : String(input ?? "")
  ).trim();

  // HTTP status text passthroughs are useless to end users.
  if (/^[1-5]\d{2}\s/.test(raw) || /^(Bad Request|Unauthorized|Forbidden|Not Found|Internal Server Error)$/i.test(raw)) {
    return "Our payment processor couldn't read this card. Please re-check the number, expiration, CVV, and ZIP and try again. If the problem persists, contact us so we can investigate.";
  }

  // Specific Clover SDK init errors that indicate a merchant-config problem.
  if (/iframe_recaptcha_setting|ecommPaymentConfig|ecomm payment config/i.test(raw)) {
    return "The payment form couldn't initialize. Please refresh the page and try again. If you keep seeing this, contact support — our payment processor needs a configuration adjustment.";
  }

  // Common card-data errors — pass through with light cleanup.
  if (/expired|cvc|cvv|zip|postal|number/i.test(raw) && raw.length < 200) {
    return raw;
  }

  if (!raw || raw.length > 240) {
    return "We couldn't process this card. Please verify the details or try a different card.";
  }
  return raw;
}

export const CloverPaymentFields = forwardRef<CloverPaymentFieldsHandle>(
  function CloverPaymentFields(_props, ref) {
    const cloverRef = useRef<CloverInstance | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [ready, setReady] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    useEffect(() => {
      let cancelled = false;
      let pollHandle: ReturnType<typeof setInterval> | null = null;

      function init() {
        if (cancelled) return;
        if (!window.Clover) return;

        const publicKey = process.env.NEXT_PUBLIC_CLOVER_PUBLIC;

        if (!publicKey) {
          setInitError(
            "Payment form is not configured. Please contact support."
          );
          console.error("Clover env var missing: NEXT_PUBLIC_CLOVER_PUBLIC");
          return;
        }

        try {
          // IMPORTANT: Do NOT pass merchantId to the Clover constructor.
          // Per Clover docs, merchantId is only required for reCAPTCHA and
          // street-address-input features. We use basic card + postal code
          // elements only. Passing merchantId triggers an ecomm-payment-config
          // fetch that fails with "iframe_recaptcha_setting undefined" on
          // merchants that don't have reCAPTCHA configured, which then causes
          // tokenization to return "400 Bad Request". The public apiAccessKey
          // alone is sufficient for tokenization.
          const clover = new window.Clover(publicKey);
          const elements = clover.elements();

          // These styles apply INSIDE the iframe (Clover-hosted document).
          // We render the card fields as light inputs with dark text so they
          // stay readable regardless of the site's (default dark) theme.
          const styles = {
            body: {
              fontFamily:
                'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
              fontSize: "14px",
              color: "#111827",
              margin: "0",
              padding: "0",
            },
            input: {
              fontSize: "14px",
              color: "#111827",
              padding: "10px 12px",
              lineHeight: "1.25",
            },
            "input::placeholder": {
              color: "#9ca3af",
            },
            "input:focus": {
              outline: "none",
            },
            ".error": {
              color: "#dc2626",
            },
          };

          const cardNumber = elements.create("CARD_NUMBER", styles);
          const cardDate = elements.create("CARD_DATE", styles);
          const cardCvv = elements.create("CARD_CVV", styles);
          const cardPostalCode = elements.create("CARD_POSTAL_CODE", styles);

          cardNumber.mount("#clover-card-number");
          cardDate.mount("#clover-card-date");
          cardCvv.mount("#clover-card-cvv");
          cardPostalCode.mount("#clover-card-postal-code");

          const handleChange = (event: CloverChangeEvent) => {
            setErrors((prev) => ({
              ...prev,
              CARD_NUMBER: event.CARD_NUMBER?.error || "",
              CARD_DATE: event.CARD_DATE?.error || "",
              CARD_CVV: event.CARD_CVV?.error || "",
              CARD_POSTAL_CODE: event.CARD_POSTAL_CODE?.error || "",
            }));
          };

          cardNumber.addEventListener("change", handleChange);
          cardDate.addEventListener("change", handleChange);
          cardCvv.addEventListener("change", handleChange);
          cardPostalCode.addEventListener("change", handleChange);

          cloverRef.current = clover;
          setReady(true);
        } catch (err) {
          console.error("Clover init error:", err);
          setInitError(
            "Could not load secure payment form. Please refresh and try again."
          );
        }
      }

      if (window.Clover) {
        init();
      } else {
        // Poll for SDK availability (loaded via <Script> on the booking page)
        pollHandle = setInterval(() => {
          if (window.Clover) {
            if (pollHandle) clearInterval(pollHandle);
            init();
          }
        }, 150);

        // Time out after 15s
        const timeout = setTimeout(() => {
          if (pollHandle) clearInterval(pollHandle);
          if (!cloverRef.current && !cancelled) {
            setInitError(
              "Payment form failed to load. Please refresh the page."
            );
          }
        }, 15000);

        return () => {
          cancelled = true;
          if (pollHandle) clearInterval(pollHandle);
          clearTimeout(timeout);
        };
      }

      return () => {
        cancelled = true;
        if (pollHandle) clearInterval(pollHandle);
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        tokenize: async () => {
          if (!cloverRef.current) {
            throw new Error(
              "Payment form is still loading. Please wait a moment and try again."
            );
          }

          // Always log the raw Clover response — invaluable for diagnosing
          // merchant-side config issues (missing ecomm config, wrong token
          // type, reCAPTCHA misconfiguration, etc.).
          let result: CloverTokenResult;
          try {
            result = await cloverRef.current.createToken();
            console.log("[Clover] createToken result:", result);
          } catch (err) {
            console.error("[Clover] createToken threw:", err);
            throw new Error(translateCloverError(err));
          }

          if (result?.errors) {
            console.error("[Clover] createToken returned field errors:", result.errors);
            const messages = Object.values(result.errors).filter(Boolean);
            throw new Error(
              messages.length > 0
                ? messages.join(" ")
                : "Please check your card details and try again."
            );
          }
          if (result?.error) {
            console.error("[Clover] createToken returned error:", result.error);
            const raw =
              typeof result.error === "string"
                ? result.error
                : result.error.message || "";
            throw new Error(translateCloverError(raw));
          }
          if (!result?.token) {
            console.error("[Clover] createToken returned no token:", result);
            throw new Error(
              "We couldn't validate your card. Please double-check the number, expiration, CVV and ZIP, then try again."
            );
          }
          return result.token;
        },
        isReady: () => ready,
      }),
      [ready]
    );

    // Outer wrapper keeps the border + rounded corners; globals.css pins
    // height to 44px with overflow-hidden so the Clover iframe cannot
    // expand beyond a single-line input. White surface keeps the iframe's
    // dark text readable on the (default dark) site theme.
    const fieldClass =
      "mt-1 rounded-lg border border-gray-300 bg-white transition-colors focus-within:border-primary";

    return (
      <div className="rounded-lg border border-border bg-muted/40 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Secure Payment
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            Powered by Clover
          </span>
        </div>

        {initError && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {initError}
          </div>
        )}

        {!ready && !initError && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading secure payment form...
          </div>
        )}

        <div className={ready ? "space-y-4" : "space-y-4 opacity-50"}>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Card Number *
            </label>
            <div id="clover-card-number" className={fieldClass} />
            {errors.CARD_NUMBER && (
              <p className="mt-1 text-xs text-red-500">{errors.CARD_NUMBER}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground">
                Expiration *
              </label>
              <div id="clover-card-date" className={fieldClass} />
              {errors.CARD_DATE && (
                <p className="mt-1 text-xs text-red-500">{errors.CARD_DATE}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                CVV *
              </label>
              <div id="clover-card-cvv" className={fieldClass} />
              {errors.CARD_CVV && (
                <p className="mt-1 text-xs text-red-500">{errors.CARD_CVV}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              Billing ZIP Code *
            </label>
            <div id="clover-card-postal-code" className={fieldClass} />
            {errors.CARD_POSTAL_CODE && (
              <p className="mt-1 text-xs text-red-500">
                {errors.CARD_POSTAL_CODE}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);
