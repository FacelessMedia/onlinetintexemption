# Secure funnel rollout

The code supports an observation mode for local/preview setup. Production is
always strict even if `SECURITY_ENFORCEMENT_MODE` is omitted or set to another
value. Configure and test every relevant item below before deploying; an
endpoint returns 503 instead of silently running without its required control.

## Required application configuration

- `SITE_URL`: exact HTTPS origin for this domain; used for same-origin checks
  and Stripe success/cancel URLs.
- `ORDER_TOKEN_SECRET`: unique random secret of at least 32 characters. Never
  reuse it across unrelated applications. Rotating it invalidates open forms.
- `UPLOAD_RECEIPT_SECRET`: optional separate 32+ character secret for the
  short-lived, order-bound proof of a successful file upload. If omitted,
  `ORDER_TOKEN_SECRET` is used. A $250-or-more checkout requires this receipt
  and a fresh server read of the GHL file field; an older file on an upserted
  contact is not enough.
- `RATE_LIMIT_HASH_SECRET`: optional dedicated secret for HMAC-hashing rate
  limit identifiers. If omitted, `ORDER_TOKEN_SECRET` is used.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`: matching
  Cloudflare Turnstile keys for this hostname.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: shared rate-limit
  and Stripe-event idempotency store. Rate-limit identifiers are HMAC-SHA-256
  values; raw IP addresses, email addresses, and phone numbers are not used as
  Redis keys. Strict mode fails closed if this store is unavailable.
- `MALWARE_SCAN_WEBHOOK_URL`: a private, contractually approved scanner that
  accepts multipart field `file` and returns `{ "clean": true }` only for clean
  files. Do not use a public malware-sharing service for medical documents.
- `MALWARE_SCAN_API_KEY`: bearer credential for that private scanner; required
  in strict/production upload handling.
- `MALWARE_SCAN_REQUIRED=true`: makes scanner errors fail closed.

## Missing-document workflow

- `GHL_STAGE_NEEDS_DOCS`: preferably a dedicated unpaid **Form Filled - No
  Docs** stage. Until one is safely created, use the existing unpaid
  information-submitted stage; never use either paid stage.
- `GHL_INTERNAL_NOTIFICATION_CONTACT_ID`: Tory's existing GHL contact ID. The
  app queues a non-PHI GHL email to this contact for every distinct opportunity
  and writes its per-opportunity notification marker only after the API accepts
  the email.
- The app deliberately avoids direct enrollment in a contact-wide recurring
  workflow because one contact may have multiple applications. Its owner-safe
  Redis lock deduplicates retries by opportunity while allowing a later,
  genuinely distinct application to notify Tory again.

## Payment and anti-card-testing controls

- Stripe restricted key needs Checkout Session create/read plus PaymentIntent
  read and Charge read access. The central webhook re-reads the current charge
  before marking an opportunity won so out-of-order delivery cannot let a stale
  `checkout.session.completed` event overwrite a refund or dispute.
- Subscribe the central Stripe endpoint to
  `checkout.session.completed`, `checkout.session.expired`,
  `checkout.session.async_payment_failed`,
  `payment_intent.payment_failed`, `refund.created`, `refund.updated`,
  `refund.failed`, `charge.refunded`, `charge.dispute.created`,
  `charge.dispute.updated`, `charge.dispute.closed`,
  `charge.dispute.funds_withdrawn`, and
  `charge.dispute.funds_reinstated`. `charge.failed` is supported as a legacy
  fallback, but enabling both it and `payment_intent.payment_failed` can produce
  two telemetry entries for one failed attempt.
- Keep Stripe Radar enabled. Add rules or velocity controls for repeated failed
  cards, high-risk IPs, and excessive cards per customer/IP in the Stripe
  Dashboard. Application rate limits and Turnstile reduce cart creation, while
  Radar protects the hosted payment page itself.
- Stripe Checkout Sessions use one idempotency key per signed order and expire
  after 30 minutes.
- Full successful refunds move the application to lost; partial or pending
  refunds and open disputes move it back to open. Every refund/dispute gets a
  per-opportunity `payment-review-*` marker and PII-free Discord telemetry. A
  failed refund creates a follow-up marker but does not mark a still-paid order
  lost. A won/closed dispute deliberately remains open for manual review: one
  dispute event cannot prove there is no separate refund or second dispute, so
  the webhook never automatically restores `won` from that event alone.
- Payment-failure telemetry includes only site, state, a short Stripe object
  suffix, and a bounded decline code. It does not send name, email, phone,
  medical information, full CRM identifiers, or card data to Discord. Use
  Stripe Radar/Dashboard alerting for fleet-wide aggregation; the webhook's
  event-level signal is not itself a bot-classification system.
- Each browser form mount creates one UUID. The server hashes that UUID together
  with the site and state, stores the scoped reference as the GHL opportunity
  `externalObjectId`, and searches before creating. A lost response/retry reuses
  the same opportunity while another site, state, or form mount remains a
  distinct application.

## Support chat (feature flagged)

- Keep `NEXT_PUBLIC_SUPPORT_CHAT_ENABLED` unset or `false` until the preview
  checks pass. The widget then shows MyEyeRx phone/email handoff only and never
  calls an AI endpoint.
- To enable automated support, set `NEXT_PUBLIC_SUPPORT_CHAT_ENABLED=true`,
  `OPENAI_API_KEY`, and `OPENAI_SUPPORT_MODEL`. The key is server-only.
- Chat has no transcript persistence, analytics, Discord forwarding, or tools.
  It uses `store:false`, accepts only the current user message, caps input/output,
  sends a privacy-hashed `safety_identifier`, moderates both directions,
  and refuses obvious personal, medical-record, and payment-data pastes before
  calling OpenAI. Visitors are repeatedly warned not to share sensitive data.
- The sensitive-data detector reduces accidental disclosure but is not a PHI
  privacy boundary. Keep free-text chat disabled until the applicable data-
  governance and vendor-agreement decision is approved, or use a constrained-
  choice support flow instead.
- The checked-in customer knowledge base is intentionally conservative. The
  assistant may use only that material plus the current server-resolved state
  name and price; unknown, clinical, approval, or legal questions are handed to
  MyEyeRx at 734-338-9453 or Tory@myeyerx.net.

## Upload lifecycle

- Only PDF, JPEG, and PNG are accepted. The server checks content signatures,
  enforces 4 MB per file, invokes the configured private malware scanner, and
  sends the file to GHL only after those checks pass.
- After GHL accepts a file, tag cleanup is best-effort. Its failure is logged
  without patient data and never makes a customer upload the same medical file
  again.

## Activation checklist

1. Configure all variables in a preview deployment.
2. Test a $225 application with and without a document.
3. Test a $250+ application with no document and confirm: no Stripe session,
   open unpaid GHL stage, `needs-docs-followup`, and Tory receives one email.
4. Test a $250+ application with a real clean file and confirm checkout opens.
5. Test an invalid/malicious file and confirm it never reaches GHL.
6. Confirm a paid Stripe test event moves the correct opportunity exactly once.
7. Run `npm run test:guards`; confirm fleet allowlisting, body limits, privacy
   guards, and tampered/wrong-order/expired upload receipt tests all pass.
8. Enable support chat in preview and verify general answers, sensitive-data
   refusal, rate limiting, provider outage handoff, keyboard focus, and the
   disabled human-only fallback.
9. Set `SECURITY_ENFORCEMENT_MODE=strict`, repeat the tests, then promote.
