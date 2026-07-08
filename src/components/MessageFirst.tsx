import { useEffect, useRef } from 'react';
import { animate, createTimeline, stagger, svg, utils } from 'animejs';

// V2 "The Philosophy" — the doctrine, choreographed. An anime.js timeline sets the
// manifesto letter by letter, an ink rule draws itself, and the format diagram is a
// da-Vinci branch system: one root idea whose ink branches are completed by the
// machine — a violet pulse then circulates through them forever (purple = something
// intelligent is happening). Hovering a format re-draws its branch. Reduced-motion
// (and no-JS) renders the finished page: everything below only ANIMATES state that
// is already complete in the markup.

const FORMATS = ['Static', 'Video', 'UGC', 'Story', 'Email', 'Store'];
const BRANCH_YS = [26, 76, 126, 176, 226, 276];
const MAXIMS = [
  { numeral: 'I', label: 'Message-led', body: "You're not looking for a winning ad. You're looking for the winning message. The ad is just proof." },
  { numeral: 'II', label: 'One message, every format', body: 'Static, video, UGC, story. Same message. Different container. Same conversion engine underneath.' },
  { numeral: 'III', label: 'Foundation that scales', body: 'Build the message once. Deploy it everywhere: ads, store, email, content. All from the same root.' },
];
const MAXIM_STROKES = [
  'M2 8 C 18 4, 34 11, 52 7 S 86 4, 118 8',
  'M2 7 C 22 11, 40 3, 64 8 S 98 10, 118 6',
  'M2 9 C 14 5, 44 10, 70 5 S 100 9, 118 7',
];

const LINE2_WORDS = ["It's", 'about', 'the'];

export default function MessageFirst() {
  const sectionRef = useRef<HTMLElement>(null);
  const played = useRef(false);
  const pulseCtl = useRef<{ cancel: () => void }[]>([]);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // the markup is already the finished page

    const $ = (sel: string) => root.querySelectorAll(sel);

    // ── initial states (only when we know we'll animate) ──
    utils.set($('.phi-dim'), { opacity: 0, translateY: 14 });
    utils.set($('.phi-ch'), { opacity: 0, translateY: '0.55em', rotate: '5deg' });
    utils.set($('.phi-fmt'), { opacity: 0 });
    utils.set($('.phi-node'), { opacity: 0 });
    utils.set($('.phi-maxim'), { opacity: 0, translateY: 18 });
    utils.set($('.phi-quote'), { opacity: 0, translateY: 14 });
    utils.set($('.phi-pulse'), { opacity: 0 });

    const ruleDraw = svg.createDrawable(root.querySelector('.phi-rule-path') as SVGPathElement);
    const branchDraw = svg.createDrawable(...(Array.from($('.phi-branch')) as SVGPathElement[]));
    const maximDraw = svg.createDrawable(...(Array.from($('.phi-mx-trace')) as SVGPathElement[]));
    utils.set(ruleDraw, { draw: '0 0' });
    utils.set(branchDraw, { draw: '0 0' });
    utils.set(maximDraw, { draw: '0 0' });

    const startPulse = () => {
      // one violet pulse circulating root → format, branch after branch, forever
      const branches = Array.from($('.phi-branch')) as SVGPathElement[];
      const pulse = root.querySelector('.phi-pulse') as SVGCircleElement;
      if (!pulse || branches.length === 0) return;
      const tl = createTimeline({ loop: true, defaults: { ease: 'inOutSine' } });
      branches.forEach((p) => {
        const { translateX, translateY } = svg.createMotionPath(p);
        tl.add(pulse, { translateX, translateY, duration: 1500 })
          .add(pulse, { opacity: [0.9, 0], duration: 260 }, '-=260')
          .add(pulse, { opacity: [0, 0.9], duration: 200 });
      });
      pulseCtl.current.push(tl);
    };

    const play = () => {
      const tl = createTimeline({ defaults: { ease: 'outCubic' } });
      tl.add($('.phi-dim-1'), { opacity: 1, translateY: 0, duration: 550 })
        .add($('.phi-ch'), { opacity: 1, translateY: 0, rotate: 0, duration: 620, delay: stagger(26) }, '-=280')
        .add($('.phi-word'), { textShadow: ['0 0 0px rgba(167,139,250,0)', '0 0 26px rgba(167,139,250,0.75)', '0 0 0px rgba(167,139,250,0)'], duration: 900, ease: 'inOutQuad' }, '-=200')
        .add($('.phi-dim-2'), { opacity: 1, translateY: 0, duration: 550 }, '-=650')
        .add(ruleDraw, { draw: '0 1', duration: 700, ease: 'inOutQuad' }, '-=350')
        .add($('.phi-node'), { opacity: 1, duration: 400 }, '-=200')
        .add(branchDraw, { draw: '0 1', duration: 780, ease: 'inOutQuad', delay: stagger(95) }, '-=150')
        .add($('.phi-fmt'), { opacity: 1, scale: [0.7, 1], duration: 640, ease: 'outElastic(1, .75)', delay: stagger(65) }, '-=620')
        .add($('.phi-quote'), { opacity: 1, translateY: 0, duration: 600 }, '-=250')
        .add($('.phi-maxim'), { opacity: 1, translateY: 0, duration: 620, delay: stagger(120) }, '-=350')
        .add(maximDraw, { draw: '0 1', duration: 700, ease: 'inOutQuad', delay: stagger(120) }, '-=700');
      tl.then(() => { utils.set($('.phi-pulse'), { opacity: 0.9 }); startPulse(); });
      pulseCtl.current.push(tl);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !played.current) {
          played.current = true;
          play();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(root);
    return () => {
      io.disconnect();
      pulseCtl.current.forEach((t) => t.cancel());
      pulseCtl.current = [];
    };
  }, []);

  // hover a format → the machine re-draws its branch
  const redrawBranch = (i: number) => {
    const root = sectionRef.current;
    if (!root || !played.current) return;
    const path = root.querySelectorAll('.phi-branch')[i] as SVGPathElement | undefined;
    if (!path) return;
    const d = svg.createDrawable(path);
    utils.set(d, { draw: '0 0' });
    animate(d, { draw: '0 1', duration: 620, ease: 'outQuad' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-40 [overflow-x:clip]"
      id="message"
      style={{ background: 'transparent' }}
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="mono-label mb-10 sm:mb-12" style={{ letterSpacing: '0.3em' }}>The Philosophy</p>

        {/* ── Manifesto — set letter by letter, like type being placed ── */}
        <div className="mb-14 md:mb-20">
          <div className="phi-dim phi-dim-1 font-authored italic" style={{ fontSize: 'clamp(1.3rem, 2.6vw, 2rem)', color: 'var(--ink-dim)' }}>
            It's not about the ad.
          </div>

          <h2
            className="font-authored font-semibold leading-[1.02] my-2"
            style={{ fontSize: 'clamp(2.9rem, 8.5vw, 6rem)', color: 'var(--ink)', textWrap: 'balance', letterSpacing: '0.005em' }}
          >
            {LINE2_WORDS.map((w) => (
              <span key={w} className="inline-block" style={{ marginRight: '0.24em' }}>
                {w.split('').map((c, j) => (
                  <span key={j} className="phi-ch inline-block">{c}</span>
                ))}
              </span>
            ))}
            <span className="phi-word inline-block" style={{ color: 'var(--accent-ink)' }}>
              {'message.'.split('').map((c, j) => (
                <span key={j} className="phi-ch inline-block">{c}</span>
              ))}
            </span>
          </h2>

          {/* the ink rule draws itself — no scan-line */}
          <svg className="block" width="min(32rem, 100%)" height="10" viewBox="0 0 512 10" preserveAspectRatio="none" aria-hidden="true">
            <path className="phi-rule-path" d="M2 6 C 90 2, 190 9, 300 5 S 460 3, 510 6" fill="none" stroke="var(--accent-strong)" strokeWidth="1.2" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px rgb(var(--accent-rgb) / 0.5))' }} />
          </svg>

          <div className="phi-dim phi-dim-2 font-authored italic mt-2" style={{ fontSize: 'clamp(1.3rem, 2.6vw, 2rem)', color: 'var(--ink-dim)' }}>
            The ad is just the vehicle.
          </div>
        </div>

        {/* ── The branch diagram — one root idea, completed by the machine ── */}
        <div className="mb-6 md:mb-10 hidden sm:block">
          <svg className="phi-diagram" viewBox="0 0 660 300" fill="none" aria-label="One root idea branching into every format">
            {/* root */}
            <g className="phi-node">
              <circle cx="86" cy="151" r="5" fill="var(--accent)" style={{ filter: 'drop-shadow(0 0 6px rgb(var(--accent-rgb) / 0.7))' }} />
              <text x="10" y="128" className="phi-root-title">One root idea.</text>
              <text x="10" y="182" className="phi-root-sub">ENGINEERED ONCE</text>
            </g>
            {/* branches */}
            {BRANCH_YS.map((y) => (
              <path
                key={y}
                className="phi-branch"
                d={`M92 151 C 250 151, 260 ${y}, 430 ${y}`}
                stroke="rgb(var(--accent-rgb) / 0.55)"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            ))}
            {/* formats */}
            {FORMATS.map((f, i) => (
              <g key={f} className="phi-fmt" style={{ transformOrigin: `445px ${BRANCH_YS[i]}px` }} onMouseEnter={() => redrawBranch(i)}>
                <circle cx="437" cy={BRANCH_YS[i]} r="2.6" fill="var(--accent)" />
                <text x="452" y={BRANCH_YS[i] + 4} className="phi-fmt-label">{f.toUpperCase()}</text>
              </g>
            ))}
            {/* the circulating intelligence */}
            <circle className="phi-pulse" cx="0" cy="0" r="3.4" fill="var(--accent-strong)" style={{ filter: 'drop-shadow(0 0 6px rgb(var(--accent-rgb) / 0.9))' }} />
          </svg>
        </div>

        {/* mobile: compact format list (the SVG diagram needs width) */}
        <div className="sm:hidden mb-10">
          <div className="font-authored font-semibold text-2xl mb-1" style={{ color: 'var(--ink)' }}>One root idea.</div>
          <p className="mono-label mb-4">Engineered once</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {FORMATS.map((f) => (
              <span key={f} className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: 'var(--ink-muted)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* ── Pull-quote ── */}
        <div className="phi-quote mb-14 md:mb-20 max-w-3xl">
          <p className="font-authored font-semibold leading-[1.2]" style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.5rem)', color: 'var(--ink)' }}>
            A winning message can be translated into <span style={{ color: 'var(--accent-ink)' }}>anything.</span>
          </p>
          <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--ink-muted)', maxWidth: '34rem' }}>
            The message is the foundation. The format is the container. CloutKart builds the message first; everything else scales from there.
          </p>
        </div>

        {/* ── Maxims I · II · III ── */}
        <div className="grid sm:grid-cols-3 gap-x-10 gap-y-10" style={{ borderTop: '1px solid var(--border)' }}>
          {MAXIMS.map((m, i) => (
            <div key={m.numeral} className="phi-maxim pt-7">
              <div className="flex items-baseline gap-3 mb-1.5">
                <span className="font-authored ws-numeral" style={{ fontSize: '1.6rem' }}>{m.numeral}</span>
                <div className="font-authored font-semibold text-lg leading-snug" style={{ color: 'var(--ink)' }}>{m.label}</div>
              </div>
              <svg width="min(100%, 200px)" height="12" viewBox="0 0 120 14" preserveAspectRatio="none" aria-hidden="true" style={{ overflow: 'visible', display: 'block' }}>
                <path className="phi-mx-trace" d={MAXIM_STROKES[i]} fill="none" stroke="var(--accent-strong)" strokeWidth="0.9" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px rgb(var(--accent-rgb) / 0.55))' }} />
              </svg>
              <p className="text-sm leading-relaxed mt-2.5" style={{ color: 'var(--ink-muted)' }}>{m.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
