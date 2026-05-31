import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore — groq-sdk ships a browser-compatible build usable in Deno via npm:
import Groq from "npm:groq-sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL = "llama-3.3-70b-versatile";

// ── People Data Labs helpers ──────────────────────────────────────────────────

interface PDLCompany {
  name?: string;
  website?: string;
  industry?: string;
  employee_count?: number;
  founded?: number;
  location?: { country?: string; locality?: string };
  technologies?: string[];
  tags?: string[];
  summary?: string;
  linkedin_url?: string;
  funding?: { total_funding_raised?: number; latest_funding_stage?: string };
}

async function pdlEnrich(domain: string, apiKey: string): Promise<PDLCompany | null> {
  try {
    const res = await fetch(
      `https://api.peopledatalabs.com/v5/company/enrich?website=${encodeURIComponent(domain)}`,
      {
        headers: { "X-Api-Key": apiKey },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) {
      console.warn(`[PDL enrich] HTTP ${res.status}`);
      return null;
    }
    return await res.json() as PDLCompany;
  } catch (e) {
    console.warn("[PDL enrich] Failed:", (e as Error).message);
    return null;
  }
}

function formatPDLForPrompt(c: PDLCompany): string {
  return `Company: ${c.name ?? "Unknown"}
Industry: ${c.industry ?? "Unknown"}
Employees: ${c.employee_count ?? "Unknown"}
Founded: ${c.founded ?? "Unknown"}
Location: ${[c.location?.locality, c.location?.country].filter(Boolean).join(", ") || "Unknown"}
Technologies: ${c.technologies?.join(", ") || "Unknown"}
Tags: ${c.tags?.join(", ") || "None"}
Funding Stage: ${c.funding?.latest_funding_stage ?? "Unknown"}
Description: ${c.summary ?? "None"}`.trim();
}

// ── Hunter.io helpers ─────────────────────────────────────────────────────────

interface HunterEmail {
  value?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  linkedin?: string;
  phone_number?: string;
  confidence?: number;
}

async function hunterDomainSearch(domain: string, apiKey: string): Promise<HunterEmail[]> {
  try {
    const res = await fetch(
      `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${apiKey}&limit=6&seniority=senior,executive`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) {
      console.warn(`[Hunter] HTTP ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.data?.emails ?? []) as HunterEmail[];
  } catch (e) {
    console.warn("[Hunter] Failed:", (e as Error).message);
    return [];
  }
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function extractDomain(url: string): string | null {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// ── System prompts ────────────────────────────────────────────────────────────

const DISCOVER_LOCAL_SYSTEM = `You are CloutKart's lead generation specialist. CloutKart is an India-based performance creative studio that makes ads and social media creatives for small D2C brands. CloutKart is early-stage and NOT well-known — this means it must win clients that bigger agencies ignore.

TARGET: The smallest, least-known brands possible. Local city-level brands, home-kitchen food businesses, handmade product sellers, Instagram-only boutiques, WhatsApp-based businesses, first-time founders. These brands have zero creative team, use iPhone photos or Canva, and are desperate to look professional. A brand with 200–2,000 Instagram followers is a BETTER lead than one with 50,000.

Your job: generate 4–6 scored lead profiles matching the given criteria.

## India-Specific Context
CloutKart's best prospects are Indian local brands in niches like: homemade skincare/beauty, regional food & snacks, handmade fashion & jewellery, local fitness & wellness, small home decor sellers, regional pet care brands. They sell via Instagram DM, WhatsApp Business, local markets, and Meesho/Amazon India. They are NOT on LinkedIn. Find them on Instagram.

## Scoring Framework (0–10 each, compositeScore = weighted average)

- creativeVolumeNeed (0.30) — How urgently do they need better creatives? Founder posting blurry iPhone photos or recycled Canva templates = 9–10. Already using a designer = 4.
- capacityGap (0.30) — Is the founder doing EVERYTHING alone? Solo founder, no team = 10. Any hired creative = 5.
- budgetReadiness (0.20) — Can they spend ₹5K–20K/month on creatives? Actively selling product (even small volume) = 7. Pre-revenue idea stage = 3.
- growthStageFit (0.20) — Are they at the point where better creatives would visibly change their growth? Just started getting traction (100–2000 followers, a few orders/week) = 9–10. Still figuring out product = 4.

HIGHEST FIT SIGNALS — score 9–10:
- "DM to order" in Instagram bio
- Bio says "Homemade", "Small batch", "Local delivery", city name in bio
- Posts product photos with plain background or hand-holding product
- WhatsApp number in bio
- Less than 2,000 followers but consistent posting
- No website, selling purely via Instagram or WhatsApp
- Founder IS the brand (personal name + brand mixed)

LOWEST FIT SIGNALS — score 3–5:
- Has a full website with professional photography
- 50,000+ followers
- Mentions "agency" or "team" in bio
- Already running polished Meta ads

## Output Format

Return ONLY valid raw JSON — no markdown fences, no preamble. Exact structure:

{
  "leads": [
    {
      "name": "Specific archetype name like 'Mumbai Home Baker - Instagram Only' not generic labels",
      "compositeScore": 8.5,
      "scoreBreakdown": {
        "creativeVolumeNeed": 9,
        "capacityGap": 10,
        "budgetReadiness": 7,
        "growthStageFit": 9
      },
      "whyTheyNeedUs": "2–3 sentences on their exact pain point — what their current creatives look like and why it's costing them sales",
      "scoreRationale": "1–2 sentences explaining the score using the specific signals above",
      "targetProfile": "Follower range, posting style, bio cues, selling method, city/region, product type",
      "whereToFindThem": "Exact Instagram hashtags, search terms, or communities — e.g. #mumbaihomebaker #handmadejewelleryindia #delhifoodie",
      "outreachAngle": "The one specific thing to open with — reference their exact situation, not a generic pitch"
    }
  ]
}`;

const DISCOVER_GROWTH_SYSTEM = `You are CloutKart's lead generation specialist. CloutKart is an India-based performance creative studio that makes performance ads and social creatives for growing D2C brands. CloutKart is early-stage — it targets brands that are scaling fast but haven't yet hired a proper creative team or agency.

TARGET: Bootstrapped or angel-funded Indian D2C brands with 5K–100K Instagram followers, running Meta/Instagram ads inconsistently, selling online (own website, Amazon, Nykaa, or similar), 1–3 years old, team of 1–10. These brands know they need better creatives but haven't committed to an agency yet.

Your job: generate 4–6 scored lead profiles matching the given criteria.

## India-Specific Context
Growing D2C niches in India: skincare & personal care, health supplements, fashion & accessories, food & beverages, fitness gear, home & living, baby & kids. These brands run Meta ads, post Reels, have a Shopify or WooCommerce store, and are spending ₹50K–5L/month on ads but using generic or Canva creatives.

## Scoring Framework (0–10 each, compositeScore = weighted average)

- creativeVolumeNeed (0.30) — Are they running paid ads with poor creative quality? Active Meta ads + inconsistent output = 9–10. Organic only = 5.
- capacityGap (0.30) — Do they lack a full-time creative team? 1–5 person team, no dedicated designer = 8–9. Has an in-house designer = 4.
- budgetReadiness (0.20) — Can they afford ₹20K–50K/month on a retainer? Active ad spend + product revenue = 8. No ads, no revenue = 3.
- growthStageFit (0.20) — Are they at the inflection point where better creatives will directly increase ROAS? Scaling ads, hitting frequency issues, creative fatigue = 9–10.

HIGHEST FIT SIGNALS — score 8–10:
- Running Meta/Instagram ads but using the same 2–3 creatives
- Shopify store with decent traffic but low conversion
- 10K–50K followers, good engagement, inconsistent post quality
- Founder posting "behind the scenes" content — no dedicated creative direction
- Recently launched new product or SKU
- Active on Instagram Reels but no consistent brand aesthetic

LOWEST FIT SIGNALS — score 3–5:
- Already working with a creative agency (mentions collab or "powered by")
- 100K+ followers with polished, consistent brand aesthetic
- Series A+ funded with a full marketing team

## Output Format

Return ONLY valid raw JSON — no markdown fences, no preamble. Exact structure:

{
  "leads": [
    {
      "name": "Specific archetype name like 'Bootstrapped Skincare Brand - Scaling Meta Ads'",
      "compositeScore": 8.5,
      "scoreBreakdown": {
        "creativeVolumeNeed": 9,
        "capacityGap": 8,
        "budgetReadiness": 8,
        "growthStageFit": 9
      },
      "whyTheyNeedUs": "2–3 sentences on their exact pain point — creative fatigue, poor ROAS, inconsistent brand look",
      "scoreRationale": "1–2 sentences explaining the score using the specific signals above",
      "targetProfile": "Follower range, ad spend signals, store type, team size, posting cadence",
      "whereToFindThem": "Exact Instagram hashtags, Meta Ad Library search terms, or communities — e.g. #dtcbrandindia #skincarefounder",
      "outreachAngle": "The specific pain point to open with — reference their ad situation, not a generic pitch"
    }
  ]
}`;

const SCORE_SYSTEM = `You are CloutKart's lead qualification specialist. CloutKart is an India-based performance creative studio making ads and social creatives for the smallest D2C brands — local sellers, home-based businesses, first-time founders. CloutKart is NOT well-known and deliberately targets brands that bigger agencies ignore.

## Who is a perfect CloutKart lead
A local Indian brand selling via Instagram DM or WhatsApp, founder doing everything alone, posting Canva or iPhone photos, getting some orders but looking amateurish. They need to look professional but can't afford a full agency.

## Scoring Framework (0–10 each, compositeScore = weighted average)

- creativeVolumeNeed (0.30) — Do their current creatives look homemade? iPhone photos, plain Canva = 9–10. Already professional = 4.
- capacityGap (0.30) — Is the founder doing all creative work alone? Solo = 10. Has a designer = 4.
- budgetReadiness (0.20) — Are they actively selling and making some revenue? Consistent orders = 7–8. Zero sales = 3.
- growthStageFit (0.20) — Would better creatives visibly change their traction right now? 100–5K followers with consistent posting = 9. Just created account = 4.

BIAS: Score higher if the brand has "DM to order", homemade/handmade/local in bio, WhatsApp number visible, city name in bio, under 5K followers, no website. These are the best CloutKart prospects.

## Outreach Message Rules
- 2–4 sentences only — these founders are busy, not corporate
- Instagram DM / WhatsApp = super casual, like a peer texting — no formality, no "Dear founder"
- Email = short and direct, one clear value line
- Reference something SPECIFIC you can see about this brand — their product, their bio, their posting style
- Lead with what you noticed, not what you sell
- End with one easy question, not a pitch
- BANNED: "elevate", "game changer", "revolutionize", "unleash", "world-class", "innovative", "Dear", "I hope this message finds you"

## Output Format

Return ONLY valid raw JSON — no markdown fences, no preamble:

{
  "name": "Brand name",
  "compositeScore": 7.2,
  "scoreBreakdown": {
    "creativeVolumeNeed": 8,
    "capacityGap": 7,
    "budgetReadiness": 6,
    "growthStageFit": 8
  },
  "whyTheyNeedUs": "2–3 sentences on their specific pain point",
  "scoreRationale": "1–2 sentences tying dimensions to the score, with evidence from provided data",
  "targetProfile": "Concrete signals about this brand's size, activity, creative situation",
  "greenFlags": ["specific signal 1", "specific signal 2", "specific signal 3"],
  "redFlags": ["potential issue 1", "potential issue 2"],
  "outreachMessage": "Ready-to-send message tailored to this brand and platform"
}`;

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { mode } = body;

    if (mode !== "discover" && mode !== "score" && mode !== "fetch_contacts") {
      return new Response(
        JSON.stringify({ error: "mode must be 'discover', 'score', or 'fetch_contacts'" }),
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

    const PDL_API_KEY    = Deno.env.get("PDL_API_KEY")    ?? "";
    const HUNTER_API_KEY = Deno.env.get("HUNTER_API_KEY") ?? "";
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    // ── DISCOVER MODE ─────────────────────────────────────────────────────────
    if (mode === "discover") {
      const { niche, stage, geography, platform, budget, followers, funding, runningAds, creativeSetup, painPoint, employeeRange, targetMode } = body;
      const discoverSystem = targetMode === "growth" ? DISCOVER_GROWTH_SYSTEM : DISCOVER_LOCAL_SYSTEM;

      const userPrompt = `Generate scored lead profiles for CloutKart based on these discovery criteria:

Target Niche: ${niche || "Any"}
Business Stage: ${stage || "Growing (1–3 yr)"}
Instagram Followers: ${followers || "5K–25K"}
Funding Status: ${funding || "Bootstrapped"}
Running Paid Ads: ${runningAds || "Running but inconsistent"}
Current Creative Setup: ${creativeSetup || "Founder DIY / Canva"}
Pain Point to Target: ${painPoint || "Can't afford a full agency"}
Outreach Platform: ${platform || "Instagram DM"}
Geography: ${geography || "India"}
Employee Count: ${employeeRange || "1–10"}
Monthly Ad Budget: ${budget || "₹50K–2L"}

Generate 4–6 ideal archetype leads matching these criteria. Give each a descriptive archetype name.

Return only the JSON object.`;

      const res = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: discoverSystem },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.6,
      });

      const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

      let result;
      try {
        result = JSON.parse(cleaned);
      } catch {
        console.error("[lead-agent discover] JSON parse failed:", raw);
        throw new Error("Model returned malformed JSON. Try again.");
      }

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── SCORE MODE ────────────────────────────────────────────────────────────
    if (mode === "score") {
      const { brandName, brandUrl, niche, platform } = body;

      if (!brandName) {
        return new Response(
          JSON.stringify({ error: "brandName is required for score mode" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let enrichContext = "";
      if (PDL_API_KEY && brandUrl) {
        const domain = extractDomain(brandUrl);
        if (domain) {
          const company = await pdlEnrich(domain, PDL_API_KEY);
          if (company) {
            enrichContext = `\n\n## COMPANY DATA FROM PEOPLE DATA LABS\n\n${formatPDLForPrompt(company)}`;
          }
        }
      }

      const userPrompt = `Score this brand as a CloutKart prospect:

Brand Name: ${brandName}
${brandUrl ? `Website / URL: ${brandUrl}` : ""}
Niche: ${niche || "Unknown"}
Preferred Outreach Platform: ${platform || "Instagram DM"}
${enrichContext}

Evaluate fit for CloutKart's services (performance ad creatives for D2C brands). Use the company data if provided.

Return only the JSON object.`;

      const res = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SCORE_SYSTEM },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.55,
      });

      const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

      let result;
      try {
        result = JSON.parse(cleaned);
      } catch {
        console.error("[lead-agent score] JSON parse failed:", raw);
        throw new Error("Model returned malformed JSON. Try again.");
      }

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── FETCH CONTACTS MODE (Hunter.io) ───────────────────────────────────────
    if (mode === "fetch_contacts") {
      const { domain } = body;

      if (!domain) {
        return new Response(
          JSON.stringify({ error: "domain is required for fetch_contacts mode", contacts: [] }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!HUNTER_API_KEY) {
        return new Response(
          JSON.stringify({ error: "HUNTER_API_KEY not configured. Add it in Supabase → Project Settings → Edge Functions → Secrets.", contacts: [] }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const emails = await hunterDomainSearch(domain, HUNTER_API_KEY);

      const contacts = emails.map((e) => ({
        name: [e.first_name, e.last_name].filter(Boolean).join(" ") || "Unknown",
        role: e.position ?? null,
        email: e.value ?? null,
        phone: e.phone_number ?? null,
        linkedin_url: e.linkedin ?? null,
        instagram_handle: null,
      }));

      return new Response(
        JSON.stringify({ contacts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (err) {
    console.error("[lead-agent] Error:", err);
    const message = err instanceof Error ? err.message : "Lead agent failed";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
