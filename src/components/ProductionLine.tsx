import { useEffect, useRef, useState } from 'react';
import { animate, createTimeline, stagger, svg, utils } from 'animejs';

// V3 Sheet 02 "The Assembly" — the page's centrepiece drawing: the creative
// production line as a CLOSED CIRCUIT. Six stations across the top, then a routed
// return track that carries campaign signal back under the line to re-brief the
// next run. (The Return used to be its own section; folding it in here is what
// makes the drawing a loop instead of a line with two dead ends.)
//
// Flowchart grammar is used honestly, so the automated share reads before a single
// label does:
//   RECTANGLE = a process the machine runs      → violet
//   DIAMOND   = a decision a person makes       → graphite
//   a rail segment is graphite only when it ENDS at a gate
//
// Motion follows the MessageFirst pattern (anime.js v4): the markup ships the
// FINISHED drawing and the timeline only animates state that is already complete,
// so reduced-motion and no-JS need no fallback branch — just an early return.

type Station = {
  name: string;
  auto: boolean;
  detail: string;
  /** endpoints drawn beneath this station — each branch is labelled individually */
  fan?: string[];
};

const STATIONS: Station[] = [
  {
    name: 'Research',
    auto: true,
    detail:
      'Winning ad styles, category patterns, and competitor angles are pulled and summarised before anyone opens a document. The run starts from evidence rather than a blank page.',
  },
  {
    name: 'Winning Message',
    auto: false,
    detail:
      'Pixie proposes the core message and the hook it hangs on. You approve the direction here, while changing it still costs nothing. This is the first of two gates.',
  },
  {
    name: 'Format Map',
    auto: true,
    detail:
      'The approved message is mapped across every format your account actually runs. Nothing is briefed twice, and nothing is quietly dropped.',
    fan: ['Static', 'Video', 'UGC', 'Story', 'Email', 'Store'],
  },
  {
    name: 'Concepting',
    auto: true,
    detail:
      'Visual concepts and copy variants are produced for the whole map in a single pass, so the batch arrives complete instead of trickling in one asset at a time.',
  },
  {
    name: 'Polish & QC',
    auto: false,
    detail:
      'Brand rules, legibility, and platform specs are checked against the map before delivery. You sign off the batch. This is the second and last gate.',
  },
  {
    name: 'Export & Deliver',
    auto: true,
    detail:
      'Every approved concept is resized, exported, versioned, and delivered ready to upload. Then it launches, and the platforms start reporting back.',
    fan: ['IG Feed', 'FB Feed', 'IG Story', 'Amazon'],
  },
];

// Figures already claimed elsewhere on the site. Nothing new is asserted.
const SIGNAL = '8.4% CTR · 10.2× ROAS · 4.1% CVR';

// ── geometry: one source of truth for paths, symbols, and labels ──────────────
const VB_W = 1160;
const VB_H = 400;
const DIM_Y = 40; // total-cycle dimension, above the line
const IDX_Y = 74; // station index
const RAIL_Y = 108;
const SYM = 15; // half-width of a station symbol
const NAME_Y = RAIL_Y + SYM + 24;
const FAN_TOP = NAME_Y + 15;
const FAN_BOT = FAN_TOP + 52;
const FAN_LBL_Y = FAN_BOT + 8; // rotated labels start here and read downward
const RET_Y = 336; // the return track's bottom run
// The station span is inset well clear of the return track's vertical runs: at the
// previous 90/1070 the "EXPORT & DELIVER" label (the longest, ~130px) ran straight
// through the right-hand rail. Station labels are centred, so the span has to leave
// half the longest label plus margin at each end.
const X_FIRST = 150;
const X_LAST = 1010;
const RET_L = 26; // return track's left vertical
const RET_R = 1134; // ...and its right
const FAN_SPREAD = 22; // rotated labels only need to clear each other's height

const stationX = (i: number) => X_FIRST + (i * (X_LAST - X_FIRST)) / (STATIONS.length - 1);
const segmentD = (i: number) =>
  `M${stationX(i) + SYM + 6} ${RAIL_Y} L${stationX(i + 1) - SYM - 6} ${RAIL_Y}`;

// The return track: out the right of station 06, down, back under everything, and
// up into the left of station 01. Routed with square corners, because a routed
// track belongs to the drawing language in a way a swoosh does not.
const RETURN_D = [
  `M${X_LAST + SYM} ${RAIL_Y}`,
  `H${RET_R - 20}`,
  `Q${RET_R} ${RAIL_Y} ${RET_R} ${RAIL_Y + 20}`,
  `V${RET_Y - 20}`,
  `Q${RET_R} ${RET_Y} ${RET_R - 20} ${RET_Y}`,
  `H${RET_L + 20}`,
  `Q${RET_L} ${RET_Y} ${RET_L} ${RET_Y - 20}`,
  `V${RAIL_Y + 20}`,
  `Q${RET_L} ${RAIL_Y} ${RET_L + 20} ${RAIL_Y}`,
  `H${X_FIRST - SYM}`,
].join(' ');

// motion timings
const SEG_MS = 900;
const RETURN_MS = 1500;
const HOLD_AUTO = 260;
const HOLD_GATE = 1100;

export default function ProductionLine() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const played = useRef(false);
  const ctl = useRef<{ cancel: () => void }[]>([]);
  // Once the visitor touches the diagram, the token stops driving the panel — it
  // keeps circling, but it no longer yanks the reader off whatever they selected.
  const userTook = useRef(false);

  const takeOver = (i: number) => {
    userTook.current = true;
    setActive(i);
  };

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // markup is the finished drawing

    const $ = (sel: string) => Array.from(root.querySelectorAll(sel));

    const segs = $('.pl-seg') as SVGPathElement[];
    const glows = $('.pl-glow') as SVGPathElement[]; // includes the return leg last
    const returnPath = root.querySelector('.pl-return') as SVGPathElement | null;
    const token = root.querySelector('.pl-token') as SVGCircleElement | null;
    const pings = $('.pl-ping') as SVGCircleElement[];
    if (!returnPath || !token) return;

    // createDrawable takes ONE targets param (array / NodeList / selector), never
    // varargs — spreading silently registers only the first path.
    const railDraw = svg.createDrawable(segs);
    const fanDraw = svg.createDrawable($('.pl-fan-line') as SVGPathElement[]);
    const returnDraw = svg.createDrawable(returnPath);
    const glowDraws = glows.map((g) => svg.createDrawable(g));

    utils.set(railDraw, { draw: '0 0' });
    utils.set(fanDraw, { draw: '0 0' });
    utils.set(returnDraw, { draw: '0 0' });
    glowDraws.forEach((d) => utils.set(d, { draw: '0 0' }));
    utils.set($('.pl-sym'), { opacity: 0 });
    utils.set($('.pl-text'), { opacity: 0 });
    utils.set($('.pl-dim'), { opacity: 0 });
    utils.set($('.pl-retlabel'), { opacity: 0 });
    utils.set(token, { opacity: 0 });
    utils.set(pings, { opacity: 0 });

    const ping = (i: number) => {
      const el = pings[i];
      if (!el) return;
      utils.set(el, { scale: 1, opacity: 0.7 });
      animate(el, { scale: 2.8, opacity: 0, duration: 720, ease: 'outQuad' });
    };

    // The lap. Each leg: travel, land with a pop, then hold — briefly at an auto
    // station, ~4x longer at a gate, where the token visibly throbs because that
    // is precisely where a real job sits waiting on a person.
    const runLap = () => {
      const tl = createTimeline({ loop: true });

      segs.forEach((path, i) => {
        const { translateX, translateY } = svg.createMotionPath(path);
        const arriving = i + 1;

        tl.add(token, {
          translateX,
          translateY,
          duration: SEG_MS,
          ease: 'inOutQuad',
          onBegin: () => {
            if (i === 0) {
              // new lap: clear last lap's trail
              utils.set(glows, { opacity: 1 });
              glowDraws.forEach((d) => utils.set(d, { draw: '0 0' }));
            }
          },
        });
        // the rail lights up behind the token as it crosses
        tl.add(glowDraws[i], { draw: '0 1', duration: SEG_MS, ease: 'inOutQuad' }, `-=${SEG_MS}`);

        // landing: elastic pop on the token + a ring off the station
        tl.add(token, {
          scale: [1, 2.1, 1],
          duration: 460,
          ease: 'outElastic(1, .45)',
          onBegin: () => {
            ping(arriving);
            if (!userTook.current) setActive(arriving);
          },
        });

        // hold — a gate holds, and shows that it is holding
        if (STATIONS[arriving].auto) {
          tl.add(token, { opacity: [0.95, 0.95], duration: HOLD_AUTO });
        } else {
          tl.add(token, {
            scale: [1, 1.35, 1, 1.35, 1],
            duration: HOLD_GATE,
            ease: 'inOutSine',
          });
        }
      });

      // the return leg — one fast unbroken run, no station beats on the way back
      const ret = svg.createMotionPath(returnPath);
      tl.add(token, {
        translateX: ret.translateX,
        translateY: ret.translateY,
        duration: RETURN_MS,
        ease: 'inOutCubic',
      });
      tl.add(
        glowDraws[glowDraws.length - 1],
        { draw: '0 1', duration: RETURN_MS, ease: 'inOutCubic' },
        `-=${RETURN_MS}`
      );
      // arrive back at intake
      tl.add(token, {
        scale: [1, 2.1, 1],
        duration: 460,
        ease: 'outElastic(1, .45)',
        onBegin: () => {
          ping(0);
          if (!userTook.current) setActive(0);
        },
      });
      // the trail fades, and the next lap redraws it from zero
      tl.add(glows, { opacity: [1, 0], duration: 420 });

      ctl.current.push(tl);
    };

    const play = () => {
      // Kept deliberately tight (~1.6s end to end). This is the page's centrepiece:
      // a long reveal means the visitor stares at a half-drawn sheet before the
      // thing that actually sells it — the job moving — has started.
      const tl = createTimeline({ defaults: { ease: 'outCubic' } });
      tl.add($('.pl-dim'), { opacity: 1, duration: 380 })
        .add($('.pl-sym'), { opacity: 1, duration: 340, delay: stagger(55) }, '-=220')
        .add(railDraw, { draw: '0 1', duration: 420, ease: 'inOutQuad', delay: stagger(55) }, '-=420')
        .add($('.pl-text'), { opacity: 1, duration: 340, delay: stagger(28) }, '-=460')
        .add(fanDraw, { draw: '0 1', duration: 420, ease: 'inOutQuad', delay: stagger(24) }, '-=380')
        .add(returnDraw, { draw: '0 1', duration: 780, ease: 'inOutQuad' }, '-=420')
        .add($('.pl-retlabel'), { opacity: 1, duration: 380 }, '-=320')
        .add(token, { opacity: 0.95, duration: 260 }, '-=240');
      tl.then(runLap);
      ctl.current.push(tl);
    };

    // The finished drawing, set instantly — no timeline. This is the state the
    // markup already describes; the reveal above only animates its way to it.
    const finish = () => {
      utils.set(railDraw, { draw: '0 1' });
      utils.set(fanDraw, { draw: '0 1' });
      utils.set(returnDraw, { draw: '0 1' });
      utils.set($('.pl-sym'), { opacity: 1 });
      utils.set($('.pl-text'), { opacity: 1 });
      utils.set($('.pl-dim'), { opacity: 1 });
      utils.set($('.pl-retlabel'), { opacity: 1 });
      utils.set(token, { opacity: 0.95 });
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !played.current) {
          played.current = true;
          play();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(root);

    // Safety net, mirroring App.tsx's for `.reveal` elements — which does not cover
    // these, because they are hidden by anime.js rather than by a CSS class. Without
    // it, anything that renders the page without scrolling to this section (SEO and
    // social-preview crawlers, print, a full-page screenshot, a background tab) gets
    // a blank centrepiece: verified — the stations sit at opacity 0 and the rail at
    // `stroke-dasharray: 0px, 1010px` forever. The drawing must never ship invisible.
    const safety = window.setTimeout(() => {
      if (played.current) return;
      played.current = true;
      finish();
      runLap();
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
      ctl.current.forEach((t) => t.cancel());
      ctl.current = [];
    };
  }, []);

  const onStationKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      takeOver(i);
    }
  };

  const current = STATIONS[active];

  return (
    <section
      ref={sectionRef}
      id="assembly"
      className="relative py-20 md:py-28 [overflow-x:clip]"
      style={{ background: 'transparent' }}
    >
      {/* the drawing surface — grid paper, only under this section */}
      <div className="bp-grid absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10 md:mb-12">
          <p className="mono-label mb-6" style={{ letterSpacing: '0.3em' }}>Sheet 02 · The Assembly</p>
          <h2
            className="font-heading font-bold leading-[1.04] tracking-tight mb-5"
            style={{ fontSize: 'clamp(2.2rem, 5.2vw, 4.2rem)', color: 'var(--ink)', textWrap: 'balance' }}
          >
            Six stations. Four run themselves.{' '}
            <span style={{ color: 'var(--accent-ink)' }}>Then the line comes back round.</span>
          </h2>
          <p className="text-ink-body text-sm sm:text-lg leading-relaxed" style={{ maxWidth: '64ch' }}>
            Rectangles are stations the machine runs on its own; diamonds are the two points where a
            person decides and the job waits for them. The track underneath is the return leg: what the
            platforms report about a live campaign comes back to brief the next run, so the line never
            actually stops at six.
          </p>
        </div>

        {/* ── desktop: the schematic ── */}
        <div className="hidden sm:block">
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full h-auto"
            style={{ overflow: 'visible' }}
            role="group"
            aria-label="The production line: six stations from research to export and deliver, closed into a loop by a return leg that feeds campaign signal back to the start."
          >
            {/* total-cycle dimension, above the line */}
            <g className="pl-dim" aria-hidden="true">
              <path className="bp-dim-line" d={`M${X_FIRST} ${DIM_Y - 9} L${X_FIRST} ${DIM_Y + 9}`} />
              <path className="bp-dim-line" d={`M${X_LAST} ${DIM_Y - 9} L${X_LAST} ${DIM_Y + 9}`} />
              <path className="bp-dim-line" d={`M${X_FIRST} ${DIM_Y} L${VB_W / 2 - 104} ${DIM_Y}`} />
              <path className="bp-dim-line" d={`M${VB_W / 2 + 104} ${DIM_Y} L${X_LAST} ${DIM_Y}`} />
              <text className="bp-dim-text" x={VB_W / 2} y={DIM_Y + 4} textAnchor="middle">
                Total cycle 48h
              </text>
            </g>

            {/* rail segments — graphite only where the leg ends at a human gate */}
            {STATIONS.slice(0, -1).map((_s, i) => (
              <path
                key={`seg-${i}`}
                className={`pl-seg bp-rail ${STATIONS[i + 1].auto ? 'bp-rail--auto' : ''}`}
                d={segmentD(i)}
                aria-hidden="true"
              />
            ))}

            {/* the return track */}
            <path className="pl-return bp-rail bp-rail--auto" d={RETURN_D} aria-hidden="true" />

            {/* the live trail: these light up behind the token, then reset each lap */}
            {STATIONS.slice(0, -1).map((_s, i) => (
              <path key={`glow-${i}`} className="pl-glow" d={segmentD(i)} aria-hidden="true" />
            ))}
            <path className="pl-glow" d={RETURN_D} aria-hidden="true" />

            {/* return-leg direction arrows, pointing back toward intake */}
            {[880, 300].map((x) => (
              <path
                key={`ret-arw-${x}`}
                className="pl-retlabel"
                d="M-5 -3.6 L5 0 L-5 3.6 Z"
                fill="var(--accent)"
                transform={`translate(${x} ${RET_Y}) rotate(180)`}
                aria-hidden="true"
              />
            ))}

            {/* what the return leg carries. The shield masks the track behind the
                label, the way a break in a dimension line works on a real sheet. */}
            <g className="pl-retlabel" aria-hidden="true">
              <rect x={VB_W / 2 - 210} y={RET_Y - 11} width="420" height="22" fill="var(--bg)" />
              <text className="bp-dim-text" x={VB_W / 2} y={RET_Y + 4} textAnchor="middle">
                Signal returns → re-brief
              </text>
              <text className="bp-svg-label" x={VB_W / 2} y={RET_Y + 26} textAnchor="middle">
                {SIGNAL}
              </text>
            </g>

            {/* fan-outs — every branch labelled, rotated so six fit under one station */}
            {STATIONS.map((s, i) =>
              s.fan ? (
                <g key={`fan-${i}`} aria-hidden="true">
                  {s.fan.map((label, k) => {
                    const x0 = stationX(i);
                    const x1 = x0 + (k - (s.fan!.length - 1) / 2) * FAN_SPREAD;
                    return (
                      <g key={label}>
                        <path
                          className="pl-fan-line bp-rail bp-rail--auto"
                          d={`M${x0} ${FAN_TOP} C${x0} ${FAN_TOP + 28}, ${x1} ${FAN_TOP + 24}, ${x1} ${FAN_BOT}`}
                        />
                        <text
                          className="pl-text bp-fan-label"
                          x={x1}
                          y={FAN_LBL_Y}
                          textAnchor="start"
                          transform={`rotate(90 ${x1} ${FAN_LBL_Y})`}
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              ) : null
            )}

            {/* arrival rings — one per station, fired as the token lands */}
            {STATIONS.map((_s, i) => (
              <circle
                key={`ping-${i}`}
                className="pl-ping"
                cx={stationX(i)}
                cy={RAIL_Y}
                r={SYM + 3}
                aria-hidden="true"
              />
            ))}

            {/* stations */}
            {STATIONS.map((s, i) => {
              const x = stationX(i);
              return (
                <g
                  key={s.name}
                  className={`bp-station pl-sym ${s.auto ? 'is-auto' : ''} ${i === active ? 'is-current' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Station ${i + 1}: ${s.name}, ${s.auto ? 'automated' : 'human approval gate'}`}
                  onClick={() => takeOver(i)}
                  onMouseEnter={() => takeOver(i)}
                  onFocus={() => takeOver(i)}
                  onKeyDown={(e) => onStationKey(e, i)}
                >
                  <rect
                    className="bp-focus-ring"
                    x={x - SYM - 8}
                    y={RAIL_Y - SYM - 8}
                    width={(SYM + 8) * 2}
                    height={(SYM + 8) * 2}
                    rx="3"
                  />
                  {/* generous invisible hit area */}
                  <rect x={x - 48} y={RAIL_Y - 52} width="96" height="112" fill="transparent" />

                  <text className="bp-station-idx" x={x} y={IDX_Y} textAnchor="middle">
                    {String(i + 1).padStart(2, '0')}
                  </text>

                  {/* the symbol carries the meaning: process box vs. decision diamond */}
                  {s.auto ? (
                    <>
                      <rect className="bp-station-fill" x={x - SYM} y={RAIL_Y - SYM} width={SYM * 2} height={SYM * 2} rx="2" />
                      <rect className="bp-station-mark" x={x - SYM} y={RAIL_Y - SYM} width={SYM * 2} height={SYM * 2} rx="2" />
                      <circle cx={x} cy={RAIL_Y} r="3.4" fill="var(--accent)" />
                    </>
                  ) : (
                    <>
                      <rect
                        className="bp-station-fill"
                        x={x - SYM}
                        y={RAIL_Y - SYM}
                        width={SYM * 2}
                        height={SYM * 2}
                        transform={`rotate(45 ${x} ${RAIL_Y})`}
                      />
                      <rect
                        className="bp-station-mark"
                        x={x - SYM}
                        y={RAIL_Y - SYM}
                        width={SYM * 2}
                        height={SYM * 2}
                        transform={`rotate(45 ${x} ${RAIL_Y})`}
                      />
                    </>
                  )}

                  <text className="bp-station-label" x={x} y={NAME_Y} textAnchor="middle">
                    {s.name}
                  </text>
                </g>
              );
            })}

            {/* the job — the one element on the sheet that moves on its own */}
            <circle className="pl-token bp-token" cx="0" cy="0" r="4.6" aria-hidden="true" />
          </svg>
        </div>

        {/* ── mobile: the same circuit, read top to bottom ── */}
        <div className="sm:hidden">
          <ul className="relative pl-7">
            <span
              className="absolute left-[13px] top-2 bottom-2 w-px"
              style={{ background: 'var(--ink-dim)' }}
              aria-hidden="true"
            />
            {STATIONS.map((s, i) => (
              <li key={s.name} className="relative pb-6">
                <span
                  className="absolute left-[-21px] top-1.5 w-3.5 h-3.5"
                  aria-hidden="true"
                  style={{
                    background: 'var(--bg)',
                    border: `1.3px solid ${s.auto ? 'var(--accent)' : 'var(--ink-dim)'}`,
                    borderRadius: s.auto ? '2px' : '0',
                    transform: s.auto ? 'none' : 'rotate(45deg)',
                  }}
                />
                <button type="button" onClick={() => takeOver(i)} className="text-left w-full" aria-expanded={i === active}>
                  <span className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-mono text-[10px] tabular-nums" style={{ color: 'var(--ink-dim)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="font-mono text-[12px] uppercase tracking-[0.14em]"
                      style={{ color: i === active ? 'var(--ink)' : 'var(--ink-muted)' }}
                    >
                      {s.name}
                    </span>
                    <span className={`bp-tag ml-auto ${s.auto ? 'bp-tag--auto' : ''}`}>
                      {s.auto ? 'Auto' : 'Gate'}
                    </span>
                  </span>
                  {i === active && (
                    <span className="block text-sm leading-relaxed" style={{ color: 'var(--ink-body)' }}>
                      {s.detail}
                    </span>
                  )}
                  {s.fan && (
                    <span className="block font-mono text-[10px] uppercase tracking-[0.16em] mt-2" style={{ color: 'var(--accent-ink)' }}>
                      ↳ {s.fan.join(' · ')}
                    </span>
                  )}
                </button>
              </li>
            ))}

            {/* the return leg closes the list the way it closes the drawing */}
            <li className="relative">
              <span
                className="absolute left-[-21px] top-1.5 w-3.5 h-3.5 rounded-full"
                aria-hidden="true"
                style={{ background: 'var(--bg)', border: '1.3px solid var(--accent)' }}
              />
              <span className="block font-mono text-[12px] uppercase tracking-[0.14em]" style={{ color: 'var(--accent-ink)' }}>
                ↻ Signal returns → re-brief
              </span>
              <span className="block text-sm leading-relaxed mt-1.5" style={{ color: 'var(--ink-body)' }}>
                {SIGNAL} comes back from the live campaign and briefs the next run.
              </span>
            </li>
          </ul>

          <div className="bp-dim mt-8" aria-hidden="true">
            <span className="bp-dim-end">Brief</span>
            <span className="bp-dim-rule bp-dim-rule--start" />
            <span className="bp-dim-value">48h</span>
            <span className="bp-dim-rule bp-dim-rule--end" />
            <span className="bp-dim-end">Live</span>
          </div>
        </div>

        {/* ── the selected station, spelled out (desktop) ── */}
        <div className="hidden sm:block mt-8 md:mt-10 pt-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="grid md:grid-cols-[300px_1fr] gap-6 md:gap-12 items-start">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] tabular-nums" style={{ color: 'var(--ink-dim)' }}>
                {String(active + 1).padStart(2, '0')}
              </span>
              <h3 className="font-heading font-bold text-lg tracking-tight" style={{ color: 'var(--ink)' }}>
                {current.name}
              </h3>
              <span className={`bp-tag ${current.auto ? 'bp-tag--auto' : ''}`}>
                <span className="bp-tag-dot" />
                {current.auto ? 'Automated' : 'Human gate'}
              </span>
            </div>
            {/* aria-live so keyboard + screen-reader users hear the panel change */}
            <p className="text-ink-body text-sm sm:text-[15px] leading-relaxed" style={{ maxWidth: '70ch' }} aria-live="polite">
              {current.detail}
            </p>
          </div>

          <div className="flex justify-end mt-8">
            <div className="bp-titleblock">
              <span>Sheet <b>02</b></span>
              <span>Stations <b>06</b></span>
              <span>Auto <b>04</b></span>
              <span>Gates <b>02</b></span>
              <span>Loop <b>Closed</b></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
