import { identifyUser, startRum } from '@onepatch/rum';
import { supabase } from './supabase';

/**
 * The telemetry SDK and its configuration. Split out of `telemetry.ts` so this
 * whole module — and the ~130kB SDK it pulls in — lands in its own chunk,
 * loaded on idle rather than in the critical path. Nothing else imports it.
 *
 * What it records: page loads, route changes, clicks, fetch/XHR calls, JS errors
 * and Web Vitals. No DOM is captured — this is not session replay. Because it
 * starts on idle, it sees the page load retrospectively from the browser's own
 * performance timeline; a JS error thrown in the first moments of startup is the
 * one thing it can miss.
 */

const INGEST_URL =
  (import.meta.env.VITE_ONEPATCH_INGEST_URL as string | undefined) ??
  'https://clout-kart.logger.onepatch.dev';

// Injected by vite.config.ts from Vercel's build environment; 'development' and
// 'dev' when built anywhere else.
declare const __DEPLOY_ENV__: string;
declare const __COMMIT_SHA__: string;

export function start(ingestToken: string): void {
  void startRum({
    ingestUrl: INGEST_URL,
    ingestToken,
    appName: 'cloutkart-web',
    environment: __DEPLOY_ENV__,
    appVersion: __COMMIT_SHA__,

    // Resolved once at startup. Most of the site is a signed-out marketing
    // visitor, so null is the normal answer; the listener below attaches the
    // person the moment a session lands.
    user: async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      return user ? { id: user.id, email: user.email ?? null } : null;
    },

    // The gallery streams plate media from Supabase Storage, and on a warm cache
    // those asset spans are all near-instant repeats. Keep the slow ones — a
    // 1.6s page load is only explainable if we can see which plate it waited on.
    assetFloorMs: 200,

    // Supabase puts password-reset and magic-link tokens in the URL, /reset-password
    // reads them from there, and telemetry storage is permanent. The cost is that
    // the landing page's #section anchors are dropped from recorded URLs too.
    scrubQueryStrings: true,
  });

  // Sign-in, sign-out, token refresh. Null clears a key, so a sign-out leaves no
  // stale person attached to the next visitor's spans on a shared machine.
  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    identifyUser(user ? { id: user.id, email: user.email ?? null } : { id: null, email: null });
  });
}
