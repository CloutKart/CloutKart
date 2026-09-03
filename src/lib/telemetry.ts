/**
 * Browser telemetry for cloutkart-web — the entry point, deliberately tiny.
 *
 * The SDK itself is ~130kB gzipped, which is most of what this bundle already
 * weighs, and the landing page is the media-heavy gallery. So it is NOT in the
 * main chunk: it is a dynamic import, fetched when the browser is next idle,
 * after the page has drawn. Telemetry must never be the reason a page is slow.
 *
 * The ingest token below is committed on purpose. It is a write-only ingest
 * key: it can append telemetry to CloutKart's own store and nothing else — it
 * reads no data, grants no access, and is scoped to this one destination. That
 * is the same shape as a Sentry DSN, which ships in the frontend bundle for the
 * same reason. Configuring it as a build-time secret would buy nothing and
 * would mean telemetry silently stays off until someone remembers to set it, so
 * it lives in the source instead. `VITE_ONEPATCH_INGEST_TOKEN` still overrides
 * it, for pointing a build at a different store.
 *
 * Consequence worth stating: the guard is no longer statically false, so the
 * SDK is now always part of the build. It is a separate lazily-fetched chunk,
 * not main-chunk weight, and it is still off the critical path.
 */

const INGEST_TOKEN =
  (import.meta.env.VITE_ONEPATCH_INGEST_TOKEN as string | undefined) ||
  'op_urt67f-z-9juIqMHVLChr6wY4ZTEjXpAis3E0wHmN8U';

export function startTelemetry(): void {
  if (!INGEST_TOKEN) return;

  const load = () => {
    void import('./telemetry-rum').then((m) => m.start(INGEST_TOKEN));
  };

  // Safari only shipped requestIdleCallback in 16.4; a timeout is the fallback.
  const idle = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
  if (typeof idle === 'function') idle(load, { timeout: 5000 });
  else window.setTimeout(load, 2000);
}
