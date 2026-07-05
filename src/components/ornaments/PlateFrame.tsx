// PlateFrame — turns any content (a mockup, an image, a card) into an engraved
// "specimen plate": an inset hairline border, corner registration crosshairs, and an
// optional small-caps plate caption. Token-driven (--frame-*) so it reads in both
// themes. Generalizes TelemetryFrame from a fixed full-screen surface into a wrapper.

import type { ReactNode } from 'react';

function Corner({ className }: { className: string }) {
  return (
    <div className={`absolute w-3 h-3 ${className}`} aria-hidden>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2" style={{ background: 'var(--frame-mark)' }} />
      <span className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2" style={{ background: 'var(--frame-mark)' }} />
    </div>
  );
}

interface Props {
  children: ReactNode;
  /** e.g. "Plate II" */
  plate?: string;
  /** e.g. "The Instrument" */
  caption?: string;
  /** padding inside the frame around the content */
  inset?: string;
  className?: string;
}

export default function PlateFrame({ children, plate, caption, inset = '0.9rem', className = '' }: Props) {
  return (
    <figure className={`relative ${className}`}>
      <div className="relative" style={{ padding: inset }}>
        {/* engraved border + corner registration marks */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
          <div className="absolute inset-0" style={{ border: '1px solid var(--frame-line)', borderRadius: '2px' }} />
          <Corner className="top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
          <Corner className="top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <Corner className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <Corner className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative">{children}</div>
      </div>

      {(plate || caption) && (
        <figcaption
          className="mt-3 flex items-center justify-center gap-2 small-caps font-serif-text text-[0.7rem] sm:text-xs"
          style={{ color: 'var(--frame-label)' }}
        >
          {plate && <span className="oldstyle-nums" style={{ color: 'var(--accent-ink)' }}>{plate}</span>}
          {plate && caption && <span aria-hidden style={{ color: 'var(--frame-line)' }}>·</span>}
          {caption && <span className="italic tracking-wide">{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}
