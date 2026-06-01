import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const DEFAULT_SEED = '#A855F7';

// ─── Color math ──────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

interface Palette {
  p:       [number, number, number];
  pDim:    [number, number, number];
  pSur:    [number, number, number];
  pBorder: [number, number, number];
  pText:   [number, number, number];
}

function derivePalette(hex: string): Palette {
  const safeHex = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : DEFAULT_SEED;
  const [r, g, b] = hexToRgb(safeHex);
  const [h, s] = rgbToHsl(r, g, b);
  const sat = Math.max(55, Math.min(s, 85));
  return {
    p:       hslToRgb(h, sat, 62),
    pDim:    hslToRgb(h, sat, 44),
    pSur:    hslToRgb(h, sat, 14),
    pBorder: hslToRgb(h, sat, 22),
    pText:   hslToRgb(h, sat, 72),
  };
}

function applyPalette(p: Palette) {
  const el = document.documentElement;
  const s = (name: string, rgb: [number, number, number]) =>
    el.style.setProperty(name, rgb.join(' '));
  s('--p',        p.p);
  s('--p-dim',    p.pDim);
  s('--p-sur',    p.pSur);
  s('--p-border', p.pBorder);
  s('--p-text',   p.pText);
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface ThemeContextType {
  seed: string;
  setThemeSeed: (hex: string) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [seed, setSeed] = useState(DEFAULT_SEED);

  useEffect(() => {
    applyPalette(derivePalette(seed));
  }, [seed]);

  // Apply defaults immediately on first paint (before useEffect fires)
  // so there's no flash of unstyled CSS vars on load.
  useEffect(() => {
    applyPalette(derivePalette(DEFAULT_SEED));
  }, []);

  const setThemeSeed = (hex: string) => {
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) setSeed(hex);
  };

  const resetTheme = () => setSeed(DEFAULT_SEED);

  return (
    <ThemeContext.Provider value={{ seed, setThemeSeed, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
