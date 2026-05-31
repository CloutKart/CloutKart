/**
 * seed_vision_chunks.js
 *
 * Reads vision_rag_knowledge_base.md, splits it into semantic chunks,
 * embeds each chunk with Xenova/all-MiniLM-L6-v2 (384-dim, same as prompt_chunks),
 * and upserts them into MongoDB Atlas → cloutkart.vision_chunks.
 *
 * Run: node scripts/seed_vision_chunks.js
 * Requires: MONGODB_URI in .env (same one Pixie uses)
 */

import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { pipeline } from '@xenova/transformers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOC_PATH   = join(__dirname, '../docs/vision_rag_knowledge_base.md');
const DB_NAME    = process.env.MONGODB_DB   || 'cloutkart';
const COLLECTION = 'vision_chunks';
const SOURCE_DOC = 'CloutKart_Vision_Prompt_Library_v2';

// ─── Embedder ─────────────────────────────────────────────────────────────────

let _pipe;
async function embed(text) {
  if (!_pipe) {
    console.log('  Loading Xenova/all-MiniLM-L6-v2 (first run downloads ~23MB)...');
    _pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });
  }
  const out = await _pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(out.data);
}

// ─── Category / tag helpers ───────────────────────────────────────────────────

const CATEGORY_MAP = [
  ['skincare',      ['skincare', 'beauty', 'serum', 'moisturiser', 'moisturizer', 'skin', 'glow', 'cleanser', 'vitamin c', 'de-tan']],
  ['coffee',        ['coffee', 'beverage', 'brew', 'espresso', 'cold brew', 'latte', 'roast', 'beans']],
  ['fashion',       ['fashion', 'apparel', 'clothing', 'garment', 'streetwear', 'hoodie', 'denim', 'wardrobe']],
  ['fitness',       ['fitness', 'activewear', 'gym', 'workout', 'athletic', 'running', 'protein', 'recovery', 'reps']],
  ['supplements',   ['supplement', 'wellness', 'vitamin', 'magnesium', 'ashwagandha', 'sleep formula', 'capsule', 'nootropic']],
  ['food',          ['food', 'snack', 'chocolate', 'artisan food', 'eat', 'appetite', 'recipe', 'flavour', 'taste']],
  ['tech',          ['tech', 'gadget', 'electronic', 'earbuds', 'device', 'screen', 'charger', 'wearable']],
  ['home',          ['home', 'lifestyle', 'candle', 'living', 'interior', 'room', 'furniture', 'fragrance']],
  ['jewellery',     ['jewel', 'accessor', 'ring', 'necklace', 'bracelet', 'metal', 'gold', 'silver', 'velvet']],
  ['pet',           ['pet', 'dog', 'cat', 'animal', 'fur']],
  ['personal_care', ['hair', 'shampoo', 'body care', 'personal care', 'sulfate', 'shower']],
  ['baby',          ['baby', 'kids', 'child', 'infant', 'teether']],
  ['b2b',           ['b2b', 'saas', 'finance', 'business software', 'spreadsheet', 'invoice', 'productivity']],
  ['travel',        ['travel', 'trip', 'destination', 'experience', 'hashtag']],
];

function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [cat, kws] of CATEGORY_MAP) {
    if (kws.some(k => lower.includes(k))) return cat;
  }
  return 'general';
}

function detectFormats(text) {
  const lower = text.toLowerCase();
  const found = [];
  if (lower.includes('ugc'))                                found.push('ugc');
  if (lower.includes('static'))                             found.push('static');
  if (lower.includes('video') || lower.includes('reel'))    found.push('video');
  if (lower.includes('carousel'))                           found.push('carousel');
  if (lower.includes('story') || lower.includes('stories')) found.push('story');
  return [...new Set(found)];
}

// ─── Document parser (line-by-line state machine) ────────────────────────────

function parseDocument(md) {
  const lines   = md.split('\n');
  const chunks  = [];
  const idCtrs  = {};

  function nextId(prefix) {
    const key        = prefix.slice(0, 35).replace(/[^a-z0-9_]/g, '_');
    idCtrs[key]      = (idCtrs[key] || 0) + 1;
    return `${key}_${String(idCtrs[key]).padStart(2, '0')}`;
  }

  // State
  let secNum      = 0;
  let secName     = '';
  let subsection  = '';
  let category    = 'general';
  let buf         = [];       // lines accumulating for current chunk

  function flush() {
    const text = buf.join('\n').trim();
    buf = [];
    if (!text || text.length < 45) return;

    // Determine section string
    let section = 'general';
    if (secNum === 1) section = 'hook';
    else if (secNum === 2) section = 'vibe';
    else if (secNum === 3) section = 'color_story';
    else if (secNum === 4) section = 'visual_direction';
    else if (secNum === 5) section = 'category_rule';
    else if (secNum === 6) section = 'format_playbook';
    else if (secNum === 7) section = 'audience_profile';
    else if (secNum === 8) section = 'approved_vision';
    else if (secNum === 9) section = 'prompt_rule';

    const cat        = detectCategory(text) !== 'general' ? detectCategory(text) : category;
    const formats    = detectFormats(text);
    const firstBold  = (text.match(/\*\*([^*\n]{3,50})\*\*/) || [])[1] || '';
    const sub_type   = firstBold.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, '_').slice(0, 40);

    const tags = [...new Set([
      section, cat,
      ...formats,
      sub_type.split('_').filter(t => t.length > 2).slice(0, 3),
    ].flat())].filter(Boolean);

    chunks.push({
      chunk_id:       nextId(`${section}_${cat}`),
      section,
      category:       cat,
      sub_type:       sub_type || section,
      format_type:    formats,
      target_audience: detectAudience(text),
      text_content:   text,
      tags,
      source_doc:     SOURCE_DOC,
      version:        '2.0',
    });
  }

  // Entry-start patterns (these trigger a flush of the previous entry)
  function isEntryStart(line) {
    if (/^\*\*[^:\n*]{3,60}\*\*\s*$/.test(line))  return true;  // **STANDALONE HEADING**
    if (/^\*\*Hook:\*\*/.test(line))                return true;  // **Hook:** "text"
    if (/^\*\*VISION CK-/.test(line))               return true;  // **VISION CK-001:**
    if (/^\*\*Vision \d+/.test(line))               return true;  // **Vision 8.1 —**
    return false;
  }

  for (const line of lines) {
    // ── Section header ──────────────────────────────────────────────────────
    const secMatch = line.match(/^## SECTION (\d+):\s*(.+)/);
    if (secMatch) {
      flush();
      secNum     = parseInt(secMatch[1]);
      secName    = secMatch[2];
      category   = 'general';
      subsection = '';
      continue;
    }

    // Skip Section 10 (schema/meta — not useful for retrieval)
    if (secNum === 10) continue;

    // ── Subsection header ───────────────────────────────────────────────────
    if (line.startsWith('### ')) {
      // For sections 6 & 7, the ### header IS the chunk boundary
      if (secNum === 6 || secNum === 7) flush();
      subsection = line.replace(/^### [\d.]+\s*/, '').trim();
      category   = detectCategoryFromTitle(subsection);
      if (secNum === 6 || secNum === 7) buf.push(subsection); // start buf with subsection title
      continue;
    }

    // ── Dividers ────────────────────────────────────────────────────────────
    if (line === '---' || line.startsWith('# ')) { flush(); continue; }

    // ── Entry start (sections 1-5, 8, 9) ───────────────────────────────────
    if (secNum !== 6 && secNum !== 7 && isEntryStart(line)) {
      flush();
      // Update category from this line's content for rules sections
      if (secNum === 5) {
        const cFromLine = detectCategoryFromTitle(line);
        if (cFromLine !== 'general') category = cFromLine;
      }
    }

    // ── Accumulate ──────────────────────────────────────────────────────────
    if (secNum >= 1 && secNum <= 9) buf.push(line);
  }

  flush(); // final
  return chunks;
}

// ─── Helper: detect category from a title/heading string ─────────────────────

function detectCategoryFromTitle(title) {
  const t = title.toLowerCase();
  for (const [cat, kws] of CATEGORY_MAP) {
    if (kws.some(k => t.includes(k))) return cat;
  }
  if (t.includes('gen z'))           return 'audience_genz';
  if (t.includes('millennial'))      return 'audience_millennial';
  if (t.includes('professional'))    return 'audience_professional';
  if (t.includes('parent'))          return 'audience_parent';
  if (t.includes('static'))         return 'format_static';
  if (t.includes('ugc'))            return 'format_ugc';
  if (t.includes('video'))          return 'format_video';
  if (t.includes('carousel'))       return 'format_carousel';
  if (t.includes('story') || t.includes('reel')) return 'format_story';
  return 'general';
}

function detectAudience(text) {
  const lower = text.toLowerCase();
  if (lower.includes('gen z') || lower.includes('18-26') || lower.includes('18–26')) return 'gen_z';
  if (lower.includes('millennial') || lower.includes('27-38') || lower.includes('27–38')) return 'millennial';
  if (lower.includes('parent') || lower.includes('28-45')) return 'parent';
  if (lower.includes('professional')) return 'working_professional';
  if (lower.includes('athlete') || lower.includes('gym') || lower.includes('fitness enthusiast')) return 'fitness_enthusiast';
  return 'general';
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌  MONGODB_URI not set. Add it to your .env file.');
    process.exit(1);
  }

  // ── Parse ──────────────────────────────────────────────────────────────────
  console.log('📄  Reading knowledge base...');
  const md     = readFileSync(DOC_PATH, 'utf-8');
  const chunks = parseDocument(md);

  console.log(`✂️   Parsed ${chunks.length} semantic chunks`);

  // Show breakdown
  const bySection = {};
  for (const c of chunks) {
    bySection[c.section] = (bySection[c.section] || 0) + 1;
  }
  console.log('    Breakdown:', bySection);

  // ── Embed ──────────────────────────────────────────────────────────────────
  console.log('\n🧠  Generating embeddings...');
  await embed('warmup'); // pre-load the model

  const docs = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    process.stdout.write(`\r  ${i + 1}/${chunks.length} — ${chunk.chunk_id.slice(0, 45).padEnd(45)}`);
    const embedding = await embed(chunk.text_content);
    docs.push({ ...chunk, embedding, created_at: new Date() });
  }
  console.log('\n');

  // ── Upload ─────────────────────────────────────────────────────────────────
  console.log('🔌  Connecting to MongoDB Atlas...');
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  const col = client.db(DB_NAME).collection(COLLECTION);

  console.log(`🗑️   Dropping existing ${COLLECTION} collection (if any)...`);
  await col.drop().catch(() => {});

  console.log(`⬆️   Inserting ${docs.length} documents into ${DB_NAME}.${COLLECTION}...`);
  const result = await col.insertMany(docs);
  console.log(`✅  Inserted ${result.insertedCount} documents.\n`);

  await client.close();

  // ── Next step instructions ─────────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('NEXT STEP — Create a Vector Search Index in MongoDB Atlas:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  1. Go to Atlas → your cluster → Search Indexes`);
  console.log(`  2. Click "Create Index" → choose "Atlas Vector Search"`);
  console.log(`  3. Select database: ${DB_NAME}   collection: ${COLLECTION}`);
  console.log(`  4. Paste this index definition:\n`);
  console.log(JSON.stringify({
    fields: [{
      type:          'vector',
      path:          'embedding',
      numDimensions: 384,
      similarity:    'cosine',
    }, {
      type: 'filter',
      path: 'section',
    }, {
      type: 'filter',
      path: 'category',
    }],
  }, null, 2));
  console.log('\n  5. Name the index: "vision_index"');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
