# Design

## Theme

Dark mode only. Background: `#080808` (near-black with a 28px dot grid texture). The overall aesthetic is glass-on-dark: semi-transparent surfaces with backdrop blur floating on the deep background. Brand accent is a purple-blue-cyan gradient (current) — used for interactive elements and key emphasis moments.

## Color Palette

| Role | Value | Notes |
|---|---|---|
| Background | `#080808` | Base canvas |
| Surface | `rgba(255,255,255,0.04)` | Glass card fill |
| Border | `rgba(255,255,255,0.10)` | Default card border |
| Border subtle | `rgba(255,255,255,0.06)` | Section dividers |
| Ink primary | `#FFFFFF` | Headings |
| Ink body | `#D1D5DB` | Body text |
| Ink muted | `#9CA3AF` | Supporting text |
| Ink dim | `rgba(255,255,255,0.20)` | Tertiary / disabled |
| Brand purple | `#A855F7` | Primary accent |
| Brand blue | `#3B82F6` | Secondary accent |
| Brand cyan | `#06B6D4` | Tertiary accent / data |
| Brand gradient | `135deg, #A855F7 → #3B82F6 → #06B6D4` | Buttons, gradient text |
| Success | `#10B981` | Status indicators |

**Current problem**: Brand gradient is applied to gradient-text in 19+ instances across all sections. It should be a rare, intentional accent — not a default text treatment.

## Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / H1 | Sora | 700 | clamp(2.6rem, 6vw, 4.75rem) |
| H2 | Sora | 700 | clamp(2.2rem, 5vw, 4rem) |
| H3 | Sora | 700 | 1.5rem |
| Body | DM Sans | 400–500 | 1rem (16px) |
| Label / mono | DM Mono | 400–500 | 10–13px |
| Button | Sora | 600 | 14px |

**Current problem**: Both Sora and DM Sans are on the impeccable reflex-reject list. Font replacements are determined by `/impeccable typeset`.

**Line height**: Body 1.8, headings 1.04–1.06, labels 1.0.
**Letter spacing**: Headings −0.03em, labels +0.08–0.16em.

## Components

**glass-card**: `bg rgba(255,255,255,0.04)`, `backdrop-filter blur(24px) saturate(180%)`, `border rgba(255,255,255,0.10)`, `border-radius 20px`, `box-shadow: 0 0 0 1px rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.45)`.

**btn-primary**: Gradient background (purple→blue→cyan), white text, 100px border-radius, 14px Sora, hover lift (-4px translateY + shadow).

**btn-secondary**: Ghost, `backdrop-filter blur(12px)`, white border/text, same radius.

**eyebrow-pill**: `background rgba(168,85,247,0.1)`, `border rgba(168,85,247,0.2)`, `border-radius 100px`, uppercase 11px, color `#C084FC`.

**gradient-border-wrap**: Gradient border wrapper using `::before` pseudo-element with gradient background and 1px inset.

## Animations

**Scroll-triggered entrance**: `.reveal` (translateY 22px → 0, opacity 0→1, 0.6s ease) and `.reveal-scale` (scale 0.94→1) — triggered by IntersectionObserver adding `.visible` class. **Current problem**: Applied to every element in every section, creating the "uniform AI reflex" pattern.

**Float**: `.animate-float` (5s, −8px vertical), `.animate-float-slow` (7s, −12px) — used on VisionPreview floating cards.

**Marquee**: Single row, 40s linear — `animate-marquee`.

**Custom cursor**: 3-layer (dot 8px, ring 32–56px, aura) with 5 states, RAF-driven lerp.

**Loading screen**: Progress bar fill + logo + "Loading" text.

**Missing**: `prefers-reduced-motion` support. No reduced-motion fallbacks anywhere.

## Layout

Max width: `max-w-7xl` (1280px) with `px-4 sm:px-6 lg:px-8`.

Section rhythm: `py-20 md:py-36` for most sections.

Grid: `lg:grid-cols-2` for hero, `sm:grid-cols-3` for feature grids, `md:grid-cols-[1fr_auto_1fr]` for pricing.

Z-index scale: `z-0` (orbs) → `z-10` (relative content) → `z-50` (navbar) → `z-9999` (loading screen). **Problem**: `z-9999` is an arbitrary value; should be a semantic token.
