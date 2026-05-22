import { useEffect, useRef } from 'react';
import { Search, MessageSquare, Layers, Cpu, Sparkles, Rocket } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: Search,
    title: 'Research',
    desc: 'We analyze winning ad styles, market trends, and your competitors to find the patterns that convert.',
    color: '#8B2FE0',
  },
  {
    num: '02',
    icon: MessageSquare,
    title: 'Find the Winning Message',
    desc: 'We identify the core message that resonates with your audience — the one that makes them stop scrolling.',
    color: '#6D28D9',
  },
  {
    num: '03',
    icon: Layers,
    title: 'Map to Formats',
    desc: 'We translate the winning message into multiple creative formats: images, videos, reels, and landing pages.',
    color: '#2563EB',
  },
  {
    num: '04',
    icon: Cpu,
    title: 'Generate AI Concepts',
    desc: 'Our AI pipeline generates premium visual concepts at scale, refined by human creative direction.',
    color: '#1D4ED8',
  },
  {
    num: '05',
    icon: Sparkles,
    title: 'Polish & Refine',
    desc: 'Every concept goes through rigorous quality control to ensure it meets our premium production standards.',
    color: '#0891B2',
  },
  {
    num: '06',
    icon: Rocket,
    title: 'Deliver Ready-to-Run',
    desc: 'You receive production-ready creatives, export-ready for every platform. Plug in and launch.',
    color: '#06B6D4',
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-scale').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 100);
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
    <section ref={sectionRef} className="relative py-6 md:py-10 bg-[#080C14] overflow-hidden" id="process">
      <div className="orb w-[500px] h-[500px] -left-32 top-1/2 opacity-10"
        style={{ background: 'radial-gradient(circle, #8B2FE0, transparent)' }} />
      <div className="orb w-[400px] h-[400px] -right-20 bottom-1/4 opacity-8"
        style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-12">
          <div className="reveal inline-block glass border border-[#8B2FE0]/30 rounded-full px-4 py-1.5 text-xs font-semibold text-[#a78bfa] mb-6">
            How We Work
          </div>
          <h2 className="reveal delay-100 text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-3 sm:mb-4">
            The Creative
            <br />
            <span className="text-gradient">Engineering Process</span>
          </h2>
          <p className="reveal delay-200 text-white/40 text-sm sm:text-lg max-w-xl mx-auto">
            Every CloutKart project follows a proven six-step process that consistently produces high-converting creative.
          </p>
        </div>

        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`reveal delay-${(i + 1) * 100} glass-card rounded-2xl p-4 sm:p-8 group hover-lift relative overflow-hidden`}
                style={{ border: `1px solid rgba(255,255,255,0.06)` }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ background: `radial-gradient(circle at 20% 20%, ${step.color}10, transparent 70%)` }}
                />

                <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
                  <div
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
                    style={{ background: `${step.color}20`, border: `1px solid ${step.color}40` }}
                  >
                    <step.icon size={16} style={{ color: step.color }} />
                  </div>
                  <span
                    className="text-2xl sm:text-4xl font-black"
                    style={{ color: `${step.color}30` }}
                  >
                    {step.num}
                  </span>
                </div>

                <h3 className="relative z-10 text-xs sm:text-lg font-bold text-white mb-1 sm:mb-3">{step.title}</h3>
                <p className="relative z-10 text-[11px] sm:text-sm text-white/45 leading-relaxed hidden sm:block">{step.desc}</p>

                <div
                  className="absolute top-5 right-5 w-2 h-2 rounded-full animate-pulse"
                  style={{ background: step.color, boxShadow: `0 0 8px ${step.color}` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
