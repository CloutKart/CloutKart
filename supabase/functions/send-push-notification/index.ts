import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Required Supabase secrets (set via `supabase secrets set`):
//   VAPID_PUBLIC_KEY   — base64url uncompressed P-256 public key
//   VAPID_PRIVATE_KEY  — base64url P-256 private key scalar d
//   SUPABASE_URL       — your project URL (auto-injected by Supabase)
//   SUPABASE_SERVICE_ROLE_KEY — service role key (auto-injected)
// ---------------------------------------------------------------------------

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_SUBJECT = "mailto:inquiry@clout-kart.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ── VAPID helpers ────────────────────────────────────────────────────────────

function b64uDecode(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  return Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad), c => c.charCodeAt(0));
}

function b64uEncode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function importVapidPrivateKey(): Promise<CryptoKey> {
  const pubBytes = b64uDecode(VAPID_PUBLIC_KEY); // 65 bytes: 0x04 || x || y
  const x = b64uEncode(pubBytes.slice(1, 33).buffer);
  const y = b64uEncode(pubBytes.slice(33, 65).buffer);
  return crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", d: VAPID_PRIVATE_KEY, x, y },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

async function buildVapidAuth(endpoint: string): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;
  const headerB64 = b64uEncode(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payloadB64 = b64uEncode(new TextEncoder().encode(JSON.stringify({ aud: audience, exp, sub: VAPID_SUBJECT })));
  const sigInput = `${headerB64}.${payloadB64}`;
  const privKey = await importVapidPrivateKey();
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privKey,
    new TextEncoder().encode(sigInput),
  );
  return `vapid t=${sigInput}.${b64uEncode(sig)},k=${VAPID_PUBLIC_KEY}`;
}

// ── Web Push message encryption (RFC 8188 / draft-ietf-webpush-encryption) ──

async function encryptPayload(
  payload: string,
  p256dhB64: string,
  authB64: string,
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const enc = new TextEncoder();
  const receiverKey = await crypto.subtle.importKey(
    "raw", b64uDecode(p256dhB64),
    { name: "ECDH", namedCurve: "P-256" }, true, [],
  );

  // Generate ephemeral sender key pair
  const senderKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey", "deriveBits"],
  );
  const senderPublicKeyRaw = new Uint8Array(await crypto.subtle.exportKey("raw", senderKeyPair.publicKey));

  // ECDH shared secret
  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: receiverKey }, senderKeyPair.privateKey, 256,
  );

  // auth secret
  const authSecret = b64uDecode(authB64);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // PRK_key using auth
  const ikm = await crypto.subtle.importKey("raw", new Uint8Array(sharedBits), "HKDF", false, ["deriveBits"]);
  const prkKeyBits = await crypto.subtle.deriveBits(
    {
      name: "HKDF", hash: "SHA-256",
      salt: authSecret,
      info: concat(enc.encode("WebPush: info\0"), await crypto.subtle.exportKey("raw", receiverKey), senderPublicKeyRaw),
    },
    ikm, 256,
  );

  const prkKey = await crypto.subtle.importKey("raw", prkKeyBits, "HKDF", false, ["deriveBits"]);

  // Content encryption key
  const cekBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: enc.encode("Content-Encoding: aes128gcm\0") },
    prkKey, 128,
  );
  const cek = await crypto.subtle.importKey("raw", cekBits, "AES-GCM", false, ["encrypt"]);

  // Nonce
  const nonceBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: enc.encode("Content-Encoding: nonce\0") },
    prkKey, 96,
  );
  const nonce = new Uint8Array(nonceBits);

  // Plaintext with padding delimiter (0x02)
  const plaintext = concat(enc.encode(payload), new Uint8Array([2]));

  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, cek, plaintext);

  return { ciphertext: new Uint8Array(encrypted), salt, serverPublicKey: senderPublicKeyRaw };
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) { out.set(a, off); off += a.length; }
  return out;
}

function buildAes128GcmBody(
  salt: Uint8Array,
  serverPublicKey: Uint8Array,
  ciphertext: Uint8Array,
): Uint8Array {
  // RFC 8188 header: salt(16) + rs(4) + idlen(1) + keyid(65) + ciphertext
  const rs = 4096;
  const header = new Uint8Array(16 + 4 + 1 + serverPublicKey.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, rs, false);
  header[20] = serverPublicKey.length;
  header.set(serverPublicKey, 21);
  return concat(header, ciphertext);
}

// ── Send a single push notification ─────────────────────────────────────────

async function sendPush(sub: { endpoint: string; p256dh: string; auth: string }, payload: string): Promise<number> {
  const { ciphertext, salt, serverPublicKey } = await encryptPayload(payload, sub.p256dh, sub.auth);
  const body = buildAes128GcmBody(salt, serverPublicKey, ciphertext);
  const vapidAuth = await buildVapidAuth(sub.endpoint);

  const res = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      "Authorization": vapidAuth,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "TTL": "86400",
    },
    body,
  });
  return res.status;
}

// ── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, is_admin_notification, title, body, url } = await req.json();

    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let query = db.from("push_subscriptions").select("id, endpoint, p256dh, auth");
    if (is_admin_notification) {
      query = query.eq("is_admin", true);
    } else if (user_id) {
      query = query.eq("user_id", user_id).eq("is_admin", false);
    } else {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: subs } = await query;
    if (!subs?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.stringify({ title, body, url: url || "/" });
    let sent = 0;
    const expired: string[] = [];

    await Promise.all(
      subs.map(async (sub: { id: string; endpoint: string; p256dh: string; auth: string }) => {
        try {
          const status = await sendPush(sub, payload);
          if (status === 201 || status === 200) sent++;
          else if (status === 410 || status === 404) expired.push(sub.id);
        } catch (err) {
          console.error("Push failed for", sub.endpoint, err);
        }
      }),
    );

    if (expired.length) {
      await db.from("push_subscriptions").delete().in("id", expired);
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-push-notification error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
