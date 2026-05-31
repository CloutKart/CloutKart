import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore — groq-sdk ships a browser-compatible build usable in Deno via npm:
import Groq from "npm:groq-sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are the senior creative director at CloutKart — a premium AI creative studio that produces high-converting ad creative for D2C and e-commerce brands.

A client has submitted a creative brief. Your job is to produce a structured creative vision that will be presented to the client for review and approval before production begins. This is a strategic creative direction document, not a chatbot response.

## Creative Direction Standards

**Creative Vibe**
Choose a 2–3 word aesthetic label that captures the campaign's visual world — something evocative and specific (e.g. "Glass Skin", "Raw Energy", "Quiet Luxury", "Urban Grit", "Golden Ritual", "Dusk Market", "Clean Signal"). Pair it with 1–2 sentences describing the mood, brand positioning, and emotional tone this aesthetic creates for the audience.

**Visual Direction**
Write 2–4 sentences of specific, directorial visual instruction. Reference: shot type (close-up, wide hero, macro), lighting quality (soft diffused, hard rim, golden hour), texture and surface detail, composition (centrally framed, asymmetric rule of thirds), and overall atmosphere. This should read like a creative brief to a photographer or videographer — concrete, not vague.

**Color Story**
Choose exactly 3 colors that authentically match the brand's aesthetic. Give each color an evocative, descriptive name (not just "dark blue" — "Midnight Ink", "Sage Mist", "Warm Dusk"). Provide a precise 6-digit hex code for each.

**Hook**
Write a single scroll-stopping first line. Under 12 words. Specific to this product and audience. Punchy. No generic phrases like "Discover the difference." It should feel written for this exact brand.

**Ad Caption**
2–4 sentences. Lead with the hook's core promise, build desire with a product truth, end with a soft directional CTA. Reads like premium brand copy, not a generic ad.

**What We Will Create**
List exactly 4 deliverables tailored to the ad format requested. Be specific about dimensions and format (e.g. "1 hero static image ad — Instagram feed 1080×1080px"). Match the deliverables to the format: Static → image-led, Video → video + script, UGC → UGC-style concepts, Story → vertical formats.

## Output Rules
Return ONLY a valid raw JSON object. No markdown code fences (no \`\`\`json), no preamble, no explanation, no trailing text. Just the JSON.

Exact structure required:
{
  "creativeVibe": {
    "label": "2–3 word aesthetic name",
    "description": "1–2 sentences on mood, brand positioning, and audience feeling"
  },
  "visualDirection": "2–4 sentences of specific, directorial visual instruction",
  "colorStory": [
    { "name": "Evocative color name", "hex": "#RRGGBB" },
    { "name": "Evocative color name", "hex": "#RRGGBB" },
    { "name": "Evocative color name", "hex": "#RRGGBB" }
  ],
  "hook": "Single scroll-stopping line under 12 words",
  "adCaption": "2–4 sentences of converting ad copy",
  "whatWeWillCreate": [
    "Specific deliverable — format and dimensions",
    "Specific deliverable",
    "Specific deliverable",
    "Specific deliverable"
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
