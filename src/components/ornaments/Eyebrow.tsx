// Eyebrow — the Renaissance replacement for the DM-Mono ".eyebrow-pill". A small-caps
// serif label flanked by fleuron marks, in accent ink. Section kicker / label.

import type { ReactNode } from 'react';

export default function Eyebrow({
  children,
  className = '',
  align = 'center',
}: {
  children: ReactNode;
  className?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 small-caps font-serif-text text-[0.95rem] leading-none ${className}`}
      style={{ color: 'var(--accent-ink)', justifyContent: align === 'center' ? 'center' : 'flex-start' }}
    >
      <span aria-hidden className="text-[0.85em] opacity-60">❦</span>
      <span className="tracking-[0.14em]">{children}</span>
      <span aria-hidden className="text-[0.85em] opacity-60">❦</span>
    </div>
  );
}
