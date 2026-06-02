import { useEffect, useRef, useState } from 'react';
import { Heart, X, ChevronLeft, ChevronRight, Plus, MessageCircle, Bookmark } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PortfolioSection {
  id: string;
  title: string;
  thumbnail_url: string;
  image_count: number;
}

interface PortfolioImage {
  image_url: string;
  caption: string;
}

// Deterministic rotation + offset per card index so layout is stable
const CARD_TRANSFORMS = [
  { rotate: -3.2, tx: 8,  ty: -6  },
  { rotate:  2.1, tx: -5, ty: 10  },
  { rotate: -1.5, tx: 12, ty: 4   },
  { rotate:  3.8, tx: -8, ty: -4  },
  { rotate: -2.4, tx: 4,  ty: 8   },
  { rotate:  1.2, tx: -10, ty: -2 },
];

// Fake like counts per section index for the Instagram feel
const LIKE_COUNTS = [2847, 5312, 1634, 7891, 3256, 4478];
const COMMENT_COUNTS = [43, 118, 29, 201, 67, 89];

function InstagramCard({
  section,
  index,
  onOpen,
  isVisible,
}: {
  section: PortfolioSection;
  index: number;
  onOpen: () => void;
  isVisible: boolean;
}) {
  const t = CARD_TRANSFORMS[index % CARD_TRANSFORMS.length];
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(LIKE_COUNTS[index % LIKE_COUNTS.length]);

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  }

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    setSaved((v) => !v);
  }

  return (
    <div
      className="group cursor-pointer"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? `rotate(${t.rotate}deg) translate(${t.tx}px, ${t.ty}px)`
          : `rotate(${t.rotate}deg) translate(${t.tx}px, ${t.ty + 28}px) scale(0.92)`,
        transition: `opacity 0.55s ease ${index * 90}ms, transform 0.55s ease ${index * 90}ms`,
        willChange: 'transform, opacity',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'rotate(0deg) translate(0,0) scale(1.04)';
        (e.currentTarget as HTMLDivElement).style.zIndex = '20';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = `rotate(${t.rotate}deg) translate(${t.tx}px, ${t.ty}px)`;
        (e.currentTarget as HTMLDivElement).style.zIndex = '';
      }}
    >
      {/* Polaroid card */}
      <div
        className="relative bg-white shadow-2xl"
        style={{
          padding: '10px 10px 40px 10px',
          borderRadius: '2px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)',
        }}
        onClick={onOpen}
      >
        {/* Photo area */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '1/1', width: '100%' }}>
          {section.thumbnail_url ? (
            <img
              src={section.thumbnail_url}
              alt={section.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }} />
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-center justify-center">
            <span className="text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
              View all {section.image_count} photos
            </span>
          </div>
        </div>

        {/* Polaroid caption area */}
        <div className="pt-2 pb-0 px-1">
          <p className="text-gray-800 font-medium text-[11px] text-center truncate" style={{ fontFamily: 'Georgia, serif' }}>
            {section.title}
          </p>
        </div>
      </div>

      {/* Instagram action bar — sits below the card */}
      <div
        className="mt-2 px-1 flex items-center justify-between"
        style={{ color: 'rgba(255,255,255,0.85)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <button onClick={handleLike} className="flex items-center gap-1 group/like">
            <Heart
              size={16}
              className="transition-transform duration-200 group-hover/like:scale-125"
              fill={liked ? '#ef4444' : 'none'}
              stroke={liked ? '#ef4444' : 'currentColor'}
            />
            <span className="text-[11px] font-medium" style={{ color: liked ? '#ef4444' : 'rgba(255,255,255,0.7)' }}>
              {likeCount.toLocaleString()}
            </span>
          </button>
          <button className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
            <MessageCircle size={15} />
            <span className="text-[11px] font-medium">{COMMENT_COUNTS[index % COMMENT_COUNTS.length]}</span>
          </button>
        </div>
        <button onClick={handleSave} className="opacity-70 hover:opacity-100 transition-opacity">
          <Bookmark
            size={15}
            fill={saved ? 'rgba(255,255,255,0.9)' : 'none'}
            stroke={saved ? 'rgba(255,255,255,0.9)' : 'currentColor'}
          />
        </button>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<PortfolioImage[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    supabase
      .from('portfolio_sections')
      .select('id, title, thumbnail_url, portfolio_images(count)')
      .eq('is_visible', true)
      .order('display_order', { ascending: true })
      .limit(6)
      .then(({ data }) => {
        if (data) {
          setSections(data.map((s: { id: string; title: string; thumbnail_url: string; portfolio_images: { count: number }[] }) => ({
            id: s.id,
            title: s.title,
            thumbnail_url: s.thumbnail_url,
            image_count: s.portfolio_images?.[0]?.count ?? 0,
          })));
        }
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          // also reveal text elements
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setActiveIndex((p) => (p + 1) % lightboxImages.length);
      if (e.key === 'ArrowLeft') setActiveIndex((p) => (p - 1 + lightboxImages.length) % lightboxImages.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, lightboxImages.length]);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  async function openLightbox(sectionId: string, title: string) {
    setLoadingImages(true);
    setLightboxTitle(title);
    setActiveIndex(0);
    setLightboxOpen(true);
    const { data } = await supabase
      .from('portfolio_images')
      .select('image_url, caption')
      .eq('section_id', sectionId)
      .order('display_order', { ascending: true });
    setLightboxImages((data as PortfolioImage[]) ?? []);
    setLoadingImages(false);
  }

  // Group sections into rows: [3, 3] or [2, 2] etc
  const rows: PortfolioSection[][] = [];
  for (let i = 0; i < sections.length; i += 3) {
    rows.push(sections.slice(i, i + 3));
  }

  return (
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="portfolio" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-20">
          <div className="reveal eyebrow-pill mb-7">
            <span className="w-1 h-1 rounded-full bg-brand-purple" />
            Our Work
          </div>
          <h2 className="reveal delay-100 font-heading font-bold leading-[1.06] tracking-tight mb-3 sm:mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
            Results That
            <br />
            <span className="gradient-text">Speak For Themselves.</span>
          </h2>
          <p className="reveal delay-200 text-[#D1D5DB] text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            A showcase of premium ad creatives, campaign visuals, and performance-focused content.
          </p>
        </div>

        {!loaded ? (
          <div className="flex flex-wrap gap-6 justify-center">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-sm"
                style={{
                  width: 200,
                  height: 240,
                  animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`,
                  transform: `rotate(${CARD_TRANSFORMS[i].rotate}deg)`,
                }}
              />
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#6B7280] text-sm">Portfolio coming soon.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-16 sm:gap-20">
            {rows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="flex flex-wrap justify-center gap-8 sm:gap-12 lg:gap-16"
                style={{ padding: '12px 0 24px' }}
              >
                {row.map((section, colIdx) => {
                  const globalIdx = rowIdx * 3 + colIdx;
                  return (
                    <div key={section.id} style={{ width: 'clamp(160px, 26vw, 240px)' }}>
                      <InstagramCard
                        section={section}
                        index={globalIdx}
                        onOpen={() => openLightbox(section.id, section.title)}
                        isVisible={visible}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <X size={18} />
          </button>

          {!loadingImages && lightboxImages.length > 1 && (
            <>
              <button
                onClick={() => setActiveIndex((p) => (p - 1 + lightboxImages.length) % lightboxImages.length)}
                className="absolute left-3 sm:left-6 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setActiveIndex((p) => (p + 1) % lightboxImages.length)}
                className="absolute right-3 sm:right-6 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div className="flex flex-col items-center gap-4 px-16 sm:px-20 w-full max-w-2xl">
            {loadingImages ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                <p className="text-white/40 text-sm">Loading images...</p>
              </div>
            ) : lightboxImages.length === 0 ? (
              <div className="text-center">
                <p className="text-white/60 text-sm font-heading font-semibold mb-1">{lightboxTitle}</p>
                <p className="text-white/30 text-xs">No images in this section yet.</p>
              </div>
            ) : (
              <>
                <p className="text-white/50 text-sm font-heading font-semibold self-start">{lightboxTitle}</p>
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
                  <p className="text-white/50 text-xs sm:text-sm font-mono text-center">{lightboxImages[activeIndex].caption}</p>
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
                    <p className="text-white/30 text-xs font-mono">{activeIndex + 1} / {lightboxImages.length}</p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.7; } }
      `}</style>
    </section>
  );
}
