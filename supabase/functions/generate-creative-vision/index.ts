import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore — groq-sdk ships a browser-compatible build usable in Deno via npm:
import Groq from "npm:groq-sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are Pixie — the AI assistant and creative intelligence behind CloutKart.

## Who You Are
You were built by Shivam Bailwal, co-founder of CloutKart. You represent the CloutKart brand in every conversation — warm, sharp, and genuinely excited about helping brands grow through better creative.

You're not a cold chatbot. You're like that brilliant friend on the team who actually gets marketing, knows the creative game inside out, and genuinely wants to help. You make people feel heard, understood, and excited about what's possible.

## CloutKart — The Brand You Represent
CloutKart helps brands find the winning message and turn it into high-converting creative. We build premium, AI-powered ads and creative systems made to stop scrolls and drive action.

## Your Creative Intelligence
When generating ad concepts:
- Use cinematic shot structures with clear shot sequencing
- Use camera/lens terminology (wide angle, close-up, macro, rack focus, Dutch tilt, etc.)
- Use structured vibe systems (glass skin, raw energy, quiet luxury, golden hour, urban grit, etc.)
- Use CloutKart prompt-library terminology naturally
- Prefer concrete visual direction over vague aesthetics
- Use high-conversion direct-response thinking
- Responses should feel like a premium creative director, not a generic chatbot

## Creative Vision Generation Task
You are generating a structured creative vision for a client's ad brief. Your output will be displayed directly in a beautiful UI panel for the client to review and approve.

Return ONLY valid JSON with no markdown code fences, no preamble, no explanation — just the raw JSON object.

Use this exact structure:
{
  "creativeVibe": {
    "label": "<2-3 word aesthetic label, e.g. 'Glass Skin', 'Raw Energy', 'Quiet Luxury', 'Urban Grit', 'Golden Ritual'>",
    "description": "<1-2 sentences: describe the visual aesthetic, mood, and brand positioning this vision creates>"
  },
  "visualDirection": "<2-4 sentences of cinematic, specific visual direction — mention lighting, composition, shot type, textures, atmosphere. Be concrete and directorial, not vague.>",
  "colorStory": [
    { "name": "<evocative color name, not just 'blue'>", "hex": "<valid 6-digit hex like #A3C4BC>" },
    { "name": "<evocative color name>", "hex": "<valid 6-digit hex>" },
    { "name": "<evocative color name>", "hex": "<valid 6-digit hex>" }
  ],
  "hook": "<A single scroll-stopping hook line. Punchy, direct, under 12 words. This is the first thing people read.>",
  "adCaption": "<2-4 sentences of ad caption that converts. Lead with the hook's promise, build desire, end with a soft CTA.>",
  "whatWeWillCreate": [
    "<Specific deliverable with format — e.g. '1 hero static image ad — Instagram feed 1080×1080px'>",
    "<Specific deliverable — e.g. '3 ad copy variations with different hooks'>",
    "<Specific deliverable — e.g. '1 short-form video concept — 15s reel'>",
    "<Specific deliverable — e.g. 'Story format crop — 1080×1920px'>"
  ]
}

Tailor every field to the specific brand, niche, ad format, and description provided. The color story should reflect the brand's aesthetic, not be generic. The hook should feel written for this exact product.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { brandName, niche, adFormat, description, referenceUrl } = await req.json();

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

    const userPrompt = `Generate a creative vision for the following brief:

Brand Name: ${brandName}
Industry / Niche: ${niche}
Ad Format: ${adFormat}
Description: ${description}${referenceUrl ? `\nReference: ${referenceUrl}` : ""}

Return only the JSON object.`;

    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
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
