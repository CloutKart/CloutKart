import { useEffect, useRef } from 'react';
import Eyebrow from './ornaments/Eyebrow';

// "The Method" — a Renaissance treatise: an engraved schematic figure flanked by the
// six steps as numbered plates (I–VI), serif exposition. No glass cards, icons or glows.
const steps = [
  { n: 'I',   t: 'Research',                title: 'Research',                desc: 'We analyze winning ad styles, market trends, and your competitors to find the patterns that convert.' },
  { n: 'II',  t: 'Find the Winning Message', title: 'Find the Winning Message', desc: 'We identify the core message that resonates with your audience — the one that makes them stop scrolling.' },
  { n: 'III', t: 'Map to Formats',          title: 'Map to Formats',          desc: 'We translate the winning message into multiple creative formats: images, videos, reels, and landing pages.' },
  { n: 'IV',  t: 'Generate AI Concepts',    title: 'Generate AI Concepts',    desc: 'Our AI pipeline generates premium visual concepts at scale, refined by human creative direction.' },
  { n: 'V',   t: 'Polish & Refine',         title: 'Polish & Refine',         desc: 'Every concept goes through rigorous quality control to ensure it meets our premium production standards.' },
  { n: 'VI',  t: 'Deliver Ready-to-Run',    title: 'Deliver Ready-to-Run',    desc: 'You receive production-ready creatives, export-ready for every platform. Plug in and launch.' },
];

function Step({ n, title, desc, side }: { n: string; title: string; desc: string; side: 'l' | 'r' }) {
  return (
    <div className={`reveal flex items-start gap-4 ${side === 'l' ? 'lg:flex-row-reverse lg:text-right' : ''}`}>
      <span
        className="font-serif-display leading-none oldstyle-nums shrink-0"
        style={{ color: 'var(--accent-ink)', fontSize: '2.4rem' }}
      >
        {n}
      </span>
      <div>
        <h3 className="font-serif-display leading-tight mb-1" style={{ color: 'var(--ink)', fontSize: '1.5rem' }}>{title}</h3>
        <p className="font-serif-text leading-relaxed" style={{ color: 'var(--ink-body)', fontSize: '1.02rem' }}>{desc}</p>
      </div>
    </div>
  );
}

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-scale').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 80);
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
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="process" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14 md:mb-20">
          <Eyebrow className="reveal mb-6">The Method</Eyebrow>
          <h2 className="reveal delay-100 font-serif-display leading-[0.98] mb-4" style={{ color: 'var(--ink)', fontSize: 'clamp(2.6rem, 6vw, 5.2rem)' }}>
            The Creative <span className="italic" style={{ color: 'var(--accent-ink)' }}>Method</span>
          </h2>
          <p className="reveal delay-200 font-serif-text max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--ink-body)', fontSize: '1.15rem' }}>
            Every commission follows a proven six-step method — from first study to a plate ready for the press.
          </p>
        </div>

        {/* Treatise — steps flank the engraved schematic figure */}
        <div className="grid lg:grid-cols-[1fr_minmax(240px,340px)_1fr] gap-x-10 gap-y-10 lg:gap-y-14 items-center">
          {/* left column I–III */}
          <div className="space-y-10">
            {steps.slice(0, 3).map((s) => <Step key={s.n} n={s.n} title={s.title} desc={s.desc} side="l" />)}
          </div>

          {/* engraved schematic figure */}
          <figure className="reveal-scale order-first lg:order-none mx-auto">
            <img
              src="/engravings/schematic.webp"
              alt="An engraved schematic of the creative method"
              className="engraving w-full max-w-[300px] sm:max-w-[340px] mx-auto"
            />
            <figcaption className="mt-4 text-center small-caps font-serif-text italic text-xs tracking-wide" style={{ color: 'var(--frame-label)' }}>
              Fig. — The Method
            </figcaption>
          </figure>

          {/* right column IV–VI */}
          <div className="space-y-10">
            {steps.slice(3, 6).map((s) => <Step key={s.n} n={s.n} title={s.title} desc={s.desc} side="r" />)}
          </div>
        </div>
      </div>
    </section>
  );
}
