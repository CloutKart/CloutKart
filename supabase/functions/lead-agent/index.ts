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

// ── Google Places helpers ─────────────────────────────────────────────────────

interface OutscraperBusiness {
  name?: string;
  full_address?: string;
  city?: string;
  phone?: string;
  site?: string;
  category?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  instagram?: string;
  google_maps_url?: string;
}

async function googlePlacesSearch(
  queries: string[],
  apiKey: string,
  limitPerQuery = 5
): Promise<OutscraperBusiness[]> {
  const allPlaces: Array<{ name: string; place_id: string; formatted_address: string; types: string[]; rating?: number; user_ratings_total?: number }> = [];

  // Step 1: Text Search for each query — run in parallel
  let requestDenied = false;
  const searchResults = await Promise.allSettled(
    queries.map(async (query) => {
      const params = new URLSearchParams({ query, key: apiKey, language: "en", region: "IN" });
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`,
        { signal: AbortSignal.timeout(12000) }
      );
      if (!res.ok) {
        console.warn(`[GooglePlaces] Text search HTTP ${res.status} for "${query}"`);
        return null;
      }
      const data = await res.json();
      console.log(`[GooglePlaces] Query="${query}" status=${data.status} results=${data.results?.length ?? 0}`);
      if (data.status === "REQUEST_DENIED") {
        console.error(`[GooglePlaces] REQUEST_DENIED — check: 1) Places API is enabled in GCP, 2) billing is set up, 3) key has no HTTP referrer restrictions`);
        return "REQUEST_DENIED";
      }
      if (data.status !== "OK") return null;
      return (data.results ?? []).slice(0, limitPerQuery);
    })
  );

  for (const r of searchResults) {
    if (r.status === "fulfilled") {
      if (r.value === "REQUEST_DENIED") { requestDenied = true; break; }
      if (Array.isArray(r.value)) allPlaces.push(...r.value);
    }
  }

  if (requestDenied || allPlaces.length === 0) return [];

  // Step 2: Fetch place details in parallel (phone + website)
  const detailsResults = await Promise.allSettled(
    allPlaces.map(async (p) => {
      if (!p.place_id) return null;
      try {
        const det = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=formatted_phone_number,website,url&key=${apiKey}`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (!det.ok) return null;
        const dj = await det.json();
        return {
          phone: dj.result?.formatted_phone_number ?? "",
          site: dj.result?.website ?? "",
          google_maps_url: dj.result?.url ?? "",
        };
      } catch { return null; }
    })
  );

  return allPlaces.map((p, i) => {
    const det = detailsResults[i].status === "fulfilled" ? detailsResults[i].value : null;
    return {
      name: p.name,
      full_address: p.formatted_address,
      city: p.formatted_address?.split(",").slice(-3, -1).join(",").trim() ?? "",
      phone: det?.phone || undefined,
      site: det?.site || undefined,
      category: p.types?.[0]?.replace(/_/g, " ") ?? "",
      rating: p.rating,
      reviews: p.user_ratings_total,
      google_maps_url: det?.google_maps_url || undefined,
    };
  });
}

function formatBusinessForPrompt(b: OutscraperBusiness, idx: number): string {
  const ig = b.instagram ? `\nInstagram: ${b.instagram}` : "";
  const phone = b.phone ? `\nPhone: ${b.phone}` : "";
  const site = b.site ? `\nWebsite: ${b.site}` : "";
  const rating = b.rating ? `\nRating: ${b.rating} (${b.reviews ?? 0} reviews)` : "";
  const desc = b.description ? `\nDescription: ${b.description.slice(0, 120)}` : "";
  return `[Business ${idx + 1}]
Name: ${b.name ?? "Unknown"}
Location: ${b.city ?? b.full_address ?? "India"}
Category: ${b.category ?? "Unknown"}${phone}${site}${ig}${rating}${desc}`.trim();
}

function buildSearchQueries(niche: string, targetMode: string, city: string): string[] {
  const loc = city?.trim() || "India";
  // Use Google Maps-friendly queries — match what someone would search on Google Maps
  if (targetMode === "growth") {
    return [
      `${niche} brand ${loc}`,
      `${niche} company ${loc}`,
    ];
  }
  // Local mode — small shops, boutiques, home businesses
  return [
    `${niche} boutique ${loc}`,
    `${niche} store ${loc}`,
  ];
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

async function scrapeWebsiteSnippet(url: string): Promise<string> {
  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const res = await fetch(fullUrl, {
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CloutKart/1.0)" },
    });
    if (!res.ok) return "";
    const html = await res.text();

    const title = html.match(/<title[^>]*>([^<]{4,120})<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
    const metaDesc =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{10,300})["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']{10,300})["'][^>]+name=["']description["']/i)?.[1] ??
      "";
    const h1 = html.match(/<h1[^>]*>([^<]{4,120})<\/h1>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? "";

    return [title, h1, metaDesc].filter(Boolean).join(" | ").slice(0, 400);
  } catch {
    return "";
  }
}

// ── System prompts ────────────────────────────────────────────────────────────

const DISCOVER_LOCAL_SYSTEM = `You are Ezio — CloutKart's precision lead hunter. Like the assassin who moves unseen through the crowd and strikes only the right target, you identify the exact brands that need CloutKart's help and ignore everyone else. No wasted effort. No missed targets. Every lead is a calculated strike.

CloutKart is an India-based performance creative studio that makes ads and social media creatives for small D2C brands. CloutKart is early-stage and NOT well-known — this means it must win clients that bigger agencies ignore.

TARGET: The smallest, least-known brands possible. Local city-level brands, home-kitchen food businesses, handmade product sellers, Instagram-only boutiques, WhatsApp-based businesses, first-time founders. These brands have zero creative team, use iPhone photos or Canva, and are desperate to look professional. A brand with 200–2,000 Instagram followers is a BETTER lead than one with 50,000.

Your job: identify 4–6 high-value targets matching the given criteria. Be surgical. Every profile should feel like intel gathered from the shadows — specific, actionable, no filler.

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

## Outreach Angle Rules

1. NEVER begin with: "Hi, I saw your brand...", "I came across your profile...", "Hope you're doing well...", or any generic sales opener.
2. The first sentence MUST reference a specific observation about the brand.
3. Identify ONE opportunity — do not list multiple problems.
4. Never claim the brand has poor creatives, poor ROAS, low engagement, or weak marketing unless objective evidence exists. If evidence is unavailable, frame as opportunity: "There may be an opportunity to…", "One area worth exploring…", "We noticed potential to…"
5. Sound founder-to-founder, not agency-to-client.
6. Structure: Observation → Opportunity → Why CloutKart → Conversation starter.
7. Maximum 50 words.
8. Banned buzzwords: disruptive, game-changing, innovative, cutting-edge, revolutionary.
9. Every outreach angle must feel custom-written for this specific brand — no templates.

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

const DISCOVER_GROWTH_SYSTEM = `You are Ezio — CloutKart's precision lead hunter. Like the assassin who studies his target before striking, you analyse every signal before committing to a lead. You move through the noise of thousands of D2C brands and surface only the ones worth pursuing — the ones at the exact inflection point where CloutKart's work will change their trajectory.

CloutKart is an India-based performance creative studio that makes performance ads and social creatives for growing D2C brands. CloutKart is early-stage — it targets brands that are scaling fast but haven't yet hired a proper creative team or agency.

TARGET: Bootstrapped or angel-funded Indian D2C brands with 5K–100K Instagram followers, running Meta/Instagram ads inconsistently, selling online (own website, Amazon, Nykaa, or similar), 1–3 years old, team of 1–10. These brands know they need better creatives but haven't committed to an agency yet.

Your job: identify 4–6 high-value targets matching the given criteria. Be surgical. Every profile should feel like a dossier prepared before a mission — specific, actionable, no filler.

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

## Outreach Angle Rules

1. NEVER begin with: "Hi, I saw your brand...", "I came across your profile...", "Hope you're doing well...", or any generic sales opener.
2. The first sentence MUST reference a specific observation about the brand.
3. Identify ONE opportunity — do not list multiple problems.
4. Never claim the brand has poor creatives, poor ROAS, low engagement, or weak marketing unless objective evidence exists. If evidence is unavailable, frame as opportunity: "There may be an opportunity to…", "One area worth exploring…", "We noticed potential to…"
5. Sound founder-to-founder, not agency-to-client.
6. Structure: Observation → Opportunity → Why CloutKart → Conversation starter.
7. Maximum 50 words.
8. Banned buzzwords: disruptive, game-changing, innovative, cutting-edge, revolutionary.
9. Every outreach angle must feel custom-written for this specific brand — no templates.

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

const SCORE_SYSTEM = `You are Ezio — CloutKart's precision lead qualifier. You don't spray and pray. You study a target, assess every signal, and deliver a verdict: worthy or not. Your scoring is your blade — sharp, decisive, and always explained. CloutKart is an India-based performance creative studio making ads and social creatives for the smallest D2C brands — local sellers, home-based businesses, first-time founders. CloutKart is NOT well-known and deliberately targets brands that bigger agencies ignore.

## Who is a perfect CloutKart lead
A local Indian brand selling via Instagram DM or WhatsApp, founder doing everything alone, posting Canva or iPhone photos, getting some orders but looking amateurish. They need to look professional but can't afford a full agency.

## Scoring Framework (0–10 each, compositeScore = weighted average)

- creativeVolumeNeed (0.30) — Do their current creatives look homemade? iPhone photos, plain Canva = 9–10. Already professional = 4.
- capacityGap (0.30) — Is the founder doing all creative work alone? Solo = 10. Has a designer = 4.
- budgetReadiness (0.20) — Are they actively selling and making some revenue? Consistent orders = 7–8. Zero sales = 3.
- growthStageFit (0.20) — Would better creatives visibly change their traction right now? 100–5K followers with consistent posting = 9. Just created account = 4.

BIAS: Score higher if the brand has "DM to order", homemade/handmade/local in bio, WhatsApp number visible, city name in bio, under 5K followers, no website. These are the best CloutKart prospects.

## Outreach Message Rules

1. NEVER begin with: "Hi, I saw your brand...", "I came across your profile...", "Hope you're doing well...", or any generic sales opener.
2. The first sentence MUST reference a specific observation about the brand.
3. Identify ONE opportunity — do not list multiple problems.
4. Never claim the brand has poor creatives, poor ROAS, low engagement, or weak marketing unless objective evidence exists. If evidence is unavailable, frame as opportunity: "There may be an opportunity to…", "One area worth exploring…", "We noticed potential to…"
5. Sound founder-to-founder, not agency-to-client.
6. Structure: Observation → Opportunity → Why CloutKart → Conversation starter.
7. Maximum 50 words.
8. Banned buzzwords: disruptive, game-changing, innovative, cutting-edge, revolutionary. Also banned: "elevate", "unleash", "world-class", "Dear", "I hope this message finds you".
9. Instagram DM / WhatsApp = peer texting tone. Email = short and direct.
10. End with one easy question, not a pitch.
11. Every message must feel custom-written for this specific brand — no templates.

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

    if (mode !== "discover" && mode !== "score" && mode !== "fetch_contacts" && mode !== "scrape_products") {
      return new Response(
        JSON.stringify({ error: "mode must be 'discover', 'score', 'fetch_contacts', or 'scrape_products'" }),
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

    const PDL_API_KEY           = Deno.env.get("PDL_API_KEY")           ?? "";
    const HUNTER_API_KEY        = Deno.env.get("HUNTER_API_KEY")        ?? "";
    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY") ?? "";
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    // ── DISCOVER MODE ─────────────────────────────────────────────────────────
    if (mode === "discover") {
      const { niche, stage, geography, platform, budget, followers, funding, runningAds, creativeSetup, painPoint, employeeRange, targetMode, city } = body;
      const discoverSystem = targetMode === "growth" ? DISCOVER_GROWTH_SYSTEM : DISCOVER_LOCAL_SYSTEM;

      // Try Google Places first for real businesses — fall back to archetypes if unavailable
      console.log(`[Ezio] Places key present: ${!!GOOGLE_PLACES_API_KEY} | niche: "${niche}" | city: "${city ?? ""}" | mode: ${targetMode ?? "local"}`);
      let realBusinessContext = "";
      let realBusinesses: OutscraperBusiness[] = [];
      if (GOOGLE_PLACES_API_KEY && niche) {
        const queries = buildSearchQueries(niche, targetMode ?? "local", city ?? "");
        console.log(`[Ezio] Running Places search with queries:`, queries);
        realBusinesses = await googlePlacesSearch(queries, GOOGLE_PLACES_API_KEY, 5);
        console.log(`[Ezio] Places returned ${realBusinesses.length} businesses`);

        // Enrich with PDL (growth mode) and website snippets — run in parallel
        let pdlMap: Record<string, PDLCompany> = {};
        let websiteMap: Record<string, string> = {};

        if (realBusinesses.length > 0) {
          const [pdlResults, websiteResults] = await Promise.all([
            // PDL: growth mode only
            PDL_API_KEY && targetMode === "growth"
              ? Promise.allSettled(
                  realBusinesses.map(async (b) => {
                    if (!b.site) return null;
                    const domain = b.site.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
                    const data = await pdlEnrich(domain, PDL_API_KEY);
                    return data ? { domain, data } : null;
                  })
                )
              : Promise.resolve([]),
            // Website snippets: all modes
            Promise.allSettled(
              realBusinesses.map(async (b) => {
                if (!b.site) return null;
                const snippet = await scrapeWebsiteSnippet(b.site);
                return snippet ? { site: b.site, snippet } : null;
              })
            ),
          ]);

          for (const r of pdlResults) {
            if (r.status === "fulfilled" && r.value) pdlMap[r.value.domain] = r.value.data;
          }
          for (const r of websiteResults) {
            if (r.status === "fulfilled" && r.value) websiteMap[r.value.site] = r.value.snippet;
          }
        }

        if (realBusinesses.length > 0) {
          realBusinessContext = `\n\n## REAL BUSINESSES FROM GOOGLE MAPS (score these actual businesses)\n\n${
            realBusinesses.map((b, i) => {
              const domain = b.site?.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] ?? "";
              const pdl = pdlMap[domain];
              const pdlSection = pdl ? `\nPDL Data: ${formatPDLForPrompt(pdl)}` : "";
              const websiteSnippet = b.site && websiteMap[b.site] ? `\nWebsite copy: ${websiteMap[b.site]}` : "";
              return formatBusinessForPrompt(b, i) + pdlSection + websiteSnippet;
            }).join("\n\n")
          }`;
        }
      }

      const userPrompt = `${realBusinesses.length > 0
        ? `Score these real Indian businesses as CloutKart prospects. Use only the data provided — do NOT invent contact details. Return the phone, website, and instagram exactly as given.`
        : `Generate 4–6 ideal archetype leads for CloutKart matching these criteria. Give each a descriptive archetype name.`}

Discovery criteria:
Target Niche: ${niche || "Any"}
Business Stage: ${stage || "Early (0–1 yr)"}
Instagram Followers: ${followers || "0–5K"}
Funding Status: ${funding || "Bootstrapped"}
Running Paid Ads: ${runningAds || "No (organic only)"}
Current Creative Setup: ${creativeSetup || "Founder DIY / Canva"}
Pain Point to Target: ${painPoint || "Can't afford a full agency"}
Outreach Platform: ${platform || "Instagram DM"}
Geography: ${city ? `${city}, India` : geography || "India"}
Employee Count: ${employeeRange || "1–10"}
Monthly Ad Budget: ${budget || "< ₹50K"}
${realBusinessContext}

Return only the JSON object.`;

      const res = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: discoverSystem },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 3500,
        temperature: realBusinesses.length > 0 ? 0.3 : 0.6,
        response_format: { type: "json_object" },
      });

      const raw = res.choices?.[0]?.message?.content?.trim() ?? "";

      let result: { leads?: Array<Record<string, unknown>>; source?: string };
      try {
        result = JSON.parse(raw);
      } catch {
        console.error("[lead-agent discover] JSON parse failed:", raw);
        throw new Error("Model returned malformed JSON. Try again.");
      }

      // Re-attach real contact info by name match (index-based matching is unreliable
      // because the model may reorder results)
      if (realBusinesses.length > 0 && Array.isArray(result.leads)) {
        const bizByName = Object.fromEntries(
          realBusinesses.map(b => [b.name?.toLowerCase().trim() ?? "", b])
        );
        result.leads = result.leads.map((lead: Record<string, unknown>) => {
          const biz = bizByName[(lead.name as string)?.toLowerCase().trim() ?? ""] ?? null;
          if (!biz) return lead;
          return {
            ...lead,
            phone: biz.phone ?? null,
            website: biz.site ?? null,
            instagramHandle: biz.instagram ?? null,
            address: biz.city ?? biz.full_address ?? null,
            googleMapsUrl: biz.google_maps_url ?? null,
          };
        });
        result.source = "google_places";
      } else {
        result.source = "ai_archetypes";
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
      if (brandUrl) {
        const domain = extractDomain(brandUrl);
        const [company, websiteSnippet] = await Promise.all([
          PDL_API_KEY && domain ? pdlEnrich(domain, PDL_API_KEY) : Promise.resolve(null),
          scrapeWebsiteSnippet(brandUrl),
        ]);
        if (company) {
          enrichContext += `\n\n## COMPANY DATA FROM PEOPLE DATA LABS\n\n${formatPDLForPrompt(company)}`;
        }
        if (websiteSnippet) {
          enrichContext += `\n\nWebsite copy: ${websiteSnippet}`;
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
        max_tokens: 1400,
        temperature: 0.4,
        response_format: { type: "json_object" },
      });

      const raw = res.choices?.[0]?.message?.content?.trim() ?? "";

      let result: Record<string, unknown>;
      try {
        result = JSON.parse(raw);
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

    // ── SCRAPE PRODUCTS MODE ──────────────────────────────────────────────────
    if (mode === "scrape_products") {
      const { website, brandName, niche } = body;

      if (!website) {
        return new Response(
          JSON.stringify({ products: [] }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const fullUrl = website.startsWith("http") ? website : `https://${website}`;

      // Fetch homepage + try one product/collection page in parallel
      const candidateUrls = [
        fullUrl,
        `${fullUrl.replace(/\/$/, "")}/collections/all`,
        `${fullUrl.replace(/\/$/, "")}/products`,
        `${fullUrl.replace(/\/$/, "")}/shop`,
      ];

      const htmlChunks: string[] = [];
      const fetchResults = await Promise.allSettled(
        candidateUrls.slice(0, 2).map(url =>
          fetch(url, {
            signal: AbortSignal.timeout(7000),
            headers: { "User-Agent": "Mozilla/5.0 (compatible; CloutKart/1.0)" },
          }).then(r => r.ok ? r.text() : "")
        )
      );
      for (const r of fetchResults) {
        if (r.status === "fulfilled" && r.value) {
          const stripped = r.value
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 1800);
          htmlChunks.push(stripped);
        }
      }

      if (htmlChunks.length === 0) {
        return new Response(
          JSON.stringify({ products: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const extractRes = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You extract specific product names from website text. Return ONLY a JSON object with a 'products' key containing an array of product name strings. Example: {\"products\":[\"Ashwagandha KSM-66 500mg\",\"Pure Shilajit Resin\",\"Chyawanprash 500g\"]}. If none found, return {\"products\":[]}.",
          },
          {
            role: "user",
            content: `Brand: ${brandName ?? "Unknown"} | Niche: ${niche ?? "Unknown"}\n\nWebsite text:\n${htmlChunks.join("\n\n---\n\n")}`,
          },
        ],
        max_tokens: 250,
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const raw = extractRes.choices?.[0]?.message?.content?.trim() ?? "{}";
      let products: string[] = [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.products)) products = parsed.products;
        else if (Array.isArray(parsed.items)) products = parsed.items;
        else if (Array.isArray(parsed)) products = parsed;
      } catch { /* ignore */ }

      return new Response(
        JSON.stringify({ products: products.filter(p => typeof p === "string" && p.trim()).slice(0, 6) }),
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
