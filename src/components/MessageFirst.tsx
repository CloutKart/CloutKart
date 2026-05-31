import { useEffect, useRef } from 'react';

export default function MessageFirst() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-scale').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 120);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-40 [overflow-x:clip]" id="message" style={{ background: 'transparent' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Big typographic statement */}
        <div className="reveal mb-16 md:mb-20">
          <div className="eyebrow-pill mb-10">
            <span className="w-1 h-1 rounded-full bg-brand-purple" />
            The Philosophy
          </div>
          <div className="space-y-0">
            {[
              { text: "It's not about the ad.", dim: false },
              { text: "It's about the message.", dim: false, gradient: true },
              { text: "The ad is just the vehicle.", dim: true },
            ].map((line, i) => (
              <div
                key={i}
                className={`reveal font-heading font-bold leading-[1.04] tracking-tight block`}
                style={{
                  fontSize: 'clamp(2.4rem, 6.5vw, 6rem)',
                  transitionDelay: `${i * 100}ms`,
                  color: line.dim ? 'rgba(255,255,255,0.2)' : '#ffffff',
                }}
              >
                {line.gradient ? (
                  <span className="gradient-text-animated">{line.text}</span>
                ) : (
                  line.text
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="reveal delay-300 mb-16 md:mb-20 gradient-border-wrap">
          <div
            className="glass-card rounded-[20px] p-8 sm:p-12"
            style={{ borderRadius: '20px', background: 'rgba(8,8,8,0.95)' }}
          >
            <div className="relative z-10">
              <p className="text-xl sm:text-2xl lg:text-[1.85rem] font-semibold text-[#F3F4F6] leading-[1.5] max-w-3xl italic">
                "A winning message can be translated into{' '}
                <em className="not-italic gradient-text">anything.</em>"
              </p>
              <p className="text-sm sm:text-base text-white/35 mt-5 max-w-xl leading-relaxed not-italic">
                The message is the foundation. The format is just the container. CloutKart builds the message first — everything else scales from there.
              </p>
            </div>
          </div>
        </div>

        {/* Three truths — no icons, pure type */}
        <div
          className="reveal delay-400 grid sm:grid-cols-3 gap-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
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
          ].map((item, i) => (
            <div
              key={i}
              className="reveal pt-8 pb-2 pr-0 sm:pr-10"
              style={{
                transitionDelay: `${(i + 4) * 80}ms`,
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                paddingLeft: i > 0 ? '2.5rem' : '0',
              }}
            >
              <div className="text-white font-semibold font-heading text-base mb-2 leading-snug">{item.label}</div>
              <p className="text-white/35 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
