import { useEffect, useRef, useState } from 'react';
import { Sparkles, CheckCircle, ShoppingCart, TrendingUp } from 'lucide-react';

// ─── Scene components ─────────────────────────────────────────────────────────

function BriefScene({ localProg }: { localProg: number }) {
  const lines = ['Brewora Coffee Body Scrub — 100% vegan, dermatologist-tested', 'enriched with Arabica Coffee, Coconut Oil and Vitamin E.', 'Target: skin-conscious 18–32F. Goal: reduce tan, boost glow.'];
  const charTotal = lines.join('').length;
  const charsVisible = Math.floor(localProg * charTotal * 1.4);
  let shown = 0;

  return (
    <div
      className="w-full max-w-md rounded-2xl overflow-hidden"
      style={{ background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
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
      style={{ background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
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
    <div className="flex items-center justify-center gap-6">
      {/* Phone frame */}
      <div
        className="relative flex-shrink-0"
        style={{ width: 200, ...vis(0) }}
      >
        <div
          className="rounded-[28px] overflow-hidden"
          style={{ background: '#0f0f0f', border: '2px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset' }}
        >
          {/* Instagram chrome */}
          <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-5 h-5 rounded-full" style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }} />
            <span className="text-[9px] font-bold text-white/70">brewora</span>
            <span className="ml-auto text-[8px] text-white/30 font-mono">Sponsored</span>
          </div>
          {/* Product image */}
          <div className="relative" style={{ height: 200 }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #3a1a08 0%, #7a3510 40%, #1a0a02 100%)' }} />
            {/* Product can representation */}
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
            {/* Hook overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', ...vis(0.4) }}>
              <div className="text-[13px] font-bold text-white font-heading leading-tight">Tan lines are so<br />last season</div>
            </div>
          </div>
          {/* Caption area */}
          <div className="px-3 py-2.5" style={vis(0.6)}>
            <p className="text-[9px] text-white/55 leading-relaxed mb-2">
              <span className="text-white/80 font-semibold">brewora</span> Your tan doesn't have to be permanent. Our coffee scrub buffs it out in 4 washes — tested, proven, loved by 1M+ Indians.
            </p>
            <span className="text-[9px] font-bold" style={{ color: '#A855F7' }}>Shop Now →</span>
          </div>
          {/* Bottom chrome */}
          <div className="h-6 flex items-center justify-center gap-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-12 h-1 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      {/* Metrics panel */}
      <div className="space-y-3" style={vis(0.5)}>
        {[
          { label: 'CTR', val: '8.4%', bar: 0.84, color: '#A855F7' },
          { label: 'ROAS', val: '10.2×', bar: 0.92, color: '#3B82F6' },
          { label: 'CVR', val: '4.1%', bar: 0.6, color: '#06B6D4' },
        ].map(m => (
          <div key={m.label} className="w-36">
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
      {/* Cart */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
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

      {/* ROAS counter */}
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

// ─── Main component ────────────────────────────────────────────────────────────

const phases = [
  { num: '01', title: 'Write the brief', sub: 'Tell us your brand, niche, and what you want to say. Pixie reads every word.' },
  { num: '02', title: 'Pixie builds the vision', sub: 'Hook, colors, visual direction, ad copy — generated in seconds. Review before a pixel is made.' },
  { num: '03', title: 'The creative ships', sub: 'Production-ready ads, delivered in 48 hours. Every format, every platform, zero ambiguity.' },
  { num: '04', title: 'Cart. Convert. Scale.', sub: 'The right message at the right moment. ROAS climbs. Spend scales. Run it again.' },
];

export default function ScrollStory() {
  const driverRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [localProg, setLocalProg] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (!driverRef.current) return;
      const rect = driverRef.current.getBoundingClientRect();
      const scrollable = driverRef.current.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      // Show fixed panel only while driver is actively scrolling through viewport.
      // Use a 4px buffer so the panel releases before elements below become interactive.
      setShow(rect.top <= 0 && rect.bottom > window.innerHeight + 4);

      const pct = Math.max(0, Math.min(1, -rect.top / scrollable));
      setProgress(pct);

      const phasePct = Math.min(pct / 0.97, 1);
      const phaseIdx = Math.min(phases.length - 1, Math.floor(phasePct * phases.length));
      const phaseStart = phaseIdx / phases.length;
      const phaseEnd = (phaseIdx + 1) / phases.length;
      const lp = Math.max(0, Math.min(1, (phasePct - phaseStart) / (phaseEnd - phaseStart)));
      setActive(phaseIdx);
      setLocalProg(lp);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scenes = [
    <BriefScene localProg={localProg} />,
    <VisionScene localProg={localProg} />,
    <AdScene localProg={localProg} />,
    <CartScene localProg={localProg} />,
  ];

  const bgOffset = progress * -50;
  const midOffset = progress * -25;
  const fgOffset = progress * 18;

  // ── Panel content (shared between fixed overlay and mobile fallback) ──
  const PanelContent = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex flex-col justify-center">
      <div className="text-center mb-8 md:mb-12">
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

      <div className="grid lg:grid-cols-[320px_1fr] gap-8 lg:gap-14 items-center">
        {/* Left: phase tracker */}
        <div className="hidden lg:block space-y-1">
          {phases.map((p, i) => {
            const isActive = i === active;
            const isPast = i < active;
            return (
              <div key={p.num}
                className="flex items-start gap-4 p-3.5 rounded-xl transition-all duration-300"
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
              </div>
            );
          })}
          <div className="mt-4 ml-8">
            <div className="h-px bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-150"
                style={{ width: `${Math.min(progress / 0.97, 1) * 100}%`, background: 'linear-gradient(90deg,#A855F7,#3B82F6,#06B6D4)' }} />
            </div>
          </div>
        </div>

        {/* Mobile phase label */}
        <div className="lg:hidden text-center mb-2">
          <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">Phase {phases[active].num}</div>
          <div className="font-heading font-bold text-white text-base">{phases[active].title}</div>
        </div>

        {/* Right: scene */}
        <div className="flex items-center justify-center"
          style={{ transform: `translateY(${midOffset * 0.4}px)`, transition: 'transform 0.08s linear' }}>
          <div className="relative w-full">
            <div className="absolute -inset-8 rounded-3xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.05) 0%, transparent 70%)', transform: `translateY(${fgOffset * 0.4}px)`, transition: 'transform 0.08s linear' }} />
            <div className="flex items-center justify-center">
              {scenes.map((scene, i) => (
                <div key={i} className="transition-all duration-450"
                  style={{
                    position: i === active ? 'relative' : 'absolute',
                    opacity: i === active ? 1 : 0,
                    transform: i === active ? 'scale(1) translateY(0)' : i < active ? 'scale(0.95) translateY(-14px)' : 'scale(0.97) translateY(14px)',
                    pointerEvents: i === active ? 'auto' : 'none',
                    zIndex: i === active ? 1 : 0,
                    width: '100%',
                  }}>
                  {scene}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dots */}
      <div className="flex items-center justify-center gap-2 mt-6 lg:hidden">
        {phases.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-400"
            style={{ width: i === active ? 18 : 4, height: 4, background: i <= active ? 'linear-gradient(90deg,#A855F7,#06B6D4)' : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop scroll story (hidden on mobile) ── */}
      <section id="story" className="hidden md:block" style={{ background: 'transparent', position: 'relative' }}>
        {/* ── Scroll driver: provides scroll distance, occupies page space ── */}
        <div ref={driverRef} style={{ height: '220vh' }}>

          {/* ── Fixed panel: visible only while driver is in active scroll zone ── */}
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0,
            height: '100vh',
            zIndex: 10,
            background: '#080808',
            opacity: show ? 1 : 0,
            pointerEvents: show ? 'auto' : 'none',
            transition: 'opacity 0.15s ease',
            overflow: 'hidden',
          }}>
            {/* Parallax background glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ transform: `translateY(${bgOffset}px)`, transition: 'transform 0.08s linear' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full"
                style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.07) 0%, transparent 70%)' }} />
              <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)' }} />
            </div>

            {/* Mid dots */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ transform: `translateY(${midOffset}px)`, transition: 'transform 0.08s linear' }}>
              {[[15, 20], [80, 70], [10, 75], [85, 25], [50, 85]].map(([x, y], i) => (
                <div key={i} className="absolute rounded-full"
                  style={{ left: `${x}%`, top: `${y}%`, width: 3, height: 3, background: `rgba(168,85,247,${0.1 + i * 0.04})` }} />
              ))}
            </div>

            <PanelContent />
          </div>
        </div>
      </section>

      {/* ── Mobile static fallback (visible only on mobile) ── */}
      <section className="md:hidden py-20 px-5" style={{ background: 'transparent', position: 'relative' }}>
        <div className="text-center mb-10">
          <div className="eyebrow-pill inline-flex mb-4">
            <span className="w-1 h-1 rounded-full bg-brand-purple" />
            How It Works
          </div>
          <h2 className="font-heading font-bold text-white leading-tight tracking-tight" style={{ fontSize: 'clamp(1.6rem, 6vw, 2rem)' }}>
            From brief to{' '}
            <span className="gradient-text">converting creative</span>
            {' '}in four steps
          </h2>
        </div>
        <div className="space-y-4 max-w-sm mx-auto">
          {phases.map((p, i) => (
            <div key={p.num} className="flex items-start gap-4 p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold font-mono mt-0.5"
                style={{ background: 'linear-gradient(135deg,#A855F7,#6366F1)', color: '#fff' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div className="font-heading font-bold text-white text-sm mb-1">{p.title}</div>
                <p className="text-[12px] text-white/40 leading-relaxed">{p.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
