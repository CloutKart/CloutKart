import { useEffect, useRef } from 'react';
import { ArrowRight, Play, Target, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  onSignupOpen: () => void;
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left */}
          <div className="text-left">
            <div className="eyebrow-pill mb-6 sm:mb-8 animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
              AI Creative Agency
            </div>

            <h1
              className="font-heading font-bold leading-[1.08] tracking-[-0.03em] mb-5 sm:mb-7 animate-fade-up delay-100"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
            >
              <span className="text-white block">AI-Powered Ads</span>
              <span className="text-white block">That Actually</span>
              <span className="gradient-text-animated block">Convert.</span>
            </h1>

            <p className="text-[#D1D5DB] text-base sm:text-lg leading-[1.75] mb-8 sm:mb-10 max-w-lg animate-fade-up delay-200">
              We build the winning message first — then transform it into creatives that actually perform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-up delay-300">
              <button onClick={handlePrimary} className="btn-primary text-sm sm:text-base">
                Get Your Free Creative
                <ArrowRight size={15} />
              </button>
              <a href="#portfolio" className="btn-secondary text-sm sm:text-base">
                <Play size={13} />
                See Our Work
              </a>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-white/[0.07] animate-fade-up delay-400">
              {[
                { value: '500+', label: 'Brands Scaled' },
                { value: '10x', label: 'Avg ROAS' },
                { value: '48h', label: 'Turnaround' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-1 tracking-tight">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-[#9CA3AF] font-medium leading-tight uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Hero visual */}
          <div className="relative h-[520px] hidden lg:block">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 glass-card rounded-3xl p-6 animate-float" style={{ zIndex: 2 }}>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl icon-gradient flex items-center justify-center">
                    <Target size={17} className="text-brand-purple" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#9CA3AF] font-medium font-mono">Campaign</div>
                    <div className="text-sm font-semibold text-white font-heading">Winning Message</div>
                  </div>
                </div>
                <div className="w-full h-28 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-4 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 to-brand-cyan/10" />
                  <div className="text-center relative z-10">
                    <div className="text-2xl font-bold font-heading gradient-text tracking-tight">50% OFF</div>
                    <div className="text-xs text-[#9CA3AF] mt-1 font-mono">Limited Time Offer</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#9CA3AF] font-medium font-mono">CTR</span>
                  <span className="text-white font-semibold font-mono">8.4%</span>
                </div>
                <div className="w-full bg-white/[0.07] rounded-full h-1">
                  <div className="h-1 rounded-full w-4/5" style={{ background: 'linear-gradient(90deg, #A855F7, #3B82F6, #06B6D4)' }} />
                </div>
              </div>
            </div>

            <div className="absolute top-8 right-4 glass-card rounded-2xl p-4 w-48 animate-float-delayed" style={{ zIndex: 1 }}>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={13} className="text-brand-purple" />
                  <span className="text-xs font-semibold text-[#D1D5DB] font-heading">AI Processing</span>
                </div>
                <div className="space-y-2">
                  {[80, 55, 90].map((w, i) => (
                    <div key={i} className="h-1 bg-white/[0.07] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full animate-pulse"
                        style={{ width: `${w}%`, animationDelay: `${i * 0.3}s`, background: 'linear-gradient(90deg, #A855F7, #3B82F6)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-20 right-0 glass-card rounded-2xl p-4 w-44 animate-float-slow" style={{ zIndex: 1 }}>
              <div className="relative z-10">
                <TrendingUp size={15} className="text-brand-cyan mb-2" />
                <div className="text-2xl font-bold font-mono gradient-text tracking-tight mb-0.5">+284%</div>
                <div className="text-xs text-[#9CA3AF] font-medium">ROAS increase</div>
              </div>
            </div>

            <div className="absolute top-24 left-0 glass-card rounded-2xl p-4 w-40 animate-float" style={{ zIndex: 1 }}>
              <div className="relative z-10">
                <div className="text-[11px] text-[#9CA3AF] font-medium mb-2 font-mono">Formats</div>
                <div className="space-y-1.5">
                  {['Image Ad', 'TikTok', 'Landing Page'].map((f) => (
                    <div key={f} className="text-xs font-medium text-[#D1D5DB] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-brand-purple" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-8 glass-card rounded-2xl p-3 w-52 animate-float-delayed" style={{ zIndex: 1 }}>
              <div className="relative z-10">
                <div className="text-[11px] text-[#9CA3AF] font-medium mb-2 font-mono">Message Performance</div>
                <div className="flex items-end gap-1 h-10">
                  {[4, 6, 5, 8, 7, 10, 9].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h * 10}%`,
                        background: 'linear-gradient(to top, #A855F7, #06B6D4)',
                        opacity: 0.3 + i * 0.08,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to top, #080808, transparent)' }} />

      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2">
        <div className="text-[9px] text-white/20 font-medium tracking-[0.25em] uppercase animate-bounce font-mono">Scroll</div>
        <div className="w-px h-5 bg-gradient-to-b from-brand-purple/40 to-transparent" />
      </div>
    </section>
  );
}
