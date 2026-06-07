import { useEffect, useRef } from 'react';

const testimonials = [
  {
    quote: "Before CloutKart we were guessing. Same product, new hooks from Pixie — ROAS went from 1.8× to 5.9× in 8 weeks. The brief-to-brief speed is what killed our old agency.",
    author: "Nikhil Menon",
    role: "Growth Lead",
    brand: "NutriBloom",
    metric: "5.9× ROAS",
    metricLabel: "in 8 weeks",
    accent: '#A855F7',
  },
  {
    quote: "48-hour turnaround isn't a promise — it's a system. We've done 14 briefs. Every single one delivered in under 48h. That's what consistent creative output actually looks like.",
    author: "Priya Agarwal",
    role: "Founder",
    brand: "Forge Athletics",
    metric: "48h",
    metricLabel: "every brief",
    accent: '#6366F1',
  },
  {
    quote: "Pixie's hook writing is different. Not generic benefit-feature. It found the angle we'd been circling for months. Our CTR on Meta went from 0.9% to 4.3% with the same ad spend.",
    author: "Sahar Verma",
    role: "Performance Manager",
    brand: "Duskline Skincare",
    metric: "4.3%",
    metricLabel: "CTR on Meta",
    accent: '#06B6D4',
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-clip').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 100);
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
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="testimonials" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 md:mb-16">
          <div className="reveal eyebrow-pill mb-7">
            <span className="w-1 h-1 rounded-full bg-brand-purple" />
            Client Results
          </div>
          <h2
            className="reveal delay-100 font-heading font-bold leading-[1.04] tracking-tight"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', color: '#F5F0EB' }}
          >
            Numbers don't lie.
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={t.brand}
              className="reveal-clip glass-card rounded-2xl p-7 flex flex-col gap-5 relative overflow-hidden"
              style={{
                transitionDelay: `${i * 120}ms`,
                borderLeft: `2px solid ${t.accent}`,
              }}
            >
              {/* Metric block */}
              <div className="flex items-end gap-2">
                <span
                  className="font-mono text-3xl font-bold leading-none"
                  style={{ color: t.accent }}
                >
                  {t.metric}
                </span>
                <span className="font-mono text-[11px] text-white/30 mb-0.5 uppercase tracking-widest">
                  {t.metricLabel}
                </span>
              </div>

              {/* Quote */}
              <blockquote className="text-white/55 text-sm leading-[1.75] flex-1">
                "{t.quote}"
              </blockquote>

              {/* Attribution */}
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-heading font-bold text-[11px]"
                  style={{ background: `${t.accent}20`, color: t.accent, border: `1px solid ${t.accent}30` }}
                >
                  {t.author.charAt(0)}
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-white/70">{t.author}</div>
                  <div className="text-[10px] text-white/30 font-mono">{t.role} · {t.brand}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
