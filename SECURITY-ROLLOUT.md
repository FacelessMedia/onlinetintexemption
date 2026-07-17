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
  `ORDER_TOKEN_SECRET` is used. Every checkout requires this receipt
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

## Document explainer video

- `NEXT_PUBLIC_DOCS_EXPLAINER_VIDEO_URL`: optional HeyGen player URL in the
  exact form `https://app.heygen.com/embeds/<video-id>`. Other hosts, protocols,
  paths, credentials, and query strings are rejected; URL fragments are
  stripped. If it is unset or invalid, the booking page shows the complete
  written explanation instead of a broken or untrusted frame.

## Missing-document workflow

- `GHL_STAGE_NEEDS_DOCS`: the exact dedicated unpaid **Docs Needed - Unpaid**
  stage. There is no fallback to Information Submitted or a paid stage. Intake
  now fails closed if this value is missing or if the application cannot be
  moved there, while the already-created GHL contact/opportunity remain
  available for recovery.
- `GHL_INTERNAL_NOTIFICATION_CONTACT_ID`: Tory's existing GHL contact ID. The
  app queues a non-PHI GHL email to this contact for every distinct opportunity
  and writes its per-opportunity notification marker only after the API accepts
  the email.
- The app deliberately avoids direct enrollment in a contact-wide recurring
  workflow because one contact may have multiple applications. Its owner-safe
  Redis lock deduplicates retries by opportunity while allowing a later,
  genuinely distinct application to notify Tory again.

### Durable backup and reconciliation boundary

Treat the open opportunity in **Docs Needed - Unpaid** as the durable recovery
queue. Configure one GHL opportunity-stage workflow in the shared location:

1. Trigger only when an open opportunity enters this exact pipeline/stage.
2. Keep the workflow bound to the triggering opportunity and verify that two
   opportunities on one contact can be enrolled independently. Do not activate
   it if the location can only represent contact-wide state.
3. Wait until the next business-day follow-up window, then continue only if the
   same opportunity is still open in **Docs Needed - Unpaid**.
4. Send Tory a backup internal notification containing only the site, a short
   application reference, and a secure GHL link. Do not include name, contact
   details, DOB, address, conditions, notes, or uploaded-document data.
5. Add a saved GHL view for all open opportunities in this stage and review it
   daily. This is the reconciliation list if either email path is unavailable.

The existing Redis record is an owner-safe send/idempotency marker, not an
outbox. A Redis outbox was deliberately not added without an approved scheduler,
retention policy, and provider data-handling decision. A serverless queue with
no confirmed worker would only look durable; moreover GHL's documented message
endpoint exposes no application idempotency key, so a crash after provider
acceptance but before queue acknowledgement could still duplicate an email.
The GHL opportunity stage is already the authoritative application-scoped
record and does not copy medical data into a second recovery datastore.

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
- To enable automated support, set `NEXT_PUBLIC_SUPPORT_CHAT_ENABLED=true` and
  server-only `OPENAI_API_KEY`. The server defaults to `gpt-4.1`;
  `OPENAI_SUPPORT_MODEL` is an optional server-side override for an explicitly
  approved replacement.
- Chat has no transcript persistence, analytics, Discord forwarding, or tools.
  It uses `store:false`, accepts only the current user message, caps input/output,
  sends a privacy-hashed `safety_identifier`, moderates both directions,
  and refuses obvious personal, medical-record, and payment-data pastes before
  calling OpenAI. Visitors are repeatedly warned not to share sensitive data.
- The UI supports free text plus fixed suggested questions. Deterministic
  guards reject obvious prompt-override/extraction requests before the model
  call and suppress internal markers or secret-variable names in provider
  output. These are risk-reduction layers, not proof that prompt injection is
  impossible; the primary boundary is that chat has no tools, secrets, or
  customer-record access. Provider output is rendered as escaped text rather
  than executable HTML or model-supplied UI.
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
2. Test a $225 application without a document and confirm it remains unpaid;
   repeat with a clean document and confirm checkout opens.
3. Test an application at every offered price with no document and confirm: no Stripe session,
   open unpaid GHL stage, `needs-docs-followup`, and Tory receives one direct email.
   Leave one test opportunity unresolved and confirm the delayed GHL backup
   notification and daily reconciliation view find that exact opportunity.
4. Test applications at representative prices with a real clean file and confirm checkout opens.
5. Test an invalid/malicious file and confirm it never reaches GHL.
6. Confirm a paid Stripe test event moves the correct opportunity exactly once.
7. Run `npm run test:guards`; confirm fleet allowlisting, body limits, privacy
   guards, and tampered/wrong-order/expired upload receipt tests all pass.
8. Enable support chat in preview and verify general answers, sensitive-data
   refusal, rate limiting, provider outage handoff, keyboard focus, and the
   disabled human-only fallback.
9. Set `SECURITY_ENFORCEMENT_MODE=strict`, repeat the tests, then promote.
