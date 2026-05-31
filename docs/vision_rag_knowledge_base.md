# CloutKart Vision RAG Knowledge Base
# Source: CloutKart_Vision_Prompt_Library + CloutKart_Creative_Intelligence_v1.0
# Version: 2.0 — Merged

This document is designed to be semantically chunked and embedded into MongoDB Atlas for RAG-based creative vision generation. Each section is a standalone knowledge unit. See Section 10 for the MongoDB chunk schema.

---

## SECTION 1: HOOK LIBRARY

### 1.0 Hook Trigger Framework (Psychological Mechanisms)

Hooks are the first 1–3 seconds of any ad — the moment that determines if someone watches or scrolls past. The best performing hooks combine 2+ triggers simultaneously.

**CURIOSITY / OPEN LOOP**
- Psychological Trigger: Zeigarnik Effect — the brain craves closure on unfinished stories
- Best Formats: UGC Video, Talking-Head, Story Voiceover
- Why It Works: Leaves the viewer in suspense, forcing them to watch until the gap is closed.
- Real Hook Examples:
  - "There's one thing in your bathroom that expires faster than you think…"
  - "I tested 7 skincare serums for 30 days. Only one of them actually did something."
  - "Nobody talks about what happens after you stop taking this supplement."
  - "The founder almost didn't release this product — here's why."

**PATTERN INTERRUPT**
- Psychological Trigger: Orienting Reflex — sudden change forces the brain to pay attention
- Best Formats: UGC Video, Reels, TikTok
- Why It Works: Breaks the brain's autopilot scroll behavior. Works best with an unexpected visual or sound break in the first frame.
- Real Hook Examples:
  - "Stop scrolling. This is for you." [Camera freeze + direct stare]
  - "POV: You just found the coffee brand your barista doesn't want you to know about."
  - "Wait — you're still doing that?" [Whip pan cut, jarring sound]
  - "I quit my skincare routine for 2 weeks. Here's what happened."

**SOCIAL PROOF / TRIBE SIGNAL**
- Psychological Trigger: Normative Social Influence — humans copy what the group does
- Best Formats: UGC Video, Testimonial, Static Carousel
- Why It Works: If many people use it, it must be good. De-risks the decision for the viewer.
- Real Hook Examples:
  - "Everyone in my office started using this after I brought it in."
  - "This is the serum that went viral for a reason."
  - "50,000 people have already switched. Here's why I finally did too."
  - "My dermatologist, my sister, and my mom all use this — I finally caved."

**NEGATIVE URGENCY / FEAR OF MISSING OUT**
- Psychological Trigger: Loss Aversion — people fear losses more than they value gains
- Best Formats: UGC Video, Facebook/Instagram Ad, Thumbnail
- Why It Works: Activates threat-response. 'Don't' hooks disqualify in a way that actually qualifies the right buyer.
- Real Hook Examples:
  - "Don't buy this hair oil if you hate having shiny hair."
  - "If you keep using that cleanser, you're wasting money."
  - "You're probably making this mistake with your morning routine."
  - "This was ₹2,499 last week. Just saying."

**RELATABILITY / SHARED STRUGGLE**
- Psychological Trigger: Parasocial Identification — viewer sees themselves in the creator
- Best Formats: UGC, Talking-Head, Story Format
- Why It Works: Makes the product feel personally relevant. Lowers the 'this isn't for me' reflex.
- Real Hook Examples:
  - "Me before this product: 3-step routine, 40 minutes, still looking tired."
  - "If you have oily skin AND a budget, this video is for you."
  - "No, I didn't always have my routine together. Here's what changed."
  - "For everyone who's tried everything and nothing has worked yet."

**PRICE SHOCK / VALUE CONTRAST**
- Psychological Trigger: Anchoring Bias — the first number heard sets all future comparisons
- Best Formats: Static Ad, Carousel, Short Video
- Why It Works: Instantly positions value. High-low contrast creates perceived savings even for non-discount buyers.
- Real Hook Examples:
  - "This was ₹4,000. I found the same result for ₹599."
  - "I used to spend ₹6,000/month on this. I spend ₹800 now."
  - "Salon-quality results for less than a cup of coffee a day."
  - "The dupe that's actually better than the original."

**AUTHORITY / EXPERTISE**
- Psychological Trigger: Authority Bias — we defer to credible sources
- Best Formats: Creator Content, Talking-Head, Quote Static
- Why It Works: Borrows the credibility of expertise. Works best when the authority is verifiable or visual (uniform, tools, professional setting).
- Real Hook Examples:
  - "I'm an esthetician and this is the only cleanser I recommend."
  - "After 10 years in the fitness industry, this is the one supplement I actually take."
  - "The formula a food scientist actually eats for breakfast."
  - "A nutritionist's review of the top 5 protein powders — ranked honestly."

**VISUAL ASMR / SENSORY**
- Psychological Trigger: Sensory Engagement — mirror neurons activate via watching pleasurable textures
- Best Formats: Reels, TikTok, Product Video, Story Loop
- Why It Works: No words needed. Texture, sound, and motion bypass skepticism. High retention and high share rate.
- Real Hook Examples:
  - [Slow pour of serum onto fingertip, zoomed in, no voiceover]
  - [Coffee grounds being scooped with a wooden spoon, steam rising]
  - [Fabric folding and unfolding in slow motion, soft lighting]
  - [Whipped cream swirl dropping into a cold drink, close-up]

**TRANSFORMATION STORY**
- Psychological Trigger: Narrative Transportation — story pulls viewer out of resistance
- Best Formats: Long-Form UGC, Brand Video, Carousel Story
- Why It Works: Story creates emotional investment. The brain follows narrative arcs and wires emotional memory to the product.
- Real Hook Examples:
  - "January me vs. March me — same skin, very different products."
  - "I didn't believe these reviews until I tried it myself."
  - "How I went from 3 coffees a day to one — and still have more energy."
  - "The night I almost gave up on fitness (and what happened next)."

**RAPID-FIRE / LIST**
- Psychological Trigger: Cognitive Fluency — easy-to-process information feels more credible
- Best Formats: UGC, Carousel, Static, Talking-Head
- Why It Works: Lists signal structure and completeness. Viewers feel they'll get clear payoff for watching.
- Real Hook Examples:
  - "3 reasons you're not sleeping well (and how I fixed all 3)."
  - "5 skincare mistakes I made in my 20s. Number 4 haunts me."
  - "This supplement does 4 things. I only needed 1."
  - "Quick Q&A: Does this coffee taste burnt? Is it worth ₹999? Would I repurchase?"

---

### 1.1 Hooks — Skincare & Beauty

**Hook:** "Your skin doesn't need filters"
- Trigger: CONTRARIAN INSIGHT
- Why it works: Challenges the dominant beauty narrative. Makes the reader feel empowered and slightly guilty for relying on digital correction. The implicit promise is earned skin confidence.
- Best for: Skincare targeting 22–35 women, clean beauty, natural formulations
- Ad format: Static, UGC

**Hook:** "Clear skin starts before makeup"
- Trigger: SHARP OBSERVATION
- Why it works: States a truth everyone knows but ignores. Creates cognitive tension — the reader applies makeup daily but hasn't fixed the underlying issue. Positions the product as the upstream fix.
- Best for: Skincare targeting makeup wearers with active skin concerns
- Ad format: Static, Story

**Hook:** "Your moisturiser is lying to your skin"
- Trigger: CURIOSITY GAP + PATTERN INTERRUPT
- Why it works: Anthropomorphizes the moisturiser as deceptive. Forces the reader to wonder what the lie is. Creates betrayal emotion about something they trust daily.
- Best for: Challenger skincare brands with genuinely superior ingredient stories
- Ad format: Static, Carousel

**Hook:** "Tan lines are so last season"
- Trigger: PATTERN INTERRUPT
- Why it works: Uses fashion language in a skincare context. Unexpected register shift. Implies visible skin damage is aesthetically passé.
- Best for: De-tan, exfoliation, UV protection, brightening products
- Ad format: Static, Story

**Hook:** "The ingredient your serum forgot"
- Trigger: CURIOSITY GAP
- Why it works: Creates an information gap — what ingredient? Forces the reader to keep reading. Positions the brand as correcting a market oversight.
- Best for: Brands with a genuinely differentiated hero ingredient
- Ad format: Static, Carousel

**Hook:** "Dermatologists hate this — just kidding, they invented it"
- Trigger: PATTERN INTERRUPT
- Why it works: Subverts classic clickbait and immediately earns trust by flipping it. Signals scientific credibility with humor.
- Best for: Clinically-backed skincare with dermatologist involvement
- Ad format: Static, UGC, Video

**Hook:** "Your 10-step routine called — it's exhausted"
- Trigger: SHARP OBSERVATION
- Why it works: Personifies the routine as tired. Speaks to skincare fatigue. Positions minimalist products as relief.
- Best for: Multi-tasking skincare, minimalist 1–2 product brands
- Ad format: Static, Story

**Hook:** "Skin that doesn't need a story"
- Trigger: IDENTITY
- Why it works: Story = covering up, explaining, apologizing. The hook promises skin that exists without explanation.
- Best for: Premium skincare, luxury beauty
- Ad format: Static, Video

**Hook:** "Pores don't need an apology"
- Trigger: IDENTITY + CONTRARIAN INSIGHT
- Why it works: Challenges shame narrative around pores. Positions the brand on the reader's side.
- Best for: Pore-focused treatments, inclusive beauty
- Ad format: UGC, Static

---

### 1.2 Hooks — Coffee & Beverages

**Hook:** "Mornings deserve better"
- Trigger: DESIRED OUTCOME + SHARP OBSERVATION
- Best for: Specialty/premium coffee competing against instant or chain coffee
- Ad format: Static, Video, UGC

**Hook:** "Wake up before your coffee does"
- Trigger: PATTERN INTERRUPT
- Best for: Strong espresso roasts, coffee concentrates, cold brew
- Ad format: Static, Video

**Hook:** "Your office coffee is a crime scene"
- Trigger: SHARP OBSERVATION + HUMOR
- Best for: Subscription coffee, portable solutions, WFH coffee
- Ad format: Static, UGC

**Hook:** "The ritual your alarm clock can't ruin"
- Trigger: DESIRED OUTCOME
- Best for: Specialty coffee with premium ritual positioning
- Ad format: Video, Story

**Hook:** "Single origin. Zero compromises."
- Trigger: IDENTITY
- Best for: Specialty coffee, direct-trade roasters
- Ad format: Static

**Hook:** "The second cup is always the honest one"
- Trigger: SHARP OBSERVATION
- Best for: Premium coffee brands where repurchase is the goal signal
- Ad format: Static, Story, UGC

**Hook:** "POV: You just found the coffee brand your barista doesn't want you to know about"
- Trigger: PATTERN INTERRUPT + SOCIAL PROOF
- Best for: DTC specialty coffee disrupting café culture
- Ad format: UGC Video, Reels

---

### 1.3 Hooks — Fashion & Apparel

**Hook:** "Dress like you've already made it"
- Trigger: IDENTITY + ASPIRATION
- Best for: Affordable-luxury fashion, contemporary brands, office wear
- Ad format: Static, Video, UGC

**Hook:** "Confidence is the best fit"
- Trigger: IDENTITY
- Best for: Inclusive sizing, body-positive fashion, athleisure
- Ad format: UGC, Video

**Hook:** "Wear it once. Hear about it forever."
- Trigger: BOLD CLAIM
- Best for: Statement pieces, distinctive design, occasion wear
- Ad format: Static, Story

**Hook:** "Your wardrobe is lying to you"
- Trigger: CURIOSITY GAP + CONTRARIAN INSIGHT
- Best for: Capsule wardrobe brands, personal styling, quality-over-quantity
- Ad format: Video, Carousel

**Hook:** "The outfit that gets things done"
- Trigger: IDENTITY + DESIRED OUTCOME
- Best for: Professional wear, power dressing, workwear
- Ad format: Static, UGC

**Hook:** "Made to outlive trends"
- Trigger: CONTRARIAN INSIGHT
- Best for: Sustainable fashion, classic brands, investment pieces
- Ad format: Static, Video

**Hook:** "The last basic you'll ever need to buy"
- Trigger: BOLD CLAIM
- Best for: Premium basics — t-shirts, white shirts, everyday essentials
- Ad format: Static, Carousel

**Hook:** "I actually didn't think it was going to look like this."
- Trigger: PATTERN INTERRUPT + CURIOSITY
- Why it works: Implies exceeded expectations. Forces the viewer to want to see what it looks like. Natural UGC energy.
- Best for: Fashion try-ons, any product where visual reveal is the payoff
- Ad format: UGC Video (proven: drove highest save rate in campaign history)

---

### 1.4 Hooks — Fitness & Activewear

**Hook:** "Your next PR starts with last night's sleep"
- Trigger: CONTRARIAN INSIGHT
- Best for: Recovery products, sleep supplements, wearables

**Hook:** "Recovery is where champions are made"
- Trigger: IDENTITY + BOLD CLAIM
- Best for: Recovery gear, compression wear, supplements

**Hook:** "The gym doesn't care about your excuse"
- Trigger: PAIN POINT + PATTERN INTERRUPT
- Best for: Pre-workout, gym apparel, motivation-led fitness brands

**Hook:** "Built for the reps nobody sees"
- Trigger: IDENTITY + SHARP OBSERVATION
- Best for: Premium activewear, serious performance gear

**Hook:** "Sweat is just fat crying"
- Trigger: PATTERN INTERRUPT + HUMOR
- Best for: Activewear, gym towels, sports deodorant

**Hook:** "Know when to push. Know when to stop."
- Trigger: IDENTITY + SHARP OBSERVATION
- Best for: Fitness wearables, performance analytics

---

### 1.5 Hooks — Supplements & Wellness

**Hook:** "You sleep 8 hours. Your skin doesn't."
- Trigger: SHARP OBSERVATION + CURIOSITY GAP
- Best for: Overnight supplements, sleep serums, collagen, beauty sleep products

**Hook:** "The gap between clean eating and actually feeling good"
- Trigger: PAIN POINT + CURIOSITY GAP
- Best for: Gut health, micronutrient supplements, functional nutrition

**Hook:** "Stress is a feature. This is the patch."
- Trigger: CONTRARIAN INSIGHT + BOLD CLAIM
- Best for: Adaptogen supplements, stress management

**Hook:** "What your multivitamin isn't telling you"
- Trigger: CURIOSITY GAP
- Best for: Premium supplements competing against mass-market vitamins

**Hook:** "Sleeping 7-8 hours but still waking up exhausted."
- Trigger: RELATABILITY / SHARED STRUGGLE
- Why it works: Names a chronic, specific frustration. Problem-first. Creates instant recognition. "Exhausted" is more specific than "tired."
- Best for: Magnesium, ashwagandha, sleep/recovery supplements
- Ad format: Talking-Head UGC (proven: lowest CPM in campaign, highest comment engagement)

---

### 1.6 Hooks — Food & Snacks

**Hook:** "Happiness is a ₹99 problem"
- Trigger: BOLD CLAIM + PATTERN INTERRUPT
- Best for: Affordable snacks, comfort food, accessible indulgence

**Hook:** "The snack your diet didn't plan for"
- Trigger: PATTERN INTERRUPT
- Best for: Indulgent snacks, cheat meal foods

**Hook:** "Eat like you mean it"
- Trigger: IDENTITY
- Best for: Artisan food, quality ingredient brands

**Hook:** "Made by someone who actually likes food"
- Trigger: SHARP OBSERVATION + CONTRARIAN INSIGHT
- Best for: DTC food brands with founder story

**Hook:** "Your last bite will betray your first intention"
- Trigger: CURIOSITY GAP + BOLD CLAIM
- Best for: Premium snacks, dessert brands

---

### 1.7 Hooks — Technology & Electronics

**Hook:** "Your phone is smarter than your charger"
- Trigger: SHARP OBSERVATION
- Best for: Charging accessories, phone accessories

**Hook:** "The meeting that survived because of these"
- Trigger: SHARP OBSERVATION + HUMOR
- Best for: Noise-cancelling headphones, productivity tools

**Hook:** "Everything your IT department said no to"
- Trigger: PATTERN INTERRUPT + HUMOR
- Best for: Consumer tech, personal productivity gear

**Hook:** "Built for people who haven't slept properly in years"
- Trigger: PAIN POINT
- Best for: Sleep tech, productivity tools

---

### 1.8 Hooks — Home & Living

**Hook:** "Clean house. Zero effort. Pick one — just kidding."
- Trigger: REVERSE PSYCHOLOGY + HUMOR
- Best for: Cleaning products, home appliances, robot vacuums

**Hook:** "Your home is the only mood board that matters"
- Trigger: IDENTITY
- Best for: Home decor, interior products, furniture

**Hook:** "The thing your guests will ask about first"
- Trigger: BOLD CLAIM + DESIRED OUTCOME
- Best for: Distinctive home decor, statement furniture

**Hook:** "Good design is invisible until it isn't there"
- Trigger: CONTRARIAN INSIGHT
- Best for: Premium home goods, minimalist design

---

### 1.9 Hooks — Jewelry & Accessories

**Hook:** "Worn once. Remembered forever."
- Trigger: BOLD CLAIM
- Best for: Statement jewelry, luxury accessories, occasion jewelry

**Hook:** "The piece that speaks before you do"
- Trigger: IDENTITY + DESIRED OUTCOME
- Best for: Bold/distinctive jewelry, luxury accessories

**Hook:** "Heirlooms aren't born. They're chosen."
- Trigger: CONTRARIAN INSIGHT
- Best for: Fine jewelry, luxury watches, investment accessories

---

### 1.10 Hooks — Personal Care (Hair, Body)

**Hook:** "Your hair remembers every product you've ever used"
- Trigger: CURIOSITY GAP + PATTERN INTERRUPT
- Best for: Hair repair, clarifying products, premium haircare

**Hook:** "Lather. Rinse. Reconsider everything."
- Trigger: PATTERN INTERRUPT
- Best for: Premium/challenger shampoo brands

**Hook:** "The shower routine that has opinions"
- Trigger: IDENTITY + PATTERN INTERRUPT
- Best for: Premium body care, artisan soap

**Hook:** "Sulfate-free is a start. This is the finish."
- Trigger: CONTRARIAN INSIGHT + BOLD CLAIM
- Best for: Premium haircare with superior formulations

---

### 1.11 Hooks — Baby & Kids Products

**Hook:** "Babies don't care about marketing. This one works anyway."
- Trigger: CONTRARIAN INSIGHT + BOLD CLAIM
- Best for: Baby skincare, feeding products

**Hook:** "Made for the human who judges everything by taste"
- Trigger: SHARP OBSERVATION + HUMOR
- Best for: Baby toys, teethers, baby food

---

### 1.12 Hooks — Pet Products

**Hook:** "They can't read reviews. You can."
- Trigger: SHARP OBSERVATION + HUMOR
- Best for: Pet food, supplements, pet care products

**Hook:** "Your dog's morning routine is better than yours"
- Trigger: HUMOR + PATTERN INTERRUPT
- Best for: Premium pet food, grooming, pet wellness

---

### 1.13 Hooks — Finance, SaaS, B2B

**Hook:** "Your spreadsheet called — it's embarrassed"
- Trigger: HUMOR + PATTERN INTERRUPT
- Best for: Business software, financial tools, data management SaaS

**Hook:** "Every dollar you can't track is a dollar working for someone else"
- Trigger: SHARP OBSERVATION + PAIN POINT
- Best for: Accounting software, expense management, financial planning

---

### 1.14 Hooks — Travel & Experiences

**Hook:** "The trip you've been saving for isn't going to save itself"
- Trigger: PAIN POINT + BOLD CLAIM
- Best for: Travel booking platforms, travel finance

**Hook:** "Go somewhere that doesn't have a hashtag yet"
- Trigger: IDENTITY + CONTRARIAN INSIGHT
- Best for: Adventure tourism, off-the-beaten-path experiences

---

## SECTION 2: CREATIVE VIBE LIBRARY

### 2.0 Core Aesthetic Modes (Cross-Category Cultural Aesthetics)

These are overarching cultural aesthetic modes that apply across product categories. Use when matching a brand's cultural positioning rather than its specific product type.

**CLEAN GIRL**
- Emotional Description: Effortless, stripped-back, and aspirationally minimal. Everything looks easy and intentional. Not trying hard is the point.
- Core Emotion: Calm confidence, quiet luxury, self-possession
- Color Palette: Off-white, warm beige, glazed skin tones, nude lips
- Best For: Skincare, wellness drinks, athleisure, supplements targeting women 25–35
- Never Use For: Clutter, heavy filters, bold statement pieces, loud color

**DARK ACADEMIA**
- Emotional Description: Rich, moody, intellectual. Worn leather, candlelight, old libraries. Romanticizes knowledge and ritual.
- Core Emotion: Nostalgic curiosity, depth, slow luxury
- Color Palette: Deep brown, burgundy, forest green, antique gold, cream
- Best For: Coffee brands, book-adjacent lifestyle, premium journals, heritage clothing, whiskey/spirits
- Never Use For: Clean whites, bright lighting, tech aesthetics, fast-paced cuts

**COASTAL GRANDMOTHER**
- Emotional Description: Breezy, linen-draped, sun-bleached. Life lived near the water, unhurried. Chinaware, farmers' markets, good olive oil.
- Core Emotion: Peace, abundance, grounded warmth
- Color Palette: Sandy beige, soft white, faded blue, terracotta, sage
- Best For: Organic food, premium olive oil, natural skincare, linen fashion, herbal supplements
- Never Use For: Neon, city aesthetics, hustle culture messaging, heavy branding

**COTTAGECORE**
- Emotional Description: Romantic escapism into nature and handmade living. Floral prints, jam jars, morning light through lace curtains.
- Core Emotion: Warmth, nostalgia, gentle joy, slow living
- Color Palette: Dusty rose, sage green, buttercream, wildflower hues
- Best For: Artisan food, natural skincare, herbal teas, eco-fashion, candles
- Never Use For: Urban settings, tech products, sleek minimalism, polished surfaces

**Y2K / BRATZ**
- Emotional Description: Bold, glossy, unapologetic. Chrome accents, low waists, over-the-top confidence. Maximalism as identity.
- Core Emotion: Playful rebelliousness, nostalgia, fun excess
- Color Palette: Hot pink, chrome silver, electric blue, neon green, bubblegum
- Best For: Fashion, makeup, hair care targeting Gen Z, fast fashion, beauty accessories
- Never Use For: Minimalism, muted tones, seriousness, health/wellness framing

**HYPER-MINIMAL / TECH LUXE**
- Emotional Description: Sparse, surgical, almost cold. Products floating in white space. Precision is the message.
- Core Emotion: Trust, efficacy, premium quality, control
- Color Palette: Pure white, matte black, icy silver, cold grey
- Best For: Premium skincare, nootropics, tech-adjacent wellness, D2C supplements, clinical beauty
- Never Use For: Warmth, clutter, storytelling-heavy formats, nature props

**SOFT GIRL / COQUETTE**
- Emotional Description: Pastel-dipped, bow-adorned, and sweetly feminine. Hyper-romantic. Life is an aesthetic.
- Core Emotion: Playful sweetness, romantic fantasy, girlhood
- Color Palette: Ballet pink, lavender, powder blue, cream, pearl
- Best For: Feminine beauty, hair care, romantic fashion, fragrance, self-care
- Never Use For: Harsh tones, bold branding, masculine framing, clinical language

**RAW / UNFILTERED UGC**
- Emotional Description: Shot on phone. Messy background. Real lighting. The creator is just telling you the truth.
- Core Emotion: Authenticity, trust, relatability, peer recommendation
- Color Palette: No set palette — organic, real-environment colors
- Best For: Any category needing trust-building. Especially skincare, supplements, food, fitness
- Never Use For: Polished lighting, scripted-feeling dialogue, branded backgrounds

**EDITORIAL / FASHION WEEK**
- Emotional Description: High contrast, directional lighting, deconstructed beauty. The product is art.
- Core Emotion: Aspiration, desire, exclusivity
- Color Palette: Black and white with one bold pop color, or monochromatic
- Best For: Luxury fashion, perfume, premium cosmetics, high-end accessories
- Never Use For: Relatable messaging, UGC-style content, budget language

**WELLNESS / BIOPHILIC**
- Emotional Description: Earthy, plant-forward, morning ritual energy. Linen, wood, steam. Everything is natural and intentional.
- Core Emotion: Peace, health optimism, self-care ritual, grounded luxury
- Color Palette: Warm clay, oat, sage, forest green, natural linen
- Best For: Supplements, herbal teas, organic food, clean beauty, yoga/wellness brands
- Never Use For: Clinical messaging, processed food aesthetics, synthetic-looking props

---

### 2.1 Vibes — Skincare & Beauty

**Raw Ritual**
- Description: Unfiltered, texture-forward. Ingredients in their natural state — clay, oil, botanical extract. Camera gets close enough to see pores.
- Emotional effect: Trust through transparency. The viewer feels shown something real, not sold something aspirational.
- Best for: Natural/organic skincare, ingredient-led brands, clean beauty
- Audience: 24–35, health-conscious, skeptical of traditional beauty marketing
- Color mood: Bone, terracotta, sage, unbleached linen

**Glass Architecture**
- Description: Cool, translucent, precision-engineered. Clinical without being cold. Products suspended in light.
- Emotional effect: Science as luxury. Engineered rather than formulated.
- Best for: Science-backed skincare, serums, clinically-tested products
- Audience: 28–40, educated, ROI-focused on skincare spending
- Color mood: Ice, platinum, cloud white, clinical blue

**Coastal Bloom**
- Description: Washed light, ocean-adjacent tones, botanical texture. Morning light through sheers onto marble. Salt and petals.
- Emotional effect: Aspirational ease. The life you could have if your skin just worked.
- Best for: Hydrating skincare, SPF, clean beauty with luxury positioning
- Color mood: Seafoam, warm white, dusty rose, sage

**Fever Dream Chemistry**
- Description: Bold, unexpected color combinations. Products against saturated backdrops. Ingredient macro shots that look like abstract art.
- Emotional effect: Intrigue and desire. Stops the scroll because it looks like nothing else.
- Best for: Gen Z-targeting brands, bold ingredient stories, disruptive skincare
- Audience: 18–26, values novelty and self-expression
- Color mood: Electric violet, acid green, deep plum, mercury silver

---

### 2.2 Vibes — Coffee & Beverages

**Brewed Awakening**
- Description: Raw, earthy, intentional. The aesthetic of someone who takes their coffee seriously without performing it. Worn surfaces, natural light, hands holding a mug like it matters.
- Emotional effect: Permission to slow down and care about something small.
- Best for: Specialty coffee, artisan roasters, ritual-positioning brands
- Audience: 25–38, urban professionals
- Color mood: Mocha, coconut cream, aged bronze, deep espresso

**Cold Industrial**
- Description: Concrete, brushed steel, dramatic overhead light. Coffee as architecture. Pure precision and craft.
- Emotional effect: Respect for the process.
- Best for: Espresso machines, cold brew brands, professional equipment
- Color mood: Concrete grey, matte black, stainless silver, amber

**Sunday Slow**
- Description: Soft light, weekend morning, no urgency. Photographed like nobody is watching.
- Emotional effect: Comfort and permission. You don't have to rush.
- Best for: Home coffee brands, subscription coffee
- Color mood: Warm cream, dusty terracotta, sage green, worn linen

---

### 2.3 Vibes — Fashion & Apparel

**Borrowed Nostalgia**
- Description: Film grain, muted tones, clothes that feel like they've been worn somewhere interesting. The aesthetic of things that have a history.
- Emotional effect: Belonging to a story larger than yourself.
- Best for: Vintage-inspired fashion, heritage brands, sustainable apparel
- Color mood: Faded denim, tobacco, aged cream, rust

**Sharp Civilian**
- Description: Someone who dresses for themselves, not for approval. Clean but not corporate. Intentional but not effortful.
- Emotional effect: Quiet confidence.
- Best for: Minimal fashion, quality basics, capsule wardrobes
- Color mood: Ash white, navy, tobacco brown, slate

**Street Provocation**
- Description: Urban environment as runway. Concrete, movement, real light. Models that look like they have somewhere to be.
- Emotional effect: Relevance and desire. The clothes look alive in the real world.
- Best for: Streetwear, contemporary fashion, urban lifestyle
- Color mood: Saturated primaries, chalk white, asphalt, neon accents

**Silent Luxury**
- Description: No logos. No performance. Just the quality of material and cut. Extreme restraint.
- Emotional effect: The aspiration of being too established to show it.
- Best for: Premium fashion, investment pieces, understated luxury
- Color mood: Camel, ecru, stone, deep forest

---

### 2.4 Vibes — Fitness & Wellness

**5AM Covenant**
- Description: Pre-dawn light, near-empty gym, sweat that hasn't been earned yet.
- Emotional effect: Exclusive membership to a dedication club.
- Best for: Pre-workout, gym apparel, fitness wearables
- Color mood: Deep navy, neon signal green, iron grey, chalk

**Recovery Temple**
- Description: Spa meets sports science. Clean whites and eucalyptus tones. The body at rest as athletic discipline.
- Emotional effect: Permission to recover. Rest is productive.
- Best for: Recovery supplements, sleep products, compression gear
- Color mood: White, eucalyptus, bare skin, pale gold

**Raw Signal**
- Description: Unfiltered effort. Real sweat, real fatigue, real form. No glamour — just the documentary truth of hard work.
- Emotional effect: Respect and solidarity. The viewer sees their own effort reflected.
- Best for: Performance gear, training supplements, functional fitness
- Color mood: Skin tone + grey, blood orange, iron, concrete

---

### 2.5 Vibes — Technology & Productivity

**Quiet Infrastructure**
- Description: The aesthetics of things that work invisibly. Cables managed, surfaces clear. Technology as architecture.
- Emotional effect: Control. Calm. Environment designed rather than accumulated.
- Best for: Productivity tools, smart home, clean-design tech
- Color mood: Warm white, aluminium, deep black, cable grey

**Late Light Office**
- Description: The warm light of being last in the office, or a home desk after midnight. Productive solitude.
- Emotional effect: The romance of work done seriously.
- Best for: Productivity software, noise-cancelling headphones
- Color mood: Amber desk lamp, deep navy, screen glow blue, warm wood

---

## SECTION 3: COLOR STORY LIBRARY

### 3.0 Color Psychology by Category (Structured Reference)

**COFFEE & BEVERAGES**
- Primary Colors: Rich espresso brown, warm amber, burnt sienna
- Secondary Colors: Cream, oat milk beige, warm white
- Accent Colors: Copper, matte black, terracotta
- Background / Surface: Dark wood, black slate, warm marble
- Rationale: Warm browns stimulate appetite and evoke the sensory experience of coffee. Amber tones communicate richness and quality.
- Avoid: Bright white backgrounds (feels clinical), blues/purples (kills appetite associations)

**SKINCARE**
- Primary Colors: Soft blush, glazed white, warm nude
- Secondary Colors: Sage green, ivory, warm pearl
- Accent Colors: Rose gold, pale gold, translucent
- Background / Surface: White marble, off-white linen, pale stone
- Rationale: Soft, clean tones communicate purity and gentleness. Blush and nude link to healthy skin. Green accent tones signal natural/clean formulas.
- Avoid: Saturated reds (looks medical), dark moody tones (doesn't read as clean), heavy patterns

**FASHION / APPAREL**
- Primary Colors: Black/white for luxury; bold saturated for streetwear
- Secondary Colors: Product color dominates — background serves the garment
- Accent Colors: Metallic for premium, neon for youth/streetwear
- Background / Surface: Neutral concrete, warm studio, outdoor location
- Rationale: Colors serve to make the garment pop. Luxury = monochromatic restraint. Youth = saturated, high-contrast, unexpected pairings.
- Avoid: Colors that clash with the product, heavy-branded backgrounds that fight the garment

**FOOD / SNACKS**
- Primary Colors: Red-orange-yellow trinity — proven appetite stimulants
- Secondary Colors: Fresh green for healthy, health-forward items
- Accent Colors: Golden highlights, steam effects, drizzle shimmer
- Background / Surface: Rustic wood (artisan), dark slate (premium), white plate (clean), kraft paper (casual)
- Rationale: Warm colors biologically stimulate hunger. Red raises heart rate slightly.
- Avoid: Purple (confusion with artificial), blue (unnatural for food, kills appetite), dull greys

**SUPPLEMENTS / WELLNESS**
- Primary Colors: Clean white, medical green, sky blue
- Secondary Colors: Warm gold (energy/vitality), forest green (natural ingredients)
- Accent Colors: Electric pop color on capsules/packaging for visual interest
- Background / Surface: White/neutral — let the product packaging take center stage
- Rationale: White signals clinical purity and trust. Green connects to nature and safety. For sleep/calm: cool blues and purples. For energy: warm gold and orange.
- Avoid: Dark moody palettes (reads as dangerous), aggressive reds on health items

**FITNESS / ACTIVEWEAR**
- Primary Colors: Bold black, high-contrast white, electric accent (red, orange, or neon)
- Secondary Colors: Athletic grey, performance navy
- Accent Colors: Motion blur, dynamic shadows, sweat-real skin
- Background / Surface: Gym floor, outdoor terrain, clean studio
- Rationale: High contrast communicates strength and performance. Bold colors signal energy. Neon accents target Gen Z fitness market.
- Avoid: Soft pastels (undermines performance message), overly styled settings

**HOME / LIFESTYLE**
- Primary Colors: Warm neutrals — cream, warm white, sand
- Secondary Colors: Terracotta, sage, dusty rose
- Accent Colors: Brass/gold hardware, natural wood tones, ceramic glazes
- Background / Surface: Home interior — linen, light wood, soft shadow
- Rationale: Warm neutrals create desire for the lifestyle, not just the product. Earthy tones photograph well in natural light.
- Avoid: Cold blues (uninviting), pure white only (sterile), dark rooms

**JEWELLERY / ACCESSORIES**
- Primary Colors: Black velvet, midnight navy, warm ivory
- Secondary Colors: Champagne, blush, warm beige
- Accent Colors: Metallic shimmer — gold, rose gold, silver matching the metal
- Background / Surface: Velvet surface, marble, skin — show it worn
- Rationale: Jewellery requires luxury framing. Dark backgrounds make metals and gemstones pop. Velvet adds texture-richness.
- Avoid: Busy backgrounds, bright colors that distract from the piece, daylight that flattens metallic

**PET PRODUCTS**
- Primary Colors: Warm, approachable tones — grass green, sky blue, golden yellow
- Secondary Colors: Playful pastels, animal fur tones
- Accent Colors: Bright red/orange for CTAs — toys and accessories
- Background / Surface: Home environments, outdoor parks, real pet owner settings
- Rationale: Pet products sell to humans but the emotional trigger is the animal. Show the pet happy. Warm, playful colors reinforce joy.
- Avoid: Cold clinical white (doesn't feel like love), overtly premium black (not relatable)

**TECH / GADGETS**
- Primary Colors: Matte black, space grey, midnight navy
- Secondary Colors: Pure white, anodized silver
- Accent Colors: Electric blue glows, ambient LED, product-native colors
- Background / Surface: Clean desk setups, minimal surfaces, dark studio
- Rationale: Dark tones = sophistication and power. Clean surfaces = focus on product design. Minimalism makes the product feel more valuable.
- Avoid: Warm earth tones (too casual), bright primary colors (except kids' tech)

---

### 3.1 Color Stories — Skincare (Named Palettes)

**Natural/Organic Skincare**
- Warm Clay (#C4714A) — the color of unprocessed kaolin, ground-level honesty
- Oat Silk (#F0E9D8) — the lightest tone of clean, softness made visible
- Herb Dusk (#6B7A5E) — botanical without being decorative, the green of something that functions

**Clinical/Science Skincare**
- Protocol Blue (#C8D8E8) — the blue of lab environments, precision and trust
- Purified (#F8FAFB) — white with intent, the result of refinement
- Compound Grey (#8A9BAA) — the grey of surgical steel and serious formulation

**Luxury/Premium Skincare**
- Old Gold (#B8960C) — wealth with restraint, not display
- Alabaster (#F2EDE6) — the off-white of expensive paper and marble
- Deep Lacquer (#1A1008) — depth without heaviness

**Brightening/Glow Skincare**
- Lit Amber (#E8A444) — vitamin C before it oxidises, things working
- Petal Mist (#F5E8E0) — the flush of skin that's just been cared for
- Deep Dusk (#3A2820) — the contrast that makes everything else visible

---

### 3.2 Color Stories — Coffee (Named Palettes)

**Third Wave/Specialty Coffee**
- Mocha Depth (#4A2C0A) — a properly pulled espresso, serious and warm
- Parchment (#E8DBBF) — filtered morning light through a café window
- Oxidised Copper (#8B5E3C) — the handles and fixtures of a serious coffee bar

**Cold Brew/Iced Coffee**
- Cold Steep (#2C3E50) — deep navy of cold brew at midnight
- Filtered Ice (#D6EAF8) — the clarity of properly filtered water
- Caramel Thread (#C49A4D) — cold brew in the right afternoon light

**Instant/Accessible Coffee**
- Morning Orange (#E8803A) — kitchen light before 8am
- Oat Foam (#F5ECD0) — oat milk in coffee, domestic and comforting
- Roast Dark (#3D2000) — coffee in its most familiar form

---

### 3.3 Color Stories — Fashion (Named Palettes)

**Streetwear**
- Signal White (#F2F2F0) — not bright, worn — a well-laundered tee with history
- Urban Concrete (#5C5C5C) — the grey of every city surface
- Neon Trace (#B4FF4D) — one pop of unignorable color against a neutral world

**Sustainable/Ethical Fashion**
- Undyed Linen (#D4C4A0) — fabric in its pre-production state
- Lichen Green (#8A9872) — found in nature, not manufactured
- Worn Bark (#7A5C3A) — the brown of something useful for a long time

**Luxury Fashion**
- Camel Classic (#C6956C) — the investment piece color of coats and bags
- Parchment Silk (#EDE8D8) — the interior of a luxury box
- Deep Evening (#12100E) — the absence of color as statement

---

### 3.4 Color Stories — Fitness (Named Palettes)

**Performance Activewear**
- Adrenaline (#FF4B2B) — the red of something about to happen
- Black Carbon (#1A1A1A) — the base of every performance garment
- Pulse White (#F0F0EE) — light that reflects in motion

**Recovery/Wellness Fitness**
- Eucalyptus Steam (#A8C5B5) — the green of a spa that takes sport seriously
- Bare Skin (#E8C4A0) — warmth of a body after exertion
- Stone Still (#8C8C8A) — rest as texture, grounded and calm

---

### 3.5 Color Stories — Technology (Named Palettes)

**Consumer Tech**
- Space Dark (#1C1C1E) — dark mode made physical
- Aluminum Warm (#E0D8CC) — the warmth that stops tech from feeling clinical
- Interface Blue (#3A7BD5) — the most trusted color in digital

**Productivity/B2B Tech**
- Ink Navy (#1A2744) — serious without aggressive, the color of decision-making
- Clean White (#FAFAFA) — the interface before the content
- Signal Green (#00C98D) — the color of things working, status: confirmed

---

## SECTION 4: VISUAL DIRECTION LIBRARY

### 4.0 Visual Direction by Product Type (Structured Reference)

**SKINCARE SERUM / MOISTURISER**
- Hero Shot Type: Macro close-up of product texture, floating droplet shot, or hand-apply ritual shot
- Lighting Setup: Soft diffused natural light from a window at 45°. Reflector on opposite side. Backlight through serum bottle for translucency glow.
- Camera Angle: Eye-level or slightly above. Never looking up at product.
- Props / Surface: Marble surface, dried botanicals, sprig of herbs matching the formula, clean white towel
- NEVER Do This: Before/after split shots (Facebook policy risk). Heavy studio flash that kills texture. Overcrowded flatlay.

**COFFEE / HOT DRINK**
- Hero Shot Type: Steam rising close-up, overhead flat lay with hands around mug, crema pour shot
- Lighting Setup: Backlighting slightly from behind and above to catch steam and crema glow. Warm tungsten or 3200K. Avoid harsh direct flash.
- Camera Angle: Overhead (flat lay) for atmosphere. Eye-level + slightly above for steam capture. Never looking up.
- Props / Surface: Warm wood surface, ceramic mug, scattered beans, open book or journal
- NEVER Do This: Bright cold-white backgrounds. Plastic cups. Absence of steam.

**FASHION / APPAREL**
- Hero Shot Type: Walk-towards-camera movement shot, try-on reveal, lifestyle in-setting shot
- Lighting Setup: Golden hour natural light for aspirational. Overcast outdoor for color accuracy. Studio with large softbox for lookbook.
- Camera Angle: Eye-level for street style. Slightly low angle looking up for empowerment framing. Never top-down for fashion.
- Props / Surface: Minimal — let the garment do the work. Location tells the story.
- NEVER Do This: White ghost mannequin only shots. Overly posed, stiff model direction. Cluttered backgrounds.

**FOOD / SNACKS**
- Hero Shot Type: Hero overhead flat lay, hand-bite with drip, pour shot, fork-lift close-up
- Lighting Setup: Natural window light from the side. Reflector on shadow side. Gold reflector adds warmth. Avoid harsh studio flash.
- Camera Angle: Eye-level for burgers/stacked food (shows layers). Overhead for plated food. 45° for drinks.
- Props / Surface: Dark slate (premium), warm wood (artisan), white ceramic (clean/healthy)
- NEVER Do This: Blue-tinted lighting. Perfectly arranged food with no texture or imperfection. Absence of steam on hot food.

**SUPPLEMENTS / CAPSULES**
- Hero Shot Type: Product floating/levitating shot, ingredient pour with key botanicals, lifestyle shot (person mid-routine)
- Lighting Setup: Clean even lighting for product packaging. Dramatic single-source for ingredient close-ups. Natural light for lifestyle.
- Camera Angle: Eye-level for hero product shot. Overhead pour/splash shots for ingredient education.
- Props / Surface: Key raw ingredients matching the formula (e.g. ashwagandha root), glass of water, clean linen
- NEVER Do This: Pill-on-hospital-table shots. Any before/after of body transformation. Making drug-like claims visually.

**FITNESS / ACTIVEWEAR**
- Hero Shot Type: Motion shot in action, post-workout skin glow shot, locker room try-on
- Lighting Setup: Natural outdoor for energy. Hard directional light in gym (creates muscle shadows). Golden hour run shots.
- Camera Angle: Low angle looking up = power/aspiration. Eye-level in motion = relatability. Never overhead for body shots.
- Props / Surface: Gym equipment, outdoor terrain — minimal, nothing that slows the energy
- NEVER Do This: Stationary perfectly posed product-only shots. Excessive retouching. Props that look too lifestyle-y.

**JEWELLERY / ACCESSORIES**
- Hero Shot Type: On-skin lifestyle shot, velvet flatlay close-up, detail macro of clasp/texture
- Lighting Setup: Soft diffused light at 45° to bring out metal warmth. Avoid harsh direct flash that overexposes metal.
- Camera Angle: Close-up macro for detail. Eye-level on-skin for lifestyle. Never overhead unless pure flatlay.
- Props / Surface: Velvet tray, marble surface, hands with matching nail aesthetic, minimal clothing
- NEVER Do This: Showing jewelry in isolation without scale reference. Dull flat lighting. Cluttered compositions.

**HOME / LIFESTYLE PRODUCT**
- Hero Shot Type: In-situ lifestyle shot in styled room, hands-using close-up, flat lay with complementary items
- Lighting Setup: Warm indoor natural light near window. Golden hour through curtains. Warm-toned LED for evening shots.
- Camera Angle: Eye-level for in-room lifestyle. Slightly above for flat lay. Rule of thirds for all compositions.
- Props / Surface: Actual home environment — real, lived-in but styled. Plants, books, ceramics.
- NEVER Do This: Purely white-background product shots (fine for Amazon, wrong for social). Zero context shots. Overly staged rooms.

**PET PRODUCTS**
- Hero Shot Type: Pet interacting with product naturally, owner-pet bonding shot with product visible, close-up of pet being happy
- Lighting Setup: Natural daylight. Outdoor grass shots. Avoid flash near animals.
- Camera Angle: Get down to pet level — shoot at their eye level, not looking down at them.
- Props / Surface: Real home/outdoor environment. No overly clinical settings.
- NEVER Do This: Products without the pet in frame. Unhappy animals. Stock photo animals. Heavy branded overlays.

**TECH / GADGET**
- Hero Shot Type: Hands-on use shot, clean product hero on desk, edge/detail macro shot
- Lighting Setup: Even diffused studio light for hero. Ambient room light for lifestyle in-use. Backlit for screen glow.
- Camera Angle: Slightly above eye-level for screen-based devices. Eye-level for wearables. 3/4 angle shows depth.
- Props / Surface: Clean minimal desk setup. Matching accessories in brand color palette. No distracting items.
- NEVER Do This: Dark cluttered backgrounds that hide product lines. Props that confuse the frame. Ignoring reflections on screens.

---

### 4.1 Visual Direction — Skincare (Narrative)

**The Ingredient Truth**
- Shot: Extreme close-up macro of product texture — serum pooling on skin, clay catching light
- Light: Single diffused key from camera left, no fill — natural shadow reveals texture
- Unforgettable detail: The moment of contact — product meets skin and both change
- Works for: Ingredient-led brands, texture-forward products, clinical skincare

**The Morning Window**
- Shot: Product on white marble or stone surface, window to camera left, hands in frame
- Light: Soft natural light, slightly overexposed, shadows pointing right
- Unforgettable detail: A single botanical element — not styled, just present
- Works for: Clean beauty, organic skincare, daily ritual positioning

**The Mirror Moment (UGC)**
- Shot: Bathroom mirror selfie format — not staged, genuinely casual
- Light: Warm bathroom light or morning window light
- Unforgettable detail: Product IN USE on real skin — applied, not just held
- Works for: De-tan, acne, glow products where the result is the story

---

### 4.2 Visual Direction — Coffee (Narrative)

**The First Pour**
- Shot: Overhead, matte surface, pour in progress — liquid suspended in motion
- Light: Warm practical light source, natural shadow underneath cup
- Unforgettable detail: The swirl of cream entering dark liquid — freeze that exact frame
- Works for: Specialty coffee, pour-over brands, artisan roasters

**The Second Cup**
- Shot: Cup already half-drunk on a surface, morning light, slight condensation, natural imperfection
- Light: Soft directional window light, golden hour quality
- Unforgettable detail: The ring left by the first cup still on the table — evidence of enjoyment
- Works for: Comfort-positioning coffee, subscription brands

---

### 4.3 Visual Direction — Fashion (Narrative)

**The Candid Still**
- Shot: Subject mid-movement, not posed — looking away from camera, caught in transition
- Light: Available light — whatever is real on that day
- Unforgettable detail: The garment in motion — fabric moving, collar lifted
- Works for: Contemporary fashion, streetwear, authentic positioning

**The Getting Dressed Scene (Video)**
- Direction: Morning routine — only the dressing part. No face, just hands and garments.
- Light: Bedroom morning light, warm and slightly underexposed
- Unforgettable detail: The final outfit reveal before the video cuts
- Works for: Basics brands, capsule wardrobe, everyday fashion

---

### 4.4 Visual Direction — Fitness (Video)

**The 4:59 Sequence**
- Direction: Quick cuts — alarm, dark outside, pre-workout ritual, first rep. No words.
- Light: Pre-dawn darkness → gym fluorescent → natural light
- Unforgettable detail: First rep completed before dawn breaks
- Works for: Pre-workout, gym apparel, motivation-based fitness brands

**The After**
- Direction: Post-workout — slowed down, introspective. The quiet after genuine effort.
- Light: Warm golden hour or post-workout bathroom light
- Unforgettable detail: Hands on knees, controlled breathing, body at rest
- Works for: Recovery products, protein, performance gear

---

## SECTION 5: CATEGORY CREATIVE RULES

### 5.0 Numbered Rules by Category (Performance-Tested)

**SKINCARE (Rules 1–10)**
1. NEVER show a before/after split image — show the ritual, the texture, the habit instead
2. Always anchor claims in skin concern, not cure: say 'visibly brighter' not 'treats hyperpigmentation'
3. Show the formula in action — serum drops, cream being applied, steam rising on cleanser
4. Use real skin with pores — hyper-retouched skin destroys trust
5. Skincare builds ritual identity — show it in context: morning light, bathroom shelf, nightstand
6. Never start with the product. Start with the skin concern or the feeling
7. Ingredient-forward messaging works — name what's in it and what it does specifically
8. Avoid synthetic-looking backgrounds. Marble, linen, and natural textures convert better
9. UGC with no-makeup or minimal makeup creator outperforms polished beauty creator in this category
10. Video hook rate target: above 30%. If hook is below 20%, do not boost

**COFFEE & BEVERAGES (Rules 11–20)**
11. Always evoke the sensory experience: aroma, warmth, pour — not just taste
12. Steam = mandatory for hot beverages in video. No steam = no soul
13. The origin story converts: where it's from, who farms it, how it's roasted
14. Avoid blue-white lighting at all costs — kills appetite and warmth associations
15. The vessel matters: ceramic > paper cup > plastic. Choose props that signal your tier
16. For premium coffee, silence and minimalism work. For mass-market, energy and accessibility
17. Pour shots and flat lays are evergreen. Prioritise them in static creative
18. UGC works best when creator drinks it on camera — genuine reaction is worth 10 scripted lines
19. Never make health claims for caffeinated products. Stick to ritual and taste territory
20. Coffee is a daily habit — messaging should be routine-forward, not occasion-forward

**FASHION / APPAREL (Rules 21–30)**
21. Never show clothing without someone wearing it — white ghost shots are for product pages only
22. Move the garment. Static hanging shots lose to try-on video every time
23. Hook must feature the product within the first 2 seconds — don't hold the reveal too long
24. Show it styled two ways minimum in a single video — gives the buyer creative permission
25. UGC try-on with authentic reaction outperforms even high-production editorial
26. For DTC fashion: 60% UGC, 40% lifestyle/lookbook. Never 100% either
27. Unboxing videos drive massive save rates — lean into the 'unwrapping' ritual
28. Never write hooks that sound like a catalog. It must sound like one person to one friend
29. Refresh creatives every 7–14 days. Fashion audience spots fatigue faster than any other category
30. Seasonal creative must be retired regardless of performance when the season ends

**FOOD / SNACKS (Rules 31–40)**
31. Lead with texture, not taste — visuals do the sensory selling
32. Close-up of the food is more appetising than wide shot of a table
33. The hero angle varies: burgers = eye-level for layers; pizza = overhead; drinks = 45°
34. Imperfection sells in food — perfectly arranged food reads as artificial and kills appetite
35. Steam, drip, pour, melt — motion equals mouth-watering. Use it
36. Dark slate surface = premium; warm wood = artisan; white = clean/healthy. Choose intentionally
37. For snacks, urgency and fun work better than ritual. For premium food, slowness and craft convert
38. Never use blue-tinted lighting on food
39. Seasonal and occasion hooks multiply performance — tie to a moment, not just a product
40. Always include the act of eating or serving — not just the product sitting there

**SUPPLEMENTS / WELLNESS (Rules 41–50)**
41. Never make disease or cure claims — say 'supports', 'may help', 'formulated for'
42. Lead with the lifestyle and feeling, not the ingredient list
43. Show the supplement fitting into a real routine: morning ritual, gym bag, evening wind-down
44. Social proof (testimonials) must be framed as experiences, not medical results
45. Ingredient education works — name one key ingredient, explain its function simply
46. Never show extreme transformation content or anything implying rapid physical change
47. Trust signals are critical: 3rd-party testing, clean ingredients, transparent sourcing
48. For sleep/calm products: cool blues, lavender, soft lighting — mirror the feeling
49. For energy/performance: warm gold, bright white, dynamic shots — mirror the energy
50. Build ad creative for funnel: awareness (lifestyle/problem), mid-funnel (ingredient proof), bottom (testimonial + offer)

**FITNESS / ACTIVEWEAR (Rules 51–60)**
51. Show the effort — sweat, movement, determination. Not just the product on a hanger
52. The model/creator should be in motion — running, lifting, stretching — not posing
53. Diverse bodies convert better than aspirational-only bodies
54. Low camera angle looking up creates aspiration and power — use it deliberately
55. Protein powder and supplements must show post-workout context to link to need
56. Avoid overclaiming transformation results in imagery — show the work, not the miracle
57. Video outperforms static 3x in fitness — movement sells movement
58. Gym environment adds authenticity. Outdoor adds aspiration. Both work — mix them
59. UGC from regular athletes (not just influencers) builds more community trust
60. Music and sound design are part of the hook in fitness. Silence is not an option in video

**HOME / LIFESTYLE (Rules 61–70)**
61. Sell the feeling of the space, not just the object
62. Always show the product in situ — in an actual home, not just a white backdrop
63. Warm light converts better than neutral or cold light for home category without exception
64. Styling matters: the surrounding props tell the buyer who they could be if they buy
65. Aspirational but achievable — not a magazine spread that's unreachable
66. Hands using the product add scale, warmth, and relatability
67. Story format works well: before the product vs after it's in the home
68. For candles/fragrance: show the ritual of lighting, the ambiance, never just the jar
69. UGC from homeowners in real spaces dramatically outperforms styled shoots for trust
70. Always show the product open, lit, used — never still sealed in packaging as the hero

**JEWELLERY / ACCESSORIES (Rules 71–80)**
71. Show it on skin — always. Isolated product shots go in the product catalog, not in ads
72. The right background for metal: velvet or skin. The wrong: busy patterns
73. Soft directional light from 45° catches metallic sheen without overexposure
74. Jewellery sells emotion: love, gift, milestone. Always anchor to an occasion or feeling
75. Close-up macro is your best friend — show the craftsmanship that justifies the price
76. For gifting campaigns: packaging is part of the product — show the unboxing experience
77. Matching aesthetic (nail colour, clothing) elevates the entire visual story
78. Never over-retouch — it destroys trust and makes the product look fake
79. Stacking and layering shots (multiple pieces together) drive higher AOV
80. Heritage and material story convert in copy: 925 silver, hand-finished, ethically sourced

**PET PRODUCTS (Rules 81–90)**
81. The pet must be happy. A reluctant or uncomfortable animal destroys trust instantly
82. Get to the animal's eye level — shoot their perspective, not yours
83. Show the human-pet bond — the emotional core is the relationship, not the product
84. Real home environments dramatically outperform clinical white studios
85. Never flash the animal — use natural light only in video
86. UGC from actual pet owners outperforms professional pet photography for social ads
87. Show the product being used naturally — don't force the pet to interact
88. Avoid health claims for pet food without regulatory backing
89. Humour works especially well in pet ads — lean into it
90. Seasonal content (summer heat, monsoon, festive) anchors the product to specific needs

**TECH / GADGETS (Rules 91–100)**
91. Premium framing = minimal. Clean desk, black or white background, no distractions
92. Show it in use — hands on the product, screen lit, interaction happening
93. Demonstrate the specific problem it solves in the first 3 seconds
94. Specs and features matter to this buyer — but only after you've established desire
95. For budget tech: lead with value and comparison. For premium: lead with design and experience
96. UGC unboxing works because it shows scale, build quality, and real-time reaction
97. Avoid complex diagrams in social ads — simplify to one feature, one visual, one benefit
98. Demo video of the product's key feature converts better than any lifestyle shot
99. 3/4 angle product shots show depth and feel more premium than flat-on shots
100. For accessories: show them on the device/person to establish fit and finish

---

### 5.1 Category Rules — Extended (DO/DON'T Format)

**Skincare**
DO: Show the ritual, not the result. Use real skin texture. Let the hero ingredient speak visually. Speak to specific skin type and concern. Show the product at the right time of day.
DON'T: Before/after comparison photos. Models without visible skin texture. Vague claims like "glowing skin." Stack more than one hero claim. Use purple prose about "nourishing" without naming the mechanism.

**Coffee**
DO: Show temperature contrast — steam, condensation, color through glass. Feature hands. Let the environment establish mood. For specialty: honor the process. For accessible: honor the comfort.
DON'T: Show a perfect desk setup with cup as prop. Use generic "morning person" stock photo energy. Show anyone smiling while drinking in a staged way. Overdo the steam effect.

**Fashion**
DO: Show the garment in motion. Cast people who look like your actual buyer. Let the environment matter. Show care details up close. For sustainable: show the making, not just the wearing.
DON'T: Post heavily retouched skin. Use music that doesn't match the brand world. Show styling that makes the garment inaccessible. Reuse poses from other fashion brands.

**Fitness**
DO: Show effort authentically. Cast people mid-workout. For supplements: show the process not just the container. Connect the product to the specific athletic goal. Show the time.
DON'T: Show unrealistic physiques for products that can't achieve them. Use "crush your goals" or "level up." Stage overly cheerful gym scenes. Rely on transformation claims without legal backing.

**Food & Snacks**
DO: Shoot the moment of first contact — bite, pour, break, snap. Use real food styling imperfections. Feature the ingredients separately before the finished product. Match environment to occasion.
DON'T: Over-style food into something no one would actually eat. Ignore sound design in video. Use generic plating. Make health claims the hero narrative for indulgent products.

**Technology**
DO: Show the product in actual use environment. Feature the problem before the product. For B2B: use specificity — "saves 3 hours a week." Show product at human scale. Let interface be the visual when hardware is unremarkable.
DON'T: Shoot against black gradient backgrounds. Use screenshots that look like stock illustration. Make the tech sound more complicated than it needs to be. Ignore packaging and unboxing.

**Jewellery & Accessories**
DO: Show jewelry on skin. Use natural lighting that creates shadows and depth. Show scale honestly. Feature the clasp, the back, the underside. Show it being worn in real life moments.
DON'T: Use overly saturated color editing that makes metals look synthetic. Style jewelry against clashing backgrounds. Show too many pieces in one frame.

**Home & Living**
DO: Shoot in real light. Show rooms at human occupancy. Let the product take visual priority. For cleaning/organization: show the before state briefly, then dwell on the after. Feature the product being used.
DON'T: Over-style with too many props. Use backgrounds that clash with the product's color story. Make rooms look impossibly perfect.

---

## SECTION 6: AD FORMAT PLAYBOOKS

### 6.1 Static Image Ads

What works:
- Single, powerful visual with a clear hierarchy — product, then context, then brand
- Minimal text on image — the image does emotional work, text does informational work
- High contrast between product and background — thumb-stop requires visual pop
- One clear message per frame — multiple claims dilute all of them

Format rules:
- Instagram Feed 1080×1080px: Square, must work without sound, must read in 1.3 seconds
- Facebook Feed 1200×628px: Landscape, more headline space, slightly older audience
- Instagram Story 1080×1920px: Full screen, vertical, interactive elements possible
- Amazon Main Image 1000×1000px: White background, product fills 85% of frame
- LinkedIn Feed 1200×627px: More information density acceptable, professional context

What kills static ads:
- Busy backgrounds competing with product
- Text over the product itself
- Font choices that signal "made in Canva at 11pm"
- Logo that's larger than it needs to be

---

### 6.2 UGC Ads

What works:
- Genuine specificity — when a creator mentions a specific smell, texture, or feeling, not just "I love it"
- The messy truth — a real bathroom counter, a real gym bag, not a styled set
- Relatable creator demographics — your buyer should see themselves, aspirationally upgraded slightly
- First-person testimonial with one moment of doubt or nuance — "I was skeptical but..." builds trust faster than pure positivity
- Problem-first structure: establish pain in first 3 seconds, then introduce product

Format rules:
- 9:16 vertical, 15–30 seconds for Stories/Reels, 60–90 seconds for in-feed video
- Hook in first 3 seconds — algorithm decides reach in that window
- No brand logo until 7+ seconds — logo in second 1 signals "ad" and triggers skip behavior
- Captions/subtitles mandatory — 80% of mobile video is watched on mute

What kills UGC ads:
- Obvious scripting — identifiable within 2 seconds
- Professional lighting in a "real" context
- Not showing the product being used — just held
- Talking about the brand more than the personal experience

---

### 6.3 Video Ads (Branded Production)

What works:
- Open on the problem or emotion, not the product — product reveals land harder when earned
- Sound design as persuasion — the crunch, the pour, the notification sound are preverbal
- Pace matching category: luxury = slower cuts, fitness = fast cuts, food = medium with detail
- End on a single clear action — not "Shop now and discover..." just "Shop now"

Format rules:
- 0:06 bumper: Problem + visual in 6 seconds, no CTA needed — pure awareness
- 0:15 pre-roll: Problem (0–4s), Product (4–12s), CTA (12–15s)
- 0:30 narrative: Establish world (0–8s), introduce desire/conflict (8–18s), product as resolution (18–24s), CTA (24–30s)
- 0:60 story: Full brand narrative, CTA is conclusion not interruption

What kills video ads:
- Logo within first 2 seconds
- Music that doesn't match the edit rhythm
- No hook in first 3 seconds

---

### 6.4 Story & Reel Ads

What works:
- Vertical-native composition — designed for portrait, not cropped from landscape
- Movement in the first frame — something must move (video) or the composition must be striking (static)
- Minimal text — Stories are quick-consumption; text readable in under 2 seconds
- Platform-native elements — polls, swipe prompts for interactive Stories

Format rules:
- 1080×1920px, 9:16 ratio
- Keep critical content within safe zone: top 250px and bottom 250px are UI territory
- First frame must work as a standalone still image
- Subtitles in large, high-contrast font

What kills Story/Reel ads:
- Critical content in top or bottom 250px — covered by UI elements
- Horizontal video reformatted for vertical
- No hook in the first second

---

### 6.5 Carousel Ads

What works:
- First card is the hook — must stop the scroll, not introduce the brand
- Each subsequent card deepens one specific claim
- Final card always contains the CTA
- Visual thread connecting all cards — color, element, or composition

Format rules:
- 1080×1080px per card (square) or 1080×1350px (portrait)
- 2–10 cards; optimal range is 5–7
- Each card must make sense standalone AND as part of a sequence
- Product cards: show different angles, colorways, or use cases

What kills carousel ads:
- Front-loading all information on the first two cards
- Cards without visual relationship
- No payoff card at the end

---

## SECTION 7: AUDIENCE CREATIVE PROFILES

### 7.1 Gen Z (18–26)

How to reach them:
- They identify inauthenticity within 1.3 seconds
- They distrust polish — production value that reads as "corporate" reduces trust
- They respond to identity affirmation — "this is for people like you" works better than "for everyone"
- Subculture targeting outperforms demographic targeting

Creative do's:
- Use the platform's native aesthetic
- Let creators speak for you — UGC outperforms branded content
- Move fast — 3-second hook is actually 1 second for Gen Z
- Reward cultural insider knowledge — references only a niche would catch create belonging

Creative don'ts:
- Speak to them as a demographic — they recognize and reject it
- Use the word "authentic" — saying it signals inauthenticity
- Over-explain — trust their intelligence

---

### 7.2 Millennials (27–38)

How to reach them:
- They have category expertise — they've used many products and will notice weak claims
- They're time-poor — specificity and efficiency are virtues
- They respond to proof over promise — testimonials, studies, founder stories beat aspirational photography
- Values-alignment matters — sustainability, fair trade, ethical sourcing influence decisions

Creative do's:
- Lead with the specific outcome first
- Show the brand working in a realistic version of their life
- Build trust with founders, reviews, or real user content
- Acknowledge trade-offs — this audience respects honesty about limitations

Creative don'ts:
- Oversell — they'll discount everything and not forgive exaggeration
- Ignore the second-order benefit
- Use generic lifestyle imagery — signals low targeting

---

### 7.3 Working Professionals (28–45)

How to reach them:
- ROI mentality — even for personal products, they calculate value vs. cost
- Time is their most scarce resource — anything that saves time is automatically premium
- Social proof from professional peers matters more than celebrity endorsement
- They can absorb more information per ad — longer captions work

Creative do's:
- Speak to specific professional scenarios — "before the 9am presentation" beats "before your big day"
- Show the product in professional-adjacent contexts
- Use specificity as quality proxy — exact times, outcomes, mechanisms
- Treat them as intelligent — complexity handled well is appealing

Creative don'ts:
- Make ads that look like LinkedIn posts
- Use hustle-culture language — they're past the motivation phase, into execution
- Ignore aesthetics — this audience correlates design quality with product quality

---

### 7.4 Fitness Enthusiasts (22–40)

How to reach them:
- They know more than the ad assumes — speak to them as insiders
- They're skeptical of transformation claims — they know what results take
- Community and identity are powerful levers — they identify as "runners" not "people who run"
- They're already in motion — you're helping them optimize, not start

Creative do's:
- Use the right vocabulary for the specific sport — "VO2 max" for endurance, "1RM" for strength
- Show the product in its actual use environment
- Feature real athletes with real proportions for the sport
- Acknowledge the sacrifice — they respect honesty about what commitment requires

Creative don'ts:
- Imply results that take longer than the ad suggests
- Use any phrase that has appeared in gym motivational posters since 1992
- Feature aesthetic model-type physiques for performance products

---

### 7.5 Parents (28–45)

How to reach them:
- Time and ease are the dominant decision criteria
- Guilt is active in most parenting purchase decisions
- Social proof from other parents is the highest-trust signal
- They are deeply skeptical of safety claims they can't verify

Creative do's:
- Feature real children in real moments — not staged, not too perfect
- Show the parent's emotional response as much as the child's
- Use humor to acknowledge the chaos of parenting — brands that admit it's hard earn instant trust
- Be specific about safety credentials — what was tested, how, by whom

Creative don'ts:
- Use fear as a primary motivator — it works once and builds long-term brand avoidance
- Show idealized parenting
- Underestimate how quickly parents identify when a brand is talking to them vs. marketing at them

---

## SECTION 8: APPROVED VISIONS — REAL PERFORMANCE DATA

### 8.0 CloutKart Client Approved Visions (Actual Results)

These are real creative visions that CloutKart clients approved and that went on to perform. They encode CloutKart's voice — the level of specificity, the emotional approach, and the performance reasoning behind each creative decision.

---

**VISION CK-001: Skincare Brand — Premium Serum**
- Product: Vitamin C Brightening Serum
- Format: UGC Video + Static Carousel
- Hook: "I've tried a lot of serums." [Relatable + Curiosity]
- Result: 3.2% CTR on Reels, 1.8x ROAS for retargeting audience

Creative Vision: Creator wakes up, morning light through curtains. She reaches for the serum on her nightstand — we see her hands, the golden liquid catching the light. Close-up of the droplet on fingertip. She applies it in the mirror (we see her face, glowing skin, no dramatic transformation — just real, healthy). Voiceover: 'I've tried a lot of serums. This one actually does what it says. Day 5 and my skin already felt different.'

Why Client Approved: Real bathroom setting. No before/after claims. Ritual-forward. Felt like a friend recommending, not an ad.
CTA: Tap to shop — link in bio

---

**VISION CK-002: Coffee Brand — DTC Specialty**
- Product: Single Origin Cold Brew Concentrate
- Format: Static + Short Video Loop
- Hook: Visual ASMR pour — no verbal hook, pure sensory
- Result: Highest CTR static of Q1. 4.1% CTR vs 1.2% category benchmark

Creative Vision: Overhead flat lay on warm dark wood. Cold brew bottle, a clean glass with ice, a copper spoon, dried coffee beans scattered naturally. Hand pours concentrate over ice — the dark liquid swirls through. Soft warm light. No text overlay. Just the logo bottom corner and 'Pour. Chill. Taste the difference.' Product shot after.

Why Client Approved: Felt aspirational without being pretentious. The pour created the hook without needing a person.
CTA: Shop now

---

**VISION CK-003: D2C Fashion Brand — Streetwear**
- Product: Oversized Drop-Shoulder Hoodie
- Format: UGC Try-On Video
- Hook: "I actually didn't think it was going to look like this." [Pattern Interrupt + Curiosity]
- Result: 2.9% CTR, highest save rate in campaign history

Creative Vision: Creator films themselves at home in front of a full-length mirror. Opens a matte black package. Pulls out the hoodie — holds it up to camera briefly. Puts it on, turns, adjusts. Says: 'Okay I actually didn't think it was going to look like this.' Shows it styled two ways in under 20 seconds. Ends with 'Link in bio if you want it.' Natural phone audio.

Why Client Approved: Authentic unboxing energy. No forced script. Hook hit the surprise factor. Try-on dual styling drove save rate.
CTA: Link in bio

---

**VISION CK-004: Supplement Brand — Sleep Formula**
- Product: Magnesium + Ashwagandha Sleep Capsules
- Format: Talking-Head UGC
- Hook: "Sleeping 7-8 hours but still waking up exhausted." [Relatable Problem]
- Result: Lowest CPM in the campaign, highest comment engagement

Creative Vision: Creator sits in soft bedroom lighting, 9pm energy, slightly tired. Says: 'I've been sleeping 7-8 hours but still waking up exhausted. Someone in my comments told me to try magnesium. Two weeks in — I actually feel the difference in the morning.' Shows the product briefly, natural endorsement. Ends with: 'Not a miracle but genuinely noticeable.'

Why Client Approved: Realistic claim. Problem-first. Specific improvement without overclaiming. The 'not a miracle' line built massive trust.
CTA: Try it — discount in bio

---

**VISION CK-005: Fitness Brand — Protein Powder**
- Product: Whey Protein — Chocolate Fudge
- Format: Short Video + Carousel
- Hook: "Finally" [Implies years of failed attempts — instantly relatable]
- Result: Best performing carousel of the year. 22% swipe-to-purchase rate

Creative Vision: Creator at gym post-workout, flushed skin, hair tied back. Pulls shaker from bag. Shakes it dramatically. First sip. Genuine expression: 'Okay. That's actually good.' Close-up of the scoop with texture. Voiceover: '25g protein, no chalky aftertaste — finally.' Swipe to carousel: macros card, flavour options card, 'Add to cart' card.

Why Client Approved: Authenticity of post-workout shot. Genuine reaction. No claims beyond nutrition facts. The 'no chalky aftertaste' specificity is credible.
CTA: Swipe to try it

---

**VISION CK-006: Home Brand — Scented Candle**
- Product: Amber & Sandalwood Luxury Candle
- Format: Aesthetic Static + Story Sequence
- Hook: Visual lifestyle with no explicit product pitch — pure emotion sell
- Result: Story sequence drove 38% swipe-up rate on premium audience

Creative Vision: Evening scene. Cream linen tablecloth. The candle lit, flame soft. A glass of wine partially in frame, out of focus. A hand reaches in to adjust the candle — the light catches a ring. Copy: 'For the evenings worth slowing down for.' No hard sell. Product name bottom right. Second story frame: price + shop now.

Why Client Approved: Client said it 'felt like a magazine, not an ad.' The two-step story approach (emotion → offer) drove warm traffic with high intent.
CTA: Shop the collection

---

### 8.1 Complete Vision Samples (Hypothetical — Full Structure)

**Vision 8.1 — Coffee Body Scrub (Skincare, Static)**
- Creative Vibe: Brewed Awakening — the intersection of the morning coffee ritual and caring for your skin.
- Visual Direction: Tight macro of scrub texture — coffee grounds visible in grain, oil catching light at the edges. One hand entering from left, applying directly to forearm. Practical warm window light — no fill. Unforgettable detail: the exact moment the scrub begins to work, texture meets skin and both change.
- Color Story: Mocha Morning (#9B5B1A) — espresso before the milk. Coconut Cream (#EDE8D8) — the clean base. Fresh Brew (#3A2010) — the darkest corner of a coffee bag.
- Hook: "Tan lines are so last season"
- Ad Caption: Coffee grounds don't apologize for working — neither does this scrub. The same bean that restarts your morning removes a week of sun damage in minutes. Skin that never needed a filter was always the plan.
- What We Will Create: (1) Static feed 1080×1080px — macro texture shot with hand in frame. (2) Facebook feed 1200×628px — product on neutral surface. (3) Story 1080×1920px — full-bleed product on espresso-tone background. (4) UGC-style video 9:16 15s — creator shows scrub in bathroom, applies, shows result.

**Vision 8.2 — Wireless Earbuds (Tech, Video + Static)**
- Creative Vibe: Quiet Infrastructure — technology that disappears into your life rather than demanding attention.
- Visual Direction: Side profile of someone at a real desk — one earbud visible, laptop open, glass of water in frame. Late afternoon directional light from window, not corrected. Unforgettable detail: the tiny LED status light on the earbud, barely visible, doing its job without asking for recognition.
- Color Story: Deep Interface (#1C1C1E) — screen in power-save mode. Warm Aluminium (#D8CFC4) — warmth that stops tech from feeling clinical. Focus Blue (#3A5BAA) — confirmed connection, status: working.
- Hook: "The meeting that survived because of these"
- Ad Caption: Three hours of back-to-back calls used to cost something — your patience, your focus, the version of you that exists after 4pm. These earbuds don't just cancel noise; they preserve the person at the other end of the call. The one who doesn't need to recover afterward.
- What We Will Create: (1) Instagram feed 1080×1080px — earbuds on wood desk, morning light. (2) LinkedIn feed 1200×627px — earbuds in professional context. (3) Video 9:16 15s — meeting scenario: chaos → calm with earbuds in. (4) Story 1080×1920px — product close-up with "Noise cancelled." text only.

**Vision 8.3 — Running Shoes (Fitness, Video)**
- Creative Vibe: 5AM Covenant — the before-everyone-else hours when serious athletes train.
- Visual Direction: Low angle from track surface, looking up at laced shoes, pre-dawn. Track fills the frame from foreground to vanishing point. Single hard rim light from left creates deep shadows revealing outsole texture. Unforgettable detail: condensation on the track surface just before dawn.
- Color Story: Pre-Dawn Navy (#0D1B2A) — the sky at 4:58am. Signal Orange (#FF5C1A) — the one color that cuts through darkness. Track Rubber (#2A2A2A) — the ground used before it's appreciated.
- Hook: "Built for the reps nobody sees"
- Ad Caption: Every visible result was built in invisible hours — the 5am runs, the wet track, the empty road. These shoes were designed for those hours specifically, not the ones with an audience. The carbon plate doesn't care if you post it.
- What We Will Create: (1) Video 9:16 30s — 5am morning sequence, product reveal mid-run. (2) Instagram feed 1080×1080px — low angle track shot, pre-dawn. (3) Facebook feed 1200×628px — shoe side profile with motion blur. (4) Story 1080×1920px — shoes on track, "4:59am" in large type.

---

## SECTION 9: PROMPT ARCHITECTURE RULES

**Be specific, not general.** Vague prompts produce generic output. "Skincare brand" produces different output than "vegan coffee body scrub targeting 24-year-old women in Mumbai who spend on their skin but are skeptical of clinical claims."

**Name the enemy.** Every good creative has a clear implicit antagonist — the bad moisturiser, the bad coffee, the fast fashion purchase the reader regrets. Name it and position the product against it.

**The hook is written last, not first.** Write the full creative vision first — vibe, color, visual direction — and let the hook emerge from that context. Hooks written without a creative world are abstract. Hooks written as the summary of a full vision are specific.

**Color names are not descriptors, they are characters.** A color name should tell a story in two words. "Warm Clay" is a descriptor. "Borrowed Earth" is a character. The difference is whether it exists only in the design system or in the real world too.

**The deliverables describe the creative, not just the specs.** "Static image ad — Instagram feed 1080×1080px" is half a deliverable. The full deliverable includes what the shot contains, the light quality, and what makes it distinct from a stock asset.

**One frame, one idea.** If you can remove a visual element from the description and the idea still works, remove it. The best creative has the fewest necessary elements.

**The first line of the ad caption earns the second.** The first sentence lands the hook's promise with a product truth. If the second sentence could be the first — if the first hasn't earned the second — rewrite the first.

**Features ≠ hooks.** "14 days on one charge" is a spec. "Built for people who haven't slept properly in years" is a hook. Generate the hook around the transformation, not the feature.

---

## SECTION 10: MONGODB SEMANTIC CHUNK SCHEMA

This section defines how to convert this document into semantic chunks for MongoDB vector storage. Each chunk is a discrete, searchable unit of creative knowledge.

### 10.1 Chunk Schema Structure

```
Field            Type              Description
_id              ObjectId          Auto-generated MongoDB ID
chunk_id         String            Unique human-readable ID e.g. hook_curiosity_01
section          String            hook | vibe | color_story | visual_direction | approved_vision | category_rule
category         String            skincare, coffee, fashion, food, supplements, fitness, home, jewellery, pet, tech, general
sub_type         String            Hook trigger type, aesthetic name, etc.
format_type      Array<String>     ugc, static, video, carousel, story
target_audience  String            e.g. Women 25-35, Gen Z, budget-conscious buyers
text_content     String            The full text content of this chunk
embedding        Array<Float>      1536-dim vector from OpenAI text-embedding-3-small OR 384-dim from sentence-transformers/all-MiniLM-L6-v2
tags             Array<String>     e.g. ['hook', 'curiosity', 'skincare', 'ugc']
source_doc       String            CloutKart Vision Prompt Library v2.0
created_at       Date              ISO timestamp
version          String            2.0
```

### 10.2 Chunking Strategy

Recommended chunk granularity:
- 1 chunk per hook entry (with trigger, examples, why it works, formats, best-for)
- 1 chunk per vibe/aesthetic (with all attributes including never-use guidance)
- 1 chunk per color story entry (category + palette + rationale + avoid)
- 1 chunk per visual direction entry (product + all visual elements + NEVER Do This)
- 1 chunk per approved vision (full vision + why approved + result data)
- 1 chunk per individual category rule (for fine-grained retrieval)
- 1 chunk per hook trigger framework entry (psychological mechanism + format + examples)

Use overlap chunking: add the category name and section type to every chunk's text_content for better semantic retrieval precision.

### 10.3 Example MongoDB Document — Hook Chunk

```json
{
  "chunk_id": "hook_curiosity_01",
  "section": "hook",
  "category": "all",
  "sub_type": "curiosity_open_loop",
  "format_type": ["ugc", "video", "voiceover"],
  "target_audience": "general — works across categories",
  "text_content": "Hook type: CURIOSITY / OPEN LOOP. Psychological Trigger: Zeigarnik Effect — the brain craves closure on unfinished stories. Why it works: Leaves the viewer in suspense, forcing them to watch until the gap is closed. Best formats: UGC Video, Talking-Head, Story Voiceover. Example hooks: 'There's one thing in your bathroom that expires faster than you think…' | 'I tested 7 skincare serums for 30 days. Only one of them actually did something.' | 'Nobody talks about what happens after you stop taking this supplement.'",
  "tags": ["hook", "curiosity", "open_loop", "ugc", "video", "zeigarnik"],
  "source_doc": "CloutKart Vision Prompt Library v2.0",
  "created_at": "2026-05-31T00:00:00Z",
  "version": "2.0"
}
```

### 10.4 Example MongoDB Document — Category Rule Chunk

```json
{
  "chunk_id": "rule_skincare_01",
  "section": "category_rule",
  "category": "skincare",
  "sub_type": "creative_rule",
  "format_type": ["all"],
  "target_audience": "skincare buyers, beauty audience",
  "text_content": "Category: SKINCARE. Rule: NEVER show a before/after split image. Show the ritual, the texture, the habit instead. Rationale: Facebook policy risk. More effective to sell aspiration than proof in beauty category. Always anchor claims in skin concern, not cure: say 'visibly brighter' not 'treats hyperpigmentation'. Show the formula in action — serum drops, cream being applied. Use real skin with pores — hyper-retouched skin destroys trust.",
  "tags": ["rule", "skincare", "before_after", "creative_rule", "policy", "ugc"],
  "source_doc": "CloutKart Vision Prompt Library v2.0",
  "created_at": "2026-05-31T00:00:00Z",
  "version": "2.0"
}
```

### 10.5 Example MongoDB Document — Approved Vision Chunk

```json
{
  "chunk_id": "approved_vision_ck001",
  "section": "approved_vision",
  "category": "skincare",
  "sub_type": "ugc_video",
  "format_type": ["ugc", "carousel"],
  "target_audience": "skincare buyers, women 25-35",
  "text_content": "Approved Vision CK-001: Vitamin C Brightening Serum. Format: UGC Video + Static Carousel. Hook: 'I've tried a lot of serums.' Trigger: Relatability + Curiosity. Result: 3.2% CTR on Reels, 1.8x ROAS. Creative: Creator wakes up in morning light, reaches for serum, shows golden liquid in natural light, applies in mirror on real skin with no dramatic transformation. Voiceover: 'This one actually does what it says. Day 5 and my skin already felt different.' Why it worked: Real bathroom setting, no before/after claims, ritual-forward, felt like peer recommendation not ad.",
  "tags": ["approved_vision", "skincare", "ugc", "relatable_hook", "high_ctr", "ritual"],
  "source_doc": "CloutKart Vision Prompt Library v2.0",
  "created_at": "2026-05-31T00:00:00Z",
  "version": "2.0"
}
```

### 10.6 Embedding Model Note

The existing `prompt_chunks` collection in MongoDB Atlas uses **384-dim embeddings** from `Xenova/all-MiniLM-L6-v2` (via the Pixie Discord bot).

For this new `vision_chunks` collection, you can choose:
- **384-dim** (all-MiniLM-L6-v2 via HuggingFace API) — compatible with same vector index type, lower cost
- **1536-dim** (OpenAI text-embedding-3-small) — higher quality retrieval, separate index

If using both collections in the same cluster, create separate vector indexes for each. Do not mix embedding dimensions in a single collection.
