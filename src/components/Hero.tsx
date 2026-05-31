import { useEffect, useRef } from 'react';
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
        <span className="font-mono text-sm font-bold gradient-text">+284%</span>
        <span className="text-[11px] text-white/40">avg ROAS lift</span>
      </div>
    </div>
  );
}

export default function Hero({ onSignupOpen }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

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
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Left */}
          <div className="text-left">
            <div className="eyebrow-pill mb-6 sm:mb-8 animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
              AI Creative Operations Platform
            </div>

            <h1
              className="font-heading font-bold leading-[1.06] tracking-[-0.03em] mb-6 animate-fade-up delay-100"
              style={{ fontSize: 'clamp(2.6rem, 6vw, 4.75rem)' }}
            >
              <span className="text-white block">AI-Powered Ads</span>
              <span className="text-white block">That Actually</span>
              <span className="gradient-text-animated block">Convert.</span>
            </h1>

            <p className="text-[#9CA3AF] text-base sm:text-lg leading-[1.8] mb-9 max-w-md animate-fade-up delay-200">
              A complete creative operations platform — submit briefs, manage requests, review deliverables, and collaborate with your team in one place. Powered by <span className="text-white font-medium">Pixie</span>, our AI engine that turns product info into campaign-ready hooks, color stories, and visual direction before production begins.
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

            {/* Stats row */}
            <div
              className="grid grid-cols-3 gap-4 mt-12 pt-10 animate-fade-up delay-400"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              {[
                { value: '500+', label: 'Brands Scaled' },
                { value: '10×', label: 'Avg ROAS' },
                { value: '48h', label: 'Turnaround' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-mono text-2xl sm:text-3xl font-bold gradient-text mb-1 tracking-tight">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-white/30 font-medium uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
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
