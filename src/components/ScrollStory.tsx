import { useEffect, useRef, useState } from 'react';
import { Sparkles, Cpu, ShoppingCart, Rocket, MessageSquare } from 'lucide-react';

const phases = [
  {
    icon: Sparkles,
    phase: '01',
    title: 'The Idea Emerges',
    desc: 'Abstract concepts crystallize into clear, powerful messaging. Brand DNA analyzed. Market decoded.',
    color: 'from-[#8B2FE0] to-[#6D28D9]',
    accent: '#8B2FE0',
  },
  {
    icon: Cpu,
    phase: '02',
    title: 'The Creative Lab',
    desc: 'AI processes, refines, and optimizes. Multiple variations tested. The winning angle surfaces.',
    color: 'from-[#2563EB] to-[#1E40AF]',
    accent: '#2563EB',
  },
  {
    icon: ShoppingCart,
    phase: '03',
    title: 'The Cart Moment',
    desc: 'The winning message locks in. Production-ready. Polished. Primed for maximum impact.',
    color: 'from-[#0891B2] to-[#0E7490]',
    accent: '#0891B2',
  },
  {
    icon: Rocket,
    phase: '04',
    title: 'Launch & Scale',
    desc: 'One message. Infinite formats. Instagram, TikTok, video, landing pages — all from the same foundation.',
    color: 'from-[#06B6D4] to-[#0891B2]',
    accent: '#06B6D4',
  },
  {
    icon: MessageSquare,
    phase: '05',
    title: 'The Final Impact',
    desc: "It's not about the ad. It's about the message. CloutKart builds the message first. Everything else scales from there.",
    color: 'from-[#8B2FE0] via-[#2563EB] to-[#06B6D4]',
    accent: '#8B2FE0',
  },
];

export default function ScrollStory() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (outerRef.current) obs.observe(outerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!outerRef.current) return;
      const rect = outerRef.current.getBoundingClientRect();
      const scrollable = outerRef.current.offsetHeight - window.innerHeight;
      // Start progress when section is 40% into view (early trigger)
      const offset = window.innerHeight * 0.4;
      const scrolled = -rect.top + offset;
      const pct = Math.max(0, Math.min(1, scrolled / scrollable));
      setProgress(pct);
      setActivePhase(Math.min(phases.length - 1, Math.floor(pct * phases.length)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const activeP = phases[activePhase];

  return (
    <section id="story" className="relative bg-[#080C14] py-0">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[600px] h-[600px] -left-64 top-1/3 opacity-10"
          style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }} />
        <div className="orb w-[500px] h-[500px] -right-48 bottom-1/3 opacity-8"
          style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />
      </div>

      <div ref={outerRef} className="h-[130vh] md:h-[160vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          <div className={`text-center mb-5 md:mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-block glass border border-[#2563EB]/30 rounded-full px-4 py-1.5 text-xs font-semibold text-[#60a5fa] mb-3 md:mb-4">
              The CloutKart Story
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight">
              Watch Creativity
              <br />
              <span className="text-gradient">Come to Life</span>
            </h2>
            <p className="text-white/40 text-xs sm:text-sm mt-2 sm:mt-3">Scroll to walk through the journey.</p>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {/* Desktop: 5 cards */}
            <div className="hidden md:grid md:grid-cols-5 gap-3 lg:gap-4 mb-6">
              {phases.map((phase, i) => (
                <div
                  key={phase.phase}
                  className="relative rounded-2xl p-0.5 transition-all duration-500"
                  style={{
                    background: i === activePhase
                      ? `linear-gradient(135deg, ${phase.accent}80, ${phase.accent}20)`
                      : 'transparent',
                    transform: i === activePhase ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  <div
                    className="glass-card rounded-xl p-4 lg:p-5 h-full transition-all duration-500"
                    style={{
                      borderColor: i <= activePhase ? phase.accent : 'rgba(255,255,255,0.06)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                    }}
                  >
                    <div
                      className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center mb-3 lg:mb-4 transition-all duration-500`}
                      style={{ opacity: i <= activePhase ? 1 : 0.3 }}
                    >
                      <phase.icon size={16} className="text-white" />
                    </div>
                    <div className="text-xs font-bold text-white/30 mb-1">PHASE {phase.phase}</div>
                    <h3
                      className="text-xs lg:text-sm font-bold mb-1.5 lg:mb-2 transition-colors duration-500"
                      style={{ color: i === activePhase ? '#fff' : 'rgba(255,255,255,0.4)' }}
                    >
                      {phase.title}
                    </h3>
                    <p
                      className="text-xs leading-relaxed transition-colors duration-500"
                      style={{ color: i === activePhase ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.2)' }}
                    >
                      {phase.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: big active card + dots */}
            <div className="md:hidden mb-4">
              <div
                className="relative rounded-2xl p-0.5 mb-3 transition-all duration-500"
                style={{ background: `linear-gradient(135deg, ${activeP.accent}80, ${activeP.accent}20)` }}
              >
                <div
                  className="glass-card rounded-xl p-5"
                  style={{ borderColor: activeP.accent, borderWidth: '1px', borderStyle: 'solid' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${activeP.color} flex items-center justify-center`}>
                      <activeP.icon size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white/30">PHASE {activeP.phase}</div>
                      <h3 className="text-base font-bold text-white">{activeP.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{activeP.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                {phases.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-500"
                    style={{
                      width: i === activePhase ? '24px' : '6px',
                      height: '6px',
                      background: i <= activePhase ? phases[i].accent : 'rgba(255,255,255,0.15)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${progress * 100}%`,
                  background: 'linear-gradient(90deg, #8B2FE0, #2563EB, #06B6D4)',
                  boxShadow: '0 0 8px rgba(139,47,224,0.6)',
                }}
              />
            </div>
            <div className="flex justify-between mt-2.5 text-xs font-black">
              <span className="text-white/40">Start</span>
              <span
                className="tracking-widest uppercase"
                style={{
                  color: '#fff',
                  textShadow: '0 0 12px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,1)',
                  WebkitTextStroke: '0px',
                }}
              >
                Phase {activeP.phase} / 05
              </span>
              <span className="text-white/40">Launch</span>
            </div>
          </div>
        </div>
      </div>

      {/* Final statement */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="text-center glass-card rounded-3xl p-6 sm:p-12 lg:p-16 border border-white/[0.06] relative overflow-hidden" style={{ background: 'rgba(8,12,20,0.88)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B2FE0]/5 via-transparent to-[#06B6D4]/5" />
          <div className="relative z-10">
            <p className="text-xl sm:text-3xl lg:text-5xl font-black text-white mb-2 sm:mb-4 leading-tight">
              "IT'S NOT ABOUT THE AD."
            </p>
            <p className="text-xl sm:text-3xl lg:text-5xl font-black text-gradient mb-4 sm:mb-8 leading-tight">
              "IT'S ABOUT THE MESSAGE."
            </p>
            <p className="text-white/50 text-sm sm:text-lg max-w-lg mx-auto">
              CloutKart builds the message first. Everything else scales from there.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
