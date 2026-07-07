import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  onSignupOpen: () => void;
}

// ref art is 3344×1882; the fingertip gap is a transparent column at x≈1693,
// so the halves are 1693px (human) and 1651px (robot) wide.
const HUMAN_PCT = (1693 / 3344) * 100;
const ROBOT_PCT = (1651 / 3344) * 100;

export default function Hero({ onSignupOpen }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [statsVisible, setStatsVisible] = useState(false);
  const [counts, setCounts] = useState({ brands: 0, roas: 0, turnaround: 0 });

  // Scroll parallax → --hero-p (inertially smoothed so a fast scroll GLIDES instead of
  // snapping). On DESKTOP the climax is also scroll-driven, so --hero-a tracks the same
  // eased scroll value; on MOBILE the climax autoplays (below). No React re-render.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    let target = 0, current = 0, raf = 0;
    const measure = () => {
      const rect = hero.getBoundingClientRect();
      target = Math.min(Math.max(-rect.top / (hero.offsetHeight || 1), 0), 1);
    };
    const tick = () => {
      current += (target - current) * 0.12;               // inertial ease toward scroll
      if (Math.abs(target - current) < 0.0006) { current = target; raf = 0; }
      else raf = requestAnimationFrame(tick);
      const v = current.toFixed(4);
      hero.style.setProperty('--hero-p', v);
      if (!isMobile) hero.style.setProperty('--hero-a', v); // desktop: climax follows scroll
    };
    const onScroll = () => {
      if (reduced.matches) { hero.style.setProperty('--hero-p', '0'); return; }
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    measure(); current = target;
    if (!reduced.matches) {
      hero.style.setProperty('--hero-p', current.toFixed(4));
      if (!isMobile) hero.style.setProperty('--hero-a', current.toFixed(4));
    } else {
      hero.style.setProperty('--hero-p', '0');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Climax → --hero-a. MOBILE autoplays it (0→1 once over ~2s on view) so the full
  // approach + vine-bloom + glow always plays; DESKTOP drives it from scroll (above).
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.style.setProperty('--hero-a', '1');             // show the resolved state
      return;
    }
    if (!window.matchMedia('(max-width: 640px)').matches) return; // desktop → scroll-driven
    hero.style.setProperty('--hero-a', '0');
    let raf = 0, started = false;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const play = () => {
      const dur = 2000;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const t = Math.min((ts - start) / dur, 1);
        hero.style.setProperty('--hero-a', ease(t).toFixed(4));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            window.setTimeout(play, 350);                   // let the page settle first
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(hero);
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, []);

  // Vine physics — a damped spring driven by the HAND's velocity. The hand's x is read from
  // the live --hero-a (scroll on desktop, autoplay on mobile); its velocity leans a spring that
  // overshoots + settles, written to --vine-sway (unitless deg). The vine layer picks it up as a
  // subtle sway pivoted at the wrist, so the botanicals move with momentum while the hand stays
  // rigid. Runs only while the hero is on screen; disabled under reduced-motion.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // --vine-sway stays 0

    const APPROACH = 52;                 // px — matches the CSS approach range
    const GAIN = 0.018;                  // deg of lean per (px/s) of hand velocity
    const MAX = 2.5;                     // deg cap on the lean target
    const STIFF = 160, DAMP = 11;        // underdamped → a natural overshoot + settle

    let sway = 0, swayVel = 0, prevX = NaN, last = 0, raf = 0, running = false;
    const handX = () => {
      const a = parseFloat(hero.style.getPropertyValue('--hero-a')) || 0;
      return -APPROACH + Math.min(Math.max(a * 2.85, 0), 1) * APPROACH;
    };
    const frame = (ts: number) => {
      let dt = (ts - last) / 1000; last = ts;
      if (!(dt > 0)) dt = 0.016;
      dt = Math.min(dt, 1 / 30);
      const x = handX();
      if (Number.isNaN(prevX)) prevX = x;
      const vel = (x - prevX) / dt; prevX = x;
      const targetLean = Math.max(-MAX, Math.min(MAX, vel * GAIN));
      swayVel += (STIFF * (targetLean - sway) - DAMP * swayVel) * dt;
      sway += swayVel * dt;
      hero.style.setProperty('--vine-sway', sway.toFixed(3));
      if (running) raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!running) { running = true; last = performance.now(); prevX = NaN; raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 });
    io.observe(hero);
    return () => { io.disconnect(); stop(); };
  }, []);

  // Reveal the headline lines once the hero is in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-clip').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 90);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Animated stat counters — one-shot on first intersection.
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsVisible) {
          setStatsVisible(true);
          const duration = 1200;
          let start: number | null = null;
          const tick = (ts: number) => {
            if (start === null) start = ts;
            const prog = Math.min((ts - start) / duration, 1);
            const eased = 1 - (1 - prog) * (1 - prog);
            setCounts({
              brands: Math.floor(eased * 500),
              roas: Math.round(eased * 100) / 10,
              turnaround: Math.floor(eased * 48),
            });
            if (prog < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [statsVisible]);

  const handlePrimary = () => {
    if (isLoggedIn) navigate('/dashboard');
    else onSignupOpen();
  };

  return (
    <section ref={heroRef} id="hero" className="hero-static relative overflow-hidden">

      {/* z-0 — headline sits BEHIND the hands (3D depth): the reaching hands cross
          the two lines. "Reimagined." is the accent payoff. */}
      <div className="absolute inset-0 z-0 flex items-start justify-center px-4 pt-[17vh] sm:pt-[18vh] pointer-events-none">
        <h1
          className="hero-headline font-gasdrifo font-normal text-center leading-[0.96] tracking-[-0.005em]"
          style={{ color: 'var(--ink)', fontSize: 'clamp(3.7rem, 11vw, 9rem)' }}
        >
          <span className="reveal-clip block overflow-hidden" style={{ transitionDelay: '0ms' }}>Creation,</span>
          <span className="reveal-clip block overflow-hidden" style={{ transitionDelay: '120ms', color: 'var(--accent-ink)' }}>Reimagined.</span>
        </h1>
      </div>

      {/* z-10 — the hands (transparent PNGs) in front of the headline. Two halves
          recompose the reference art full-width; on scroll they APPROACH. The human
          hand is a STATIC grayscale etching; a colored vines/flowers layer fades in
          on approach (only the botanicals bloom) AND gently sways (the vines come
          alive) while the hand itself stays still. Light mode adds a dark backing. */}
      <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden="true">
        <div
          className="hero-hands-wrap absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ top: '55%', width: '100vw', aspectRatio: '3344 / 1882' }}
        >
          {/* small soft accent halo at the fingertip touch point */}
          <div className="hero-glow absolute" aria-hidden="true" />
          {/* one-shot purple-white shimmer at the gap when a theme transition ends */}
          <div className="hero-fingertip-shimmer absolute" aria-hidden="true" />
          {/* human group carries the approach; base is static, vines colorize + sway */}
          <div className="hero-human-group absolute inset-0">
            <img className="hero-hand hero-hand-base absolute left-0 top-0 h-full" style={{ width: `${HUMAN_PCT}%` }} src="/hero-human-uncolored.webp" alt="" />
            {/* dark-mode only: blurred copy behind the vines → a colour-matched glow */}
            <img className="hero-vines-glow absolute left-0 top-0 h-full" style={{ width: `${HUMAN_PCT}%` }} src="/hero-vines.webp" alt="" aria-hidden="true" />
            <img className="hero-vines absolute left-0 top-0 h-full" style={{ width: `${HUMAN_PCT}%` }} src="/hero-vines.webp" alt="" />
          </div>
          <img className="hero-hand hero-hand-robot absolute right-0 top-0 h-full" style={{ width: `${ROBOT_PCT}%` }} src="/hero-robot.webp" alt="CloutKart AI" />
        </div>
      </div>


      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center text-center px-4 pb-12 sm:pb-16 pointer-events-none">
        <p className="hero-frost text-sm sm:text-lg leading-relaxed max-w-2xl mb-5 sm:mb-6 px-5 py-3.5 sm:px-8 sm:py-5 animate-fade-up delay-200" style={{ color: 'var(--ink)' }}>
          The Renaissance redefined art. <span className="font-semibold" style={{ color: 'var(--accent-ink)' }}>AI is redefining creativity.</span> CloutKart
          brings both together to build campaigns that feel human and perform at scale.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-up delay-300 pointer-events-auto">
          <button onClick={handlePrimary} className="btn-primary text-sm sm:text-base">
            Get Your Free Creative
            <ArrowRight size={15} />
          </button>
          <a href="#portfolio" className="btn-secondary text-sm sm:text-base">
            See Our Work
          </a>
        </div>

        <div
          ref={statsRef}
          className="hero-stats grid grid-cols-3 gap-6 sm:gap-12 mt-4 pt-5 sm:mt-9 sm:pt-7 animate-fade-up delay-400"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className={statsVisible ? 'animate-count-up' : ''}>
            <div className="font-mono text-xl sm:text-3xl font-bold gradient-text-warm mb-1 tracking-tight">
              {statsVisible ? `${counts.brands}+` : '0+'}
            </div>
            <div className="text-[10px] sm:text-xs text-ink-dim font-medium uppercase tracking-widest">Brands Scaled</div>
          </div>
          <div className={statsVisible ? 'animate-count-up' : ''} style={{ animationDelay: '60ms' }}>
            <div className="font-mono text-xl sm:text-3xl font-bold gradient-text-warm mb-1 tracking-tight">
              {statsVisible ? (counts.roas >= 10 ? '10×' : `${counts.roas.toFixed(1)}×`) : '0×'}
            </div>
            <div className="text-[10px] sm:text-xs text-ink-dim font-medium uppercase tracking-widest">Avg ROAS</div>
          </div>
          <div className={statsVisible ? 'animate-count-up' : ''} style={{ animationDelay: '120ms' }}>
            <div className="font-mono text-xl sm:text-3xl font-bold gradient-text-warm mb-1 tracking-tight">
              {statsVisible ? `${counts.turnaround}h` : '0h'}
            </div>
            <div className="text-[10px] sm:text-xs text-ink-dim font-medium uppercase tracking-widest">Turnaround</div>
          </div>
        </div>
      </div>
    </section>
  );
}
