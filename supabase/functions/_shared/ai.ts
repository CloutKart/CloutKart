// OpenAI-compatible chat inference with provider fail-over.
//
// One model call goes through an ordered list of providers. A provider that
// still has a fallback behind it spills IMMEDIATELY on a rate limit (429) —
// there's no point waiting on a throttled provider when another one is ready —
// and retries at most once on a transient 5xx. The LAST provider (nowhere left
// to spill) backs off and retries in place.
//
// Providers are read at call time, so adding a secret in the Supabase dashboard
// takes effect on the next invocation without a redeploy.

export type Part =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type Msg = { role: "system" | "user"; content: string | Part[] };

type Provider = {
  name: string;
  baseUrl: string;
  key: string;
  /** The text model. */
  model: string;
  /** A multimodal model on the SAME provider, if it has one. Briefs that carry
   *  reference photos are routed to these first; a provider without one is blind
   *  and only ever sees the images stripped out. */
  visionModel?: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Parse a rate-limit "Please try again in 940ms / 1.2s" hint into ms. */
function retryAfterMs(body: string): number | null {
  const m = body.match(/try again in ([\d.]+)\s*(ms|s)/i);
  if (!m) return null;
  return m[2].toLowerCase() === "s" ? Math.round(parseFloat(m[1]) * 1000) : Math.round(parseFloat(m[1]));
}

const env = (k: string) => Deno.env.get(k);

/**
 * The fail-over chain, in order — the same shape slid uses:
 *   AI_*           → primary  (Cerebras: fastest, direct)
 *   AI_FALLBACK_*  → fallback (OpenRouter: aggregates backends, absorbs bursts)
 *   GROQ_*         → last resort
 *
 * Each tier also takes an optional *_VISION_MODEL for briefs with reference
 * photos. If none is configured anywhere, image briefs still succeed — the
 * photos are just dropped (see chat()).
 */
function providers(): Provider[] {
  const out: Provider[] = [];
  const add = (name: string, key?: string, baseUrl?: string, model?: string, visionModel?: string) => {
    if (key && baseUrl && model) out.push({ name, key, baseUrl, model, visionModel });
  };

  add("primary", env("AI_API_KEY"), env("AI_BASE_URL"), env("AI_MODEL"), env("AI_VISION_MODEL"));
  add(
    "fallback",
    env("AI_FALLBACK_API_KEY"),
    env("AI_FALLBACK_BASE_URL"),
    env("AI_FALLBACK_MODEL"),
    env("AI_FALLBACK_VISION_MODEL"),
  );

  const groqKey = env("GROQ_API_KEY");
  if (groqKey) {
    out.push({
      name: "groq",
      key: groqKey,
      baseUrl: env("GROQ_BASE_URL") || "https://api.groq.com/openai/v1",
      // A creative-vision doc is a heavy generation task — the last resort still
      // has to write something usable, so this defaults to the 70b model the
      // lead-agent already runs on, not an 8b instant model.
      model: env("GROQ_MODEL") || "llama-3.3-70b-versatile",
      visionModel: env("GROQ_VISION_MODEL"),
    });
  }

  return out;
}

export function aiEnabled(): boolean {
  return providers().length > 0;
}

const hasImages = (messages: Msg[]) =>
  messages.some((m) => Array.isArray(m.content) && m.content.some((p) => p.type === "image_url"));

/** Drop image parts so a blind model can still answer the brief. */
function stripImages(messages: Msg[]): Msg[] {
  return messages.map((m) => {
    if (typeof m.content === "string") return m;
    const text = m.content.filter((p): p is { type: "text"; text: string } => p.type === "text");
    return { ...m, content: text.length === 1 ? text[0].text : text };
  });
}

/** One provider call. Throws so the caller can fail over. */
async function callProvider(
  p: Provider,
  model: string,
  messages: Msg[],
  opts: { json?: boolean; temperature?: number; maxTokens?: number },
  isLast: boolean,
): Promise<string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${p.key}`,
    "content-type": "application/json",
  };
  if (p.baseUrl.includes("openrouter")) headers["X-Title"] = "CloutKart";

  const maxAttempts = isLast ? 6 : 2;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${p.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.3,
        ...(opts.maxTokens ? { max_tokens: opts.maxTokens } : {}),
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        // OpenRouter-only: route to the highest-throughput backend for the model.
        ...(p.baseUrl.includes("openrouter") ? { provider: { sort: "throughput" } } : {}),
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (res.ok) {
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return json.choices?.[0]?.message?.content ?? "";
    }

    const body = await res.text();
    const transient = res.status === 429 || res.status >= 500;
    const spillNow = !isLast && res.status === 429; // fail over instantly on rate limit
    if (transient && !spillNow && attempt < maxAttempts - 1) {
      const wait = (res.status === 429 ? retryAfterMs(body) : null) ?? Math.min(8000, 500 * 2 ** attempt);
      await sleep(wait + 250);
      continue;
    }
    throw new Error(`${p.name} ${res.status}: ${body.slice(0, 300)}`);
  }
}

/**
 * Run a chat completion through the provider chain. Throws only when every
 * provider has failed; the last error is what surfaces.
 *
 * When the brief carries reference photos, providers that have a vision model
 * are tried FIRST, in their configured order — seeing the product matters more
 * than shaving a second off the response. Blind providers stay in the chain as a
 * last resort, with the images stripped, so a brief never fails just because
 * every vision model was down.
 */
export async function chat(
  messages: Msg[],
  opts: { json?: boolean; temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const provs = providers();
  if (!provs.length) {
    throw new Error(
      "No AI provider configured. Set AI_API_KEY / AI_BASE_URL / AI_MODEL (or GROQ_API_KEY) in Supabase → Edge Functions → Secrets.",
    );
  }

  const withImages = hasImages(messages);
  const chain = withImages
    ? [...provs.filter((p) => p.visionModel), ...provs.filter((p) => !p.visionModel)]
    : provs;

  let lastErr: unknown;
  for (let i = 0; i < chain.length; i++) {
    const p = chain[i];
    const isLast = i === chain.length - 1;
    const blind = withImages && !p.visionModel;
    const model = withImages && p.visionModel ? p.visionModel : p.model;

    if (blind) {
      console.warn(`[ai] "${p.name}" (${model}) can't read images — dropping the reference photos for this call`);
    }

    try {
      return await callProvider(p, model, blind ? stripImages(messages) : messages, opts, isLast);
    } catch (err) {
      lastErr = err;
      const msg = (err as Error).message;
      if (!isLast) console.error(`[ai] "${p.name}" (${model}) → failing over:`, msg);
      else console.error(`[ai] "${p.name}" (${model}) failed — last provider in the chain:`, msg);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("All AI providers failed");
}

/** Parse a model response as JSON, tolerating ```json fences and stray prose. */
export function parseJson<T = unknown>(content: string): T | null {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : content).trim();
  const start = body.search(/[[{]/);
  const end = body.lastIndexOf("}");
  const slice = start >= 0 && end > start ? body.slice(start, end + 1) : body;
  try {
    return JSON.parse(slice) as T;
  } catch {
    return null;
  }
}
