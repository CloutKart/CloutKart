import { useEffect, useRef, useState } from 'react';

const formats = ['Static', 'Video', 'UGC', 'Story', 'Email', 'Store'];

const truths = [
  {
    label: 'Message-led',
    body: "You're not looking for a winning ad. You're looking for the winning message. The ad is just proof.",
  },
  {
    label: 'One message, every format',
    body: 'Static, video, UGC, story. Same message. Different container. Same conversion engine underneath.',
  },
  {
    label: 'Foundation that scales',
    body: 'Build the message once. Deploy it everywhere: ads, store, email, content. All from the same root.',
  },
];

export default function MessageFirst() {
  const sectionRef = useRef<HTMLElement>(null);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [scanLineActive, setScanLineActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSectionVisible(true);
            entry.target.querySelectorAll('.reveal, .reveal-scale, .reveal-clip').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 70);
            });
            setTimeout(() => setScanLineActive(true), 720);
          }
        });
      },
      { threshold: 0.12 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-40 [overflow-x:clip]"
      id="message"
      style={{ background: 'transparent' }}
    >
      {/* Subtle spotlight behind the focal line */}
      <div
        className="absolute pointer-events-none animate-orb-drift"
        style={{
          width: '680px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgb(var(--accent-rgb) / 0.08) 0%, transparent 70%)',
          top: '8%',
          left: '-8%',
          zIndex: 0,
          opacity: sectionVisible ? 1 : 0,
          transition: 'opacity 1.6s ease',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Eyebrow */}
        <div className="reveal eyebrow-pill mb-10 sm:mb-12">
          <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} />
          The Philosophy
        </div>

        {/* ── Manifesto ─────────────────────────────────────────── */}
        <div className="mb-16 md:mb-24">
          <div
            className="reveal-clip font-heading font-light leading-[1.1] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2.1rem)', color: 'var(--ink-dim)', transitionDelay: '0ms' }}
          >
            It's not about the ad.
          </div>

          <h2
            className="font-heading font-extrabold leading-[0.98] tracking-[-0.035em] my-1"
            style={{ fontSize: 'clamp(2.75rem, 8.5vw, 6rem)', color: 'var(--ink)', textWrap: 'balance' }}
          >
            {["It's", 'about', 'the'].map((w, i) => (
              <span key={i} className="reveal-clip inline-block" style={{ transitionDelay: `${100 + i * 70}ms`, marginRight: '0.22em' }}>
                {w}
              </span>
            ))}
            <span className="reveal-clip inline-block" style={{ transitionDelay: '310ms', color: 'var(--accent)' }}>
              message.
            </span>
          </h2>

          {/* Scan line */}
          <div className="relative overflow-hidden" style={{ height: '2px', marginTop: '10px', marginBottom: '12px', borderRadius: '1px', maxWidth: '32rem' }}>
            <div className="absolute inset-0 rounded-full" style={{ background: 'rgb(var(--white-rgb) / 0.06)' }} />
            {scanLineActive && (
              <div
                className="animate-scan-line absolute inset-0 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent-ink) 60%, var(--accent) 85%, transparent 100%)' }}
              />
            )}
          </div>

          <div
            className="reveal-clip font-heading font-light leading-[1.1] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2.1rem)', color: 'var(--ink-dim)', transitionDelay: '460ms' }}
          >
            The ad is just the vehicle.
          </div>
        </div>

        {/* ── Format diagram: one message → every format ────────── */}
        <div
          className="reveal mb-16 md:mb-24 rounded-3xl overflow-hidden"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="grid md:grid-cols-[minmax(0,0.9fr)_auto_minmax(0,1.4fr)] items-stretch">
            {/* The message node */}
            <div className="relative p-6 sm:p-8 flex flex-col justify-center">
              <div
                className="inline-flex self-start items-center gap-2 rounded-full px-3 py-1 mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-contrast)' }} />
                The message
              </div>
              <div className="font-heading font-extrabold leading-[1.05] tracking-[-0.02em]" style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2rem)', color: 'var(--ink)' }}>
                One root idea.
              </div>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-muted)', maxWidth: '18rem' }}>
                Engineered once, before a single pixel is placed.
              </p>
            </div>

            {/* Connector */}
            <div className="hidden md:flex items-center justify-center px-2" aria-hidden>
              <svg width="72" height="180" viewBox="0 0 72 180" fill="none" className="overflow-visible">
                <path d="M0 90 H36" stroke="var(--accent)" strokeWidth="1.5" />
                <circle cx="36" cy="90" r="3" fill="var(--accent)" />
                {[16, 54, 90, 126, 164].map((y) => (
                  <path key={y} d={`M36 90 C 54 90, 54 ${y}, 72 ${y}`} stroke="rgb(var(--accent-rgb) / 0.35)" strokeWidth="1.5" />
                ))}
              </svg>
            </div>

            {/* Formats */}
            <div
              className="p-6 sm:p-8 flex flex-col justify-center"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: 'var(--ink-dim)' }}>
                Every format
              </div>
              <div className="flex flex-wrap gap-2.5">
                {formats.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium font-heading transition-colors duration-200"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg-elev)', color: 'var(--ink-body)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                    {f}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                Same message. Different container. Same conversion engine underneath.
              </p>
            </div>
          </div>
        </div>

        {/* ── Pull-quote ────────────────────────────────────────── */}
        <div className="reveal mb-16 md:mb-20 max-w-3xl">
          <div className="h-px mb-7" style={{ background: 'linear-gradient(90deg, var(--accent) 0%, rgb(var(--accent-rgb) / 0.25) 45%, transparent 85%)' }} />
          <p className="font-heading font-bold leading-[1.25] tracking-[-0.02em]" style={{ fontSize: 'clamp(1.4rem, 3.4vw, 2.4rem)', color: 'var(--ink)' }}>
            A winning message can be translated into <span style={{ color: 'var(--accent)' }}>anything.</span>
          </p>
          <p className="mt-4 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--ink-muted)', maxWidth: '34rem' }}>
            The message is the foundation. The format is the container. CloutKart builds the message first; everything else scales from there.
          </p>
        </div>

        {/* ── Three truths — rule-topped trio, gap-separated (no side-stripes) ── */}
        <div className="reveal grid sm:grid-cols-3 gap-x-10 gap-y-8" style={{ borderTop: '1px solid var(--border)' }}>
          {truths.map((item, i) => (
            <div key={i} className="pt-7">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: 'var(--accent)' }} />
                <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
              </div>
              <div className="font-heading font-bold text-base leading-snug mb-2" style={{ color: 'var(--ink)' }}>
                {item.label}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
