// Instrument / telemetry frame — the light-theme "surface": edge rulers,
// corner registration marks, and monospace coordinate labels. Purely
// decorative (pointer-events-none), token-driven so it works in both themes.
import { useEffect, useState } from 'react';
import { THEME_TRANSITION_EVENT } from '../context/ThemeContext';

const COORD = 'LAT 28.61 · LON 77.20';

function Registration({ className }: { className: string }) {
  return (
    <div className={`absolute w-3.5 h-3.5 ${className}`} aria-hidden>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2" style={{ background: 'var(--frame-mark)' }} />
      <span className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2" style={{ background: 'var(--frame-mark)' }} />
    </div>
  );
}

export default function TelemetryFrame() {
  // Coordinate "recalibration": on a theme swap the readout scrambles for ~380ms then
  // re-settles to the canonical fix — the instruments re-referencing the new atmosphere.
  const [coord, setCoord] = useState(COORD);
  useEffect(() => {
    let iv = 0;
    const onTransition = () => {
      window.clearInterval(iv);
      let frames = 0;
      iv = window.setInterval(() => {
        frames += 1;
        if (frames > 6) {
          window.clearInterval(iv);
          setCoord(COORD);
        } else {
          setCoord(COORD.replace(/\d/g, () => String(Math.floor(Math.random() * 10))));
        }
      }, 55);
    };
    document.addEventListener(THEME_TRANSITION_EVENT, onTransition);
    return () => {
      document.removeEventListener(THEME_TRANSITION_EVENT, onTransition);
      window.clearInterval(iv);
    };
  }, []);

  return (
    <div className="telemetry-frame pointer-events-none fixed inset-0 z-0 select-none" aria-hidden>
      {/* inset hairline rectangle */}
      <div className="absolute inset-3 sm:inset-5" style={{ border: '1px solid var(--frame-line)', borderRadius: '3px' }} />

      {/* edge rulers (tick marks) */}
      <div
        className="absolute left-3 right-3 sm:left-5 sm:right-5 top-3 sm:top-5 h-1.5"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--frame-tick) 0 1px, transparent 1px 46px)' }}
      />
      <div
        className="absolute left-3 right-3 sm:left-5 sm:right-5 bottom-3 sm:bottom-5 h-1.5"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--frame-tick) 0 1px, transparent 1px 46px)' }}
      />
      <div
        className="absolute top-3 bottom-3 sm:top-5 sm:bottom-5 left-3 sm:left-5 w-1.5"
        style={{ backgroundImage: 'repeating-linear-gradient(180deg, var(--frame-tick) 0 1px, transparent 1px 46px)' }}
      />

      {/* corner registration marks */}
      <Registration className="top-3 left-3 sm:top-5 sm:left-5 -translate-x-1/2 -translate-y-1/2" />
      <Registration className="top-3 right-3 sm:top-5 sm:right-5 translate-x-1/2 -translate-y-1/2" />
      <Registration className="bottom-3 left-3 sm:bottom-5 sm:left-5 -translate-x-1/2 translate-y-1/2" />
      <Registration className="bottom-3 right-3 sm:bottom-5 sm:right-5 translate-x-1/2 translate-y-1/2" />

      {/* monospace coordinate labels */}
      <span
        className="absolute bottom-3 sm:bottom-5 left-5 sm:left-8 translate-y-[150%] font-mono uppercase tracking-[0.22em] tabular-nums"
        style={{ fontSize: '9px', color: 'var(--frame-label)' }}
      >
        {coord}
      </span>
      <span
        className="absolute bottom-3 sm:bottom-5 right-5 sm:right-8 translate-y-[150%] font-mono uppercase tracking-[0.22em]"
        style={{ fontSize: '9px', color: 'var(--frame-label)' }}
      >
        CAT · 20.45
      </span>
    </div>
  );
}
