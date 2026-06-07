import { useEffect, useRef, useState } from 'react';

const accentColors = ['#A855F7', '#6366F1', '#06B6D4'];

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
              setTimeout(() => el.classList.add('visible'), i * 90);
            });
            setTimeout(() => setScanLineActive(true), 600);
          }
        });
      },
      { threshold: 0.1 }
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
      {/* Stage lighting — spotlight behind focal line */}
      <div
        className="absolute pointer-events-none animate-orb-drift"
        style={{
          width: '760px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(168,85,247,0.09) 0%, transparent 70%)',
          top: '8%', left: '-8%', zIndex: 0,
          opacity: sectionVisible ? 1 : 0,
          transition: 'opacity 1.4s ease',
        }}
      />
      {/* Second, warmer orb for depth */}
      <div
        className="absolute pointer-events-none animate-orb-drift-alt"
        style={{
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)',
          top: '30%', right: '-4%', zIndex: 0,
          animationDelay: '-8s',
          opacity: sectionVisible ? 1 : 0,
          transition: 'opacity 1.8s ease 0.4s',
        }}
      />

      {/* Decorative background "MESSAGE" — depth layer */}
      <div
        className="absolute pointer-events-none select-none"
        aria-hidden
        style={{
          top: '2%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
          fontSize: 'clamp(7rem, 14vw, 13rem)',
          fontWeight: 200,
          color: 'rgba(255,255,255,0.025)',
          letterSpacing: '-0.04em',
          whiteSpace: 'nowrap',
          zIndex: 0,
          lineHeight: 1,
        }}
      >
        MESSAGE
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Eyebrow */}
        <div className="reveal eyebrow-pill mb-10">
          <span className="w-1 h-1 rounded-full bg-brand-purple" />
          The Philosophy
        </div>

        {/* Headline block */}
        <div className="mb-20 md:mb-28 space-y-1">

          {/* Line 1 — light, receding */}
          <div
            className="reveal-clip font-heading leading-[1.04] tracking-[-0.03em] block"
            style={{
              fontSize: 'clamp(2.8rem, 7.5vw, 6rem)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.30)',
              transitionDelay: '0ms',
            }}
          >
            It's not about the ad.
          </div>

          {/* Line 2 — focal line, word-by-word reveal */}
          <div
            className="font-heading leading-[1.04] tracking-[-0.035em] block"
            style={{
              fontSize: 'clamp(2.8rem, 7.5vw, 6rem)',
              fontWeight: 800,
              fontStyle: 'italic',
            }}
          >
            {["It's", 'about', 'the', 'message.'].map((word, wi) => (
              <span
                key={wi}
                className="reveal-clip inline-block gradient-text-warm"
                style={{
                  transitionDelay: `${120 + wi * 80}ms`,
                  marginRight: wi < 3 ? '0.22em' : 0,
                }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Scan line — sweeps once after words reveal */}
          <div className="relative overflow-hidden" style={{ height: '1px', marginTop: '2px' }}>
            {scanLineActive && (
              <div
                className="animate-scan-line absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, #A855F7 35%, #818CF8 65%, transparent 100%)',
                }}
              />
            )}
          </div>

          {/* Line 3 — most receding */}
          <div
            className="reveal-clip font-heading leading-[1.04] tracking-[-0.03em] block"
            style={{
              fontSize: 'clamp(2.8rem, 7.5vw, 6rem)',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.15)',
              transitionDelay: '480ms',
              marginTop: '0.1em',
            }}
          >
            The ad is just the vehicle.
          </div>
        </div>

        {/* Pull-quote — raw editorial, no card */}
        <div className="reveal mb-20 md:mb-28">
          {/* Giant opening quote mark */}
          <div
            className="gradient-text-warm font-heading select-none"
            aria-hidden
            style={{
              fontSize: 'clamp(5rem, 10vw, 8rem)',
              lineHeight: 0.7,
              marginBottom: '-0.5rem',
              fontWeight: 800,
            }}
          >
            "
          </div>
          <p className="text-[#F3F4F6] text-xl sm:text-2xl lg:text-[1.85rem] font-semibold leading-[1.5] italic max-w-3xl">
            A winning message can be translated into{' '}
            <em className="not-italic gradient-text">anything.</em>
          </p>
          <p className="text-white/30 text-sm mt-5 max-w-xl leading-relaxed not-italic">
            The message is the foundation. The format is just the container. CloutKart builds the message first — everything else scales from there.
          </p>
        </div>

        {/* Three truths — accent border + background number */}
        <div
          className="reveal grid sm:grid-cols-3 gap-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {truths.map((item, i) => (
            <div
              key={i}
              className="reveal relative pt-8 pb-6 overflow-hidden"
              style={{
                transitionDelay: `${(i + 4) * 80}ms`,
                borderLeft: `2px solid ${accentColors[i]}`,
                paddingLeft: '1.5rem',
                paddingRight: i < 2 ? '2rem' : '0',
              }}
            >
              {/* Background number */}
              <span
                className="absolute top-4 right-2 font-mono font-bold pointer-events-none select-none leading-none"
                aria-hidden
                style={{
                  fontSize: '5rem',
                  color: accentColors[i],
                  opacity: 0.05,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <div
                className="text-white font-semibold font-heading text-base mb-2 leading-snug relative z-10"
              >
                {item.label}
              </div>
              <p className="text-white/35 text-sm leading-relaxed relative z-10">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
