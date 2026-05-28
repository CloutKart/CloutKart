import { useEffect, useRef, useState } from 'react';
import { ExternalLink, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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

const spanMap: Record<number, string[]> = {
  1: ['col-span-2 lg:col-span-3'],
  2: ['col-span-2 lg:col-span-2', 'col-span-2 lg:col-span-1 lg:row-span-2'],
  3: ['col-span-2 lg:col-span-1 lg:row-span-2', 'col-span-1', 'col-span-1'],
  4: ['col-span-2 lg:col-span-2', 'col-span-2 lg:col-span-1', 'col-span-1', 'col-span-1'],
  5: ['col-span-2 lg:col-span-1 lg:row-span-2', 'col-span-1', 'col-span-1', 'col-span-2 lg:col-span-1', 'col-span-2 lg:col-span-1'],
  6: ['col-span-2 lg:col-span-1 lg:row-span-2', '', '', 'lg:col-span-2', '', ''],
};

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [loaded, setLoaded] = useState(false);
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
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal, .reveal-scale').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 80);
            });
          }
        });
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

  const count = sections.length;
  const spans = spanMap[Math.min(count, 6)] ?? spanMap[6];

  return (
    <section ref={sectionRef} className="relative py-20 md:py-36 [overflow-x:clip]" id="portfolio" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
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
          /* Skeleton while loading */
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 lg:auto-rows-[210px]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`${i === 0 ? 'lg:col-span-1 lg:row-span-2' : i === 3 ? 'lg:col-span-2' : ''} rounded-xl sm:rounded-2xl aspect-square lg:aspect-auto`}
                style={{ background: 'rgba(255,255,255,0.04)', animation: `pulse 2s ease-in-out ${i * 0.1}s infinite` }} />
            ))}
          </div>
        ) : count === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#6B7280] text-sm">Portfolio coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 lg:auto-rows-[210px]">
            {sections.map((section, i) => (
              <div
                key={section.id}
                className={`reveal-scale ${spans[i] ?? ''} relative group overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer aspect-square lg:aspect-auto`}
                style={{ transitionDelay: `${Math.min(i * 80, 560)}ms` }}
                onClick={() => openLightbox(section.id, section.title)}
              >
                {section.thumbnail_url ? (
                  <img
                    src={section.thumbnail_url}
                    alt={section.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.1))' }} />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-400" />

                <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <div
                    className="inline-flex items-center rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-white/80 w-fit mb-1.5 sm:mb-2 font-mono"
                    style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}
                  >
                    {section.image_count} image{section.image_count !== 1 ? 's' : ''}
                  </div>
                  <h3 className="text-white font-semibold font-heading text-xs sm:text-sm lg:text-[15px] leading-snug">{section.title}</h3>
                </div>

                <div
                  className="absolute top-3 right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                  style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <ExternalLink size={11} className="text-white/80" />
                </div>

                <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-transparent group-hover:border-brand-purple/30 transition-colors duration-300 pointer-events-none" />
              </div>
            ))}

            {/* Fill remaining slots if fewer than 6 sections */}
            {count < 6 && count > 0 && [...Array(Math.min(6 - count, 3))].map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="reveal-scale rounded-xl sm:rounded-2xl aspect-square lg:aspect-auto flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(255,255,255,0.06)',
                  transitionDelay: `${Math.min((count + i) * 80, 560)}ms`,
                }}
              >
                <div className="flex flex-col items-center gap-2 opacity-20">
                  <Plus size={20} className="text-white" />
                  <span className="text-white text-[10px] font-mono">More coming soon</span>
                </div>
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

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } } @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.7; } }`}</style>
    </section>
  );
}
