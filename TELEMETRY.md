# TELEMETRY.md

OnePatch's map of CloutKart's telemetry: where the signals come from, what the
services are, and how they call each other. Keep it in sync with the code and
with what actually arrives in `otel.{spans,metrics,logs}` — when the two
disagree, the disagreement is the story.

> **Status — browser instrumented in this PR, backend still bare.** This branch
> adds `@onepatch/rum` to the SPA (see [Browser (RUM)](#browser-rum)), so
> `cloutkart-web` will emit browser spans **once `VITE_ONEPATCH_INGEST_TOKEN` is
> set on the Vercel project** — until that variable exists the SDK is dropped from
> the build and nothing is sent. The **8 Supabase edge functions remain
> uninstrumented**: no OTel in the Deno handlers, no server spans, no outbound
> client spans. A live query of `otel.{spans,metrics,logs,histograms}` still
> returns **zero rows from CloutKart's own code**. The service map below is
> therefore derived from the **code** — it is the topology that *should* appear
> as instrumentation lands, not a reflection of live spans. See
> [Instrumentation gap](#instrumentation-gap) for what is left. (verified
> 2026-08-19)

## Facts

- **CloutKart emits nothing yet.** No customer-instrumented signal has ever
  arrived in `otel.*`. Any query written against this repo returns zero rows
  until the SPA's ingest token is set and the edge functions are instrumented.
  (verified 2026-08-19)
- `onepatch_source != 'internal'` is **not** enough to isolate app telemetry
  here: it also keeps the OnePatch repo-activity stream. Use
  `onepatch_source NOT IN ('internal', 'cicd')` when presence of data means
  health. (verified 2026-08-19)
- Repo activity (pushes, PR opens/merges) arrives as **logs** under
  `service_name = 'github'`, `scope_name = 'onepatch.github'`, with
  `onepatch_source = ''`. It is OnePatch synthesizing GitHub webhooks, not
  CloutKart instrumentation. (verified 2026-08-19)
- Everything else in the store is OnePatch's monitor-runner
  (`service_name = 'onepatch-monitor-runner'`, `onepatch_source = 'internal'`).
  (verified 2026-08-19)
- **No `cicd` rows exist at all.** The repo has no `.github/workflows` and Vercel
  builds it directly, so no deployment or workflow evidence reaches OnePatch. See
  [Deploy signal](#deploy-signal). (verified 2026-08-19)
- `env` is empty on every row — nothing sets `deployment.environment.name` yet,
  so do not filter on it. Once the SPA's token is set it will carry Vercel's
  `VERCEL_ENV`: `production` and `preview`. (verified 2026-08-19)

## Stack at a glance

CloutKart automates and optimises the creative production process for D2C brands
(submit a brief → "Pixie" the AI creative director returns hook / color story /
visual direction → ad creatives delivered). The public site was repositioned to
that framing in August 2026 — the landing page is now a technical-drawing "sheet"
walk-through plus a gallery of delivered work, but no backend or edge function
changed with it. The system is two tiers:

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
| **Spans** | `cloutkart-web` browser spans — page load, route change, click, fetch/XHR, JS error, Web Vitals (`@onepatch/rum`, [below](#browser-rum)) | **Wired, dormant** — waiting on the Vercel ingest token |
| **Spans** | Edge-function server spans (`kind=2`) and outbound HTTP client spans (`kind=3`) to Razorpay / Resend / AI / Stability / enrichment APIs / MongoDB | **None arriving** — not instrumented |
| **Metrics** | Edge-function invocation count / duration / error rate | **None arriving** — not instrumented |
| **Logs** | Edge functions already `console.error`/`console.warn` on failure (Supabase captures these to its own log stream) — not yet exported to OTel | **None in OTel** |

Web Vitals arrive as `webvitals` **spans**, not metrics — one metric per span
under its own key (`ttfb`, `fcp`, `lcp`, `cls`, `inp`).

Environment labelling is covered in [Facts](#facts): nothing sets
`deployment.environment.name` yet, so the `env` column is empty on every row.

## Browser (RUM)

`src/main.tsx` calls `startTelemetry()` from `src/lib/telemetry.ts`, which loads
`src/lib/telemetry-rum.ts` — and with it `@onepatch/rum` — on the browser's next
idle callback. Everything about that split is deliberate and worth knowing before
changing it:

- **Two files, one purpose.** `telemetry.ts` is the guard and the scheduler and
  imports nothing heavy; `telemetry-rum.ts` holds the SDK and the config. Merging
  them would drag ~130kB gzipped back into the main chunk.
- **Off by default, at build time.** `VITE_ONEPATCH_INGEST_TOKEN` is inlined by
  Vite, so a build without it makes the guard statically false and Rollup drops
  the SDK entirely — a no-token build is **byte-identical** to one without this
  code (verified: same chunk hash, 2026-08-19). Set it on the Vercel project to
  turn telemetry on; unset it to turn telemetry off.
- **`VITE_ONEPATCH_INGEST_URL`** overrides the ingest host; it defaults to
  `https://clout-kart.logger.onepatch.dev`.
- **On idle, not on load.** The page draws first. The cost is that a JS error
  thrown in the first moments of startup is not captured; the page load itself is
  still recorded, retrospectively, from the browser's performance timeline.

What lands in `otel.spans`, all under `service_name = 'cloutkart-web'`:

| span | what it is |
| --- | --- |
| `documentLoad`, `documentFetch`, `resourceFetch` | page load and its assets. Assets faster than **200ms** are dropped (`assetFloorMs`) — a thin `resourceFetch` count is a warm cache, not a missing instrument. Failed assets are always kept |
| `routeChange` | an in-app navigation; `attrs.location.href` is where they arrived, ``attrs.`prev.href` `` where they came from |
| `click` | `attrs.target_element`, `attrs.target_xpath` — group by the element, never the xpath |
| `onerror`, `unhandledrejection` | a JS error, `status_code = 2`; ``attrs.`error.message` ``, ``attrs.`error.stack` `` |
| `webvitals` | one vital per span, under its own key |
| `HTTP GET` / `HTTP POST` (`kind = 3`) | a `fetch`/XHR to Supabase or an edge function |

- **Recognising these rows:** ``toString(resource_attrs.telemetry.sdk.language) = 'webjs'``.
- **`service.version` is the commit sha** (Vercel's `VERCEL_GIT_COMMIT_SHA`,
  injected by `vite.config.ts`), so "did that deploy do it?" is a `GROUP BY`.
  `env` carries `VERCEL_ENV` — `production` or `preview`.
- **Identity:** signed-out marketing traffic is the norm, so most spans carry no
  person. On sign-in, `attrs.user.id` and `attrs.user.email` appear (Supabase
  auth ids); sign-out clears them.
  ``toString(resource_attrs.`session.id`)`` groups one visit.
- **URLs are scrubbed.** `scrubQueryStrings` is **on**: Supabase puts
  password-reset and magic-link tokens in the URL and `/reset-password` reads them
  from there, and telemetry storage is permanent. Every recorded URL therefore
  ends `?<scrubbed>` — which also costs us the landing page's `#section` anchors,
  so "which section were they looking at?" is a `click`/`routeChange` question,
  not a URL question.
- **No trace joining yet.** `connectTracesTo` is not set, so the browser does not
  send `traceparent` to Supabase and browser spans do **not** join edge-function
  spans. Turning it on requires `traceparent` in each edge function's
  `Access-Control-Allow-Headers` (today: `Content-Type, Authorization,
  X-Client-Info, Apikey`) — sending it to an origin that rejects it makes the
  browser cancel the real request, which is why it is off until the server half
  exists.

## Deploy signal

**Unpinned — no deployment evidence reaches OnePatch.** CloutKart deploys through
Vercel's GitHub integration (the Vercel bot comments deployment status on every
PR), and the repo has **no `.github/workflows` at all**. A query of `otel.logs`
over 90 days returns **zero rows with `onepatch_source = 'cicd'`**: no
`deployment_status`, no `status`, no `workflow_run`, no `workflow_job`. The only
repo-derived signal we receive is push and pull-request activity under
`service_name = 'github'`, which tells us a branch moved, not that anything
deployed.

So there is nothing to pin, and no deploy monitors or deploy dashboard are
installed — a pin matching zero rows would be wrong by construction. Two ways to
close this, neither yet taken:

1. Have the Vercel GitHub integration's deployment statuses reach the OnePatch
   GitHub App (the platform reporting its own deploys is the strongest signal
   available here).
2. Failing that, `service.version` on the browser spans above is the commit sha,
   so once RUM is live "which build is this?" is answerable even though "when did
   it deploy?" is not.

(verified 2026-08-19)

## Service map

One entry per service, as `service_name` will appear once instrumented.
**Incoming** = server spans the service handles (`kind=2`); **outgoing** = client
spans it makes (`kind=3`). All entries are **code-derived** — live telemetry is
currently empty, so no counts are shown.

### `cloutkart-web` — React SPA (browser)
- **Instrumented** via `@onepatch/rum` — see [Browser (RUM)](#browser-rum) for the
  spans, the attributes, and what it takes to switch on.
- **Environments:** `production`, `preview` (from Vercel's `VERCEL_ENV`)
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
- **Storage reads:** the landing-page gallery (`Portfolio`, `ProductionLine`)
  reads `portfolio_sections` / `portfolio_images` and streams plate media —
  images and, since 2026-08-10, video — from the `portfolio` bucket, sampling a
  dominant colour client-side (`src/lib/dominantColor.ts`) to drive the ambient
  tint. Heavy media on an unauthenticated route, so it is the natural first
  target for Web Vitals once the SPA is instrumented.
- **Demo mode:** `/admin?demo=1` renders illustrative payments and revenue that
  live only in React state and are never written to Postgres. Figures from that
  view are not real, and once the SPA is instrumented its spans will not be
  either — check for the flag before reading anything from `/admin`.

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
- **Supabase Storage** — two buckets, both written from `Admin`: `portfolio`
  (gallery plates; widened to 50MB and mp4/webm in the 2026-08-10 migration, so
  gallery works are now images *or* video) and `creatives` (delivered creative
  files).
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

The browser half is done (this PR). **The 8 Deno edge functions are still bare**,
and they are where every payment, every AI call, and every third-party dependency
lives — so a failing Razorpay verification or a Stability timeout is currently
invisible to us, and the browser only sees that its `fetch` returned 500.

What is left, in the order it is worth doing:

1. **Edge functions (Deno).** Wrap each `Deno.serve` handler in a server span
   (`kind=2`, one `service_name` per function as named above) and instrument the
   outbound `fetch` / MongoDB / Postgres calls as client spans (`kind=3`). Set
   `deployment.environment.name` from the Supabase environment. The functions
   already log failures via `console.error` — export those as OTel logs rather
   than replacing them. Start with `verify-razorpay-payment` and
   `generate-creative-vision`: money and the product's core promise.
2. **Trace joining.** Once the functions emit server spans, add `traceparent` to
   each function's `Access-Control-Allow-Headers` and set `connectTracesTo` on
   the browser SDK, so one trace covers the click and the payment behind it. Not
   before — see [Browser (RUM)](#browser-rum) for why the order matters.
3. **Deploy visibility.** See [Deploy signal](#deploy-signal).

Until then this map is authoritative for **topology** and reports live signal for
`cloutkart-web` only. Refresh the `## Service map` from `otel.spans` as each
piece lands.
