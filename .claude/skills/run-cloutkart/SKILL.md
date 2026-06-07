---
name: run-cloutkart
description: Build, run, and drive CloutKart. Use when asked to start CloutKart, run the dev server, take a screenshot of its UI, verify a change in the browser, or interact with the running app.
---

CloutKart is a React + Vite + TypeScript SPA (Supabase + Razorpay). Drive it via `.claude/skills/run-cloutkart/driver.mjs` — start the Vite dev server, then run the Playwright driver against it.

All paths below are relative to the repo root (`/home/zengeist/CK/CloutKart/`).

## Prerequisites

Playwright's headless Chromium must be installed. Run once:

```bash
npm install --no-save playwright
npx playwright install chromium
```

## Setup

```bash
npm install
```

**Env vars** — a `.env.local` is required (it's gitignored). Real Supabase credentials unlock auth flows; stub values let the landing page and auth forms render without backend calls:

```bash
# .env.local — stub values for local rendering (app loads, Supabase calls 404)
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkxNTU2MzIwMH0.placeholder_key_for_local_dev
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder
```

## Run (agent path)

Start the dev server, then drive with the Playwright driver:

```bash
# Start dev server (port 5173)
npm run dev &
echo $! > /tmp/vite-dev.pid
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null 2>&1; do sleep 1; done'

# Smoke test: visits /, /login, /signup, /forgot-password — screenshots in /tmp/ck-screenshots/
node .claude/skills/run-cloutkart/driver.mjs smoke

# Stop server when done
kill $(cat /tmp/vite-dev.pid)
```

Screenshots land in `/tmp/ck-screenshots/`.

**Driver commands:**

| command | what it does |
|---|---|
| `smoke` | Visits all 4 public routes, screenshots each, exits 1 on any failure |
| `screenshot [route] [name]` | Screenshot one route (e.g. `screenshot /login login-form`) |
| `screenshot-route <route> [name]` | Alias for `screenshot` |
| `repl` | Interactive REPL: `nav`, `ss`, `click`, `fill`, `eval`, `title`, `quit` |

## Run (human path)

```bash
npm run dev   # → http://localhost:5173 opens. Ctrl-C to stop.
```

## Test

```bash
npm run typecheck   # TypeScript check, no test suite exists
npm run lint
```

## Gotchas

- **`playwright` not in project deps** — install with `npm install --no-save playwright` then `npx playwright install chromium`. The `--no-save` keeps it off `package.json`.
- **`.env.local` is required** — without it, `createClient(undefined, undefined)` throws on boot and the app won't load at all. The stub values above are enough to render every route; only actual Supabase API calls fail (two `ERR_NAME_NOT_RESOLVED` console errors, benign).
- **`/dashboard` and `/admin` redirect to `/login`** without a valid Supabase session. To test these, you need real credentials and a user/admin session cookie.
- **LoadingScreen animation** — the landing page plays a loading animation on first render. `waitUntil: 'networkidle'` waits past it reliably; raw `sleep` may not.

## Troubleshooting

- **`Cannot find package 'playwright'`**: Run `npm install --no-save playwright && npx playwright install chromium`.
- **`EADDRINUSE :5173`**: Another dev server is running. `kill $(cat /tmp/vite-dev.pid)` or `pkill -f 'vite --port 5173'`.
- **Blank/black screenshots**: Supabase URL is valid but unreachable (network). Use stub `.env.local` values above instead.
