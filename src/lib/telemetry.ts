/**
 * Browser telemetry for cloutkart-web — the entry point, deliberately tiny.
 *
 * The SDK itself is ~130kB gzipped, which is most of what this bundle already
 * weighs, and the landing page is the media-heavy gallery. So it is NOT in the
 * main chunk: it is a dynamic import, fetched when the browser is next idle,
 * after the page has drawn. Telemetry must never be the reason a page is slow.
 *
 * It is OFF unless `VITE_ONEPATCH_INGEST_TOKEN` is set at build time. Vite
 * inlines that variable, so without it the check below is statically false, the
 * import is unreachable, and the SDK is dropped from the build entirely — a
 * no-token build is byte-identical to one without this file.
 */

const INGEST_TOKEN = import.meta.env.VITE_ONEPATCH_INGEST_TOKEN as string | undefined;

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
