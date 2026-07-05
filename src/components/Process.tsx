import { useEffect, useRef } from 'react';
import { Search, MessageSquare, Layers, Cpu, Sparkles, Rocket } from 'lucide-react';

const steps = [
  { num: '01', icon: Search,        title: 'Research',                 desc: 'We analyze winning ad styles, market trends, and your competitors to find the patterns that convert.' },
  { num: '02', icon: MessageSquare, title: 'Find the Winning Message',  desc: 'We identify the core message that resonates with your audience — the one that makes them stop scrolling.' },
  { num: '03', icon: Layers,        title: 'Map to Formats',            desc: 'We translate the winning message into multiple creative formats: images, videos, reels, and landing pages.' },
  { num: '04', icon: Cpu,           title: 'Generate AI Concepts',      desc: 'Our AI pipeline generates premium visual concepts at scale, refined by human creative direction.' },
  { num: '05', icon: Sparkles,      title: 'Polish & Refine',           desc: 'Every concept goes through rigorous quality control to ensure it meets our premium production standards.' },
  { num: '06', icon: Rocket,        title: 'Deliver Ready-to-Run',      desc: 'You receive production-ready creatives, export-ready for every platform. Plug in and launch.' },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-scale').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 90);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="reveal eyebrow-pill mb-7">
            <span className="w-1 h-1 rounded-full bg-brand-purple" />
            How We Work
          </div>
          <h2 className="reveal delay-100 font-heading font-bold leading-[1.06] tracking-tight mb-3 sm:mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
            The Creative
            <br />
            <span className="gradient-text">Engineering Process</span>
          </h2>
          <p className="reveal delay-200 text-ink-body text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            Every CloutKart project follows a proven six-step process that consistently produces high-converting creative.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`reveal glass-card rounded-2xl p-4 sm:p-7 group`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl icon-gradient flex items-center justify-center transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
                    <step.icon size={15} className="text-brand-purple" />
                  </div>
                  <span className="text-3xl sm:text-5xl font-bold font-mono text-white/[0.07] tracking-tight">{step.num}</span>
                </div>

                <h3 className="text-xs sm:text-base font-semibold font-heading text-white mb-1.5 sm:mb-2.5">{step.title}</h3>
                <p className="text-[11px] sm:text-sm text-ink-body leading-relaxed hidden sm:block">{step.desc}</p>

                <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent))' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
