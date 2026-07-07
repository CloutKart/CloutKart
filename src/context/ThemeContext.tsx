import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  /** Optional origin (viewport px) seeds the "ink wipe" so it spreads from the toggle. */
  toggleTheme: (origin?: { x: number; y: number }) => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'ck-theme';

/** One-shot cinematic transition window. The <html data-theme-transition> attribute
 *  is present for this long; all staggered CSS choreography lives inside that scope
 *  (long enough to contain the tail settle-bounce + fingertip shimmer). */
const TRANSITION_MS = 1000;

/** Emitted the moment a themed swap begins so ThemeFX / TelemetryFrame can run the
 *  ink wipe, particle burst and coordinate recalibration in lock-step. */
export interface ThemeTransitionDetail {
  from: Theme;
  to: Theme;
  x: number;
  y: number;
}
export const THEME_TRANSITION_EVENT = 'ck:themetransition';

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    // The inline script in index.html already resolved and applied the theme
    // to <html data-theme>. Trust it so context and DOM stay in sync (no flash).
    const applied = document.documentElement.dataset.theme;
    if (applied === 'light' || applied === 'dark') return applied;
  }
  return 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const themeRef = useRef<Theme>(theme);   // mirrors state so rapid toggles chain correctly
  const clearTimer = useRef<number>(0);

  useEffect(() => {
    themeRef.current = theme;
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage may be unavailable (private mode) — non-fatal */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F2F2F6' : '#080808');
  }, [theme]);

  useEffect(() => () => window.clearTimeout(clearTimer.current), []);

  const setTheme = (next: Theme) => {
    themeRef.current = next;
    setThemeState(next);
  };

  // Side effects run here (not in the state updater) so React StrictMode's double-invoked
  // updater can't fire the transition twice.
  const toggleTheme = (origin?: { x: number; y: number }) => {
    const prev = themeRef.current;
    const next: Theme = prev === 'dark' ? 'light' : 'dark';
    themeRef.current = next;

    // Reduced motion → no cinematic timeline, just the token crossfade.
    if (prefersReducedMotion()) {
      setThemeState(next);
      return;
    }

    const el = document.documentElement;
    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight / 2;

    // Announce the swap FIRST so ThemeFX paints the outgoing-theme cover in the same commit
    // the base flips — no one-frame flash of the new canvas.
    document.dispatchEvent(
      new CustomEvent<ThemeTransitionDetail>(THEME_TRANSITION_EVENT, {
        detail: { from: prev, to: next, x, y },
      }),
    );

    el.style.setProperty('--tx-x', `${x}px`);
    el.style.setProperty('--tx-y', `${y}px`);
    el.dataset.themeTransition = 'running';

    // Re-arm (don't stack) on rapid re-toggle so an overlapping switch continues.
    window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(() => {
      delete el.dataset.themeTransition;
    }, TRANSITION_MS);

    setThemeState(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
