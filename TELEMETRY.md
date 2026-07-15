# TELEMETRY.md

OnePatch's map of CloutKart's telemetry: where the signals come from, what the
services are, and how they call each other. Keep it in sync with the code and
with what actually arrives in `otel.{spans,metrics,logs}` — when the two
disagree, the disagreement is the story.

> **Status — no instrumentation yet (first-pass map).** As of this writing the
> application ships **no OpenTelemetry instrumentation**: there is no OTel SDK in
> `package.json`, no tracer/meter setup in the SPA, and no spans, metrics, or
> logs emitted from the Supabase edge functions. A live query of
> `otel.{spans,metrics,logs}` returns **zero rows from CloutKart** (the only data
> present is OnePatch's own internal runtime/monitor telemetry). The service map
> below is therefore derived from the **code** — it is the topology that *should*
> appear once instrumentation lands, not a reflection of live spans. See
> [Instrumentation gap](#instrumentation-gap) for what to add and the naming
> this map assumes.

## Stack at a glance

CloutKart is a creative-operations platform for D2C brands (submit a brief →
"Pixie" the AI creative director returns hook / color story / visual direction →
ad creatives delivered). The system is two tiers:

- **Web (`cloutkart-web`)** — a client-only React 18 + TypeScript SPA built with
  Vite, routed with `react-router-dom` v7, deployed on Vercel (`vercel.json`).
  It talks to Supabase directly from the browser via `@supabase/supabase-js`
  (`src/lib/supabase.ts`) for Auth, Postgres (RLS), Realtime, and Storage, and
  invokes edge functions for anything privileged or third-party.
- **Backend — Supabase.** Postgres (with Row-Level Security), Auth, Realtime
  channels, Storage buckets, and **8 Deno edge functions** under
  `supabase/functions/`. The edge functions hold every server secret and every
  outbound third-party call; the browser never sees a provider key.

There is no other backend — no long-running server, no container the customer
runs. "Services", for telemetry purposes, means the SPA plus the edge functions.

## Signals

| Signal | Source (once instrumented) | Current state |
| --- | --- | --- |
| **Spans** | SPA route/interaction + `functions.invoke` client spans; edge-function server spans (`kind=2`) and outbound HTTP client spans (`kind=3`) to Razorpay / Resend / AI / Stability / enrichment APIs / MongoDB | **None arriving** |
| **Metrics** | Edge-function invocation count / duration / error rate; Web Vitals from the SPA | **None arriving** |
| **Logs** | Edge functions already `console.error`/`console.warn` on failure (Supabase captures these to its own log stream) — not yet exported to OTel | **None in OTel** |

`resource_attrs['deployment.environment.name']` is **not yet set** by anything.
Once instrumentation lands, expect `production` (and `preview` for the SPA's
Vercel preview deploys).

## Service map

One entry per service, as `service_name` will appear once instrumented.
**Incoming** = server spans the service handles (`kind=2`); **outgoing** = client
spans it makes (`kind=3`). All entries are **code-derived** — live telemetry is
currently empty, so no counts are shown.

### `cloutkart-web` — React SPA (browser)
- **Environments (planned):** `production`, `preview` (Vercel)
- **Incoming:** none (browser client; entry point is user navigation, not a
  server span).
- **Outgoing (to Supabase + edge functions):**
  - Supabase Auth / Postgres (RLS) / Realtime / Storage via `supabase-js`
  - `functions.invoke('lead-agent')` — lead capture & enrichment (4 call sites)
  - `functions.invoke('generate-creative-vision')` — Pixie brief → vision
  - `functions.invoke('generate-vision-image')` — hero image from the brief
  - `functions.invoke('send-contact-email')` — contact form
  - `POST /functions/v1/create-razorpay-order` — checkout (Dashboard)
  - `POST /functions/v1/verify-razorpay-payment` — checkout (Dashboard)
  - `POST /functions/v1/send-creative-email` — creative delivery (Dashboard)
- **Realtime subscribers:** `NotificationBell`, `Dashboard`, `Admin`,
  `usePushNotifications` subscribe to Postgres-changes channels (`messages`,
  `notifications`).

### `create-razorpay-order` — edge function
- **Incoming:** `POST` (checkout: create a Razorpay order from `amount_paise`).
- **Outgoing:** `https://api.razorpay.com/v1/orders`.

### `verify-razorpay-payment` — edge function
- **Incoming:** `POST` (checkout: verify Razorpay HMAC-SHA256 signature).
- **Outgoing:** Postgres via service-role client — writes `payments`, updates
  `profiles` (subscription).

### `generate-creative-vision` — edge function ("Pixie")
- **Incoming:** `POST` (brief → creative vision: vibe, colors, hook, direction).
- **Outgoing:**
  - AI chat completion via the OpenAI-compatible fail-over chain in
    `_shared/ai.ts` — primary **Cerebras** → fallback **OpenRouter** → last-resort
    **Groq** (`https://api.groq.com/openai/v1`), each configured by env at call
    time.
  - HuggingFace feature-extraction embeddings
    (`api-inference.huggingface.co`, `all-MiniLM-L6-v2`).
  - **MongoDB** (`MONGODB_URI`) — vector store / retrieval.
  - Scrapes the client site (e.g. `https://clout-kart.com`) for grounding.

### `generate-vision-image` — edge function *(provider fail-over + AI hero frame)*
- **Incoming:** `POST` (vision → hero image).
- **Outgoing:**
  - **Stability AI** — `stable-image/generate/core` and `.../sd3`
    (`api.stability.ai`), with fail-over between the two.
  - HuggingFace embeddings (`all-MiniLM-L6-v2`).
  - **MongoDB** (`MONGODB_URI`).

### `lead-agent` — edge function (lead research / enrichment)
- **Incoming:** `POST` (enrich and qualify an inbound lead).
- **Outgoing:**
  - **Groq** LLM (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`).
  - **People Data Labs** company enrich (`api.peopledatalabs.com`).
  - **Hunter.io** domain search (`api.hunter.io`).
  - **Google Places** text search + details (`maps.googleapis.com`).
  - **Reddit** OAuth + search (`oauth.reddit.com`, `reddit.com`).
  - **Jina reader** (`r.jina.ai`) for page extraction.

### `send-contact-email` — edge function
- **Incoming:** `POST` (contact-form inquiry).
- **Outgoing:** **Resend** (`https://api.resend.com/emails`).

### `send-creative-email` — edge function
- **Incoming:** `POST` (deliver the approved creative vision by email).
- **Outgoing:** **Resend** (`https://api.resend.com/emails`).

### `send-push-notification` — edge function
- **Incoming:** `POST` (Web Push via VAPID). No in-repo caller — invoked
  out-of-band (admin action / DB trigger).
- **Outgoing:** Postgres via service-role client — reads `push_subscriptions`;
  pushes to the browser Push endpoints stored there.

## Data stores

- **Supabase Postgres** — tables: `profiles`, `leads`, `lead_contacts`,
  `contact_submissions`, `free_creative_requests`, `payments`, `messages`,
  `notifications`, `push_subscriptions`, `portfolio_sections`,
  `portfolio_images`. RLS enforced; edge functions that mutate use the
  service-role key.
- **Supabase Storage** — portfolio image bucket.
- **MongoDB** (`MONGODB_URI`) — external vector store used by the vision
  functions for embedding retrieval.

## External dependencies (outbound, by function)

| Dependency | Used by |
| --- | --- |
| Razorpay | `create-razorpay-order`, `verify-razorpay-payment` |
| Resend (email) | `send-contact-email`, `send-creative-email` |
| Cerebras / OpenRouter / Groq (OpenAI-compatible chat) | `generate-creative-vision` (via `_shared/ai.ts`), `lead-agent` (Groq direct) |
| Stability AI | `generate-vision-image` |
| HuggingFace embeddings | `generate-creative-vision`, `generate-vision-image` |
| MongoDB | `generate-creative-vision`, `generate-vision-image` |
| People Data Labs, Hunter.io, Google Places, Reddit, Jina | `lead-agent` |
| Web Push (VAPID) | `send-push-notification` |

## Instrumentation gap

Nothing here is instrumented for OpenTelemetry yet, so none of the above
currently reaches `otel.*`. Landing it is a deliberate, reviewable change on its
own — not something to bolt onto this doc-refresh PR. Recommended shape when it
is done, so the service map above materializes as written:

- **Edge functions (Deno):** wrap each `Deno.serve` handler in a server span
  (`kind=2`, one `service_name` per function as named above) and instrument the
  outbound `fetch` / MongoDB / Postgres calls as client spans (`kind=3`). Set
  `deployment.environment.name` from the Supabase environment. The functions
  already log failures via `console.error` — export those as OTel logs rather
  than replacing them.
- **SPA (`cloutkart-web`):** browser tracing over route changes and each
  `functions.invoke` / `fetch` to the edge functions, tagged
  `deployment.environment.name = production | preview`. Web Vitals as metrics.

Until then, this map is authoritative for **topology** but reports **no live
signal**. Refresh the `## Service map` counts and environments from
`otel.spans` the moment CloutKart starts emitting.
