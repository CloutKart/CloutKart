import { useEffect, useRef } from 'react';

// V2 "The Workshop" — a workbench from 2045. Each step is a sketchbook entry:
// a graphite stroke draws itself under the title, then a thin purple schematic
// trace catches up and completes the same line — ink and circuit finishing the
// same stroke. Hovering an entry re-draws its trace live (the visitor holds the
// pen; the section sets the nib cursor). No cards, no icon chips, no gradients.
const studies = [
  { numeral: 'I', title: 'Research', desc: 'We analyze winning ad styles, market trends, and your competitors to find the patterns that convert.' },
  { numeral: 'II', title: 'Find the Winning Message', desc: 'We identify the core message that resonates with your audience — the one that makes them stop scrolling.' },
  { numeral: 'III', title: 'Map to Formats', desc: 'We translate the winning message into multiple creative formats: images, videos, reels, and landing pages.' },
  { numeral: 'IV', title: 'Generate Concepts', desc: 'Our AI pipeline generates premium visual concepts at scale, refined by human creative direction.' },
  { numeral: 'V', title: 'Polish & Refine', desc: 'Every concept goes through rigorous quality control to meet our production standards.' },
  { numeral: 'VI', title: 'Deliver Ready-to-Run', desc: 'You receive production-ready creatives, export-ready for every platform. Plug in and launch.' },
];

// Three hand-drawn underline variants (pathLength=100 → trivial dash math),
// cycled so adjacent entries don't share the same stroke.
const STROKES = [
  'M2 8 C 18 4, 34 11, 52 7 S 86 4, 118 8',
  'M2 7 C 22 11, 40 3, 64 8 S 98 10, 118 6',
  'M2 9 C 14 5, 44 10, 70 5 S 100 9, 118 7',
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-scale').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 110);
            });
          }
        });
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-36 [overflow-x:clip]"
      id="process"
      data-cursor-zone="nib"
      style={{ background: 'transparent' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative text-center mb-14 md:mb-20">
          <p className="reveal mono-label mb-6" style={{ letterSpacing: '0.3em' }}>The Workshop</p>
          <h2
            className="reveal delay-100 font-authored font-semibold leading-[1.04] mb-4"
            style={{ fontSize: 'clamp(2.4rem, 5.6vw, 4.8rem)', color: 'var(--ink)', letterSpacing: '0.005em' }}
          >
            The Method,
            <br />
            <span style={{ color: 'var(--accent-ink)' }}>in Six Studies.</span>
          </h2>
          <p className="reveal delay-200 text-ink-body text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            Every CloutKart campaign is drafted the same way: a human line first, an intelligent trace to finish it.
          </p>

          {/* one Da Vinci flourish — a pinned parchment slip, mirrored hand. Used once. */}
          <div
            className="reveal delay-300 artifact hidden lg:block absolute px-4 py-2.5"
            style={{ position: 'absolute', right: 0, left: 'auto', top: 6, transform: 'rotate(-2.5deg)', width: 'max-content', maxWidth: '240px' }}
            title="the idea and the machine"
            aria-hidden="true"
          >
            <span
              className="font-authored italic block"
              style={{ fontSize: '15px', transform: 'scale(-1, 1)', color: '#3a3128' }}
            >
              l'idea e la macchina
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12 md:gap-y-16">
          {studies.map((s, i) => (
            <div key={s.numeral} className="reveal ws-entry" style={{ transitionDelay: `${i * 110}ms` }}>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="font-authored ws-numeral">{s.numeral}</span>
                <h3 className="font-authored font-semibold" style={{ fontSize: '1.35rem', color: 'var(--ink)' }}>
                  {s.title}
                </h3>
              </div>
              {/* the stroke: graphite first, the purple trace catches up */}
              <svg className="ws-stroke" viewBox="0 0 120 14" preserveAspectRatio="none" aria-hidden="true">
                <path className="ws-graphite" d={STROKES[i % STROKES.length]} pathLength={100} />
                <path className="ws-trace" d={STROKES[i % STROKES.length]} pathLength={100} />
              </svg>
              <p className="text-sm text-ink-muted leading-relaxed mt-3">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
