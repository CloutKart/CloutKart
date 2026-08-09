import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

// V3 — the scope of automation, not a menu of formats. Each row is a stretch of
// the line the system runs; the right-hand column keeps the formats it produces,
// so nothing that used to be here is lost, it just stopped being the headline.
const services = [
  {
    title: 'Brief Intake',
    desc: 'Brand, product, audience, and goal arrive as structured fields rather than a thread. Runs start from the same shape every time, which is what makes the rest of the line repeatable.',
    formats: 'Every run',
  },
  {
    title: 'Hook & Message',
    desc: 'Six psychological triggers, one scroll-stopper per brief, written by Pixie against your product rather than pulled from a bank of interchangeable lines.',
    formats: 'Static · Video · UGC · Story',
  },
  {
    title: 'Format Mapping',
    desc: 'The approved message is mapped to every format and placement your account runs, before production starts. The map is the production plan.',
    formats: 'Instagram · Meta · TikTok · YouTube',
  },
  {
    title: 'Concept & Variant Production',
    desc: 'Visual concepts and copy variants for the entire map produced in one pass, so a batch arrives whole instead of trickling in asset by asset.',
    formats: 'Static · Video · UGC · Story',
  },
  {
    title: 'Brand & Spec QC',
    desc: 'Brand rules, legibility, and platform specs checked across the batch before anything reaches you. You review a clean set, not a pile of near-misses.',
    formats: 'Every placement',
  },
  {
    title: 'Resize, Export & Deliver',
    desc: 'Every approved concept resized, exported, versioned, and delivered ready to upload. No reformatting round trip, no chasing final files.',
    formats: 'Feed · Story · Reels · Email · Store',
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 60);
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
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="services" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-16">
          <div>
            <p className="reveal mono-label mb-7" style={{ letterSpacing: '0.3em' }}>Sheet 05 · The Scope</p>
            <h2
              className="reveal delay-100 font-heading font-bold leading-[1.04] tracking-tight"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', color: 'var(--ink)', textWrap: 'balance' }}
            >
              What the line
              <br />
              <span style={{ color: 'var(--accent-ink)' }}>actually handles.</span>
            </h2>
          </div>
          <p className="reveal delay-200 text-ink-dim text-sm leading-relaxed max-w-xs md:text-right">
            Six stretches of creative production, run as one system. Formats are the output, listed on the right of each row.
          </p>
        </div>

        {/* Service list */}
        <div style={{ borderTop: '1px solid rgb(var(--white-rgb) / 0.06)' }}>
          {services.map((service, i) => (
            <div
              key={service.title}
              className="reveal group flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-12 py-7 transition-colors duration-300 cursor-default"
              style={{
                borderBottom: '1px solid rgb(var(--white-rgb) / 0.06)',
                transitionDelay: `${i * 60}ms`,
              }}
            >
              {/* Number */}
              <div
                className="font-mono text-[13px] font-bold flex-shrink-0 mt-0.5 transition-colors duration-300"
                style={{ color: 'rgb(var(--white-rgb) / 0.12)', minWidth: '2rem' }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>

              {/* Title */}
              <div className="flex-shrink-0 sm:w-56 relative">
                <span className="font-heading font-bold text-base sm:text-lg text-white leading-tight">
                  {service.title}
                </span>
                <div
                  className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                  style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent))' }}
                />
              </div>

              {/* Desc */}
              <div className="flex-1">
                <p className="text-ink-muted text-sm leading-relaxed group-hover:text-white/60 transition-colors duration-300">
                  {service.desc}
                </p>
              </div>

              {/* Formats + arrow */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[11px] font-mono text-ink-dim leading-relaxed hidden sm:block sm:w-44 sm:text-right">
                  {service.formats}
                </span>
                <ArrowUpRight
                  size={14}
                  className="opacity-0 group-hover:opacity-40 transition-opacity duration-300 flex-shrink-0"
                  style={{ color: 'var(--accent)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
