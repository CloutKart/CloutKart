import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { MongoClient } from "npm:mongodb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const STABILITY_CORE_URL = "https://api.stability.ai/v2beta/stable-image/generate/core";
const STABILITY_SD3_URL  = "https://api.stability.ai/v2beta/stable-image/generate/sd3";

interface ColorEntry {
  name: string;
  hex: string;
}

interface VisionData {
  creativeVibe?: { label: string; description: string };
  visualDirection?: string;
  vibeColors?: ColorEntry[];
  productColors?: ColorEntry[];
  hook?: string;
}

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

async function searchPromptChunks(queryVector: number[], mongoUri: string): Promise<string[]> {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const results = await client
      .db("cloutkart")
      .collection("prompt_chunks")
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector,
            numCandidates: 80,
            limit: 3,
          },
        },
        {
          $project: {
            _id: 0,
            title: 1,
            platform: 1,
            category: 1,
            type: 1,
            content: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ])
      .toArray();
    return (results as Array<{ content?: string; title?: string }>).map(
      (r) => [r.title, r.content].filter(Boolean).join("\n")
    );
  } finally {
    await client.close();
  }
}

function buildStabilityPrompt(
  vision: VisionData,
  brandName: string,
  niche: string,
  ragChunks: string[]
): string {
  const parts: string[] = [];

  // Core visual direction — most important for image gen
  if (vision.visualDirection) {
    parts.push(vision.visualDirection);
  }

  // Creative vibe mood
  if (vision.creativeVibe) {
    parts.push(`${vision.creativeVibe.label} aesthetic. ${vision.creativeVibe.description}`);
  }

  // Vibe color atmosphere
  const vibeColorNames = (vision.vibeColors ?? []).map((c) => c.name).join(", ");
  if (vibeColorNames) {
    parts.push(`Color atmosphere: ${vibeColorNames}`);
  }

  // Product color anchors
  const productColorNames = (vision.productColors ?? []).map((c) => c.name).join(", ");
  if (productColorNames) {
    parts.push(`Product tones: ${productColorNames}`);
  }

  // Brand/niche context
  parts.push(`${niche} brand campaign for ${brandName}`);

  // Quality and style anchors for Stability AI
  parts.push(
    "commercial advertising photography, professional studio lighting, ultra high resolution, award-winning creative campaign, magazine quality, cinematic composition"
  );

  // RAG: inject relevant prompt-library cinematic language (first 2 chunks, 400 chars each)
  if (ragChunks.length > 0) {
    const ragContext = ragChunks
      .slice(0, 2)
      .map((c) => c.slice(0, 400))
      .join(" | ");
    parts.push(`Creative reference context: ${ragContext}`);
  }

  return parts.join(". ");
}

const NEGATIVE_PROMPT =
  "text, words, letters, watermark, logo overlay, blurry, low quality, low resolution, amateur, bad composition, overexposed highlights, crushed blacks, cartoon, illustration, painting, 3d render, CGI, ugly, deformed, distorted, noisy, grainy";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { vision, brandName, niche, referenceImages } = await req.json() as {
      vision: VisionData;
      brandName: string;
      niche: string;
      referenceImages?: Array<{ base64: string; mimeType: string }>;
    };
    const hasRefImage = Array.isArray(referenceImages) && referenceImages.length > 0;

    if (!vision || !brandName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: vision, brandName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const STABILITY_API_KEY = Deno.env.get("STABILITY_API_KEY");
    if (!STABILITY_API_KEY) {
      return new Response(
        JSON.stringify({ error: "STABILITY_API_KEY not configured. Add it in Supabase → Project Settings → Edge Functions → Secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // RAG: retrieve cinematic prompt templates from MongoDB
    let ragChunks: string[] = [];
    const HF_API_KEY  = Deno.env.get("HF_API_KEY");
    const MONGODB_URI = Deno.env.get("MONGODB_URI");

    if (HF_API_KEY && MONGODB_URI) {
      try {
        const queryText = [
          brandName,
          niche,
          vision.creativeVibe?.label ?? "",
          vision.visualDirection ?? "",
        ].filter(Boolean).join(" ");

        const vector = await getQueryEmbedding(queryText, HF_API_KEY);
        ragChunks    = await searchPromptChunks(vector, MONGODB_URI);
        console.log(`[generate-vision-image] RAG: ${ragChunks.length} prompt chunks retrieved`);
      } catch (ragErr) {
        console.warn("[generate-vision-image] RAG skipped:", (ragErr as Error).message);
      }
    }

    // Build the Stability AI prompt
    const prompt = buildStabilityPrompt(vision, brandName, niche, ragChunks);
    console.log(`[generate-vision-image] mode=${hasRefImage ? "sd3-img2img" : "core-txt2img"} prompt_len=${prompt.length}`);

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("negative_prompt", NEGATIVE_PROMPT);
    formData.append("output_format", "jpeg");

    let apiUrl: string;

    if (hasRefImage) {
      // SD3 image-to-image — anchors generation to the actual product photo
      const ref = referenceImages![0];
      const binaryStr = atob(ref.base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      const imageBlob = new Blob([bytes], { type: ref.mimeType });
      formData.append("image", imageBlob, "product.jpg");
      formData.append("mode", "image-to-image");
      formData.append("strength", "0.70");   // 0=copy, 1=ignore; 0.7 keeps product shape, applies creative direction
      formData.append("model", "sd3-large-turbo");
      apiUrl = STABILITY_SD3_URL;
    } else {
      // Core text-to-image — no reference photo provided
      formData.append("aspect_ratio", "3:2");
      apiUrl = STABILITY_CORE_URL;
    }

    const stabilityRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STABILITY_API_KEY}`,
        Accept: "application/json",
      },
      body: formData,
      signal: AbortSignal.timeout(40000),
    });

    if (!stabilityRes.ok) {
      let errBody = "";
      try { errBody = await stabilityRes.text(); } catch { /* ignore */ }
      console.error("[generate-vision-image] Stability API error:", stabilityRes.status, errBody);
      throw new Error(`Stability AI returned ${stabilityRes.status}: ${errBody.slice(0, 200)}`);
    }

    const stabilityData = await stabilityRes.json() as {
      image: string;
      finish_reason: string;
      seed: number;
    };

    if (!stabilityData.image) {
      throw new Error("Stability AI returned no image data");
    }

    return new Response(
      JSON.stringify({ imageBase64: stabilityData.image, seed: stabilityData.seed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[generate-vision-image] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate image";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
