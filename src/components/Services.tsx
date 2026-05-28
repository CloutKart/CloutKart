import { useEffect, useRef } from 'react';
import { Image as ImageIcon, Video, Smartphone, Film, Package, TrendingUp, Users, Palette, MessageSquare, FlaskConical } from 'lucide-react';

const services = [
  { icon: ImageIcon,    title: 'Static Ads',           desc: 'Scroll-stopping static visuals engineered for conversion.' },
  { icon: Video,        title: 'Video Ads',             desc: 'Fast, punchy, conversion-focused video content.' },
  { icon: Users,        title: 'UGC Style',             desc: 'Authentic-feeling content that converts like organic.' },
  { icon: Smartphone,   title: 'Story Format',          desc: 'Platform-native stories that drive engagement and sales.' },
  { icon: Film,         title: 'Concept Packs',         desc: 'Full creative direction with multiple angles and formats.' },
  { icon: MessageSquare, title: 'Messaging Strategy',   desc: 'The foundational docs that power every format.' },
  { icon: Package,      title: 'Product Ads',           desc: 'Premium product showcases that make buyers act.' },
  { icon: TrendingUp,   title: 'Performance Creative',  desc: 'Direct-response assets built for measurable ROI.' },
  { icon: Palette,      title: 'Campaign Visuals',      desc: 'Cohesive campaign systems that build brand equity.' },
  { icon: FlaskConical, title: 'Testing Packages',      desc: 'Rapid iteration frameworks to find what converts.' },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-scale').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 70);
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
      <div className="section-divider mb-20 md:mb-36" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="reveal eyebrow-pill mb-7">
            <span className="w-1 h-1 rounded-full bg-brand-purple" />
            Every Format
          </div>
          <h2 className="reveal delay-100 font-heading font-bold leading-[1.06] tracking-tight mb-3 sm:mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
            Every Format.
            <br />
            <span className="gradient-text">One Winning Message.</span>
          </h2>
          <p className="reveal delay-200 text-[#D1D5DB] text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            We translate your core message into every format that converts — across every platform that matters.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {services.map((service, i) => (
            <div
              key={service.title}
              className={`reveal-scale glass-card rounded-2xl p-4 sm:p-5 group cursor-default`}
              style={{ animationDelay: `${Math.min(i * 70, 600)}ms` }}
            >
              <div className="relative z-10">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl icon-gradient flex items-center justify-center mb-3 sm:mb-3.5 transition-transform duration-300 group-hover:scale-110">
                  <service.icon size={17} className="text-brand-purple" />
                </div>
                <h3 className="text-xs sm:text-[13px] font-semibold font-heading text-white mb-1.5 leading-snug">{service.title}</h3>
                <p className="text-[11px] text-[#D1D5DB] leading-relaxed hidden sm:block">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
