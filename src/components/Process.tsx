import { useEffect, useRef } from 'react';

// V3 "The Stations" — Sheet 02 (ProductionLine) drawn at 1:1. Same six stations,
// same order, same AUTO/GATE split; this sheet is the detail view where each one
// is written out. The graphite-then-violet stroke survives the switch to the
// blueprint register unchanged, because it already WAS the thesis: a human line
// that a machine trace catches up to and completes.
const studies = [
  { numeral: '01', title: 'Research', auto: true, desc: 'Winning ad styles, category patterns, and competitor angles are pulled and summarised before anyone opens a document.' },
  { numeral: '02', title: 'Winning Message', auto: false, desc: 'Pixie proposes the core message and the hook it hangs on. You approve the direction while changing it still costs nothing.' },
  { numeral: '03', title: 'Format Map', auto: true, desc: 'The approved message is mapped across every format and placement your account runs. The map becomes the production plan.' },
  { numeral: '04', title: 'Concepting', auto: true, desc: 'Visual concepts and copy variants are produced for the whole map in one pass, refined by human creative direction.' },
  { numeral: '05', title: 'Polish & QC', auto: false, desc: 'Brand rules, legibility, and platform specs are checked across the batch. You sign off a clean set.' },
  { numeral: '06', title: 'Export & Deliver', auto: true, desc: 'Every asset is resized, exported, versioned, and delivered ready to upload. Plug in and launch.' },
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
          <p className="reveal mono-label mb-6" style={{ letterSpacing: '0.3em' }}>Sheet 06 · The Stations</p>
          <h2
            className="reveal delay-100 font-heading font-bold leading-[1.04] mb-4 tracking-tight"
            style={{ fontSize: 'clamp(2.2rem, 5.2vw, 4.2rem)', color: 'var(--ink)', textWrap: 'balance' }}
          >
            Every station,
            <br />
            <span style={{ color: 'var(--accent-ink)' }}>written out.</span>
          </h2>
          <p className="reveal delay-200 text-ink-body text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            Sheet 02 at full scale. Each entry draws a graphite line the violet trace then completes,
            which is the whole arrangement in miniature: a person sets the direction, the machine finishes the work.
          </p>

          {/* the drawing's revision note — replaces the V2 parchment slip */}
          <div
            className="reveal delay-300 bp-margin-note hidden lg:block absolute text-left"
            style={{ right: 0, left: 'auto', top: 6, maxWidth: '220px' }}
            aria-hidden="true"
          >
            <b>Note</b>
            Stations 02 and 05 hold for sign-off. Everything between them runs unattended.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12 md:gap-y-16">
          {studies.map((s, i) => (
            <div key={s.numeral} className="reveal ws-entry" style={{ transitionDelay: `${i * 110}ms` }}>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="ws-numeral font-mono tabular-nums" style={{ fontSize: '1.4rem' }}>{s.numeral}</span>
                <h3 className="font-heading font-bold tracking-tight" style={{ fontSize: '1.2rem', color: 'var(--ink)' }}>
                  {s.title}
                </h3>
                <span className={`bp-tag ml-auto ${s.auto ? 'bp-tag--auto' : ''}`}>
                  {s.auto ? 'Auto' : 'Gate'}
                </span>
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
