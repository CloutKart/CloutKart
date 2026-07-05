# Design

## Theme

Light and dark, user-toggleable. **Light is the default**; the theme is not tied to
the OS `prefers-color-scheme` — first visits open light and only an explicit user
toggle (remembered in `localStorage` `ck-theme`) switches to dark. The theme is
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
Headline **"Creation, / Reimagined."** in Gasdrifo sits *behind* the hands (3D depth);
background is the site grid + TelemetryFrame (`.hero-static` is transparent so both
show through). Signature effect: only the **botanicals bloom + move**. `hero-vines.webp`
is a chroma-extracted "colored vines/flowers only" layer (the hand stays gray); its
opacity fades in on approach (colorize) and it gently **sways** (`hero-vine-sway`,
pivoted at the vines so dangling flowers move most) — a cheap GPU transform, the hand
never moves. Both hands get a theme-aware **backing halo** (soft dark on light, a
**violet-tinted** glow on dark that ties into the accent) so they separate from the canvas. Desktop-only sway; `prefers-reduced-motion`
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
