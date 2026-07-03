import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(() => setVisible(false), 300);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  const pct = Math.min(100, Math.round(progress));

  return (
    <div
      className={`loading-screen ${progress >= 100 ? 'hidden' : ''}`}
      style={{ transition: 'opacity 0.6s ease, visibility 0.6s ease' }}
    >
      <div className="relative z-10 flex flex-col items-center gap-8">
        <img
          src="/logo.png"
          alt="CloutKart"
          className="h-16 w-auto object-contain opacity-90"
        />

        {/* Shimmer gradient progress bar */}
        <div className="relative w-44 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--white-rgb) / 0.06)' }}>
          <div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-ink) 60%, var(--accent) 100%)',
              transition: 'width 0.25s ease',
            }}
          >
            <div
              className="absolute inset-0 animate-shimmer"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgb(var(--white-rgb) / 0.45) 50%, transparent 100%)' }}
            />
          </div>
        </div>

        <div className="font-mono text-[11px] text-ink-dim tracking-[0.25em]">
          {pct}%
        </div>
      </div>
    </div>
  );
}
