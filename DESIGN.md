# Design

## Theme

Light and dark, user-toggleable. Dark is the default; the choice follows the OS
`prefers-color-scheme` on first visit and is then remembered in `localStorage`
(`ck-theme`). The theme is applied to `<html data-theme="light|dark">` by a tiny
blocking script in `index.html` before first paint (no flash), and managed at
runtime by `src/context/ThemeContext.tsx` with a toggle in the navbar
(`src/components/ThemeToggle.tsx`).

Colors are driven entirely by CSS custom properties (semantic tokens) declared in
`src/index.css`. Channel vars (space-separated RGB) are the single source of
truth; light mode re-declares only the channels and every composed token
re-resolves automatically. Tailwind's `white` is remapped to `--white-rgb`, so
the many existing `text-white` / `bg-white/[x]` / `border-white/[x]` utilities
flip with the theme for free.

Overall aesthetic is glass-on-surface: semi-transparent cards with backdrop blur.
**Product mockups** (Hero "Our Vision" card, the Pixie dashboard preview, the
ScrollStory ad phone) and the **footer** are pinned to dark in both themes via a
nested `data-theme="dark"` scope, so they read as dark-app screenshots regardless
of page theme. The `/dashboard` and `/admin` app routes are likewise pinned dark.

## Color Palette

Brand accent is a single **committed violet** (no more purple→blue→cyan rainbow).
Tokens (dark / light):

| Role | Token | Dark | Light |
|---|---|---|---|
| Canvas | `--bg` | `#080808` | `#FBFBFD` |
| Elevated surface | `--bg-elev` | `#0E0E10` | `#FFFFFF` |
| Overlay base (`white`) | `--white-rgb` | `255 255 255` | `24 22 32` |
| Surface fill | `--surface` | white 4% | ink 4% |
| Border | `--border` | white 10% | ink 10% |
| Ink (headings) | `--ink` | `#F5F0EB` | `#16151A` |
| Ink body | `--ink-body` | `#D1D5DB` | `#3A3844` |
| Ink muted | `--ink-muted` | `#9CA3AF` | `#635F70` |
| Accent | `--accent` | `#7C3AED` | `#6D28D9` |
| Accent (as text) | `--accent-ink` | `#C084FC` | `#5B21B6` |
| On-accent | `--accent-contrast` | `#FFFFFF` | `#FFFFFF` |
| Success | `--success` | `#10B981` | `#059669` |

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
| Display / headings | **Archivo Expanded** | 600–800 | Wide, industrial, motorsport-signage confidence. `letter-spacing: -0.02em`. |
| Body | **Hanken Grotesk** | 400–600 | Refined, legible workhorse. |
| Labels / metrics | **DM Mono** | 400–500 | Eyebrow pills + tabular figures for numbers (`font-variant-numeric: tabular-nums`). |
| Buttons | Hanken Grotesk | 600 | (Removed the never-loaded `Bricolage Grotesque` reference.) |

Loaded via one Google Fonts `@import` in `src/index.css`.

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
