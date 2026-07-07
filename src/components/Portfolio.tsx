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
  { id: 'd1', title: 'Bloom Botanicals', thumbnail_url: '/Flowers.png', instagram_handle: '@bloombotanicals', instagram_link: 'https://instagram.com', image_count: 5, localImages: ['/Flowers.png', '/Fishes.png', '/teddy.png'] },
  { id: 'd2', title: 'Deep Current', thumbnail_url: '/Fishes.png', instagram_handle: '@deepcurrent', instagram_link: 'https://instagram.com', image_count: 4, localImages: ['/Fishes.png', '/Flowers.png'] },
  { id: 'd3', title: 'Straw Hat Studios', thumbnail_url: '/Luffy.png', instagram_handle: '@strawhat', instagram_link: 'https://instagram.com', image_count: 7, localImages: ['/Luffy.png', '/patrick.png'] },
  { id: 'd4', title: 'Bikini Bottom Co.', thumbnail_url: '/patrick.png', instagram_handle: '@bikinibottom', instagram_link: 'https://instagram.com', image_count: 3, localImages: ['/patrick.png', '/teddy.png'] },
  { id: 'd5', title: 'Hearth & Home', thumbnail_url: '/teddy.png', instagram_handle: '@hearthhome', instagram_link: 'https://instagram.com', image_count: 6, localImages: ['/teddy.png', '/Flowers.png'] },
  { id: 'd6', title: 'The Commission', thumbnail_url: '/og-image.webp', instagram_handle: '@cloutkart', instagram_link: 'https://instagram.com', image_count: 4, localImages: ['/og-image.webp', '/Luffy.png'] },
];

/* ── One framed plate — a recovered artifact: engraved violet frame, registration
   crosshairs, a registrar's accession tag, and (active, fine-pointer) a loupe
   detail crop that follows the cursor like leaning into a painting. ─────────── */
function Plate({
  work,
  index,
  active,
  onClick,
  className = '',
  style,
}: {
  work: Work;
  index: number;
  active: boolean;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
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
      <div className="gallery-plate-inner">
        <span className="plate-cross tl" />
        <span className="plate-cross tr" />
        <span className="plate-cross bl" />
        <span className="plate-cross br" />
        <span className="accession">No. {String(index + 1).padStart(3, '0')} · 2045</span>
        <div className="gallery-plate-art" data-theme="dark" onPointerMove={onArtMove}>
          {work.thumbnail_url ? (
            <img src={work.thumbnail_url} alt={work.title} loading="lazy" draggable={false} />
          ) : (
            <div className="gallery-plate-fallback" />
          )}
          {active && work.thumbnail_url && (
            <div className="gallery-loupe" style={{ backgroundImage: `url(${work.thumbnail_url})` }} aria-hidden="true" />
          )}
          {active && <span className="gallery-plate-view">View</span>}
        </div>
      </div>
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
        Campaign · Mixed media <span className="gallery-plaque-catalog">— Cataloged 2045</span>
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

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    supabase
      .from('portfolio_sections')
      .select('id, title, thumbnail_url, instagram_handle, instagram_link, portfolio_images(count)')
      .eq('is_visible', true)
      .order('display_order', { ascending: true })
      .limit(8)
      .then(({ data }) => {
        const mapped = (data ?? []).map((s: { id: string; title: string; thumbnail_url: string; instagram_handle: string; instagram_link: string; portfolio_images: { count: number }[] }) => ({
          id: s.id,
          title: s.title,
          thumbnail_url: s.thumbnail_url,
          instagram_handle: s.instagram_handle ?? '',
          instagram_link: s.instagram_link ?? '',
          image_count: s.portfolio_images?.[0]?.count ?? 0,
        }));
        // DEV fallback so the gallery renders without a live DB; prod shows "coming soon".
        setWorks(mapped.length > 0 ? mapped : import.meta.env.DEV ? DEV_WORKS : []);
        setLoaded(true);
      });
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

  // Coverflow transform for a card at list position i.
  const plateStyle = (i: number): React.CSSProperties => {
    const offset = i - active;
    const abs = Math.abs(offset);
    const sign = Math.sign(offset);
    const spacing = 232;
    const scale = offset === 0 ? 1 : Math.max(0.68, 0.82 - (abs - 1) * 0.07);
    const z = offset === 0 ? 0 : -170 - (abs - 1) * 70;
    return {
      transform: `translate(-50%, -50%) translateX(${offset * spacing}px) translateZ(${z}px) rotateY(${offset === 0 ? 0 : -sign * 38}deg) scale(${scale})`,
      opacity: abs > 2 ? 0 : offset === 0 ? 1 : Math.max(0, 0.6 - (abs - 1) * 0.18),
      zIndex: 100 - abs,
      pointerEvents: abs > 2 ? 'none' : 'auto',
      filter: offset === 0 ? 'none' : `brightness(${Math.max(0.5, 0.72 - (abs - 1) * 0.1)})`,
    };
  };

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 [overflow-x:clip]" id="portfolio" data-cursor-zone="loupe" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <p className="reveal mono-label mb-6" style={{ letterSpacing: '0.3em' }}>The Gallery</p>
          <h2 className="reveal delay-100 font-authored font-semibold leading-[1.04] mb-3 sm:mb-4" style={{ fontSize: 'clamp(2.4rem, 5.6vw, 4.8rem)', color: 'var(--ink)' }}>
            Recovered
            <br />
            <span style={{ color: 'var(--accent-ink)' }}>Works.</span>
          </h2>
          <p className="reveal delay-200 text-ink-body text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            Campaign artifacts, catalogued as they were made — step through the collection.
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
            <Plaque work={works[active]} index={active} />
            <div className="gallery-dots">
              {works.map((_, i) => (
                <button
                  key={i}
                  className={`gallery-dot ${i === active ? 'is-active' : ''}`}
                  aria-label={`Go to plate ${i + 1}`}
                  onClick={() => {
                    const el = trackRef.current;
                    if (el) el.scrollTo({ left: (el.scrollWidth / works.length) * i, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ── Desktop: 3D gallery corridor ── */
          <div className="reveal">
            <div className="gallery-corridor">
              <div className="gallery-vignette" aria-hidden />
              <svg className="gallery-guides" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                <line x1="0" y1="100" x2="50" y2="46" /><line x1="100" y1="100" x2="50" y2="46" />
                <line x1="0" y1="0" x2="50" y2="46" /><line x1="100" y1="0" x2="50" y2="46" />
              </svg>
              <span className="gallery-mote m1" aria-hidden /><span className="gallery-mote m2" aria-hidden />
              <span className="gallery-mote m3" aria-hidden /><span className="gallery-mote m4" aria-hidden />
              <span className="gallery-mote m5" aria-hidden /><span className="gallery-mote m6" aria-hidden />

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
                  <Plate key={w.id} work={w} index={i} active={i === active} onClick={() => handlePlateClick(i, w)} style={plateStyle(i)} />
                ))}
              </div>

              <button className="gallery-arrow left" onClick={() => go(-1)} disabled={active === 0} aria-label="Previous work">
                <ChevronLeft size={20} />
              </button>
              <button className="gallery-arrow right" onClick={() => go(1)} disabled={active === works.length - 1} aria-label="Next work">
                <ChevronRight size={20} />
              </button>
            </div>

            <Plaque work={works[active]} index={active} />
            <div className="gallery-dots">
              {works.map((_, i) => (
                <button key={i} className={`gallery-dot ${i === active ? 'is-active' : ''}`} aria-label={`Go to plate ${i + 1}`} onClick={() => setActive(i)} />
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
