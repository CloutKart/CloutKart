import { useEffect, useRef } from 'react';
import { Check, ArrowRight, Star, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    sub: 'No credit card required',
    badge: null,
    features: [
      '3 premium ad creatives',
      'Zero commitment required',
      'Built around your message',
      'Production-ready files',
      '48h delivery',
    ],
    cta: 'Claim Free Creatives',
    ctaStyle: 'secondary' as const,
  },
  {
    name: 'Growth',
    price: '$997',
    period: '/mo',
    sub: 'Most popular plan',
    badge: 'Most Popular',
    features: [
      'Up to 20 ad creatives/month',
      'Dedicated message strategist',
      'All formats covered',
      'Unlimited revisions',
      '2 active campaigns',
      'Weekly performance reports',
    ],
    cta: 'Get Started',
    ctaStyle: 'primary' as const,
  },
  {
    name: 'Scale',
    price: '$2,497',
    period: '/mo',
    sub: 'For serious growth',
    badge: null,
    features: [
      'Unlimited ad creatives',
      'Full creative strategy team',
      'All formats + landing pages',
      'Unlimited revisions',
      'Unlimited campaigns',
      'Daily performance reviews',
      'Direct Slack access',
    ],
    cta: 'Let\'s Talk',
    ctaStyle: 'secondary' as const,
  },
];

export default function Pricing() {
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
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="pricing" style={{ background: 'transparent' }}>
      <div className="section-divider mb-20 md:mb-36" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="reveal eyebrow-pill mb-7">
            <span className="w-1 h-1 rounded-full bg-brand-purple" />
            Simple Pricing
          </div>
          <h2 className="reveal delay-100 font-heading font-bold leading-[1.06] tracking-tight mb-3 sm:mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
            Simple Pricing.
            <br />
            <span className="gradient-text">Serious Results.</span>
          </h2>
          <p className="reveal delay-200 text-[#D1D5DB] text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            Start free. Scale when you're ready. No surprise fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6 items-start">
          {plans.map((plan, i) => {
            const isPopular = plan.badge === 'Most Popular';
            return (
              <div
                key={plan.name}
                className={`reveal-scale ${isPopular ? 'gradient-border-wrap' : ''}`}
                style={{ transitionDelay: `${(i + 1) * 120}ms` }}
              >
                <div className={`glass-card rounded-[20px] p-6 sm:p-8 h-full flex flex-col ${isPopular ? 'relative' : ''}`}>
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 eyebrow-pill text-[10px] px-3 py-1 whitespace-nowrap z-10">
                      <Star size={9} className="fill-brand-purple text-brand-purple" />
                      Most Popular
                    </div>
                  )}

                  <div className="relative z-10 mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      {isPopular && <Zap size={14} className="text-brand-purple" />}
                      <h3 className="font-heading font-semibold text-white text-lg">{plan.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-mono text-4xl sm:text-5xl font-bold text-white">{plan.price}</span>
                      {plan.period && <span className="font-mono text-lg text-[#9CA3AF]">{plan.period}</span>}
                    </div>
                    <p className="text-sm text-[#9CA3AF]">{plan.sub}</p>
                  </div>

                  <div className="relative z-10 space-y-3 flex-1 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
                          <Check size={10} className="text-brand-purple" />
                        </div>
                        <span className="text-[#D1D5DB] text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10">
                    <a
                      href="#contact"
                      className={plan.ctaStyle === 'primary' ? 'btn-primary w-full justify-center text-sm' : 'btn-secondary w-full justify-center text-sm'}
                    >
                      {plan.cta}
                      <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust indicators */}
        <div className="reveal delay-500 mt-10 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-4 text-center max-w-2xl mx-auto">
          {[
            { value: 'Premium', label: 'Production Quality' },
            { value: '48hrs', label: 'Avg Delivery Time' },
            { value: '100%', label: 'Built on Strategy' },
          ].map((item) => (
            <div key={item.label} className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5">
              <div className="relative z-10">
                <div className="font-mono text-sm sm:text-lg font-semibold gradient-text mb-1 tracking-tight">{item.value}</div>
                <div className="text-[10px] sm:text-xs text-[#9CA3AF] leading-tight font-medium">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
