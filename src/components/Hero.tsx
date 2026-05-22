import { useEffect, useRef } from 'react';
import { ArrowRight, Play, Zap, Target, TrendingUp } from 'lucide-react';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current || !heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glowRef.current.style.left = `${x}px`;
      glowRef.current.style.top = `${y}px`;
    };
    const el = heroRef.current;
    el?.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => el?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-[#080C14]"
      id="hero"
    >
      {/* Mouse glow — desktop only */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute w-[600px] h-[600px] rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 hidden md:block"
        style={{
          background: 'radial-gradient(circle, rgba(139,47,224,0.06) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Background orbs */}
      <div className="orb w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] -top-48 -left-32 sm:-left-64 opacity-20" style={{ background: 'radial-gradient(circle, #8B2FE0, transparent)', animationDelay: '0s' }} />
      <div className="orb w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] -bottom-32 -right-24 sm:-right-48 opacity-15" style={{ background: 'radial-gradient(circle, #2563EB, transparent)', animationDelay: '3s' }} />
      <div className="orb w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" style={{ background: 'radial-gradient(circle, #06B6D4, transparent)', animationDelay: '6s' }} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(139,47,224,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,47,224,0.5) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-10 sm:pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div className="text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass border border-[#8B2FE0]/30 rounded-full px-4 py-2 text-xs font-semibold text-[#a78bfa] mb-6 sm:mb-8 animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
              AI Creatives That Drive Results
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-4 sm:mb-6 animate-fade-up delay-100">
              <span className="text-white">AI-Powered Ads</span>
              <br />
              <span className="text-gradient">That Actually</span>
              <br />
              <span className="text-white">Convert.</span>
            </h1>

            <p className="text-white/50 text-sm sm:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-10 max-w-xl animate-fade-up delay-200">
              CloutKart helps brands create high-converting creative using AI, strategic messaging, and direct-response thinking.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-up delay-300">
              <a
                href="#contact"
                className="group relative inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-4 text-sm font-semibold text-white rounded-full overflow-hidden touch-manipulation"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#8B2FE0] via-[#2563EB] to-[#06B6D4]" />
                <span className="absolute inset-0 bg-gradient-to-r from-[#8B2FE0] via-[#2563EB] to-[#06B6D4] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                <span className="relative">Contact Us</span>
                <ArrowRight size={16} className="relative group-hover:translate-x-1 transition-transform duration-200" />
              </a>
              <a
                href="#portfolio"
                className="group inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-4 text-sm font-semibold text-white/70 hover:text-white rounded-full glass border border-white/10 hover:border-white/20 transition-all duration-300 touch-manipulation"
              >
                <Play size={14} className="group-hover:scale-110 transition-transform" />
                See Our Work
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-14 pt-6 sm:pt-10 border-t border-white/[0.06] animate-fade-up delay-400">
              {[
                { value: '500+', label: 'Creatives Delivered' },
                { value: '10x', label: 'Average ROAS Boost' },
                { value: '48h', label: 'Turnaround Time' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-gradient mb-1">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-white/40 font-medium leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual composition — desktop only */}
          <div className="relative h-[600px] hidden lg:block">
            {/* Central glass card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 glass-card rounded-3xl p-6 border-gradient animate-float glow-purple">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B2FE0] to-[#2563EB] flex items-center justify-center">
                  <Target size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-xs text-white/40">Campaign</div>
                  <div className="text-sm font-semibold text-white">Winning Message</div>
                </div>
              </div>
              <div className="w-full h-32 rounded-xl bg-gradient-to-br from-[#8B2FE0]/20 via-[#2563EB]/20 to-[#06B6D4]/20 mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-black text-gradient">50% OFF</div>
                  <div className="text-xs text-white/60 mt-1">Limited Time Offer</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">CTR</span>
                <span className="text-[#06B6D4] font-bold">8.4%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-1.5">
                <div className="bg-gradient-to-r from-[#8B2FE0] to-[#06B6D4] h-1.5 rounded-full w-4/5" />
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute top-8 right-8 glass-card rounded-2xl p-4 w-48 animate-float-delayed border border-[#2563EB]/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-[#06B6D4]" />
                <span className="text-xs font-semibold text-white">AI Processing</span>
              </div>
              <div className="space-y-1.5">
                {[80, 60, 90].map((w, i) => (
                  <div key={i} className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8B2FE0] to-[#06B6D4] rounded-full animate-pulse"
                      style={{ width: `${w}%`, animationDelay: `${i * 0.3}s` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-16 right-0 glass-card rounded-2xl p-4 w-44 animate-float-slow border border-[#06B6D4]/20">
              <TrendingUp size={16} className="text-[#06B6D4] mb-2" />
              <div className="text-2xl font-black text-white mb-0.5">+284%</div>
              <div className="text-xs text-white/40">ROAS increase</div>
            </div>

            <div className="absolute top-24 left-0 glass-card rounded-2xl p-4 w-40 animate-float border border-[#8B2FE0]/20">
              <div className="text-xs text-white/40 mb-1">Formats</div>
              <div className="space-y-1">
                {['Image Ad', 'TikTok', 'Landing Page'].map((f) => (
                  <div key={f} className="text-xs font-medium text-white/70 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-gradient-to-r from-[#8B2FE0] to-[#06B6D4]" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-4 left-8 glass-card rounded-2xl p-3 w-52 animate-float-delayed border border-[#8B2FE0]/20">
              <div className="text-xs text-white/40 mb-2">Message Performance</div>
              <div className="flex items-end gap-1 h-10">
                {[4, 6, 5, 8, 7, 10, 9].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-[#8B2FE0] to-[#06B6D4]"
                    style={{ height: `${h * 10}%`, opacity: 0.6 + i * 0.05 }}
                  />
                ))}
              </div>
            </div>

            {/* Decorative glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#8B2FE0]/10 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#2563EB]/5 blur-3xl pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080C14] to-transparent pointer-events-none" />

      {/* Scroll indicator */}
      <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center gap-2 animate-bounce">
        <div className="text-xs text-white/30 font-medium tracking-widest uppercase">Scroll</div>
        <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  );
}
