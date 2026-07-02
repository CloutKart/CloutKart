import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

const services = [
  {
    title: 'Static Ads',
    desc: 'Feed-stopping images built around a single converting message. Every crop, every frame, every text placement is intentional.',
    formats: 'Instagram · Facebook · LinkedIn',
  },
  {
    title: 'Video Ads',
    desc: 'Hook in 3 seconds or it gets scrolled. Fast cuts, product truth, directional close. No filler.',
    formats: 'Reels · TikTok · YouTube',
  },
  {
    title: 'UGC Style',
    desc: 'Authentic-feeling content that converts like organic. Real product, real voice, engineered for performance.',
    formats: 'TikTok · Instagram · Meta',
  },
  {
    title: 'Story & Vertical',
    desc: 'Platform-native formats that fill the frame and demand attention. Full-bleed, full-conversion.',
    formats: 'Stories · Reels · Shorts',
  },
  {
    title: 'Performance Packs',
    desc: 'Multiple angles, copy variants, and hooks from the same brief. Built for testing. Optimised for scale.',
    formats: 'All platforms',
  },
  {
    title: 'Hook Writing',
    desc: 'Six psychological triggers. One scroll-stopper per brief. Powered by Pixie — never interchangeable, always specific.',
    formats: 'Every format',
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 60);
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
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="services" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-16">
          <div>
            <div className="reveal eyebrow-pill mb-7">
              <span className="w-1 h-1 rounded-full bg-brand-purple" />
              Every Format
            </div>
            <h2
              className="reveal delay-100 font-heading font-bold leading-[1.04] tracking-tight"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}
            >
              <span className="text-white">One message.</span>
              <br />
              <span style={{ color: 'var(--ink)' }}>Every format that converts.</span>
            </h2>
          </div>
          <p className="reveal delay-200 text-white/35 text-sm leading-relaxed max-w-xs md:text-right">
            We translate your core message into every format, on every platform, at every stage of the funnel.
          </p>
        </div>

        {/* Service list */}
        <div style={{ borderTop: '1px solid rgb(var(--white-rgb) / 0.06)' }}>
          {services.map((service, i) => (
            <div
              key={service.title}
              className="reveal group flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-12 py-7 transition-colors duration-300 cursor-default"
              style={{
                borderBottom: '1px solid rgb(var(--white-rgb) / 0.06)',
                transitionDelay: `${i * 60}ms`,
              }}
            >
              {/* Number */}
              <div
                className="font-mono text-[13px] font-bold flex-shrink-0 mt-0.5 transition-colors duration-300"
                style={{ color: 'rgb(var(--white-rgb) / 0.12)', minWidth: '2rem' }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>

              {/* Title */}
              <div className="flex-shrink-0 sm:w-44 relative">
                <span className="font-heading font-bold text-base sm:text-lg text-white leading-tight">
                  {service.title}
                </span>
                <div
                  className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                  style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent))' }}
                />
              </div>

              {/* Desc */}
              <div className="flex-1">
                <p className="text-white/45 text-sm leading-relaxed group-hover:text-white/60 transition-colors duration-300">
                  {service.desc}
                </p>
              </div>

              {/* Formats + arrow */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[11px] font-mono text-white/20 group-hover:text-white/35 transition-colors duration-300 hidden sm:block">
                  {service.formats}
                </span>
                <ArrowUpRight
                  size={14}
                  className="opacity-0 group-hover:opacity-40 transition-opacity duration-300 flex-shrink-0"
                  style={{ color: 'var(--accent)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
