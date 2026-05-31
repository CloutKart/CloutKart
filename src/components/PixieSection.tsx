import { useEffect, useRef } from 'react';
import { Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

function DemoMock() {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl" style={{ background: '#111111' }}>
      {/* top bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {['#EF4444','#F59E0B','#10B981'].map(c => (
          <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
        ))}
        <span className="ml-2 text-[10px] text-white/20 font-mono">clout-kart.com/dashboard</span>
      </div>

      <div className="grid grid-cols-2 gap-0">
        {/* ── LEFT: Brief form ── */}
        <div className="p-4 border-r border-white/[0.06]">
          <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 font-mono">New Creative Brief</div>
          {[
            { label: 'Brand Name', value: 'mCaffeine' },
            { label: 'Industry / Niche', value: 'Coffee Body Scrub · 100g' },
            { label: 'Ad Format', value: 'Static' },
          ].map(f => (
            <div key={f.label} className="mb-2.5">
              <div className="text-[9px] text-white/35 uppercase tracking-wider mb-1 font-mono">{f.label}</div>
              <div className="rounded-lg px-2.5 py-1.5 text-[11px] text-white/70"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {f.value}
              </div>
            </div>
          ))}
          <div className="mb-3">
            <div className="text-[9px] text-white/35 uppercase tracking-wider mb-1 font-mono">Brief Description</div>
            <div className="rounded-lg px-2.5 py-2 text-[10px] text-white/50 leading-relaxed"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              100% vegan, dermatologist-tested coffee body scrub with Arabica Coffee, Coconut Oil & Vitamin E. Exfoliates dead skin, reduces tan, leaves skin visibly glowing…
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#A855F7,#6366F1)' }}>
            <Sparkles size={9} />
            Regenerate Vision
          </button>
        </div>

        {/* ── RIGHT: Vision panel ── */}
        <div className="flex flex-col" style={{ background: 'rgba(255,255,255,0.015)' }}>
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <Sparkles size={10} style={{ color: '#A855F7' }} />
              <span className="text-[11px] font-bold text-white font-heading">Our vision</span>
            </div>
            <span className="flex items-center gap-1 text-[8px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#C084FC' }}>
              <Sparkles size={7} />
              Pixie · AI Creative Intelligence
            </span>
          </div>

          {/* Creative vibe */}
          <div className="px-4 py-2.5 border-b border-white/[0.05]">
            <div className="text-[8px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 font-mono">Creative Vibe</div>
            <div className="flex items-start gap-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0"
                style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.35)', color: '#E9D5FF' }}>
                Brewed Awakening
              </span>
              <span className="text-[9px] text-white/40 leading-relaxed">
                Where coffee ritual meets skin transformation — raw, earthy, unapologetically effective.
              </span>
            </div>
          </div>

          {/* Color story */}
          <div className="px-4 py-2.5 border-b border-white/[0.05]">
            <div className="text-[8px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 font-mono">Color Story</div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { name: 'Mocha Morning', hex: '#964800' },
                { name: 'Coconut Cream', hex: '#F5F5DC' },
                { name: 'Fresh Brew', hex: '#432B1A' },
              ].map(c => (
                <div key={c.name} className="rounded-lg px-2 py-1.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-3 h-3 rounded-full flex-shrink-0 border border-white/20" style={{ background: c.hex }} />
                    <span className="text-[8px] text-white/60 font-medium leading-tight">{c.name}</span>
                  </div>
                  <span className="text-[8px] font-mono text-white/25">{c.hex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hook — the star */}
          <div className="px-4 py-2.5 border-b border-white/[0.05]">
            <div className="text-[8px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 font-mono">Hook</div>
            <div className="rounded-lg px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="text-[13px] font-bold text-white font-heading leading-tight">
                Tan lines are so last season
              </span>
            </div>
          </div>

          {/* What we will create */}
          <div className="px-4 py-2.5 border-b border-white/[0.05]">
            <div className="text-[8px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 font-mono">What We Will Create</div>
            <div className="space-y-1">
              {[
                'Static image ad — Instagram feed 1080×1080px',
                'Static image ad — Facebook feed 1080×1080px',
                'Static image ad — Instagram Story 1080×1920px',
                'Static image ad — Amazon listing 1000×1000px',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle size={9} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span className="text-[9px] text-white/50 leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 flex items-center justify-between mt-auto">
            <span className="text-[9px] text-white/25 border border-white/[0.08] rounded-lg px-2 py-1">→ Shop Now</span>
            <button className="text-[9px] font-bold px-3 py-1.5 rounded-lg text-white"
              style={{ background: 'linear-gradient(135deg,#A855F7,#6366F1)' }}>
              Approve vision
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  onSignupOpen: () => void;
}

export default function PixieSection({ onSignupOpen }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-scale').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 80);
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
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="pixie" style={{ background: 'transparent' }}>
      {/* purple ambient glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.07) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14 md:mb-20">
          <div className="reveal eyebrow-pill mb-7">
            <Sparkles size={11} className="text-brand-purple" />
            AI Creative Intelligence
          </div>
          <h2 className="reveal delay-100 font-heading font-bold leading-[1.06] tracking-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
            Meet Pixie — your
            <br />
            <span className="gradient-text">AI creative director</span>
          </h2>
          <p className="reveal delay-200 text-[#D1D5DB] text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Submit a brief. Upload a product photo. Pixie generates your entire creative vision in seconds —
            vibe, color story, hook, caption, and deliverables.{' '}
            <span className="text-white font-medium">Your team starts at 80% instead of zero.</span>
          </p>
        </div>

        {/* Two-col: bullets + demo */}
        <div className="grid lg:grid-cols-[360px_1fr] gap-10 lg:gap-16 items-center mb-14 md:mb-20">
          {/* Bullets + CTA */}
          <div>
            <div className="space-y-5 mb-8">
              {[
                { headline: 'Brief submitted → Vision generated instantly',    sub: 'No back-and-forth. No waiting for a strategist to have bandwidth.' },
                { headline: 'Hooks written by creative psychology, not generic AI', sub: 'Six proven psychological triggers. One scroll-stopper. Every time.' },
                { headline: 'Every output tailored to your product',            sub: 'Your audience, your platform, your brand. Nothing interchangeable.' },
              ].map((item, i) => (
                <div key={i} className="reveal flex items-start gap-3.5"
                  style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                    style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                    <CheckCircle size={11} className="text-brand-purple" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm leading-snug mb-0.5">{item.headline}</div>
                    <div className="text-[#9CA3AF] text-xs leading-relaxed">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="reveal" style={{ transitionDelay: '280ms' }}>
              <button onClick={onSignupOpen} className="btn-primary text-sm">
                Try Pixie Free <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Demo window */}
          <div className="reveal reveal-scale" style={{ transitionDelay: '120ms' }}>
            <DemoMock />
          </div>
        </div>

        {/* Closer */}
        <div className="reveal text-center">
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: '#9CA3AF' }}>
            Pixie isn't a chatbot.{' '}
            <span className="text-white font-medium">
              It's a creative engine built specifically for ad production.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
