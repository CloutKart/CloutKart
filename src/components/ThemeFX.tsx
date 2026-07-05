import { CSSProperties, useEffect, useRef, useState } from 'react';
import { THEME_TRANSITION_EVENT, ThemeTransitionDetail } from '../context/ThemeContext';

// Canonical canvas colours per theme (mirror --bg / --dot-color in index.css). Kept as
// literals so the wipe layers can paint the OUTGOING theme instantly, before the base flips.
const CANVAS = {
  light: { bg: '#F2F2F6', dot: 'rgba(20,19,26,0.14)' },
  dark: { bg: '#080808', dot: 'rgba(255,255,255,0.07)' },
} as const;

const dots = (c: string) => `radial-gradient(circle, ${c} 1px, transparent 1px)`;

type Wipe = ThemeTransitionDetail & { id: number };

/** Global theme-transition FX host: the ink wipe (behind the hero art), the dust-particle
 *  burst, and the ambient vignette. Mounted once near TelemetryFrame in App. */
export default function ThemeFX() {
  const [wipe, setWipe] = useState<Wipe | null>(null);
  const particleLayer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onTransition = (e: Event) => {
      const { from, to, x, y } = (e as CustomEvent<ThemeTransitionDetail>).detail;
      const id = performance.now();
      setWipe({ id, from, to, x, y });
      window.setTimeout(() => setWipe((w) => (w && w.id === id ? null : w)), 660);
      spawnParticles(x, y);
    };
    document.addEventListener(THEME_TRANSITION_EVENT, onTransition);
    return () => document.removeEventListener(THEME_TRANSITION_EVENT, onTransition);
  }, []);

  const spawnParticles = (ox: number, oy: number) => {
    const layer = particleLayer.current;
    if (!layer) return;
    const count = window.innerWidth < 640 ? 5 : 10;
    const vw = window.innerWidth;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'theme-particle';
      // seeded near the toggle but scattered across the hero band
      const x = Math.min(Math.max(ox + (Math.random() - 0.5) * vw * 0.9, 8), vw - 8);
      const y = oy * 0.4 + Math.random() * Math.min(window.innerHeight * 0.6, 460);
      const size = 2 + Math.random() * 2.5;
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      layer.appendChild(p);
      const drift = 30 + Math.random() * 60;
      const anim = p.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
          { opacity: 0.9, offset: 0.3 },
          { transform: `translate(-50%, calc(-50% - ${drift}px)) scale(1)`, opacity: 0 },
        ],
        { duration: 600 + Math.random() * 500, delay: 120 + Math.random() * 260, easing: 'cubic-bezier(0.22,1,0.36,1)' },
      );
      anim.onfinish = () => p.remove();
      anim.oncancel = () => p.remove();
    }
  };

  const styleVars = (w: Wipe): CSSProperties =>
    ({ '--tx-x': `${w.x}px`, '--tx-y': `${w.y}px` } as CSSProperties);

  return (
    <>
      {/* ambient lighting — Concept favours the human hand (left), Execution the robot (right) */}
      <div className="theme-vignette theme-vignette-concept" aria-hidden />
      <div className="theme-vignette theme-vignette-execution" aria-hidden />

      {/* ink wipe — sits BEHIND the hero art (z-0). Old canvas covers, new canvas grows from
          the toggle, then both unmount to reveal the already-flipped base beneath. */}
      {wipe && (
        <div key={wipe.id} className="theme-wipe" aria-hidden style={styleVars(wipe)}>
          <div
            className="theme-wipe-old"
            style={{ background: CANVAS[wipe.from].bg, backgroundImage: dots(CANVAS[wipe.from].dot) }}
          />
          <div
            className="theme-wipe-new"
            style={{ background: CANVAS[wipe.to].bg, backgroundImage: dots(CANVAS[wipe.to].dot) }}
          />
        </div>
      )}

      <div ref={particleLayer} className="theme-particles" aria-hidden />
    </>
  );
}
