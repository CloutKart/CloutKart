import { useEffect, useRef, useState } from 'react';
import { Heart, X, ChevronLeft, ChevronRight, MessageCircle, Bookmark, Send, MoreHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PortfolioSection {
  id: string;
  title: string;
  thumbnail_url: string;
  instagram_handle: string;
  instagram_link: string;
  image_count: number;
}

interface PortfolioImage {
  image_url: string;
  caption: string;
}

const LIKE_COUNTS = [2847, 5312, 1634, 7891, 3256, 4478];
const COMMENT_COUNTS = [43, 118, 29, 201, 67, 89];
const AVATAR_GRADIENTS = [
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-400',
  'from-orange-500 to-yellow-400',
  'from-green-500 to-emerald-400',
  'from-rose-500 to-red-400',
  'from-lime-500 to-emerald-400',
];

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
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(LIKE_COUNTS[index % LIKE_COUNTS.length]);
  const [images, setImages] = useState<string[]>(section.thumbnail_url ? [section.thumbnail_url] : []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    if (!isVisible || imagesLoaded) return;
    supabase
      .from('portfolio_images')
      .select('image_url')
      .eq('section_id', section.id)
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setImages(data.map((d: { image_url: string }) => d.image_url));
        }
        setImagesLoaded(true);
      });
  }, [isVisible, imagesLoaded, section.id]);

  function handlePrev(e: React.MouseEvent) {
    e.stopPropagation();
    if (!imagesLoaded) return;
    setCurrentIdx((i) => Math.max(0, i - 1));
  }

  function handleNext(e: React.MouseEvent) {
    e.stopPropagation();
    if (!imagesLoaded) return;
    setCurrentIdx((i) => Math.min(images.length - 1, i + 1));
  }

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  }

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    setSaved((v) => !v);
  }

  // Use section.image_count for dot/arrow count before images load
  const totalCount = imagesLoaded ? images.length : Math.max(section.image_count || 1, images.length);
  const hasPrev = currentIdx > 0;
  const hasNext = imagesLoaded ? currentIdx < images.length - 1 : currentIdx < totalCount - 1;

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.55s ease ${index * 90}ms, transform 0.55s ease ${index * 90}ms`,
      }}
      className="bg-bg-elev rounded-2xl overflow-hidden border border-white/[0.07]"
    >
      {/* Post header */}
      <div className="flex items-center justify-between px-4 py-3">
        {section.instagram_link ? (
          <a
            href={section.instagram_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group min-w-0"
          >
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]} flex-shrink-0 ring-2 ring-white/10 transition-transform duration-150 group-hover:scale-105`}
            />
            <div className="min-w-0">
              <p className="text-white text-[13px] font-semibold leading-none truncate group-hover:text-white/80 transition-colors">{section.title}</p>
              <p className="text-ink-muted text-[11px] mt-0.5 leading-none group-hover:text-accent-ink transition-colors">
                {section.instagram_handle || '@cloutkart'}
              </p>
            </div>
          </a>
        ) : (
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]} flex-shrink-0 ring-2 ring-white/10`}
            />
            <div className="min-w-0">
              <p className="text-white text-[13px] font-semibold leading-none truncate">{section.title}</p>
              <p className="text-ink-muted text-[11px] mt-0.5 leading-none">
                {section.instagram_handle || '@cloutkart'}
              </p>
            </div>
          </div>
        )}
        <button className="text-ink-muted hover:text-white/70 transition-colors p-1 flex-shrink-0">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Image area */}
      <div className="relative bg-black" data-theme="dark" style={{ aspectRatio: '1/1' }}>
        {images.length > 0 ? (
          <img
            key={`${section.id}-${currentIdx}`}
            src={images[currentIdx]}
            alt={section.title}
            className="w-full h-full object-cover cursor-pointer"
            style={{ animation: 'igFadeIn 0.18s ease' }}
            loading="lazy"
            onClick={onOpen}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]} opacity-20 cursor-pointer`}
            onClick={onOpen}
          />
        )}

        {/* Left arrow */}
        {totalCount > 1 && hasPrev && (
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center z-10 transition-transform duration-150 hover:scale-110 active:scale-95"
            style={{ background: 'rgb(var(--white-rgb) / 0.88)', color: '#000' }}
          >
            <ChevronLeft size={15} strokeWidth={2.5} />
          </button>
        )}

        {/* Right arrow */}
        {totalCount > 1 && hasNext && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center z-10 transition-transform duration-150 hover:scale-110 active:scale-95"
            style={{ background: 'rgb(var(--white-rgb) / 0.88)', color: '#000' }}
          >
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>
        )}

        {/* Dot indicators (Instagram-style, bottom-center of image) */}
        {totalCount > 1 && totalCount <= 12 && (
          <div className="absolute bottom-2.5 left-0 right-0 flex gap-1 justify-center pointer-events-none">
            {Array.from({ length: totalCount }).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentIdx ? 6 : 5,
                  height: i === currentIdx ? 6 : 5,
                  background: i === currentIdx ? '#4f9eed' : 'rgb(var(--white-rgb) / 0.45)',
                  boxShadow: i === currentIdx ? '0 0 4px rgba(79,158,237,0.7)' : 'none',
                }}
              />
            ))}
          </div>
        )}
        {totalCount > 12 && (
          <div
            className="absolute top-2.5 right-2.5 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          >
            {currentIdx + 1}/{totalCount}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="transition-transform duration-150 active:scale-90"
          >
            <Heart
              size={24}
              fill={liked ? '#ef4444' : 'none'}
              stroke={liked ? '#ef4444' : 'rgb(var(--white-rgb) / 0.85)'}
              className="transition-colors duration-150"
            />
          </button>
          <button
            onClick={onOpen}
            className="transition-colors duration-150"
            style={{ color: 'rgb(var(--white-rgb) / 0.85)' }}
          >
            <MessageCircle size={23} />
          </button>
          <button
            className="transition-colors duration-150"
            style={{ color: 'rgb(var(--white-rgb) / 0.6)' }}
          >
            <Send size={21} />
          </button>
        </div>
        <button onClick={handleSave}>
          <Bookmark
            size={22}
            fill={saved ? 'rgb(var(--white-rgb) / 0.9)' : 'none'}
            stroke={saved ? 'rgb(var(--white-rgb) / 0.9)' : 'rgb(var(--white-rgb) / 0.85)'}
            className="transition-colors duration-150"
          />
        </button>
      </div>

      {/* Like count + caption */}
      <div className="px-4 pb-4 pt-1">
        <p className="text-white text-[13px] font-semibold">{likeCount.toLocaleString()} likes</p>
        <p className="text-white/70 text-[13px] mt-1 leading-relaxed">
          <span className="text-white font-semibold mr-1">cloutkart</span>
          {section.title} — premium ad creatives &amp; performance content ✨
        </p>
        <button
          onClick={onOpen}
          className="text-ink-dim text-[12px] mt-1 transition-colors duration-150 hover:text-ink-muted block"
        >
          View all {COMMENT_COUNTS[index % COMMENT_COUNTS.length]} comments
        </button>
        <p className="text-ink-dim text-[11px] mt-1.5 uppercase tracking-wide">2 days ago</p>
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
      .select('id, title, thumbnail_url, instagram_handle, instagram_link, portfolio_images(count)')
      .eq('is_visible', true)
      .order('display_order', { ascending: true })
      .limit(6)
      .then(({ data }) => {
        if (data) {
          setSections(data.map((s: { id: string; title: string; thumbnail_url: string; instagram_handle: string; instagram_link: string; portfolio_images: { count: number }[] }) => ({
            id: s.id,
            title: s.title,
            thumbnail_url: s.thumbnail_url,
            instagram_handle: s.instagram_handle ?? '',
            instagram_link: s.instagram_link ?? '',
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

  return (
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="portfolio" style={{ background: 'transparent' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <div className="reveal eyebrow-pill mb-7">
            <span className="w-1 h-1 rounded-full bg-brand-purple" />
            Our Work
          </div>
          <h2
            className="reveal delay-100 font-heading font-bold leading-[1.06] tracking-tight mb-3 sm:mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
          >
            Results That
            <br />
            <span style={{ color: 'var(--ink)' }}>Speak For Themselves.</span>
          </h2>
          <p className="reveal delay-200 text-ink-body text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            A showcase of premium ad creatives, campaign visuals, and performance-focused content.
          </p>
        </div>

        {!loaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-2xl overflow-hidden"
                style={{ animation: `pulse 2s ease-in-out ${i * 0.1}s infinite` }}
              >
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <div className="h-3 bg-white/10 rounded w-24 mb-1.5" />
                    <div className="h-2 bg-white/5 rounded w-16" />
                  </div>
                </div>
                <div className="bg-white/5" style={{ aspectRatio: '1/1' }} />
                <div className="px-4 py-3">
                  <div className="h-3 bg-white/10 rounded w-20 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-full mb-1.5" />
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink-dim text-sm">Portfolio coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <InstagramCard
                key={section.id}
                section={section}
                index={index}
                onOpen={() => openLightbox(section.id, section.title)}
                isVisible={visible}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
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

      <style>{`
        @keyframes igFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.7; } }
      `}</style>
    </section>
  );
}
