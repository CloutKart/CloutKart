import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore — groq-sdk ships a browser-compatible build usable in Deno via npm:
import Groq from "npm:groq-sdk";

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

**Color Story**
3 colors pulled directly from the brand's actual world — product, packaging, environment, emotion. Not generic palette presets. Name each color like it has a backstory: "Petrol Slick", "Split Milk", "Furious Yellow". Provide the exact hex.

**Hook**
This is the most important line in the document. Write the one sentence that would make someone freeze mid-scroll. Rules:
— Under 10 words
— Cannot start with "Discover", "Introducing", "Meet", or any verb that sounds like a press release
— Should feel like something a real person would text a friend, not read in an ad
— Should create a gap — make the viewer feel like they're missing something, doing something wrong, or about to understand something for the first time
— Must be specific to THIS product and THIS audience. Generic = disqualified.

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
  "colorStory": [
    { "name": "Evocative color name with backstory", "hex": "#RRGGBB" },
    { "name": "Evocative color name with backstory", "hex": "#RRGGBB" },
    { "name": "Evocative color name with backstory", "hex": "#RRGGBB" }
  ],
  "hook": "Single scroll-stopping line under 10 words",
  "adCaption": "3 sentences: product truth → desire gap → inevitable CTA",
  "whatWeWillCreate": [
    "Specific deliverable — platform, format, dimensions, creative descriptor",
    "Specific deliverable — platform, format, dimensions, creative descriptor",
    "Specific deliverable — platform, format, dimensions, creative descriptor",
    "Specific deliverable — platform, format, dimensions, creative descriptor"
  ]
}`;

const TEXT_MODEL = "llama-3.3-70b-versatile";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

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
      userPrompt += `\n\nContent scraped from the client's reference URL (${referenceUrl}). Use anything relevant — product details, brand language, aesthetic cues:\n---\n${urlContent}\n---`;
    } else if (referenceUrl) {
      userPrompt += `\nReference URL (could not fetch): ${referenceUrl}`;
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
