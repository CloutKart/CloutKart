import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Public VAPID key — safe to embed; the private key lives in Supabase edge function secrets.
const VAPID_PUBLIC_KEY = 'BJBG97df1S5vyx0t_7LzDGQMnI19QOL6wfuUF4kXhMDPyH2rOCa5eLi-Pew_LSqUgsaDZe24szRFbugvLL1JVf8';

function urlBase64ToUint8Array(b64: string): Uint8Array {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

/**
 * Registers the service worker, requests notification permission, creates a
 * Web Push subscription and stores it in Supabase.  Call this once the user
 * is authenticated — Dashboard and Admin both call it on mount.
 */
export function usePushNotifications(userId: string | null, isAdmin: boolean) {
  useEffect(() => {
    if (!userId) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    let cancelled = false;

    async function setup() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted' || cancelled) return;

        const reg = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
        if (cancelled) return;

        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        }
        if (cancelled) return;

        const json = sub.toJSON() as {
          endpoint: string;
          keys: { p256dh: string; auth: string };
        };

        await supabase.from('push_subscriptions').upsert(
          {
            user_id: userId,
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
            is_admin: isAdmin,
          },
          { onConflict: 'user_id,endpoint' }
        );
      } catch (err) {
        // Non-fatal — notification permission denied or SW not supported
        console.warn('[Push] setup failed:', err);
      }
    }

    setup();
    return () => { cancelled = true; };
  }, [userId, isAdmin]);
}
