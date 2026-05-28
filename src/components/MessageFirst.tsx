import { useEffect, useRef } from 'react';
import { MessageSquare, Layers, Repeat } from 'lucide-react';

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

  const pillars = [
    {
      icon: MessageSquare,
      title: 'The Message-Led Flow',
      desc: "You're not trying to find a winning ad. You're trying to find the winning message. The ad is just the vehicle.",
    },
    {
      icon: Layers,
      title: 'One Message, Infinite Formats',
      desc: 'Image ad. Video ad. Short-form. Long-form. Landing page. Same message, different container.',
    },
    {
      icon: Repeat,
      title: 'Foundation That Scales',
      desc: 'Build once. Deploy everywhere. The message powers your store, your ads, your content — all of it.',
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="message" style={{ background: 'transparent' }}>
      <div className="section-divider mb-20 md:mb-36" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 md:mb-24">
          <div className="reveal eyebrow-pill mb-8">
            <span className="w-1 h-1 rounded-full bg-brand-purple" />
            The Philosophy
          </div>

          <div className="reveal delay-100 space-y-1 sm:space-y-2">
            <h2 className="font-heading font-bold tracking-tight leading-[1.03]" style={{ fontSize: 'clamp(2.2rem, 6vw, 6.5rem)' }}>
              <span className="text-white">It's Not About</span>
            </h2>
            <h2 className="font-heading font-bold tracking-tight leading-[1.03]" style={{ fontSize: 'clamp(2.2rem, 6vw, 6.5rem)' }}>
              <span className="text-white">The Ad.</span>
            </h2>
            <h2 className="font-heading font-bold tracking-tight leading-[1.03]" style={{ fontSize: 'clamp(2.2rem, 6vw, 6.5rem)' }}>
              <span className="text-[#9CA3AF]">It's About</span>
            </h2>
            <h2 className="font-heading font-bold tracking-tight leading-[1.03]" style={{ fontSize: 'clamp(2.2rem, 6vw, 6.5rem)' }}>
              <span className="gradient-text-animated">The Message.</span>
            </h2>
          </div>
        </div>

        {/* Quote card */}
        <div className="reveal delay-200 mb-8 md:mb-14 gradient-border-wrap">
          <div className="glass-card rounded-[20px] p-8 sm:p-12 lg:p-16 relative" style={{ borderRadius: '20px' }}>
            <div className="relative z-10 text-center">
              <div className="absolute left-0 top-8 sm:top-12 w-1 h-16 rounded-full" style={{ background: 'linear-gradient(to bottom, #A855F7, #06B6D4)' }} />
              <p className="text-xl sm:text-2xl lg:text-[2rem] font-semibold text-[#F3F4F6] leading-[1.45] max-w-4xl mx-auto italic">
                "A winning message can be translated into{' '}
                <em className="not-italic gradient-text">anything.</em>"
              </p>
              <p className="text-sm sm:text-lg text-[#D1D5DB] mt-6 max-w-2xl mx-auto leading-relaxed">
                The message is the foundation. The format is just the container. CloutKart builds the message first — everything else scales from there.
              </p>
            </div>
          </div>
        </div>

        {/* Three pillars */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              className={`reveal delay-${(i + 3) * 100} glass-card rounded-2xl p-6 sm:p-8 group`}
            >
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl icon-gradient flex items-center justify-center mb-5">
                  <pillar.icon size={19} className="text-brand-purple" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold font-heading text-white mb-3 leading-snug">{pillar.title}</h3>
                <p className="text-[#D1D5DB] text-sm leading-relaxed">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
