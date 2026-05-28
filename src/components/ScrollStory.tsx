import { useEffect, useRef, useState } from 'react';
import { Sparkles, Cpu, ShoppingCart, Rocket } from 'lucide-react';

const phases = [
  {
    icon: Sparkles,
    phase: '01',
    title: 'The Idea Emerges',
    desc: 'Abstract concepts crystallize into clear, powerful messaging. Brand DNA analyzed. Market decoded.',
  },
  {
    icon: Cpu,
    phase: '02',
    title: 'The Creative Lab',
    desc: 'AI processes, refines, and optimizes. Multiple variations tested. The winning angle surfaces.',
  },
  {
    icon: ShoppingCart,
    phase: '03',
    title: 'The Cart Moment',
    desc: 'The winning message locks in. Production-ready. Polished. Primed for maximum impact.',
  },
  {
    icon: Rocket,
    phase: '04',
    title: 'Launch & Scale',
    desc: 'One message. Infinite formats. Instagram, TikTok, video, landing pages — all from the same foundation.',
  },
];

export default function ScrollStory() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.02 }
    );
    if (outerRef.current) obs.observe(outerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!outerRef.current) return;
      const rect = outerRef.current.getBoundingClientRect();
      const scrollable = outerRef.current.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const earlyTrigger = window.innerHeight * 0.3;
      const scrolled = -rect.top + earlyTrigger;
      const pct = Math.max(0, Math.min(1, scrolled / scrollable));
      setProgress(pct);

      if (pct < 0.80) {
        setShowFinal(false);
        const phasePct = pct / 0.80;
        setActivePhase(Math.min(phases.length - 1, Math.floor(phasePct * phases.length)));
      } else {
        setShowFinal(true);
        setActivePhase(phases.length - 1);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const activeP = phases[activePhase];

  return (
    <section id="story" className="relative" style={{ background: 'transparent' }}>
      <div className="section-divider mb-0" />

      <div ref={outerRef} className="h-[140vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">

          {/* Phase view */}
          <div
            className="transition-all duration-700"
            style={{
              opacity: showFinal ? 0 : 1,
              transform: showFinal ? 'scale(0.95) translateY(-20px)' : 'scale(1) translateY(0)',
              position: showFinal ? 'absolute' : 'relative',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div className={`text-center mb-6 md:mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="eyebrow-pill mb-4 inline-flex">
                <span className="w-1 h-1 rounded-full bg-brand-purple" />
                The CloutKart Story
              </div>
              <h2 className="font-heading font-bold text-white leading-tight tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>
                Watch Creativity
                <br />
                <span className="gradient-text">Come to Life</span>
              </h2>
              <p className="text-[#9CA3AF] text-xs sm:text-sm mt-3 font-mono tracking-wide">Scroll to walk through the journey</p>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              {/* Desktop: 4 cards */}
              <div className="hidden md:grid md:grid-cols-4 gap-3 lg:gap-4 mb-6">
                {phases.map((phase, i) => (
                  <div
                    key={phase.phase}
                    className="relative rounded-2xl transition-all duration-500"
                    style={{
                      background: i === activePhase ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: i === activePhase
                        ? '1px solid rgba(168,85,247,0.35)'
                        : i < activePhase
                        ? '1px solid rgba(255,255,255,0.12)'
                        : '1px solid rgba(255,255,255,0.06)',
                      transform: i === activePhase ? 'scale(1.04)' : 'scale(1)',
                      boxShadow: i === activePhase
                        ? '0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(168,85,247,0.15)'
                        : 'none',
                    }}
                  >
                    <div className="p-4 lg:p-5 h-full">
                      <div
                        className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-500"
                        style={{
                          background: i <= activePhase ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)',
                          border: i <= activePhase ? '1px solid rgba(168,85,247,0.25)' : '1px solid rgba(255,255,255,0.07)',
                          opacity: i <= activePhase ? 1 : 0.4,
                        }}
                      >
                        <phase.icon size={15} className={i <= activePhase ? 'text-brand-purple' : 'text-white/40'} />
                      </div>
                      <div className="text-[10px] font-bold text-[#9CA3AF] mb-1 tracking-widest uppercase font-mono">Phase {phase.phase}</div>
                      <h3
                        className="text-xs lg:text-sm font-semibold font-heading mb-1.5 transition-colors duration-500"
                        style={{ color: i === activePhase ? '#ffffff' : i < activePhase ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}
                      >
                        {phase.title}
                      </h3>
                      <p
                        className="text-[11px] leading-relaxed transition-colors duration-500"
                        style={{ color: i === activePhase ? '#D1D5DB' : i < activePhase ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.12)' }}
                      >
                        {phase.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile: active card */}
              <div className="md:hidden mb-5">
                <div className="glass-card rounded-xl p-5 mb-3">
                  <div className="relative z-10 flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl icon-gradient flex items-center justify-center">
                      <activeP.icon size={18} className="text-brand-purple" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest font-mono">Phase {activeP.phase}</div>
                      <h3 className="text-sm font-semibold font-heading text-white">{activeP.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-[#D1D5DB] leading-relaxed relative z-10">{activeP.desc}</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  {phases.map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-500"
                      style={{
                        width: i === activePhase ? '20px' : '4px',
                        height: '4px',
                        background: i <= activePhase
                          ? 'linear-gradient(90deg, #A855F7, #06B6D4)'
                          : 'rgba(255,255,255,0.12)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-px bg-white/[0.07] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${Math.min(progress / 0.65, 1) * 100}%`,
                    background: 'linear-gradient(90deg, #A855F7, #3B82F6, #06B6D4)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-2.5 text-[11px] font-medium font-mono">
                <span className="text-[#9CA3AF]">Start</span>
                <span className="text-[#D1D5DB]">Phase {activeP.phase} / 04</span>
                <span className="text-[#9CA3AF]">Launch</span>
              </div>
            </div>
          </div>

          {/* Final statement */}
          <div
            className="absolute inset-0 flex items-center justify-center px-4 transition-all duration-600"
            style={{
              opacity: showFinal ? 1 : 0,
              transform: showFinal ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(30px)',
              pointerEvents: showFinal ? 'auto' : 'none',
            }}
          >
            <div className="gradient-border max-w-3xl w-full">
              <div className="glass-card rounded-[20px] p-6 sm:p-10 lg:p-16 text-center">
                <div className="relative z-10">
                  <p className="font-heading text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight tracking-tight">
                    "IT'S NOT ABOUT THE AD."
                  </p>
                  <p className="font-heading text-2xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4 sm:mb-6 leading-tight tracking-tight">
                    "IT'S ABOUT THE MESSAGE."
                  </p>
                  <p className="text-[#D1D5DB] text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
                    CloutKart builds the message first. Everything else scales from there.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
