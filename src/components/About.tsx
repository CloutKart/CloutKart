import { useEffect, useRef } from 'react';
import { Brain, Zap, Target, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

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

  const highlights = [
    { icon: Brain, label: 'AI-Powered', desc: 'Cutting-edge AI tools for concept generation' },
    { icon: Target, label: 'Message-First', desc: 'Strategy before pixels, always' },
    { icon: Zap, label: 'Fast Delivery', desc: 'Production-ready in 48 hours' },
    { icon: BarChart3, label: 'Data-Driven', desc: 'Creatives built on performance data' },
  ];

  const features = [
    'High-converting ad creatives',
    'Cinematic video campaigns',
    'Platform-specific formats',
    'Rapid iteration cycles',
  ];

  return (
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="about" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left */}
          <div>
            <div className="reveal eyebrow-pill mb-7">
              <span className="w-1 h-1 rounded-full bg-brand-purple" />
              The Studio
            </div>

            <h2 className="reveal delay-100 font-heading font-bold leading-[1.1] tracking-tight mb-5 sm:mb-7" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              A Creative Studio Built for{' '}
              <span className="gradient-text">Modern</span>{' '}
              <span className="text-white">Brands</span>
            </h2>

            <p className="reveal delay-200 text-[#D1D5DB] text-sm sm:text-lg leading-[1.75] mb-5 sm:mb-7">
              CloutKart is a creative advertising studio that helps brands sell more with scroll-stopping ads, strategic messaging, AI-powered design, and high-conversion creative systems.
            </p>

            <div className="reveal delay-300 space-y-3 mb-8 sm:mb-10">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-brand-cyan flex-shrink-0" />
                  <span className="text-[#D1D5DB] text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>

            <div className="reveal delay-400">
              <a href="#contact" className="btn-primary text-sm sm:text-base">
                Work With Us
                <ArrowRight size={15} />
              </a>
            </div>
          </div>

          {/* Right: workflow diagram */}
          <div className="reveal-scale delay-200">
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <div className="relative z-10">
                <div className="text-[11px] text-[#9CA3AF] font-mono font-medium uppercase tracking-widest mb-6">Creative Workflow</div>

                {/* Steps */}
                {[
                  { step: '01', label: 'Creative Brief', sub: 'Brand DNA + goals' },
                  { step: '02', label: 'Winning Message', sub: 'Core hook identified' },
                  { step: '03', label: 'Format Map', sub: 'Every channel covered' },
                  { step: '04', label: 'Delivery', sub: 'Production-ready in 48h' },
                ].map((item, i, arr) => (
                  <div key={item.step} className="relative">
                    <div className="flex items-center gap-4 py-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold text-brand-purple" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white font-heading">{item.label}</div>
                        <div className="text-xs text-[#9CA3AF] font-mono mt-0.5">{item.sub}</div>
                      </div>
                      <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #A855F7, #06B6D4)' }} />
                    </div>
                    {i < arr.length - 1 && (
                      <div className="ml-[18px] w-px h-4 bg-gradient-to-b from-brand-purple/30 to-brand-cyan/20" />
                    )}
                  </div>
                ))}

                <div className="mt-6 pt-5 border-t border-white/[0.07]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9CA3AF] font-mono">Avg delivery time</span>
                    <span className="font-mono text-lg font-bold gradient-text">48h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Highlight grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
              {highlights.map((item, i) => (
                <div
                  key={item.label}
                  className={`reveal-scale delay-${(i + 3) * 100} glass-card rounded-2xl p-4 sm:p-5 group`}
                >
                  <div className="relative z-10">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl icon-gradient flex items-center justify-center mb-3">
                      <item.icon size={18} className="text-brand-purple" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold font-heading text-white mb-1">{item.label}</h3>
                    <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
