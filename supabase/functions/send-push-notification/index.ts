import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Required Supabase secrets (set via `supabase secrets set`):
//   VAPID_PUBLIC_KEY         — base64url uncompressed P-256 public key (65 bytes)
//   VAPID_PRIVATE_KEY        — base64url P-256 private key scalar d (32 bytes)
//   SUPABASE_URL             — auto-injected by Supabase
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase
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

// ── Byte utilities ───────────────────────────────────────────────────────────
// `new Uint8Array(n)` gives Uint8Array<ArrayBuffer>; `new Uint8Array(ab)` gives
// Uint8Array<ArrayBufferLike> which Deno's WebCrypto types reject as BufferSource.
// All helpers here guarantee the narrower Uint8Array<ArrayBuffer> type.

function b64uDecode(s: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const raw = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function b64uEncode(bytes: Uint8Array<ArrayBuffer>): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Convert any ArrayBuffer returned by crypto ops into Uint8Array<ArrayBuffer>.
function ab(buf: ArrayBuffer): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(buf.byteLength);
  out.set(new Uint8Array(buf));
  return out;
}

function concat(...parts: Uint8Array<ArrayBuffer>[]): Uint8Array<ArrayBuffer> {
  const total = parts.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of parts) { out.set(a, off); off += a.length; }
  return out;
}

// Uint8Array literal that TypeScript knows is ArrayBuffer-backed.
function bytes(...vals: number[]): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(vals.length);
  for (let i = 0; i < vals.length; i++) out[i] = vals[i];
  return out;
}

// ── VAPID ────────────────────────────────────────────────────────────────────

async function importVapidPrivateKey(): Promise<CryptoKey> {
  const pub = b64uDecode(VAPID_PUBLIC_KEY); // 65 bytes: 0x04 || x(32) || y(32)
  return crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", d: VAPID_PRIVATE_KEY, x: b64uEncode(pub.slice(1, 33)), y: b64uEncode(pub.slice(33, 65)) },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

async function buildVapidAuth(endpoint: string): Promise<string> {
  const enc = new TextEncoder();
  const { protocol, host } = new URL(endpoint);
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;

  const headerB64 = b64uEncode(ab(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })).buffer));
  const payloadB64 = b64uEncode(ab(enc.encode(JSON.stringify({ aud: `${protocol}//${host}`, exp, sub: VAPID_SUBJECT })).buffer));
  const sigInput = `${headerB64}.${payloadB64}`;

  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    await importVapidPrivateKey(),
    enc.encode(sigInput),
  );
  return `vapid t=${sigInput}.${b64uEncode(ab(sig))},k=${VAPID_PUBLIC_KEY}`;
}

// ── Web Push encryption — RFC 8291 (aes128gcm) ───────────────────────────────

async function encryptPayload(
  payload: string,
  p256dhB64: string,
  authB64: string,
): Promise<{ ciphertext: Uint8Array<ArrayBuffer>; salt: Uint8Array<ArrayBuffer>; serverPublicKey: Uint8Array<ArrayBuffer> }> {
  const enc = new TextEncoder();

  // Receiver's public key — keep raw bytes for the PRK info field
  const receiverKeyBytes = b64uDecode(p256dhB64);
  const receiverKey = await crypto.subtle.importKey("raw", receiverKeyBytes, { name: "ECDH", namedCurve: "P-256" }, false, []);

  // Ephemeral sender key pair
  const senderPair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const senderPublicKeyRaw = ab(await crypto.subtle.exportKey("raw", senderPair.publicKey));

  // ECDH shared secret
  const sharedSecret = ab(await crypto.subtle.deriveBits({ name: "ECDH", public: receiverKey }, senderPair.privateKey, 256));

  const authSecret = b64uDecode(authB64);
  const salt = ab(crypto.getRandomValues(new Uint8Array(16)).buffer);

  // PRK — RFC 8291 §3.1
  const ikm = await crypto.subtle.importKey("raw", sharedSecret, "HKDF", false, ["deriveBits"]);
  const prk = ab(await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: authSecret, info: concat(enc.encode("WebPush: info\0") as Uint8Array<ArrayBuffer>, receiverKeyBytes, senderPublicKeyRaw) },
    ikm, 256,
  ));

  const prkKey = await crypto.subtle.importKey("raw", prk, "HKDF", false, ["deriveBits"]);

  // CEK (16 bytes) and Nonce (12 bytes)
  const cekRaw = ab(await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: enc.encode("Content-Encoding: aes128gcm\0") as Uint8Array<ArrayBuffer> },
    prkKey, 128,
  ));
  const nonce = ab(await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: enc.encode("Content-Encoding: nonce\0") as Uint8Array<ArrayBuffer> },
    prkKey, 96,
  ));

  const cek = await crypto.subtle.importKey("raw", cekRaw, "AES-GCM", false, ["encrypt"]);
  const ciphertext = ab(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, cek, concat(enc.encode(payload) as Uint8Array<ArrayBuffer>, bytes(2))));

  return { ciphertext, salt, serverPublicKey: senderPublicKeyRaw };
}

function buildAes128GcmBody(salt: Uint8Array<ArrayBuffer>, serverPublicKey: Uint8Array<ArrayBuffer>, ciphertext: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
  // RFC 8188 header: salt(16) | rs(4 BE) | idlen(1) | keyid(65) | ciphertext
  const header = new Uint8Array(16 + 4 + 1 + serverPublicKey.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096, false);
  header[20] = serverPublicKey.length;
  header.set(serverPublicKey, 21);
  return concat(header, ciphertext);
}

// ── Send one subscription ────────────────────────────────────────────────────

async function sendPush(sub: { endpoint: string; p256dh: string; auth: string }, payload: string): Promise<number> {
  const { ciphertext, salt, serverPublicKey } = await encryptPayload(payload, sub.p256dh, sub.auth);
  const res = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      "Authorization": await buildVapidAuth(sub.endpoint),
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "TTL": "86400",
    },
    body: buildAes128GcmBody(salt, serverPublicKey, ciphertext),
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
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: subs } = await query;
    if (!subs?.length) return new Response(JSON.stringify({ sent: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const payload = JSON.stringify({ title, body, url: url || "/" });
    let sent = 0;
    const expired: string[] = [];

    await Promise.all(subs.map(async (sub: { id: string; endpoint: string; p256dh: string; auth: string }) => {
      try {
        const status = await sendPush(sub, payload);
        if (status === 201 || status === 200) sent++;
        else if (status === 410 || status === 404) expired.push(sub.id);
      } catch (err) {
        console.error("Push failed for", sub.endpoint, err);
      }
    }));

    if (expired.length) await db.from("push_subscriptions").delete().in("id", expired);

    return new Response(JSON.stringify({ sent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("send-push-notification error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
