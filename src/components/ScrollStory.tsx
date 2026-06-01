import { useEffect, useRef, useState } from 'react';
import { Sparkles, CheckCircle, ShoppingCart, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Scene components ─────────────────────────────────────────────────────────

function BriefScene({ localProg }: { localProg: number }) {
  const lines = ['Brewora Coffee Body Scrub — 100% vegan, dermatologist-tested', 'enriched with Arabica Coffee, Coconut Oil and Vitamin E.', 'Target: skin-conscious 18–32F. Goal: reduce tan, boost glow.'];
  const charTotal = lines.join('').length;
  const charsVisible = Math.floor(localProg * charTotal * 1.4);
  let shown = 0;

  return (
    <div
      className="w-full max-w-md rounded-2xl overflow-hidden"
      style={{ background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
    >
      <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[11px] font-bold text-white/50 font-mono uppercase tracking-widest">New Creative Brief</div>
      </div>
      <div className="p-5 space-y-3.5">
        {[
          { label: 'Brand Name', val: 'Brewora' },
          { label: 'Industry / Niche', val: 'Coffee Body Scrub · 100g' },
          { label: 'Ad Format', val: 'Static' },
        ].map(f => (
          <div key={f.label}>
            <div className="text-[9px] uppercase tracking-widest text-white/25 mb-1.5 font-mono">{f.label}</div>
            <div className="rounded-lg px-3 py-2 text-[12px] text-white/70"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {f.val}
            </div>
          </div>
        ))}
        <div>
          <div className="text-[9px] uppercase tracking-widest text-white/25 mb-1.5 font-mono">Brief Description</div>
          <div className="rounded-lg px-3 py-2.5 text-[11px] text-white/55 leading-relaxed min-h-[72px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {lines.map((line, li) => {
              const lineText = line.split('').map((ch, ci) => {
                const globalIdx = shown++;
                return (
                  <span key={ci} style={{ opacity: globalIdx < charsVisible ? 1 : 0, transition: 'opacity 0.05s' }}>
                    {ch}
                  </span>
                );
              });
              return <span key={li}>{lineText}{li < lines.length - 1 ? ' ' : ''}</span>;
            })}
            {localProg < 0.95 && <span className="inline-block w-0.5 h-3 ml-0.5 align-middle animate-pulse" style={{ background: '#A855F7' }} />}
          </div>
        </div>
        <div
          className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.7), rgba(99,102,241,0.7))', opacity: localProg > 0.7 ? 1 : 0, transition: 'opacity 0.5s' }}
        >
          <Sparkles size={10} />
          See Our Vision
        </div>
      </div>
    </div>
  );
}

function VisionScene({ localProg }: { localProg: number }) {
  const sections = [
    { delay: 0.0, content: 'header' },
    { delay: 0.15, content: 'vibe' },
    { delay: 0.3, content: 'hook' },
    { delay: 0.5, content: 'colors' },
    { delay: 0.7, content: 'deliverables' },
  ];
  const vis = (d: number) => ({ opacity: localProg > d ? 1 : 0, transform: localProg > d ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.4s ease, transform 0.4s ease' });

  return (
    <div
      className="w-full max-w-md rounded-2xl overflow-hidden"
      style={{ background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
    >
      <div style={vis(sections[0].delay)}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={11} style={{ color: '#A855F7' }} />
            <span className="text-sm font-bold text-white font-heading">Our vision</span>
          </div>
          <span className="flex items-center gap-1 text-[8px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#C084FC' }}>
            <Sparkles size={7} /> Pixie · AI Creative Intelligence
          </span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div style={vis(sections[1].delay)}>
          <div className="text-[9px] uppercase tracking-widest text-white/25 mb-2 font-mono">Creative Vibe</div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#E9D5FF' }}>
              Brewed Awakening
            </span>
            <span className="text-[10px] text-white/35 leading-snug">Raw, earthy, unapologetically effective.</span>
          </div>
        </div>
        <div style={vis(sections[2].delay)}>
          <div className="text-[9px] uppercase tracking-widest text-white/25 mb-2 font-mono">Hook</div>
          <div className="px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-[17px] font-bold font-heading text-white">Tan lines are so last season</span>
          </div>
        </div>
        <div style={vis(sections[3].delay)}>
          <div className="text-[9px] uppercase tracking-widest text-white/25 mb-2 font-mono">Color Story</div>
          <div className="grid grid-cols-3 gap-2">
            {[{ name: 'Mocha Morning', hex: '#9B5B1A' }, { name: 'Coconut Cream', hex: '#EDE8D8' }, { name: 'Fresh Brew', hex: '#3A2010' }].map(c => (
              <div key={c.name} className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: c.hex }} />
                  <span className="text-[9px] text-white/50">{c.name}</span>
                </div>
                <span className="text-[9px] font-mono text-white/20">{c.hex}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={vis(sections[4].delay)}>
          <div className="space-y-1.5">
            {['Static image — Instagram feed 1080×1080px', 'Static image — Facebook feed 1080×1080px', 'Story format — 1080×1920px full-bleed'].map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle size={10} style={{ color: '#10B981', flexShrink: 0 }} />
                <span className="text-[10px] text-white/35">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end px-5 py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', ...vis(sections[4].delay) }}>
        <button className="text-[10px] font-bold px-3.5 py-1.5 rounded-lg text-white" style={{ background: 'linear-gradient(135deg,#A855F7,#6366F1)' }}>Approve vision</button>
      </div>
    </div>
  );
}

function AdScene({ localProg }: { localProg: number }) {
  const vis = (d: number) => ({ opacity: localProg > d ? 1 : 0, transform: localProg > d ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)', transition: 'opacity 0.5s ease, transform 0.5s ease' });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
      <div className="relative flex-shrink-0" style={{ width: 180, ...vis(0) }}>
        <div className="rounded-[28px] overflow-hidden"
          style={{ background: '#0f0f0f', border: '2px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}>
          <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-5 h-5 rounded-full" style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }} />
            <span className="text-[9px] font-bold text-white/70">brewora</span>
            <span className="ml-auto text-[8px] text-white/30 font-mono">Sponsored</span>
          </div>
          <div className="relative" style={{ height: 200 }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #3a1a08 0%, #7a3510 40%, #1a0a02 100%)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="rounded-full flex items-center justify-center" style={{ width: 90, height: 90, background: 'linear-gradient(135deg, #9B5B1A, #C4772A, #7A3510)', boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                  <div className="text-center">
                    <div className="text-[8px] font-bold text-white/80 font-mono">mC</div>
                    <div className="text-[6px] text-white/50">COFFEE</div>
                    <div className="text-[6px] text-white/50">SCRUB</div>
                  </div>
                </div>
                <div className="absolute -inset-2 rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(155,91,26,0.3), transparent 70%)' }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', ...vis(0.4) }}>
              <div className="text-[13px] font-bold text-white font-heading leading-tight">Tan lines are so<br />last season</div>
            </div>
          </div>
          <div className="px-3 py-2.5" style={vis(0.6)}>
            <p className="text-[9px] text-white/55 leading-relaxed mb-2">
              <span className="text-white/80 font-semibold">brewora</span> Your tan doesn't have to be permanent. Our coffee scrub buffs it out in 4 washes — tested, proven, loved by 1M+ Indians.
            </p>
            <span className="text-[9px] font-bold" style={{ color: '#A855F7' }}>Shop Now →</span>
          </div>
          <div className="h-6 flex items-center justify-center gap-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-12 h-1 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      <div className="flex sm:flex-col gap-4 sm:gap-3" style={vis(0.5)}>
        {[
          { label: 'CTR', val: '8.4%', bar: 0.84, color: '#A855F7' },
          { label: 'ROAS', val: '10.2×', bar: 0.92, color: '#3B82F6' },
          { label: 'CVR', val: '4.1%', bar: 0.6, color: '#06B6D4' },
        ].map(m => (
          <div key={m.label} className="w-28 sm:w-36">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-white/30 font-mono">{m.label}</span>
              <span className="text-[11px] font-bold font-mono text-white">{m.val}</span>
            </div>
            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${m.bar * 100}%`, background: m.color, transitionDelay: '0.3s' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CartScene({ localProg }: { localProg: number }) {
  const items = ['Brewora Coffee Body Scrub', 'Brewora Face Wash', 'Brewora Night Cream'];
  const visibleItems = Math.floor(localProg * 4);
  const roas = Math.round(localProg * 284);
  const revenue = Math.round(localProg * 428000);

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <ShoppingCart size={14} style={{ color: '#10B981' }} />
          <span className="text-[12px] font-bold text-white font-heading">Cart</span>
          <span className="ml-auto text-[10px] font-mono text-white/30">{visibleItems} item{visibleItems !== 1 ? 's' : ''}</span>
        </div>
        <div className="p-4 space-y-2.5 min-h-[110px]">
          {items.map((item, i) => (
            <div key={item}
              className="flex items-center gap-3 transition-all duration-500"
              style={{ opacity: i < visibleItems ? 1 : 0, transform: i < visibleItems ? 'translateX(0)' : 'translateX(-12px)' }}
            >
              <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #9B5B1A, #C4772A)' }}>
                <span className="text-[7px] font-bold text-white font-mono">mC</span>
              </div>
              <span className="text-[11px] text-white/60 flex-1">{item}</span>
              <span className="text-[10px] font-bold text-white font-mono">×1</span>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4">
          <div
            className="w-full rounded-xl py-2.5 text-center text-[11px] font-bold text-white transition-all duration-500"
            style={{ background: visibleItems >= 2 ? 'linear-gradient(135deg,#A855F7,#6366F1)' : 'rgba(255,255,255,0.06)', opacity: localProg > 0.3 ? 1 : 0 }}
          >
            Place Order
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={11} style={{ color: '#A855F7' }} />
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">ROAS</span>
          </div>
          <div className="font-mono font-bold text-2xl gradient-text">+{roas}%</div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Revenue</span>
          </div>
          <div className="font-mono font-bold text-xl text-white">
            ₹{revenue >= 100000 ? `${(revenue / 100000).toFixed(1)}L` : `${Math.round(revenue / 1000)}k`}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase data ────────────────────────────────────────────────────────────────

const phases = [
  { num: '01', title: 'Write the brief', sub: 'Tell us your brand, niche, and what you want to say. Pixie reads every word.' },
  { num: '02', title: 'Pixie builds the vision', sub: 'Hook, colors, visual direction, ad copy — generated in seconds. Review before a pixel is made.' },
  { num: '03', title: 'The creative ships', sub: 'Production-ready ads, delivered in 48 hours. Every format, every platform, zero ambiguity.' },
  { num: '04', title: 'Cart. Convert. Scale.', sub: 'The right message at the right moment. ROAS climbs. Spend scales. Run it again.' },
];

// ─── Main component ────────────────────────────────────────────────────────────

export default function ScrollStory() {
  const [active, setActive] = useState(0);
  const [localProg, setLocalProg] = useState(1);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setLocalProg(0);
    let start: number | null = null;
    const slideDelay = 420;
    const duration = 1100;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start - slideDelay;
      const prog = Math.max(0, Math.min(elapsed / duration, 1));
      setLocalProg(prog);
      if (prog < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  function goTo(idx: number) {
    if (idx < 0 || idx >= phases.length) return;
    setActive(idx);
  }

  const scenes = [
    <BriefScene localProg={localProg} />,
    <VisionScene localProg={localProg} />,
    <AdScene localProg={localProg} />,
    <CartScene localProg={localProg} />,
  ];

  const progress = active / (phases.length - 1);

  return (
    <section id="story" className="py-20 md:py-28 relative" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="eyebrow-pill inline-flex mb-4">
            <span className="w-1 h-1 rounded-full bg-brand-purple" />
            How It Works
          </div>
          <h2 className="font-heading font-bold text-white leading-tight tracking-tight"
            style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)' }}>
            From brief to{' '}
            <span className="gradient-text">converting creative</span>
            {' '}in four steps
          </h2>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-14 items-center">

          {/* Left: clickable phase list — desktop only */}
          <div className="hidden lg:flex flex-col gap-1">
            {phases.map((p, i) => {
              const isActive = i === active;
              const isPast = i < active;
              return (
                <button key={p.num}
                  onClick={() => goTo(i)}
                  className="flex items-start gap-4 p-3.5 rounded-xl transition-all duration-300 text-left w-full"
                  style={{
                    background: isActive ? 'rgba(168,85,247,0.07)' : 'transparent',
                    border: isActive ? '1px solid rgba(168,85,247,0.2)' : '1px solid transparent',
                  }}
                >
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300"
                      style={{
                        background: isActive ? 'linear-gradient(135deg,#A855F7,#6366F1)' : isPast ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)',
                        border: isActive ? 'none' : isPast ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.07)',
                        color: isActive ? '#fff' : isPast ? '#A855F7' : 'rgba(255,255,255,0.2)',
                      }}>
                      {isPast ? '✓' : p.num}
                    </div>
                    {i < phases.length - 1 && (
                      <div className="w-px h-4 transition-all duration-300"
                        style={{ background: isPast ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.06)' }} />
                    )}
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm leading-snug mb-0.5 transition-colors duration-300"
                      style={{ color: isActive ? '#fff' : isPast ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)' }}>
                      {p.title}
                    </div>
                    <p className="text-[11px] leading-relaxed transition-colors duration-300 hidden xl:block"
                      style={{ color: isActive ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.1)' }}>
                      {p.sub}
                    </p>
                  </div>
                </button>
              );
            })}
            {/* Progress bar */}
            <div className="mt-3 ml-8">
              <div className="h-px bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg,#A855F7,#3B82F6,#06B6D4)' }} />
              </div>
            </div>
          </div>

          {/* Right: horizontal scene carousel */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.05) 0%, transparent 70%)' }} />
            <div className="overflow-hidden">
              <div
                style={{
                  display: 'flex',
                  transform: `translateX(-${active * 100}%)`,
                  transition: 'transform 0.42s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  willChange: 'transform',
                }}
              >
                {scenes.map((scene, i) => (
                  <div key={i} style={{ minWidth: '100%', flexShrink: 0 }}>
                    <div className="flex items-center justify-center py-2">
                      {scene}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav — shared mobile + desktop */}
        <div className="flex items-center justify-between mt-8 lg:mt-6 lg:pl-[316px]">
          {/* Mobile phase label */}
          <div className="lg:hidden">
            <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest">Phase {phases[active].num}</div>
            <div className="font-heading font-bold text-white text-sm">{phases[active].title}</div>
          </div>
          {/* Desktop spacer */}
          <div className="hidden lg:block" />

          {/* Dots + arrows */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                opacity: active === 0 ? 0.3 : 1,
              }}
            >
              <ChevronLeft size={16} className="text-white" />
            </button>

            <div className="flex items-center gap-2">
              {phases.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === active ? 20 : 6,
                    height: 6,
                    background: i <= active ? 'linear-gradient(90deg,#A855F7,#06B6D4)' : 'rgba(255,255,255,0.1)',
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => goTo(active + 1)}
              disabled={active === phases.length - 1}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                opacity: active === phases.length - 1 ? 0.3 : 1,
              }}
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
