import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  onSignupOpen: () => void;
}

// Borel font glyphs for "Convert." — pre-extracted SVG paths, Y-flipped, x-cumulative
// viewBox: 0 0 4643 830  (50px top padding above tallest ascender)
const CONVERT_PATHS = [
  'M382 814Q280 814 206.5 769.0Q133 724 94.0 643.0Q55 562 55 453Q55 337 97.5 249.5Q140 162 216.0 113.0Q292 64 390 64Q468 64 532.5 95.5Q597 127 637 183Q632 201 611.5 220.0Q591 239 571 245Q535 198 489.0 176.0Q443 154 390 154Q319 154 265.0 191.0Q211 228 181.0 294.0Q151 360 151 448Q151 531 178.5 593.0Q206 655 259.5 689.5Q313 724 390 724Q457 724 506.0 697.0Q555 670 595 621Q614 627 634.0 643.0Q654 659 662 675Q616 743 543.5 778.5Q471 814 382 814Z',
  'M698 728Q731 728 762.5 696.5Q794 665 816 612Q812 588 812 563Q812 491 843.0 435.0Q874 379 927.5 346.5Q981 314 1048 314Q1115 314 1168.0 346.5Q1221 379 1251.5 435.0Q1282 491 1282 563Q1282 635 1251.5 692.0Q1221 749 1168.5 781.5Q1116 814 1048 814Q987 814 937.5 787.5Q888 761 856 715Q794 814 691 814Q678 814 670.0 802.0Q662 790 662 771Q662 728 698 728ZM1047 728Q1111 728 1149.5 683.0Q1188 638 1188 563Q1188 526 1177 495Q1117 493 1068.5 471.0Q1020 449 992 411Q952 428 929.0 468.5Q906 509 906 565Q906 638 944.5 683.0Q983 728 1047 728Z',
  'M1322 814Q1309 814 1301.0 802.0Q1293 790 1293 771Q1293 728 1329 728Q1361 728 1386.5 695.5Q1412 663 1431 587L1461 470Q1503 314 1621 314Q1666 314 1697.0 340.5Q1728 367 1740 412Q1768 365 1812.0 339.5Q1856 314 1910 314Q1988 314 2030.5 365.0Q2073 416 2073 508V625Q2073 680 2087.5 704.0Q2102 728 2134 728Q2148 728 2155.5 740.0Q2163 752 2163 772Q2163 788 2154.5 801.0Q2146 814 2127 814Q1982 814 1982 636V508Q1982 400 1897 400Q1853 400 1819.5 435.0Q1786 470 1767.5 532.0Q1749 594 1749 676V800Q1739 803 1727.0 805.0Q1715 807 1704 807Q1680 807 1659 800V481Q1659 442 1649.0 421.0Q1639 400 1613 400Q1592 400 1577.0 419.0Q1562 438 1551 480L1514 624Q1488 723 1442.0 768.5Q1396 814 1322 814Z',
  'M2127 814Q2114 814 2106.0 802.0Q2098 790 2098 771Q2098 728 2134 728Q2166 728 2191.5 695.5Q2217 663 2236 587L2266 470Q2308 314 2426 314Q2479 314 2516.5 355.5Q2554 397 2554 468V619Q2554 728 2618 728Q2659 728 2694.0 695.0Q2729 662 2750.5 608.5Q2772 555 2772 494Q2772 486 2772 478Q2725 460 2699 430Q2702 398 2716.0 371.5Q2730 345 2750.5 329.5Q2771 314 2790 314Q2823 314 2843.5 362.5Q2864 411 2864 486Q2864 579 2830.5 653.5Q2797 728 2739.0 771.0Q2681 814 2608 814Q2541 814 2502.0 766.5Q2463 719 2463 638V481Q2463 437 2450.0 418.5Q2437 400 2418 400Q2397 400 2382.0 419.0Q2367 438 2356 480L2319 624Q2293 723 2247.0 768.5Q2201 814 2127 814Z',
  'M2928 814Q2915 814 2907.0 802.0Q2899 790 2899 771Q2899 728 2935 728Q2964 728 2994.0 718.5Q3024 709 3064 686Q3025 618 3025 526Q3025 464 3048.0 416.5Q3071 369 3112.0 341.5Q3153 314 3205 314Q3249 314 3283.0 334.5Q3317 355 3336.0 391.0Q3355 427 3355 474Q3355 538 3317.5 591.0Q3280 644 3191 706Q3223 729 3277 729Q3291 729 3299.0 741.0Q3307 753 3307 773Q3307 792 3298.0 803.0Q3289 814 3272 814Q3224 814 3182.0 798.0Q3140 782 3112 754Q3016 814 2928 814ZM3112 518Q3112 597 3140 644Q3205 599 3236.5 556.0Q3268 513 3268 474Q3268 438 3250.5 417.5Q3233 397 3202 397Q3163 397 3137.5 432.0Q3112 467 3112 518Z',
  'M3370 814Q3357 814 3349.0 802.0Q3341 790 3341 771Q3341 728 3377 728Q3421 728 3455.5 691.5Q3490 655 3510.5 592.0Q3531 529 3531 452Q3531 434 3529.0 419.0Q3527 404 3524 394Q3515 385 3504.5 365.0Q3494 345 3486.5 322.5Q3479 300 3479 286Q3491 267 3517.5 256.5Q3544 246 3576 251Q3595 286 3607 339Q3637 338 3688 326Q3720 319 3739.5 316.5Q3759 314 3773 314Q3827 314 3858.0 354.5Q3889 395 3889 464V625Q3889 680 3903.5 704.0Q3918 728 3950 728Q3964 728 3971.5 740.0Q3979 752 3979 772Q3979 788 3970.5 801.0Q3962 814 3943 814Q3798 814 3798 636V481Q3798 436 3788.0 418.0Q3778 400 3752 400Q3743 400 3732.0 402.0Q3721 404 3693 410Q3644 420 3619 422Q3620 438 3620 454Q3620 562 3589.0 643.0Q3558 724 3501.5 769.0Q3445 814 3370 814Z',
  'M3950 728Q3975 728 4007.5 713.0Q4040 698 4071.0 662.0Q4102 626 4122.0 564.5Q4142 503 4142 410V314H4032Q4025 298 4025.0 274.0Q4025 250 4032 234H4142V57Q4161 50 4188 50Q4212 50 4234 57V234H4384Q4392 250 4392.0 274.0Q4392 298 4384 314H4234V521Q4234 621 4264.5 674.5Q4295 728 4351 728Q4380 728 4380 772Q4380 791 4370.5 802.5Q4361 814 4344 814Q4280 814 4235.5 777.0Q4191 740 4169 673Q4127 746 4066.5 780.0Q4006 814 3943 814Q3930 814 3922.0 801.5Q3914 789 3914 771Q3914 752 3923.0 740.0Q3932 728 3950 728Z',
  'M4492 814Q4464 814 4444.0 793.5Q4424 773 4424 745Q4424 717 4444.0 697.0Q4464 677 4492 677Q4520 677 4540.5 697.0Q4561 717 4561 745Q4561 773 4540.5 793.5Q4520 814 4492 814Z',
];

function VisionPreview() {
  const colors = [
    { name: 'Mocha Morning', hex: '#9B5B1A' },
    { name: 'Coconut Cream', hex: '#EDE8D8' },
    { name: 'Fresh Brew', hex: '#3A2010' },
  ];
  const deliverables = [
    'Static image ad — Instagram feed 1080×1080px',
    'Static image ad — Facebook feed 1080×1080px',
    'Static image ad — Story 1080×1920px',
  ];

  return (
    // Product mockup: theme-aware — renders as light UI on the light page, dark on dark.
    <div className="relative">
      {/* Brief pill — floats above */}
      <div
        className="absolute -top-5 left-6 z-10 flex items-center gap-2.5 rounded-full px-4 py-2 animate-float-delayed"
        style={{ background: 'rgb(var(--white-rgb) / 0.05)', border: '1px solid rgb(var(--white-rgb) / 0.10)', backdropFilter: 'blur(12px)' }}
      >
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
        <span className="text-[11px] font-medium text-white/60 font-mono">Brief submitted · Brewora Coffee Scrub</span>
      </div>

      {/* Status pill — floats top right */}
      <div
        className="absolute -top-5 right-2 z-10 flex items-center gap-2 rounded-full px-3 py-1.5 animate-float"
        style={{ background: 'rgb(var(--success-rgb) / 0.1)', border: '1px solid rgb(var(--success-rgb) / 0.25)', backdropFilter: 'blur(12px)' }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
        <span className="text-[10px] font-semibold font-mono" style={{ color: 'var(--success)' }}>In Review</span>
      </div>

      {/* Main vision card */}
      <div
        className="rounded-2xl animate-float"
        style={{
          background: 'var(--bg-elev)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(24px)',
          boxShadow: 'var(--shadow-card-hover)',
        }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgb(var(--white-rgb) / 0.06)' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={12} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-bold text-white font-heading tracking-tight">Our vision</span>
          </div>
          <span
            className="flex items-center gap-1 text-[9px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'rgb(var(--accent-rgb) / 0.1)', border: '1px solid rgb(var(--accent-rgb) / 0.2)', color: 'var(--accent-ink)' }}
          >
            <Sparkles size={7} />
            Pixie · AI Creative Intelligence
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Vibe */}
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-dim mb-2 font-mono">Creative Vibe</div>
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-[11px] font-bold"
                style={{ background: 'rgb(var(--accent-rgb) / 0.15)', border: '1px solid rgb(var(--accent-rgb) / 0.3)', color: 'var(--accent-ink)' }}
              >
                Brewed Awakening
              </span>
              <span className="text-[11px] text-ink-muted leading-snug">Raw, earthy, unapologetically effective.</span>
            </div>
          </div>

          {/* Hook — the centrepiece */}
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-dim mb-2 font-mono">Hook</div>
            <div
              className="px-4 py-3 rounded-xl"
              style={{ background: 'rgb(var(--white-rgb) / 0.04)', border: '1px solid rgb(var(--white-rgb) / 0.08)' }}
            >
              <span className="text-[18px] font-bold font-heading text-white leading-tight">
                Tan lines are so last season
              </span>
            </div>
          </div>

          {/* Color story */}
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-dim mb-2 font-mono">Color Story</div>
            <div className="flex items-center gap-3">
              {colors.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full border border-white/15 flex-shrink-0" style={{ background: c.hex }} />
                  <span className="text-[10px] text-ink-muted">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-1.5">
            {deliverables.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle size={10} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span className="text-[10px] text-ink-muted">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end px-5 py-3.5"
          style={{ borderTop: '1px solid rgb(var(--white-rgb) / 0.06)' }}
        >
          <button
            className="text-[11px] font-bold px-4 py-2 rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent))' }}
          >
            Approve vision
          </button>
        </div>
      </div>

      {/* Deliverable ready pill — floats bottom left */}
      <div
        className="absolute -bottom-5 left-4 z-10 flex items-center gap-2 rounded-full px-3.5 py-2 animate-float-slow"
        style={{ background: 'rgb(var(--white-rgb) / 0.05)', border: '1px solid rgb(var(--white-rgb) / 0.10)', backdropFilter: 'blur(12px)' }}
      >
        <CheckCircle size={11} style={{ color: 'var(--success)', flexShrink: 0 }} />
        <span className="text-[10px] font-medium text-white/55 font-mono">Creatives delivered · 48h</span>
      </div>

      {/* ROAS pill — floats bottom right */}
      <div
        className="absolute -bottom-5 right-2 z-10 flex items-center gap-2.5 rounded-full px-4 py-2 animate-float-delayed"
        style={{ background: 'rgb(var(--white-rgb) / 0.05)', border: '1px solid rgb(var(--white-rgb) / 0.10)', backdropFilter: 'blur(12px)' }}
      >
        <span className="font-mono text-sm font-bold gradient-text-warm">+284%</span>
        <span className="text-[11px] text-ink-muted">avg ROAS lift</span>
      </div>
    </div>
  );
}

export default function Hero({ onSignupOpen }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoLayerRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [statsVisible, setStatsVisible] = useState(false);
  const [counts, setCounts] = useState({ brands: 0, roas: 0, turnaround: 0 });
  const [convertActive, setConvertActive] = useState(false);
  const convertSvgRef = useRef<SVGSVGElement>(null);

  // Scrub the video in both directions with the scroll position. The subtle
  // opposing layer movement adds depth without moving the content itself.
  useEffect(() => {
    const hero = heroRef.current;
    const videoLayer = videoLayerRef.current;
    const video = heroVideoRef.current;
    if (!hero || !videoLayer || !video) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let targetProgress = 0;

    const renderScrollAnimation = () => {
      frame = 0;
      if (reducedMotion.matches) {
        videoLayer.style.transform = 'translate3d(0, 0, 0) scale(1.06)';
        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) video.currentTime = 0;
        return;
      }

      const offset = targetProgress * 120;
      videoLayer.style.transform = `translate3d(0, ${offset}px, 0) scale(1.06)`;

      if (video.readyState >= HTMLMediaElement.HAVE_METADATA && video.duration) {
        // Quantize to the source's 24fps cadence. This avoids flooding the
        // media decoder with redundant seeks between actual video frames.
        const exactTime = targetProgress * Math.max(video.duration - 0.04, 0);
        const frameTime = Math.round(exactTime * 24) / 24;
        if (Math.abs(video.currentTime - frameTime) > 1 / 48) {
          video.currentTime = frameTime;
        }
      }
    };

    const measureScroll = () => {
      if (reducedMotion.matches) {
        targetProgress = 0;
      } else {
        const bounds = hero.getBoundingClientRect();
        const runway = Math.max(bounds.height - window.innerHeight, 1);
        targetProgress = Math.min(Math.max(-bounds.top / runway, 0), 1);
      }
      if (!frame) frame = window.requestAnimationFrame(renderScrollAnimation);
    };

    video.pause();
    measureScroll();
    window.addEventListener('scroll', measureScroll, { passive: true });
    window.addEventListener('resize', measureScroll);
    video.addEventListener('loadedmetadata', measureScroll);
    reducedMotion.addEventListener('change', measureScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', measureScroll);
      window.removeEventListener('resize', measureScroll);
      video.removeEventListener('loadedmetadata', measureScroll);
      reducedMotion.removeEventListener('change', measureScroll);
    };
  }, []);

  // Scroll-reveal for .reveal, .reveal-scale, and .reveal-clip elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-scale, .reveal-clip').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 80);
            });
            // Wait for Borel to load then trigger the write animation
            document.fonts.ready.then(() => {
              setTimeout(() => setConvertActive(true), 900);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Animated stat counters — one-shot on first intersection
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
            if (!start) start = ts;
            const prog = Math.min((ts - start) / duration, 1);
            const eased = 1 - (1 - prog) * (1 - prog); // ease-out quad
            setCounts({
              brands: Math.floor(eased * 500),
              roas: Math.round(eased * 100) / 10,       // 0.0 → 10.0
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
    <section
      ref={heroRef}
      className="hero-scroll-scene relative"
      id="hero"
      data-theme="dark"
      style={{ background: 'transparent' }}
    >
      <div className="hero-scroll-sticky flex items-center justify-center overflow-hidden">
      {/* Cinematic background. The extra height gives the layer room to move
          without revealing an edge during the parallax scroll. */}
      <div
        ref={videoLayerRef}
        className="absolute -inset-[8%] pointer-events-none"
        style={{ zIndex: 0, willChange: 'transform', transform: 'translate3d(0, 0, 0) scale(1.06)' }}
        aria-hidden="true"
      >
        <video
          ref={heroVideoRef}
          className="h-full w-full object-cover"
          src="/cloutkart-hero.mp4"
          poster="/cloutkart-hero-poster.jpg"
          muted
          playsInline
          preload="auto"
        />
      </div>

      {/* Contrast treatment keeps the headline and product preview legible
          throughout every frame of the source video. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: [
            'linear-gradient(90deg, rgba(8,8,8,0.9) 0%, rgba(8,8,8,0.7) 43%, rgba(8,8,8,0.48) 72%, rgba(8,8,8,0.62) 100%)',
            'linear-gradient(180deg, rgba(8,8,8,0.48) 0%, rgba(8,8,8,0.14) 48%, rgba(8,8,8,0.82) 100%)',
          ].join(','),
        }}
      />

      {/* Ambient background orbs — pure radial gradients, no filter:blur, GPU-safe */}
      <div
        className="absolute pointer-events-none animate-orb-drift"
        style={{
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgb(var(--accent-rgb) / 0.08) 0%, transparent 70%)',
          top: '-8%', left: '-12%', zIndex: 2,
        }}
      />
      <div
        className="absolute pointer-events-none animate-orb-drift-alt"
        style={{
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgb(var(--accent-rgb) / 0.06) 0%, transparent 70%)',
          top: '35%', right: '-8%', zIndex: 2,
          animationDelay: '-10s',
        }}
      />
      <div
        className="absolute pointer-events-none animate-orb-drift"
        style={{
          width: '360px', height: '360px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgb(var(--accent-rgb) / 0.05) 0%, transparent 70%)',
          bottom: '8%', left: '28%', zIndex: 2,
          animationDelay: '-16s',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Left */}
          <div className="text-left">
            <div className="eyebrow-pill mb-6 sm:mb-8 animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
              AI Creative Operations Platform
            </div>

            {/* Headline — each word line gets a clip-path reveal with staggered delay */}
            <h1
              className="font-heading font-extrabold leading-[1.03] tracking-[-0.035em] mb-6"
              style={{ fontSize: 'clamp(3rem, 7vw, 5.6rem)' }}
            >
              <span
                className="reveal-clip block overflow-hidden"
                style={{ color: 'var(--ink)', transitionDelay: '0ms' }}
              >
                AI-Powered Ads
              </span>
              <span
                className="reveal-clip block overflow-hidden"
                style={{ color: 'var(--ink)', transitionDelay: '120ms' }}
              >
                That Actually
              </span>
              {/* "Convert." — Borel glyphs revealed by a single round-nib ink sweep */}
              <span className="block" style={{ lineHeight: 1.1, overflow: 'visible' }}>
                <svg
                  ref={convertSvgRef}
                  viewBox="0 0 4643 830"
                  aria-label="Convert."
                  role="img"
                  preserveAspectRatio="xMinYMin meet"
                  className={convertActive ? 'animate-ink-write' : ''}
                  style={{
                    display: 'block',
                    width: '100%',
                    aspectRatio: '4643 / 830',
                    overflow: 'visible',
                    ...(convertActive ? {} : { clipPath: 'inset(-15% 100% -15% 0%)' }),
                  }}
                >
                  <defs>
                    <linearGradient id="convertGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" style={{ stopColor: 'var(--accent-ink)' }} />
                      <stop offset="50%" style={{ stopColor: 'var(--accent)' }} />
                      <stop offset="100%" style={{ stopColor: 'var(--accent-ink)' }} />
                    </linearGradient>
                  </defs>
                  {CONVERT_PATHS.map((d, i) => (
                    <path key={i} d={d} fill="url(#convertGrad)" />
                  ))}
                </svg>
              </span>
            </h1>

            <p className="text-ink-muted text-base sm:text-lg leading-[1.8] mb-9 max-w-md animate-fade-up delay-200">
              A complete creative operations platform — submit briefs, manage requests, review deliverables, and collaborate with your team in one place. Powered by <span className="text-white font-semibold">Pixie</span>, our AI engine that turns product info into campaign-ready hooks, color stories, and visual direction before production begins.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-up delay-300">
              <button onClick={handlePrimary} className="btn-primary text-sm sm:text-base">
                Get Your Free Creative
                <ArrowRight size={15} />
              </button>
              <a href="#portfolio" className="btn-secondary text-sm sm:text-base">
                See Our Work
              </a>
            </div>

            {/* Animated stat counters */}
            <div
              ref={statsRef}
              className="grid grid-cols-3 gap-4 mt-12 pt-10 animate-fade-up delay-400"
              style={{ borderTop: '1px solid rgb(var(--white-rgb) / 0.07)' }}
            >
              <div className={statsVisible ? 'animate-count-up' : ''}>
                <div className="font-mono text-2xl sm:text-3xl font-bold gradient-text-warm mb-1 tracking-tight">
                  {statsVisible ? `${counts.brands}+` : '0+'}
                </div>
                <div className="text-[10px] sm:text-xs text-ink-dim font-medium uppercase tracking-widest">Brands Scaled</div>
              </div>
              <div className={statsVisible ? 'animate-count-up' : ''} style={{ animationDelay: '60ms' }}>
                <div className="font-mono text-2xl sm:text-3xl font-bold gradient-text-warm mb-1 tracking-tight">
                  {statsVisible ? (counts.roas >= 10 ? '10×' : `${counts.roas.toFixed(1)}×`) : '0×'}
                </div>
                <div className="text-[10px] sm:text-xs text-ink-dim font-medium uppercase tracking-widest">Avg ROAS</div>
              </div>
              <div className={statsVisible ? 'animate-count-up' : ''} style={{ animationDelay: '120ms' }}>
                <div className="font-mono text-2xl sm:text-3xl font-bold gradient-text-warm mb-1 tracking-tight">
                  {statsVisible ? `${counts.turnaround}h` : '0h'}
                </div>
                <div className="text-[10px] sm:text-xs text-ink-dim font-medium uppercase tracking-widest">Turnaround</div>
              </div>
            </div>
          </div>

          {/* Right: product demo */}
          <div className="hidden lg:block py-8 px-4">
            <VisionPreview />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }} />
      </div>
    </section>
  );
}
