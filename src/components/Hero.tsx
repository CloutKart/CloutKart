import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  onSignupOpen: () => void;
}

function VisionPreview() {
  const colors = [
    { name: 'Mocha Morning', hex: '#9B5B1A' },
    { name: 'Coconut Cream', hex: '#EDE8D8' },
    { name: 'Fresh Brew', hex: '#3A2010' },
  ];
  const deliverables = [
    'Static image ad — Instagram feed 1080×1080px',
    'Static image ad — Facebook feed 1080×1080px',
    'Static image ad — Story 1080×1920px',
  ];

  return (
    <div className="relative">
      {/* Brief pill — floats above */}
      <div
        className="absolute -top-5 left-6 z-10 flex items-center gap-2.5 rounded-full px-4 py-2 animate-float-delayed"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)' }}
      >
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#A855F7' }} />
        <span className="text-[11px] font-medium text-white/60 font-mono">Brief submitted · Brewora Coffee Scrub</span>
      </div>

      {/* Status pill — floats top right */}
      <div
        className="absolute -top-5 right-2 z-10 flex items-center gap-2 rounded-full px-3 py-1.5 animate-float"
        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', backdropFilter: 'blur(12px)' }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
        <span className="text-[10px] font-semibold font-mono" style={{ color: '#10B981' }}>In Review</span>
      </div>

      {/* Main vision card */}
      <div
        className="rounded-2xl animate-float"
        style={{
          background: 'rgba(12,12,12,0.9)',
          border: '1px solid rgba(255,255,255,0.09)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={12} style={{ color: '#A855F7' }} />
            <span className="text-sm font-bold text-white font-heading tracking-tight">Our vision</span>
          </div>
          <span
            className="flex items-center gap-1 text-[9px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#C084FC' }}
          >
            <Sparkles size={7} />
            Pixie · AI Creative Intelligence
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Vibe */}
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25 mb-2 font-mono">Creative Vibe</div>
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-[11px] font-bold"
                style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#E9D5FF' }}
              >
                Brewed Awakening
              </span>
              <span className="text-[11px] text-white/40 leading-snug">Raw, earthy, unapologetically effective.</span>
            </div>
          </div>

          {/* Hook — the centrepiece */}
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25 mb-2 font-mono">Hook</div>
            <div
              className="px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-[18px] font-bold font-heading text-white leading-tight">
                Tan lines are so last season
              </span>
            </div>
          </div>

          {/* Color story */}
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25 mb-2 font-mono">Color Story</div>
            <div className="flex items-center gap-3">
              {colors.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full border border-white/15 flex-shrink-0" style={{ background: c.hex }} />
                  <span className="text-[10px] text-white/40">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-1.5">
            {deliverables.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle size={10} style={{ color: '#10B981', flexShrink: 0 }} />
                <span className="text-[10px] text-white/40">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end px-5 py-3.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            className="text-[11px] font-bold px-4 py-2 rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
          >
            Approve vision
          </button>
        </div>
      </div>

      {/* Deliverable ready pill — floats bottom left */}
      <div
        className="absolute -bottom-5 left-4 z-10 flex items-center gap-2 rounded-full px-3.5 py-2 animate-float-slow"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)' }}
      >
        <CheckCircle size={11} style={{ color: '#10B981', flexShrink: 0 }} />
        <span className="text-[10px] font-medium text-white/55 font-mono">Creatives delivered · 48h</span>
      </div>

      {/* ROAS pill — floats bottom right */}
      <div
        className="absolute -bottom-5 right-2 z-10 flex items-center gap-2.5 rounded-full px-4 py-2 animate-float-delayed"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)' }}
      >
        <span className="font-mono text-sm font-bold gradient-text-warm">+284%</span>
        <span className="text-[11px] text-white/40">avg ROAS lift</span>
      </div>
    </div>
  );
}

export default function Hero({ onSignupOpen }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Stat counter state
  const [statsVisible, setStatsVisible] = useState(false);
  const [counts, setCounts] = useState({ brands: 0, roas: 0, turnaround: 0 });
  const [convertActive, setConvertActive] = useState(false);

  // Scroll-reveal for .reveal, .reveal-scale, and .reveal-clip elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-scale, .reveal-clip').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 80);
            });
            // Wait for Borel to load then trigger the write animation
            document.fonts.ready.then(() => {
              setTimeout(() => setConvertActive(true), 900);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Animated stat counters — one-shot on first intersection
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsVisible) {
          setStatsVisible(true);
          const duration = 1200;
          let start: number | null = null;
          const tick = (ts: number) => {
            if (!start) start = ts;
            const prog = Math.min((ts - start) / duration, 1);
            const eased = 1 - (1 - prog) * (1 - prog); // ease-out quad
            setCounts({
              brands: Math.floor(eased * 500),
              roas: Math.round(eased * 100) / 10,       // 0.0 → 10.0
              turnaround: Math.floor(eased * 48),
            });
            if (prog < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [statsVisible]);

  const handlePrimary = () => {
    if (isLoggedIn) navigate('/dashboard');
    else onSignupOpen();
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      id="hero"
      style={{ background: 'transparent' }}
    >
      {/* Ambient background orbs — pure radial gradients, no filter:blur, GPU-safe */}
      <div
        className="absolute pointer-events-none animate-orb-drift"
        style={{
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)',
          top: '-8%', left: '-12%', zIndex: 0,
        }}
      />
      <div
        className="absolute pointer-events-none animate-orb-drift-alt"
        style={{
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)',
          top: '35%', right: '-8%', zIndex: 0,
          animationDelay: '-10s',
        }}
      />
      <div
        className="absolute pointer-events-none animate-orb-drift"
        style={{
          width: '360px', height: '360px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 70%)',
          bottom: '8%', left: '28%', zIndex: 0,
          animationDelay: '-16s',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Left */}
          <div className="text-left">
            <div className="eyebrow-pill mb-6 sm:mb-8 animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
              AI Creative Operations Platform
            </div>

            {/* Headline — each word line gets a clip-path reveal with staggered delay */}
            <h1
              className="font-heading font-extrabold leading-[1.03] tracking-[-0.035em] mb-6"
              style={{ fontSize: 'clamp(3rem, 7vw, 5.6rem)' }}
            >
              <span
                className="reveal-clip block overflow-hidden"
                style={{ color: '#F5F0EB', transitionDelay: '0ms' }}
              >
                AI-Powered Ads
              </span>
              <span
                className="reveal-clip block overflow-hidden"
                style={{ color: '#F5F0EB', transitionDelay: '120ms' }}
              >
                That Actually
              </span>
              {/* "Convert." — Borel script with left-to-right wipe (pen-on-paper effect) */}
              <span className="block" style={{ lineHeight: 1.15 }}>
                <span
                  className={`gradient-text-warm${convertActive ? ' animate-hello-write' : ''}`}
                  style={{
                    fontFamily: "'Borel', cursive",
                    fontSize: 'clamp(3rem, 7vw, 5.6rem)',
                    fontWeight: 400,
                    display: 'inline-block',
                    paddingBottom: '0.08em',
                    ...(convertActive ? {} : { clipPath: 'inset(0 102% 0 0)' }),
                  }}
                >
                  Convert.
                </span>
              </span>
            </h1>

            <p className="text-[#9CA3AF] text-base sm:text-lg leading-[1.8] mb-9 max-w-md animate-fade-up delay-200">
              A complete creative operations platform — submit briefs, manage requests, review deliverables, and collaborate with your team in one place. Powered by <span className="text-white font-semibold">Pixie</span>, our AI engine that turns product info into campaign-ready hooks, color stories, and visual direction before production begins.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-up delay-300">
              <button onClick={handlePrimary} className="btn-primary text-sm sm:text-base">
                Get Your Free Creative
                <ArrowRight size={15} />
              </button>
              <a href="#portfolio" className="btn-secondary text-sm sm:text-base">
                See Our Work
              </a>
            </div>

            {/* Animated stat counters */}
            <div
              ref={statsRef}
              className="grid grid-cols-3 gap-4 mt-12 pt-10 animate-fade-up delay-400"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className={statsVisible ? 'animate-count-up' : ''}>
                <div className="font-mono text-2xl sm:text-3xl font-bold gradient-text-warm mb-1 tracking-tight">
                  {statsVisible ? `${counts.brands}+` : '0+'}
                </div>
                <div className="text-[10px] sm:text-xs text-white/30 font-medium uppercase tracking-widest">Brands Scaled</div>
              </div>
              <div className={statsVisible ? 'animate-count-up' : ''} style={{ animationDelay: '60ms' }}>
                <div className="font-mono text-2xl sm:text-3xl font-bold gradient-text-warm mb-1 tracking-tight">
                  {statsVisible ? (counts.roas >= 10 ? '10×' : `${counts.roas.toFixed(1)}×`) : '0×'}
                </div>
                <div className="text-[10px] sm:text-xs text-white/30 font-medium uppercase tracking-widest">Avg ROAS</div>
              </div>
              <div className={statsVisible ? 'animate-count-up' : ''} style={{ animationDelay: '120ms' }}>
                <div className="font-mono text-2xl sm:text-3xl font-bold gradient-text-warm mb-1 tracking-tight">
                  {statsVisible ? `${counts.turnaround}h` : '0h'}
                </div>
                <div className="text-[10px] sm:text-xs text-white/30 font-medium uppercase tracking-widest">Turnaround</div>
              </div>
            </div>
          </div>

          {/* Right: product demo */}
          <div className="hidden lg:block py-8 px-4">
            <VisionPreview />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to top, #080808, transparent)' }} />
    </section>
  );
}
