import { useEffect, useRef, useState } from 'react';
import { ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';
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

const fallbackItems = [
  { title: 'Fashion Brand TikTok', category: 'Short-form Video', image: 'https://images.pexels.com/photos/2218786/pexels-photo-2218786.jpeg?auto=compress&cs=tinysrgb&w=600', spanDesktop: '' },
  { title: 'SaaS Performance Ad', category: 'Performance Creative', image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600', spanDesktop: '' },
  { title: 'Luxury Brand Campaign', category: 'Brand Campaign', image: 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=900', spanDesktop: 'lg:col-span-2' },
  { title: 'Skincare UGC Concept', category: 'UGC-Style', image: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=600', spanDesktop: '' },
  { title: 'Tech Product Ad', category: 'Product Ad', image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=600', spanDesktop: '' },
  { title: 'Fitness Brand Creative', category: 'Instagram Creative', image: 'https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=600', spanDesktop: '' },
];

const spanClasses = ['lg:col-span-1 lg:row-span-2', '', '', 'lg:col-span-2', '', ''];

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  const [sections, setSections] = useState<PortfolioSection[]>([]);
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
        if (data && data.length > 0) {
          setSections(data.map((s: { id: string; title: string; thumbnail_url: string; portfolio_images: { count: number }[] }) => ({
            id: s.id,
            title: s.title,
            thumbnail_url: s.thumbnail_url,
            image_count: s.portfolio_images?.[0]?.count ?? 0,
          })));
        }
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
  }, []);

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

  const displayItems = sections.length > 0
    ? sections.map((s, i) => ({
        id: s.id,
        title: s.title,
        category: `${s.image_count} image${s.image_count !== 1 ? 's' : ''}`,
        image: s.thumbnail_url || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
        spanDesktop: spanClasses[i % spanClasses.length],
      }))
    : fallbackItems.map((item, i) => ({ ...item, id: String(i) }));

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

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 lg:auto-rows-[210px]">
          {displayItems.map((item, i) => (
            <div
              key={item.id}
              className={`reveal-scale ${item.spanDesktop} relative group overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer aspect-square lg:aspect-auto`}
              style={{ transitionDelay: `${Math.min(i * 80, 560)}ms` }}
              onClick={sections.length > 0 && 'id' in item ? () => openLightbox(item.id, item.title) : undefined}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-400" />
              <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <div
                  className="inline-flex items-center rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-white/80 w-fit mb-1.5 sm:mb-2 font-mono"
                  style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}
                >
                  {item.category}
                </div>
                <h3 className="text-white font-semibold font-heading text-xs sm:text-sm lg:text-[15px] leading-snug">{item.title}</h3>
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
        </div>
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

          {lightboxImages.length > 1 && (
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
                <div className="relative w-full rounded-2xl overflow-hidden" style={{ maxHeight: '70vh' }}>
                  <img
                    key={activeIndex}
                    src={lightboxImages[activeIndex].image_url}
                    alt={lightboxImages[activeIndex].caption || lightboxTitle}
                    className="w-full h-full object-contain"
                    style={{ maxHeight: '70vh', animation: 'fadeIn 0.2s ease' }}
                    loading="lazy"
                  />
                </div>
                {lightboxImages[activeIndex].caption && (
                  <p className="text-white/60 text-xs sm:text-sm font-mono text-center">{lightboxImages[activeIndex].caption}</p>
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

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }`}</style>
    </section>
  );
}
