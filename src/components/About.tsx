import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

// V3 "The Drawing Sheet" — the offering, stated as a spec. The right column is a
// parts list, not a card grid: the reader can count which stages the machine runs
// (AUTO) and which ones a human signs (GATE). Every figure here is a figure the
// site already claims elsewhere; nothing new is asserted.

const SPEC = [
  { label: 'Cycle time', value: '48h' },
  { label: 'Formats per run', value: '6' },
  { label: 'Platform sizes', value: '4' },
  { label: 'Brands scaled', value: '500+' },
];

// Mirrors the six stations in Process.tsx / ProductionLine.tsx — same order, same
// AUTO/GATE split, so the three sections read as one drawing at three zoom levels.
const STAGES = [
  { name: 'Research', auto: true },
  { name: 'Winning message', auto: false },
  { name: 'Format map', auto: true },
  { name: 'Concepting', auto: true },
  { name: 'Polish & QC', auto: false },
  { name: 'Export & deliver', auto: true },
];

const OUTCOMES = [
  'Briefs structured and routed automatically',
  'Concepts, variants, and resizes in a single run',
  'Human approval at the two gates that change the outcome',
  "Each run tuned by the last run's numbers",
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-scale').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 120);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="about" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — what the offering is */}
          <div>
            <p className="reveal mono-label mb-7" style={{ letterSpacing: '0.3em' }}>Sheet 01 · The Offering</p>

            <h2 className="reveal delay-100 font-heading font-bold leading-[1.06] mb-5 sm:mb-7 tracking-tight" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', color: 'var(--ink)', textWrap: 'balance' }}>
              The line that turns one brief{' '}
              <span style={{ color: 'var(--accent-ink)' }}>into a full campaign.</span>
            </h2>

            <p className="reveal delay-200 text-ink-body text-sm sm:text-lg leading-[1.75] mb-6 sm:mb-8" style={{ maxWidth: '62ch' }}>
              CloutKart operates the creative production process end to end. Briefs come in structured,
              concepts and variants are produced in one pass, your team approves at the two points where
              judgement actually matters, and finished assets land export-ready for every platform you run.
            </p>

            <div className="reveal delay-300 mb-8 sm:mb-10" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {OUTCOMES.map((outcome) => (
                <div
                  key={outcome}
                  className="flex items-baseline gap-3.5 py-3"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <span className="w-1 h-1 rounded-full flex-shrink-0 translate-y-[-2px]" style={{ background: 'var(--accent)' }} />
                  <span className="text-ink-body text-sm sm:text-[15px] leading-relaxed">{outcome}</span>
                </div>
              ))}
            </div>

            <div className="reveal delay-400">
              <a href="#contact" className="btn-primary text-sm sm:text-base">
                Map Your Pipeline
                <ArrowRight size={15} />
              </a>
            </div>
          </div>

          {/* Right — the spec sheet */}
          <div className="reveal-scale delay-200 bp-sheet" style={{ ['--bp-sheet-inset' as string]: '18px' }}>
            <div
              className="rounded-sm p-6 sm:p-8"
              style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="mono-label mb-6" style={{ color: 'var(--ink-dim)' }}>Production spec</div>

              {/* parts list — dotted leaders, drawing-office style */}
              <div className="space-y-3.5 mb-7">
                {SPEC.map((row) => (
                  <div key={row.label} className="flex items-baseline gap-3">
                    <span className="text-sm" style={{ color: 'var(--ink-body)' }}>{row.label}</span>
                    <span className="flex-1 self-end mb-1" style={{ borderBottom: '1px dashed var(--frame-line)' }} />
                    <span
                      className="font-mono text-base font-medium tabular-nums"
                      style={{ color: 'var(--ink)' }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mono-label mb-4 pt-6" style={{ color: 'var(--ink-dim)', borderTop: '1px solid var(--border-subtle)' }}>
                Stage allocation
              </div>
              <ul className="space-y-2.5 mb-7">
                {STAGES.map((stage, i) => (
                  <li key={stage.name} className="flex items-center gap-3">
                    <span className="font-mono text-[10px] tabular-nums w-5 flex-shrink-0" style={{ color: 'var(--ink-dim)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm flex-1" style={{ color: 'var(--ink-body)' }}>{stage.name}</span>
                    <span className={`bp-tag ${stage.auto ? 'bp-tag--auto' : ''}`}>
                      <span className="bp-tag-dot" />
                      {stage.auto ? 'Auto' : 'Gate'}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-end">
                <div className="bp-titleblock">
                  <span>Sheet <b>01</b></span>
                  <span>Rev <b>C</b></span>
                  <span>Scale <b>1:1</b></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
