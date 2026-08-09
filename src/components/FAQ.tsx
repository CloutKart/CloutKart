import { useEffect, useRef, useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: 'What exactly is automated, and what is not?',
    a: 'Four of the six stations run without you: research, format mapping, concepting, and export. Two are gates where a person decides, because the outcome genuinely changes there. You approve the message before anything is designed, and you sign off the finished batch before it ships.',
  },
  {
    q: 'How do I start my first run?',
    a: 'Create a free account and fill in the brief inside your dashboard. The run opens as soon as you submit it, and the finished batch arrives within the 48-hour cycle.',
  },
  {
    q: 'Do I need a credit card to get started?',
    a: 'No. Your first run is free and no card is required.',
  },
  {
    q: 'What can I see while a run is in progress?',
    a: 'The dashboard shows which station the run is at and what it is waiting on. When it reaches a gate it waits for you, and when the batch is ready you are notified and can download it directly.',
  },
  {
    q: 'Which formats does a run produce?',
    a: 'Static, video, UGC-style, stories, email creatives, and store assets, each exported at every placement size in your format map.',
  },
  {
    q: 'How does the system get better over time?',
    a: 'Campaign performance comes back into the pipeline after launch, so the next brief starts from what converted rather than from scratch. Runs on a standing format map compound this: the map holds steady while the message and creative are re-tuned each cycle.',
  },
  {
    q: 'Can I change my plan or get a custom setup?',
    a: 'Yes. Volume, cadence, and cycle time are set per brand, and you can change them from inside your dashboard at any time. Payment is processed securely via Razorpay. Use the contact form for custom scope or enterprise inquiries.',
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
          <p className="reveal mono-label mb-7" style={{ letterSpacing: '0.3em' }}>Queries</p>
          <h2 className="reveal delay-100 font-heading font-bold leading-[1.06] tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 4.2rem)', color: 'var(--ink)', textWrap: 'balance' }}>
            Questions about{' '}
            <span style={{ color: 'var(--accent-ink)' }}>running the line.</span>
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
                    maxHeight: isOpen ? '460px' : '0',
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
