import { useEffect, useRef, useState } from 'react';

const accentColors = ['var(--accent)', 'var(--accent)', 'var(--accent)'] as const;

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
    body: 'Build the message once. Deploy it everywhere — ads, store, email, content. All from the same root.',
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
              setTimeout(() => el.classList.add('visible'), i * 80);
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
      {/* Single subtle spotlight — behind the focal line only */}
      <div
        className="absolute pointer-events-none animate-orb-drift"
        style={{
          width: '640px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgb(var(--accent-rgb) / 0.07) 0%, transparent 70%)',
          top: '12%',
          left: '-6%',
          zIndex: 0,
          opacity: sectionVisible ? 1 : 0,
          transition: 'opacity 1.6s ease',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Eyebrow */}
        <div className="reveal eyebrow-pill mb-12">
          <span className="w-1 h-1 rounded-full bg-brand-purple" />
          The Philosophy
        </div>

        {/* Headline block — size-contrast approach */}
        <div className="mb-16 md:mb-20">

          {/* Line 1 — supporting, small, dim */}
          <div
            className="reveal-clip font-heading leading-[1.1] tracking-[-0.02em] block mb-2"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 300,
              color: 'rgb(var(--white-rgb) / 0.30)',
              transitionDelay: '0ms',
            }}
          >
            It's not about the ad.
          </div>

          {/* Line 2 — focal, dominant, word-by-word reveal */}
          <div
            className="font-heading leading-[1.03] tracking-[-0.04em] block my-1"
            style={{
              fontSize: 'clamp(3rem, 7.5vw, 6rem)',
              fontWeight: 800,
              fontStyle: 'italic',
            }}
          >
            {["It's", 'about', 'the', 'message.'].map((word, wi) => (
              <span
                key={wi}
                className="reveal-clip inline-block gradient-text-warm"
                style={{
                  transitionDelay: `${100 + wi * 80}ms`,
                  marginRight: wi < 3 ? '0.2em' : 0,
                  paddingRight: '0.08em', // italic glyph overhang bleed
                }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Scan line — fires after words reveal */}
          <div className="relative overflow-hidden" style={{ height: '2px', marginTop: '6px', marginBottom: '8px', borderRadius: '1px' }}>
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgb(var(--white-rgb) / 0.05)' }}
            />
            {scanLineActive && (
              <div
                className="animate-scan-line absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent-ink) 60%, var(--accent) 85%, transparent 100%)',
                }}
              />
            )}
          </div>

          {/* Line 3 — receding, smaller still */}
          <div
            className="reveal-clip font-heading leading-[1.1] tracking-[-0.02em] block mt-2"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 300,
              color: 'rgb(var(--white-rgb) / 0.18)',
              transitionDelay: '500ms',
            }}
          >
            The ad is just the vehicle.
          </div>
        </div>

        {/* Thin divider before quote */}
        <div
          className="reveal mb-12"
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, rgb(var(--accent-rgb) / 0.35) 0%, rgb(var(--accent-rgb) / 0.2) 40%, transparent 80%)',
          }}
        />

        {/* Pull-quote — clean blockquote with left-border accent */}
        <div
          className="reveal mb-16 md:mb-20 pl-6 sm:pl-8"
          style={{ borderLeft: '2px solid rgb(var(--accent-rgb) / 0.5)' }}
        >
          <p
            className="text-ink-body font-semibold leading-[1.6] italic mb-4"
            style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.45rem)', maxWidth: '42rem' }}
          >
            "A winning message can be translated into{' '}
            <em className="not-italic gradient-text">anything.</em>"
          </p>
          <p className="text-white/30 text-sm leading-relaxed not-italic max-w-sm">
            The message is the foundation. The format is the container. CloutKart builds the message first — everything else scales from there.
          </p>
        </div>

        {/* Three truths — accent border + faint background number */}
        <div
          className="reveal grid sm:grid-cols-3 gap-px"
          style={{ borderTop: '1px solid rgb(var(--white-rgb) / 0.06)' }}
        >
          {truths.map((item, i) => (
            <div
              key={i}
              className="reveal relative pt-8 pb-6 overflow-hidden transition-colors duration-300"
              style={{
                transitionDelay: `${(i + 4) * 80}ms`,
                borderLeft: `2px solid ${accentColors[i]}`,
                paddingLeft: '1.5rem',
                paddingRight: i < 2 ? '2rem' : '0',
              }}
            >
              {/* Faint background number */}
              <span
                className="absolute -top-1 right-2 font-mono font-bold pointer-events-none select-none leading-none"
                aria-hidden
                style={{ fontSize: '4.5rem', color: accentColors[i], opacity: 0.04 }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Label with small accent dot */}
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <div
                  className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{ background: accentColors[i] }}
                />
                <div className="text-white font-semibold font-heading text-sm sm:text-base leading-snug">
                  {item.label}
                </div>
              </div>
              <p className="text-white/30 text-sm leading-relaxed relative z-10">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
