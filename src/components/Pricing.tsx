import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

// Capacity, not price. The page has never shown a rupee figure and does not start
// here: what a plan buys is throughput (runs, formats, cycle time), and the two
// CTAs are unchanged.
const step1Features = [
  'One full production run, start to delivery',
  'Every station on the line, including both gates',
  'All formats in the map, each at every placement size',
  '48-hour cycle time',
  'No card, no commitment',
];

const step2Features = [
  'Recurring runs on a schedule you set',
  'Standing format map across your placements',
  'Hook, caption, and message support each run',
  'Priority position in the production queue',
  'Campaign signal fed back into the next brief',
];

interface Props {
  onSignupOpen: () => void;
}

export default function Pricing({ onSignupOpen }: Props) {
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <p className="reveal mono-label mb-7" style={{ letterSpacing: '0.3em' }}>Capacity</p>
          <h2 className="reveal delay-100 font-heading font-bold leading-[1.06] tracking-tight mb-3 sm:mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 4.2rem)', color: 'var(--ink)', textWrap: 'balance' }}>
            Run the line once.
            <br />
            <span style={{ color: 'var(--accent-ink)' }}>Then keep it running.</span>
          </h2>
          <p className="reveal delay-200 text-ink-body text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            You are buying production capacity, measured in runs and cycle time. The first one costs nothing.
          </p>
        </div>

        {/* Two-step layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">

          {/* Step 1 — border pulse */}
          <div className="reveal-scale delay-100 gradient-border-wrap">
            <div className="glass-card animate-border-pulse rounded-[20px] p-6 sm:p-8 flex flex-col h-full">
              <div className="relative z-10 mb-6">
                <span className="eyebrow-pill text-[10px] px-3 py-1 mb-4 inline-flex">STEP 01</span>
                <h3 className="font-heading font-bold text-white text-2xl mb-3">Your First Run, Free</h3>
                <p className="text-ink-muted text-sm leading-relaxed">
                  We open a run on your brand and take it all the way through the line. You see the whole
                  process working, on your own product, before you spend a rupee.
                </p>
              </div>
              <div className="relative z-10 space-y-3 flex-1 mb-8">
                {step1Features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <span className="text-brand-purple text-xs mt-0.5 flex-shrink-0">✦</span>
                    <span className="text-ink-body text-sm leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
              <div className="relative z-10">
                <button onClick={onSignupOpen} className="btn-primary w-full justify-center text-sm">
                  Claim Your Free Run
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Arrow connector */}
          <div className="reveal flex flex-col items-center gap-2 text-ink-muted px-2 py-4 md:py-0">
            <ArrowRight size={22} className="hidden md:block" />
            <svg className="block md:hidden" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
            <span className="font-heading" style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Then</span>
          </div>

          {/* Step 2 — indigo glow */}
          <div className="reveal-scale delay-200 relative">
            {/* Ambient indigo orb at top */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: '200px', height: '80px', borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgb(var(--accent-rgb) / 0.18) 0%, transparent 70%)',
                top: '-20px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 0,
              }}
            />
            <div className="glass-card rounded-[20px] p-6 sm:p-8 flex flex-col h-full relative" style={{ background: 'rgb(var(--white-rgb) / 0.025)', boxShadow: '0 0 0 1px rgb(var(--accent-rgb) / 0.15) inset, 0 8px 32px rgba(0,0,0,0.45)' }}>
              <div className="relative z-10 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full text-[10px] font-semibold tracking-widest uppercase"
                  style={{ background: 'rgb(var(--accent-rgb) / 0.1)', border: '1px solid rgb(var(--accent-rgb) / 0.25)', color: 'var(--accent-ink)' }}>
                  STEP 02
                </span>
                <h3 className="font-heading font-bold text-white text-2xl mb-3">Clout Club</h3>
                <p className="text-ink-muted text-sm leading-relaxed">
                  The line stays open. Runs go out on a schedule, the format map stands from one run to the
                  next, and each brief starts from what the last campaign returned.
                </p>
              </div>
              <div className="relative z-10 space-y-3 flex-1 mb-8">
                {step2Features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-ink)' }}>✦</span>
                    <span className="text-ink-body text-sm leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
              <div className="relative z-10">
                <button onClick={onSignupOpen} className="btn-secondary w-full justify-center text-sm">
                  Join the Waitlist
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reassurance line */}
        <p className="reveal delay-400 text-center mt-8" style={{ color: 'var(--ink-muted)', fontSize: 14 }}>
          Volume, cadence, and cycle time are set per brand. Tell us what you run and we will size it with you.
        </p>
      </div>
    </section>
  );
}
