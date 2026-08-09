# Design

## V3 — "The Drawing Sheet" (current)

The offering is **automating and optimising the creative production process**, so the
site is the **plan for a production line**: a numbered set of drawing sheets, hairline
schematics, dimension lines, and title blocks. The V2 Renaissance world below is
superseded on the landing page.

**The one semantic rule, enforced in every mark:**

> **Graphite hairline = a human decides. Violet = the machine executes.**

Nothing is violet for decoration. It is what makes "four of six stations run themselves"
legible before a label is read, and it continues V2's `.ws-graphite` / `.ws-trace` motif
(an ink line a machine trace catches up to and completes), which survived the switch.

**The switch was largely a promotion, not a rewrite.** `TelemetryFrame.tsx` already drew
registration crosshairs, ruler ticks, and mono coordinates off
`--frame-line/tick/mark/label`; V3 makes that vocabulary the primary system.

### The sheet set

Seven numbered sheets. The number appears in the section eyebrow, in the section's title
block, and in `MarginIndex.tsx` — all three must agree, because the cross-reference is the
whole point of numbering them.

| # | id | Section | File |
|---|---|---|---|
| 01 | `about` | The Offering — production spec + stage allocation | `About.tsx` |
| 02 | `assembly` | **The Assembly** — the centrepiece circuit | `ProductionLine.tsx` |
| 03 | `pixie` | The Engine | `PixieSection.tsx` |
| 04 | `story` | The Run | `ScrollStory.tsx` |
| 05 | `services` | The Scope | `Services.tsx` |
| 06 | `process` | The Stations (Sheet 02 at 1:1) | `Process.tsx` |
| 07 | `portfolio` | The Gallery | `Portfolio.tsx` |

Removed in revision 2: the message manifesto, the standalone optimisation-loop section,
the patron roster, and the testimonial sign-off sheets. Their CSS went with them.

### Sheet 02 — The Assembly

The page's one big drawing, and the section everything else defers to. Six stations on a
rail, **closed into a circuit** by a routed return track that carries campaign signal back
under the line to re-brief the next run. (The loop used to be its own section; folding it
in is what makes this a circuit rather than a line with two dead ends, and it is also why
the job token never stops.)

Honest flowchart grammar: a **rectangle is a process the machine runs**, a **diamond is a
decision a person makes**, and a rail segment is graphite only when it *ends* at a gate.
Branch endpoints are labelled individually, set vertically (`rotate(90)`) so six fit under
one station — a vertical callout is native to drawings, not a workaround.

Motion, all anime.js v4:

- The job token travels each leg, lands with an `outElastic` pop, and fires a `.pl-ping`
  ring off the station. Auto stations get a short beat; **gates hold ~4× longer and throb**,
  because a gate is exactly where a real job waits on a person.
- `.pl-glow` duplicates every rail segment and the return leg and is drawn `0 → 1` in step
  with the token crossing it, so the circuit lights up behind the job and resets at the top
  of each lap. This is the single biggest step from "diagram" to "line that is running".
- The return leg is one fast unbroken run — no station beats on the way back.
- **The detail panel auto-advances with the token**, so a visitor who touches nothing still
  reads all six stations. Any hover, click, or focus hands control over permanently for that
  page view; the token keeps circling but stops driving the panel.
- The reveal is kept to ~1.6s on purpose: a long entrance means staring at a half-drawn
  sheet before the thing that sells it has started.

### Sheet 07 — The Gallery

The coverflow corridor carries three things beyond the artwork:

- **A notes panel bolted to the plate's right edge.** It lives *inside* the transformed
  plate, so it tilts and scales with the frame rather than floating over it, and its copy
  types itself out when the work comes into preview. The plate and panel centre as one
  unit via `--gallery-panel-shift` (half the panel width, applied to every plate);
  `--gallery-panel-shift` is forced to `0px` when the active work has no copy, so a work
  without a panel still centres exactly as before. Spacing went 232 → 300px: fully
  clearing plate +1 would need ~570px, which flattens the coverflow into a flat row, so
  the tail of the queue is allowed to recede *behind* the panel instead. Mobile has no
  side panel — the copy stacks under the plate, above the plaque.
- **Video works.** `portfolio_sections.video_url` non-empty means the work is a video;
  `thumbnail_url` stays as its poster. Muted, looping, no controls, no audio by contract.
  **Only the plate in preview plays** — several simultaneous decodes behind 3D transforms
  is what makes a coverflow stutter — and `muted` + `playsInline` are both required or iOS
  refuses to autoplay at all.
- **Ambient light projected from the artwork itself.** A copy of the media sits behind the
  active plate, bleeding past its edges, scaled up and blurred — the way YouTube's ambient
  mode works. For stills that is just an `<img>` and needs no JS at all; for video it is a
  48px-wide `<canvas>` repainted **per decoded frame** via `requestVideoFrameCallback`
  (falling back to rAF). Because it is the picture rather than an average of it, it is
  continuous by construction and its colour lines up with the artwork's own edges.

  **It carries no `blur()`.** Two jobs were being done by one expensive filter — softening
  the interior and feathering the edges — and only the second was hard. The interior is free
  (a 14px source scaled ~65× *is* the blur); the edges are a radial **mask**, a composite
  rather than a convolution. Measured per video frame under software rendering against a
  ~17ms floor: `blur(96px)` cost ~72ms/frame (~14fps), `blur(26px)` ~48ms, none ~39ms.
  Throttling the repaint to 15fps saved **nothing** — a large semi-transparent layer over a
  playing video is re-composited every video frame regardless of whether its contents
  changed, so the cost tracks AREA, not paint rate. Which is also why the spread is
  generous: −30% and −70% both measure ~38ms, so a timid glow would cost the same.
  `inset` is the one number to turn down if it ever needs to be cheaper.

  **This replaced a sampler that averaged the frame to one colour every 500ms.** That
  approach was visibly stepped and lagged the footage — no amount of easing fixes polling a
  scalar at 2Hz. Measured on a continuous hue-sweep clip, the projection produced 23 distinct
  values across 24 samples taken 80ms apart, with the longest identical run being 160ms (the
  clip's own frame cadence); the old poll would have shown runs of ~6.

  **It also removed a real risk.** `drawImage()` from a cross-origin video is allowed —
  only `getImageData()` is blocked. Dropping the pixel read dropped `crossOrigin="anonymous"`
  with it, and with it the failure mode where a host without CORS headers stopped the clip
  loading at all. Nothing in the gallery reads pixels back any more.

  `accent_hex`, still sampled at upload by `src/lib/dominantColor.ts`, now drives only the
  corridor's broad room wash and the admin swatch. **This remains the one place a non-token
  hue is allowed** (DESIGN.md: violet means automated, never decoration): the rule is that
  the colour is the artwork's own light in the room, and all chrome stays on tokens.

The corridor itself is a **drawing sheet**, not the V2 dark museum room it used to be:
grid paper (the same `.bp-grid` as Sheet 02), the plate's measured pixel size stated as a
`.bp-dim` dimension line, a `.bp-titleblock` in the notes panel, a numbered plate register
in place of dots, and four focus marks that lock onto whichever plate is centred. The
museum devices — drifting dust motes and perspective vanishing-point guides — are gone.

Traps paid for here:

- **`.gallery-vignette` was painting an opaque box.** It ramped to solid `var(--bg)` from
  38% outward, washing most of the corridor in flat near-black, blocking the page's ambient
  and reading as a dark rectangle bounding the whole section. It is now a *horizontal* fade
  capped at `0.82` alpha, which still finishes off plates sliding past the clipped edges
  (they are already at ~42% opacity by then) without sealing the section off. It cannot
  simply be deleted — without it the plates hard-clip. Measured either side of the corridor
  edge: worst-case channel delta went from a visible box to ≤ 7/255.
- **The focus marks are positioned from a measured rect**, not from re-deriving the
  coverflow's 3D transform. Two sources of truth for one position drift apart. They track
  the plate with rAF for ~750ms because the plate transition is 600ms, so the marks follow
  it in rather than teleporting; under reduced motion that transition is disabled, so the
  first frame is already final and no special-casing is needed.
- **Plates hang at a constant height and take their width from the media's own ratio**, the
  way work is hung on a wall. `--art-ratio` is set per plate from the loaded media, so a
  9:16 upload gets a 9:16 frame and the dimension label under it is never a lie. The plate
  dimension is read off the media (`naturalWidth` / `videoWidth`) — no admin field, and it
  cannot disagree with the file.
- **The focus marks need a ResizeObserver, not just the rAF tracking loop.** The plate
  resizes *after* the 750ms window closes — the media loads, its ratio lands on
  `--art-ratio`, and the frame width changes underneath the marks, leaving them ~11px wide
  on each side. Observing the frame catches that without polling forever.
- **`.gallery-dim` is positioned out of flow.** In flow it added its own height to
  `.gallery-plate`, and the panel's `height: 100%` then overshot the bottom of the artwork
  by exactly that much.
- The corridor is now a deliberate, outlined viewing box. That is what licenses the much
  stronger artwork tint inside it: once the boundary is intentional, a tinted interior
  reads as the light in a lightbox rather than as the accidental seam it used to be.
- `.gallery-register-item` sits on `--ink-muted` for the same 4.5:1 reason as everything
  else on this page.

- **Sample the colour in the admin, from the local `File`** — never from the published
  Supabase URL in a visitor's browser. Painting a canvas from a cross-origin image taints
  it and `getImageData` throws.
- **Discard near-black, near-white and near-grey pixels before bucketing.** They dominate
  the raw counts (paper, shadow, background) and average out to a muddy beige that says
  nothing about the artwork.
- **The ambient gradient has to fade out inside the corridor.** The corridor is
  `overflow: hidden`; an ellipse wider than its box gets sliced into a visible rectangle
  of lighter ground.
- **The gallery fetch degrades on its own.** It selects the new columns and falls back to
  the original list if they are missing, because an unapplied migration would otherwise
  error the query and blank the whole section.
- `.gallery-panel-eyebrow` sits on `--ink-muted`: `--ink-dim` measured 3.99:1 against the
  panel's `--bg-elev`, and small uppercase text needs 4.5.

### Kit (`src/index.css`, `/* ── BP: the drawing sheet ── */`)

- `.bp-sheet` — corner registration brackets implying a sheet; `--bp-sheet-inset` tunes the
  offset. `.bp-sheet--ruled` adds the hairline border.
- `.bp-titleblock` — the registrar device, **replaces `.accession`** as the stamp.
- `.bp-dim` / `.bp-dim-line` / `.bp-dim-text` — dimension lines; the page's numeric device.
- `.bp-tag` / `.bp-tag--auto` — the AUTO vs GATE badge.
- `.bp-margin-note` — a pencilled revision note; replaced the parchment slips.
- `.bp-grid` — masked grid paper, under Sheet 02 only.
- `.bp-rail`, `.bp-station-mark`, `.bp-fan-label`, `.bp-token`, `.pl-glow`, `.pl-ping`,
  `.bp-focus-ring` — schematic primitives.

### Traps, all of them paid for once already

- **`svg.createDrawable` takes ONE targets param, not varargs.** Spreading paths into it
  silently registers only the first, so the rest never animate.
- **`.bp-rail` must carry no `stroke-dasharray`.** `createDrawable` drives that property
  itself; a CSS dash pattern gets overwritten mid-draw.
- **Violet alpha has to be per-theme.** `--bp-auto-line` is 0.9 on the light canvas and 0.6
  on the dark one; a single shared alpha either vanishes on light or glares on dark.
- **`--ink-dim` is only 4.14:1 on `#080808`.** The label ramp `--bp-label` therefore sits on
  `--ink-muted` (7.9 dark / 6.9 light). `--frame-label` is ~3:1 and is chrome ONLY.
- **Chromium does not match `:focus-visible` on an SVG `<g tabindex="0">`.** The station
  focus ring uses plain `:focus`.
- **Do not put `aria-hidden` on an SVG containing focusable children** — it pulls the
  stations out of the a11y tree entirely. Sheet 02's SVG is `role="group"` + `aria-label`,
  with decorative paths individually hidden.
- An animated `feTurbulence`/`feDisplacementMap` on a hero-sized element measured ~2 fps.
  SVG filter animation is not viable here; use transforms and stroke drawing.

### Numbers discipline

Only figures the site already claimed may appear: `48h`, `500+ brands`, `+284% ROAS`,
`8.4% CTR`, `10.2× ROAS`, `4.1% CVR`, `6 formats`, `4 placements`, `6 stations`. No invented
before/after comparisons, no fabricated per-stage timings, no "% of handoffs removed". Where
a diagram needs a shape rather than a value it shows structure. Pricing states **capacity,
never a price** — the page has never shown a rupee figure.

Charts follow the same discipline: CTR, ROAS, and CVR **share no scale and have no natural
maximum**, so they render as stat readouts, never meter bars. The V2 `AdScene` bars were
removed for exactly that reason — their fill fractions implied a denominator that does not exist.

### Motion contract

Every schematic ships its **finished** state in the markup; the timelines only animate state
that is already complete. Reduced motion therefore needs no fallback branch — just an early
return in the effect plus `display: none` on `.bp-token`, `.pl-glow`, and `.pl-ping`.


## V2 — "The Second Renaissance (2045)" (superseded on the landing page)

The site is an **artifact recovered from a second Renaissance, dated 2045** — the year
human creativity and AI stop competing and start collaborating. The hero is the founding
myth (first contact); everything after it is the archive. 2045 is **never explained** —
it surfaces only through stamps, coordinates, and accession numbers.

Rules (all sections, both phases):

- **Dark is home base** (the 2045 workshop). Parchment/cream appears only as *objects
  inside* the dark room (`.artifact`), never as full-bleed section backgrounds — and every
  artifact carries a faint **purple edge-bleed** (ink and circuitry share the page).
- **Purple is reserved for AI/execution** — if purple shows up, something intelligent is
  happening. Never decorative.
- **Serif = authored** (`.font-authored`, Cormorant Garamond: headlines, plaques, letters);
  **sans = read** (Hanken: body, UI, metadata). NCL Gasdrifo stays hero-only (licence).
- **Motion is archival**: revealed / unrolled / lit. No SaaS easing, no bounce (the one
  exception is the hero's settle). Soft-landing curve: `cubic-bezier(.16,1,.3,1)`.
- Vines/botanicals are the collaboration motif — hero-only unless a section earns one use.

Kit (global devices, `src/index.css` V2 block + components):

- `.artifact` — parchment object in the dark room (cream literals + purple edge-bleed).
- `.accession` — registrar catalog tag, `No. 047 · 2045`, same position on every artifact.
- `MarginIndex.tsx` — roman-numeral chapter marks I–VII at the right viewport edge;
  purple when current; click-to-navigate. Desktop only.
- Ambient drifting film grain (`.noise-overlay` + `grainDrift`), near-subliminal, dark only.
- Per-section cursor tools via `data-cursor-zone` on sections (`nib` = Workshop,
  `loupe` = Gallery), implemented as states in `CursorGlow.tsx`.
- 2045 easter eggs: TelemetryFrame's `CAT · 20.45` registrar mark; "ANGELO" stays engraved
  in the hero art. Max one Latin word per section.

Phase 1 (built): dark default, the kit, **The Workshop** (`Process.tsx` — sketchbook
entries; a graphite stroke drawn on reveal that a purple schematic trace catches up to;
hover re-draws the trace) and **The Gallery** (`Portfolio.tsx` corridor reframed as
recovered artifacts: accession tags, exhibit-label plaque with the single quiet
"Cataloged 2045" line, museum-light hover, loupe detail crop under the cursor).

Phase 2 (built): **The Muse** (`PixieSection` — serif archive voice; an idle-cursor margin
note quietly appears, evidence Pixie is still thinking); **The Ledger** (`ScrollStory` —
roman entries I–IV + the site's ONE literal date device, the `REG · 14 VI 2045` registrar
stamp); **The Patrons** (`Patrons.tsx` — letterpressed names in a stone slab, dust-puff on
hover, placeholder names); **The Correspondence** (`Testimonials.tsx` — parchment letters
with drop caps, blurred signatures under violet wax seals pressed with a faint circuit;
hover lifts the seal); **Performance** (hero stats are carved, no count-up — one chisel
flash on entry); **CTA** ("Begin Your Masterpiece." + a slow breathing glow on the button);
`.drop-cap` illuminated initials (About lead + letters). Still deliberately unbuilt: the
wax-seal scroll transition (global scroll-feel change — needs its own approval).

## Theme

Light and dark, user-toggleable. **Dark is the default** (V2: the 2045 workshop is home
base); light survives as "Concept" mode. The theme is not tied to the OS
`prefers-color-scheme` — first visits open dark and only an explicit user
toggle (remembered in `localStorage` `ck-theme`) switches to light. The theme is
applied to `<html data-theme="light|dark">` by a tiny
blocking script in `index.html` before first paint (no flash), and managed at
runtime by `src/context/ThemeContext.tsx` with a toggle in the navbar
(`src/components/ThemeToggle.tsx`).

Colors are driven entirely by CSS custom properties (semantic tokens) declared in
`src/index.css`. Channel vars (space-separated RGB) are the single source of
truth; light mode re-declares only the channels and every composed token
re-resolves automatically. Tailwind's `white` is remapped to `--white-rgb`, so
the many existing `text-white` / `bg-white/[x]` / `border-white/[x]` utilities
flip with the theme for free.

Overall aesthetic is glass-on-surface. In **light** mode the canvas is a crisp
near-neutral gray and cards are pure white — separation comes from crisp borders +
defined, violet-tinted shadows (high-contrast editorial), not a tinted canvas.

**Product mockups** (Hero "Our Vision" card, the Pixie dashboard preview, the
ScrollStory scenes) are **theme-aware**: their chrome (panels, inputs, browser bar,
phone screen) uses tokens and renders as light UI on the light page / dark UI on
the dark page. Only *intrinsic content* stays fixed: the extracted coffee color
swatches, the Instagram brand gradient, and the coffee **ad-creative image** (whose
overlaid hook text is pinned `data-theme="dark"` to stay legible over the dark
image). Because the real `/dashboard` and `/admin` app is dark-only (still pinned
dark), a light dashboard mockup is a marketing illustration, not a literal
screenshot. The **footer** stays a deliberate full-width dark anchor band in both
themes.

## Color Palette

Brand accent is a single **committed violet** (no more purple→blue→cyan rainbow).
Tokens (dark / light):

| Role | Token | Dark | Light |
|---|---|---|---|
| Canvas | `--bg` | `#080808` | `#F2F2F6` |
| Elevated surface / cards | `--bg-elev` | `#0E0E10` | `#FFFFFF` |
| Overlay base (`white`) | `--white-rgb` | `255 255 255` | `20 19 26` |
| Surface fill | `--surface` | white 4% | white (cards) |
| Border | `--border` | white 10% | ink 14% (crisp) |
| Ink (headings) | `--ink` | `#F5F0EB` | `#111016` (near-black) |
| Ink body | `--ink-body` | `#D1D5DB` | `#2C2A35` |
| Ink muted | `--ink-muted` | `#9CA3AF` | `#52505F` (~7:1) |
| Ink dim | `--ink-dim` | `#6B7280` | `#6C6A79` (~4.7:1) |
| Accent | `--accent` | `#7C3AED` | `#6D28D9` |
| Accent (as text) | `--accent-ink` | `#C084FC` | `#5B1FB0` |
| On-accent | `--accent-contrast` | `#FFFFFF` | `#FFFFFF` |
| Success | `--success` | `#10B981` | `#048960` |

All foreground/background pairs meet WCAG AA (body ≥ 4.5:1, large ≥ 3:1) in both
themes.

**Resolved:** the brand gradient is no longer a default text treatment. The
`.gradient-text*` classes now render a single solid `--accent-ink`; the rainbow
gradient is gone from buttons, borders, cursor, and scroll bar. Portfolio avatar
gradients were moved off the purple/blue/cyan tells.

## Typography

Reflex-reject fonts (Inter, Montserrat) replaced with a distinctive pairing:

| Role | Font | Weight | Notes |
|---|---|---|---|
| Hero display | **NCL Gasdrifo** | 400 | Elegant high-contrast serif (Enxyclo Studio) — hero headline / eyebrow / subcopy (`.font-gasdrifo`). Self-hosted `@font-face` (`/fonts/NCLGasdrifo.woff2`). *Demo weight — needs the paid license before production.* |
| Display / headings | **Archivo Expanded** | 600–800 | Wide, industrial. Site-wide `h1–h6`. `letter-spacing: -0.02em`. |
| Body | **Hanken Grotesk** | 400–600 | Refined, legible workhorse. |
| Labels / metrics | **DM Mono** | 400–500 | Tabular figures for numbers (`font-variant-numeric: tabular-nums`). |
| Buttons | Hanken Grotesk | 600 | (Removed the never-loaded `Bricolage Grotesque` reference.) |

Google fonts via one `@import`; NCL Gasdrifo via a self-hosted `@font-face` — both in
`src/index.css`.

## Components

**glass-card**: `--glass-bg`, `backdrop-filter blur(24px) saturate(180%)`,
`--glass-border`, radius 20px, `--shadow-card`. Noise texture and the `::after`
grain are hidden in light mode.

**btn-primary**: single-hue vertical violet gradient (`--accent-strong` →
`--accent`), `--accent-contrast` text, 100px radius, hover lift + brightness.

**btn-secondary**: ghost — `--surface-strong` fill, `--border-strong`, `--ink` text.

**eyebrow-pill**: `--accent-soft` bg, `--accent-border`, uppercase 11px **DM Mono**,
`--accent-ink`.

**ThemeToggle**: 44×44 round button, Sun/Moon crossfade + rotate, `role="switch"`.

**Navbar** (`src/components/Navbar.tsx`): a **notch → pill**. At the hero it's flush
to the top edge (square top, rounded bottom = a notch); on scroll it detaches into a
floating rounded pill (`margin-top`, `border-radius`, `border-top-color`, shadow all
animate together, ~480ms ease-out-quint — no `border-width` jump). Desktop shows the
full bar; **mobile uses a radial fan**: a round FAB whose links cascade out from it
(vertical spacing + gentle leftward drift so labels never overlap), staggered, with a
scrim, Esc-to-close, and a `prefers-reduced-motion` fade fallback (`.radial-item`).

**TelemetryFrame** (`src/components/TelemetryFrame.tsx`): the light-theme "surface" —
an inset hairline rectangle, corner registration crosshairs, edge ruler ticks
(`repeating-linear-gradient`), and monospace coordinate labels. Token-driven
(`--frame-line/tick/mark/label`), rendered in both themes; the light dot-grid is
dropped (`--dot-color: transparent`) so the frame carries the surface.

**Hero** (`src/components/Hero.tsx`): a "Creation of Adam" composition — a static
grayscale **etched human hand** (wrapped in vines/flowers) reaching a violet
**CLOUTKART robot hand**, from transparent WebP halves that span full-bleed and
**approach** on scroll (`--hero-p`, published in a rAF scroll handler; no re-render).
Headline **"Creation, / Reimagined."** in Gasdrifo sits *behind* the hands (3D depth).
The forearm used to swallow the "Re" so the word read as *"imagined."* The fix is
composition, not effects: the block is pushed up hard (`sm:pt-[max(4.8rem,8.5vh)]`) and
the face is a little larger (`clamp(3.9rem, 11.6vw, 9.6rem)`). Note the two pull against
each other — a bigger face makes line 1 taller, which pushes line 2 back *down* into the
arm — so the size bump is modest and the upward push does the work. The rem floor in the
padding is load-bearing: pure `vh` collides with the 60px navbar on short viewports.

The artwork's `top` is `max(55%, calc(28.14vw + 90px))` for the matching reason. The wrap
is centred, and its height is width-driven (100vw × 1882/3344 ≈ 56.28vw, hence the 28.14vw
half), so a bare `55%` lets the art ride UP as the window gets shorter: at 1440×700 the
forearm climbed back over the headline. The floor pins the art's top edge near 90px —
where it already lands at 1440×900 — so the headline/artwork relationship no longer
depends on window height. Verified constant across 1440×900, 1440×700 and 1280×800.

Two rejected approaches, both recorded so they are not re-attempted: a `mix-blend-mode:
multiply` "x-ray echo" (a duplicate headline printed onto the hand), and a `backdrop-filter`
"spotlight pool" (a feathered ellipse dimming the art behind the type, which required the
headline to move in front of the hands and so gave up the overlap).

Background is the site grid + TelemetryFrame (`.hero-static` is transparent so both
show through). Signature effect: only the **botanicals bloom + move**. `hero-vines.webp`
is a chroma-extracted "colored vines/flowers only" layer (the hand stays gray); its
opacity fades in on approach (colorize) and it gently **sways** (`hero-vine-sway`,
pivoted at the vines so dangling flowers move most) — a cheap GPU transform, the hand
never moves. Separation from the canvas is theme-aware: in **light** both hands get a
soft dark backing halo. In **dark** the human hand has **no** halo — instead a blurred
copy of `hero-vines.webp` sits behind the crisp vines (`.hero-vines-glow`) and fades in
on the same colorize curve, so each botanical **glows its own colour** (green vine →
green, buds → their hue); the robot keeps a violet halo. Desktop-only sway; `prefers-reduced-motion`
shows colored botanicals, static. A tried-and-rejected animated `feTurbulence`/
`feDisplacementMap` "ripple" was ~2 fps — SVG filter animation on a hero-sized element
is not viable; use transforms.

## Animations

Scroll-triggered `.reveal` / `.reveal-scale` / `.reveal-clip` (IntersectionObserver
adds `.visible`). **Hardened:** a safety net in `App.tsx` force-reveals any strays
after 2.5s, so content can never ship blank to headless renderers, SEO crawlers, or
background tabs.

`prefers-reduced-motion: reduce` is fully respected: a global rule collapses
transitions/animations to instant, and reveals default to visible.

Float, marquee, orb-drift (disabled on mobile), custom 3-layer cursor, loading
screen. Accent-dependent effects (cursor, glows, border-pulse) use `--accent` and
adapt per theme.

## Layout

Max width `max-w-7xl` (1280px), `px-4 sm:px-6 lg:px-8`. Section rhythm
`py-20 md:py-36`. Z-index scale: content `z-10` → navbar `z-50` → scroll-progress
`z-90` → loading screen `z-100` (cursor layers sit above as an overlay system).
