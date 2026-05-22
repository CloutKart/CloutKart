import { useEffect, useRef } from 'react';
import { Image as ImageIcon, Video, Smartphone, Film, Package, TrendingUp, Users, Palette, MessageSquare, FlaskConical } from 'lucide-react';

const services = [
  { icon: ImageIcon, title: 'AI Image Ads', desc: 'Scroll-stopping static visuals engineered for conversion.', color: '#8B2FE0' },
  { icon: Smartphone, title: 'Instagram & TikTok Creatives', desc: 'Platform-native content that drives engagement and sales.', color: '#2563EB' },
  { icon: Package, title: 'Product Ads', desc: 'Premium product showcases that make buyers act immediately.', color: '#06B6D4' },
  { icon: Video, title: 'Short-form Video Ads', desc: 'Fast, punchy, conversion-focused video content.', color: '#8B2FE0' },
  { icon: Film, title: 'Creative Concept Packs', desc: 'Full creative direction with multiple angles and formats.', color: '#2563EB' },
  { icon: TrendingUp, title: 'Performance Marketing Creatives', desc: 'Direct-response assets built for measurable ROI.', color: '#06B6D4' },
  { icon: Users, title: 'UGC-style Ad Concepts', desc: 'Authentic-feeling content that converts like organic.', color: '#8B2FE0' },
  { icon: Palette, title: 'Brand Campaign Visuals', desc: 'Cohesive campaign systems that build lasting brand equity.', color: '#2563EB' },
  { icon: MessageSquare, title: 'Messaging Strategy Assets', desc: 'The foundational docs that power every format.', color: '#06B6D4' },
  { icon: FlaskConical, title: 'Creative Testing Packages', desc: 'Rapid iteration frameworks to find what converts fastest.', color: '#8B2FE0' },
];

export default function Services() {
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
    <section ref={sectionRef} className="relative py-10 md:py-16 bg-[#080C14] overflow-hidden" id="services">
      <div className="orb w-[600px] h-[600px] left-1/2 -translate-x-1/2 top-0 opacity-8"
        style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <div className="reveal inline-block glass border border-[#2563EB]/30 rounded-full px-4 py-1.5 text-xs font-semibold text-[#60a5fa] mb-6">
            What We Create
          </div>
          <h2 className="reveal delay-100 text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-3 sm:mb-4">
            Every Format.
            <br />
            <span className="text-gradient">One Winning Message.</span>
          </h2>
          <p className="reveal delay-200 text-white/40 text-sm sm:text-lg max-w-xl mx-auto">
            We translate your core message into every format that converts — across every platform that matters.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {services.map((service, i) => (
            <div
              key={service.title}
              className={`reveal-scale delay-${Math.min((i + 1) * 80, 800)} glass-card rounded-2xl p-4 sm:p-6 group hover-lift relative overflow-hidden cursor-default`}
              data-cursor="card"
              style={{ border: `1px solid rgba(255,255,255,0.06)` }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${service.color}15, transparent 70%)`,
                }}
              />
              {/* Gradient border on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${service.color}40, transparent, ${service.color}20)`,
                  padding: '1px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />

              <div
                className="relative z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${service.color}20`, border: `1px solid ${service.color}30` }}
              >
                <service.icon size={20} style={{ color: service.color }} />
              </div>
              <h3 className="relative z-10 text-xs sm:text-sm font-bold text-white mb-1 sm:mb-2 leading-tight">{service.title}</h3>
              <p className="relative z-10 text-[11px] sm:text-xs text-white/40 leading-relaxed hidden sm:block">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
