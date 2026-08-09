import { useCallback, useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Work {
  id: string;
  title: string;
  thumbnail_url: string;
  instagram_handle: string;
  instagram_link: string;
  image_count: number;
  /** copy that types itself out beside the plate while it is in preview */
  panel_text: string;
  /** non-empty => this work is a video; thumbnail_url is its poster */
  video_url: string;
  /** dominant colour sampled at upload; '' falls back to the site accent */
  accent_hex: string;
  /** DEV-only: local images so the lightbox works without a live DB. */
  localImages?: string[];
}

interface PortfolioImage {
  image_url: string;
  caption: string;
}

const LIKE_COUNTS = [2847, 5312, 1634, 7891, 3256, 4478];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const toRoman = (n: number) => ROMAN[n] ?? String(n + 1);

// DEV-only sample works so the corridor renders locally / in verification without Supabase.
// Production keeps the real fetch + the "Portfolio coming soon" empty state.
const DEV_WORKS: Work[] = [
  { id: 'd1', title: 'Bloom Botanicals', thumbnail_url: '/Flowers.png', instagram_handle: '@bloombotanicals', instagram_link: 'https://instagram.com', image_count: 5, panel_text: 'Handmade crochet botanicals, briefed once and produced across six formats. The hook led with permanence: flowers that never wilt.', video_url: '', accent_hex: '#C98A3F', localImages: ['/Flowers.png', '/Fishes.png', '/teddy.png'] },
  { id: 'd2', title: 'Deep Current', thumbnail_url: '/Fishes.png', instagram_handle: '@deepcurrent', instagram_link: 'https://instagram.com', image_count: 4, panel_text: 'A full batch produced inside one 48-hour cycle. Cool palette held across feed, story and reels without a single re-brief.', video_url: '', accent_hex: '#2F7FA8', localImages: ['/Fishes.png', '/Flowers.png'] },
  { id: 'd3', title: 'Straw Hat Studios', thumbnail_url: '/Luffy.png', instagram_handle: '@strawhat', instagram_link: 'https://instagram.com', image_count: 7, panel_text: 'Seven placements from one approved message. The gate caught a legibility issue before anything reached the account.', video_url: '', accent_hex: '#D4A017', localImages: ['/Luffy.png', '/patrick.png'] },
  { id: 'd4', title: 'Bikini Bottom Co.', thumbnail_url: '/patrick.png', instagram_handle: '@bikinibottom', instagram_link: 'https://instagram.com', image_count: 3, panel_text: 'Concepting and variant production ran unattended overnight; the batch was signed off the next morning.', video_url: '', accent_hex: '#C2557A', localImages: ['/patrick.png', '/teddy.png'] },
  { id: 'd5', title: 'Hearth & Home', thumbnail_url: '/teddy.png', instagram_handle: '@hearthhome', instagram_link: 'https://instagram.com', image_count: 6, panel_text: 'A standing format map across six placements. Each run re-briefed from what the last campaign actually returned.', video_url: '', accent_hex: '#A6703C', localImages: ['/teddy.png', '/Flowers.png'] },
  { id: 'd6', title: 'The Commission', thumbnail_url: '/og-image.webp', instagram_handle: '@cloutkart', instagram_link: 'https://instagram.com', image_count: 4, panel_text: 'Export and delivery closed the loop: every asset resized, versioned and handed over ready to upload.', video_url: '', accent_hex: '#7C3AED', localImages: ['/og-image.webp', '/Luffy.png'] },
];

/** '#rrggbb' -> 'r g b' so it can drive rgb(var(--work-tint) / <alpha>). */
function hexToTriple(hex: string): string | null {
  const m = /^#?([\da-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveal `text` one character at a time while `on` is true; clear when it goes
 * false so re-activating a plate re-types rather than showing a stale string.
 * Under reduced motion the whole string lands immediately — the effect is
 * decoration, the copy is the content.
 */
function useTypewriter(text: string, on: boolean, speed = 18) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    if (!on) { setShown(''); return; }
    if (!text) { setShown(''); return; }
    if (prefersReducedMotion()) { setShown(text); return; }
    setShown('');
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, on, speed]);
  return shown;
}

/* ── The side panel bolted to the right of the plate. Only the work in preview
   gets one; the copy types itself in. The full string lives on the container's
   aria-label and the animating span is hidden, so assistive tech reads the
   sentence once instead of stuttering through every partial state. ─────────── */
function WorkPanel({ work, index, active, variant }: { work: Work; index: number; active: boolean; variant: 'side' | 'stacked' }) {
  const typed = useTypewriter(work.panel_text, active);
  if (!work.panel_text) return null;
  const done = typed.length >= work.panel_text.length;
  return (
    <div
      className={`gallery-panel gallery-panel--${variant}`}
      role="note"
      aria-label={work.panel_text}
    >
      <span className="gallery-panel-eyebrow" aria-hidden="true">Notes</span>
      <p className="gallery-panel-body" aria-hidden="true">
        {typed}
        {!done && <span className="gallery-panel-caret" />}
      </p>
      {variant === 'side' && (
        <div className="bp-titleblock gallery-panel-block" aria-hidden="true">
          <span>Plate <b>{String(index + 1).padStart(2, '0')}</b></span>
          <span>Formats <b>{String(work.image_count).padStart(2, '0')}</b></span>
        </div>
      )}
    </div>
  );
}

/* ── One framed plate — engraved violet frame, registration
   crosshairs, a plate number, and (active, fine-pointer) a loupe
   detail crop that follows the cursor like leaning into a painting. ─────────── */
function Plate({
  work,
  index,
  active,
  onClick,
  className = '',
  style,
  showPanel = false,
}: {
  work: Work;
  index: number;
  active: boolean;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  /** desktop corridor only — mobile stacks the copy under the plate instead */
  showPanel?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = Boolean(work.video_url);
  /** the blurred projection behind the plate — canvas for video, <img> for stills */
  const glowRef = useRef<HTMLCanvasElement>(null);
  // The work's real pixel size, read off the loaded media rather than stored —
  // no admin field, no schema, and it can never disagree with the file.
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null);

  // Only the plate in preview plays. Several simultaneous decodes behind 3D
  // transforms is exactly the thing that makes a coverflow stutter, and a
  // paused neighbour still shows its poster so nothing looks empty.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active && !prefersReducedMotion()) {
      // play() rejects on some browsers if the gesture policy is unhappy; the
      // poster stays up in that case, which is an acceptable degradation.
      void el.play().catch(() => {});
    } else {
      el.pause();
      if (!active) el.currentTime = 0;
    }
  }, [active]);

  // ── The ambient projection. Rather than averaging the frame to one colour and
  //    polling it (stepped, and it lagged), this paints the frame itself into a
  //    tiny canvas that CSS then scales up and blurs — the way YouTube's ambient
  //    mode works. It is continuous because it repaints per DECODED FRAME via
  //    requestVideoFrameCallback, and it matches the edges because it is the
  //    picture, not an average of it.
  //
  //    Crucially this needs no CORS: drawImage() from a cross-origin video is
  //    allowed, and only getImageData() is blocked. Dropping the pixel read
  //    dropped the crossOrigin attribute with it, and with it the risk that a
  //    host without CORS headers stopped the clip loading at all.
  useEffect(() => {
    if (!isVideo || !active) return;
    const v = videoRef.current;
    const c = glowRef.current;
    if (!v || !c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    type RVFC = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
      cancelVideoFrameCallback?: (h: number) => void;
    };
    const vf = v as RVFC;
    let stopped = false;
    let handle = 0;
    let usingRvfc = false;

    const paint = () => {
      if (stopped) return;
      if (v.readyState >= 2) ctx.drawImage(v, 0, 0, c.width, c.height);
      schedule();
    };
    const schedule = () => {
      if (stopped || prefersReducedMotion()) return;   // one static frame is enough
      if (vf.requestVideoFrameCallback) {
        usingRvfc = true;
        handle = vf.requestVideoFrameCallback(paint);
      } else {
        usingRvfc = false;
        handle = requestAnimationFrame(paint);
      }
    };

    // paint once immediately so there is a glow even while paused / reduced-motion
    if (v.readyState >= 2) ctx.drawImage(v, 0, 0, c.width, c.height);
    schedule();
    return () => {
      stopped = true;
      if (!handle) return;
      if (usingRvfc) vf.cancelVideoFrameCallback?.(handle);
      else cancelAnimationFrame(handle);
    };
  }, [isVideo, active, dim]);

  const onArtMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--lx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    e.currentTarget.style.setProperty('--ly', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };
  return (
    <div
      className={`gallery-plate ${active ? 'is-active' : ''} ${className}`}
      style={style}
      onClick={onClick}
      role="button"
      aria-label={active ? `View ${work.title}` : `Bring ${work.title} to centre`}
      data-cursor="card"
    >
      {/* Sits behind the frame and bleeds past its edges. Only the plate in
          preview projects, so the corridor never carries several at once. */}
      {active && (
        <div className="gallery-glow" aria-hidden="true">
          {isVideo ? (
            <canvas ref={glowRef} width={48} height={dim ? Math.max(1, Math.round((48 * dim.h) / dim.w)) : 60} />
          ) : work.thumbnail_url ? (
            <img src={work.thumbnail_url} alt="" />
          ) : null}
        </div>
      )}
      <div className="gallery-plate-inner">
        <span className="plate-cross tl" />
        <span className="plate-cross tr" />
        <span className="plate-cross bl" />
        <span className="plate-cross br" />
        <span className="accession">Plate {String(index + 1).padStart(3, '0')}</span>
        <div
          className="gallery-plate-art"
          data-theme="dark"
          onPointerMove={onArtMove}
          /* The frame takes the media's own ratio, so the dimension label under
             it describes what you are actually looking at. */
          style={dim ? ({ ['--art-ratio']: `${dim.w} / ${dim.h}` } as React.CSSProperties) : undefined}
        >
          {isVideo ? (
            /* muted + playsInline are both required or iOS refuses to autoplay;
               no controls and no audio track by contract — it is wallpaper. */
            <video
              ref={videoRef}
              onLoadedMetadata={e => setDim({ w: e.currentTarget.videoWidth, h: e.currentTarget.videoHeight })}
              src={work.video_url}
              poster={work.thumbnail_url || undefined}
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={work.title}
              draggable={false}
            />
          ) : work.thumbnail_url ? (
            <img
              src={work.thumbnail_url}
              alt={work.title}
              loading="lazy"
              draggable={false}
              onLoad={e => setDim({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            />
          ) : (
            <div className="gallery-plate-fallback" />
          )}
          {/* the loupe reads a still, so it is offered on image works only */}
          {active && !isVideo && work.thumbnail_url && (
            <div className="gallery-loupe" style={{ backgroundImage: `url(${work.thumbnail_url})` }} aria-hidden="true" />
          )}
          {active && <span className="gallery-plate-view">View</span>}
        </div>
      </div>
      {/* The work's measured size, in the drawing's own language. */}
      {active && dim && (
        <div className="gallery-dim" aria-hidden="true">
          <span className="bp-dim-rule bp-dim-rule--start" />
          <span className="bp-dim-value">{dim.w} × {dim.h}</span>
          <span className="bp-dim-rule bp-dim-rule--end" />
        </div>
      )}
      {/* Attached to the frame's right edge from INSIDE the transformed plate,
          so it tilts, scales and moves with the artwork instead of floating
          over it. Click-through so it never steals the plate's own click. */}
      {active && showPanel && <WorkPanel work={work} index={index} active={active} variant="side" />}
    </div>
  );
}

/* ── The engraved provenance plaque for the active work ─────────────────────── */
function Plaque({ work, index }: { work: Work; index: number }) {
  const likes = LIKE_COUNTS[index % LIKE_COUNTS.length];
  return (
    <div className="gallery-plaque" key={work.id}>
      <span className="gallery-plaque-no">Plate {toRoman(index)}</span>
      <span className="gallery-plaque-rule" />
      <h3 className="gallery-plaque-title">{work.title}</h3>
      <p className="gallery-plaque-medium">
        Campaign batch <span className="gallery-plaque-catalog">· Produced on the line</span>
      </p>
      <div className="gallery-plaque-meta">
        {work.instagram_link ? (
          <a href={work.instagram_link} target="_blank" rel="noopener noreferrer" className="gallery-plaque-handle">
            <Instagram size={12} strokeWidth={2} />
            {work.instagram_handle || '@cloutkart'}
          </a>
        ) : (
          <span className="gallery-plaque-handle">
            <Instagram size={12} strokeWidth={2} />
            {work.instagram_handle || '@cloutkart'}
          </span>
        )}
        <span className="gallery-plaque-patina">◆ {likes.toLocaleString()} admirers</span>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<PortfolioImage[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const corridorRef = useRef<HTMLDivElement>(null);
  /** measured box of the active plate, grown by MARK_INSET — drives the focus marks */
  const [frame, setFrame] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const BASE = 'id, title, thumbnail_url, instagram_handle, instagram_link, portfolio_images(count)';
    const WITH_PANEL = `${BASE}, panel_text, video_url, accent_hex`;

    type Row = Record<string, unknown> & { portfolio_images?: { count: number }[] };
    const map = (rows: Row[]): Work[] =>
      rows.map((r) => ({
        id: String(r.id),
        title: String(r.title ?? ''),
        thumbnail_url: String(r.thumbnail_url ?? ''),
        instagram_handle: String(r.instagram_handle ?? ''),
        instagram_link: String(r.instagram_link ?? ''),
        image_count: r.portfolio_images?.[0]?.count ?? 0,
        panel_text: String(r.panel_text ?? ''),
        video_url: String(r.video_url ?? ''),
        accent_hex: String(r.accent_hex ?? ''),
      }));

    const query = (cols: string) =>
      supabase
        .from('portfolio_sections')
        .select(cols)
        .eq('is_visible', true)
        .order('display_order', { ascending: true })
        .limit(8);

    (async () => {
      // Select the new columns, but fall back to the original list if they are
      // missing. Without this a not-yet-applied migration errors the query and
      // blanks the whole gallery; degrading to today's behaviour is far better
      // than an empty section on the live site.
      const first = await query(WITH_PANEL);
      const { data } = first.error ? await query(BASE) : first;
      const mapped = map((data as unknown as Row[]) ?? []);
      // DEV fallback so the gallery renders without a live DB; prod shows "coming soon".
      setWorks(mapped.length > 0 ? mapped : import.meta.env.DEV ? DEV_WORKS : []);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          entries[0].target.querySelectorAll('.reveal').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 80);
          });
        }
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [loaded]);

  const go = useCallback(
    (dir: number) => setActive((a) => Math.min(Math.max(a + dir, 0), Math.max(works.length - 1, 0))),
    [works.length]
  );

  // Corridor keyboard nav (desktop) — only while the section is in view and the lightbox is shut.
  useEffect(() => {
    if (isMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (!visible || lightboxOpen) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobile, visible, lightboxOpen, go]);

  // Horizontal trackpad swipe on the corridor (doesn't hijack vertical page scroll).
  const wheelLock = useRef(false);
  const onWheel = (e: React.WheelEvent) => {
    if (isMobile) return;
    if (Math.abs(e.deltaX) < 12 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    if (wheelLock.current) return;
    wheelLock.current = true;
    go(e.deltaX > 0 ? 1 : -1);
    window.setTimeout(() => { wheelLock.current = false; }, 380);
  };

  // Pointer drag-to-swipe on the corridor.
  const drag = useRef({ x: 0, active: false, moved: false });
  const onPointerDown = (e: React.PointerEvent) => {
    if (isMobile) return;
    drag.current = { x: e.clientX, active: true, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 60) {
      go(dx > 0 ? -1 : 1);
      drag.current.active = false;
      drag.current.moved = true;
    }
  };
  const endDrag = () => { drag.current.active = false; };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setActiveIndex((p) => (p + 1) % lightboxImages.length);
      if (e.key === 'ArrowLeft') setActiveIndex((p) => (p - 1 + lightboxImages.length) % lightboxImages.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, lightboxImages.length]);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  async function openLightbox(work: Work) {
    // Suppress the click that ends a drag-swipe.
    if (drag.current.moved) { drag.current.moved = false; return; }
    setLoadingImages(true);
    setLightboxTitle(work.title);
    setActiveIndex(0);
    setLightboxOpen(true);
    if (work.localImages) {
      setLightboxImages(work.localImages.map((image_url) => ({ image_url, caption: '' })));
      setLoadingImages(false);
      return;
    }
    const { data } = await supabase
      .from('portfolio_images')
      .select('image_url, caption')
      .eq('section_id', work.id)
      .order('display_order', { ascending: true });
    setLightboxImages((data as PortfolioImage[]) ?? []);
    setLoadingImages(false);
  }

  const handlePlateClick = (i: number, work: Work) => {
    if (isMobile || i === active) openLightbox(work);
    else setActive(i);
  };

  // Focus marks: measure the active plate against the corridor rather than
  // re-deriving the coverflow's 3D maths here — two sources of truth for one
  // position is how they drift apart. The plate transition is 600ms, so track it
  // with rAF for a little longer than that and the marks FOLLOW the plate in
  // instead of teleporting. Under reduced motion the plate transition is
  // disabled, so the first frame is already the final position and the loop
  // simply settles; no special-casing needed.
  const MARK_INSET = 14;
  useEffect(() => {
    if (isMobile || works.length === 0) return;
    let raf = 0;
    const measure = () => {
      const corridor = corridorRef.current;
      const plate = corridor?.querySelector('.gallery-plate.is-active .gallery-plate-inner');
      if (!corridor || !plate) return;
      const p = plate.getBoundingClientRect();
      const c = corridor.getBoundingClientRect();
      setFrame({
        x: p.left - c.left - MARK_INSET,
        y: p.top - c.top - MARK_INSET,
        w: p.width + MARK_INSET * 2,
        h: p.height + MARK_INSET * 2,
      });
    };

    const start = performance.now();
    const track = () => {
      measure();
      if (performance.now() - start < 750) raf = requestAnimationFrame(track);
    };
    raf = requestAnimationFrame(track);

    // The plate RESIZES after the tracking window closes: the media loads, its
    // natural ratio lands on --art-ratio, and the frame's width changes under
    // the marks. Without this the marks keep the placeholder 4/5 width and sit
    // ~11px wide on each side. Observing the frame catches that, plus window
    // resizes, without polling forever.
    const plate = corridorRef.current?.querySelector('.gallery-plate.is-active .gallery-plate-inner');
    const ro = plate ? new ResizeObserver(measure) : null;
    if (plate && ro) ro.observe(plate);
    window.addEventListener('resize', measure);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [active, isMobile, works.length, loaded]);

  // The corridor's ambient light + whether the coverflow makes room for a panel.
  //
  // --work-tint is the artwork's own colour spilling into the room. It is the ONE
  // place on the site where a non-token hue is allowed (DESIGN.md: violet means
  // automated, never decoration), so it is confined to the ambient wash and the
  // spotlight — every piece of chrome around it stays on the existing tokens.
  // Empty accent_hex falls back to the site accent, so rows predating the
  // migration light the room exactly as they do today.
  const corridorStyle = (() => {
    const current = works[active];
    // The broad room wash stays on the stored colour; the per-frame projection
    // behind the plate (see Plate) is what actually follows the footage.
    const tint = current ? hexToTriple(current.accent_hex) : null;
    const style: React.CSSProperties = {};
    if (tint) (style as Record<string, string>)['--work-tint'] = tint;
    // No copy on this work → no panel → don't shift the coverflow for nothing.
    if (!current?.panel_text) (style as Record<string, string>)['--gallery-panel-shift'] = '0px';
    return style;
  })();

  // Coverflow transform for a card at list position i.
  //
  // Every plate is shifted left by half the panel width so the active plate and
  // its panel read as ONE centred unit rather than the panel hanging off to the
  // side. --gallery-panel-shift is 0 when the active work has no copy, so a
  // work without a panel still centres exactly as before.
  //
  // Spacing widened from 232 to 300: fully clearing plate +1 would need ~570px,
  // which flattens the coverflow into a flat row, so the tail of the queue is
  // allowed to recede BEHIND the panel's right edge instead. That is what depth
  // in a coverflow looks like anyway.
  const plateStyle = (i: number): React.CSSProperties => {
    const offset = i - active;
    const abs = Math.abs(offset);
    const sign = Math.sign(offset);
    const spacing = 300;
    const scale = offset === 0 ? 1 : Math.max(0.68, 0.82 - (abs - 1) * 0.07);
    const z = offset === 0 ? 0 : -170 - (abs - 1) * 70;
    return {
      transform: `translate(-50%, -50%) translateX(calc(${offset * spacing}px - var(--gallery-panel-shift, 0px))) translateZ(${z}px) rotateY(${offset === 0 ? 0 : -sign * 38}deg) scale(${scale})`,
      opacity: abs > 2 ? 0 : offset === 0 ? 1 : Math.max(0, 0.6 - (abs - 1) * 0.18),
      zIndex: 100 - abs,
      pointerEvents: abs > 2 ? 'none' : 'auto',
      filter: offset === 0 ? 'none' : `brightness(${Math.max(0.5, 0.72 - (abs - 1) * 0.1)})`,
    };
  };

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 [overflow-x:clip]" id="portfolio" data-cursor-zone="loupe" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <p className="reveal mono-label mb-6" style={{ letterSpacing: '0.3em' }}>Sheet 07 · The Gallery</p>
          <h2 className="reveal delay-100 font-heading font-bold leading-[1.04] mb-3 sm:mb-4 tracking-tight" style={{ fontSize: 'clamp(2.2rem, 5.2vw, 4.2rem)', color: 'var(--ink)', textWrap: 'balance' }}>
            What comes
            <br />
            <span style={{ color: 'var(--accent-ink)' }}>off the line.</span>
          </h2>
          <p className="reveal delay-200 text-ink-body text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            Finished batches from brands running the pipeline. Step through the plates.
          </p>
        </div>

        {!loaded ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink-dim text-sm">Portfolio coming soon.</p>
          </div>
        ) : isMobile ? (
          /* ── Mobile: scroll-snap swipe carousel ── */
          <div className="reveal">
            <div
              ref={trackRef}
              className="gallery-mobile-track"
              onScroll={(e) => {
                const el = e.currentTarget;
                const i = Math.round(el.scrollLeft / (el.scrollWidth / works.length));
                if (i !== active) setActive(Math.min(Math.max(i, 0), works.length - 1));
              }}
            >
              {works.map((w, i) => (
                <div className="gallery-mobile-cell" key={w.id}>
                  <Plate work={w} index={i} active={i === active} onClick={() => openLightbox(w)} />
                </div>
              ))}
            </div>
            <WorkPanel work={works[active]} index={active} active variant="stacked" />
            <Plaque work={works[active]} index={active} />
            <div className="gallery-register">
              {works.map((_, i) => (
                <button
                  key={i}
                  className={`gallery-register-item ${i === active ? 'is-active' : ''}`}
                  aria-label={`Go to plate ${i + 1}`}
                  aria-current={i === active ? 'true' : undefined}
                  onClick={() => {
                    const el = trackRef.current;
                    if (el) el.scrollTo({ left: (el.scrollWidth / works.length) * i, behavior: 'smooth' });
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Desktop: 3D gallery corridor ── */
          <div className="reveal">
            <div className="gallery-corridor" ref={corridorRef} style={corridorStyle}>
              {/* Grid paper, same device as Sheet 02 — the gallery is a drawing
                  sheet like every other section now, not a dark museum room.
                  .bp-grid is radially masked, so it cannot reintroduce an edge. */}
              <div className="bp-grid absolute inset-0 pointer-events-none" aria-hidden />
              <div className="gallery-vignette" aria-hidden />

              <div
                className="gallery-stage"
                onWheel={onWheel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerLeave={endDrag}
              >
                <div className="gallery-spotlight" aria-hidden />
                {works.map((w, i) => (
                  <Plate key={w.id} work={w} index={i} active={i === active} onClick={() => handlePlateClick(i, w)} style={plateStyle(i)} showPanel />
                ))}
              </div>

              {/* four corners that lock onto whichever plate is centred */}
              {frame && (
                <div
                  className="gallery-marks"
                  aria-hidden
                  style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h }}
                >
                  <span className="gallery-mark tl" /><span className="gallery-mark tr" />
                  <span className="gallery-mark bl" /><span className="gallery-mark br" />
                </div>
              )}

              <button className="gallery-arrow left" onClick={() => go(-1)} disabled={active === 0} aria-label="Previous work">
                <ChevronLeft size={20} />
              </button>
              <button className="gallery-arrow right" onClick={() => go(1)} disabled={active === works.length - 1} aria-label="Next work">
                <ChevronRight size={20} />
              </button>
            </div>

            <Plaque work={works[active]} index={active} />
            <div className="gallery-register">
              {works.map((_, i) => (
                <button
                  key={i}
                  className={`gallery-register-item ${i === active ? 'is-active' : ''}`}
                  aria-label={`Go to plate ${i + 1}`}
                  aria-current={i === active ? 'true' : undefined}
                  onClick={() => setActive(i)}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox — the "viewing" */}
      {lightboxOpen && (
        <div
          data-theme="dark"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
            style={{ background: 'rgb(var(--white-rgb) / 0.08)', border: '1px solid rgb(var(--white-rgb) / 0.15)' }}
          >
            <X size={18} />
          </button>

          {!loadingImages && lightboxImages.length > 1 && (
            <>
              <button
                onClick={() => setActiveIndex((p) => (p - 1 + lightboxImages.length) % lightboxImages.length)}
                className="absolute left-3 sm:left-6 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
                style={{ background: 'rgb(var(--white-rgb) / 0.08)', border: '1px solid rgb(var(--white-rgb) / 0.15)' }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setActiveIndex((p) => (p + 1) % lightboxImages.length)}
                className="absolute right-3 sm:right-6 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
                style={{ background: 'rgb(var(--white-rgb) / 0.08)', border: '1px solid rgb(var(--white-rgb) / 0.15)' }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div className="flex flex-col items-center gap-4 px-16 sm:px-20 w-full max-w-2xl">
            {loadingImages ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                <p className="text-ink-muted text-sm">Loading images...</p>
              </div>
            ) : lightboxImages.length === 0 ? (
              <div className="text-center">
                <p className="text-white/60 text-sm font-heading font-semibold mb-1">{lightboxTitle}</p>
                <p className="text-ink-dim text-xs">No images in this section yet.</p>
              </div>
            ) : (
              <>
                <p className="text-ink-muted text-sm font-heading font-semibold self-start">{lightboxTitle}</p>
                <div className="relative w-full rounded-2xl overflow-hidden" style={{ maxHeight: '65vh' }}>
                  <img
                    key={activeIndex}
                    src={lightboxImages[activeIndex].image_url}
                    alt={lightboxImages[activeIndex].caption || lightboxTitle}
                    className="w-full h-full object-contain"
                    style={{ maxHeight: '65vh', animation: 'fadeIn 0.2s ease' }}
                    loading="lazy"
                  />
                </div>
                {lightboxImages[activeIndex].caption && (
                  <p className="text-ink-muted text-xs sm:text-sm font-mono text-center">{lightboxImages[activeIndex].caption}</p>
                )}
                {lightboxImages.length > 1 && (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                      {lightboxImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveIndex(idx)}
                          className={`rounded-lg overflow-hidden transition-all duration-200 ${idx === activeIndex ? 'ring-2 ring-white/60 scale-110' : 'opacity-50 hover:opacity-80'}`}
                          style={{ width: 44, height: 44 }}
                        >
                          <img src={img.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                    <p className="text-ink-dim text-xs font-mono">{activeIndex + 1} / {lightboxImages.length}</p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }`}</style>
    </section>
  );
}
