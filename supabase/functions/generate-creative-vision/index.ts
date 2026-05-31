import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore — groq-sdk ships a browser-compatible build usable in Deno via npm:
import Groq from "npm:groq-sdk";
// @ts-ignore
import { MongoClient } from "npm:mongodb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are the creative director at CloutKart — a performance creative studio that makes ads people actually stop for. You've produced campaigns for hundreds of D2C brands and you know one thing: safe creative is dead creative.

A client has submitted a brief. Your job is to write a creative vision document that makes them lean forward — something opinionated, specific, and charged with a point of view. Not a mood board description. A direction.

## How to Think About Each Section

**Creative Vibe**
Name the world the campaign lives in. 2–3 words that feel like a subculture, a decade, a texture — not a marketing category. "Raw Signal" beats "Bold and Modern". "Borrowed Nostalgia" beats "Retro Feel". "Fever Dream Commerce" beats "Playful and Fun". Then in 1–2 sentences: what emotional state does this aesthetic provoke in the viewer, and why does it work for this specific brand?

**Visual Direction**
Direct this like you're on set. Name the exact shot (macro texture close-up, low-angle hero, over-shoulder POV), the exact light (practical tungsten spill, overexposed midday bleach, single hard key with deep shadow fall-off), and the ONE visual detail that makes this frame unforgettable. 3 sentences max. No "vibrant" or "sleek" — describe what the camera actually sees.

**Product Colors**
3 colors grounded in the product's physical reality — the packaging hue, the material texture, the hero ingredient or substance. These are factual, not aspirational. Name each like it has a backstory: "Petrol Slick", "Split Milk", "Furious Yellow". Provide the exact hex.

**Creative Vibe Colors**
3 colors that define the campaign's emotional atmosphere — the environment, the light, the feeling the viewer should have when they see this ad. These may or may not match the product's actual colors. They build the visual world around the product. Name each with the same evocative naming style. Provide the exact hex. Then write one sentence — the vibeColorRationale — explaining what emotional direction this palette creates and why it specifically serves this brief.

**Hook**
Generate ONE hook under 8 words. It must stop a thumb mid-scroll — even if the viewer knows nothing about the product.

FEATURES ≠ HOOKS. Never write:
- "14 days on one charge" — that's a spec
- "Contains Niacinamide 10%" — that's an ingredient
- "Made from premium cotton" — that's a material
A hook is about transformation, identity, or a truth that makes the reader feel something.

BEFORE WRITING THE HOOK, IDENTIFY:
1. The product category
2. The emotional benefit — what does the customer actually want to feel?
3. The desired transformation — who do they want to become after buying this?

Generate the hook around the transformation, not the feature.

HOOK FOCUS AREAS — choose one lens:
- DESIRED OUTCOME: The transformation the customer wants
- IDENTITY: Who the customer wants to become
- PAIN POINT: The frustration being solved
- ASPIRATION: The future state being promised
- CONTRARIAN INSIGHT: A belief worth challenging

EXECUTION — deliver it through ONE psychological trigger:
- CURIOSITY GAP: Leave an information loop open. "The skincare step everyone skips."
- PAIN POINT: Name a frustration the buyer feels daily. Make them feel seen instantly.
- PATTERN INTERRUPT: Say something the reader didn't expect from this product category.
- BOLD CLAIM: Make a specific, provable promise. Not vague. Not generic.
- REVERSE PSYCHOLOGY: Tell them NOT to buy it. "Don't buy this if your skin is fine."
- SHARP OBSERVATION: State something true about their life that no one else has said out loud.

STRICT RULES:
- Under 8 words. Non-negotiable.
- Must be instantly understandable by someone who has never heard of the product — no jargon, no brand lingo, no assumed knowledge
- No commas, no ellipsis, no exclamation marks
- Must reference something SPECIFIC to this product — not interchangeable with any other product
- Read it back — could it work for a competitor's product? If yes, rewrite it.
- BANNED WORDS: Unleash, Elevate, Level up, Game changer, Power, Transform, Discover, Unlock, Revolutionize, Experience, Journey, Ultimate, Premium, World-class, Next-level
- Do NOT start with "Introducing" or "Meet" or "This is"
- Do NOT use questions ending in "?" — statements hit harder than questions
- Gut check: would a 22-year-old in Mumbai stop scrolling for this? If no, rewrite.

EXAMPLES OF GOOD HOOKS BY CATEGORY:
- Fitness / Wearables: "Your next PR starts with last night's sleep"
- Fitness / Wearables: "Recovery is where champions are made"
- Skincare: "Your skin doesn't need filters"
- Skincare: "Clear skin starts before makeup"
- Skincare: "Your moisturiser is lying to your skin"
- Fashion: "Dress like you've already made it"
- Fashion: "Confidence is the best fit"
- Coffee: "Mornings deserve better"
- Supplements: "You sleep 8 hours. Your skin doesn't"
- Food: "Happiness is a $3 problem"
- Home: "Clean house. Zero effort. Pick one — just kidding"
- Tech: "Your phone is smarter than your charger"

Generate the hook, then internally ask: is this about the transformation (not the feature)? Is it specific? Is it unexpected? Is it under 8 words? Only output if all four are yes.

**Ad Caption**
3 sentences. First: land the hook's promise hard with a product truth. Second: make the reader feel the gap between their current life and their life with this product. Third: one short, confident directional — not a pleading CTA, a statement of inevitability. No exclamation marks unless they're earned.

**What We Will Create**
Exactly 4 deliverables. Match format and dimensions to the ad format requested. Be precise: format, platform, dimensions, one descriptor of what makes it distinct from a stock asset. Static → image-led, Video → scenes + script note, UGC → concept + talent direction, Story → vertical native formats.

## Non-Negotiables
— No "vibrant", "sleek", "modern", "innovative", "stunning", "powerful", "seamless", "elevate", "journey", "discover", "next-level"
— No hooks that start with "Are you...", "Tired of...", or "What if..."
— No color names that are just adjective + noun (no "Warm Beige", "Deep Blue", "Soft Pink")
— No deliverables that just say "1 image ad" — give them the full creative descriptor
— The whole document should feel like it was written by someone who has a strong opinion, not a committee that reached consensus

## Output Rules
Return ONLY a valid raw JSON object. No markdown code fences (no \`\`\`json), no preamble, no explanation, no trailing text. Just the JSON.

Exact structure required:
{
  "creativeVibe": {
    "label": "2–3 word aesthetic name",
    "description": "1–2 sentences on mood, brand positioning, and emotional provocation"
  },
  "visualDirection": "2–3 sentences of specific directorial instruction — shot, light, the one unforgettable detail",
  "productColors": [
    { "name": "Evocative name tied to the physical product", "hex": "#RRGGBB" },
    { "name": "Evocative name tied to the physical product", "hex": "#RRGGBB" },
    { "name": "Evocative name tied to the physical product", "hex": "#RRGGBB" }
  ],
  "vibeColors": [
    { "name": "Evocative name tied to campaign atmosphere", "hex": "#RRGGBB" },
    { "name": "Evocative name tied to campaign atmosphere", "hex": "#RRGGBB" },
    { "name": "Evocative name tied to campaign atmosphere", "hex": "#RRGGBB" }
  ],
  "vibeColorRationale": "One sentence on the emotional direction this palette creates for this specific brief",
  "hook": "Single scroll-stopping line under 8 words — no commas, no ellipsis, no exclamation marks",
  "adCaption": "3 sentences: product truth → desire gap → inevitable CTA",
  "whatWeWillCreate": [
    "plain string — e.g. Static image ad — Instagram feed 1080×1080px — tight macro of product texture",
    "plain string — e.g. Static image ad — Facebook feed 1080×1080px — low-angle hero with hard rim light",
    "plain string — e.g. Static image ad — Instagram Story 1080×1920px — full-bleed product on brand colour",
    "plain string — e.g. Static image ad — Amazon listing 1000×1000px — clean white background product shot"
  ]
}`;

const TEXT_MODEL = "llama-3.3-70b-versatile";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

async function getQueryEmbedding(text: string, hfKey: string): Promise<number[]> {
  const res = await fetch(
    "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${hfKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) throw new Error(`HF embedding error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data[0]) ? data[0] : data;
}

async function searchVisionChunks(queryVector: number[], mongoUri: string): Promise<string[]> {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const results = await client
      .db("cloutkart")
      .collection("vision_chunks")
      .aggregate([
        {
          $vectorSearch: {
            index: "vision_index",
            path: "embedding",
            queryVector,
            numCandidates: 60,
            limit: 4,
          },
        },
        { $project: { _id: 0, text_content: 1, section: 1, score: { $meta: "vectorSearchScore" } } },
      ])
      .toArray();
    return (results as Array<{ text_content: string }>).map((r) => r.text_content);
  } finally {
    await client.close();
  }
}

async function scrapeUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CloutKart/1.0; +https://clout-kart.com)" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    // Strip scripts, styles, tags; collapse whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2500);
    return text;
  } catch {
    return "";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { brandName, niche, adFormat, description, referenceUrl, referenceImages } = await req.json();

    if (!brandName || !niche || !adFormat || !description) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: brandName, niche, adFormat, description" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured. Add it in Supabase → Project Settings → Edge Functions → Secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    // Scrape the reference URL if provided
    let urlContent = "";
    if (referenceUrl) {
      urlContent = await scrapeUrl(referenceUrl);
    }

    // Build the user prompt text
    let userPrompt = `Generate a creative vision for the following brief:

Brand Name: ${brandName}
Industry / Niche: ${niche}
Ad Format: ${adFormat}
Description: ${description}`;

    if (urlContent) {
      userPrompt += `\n\nContent scraped from the client's reference URL (${referenceUrl}):
---
${urlContent}
---

HOOK INSTRUCTION — you have the brand's actual website content above. Before writing the hook, extract:
- Any specific product name, SKU, or variant mentioned
- Any price point, offer, or quantified claim (e.g. "0.5mm lead", "lasts 72 hours", "ships in 2 days")
- Any customer-language phrases or headlines the brand uses about itself
- Any concrete product truth that a competitor CANNOT truthfully claim

Use at least one of these extracted specifics in the hook so it is provably non-interchangeable with any other product or brand.`;
    } else if (referenceUrl) {
      userPrompt += `\nReference URL (could not fetch): ${referenceUrl}`;
    }

    // RAG: retrieve relevant creative intelligence chunks
    const HF_API_KEY   = Deno.env.get("HF_API_KEY");
    const MONGODB_URI  = Deno.env.get("MONGODB_URI");
    if (HF_API_KEY && MONGODB_URI) {
      try {
        const queryText  = `${brandName} ${niche} ${adFormat} ${description}`;
        const vector     = await getQueryEmbedding(queryText, HF_API_KEY);
        const chunks     = await searchVisionChunks(vector, MONGODB_URI);
        if (chunks.length > 0) {
          userPrompt += `\n\n## CLOUT KART CREATIVE INTELLIGENCE — RELEVANT REFERENCES\n\nThe following have been retrieved from CloutKart's knowledge base as most relevant to this brief. Use them as direct creative grounding — hooks, vibes, color logic, visual direction, and category rules that have proven to work for this type of product:\n\n${chunks.map((c, i) => `[Ref ${i + 1}]\n${c}`).join("\n\n")}`;
        }
      } catch (ragErr) {
        console.warn("[RAG] Skipping — retrieval failed:", (ragErr as Error).message);
      }
    }

    userPrompt += "\n\nReturn only the JSON object.";

    // Determine model and message content based on whether images are attached
    const hasImages = Array.isArray(referenceImages) && referenceImages.length > 0;
    const model = hasImages ? VISION_MODEL : TEXT_MODEL;

    type MessageContent =
      | string
      | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;

    const userContent: MessageContent = hasImages
      ? [
          { type: "text", text: userPrompt },
          ...referenceImages.slice(0, 3).map((img: { base64: string; mimeType: string }) => ({
            type: "image_url" as const,
            image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
          })),
        ]
      : userPrompt;

    const res = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent as Parameters<typeof groq.chat.completions.create>[0]["messages"][0]["content"] },
      ],
      max_tokens: 1200,
      temperature: 0.75,
    });

    const raw = res.choices?.[0]?.message?.content?.trim();
    if (!raw) throw new Error("Empty response from Groq");

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

    let vision;
    try {
      vision = JSON.parse(cleaned);
    } catch {
      console.error("[generate-creative-vision] JSON parse failed. Raw response:", raw);
      throw new Error("Model returned malformed JSON. Try again.");
    }

    return new Response(
      JSON.stringify(vision),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[generate-creative-vision] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate vision";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
