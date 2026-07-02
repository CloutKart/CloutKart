import { useEffect, useRef, useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: 'How do I get my free creative?',
    a: 'Create a free account, fill in a quick brief inside your dashboard, and our team will deliver your creative within 48 hours.',
  },
  {
    q: 'Do I need a credit card to get started?',
    a: 'No. Your first creative is completely free, no card required.',
  },
  {
    q: 'What happens after I request the free creative?',
    a: "You'll see the live status inside your dashboard. Once ready, you'll get notified and can download it directly.",
  },
  {
    q: 'Can I upgrade my plan anytime?',
    a: 'Yes — upgrade from inside your dashboard at any time. Payment is processed securely via Razorpay.',
  },
  {
    q: 'What formats do you create ads in?',
    a: 'Static, video, UGC-style, stories, email creatives, and landing pages.',
  },
  {
    q: 'How do I contact the team for a custom project?',
    a: 'Use the Contact page for custom quotes, negotiations, or enterprise inquiries.',
  },
];

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="faq" style={{ background: 'transparent' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="reveal eyebrow-pill mb-7">
            <span className="w-1 h-1 rounded-full bg-brand-purple" />
            FAQ
          </div>
          <h2 className="reveal delay-100 font-heading font-bold leading-[1.06] tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
            Common{' '}
            <span style={{ color: 'var(--ink)' }}>Questions.</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="reveal-scale glass-card rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  transitionDelay: `${i * 60}ms`,
                  borderColor: isOpen ? 'rgb(var(--accent-rgb) / 0.3)' : undefined,
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left touch-manipulation"
                >
                  <span className="font-heading font-semibold text-white" style={{ fontSize: 17 }}>
                    {faq.q}
                  </span>
                  <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: isOpen ? 'linear-gradient(135deg, rgb(var(--accent-rgb) / 0.2), rgb(var(--accent-rgb) / 0.2))' : 'rgb(var(--white-rgb) / 0.05)',
                      border: isOpen ? '1px solid rgb(var(--accent-rgb) / 0.3)' : '1px solid rgb(var(--white-rgb) / 0.1)',
                    }}>
                    {isOpen
                      ? <Minus size={13} className="gradient-text" style={{ color: 'var(--accent)' }} />
                      : <Plus size={13} className="text-ink-muted" />
                    }
                  </span>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? '300px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 300ms ease',
                  }}
                >
                  <p className="px-6 pb-5 text-ink-body leading-relaxed" style={{ fontSize: 16 }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
