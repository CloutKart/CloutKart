import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

interface Props {
  onSignupOpen: () => void;
}

export default function Navbar({ onSignupOpen }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'How We Work', href: '#process' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Pricing', href: '#pricing' },
  ];

  type FanItem = { label: string; href?: string; onClick?: () => void; cta?: boolean };
  const ctaItem: FanItem = !isLoggedIn
    ? { label: 'Get Started', cta: true, onClick: onSignupOpen }
    : isAdmin
      ? { label: 'Admin Panel', cta: true, onClick: () => navigate('/admin') }
      : { label: 'Dashboard', cta: true, onClick: () => navigate('/dashboard') };
  const fanItems: FanItem[] = [...navLinks, ctaItem];

  const AuthButtons = () => {
    // The CTA is flush to the nav's right edge (self-stretch + md:pr-0). In the scrolled
    // FLOATING state it's a pill (matches the rounded nav); in the top NOTCH state it docks
    // into the square top-right corner (square TR, 20px BR matching the notch) instead of
    // reading as a mismatched pill.
    const ctaStyle: React.CSSProperties = {
      borderRadius: scrolled ? '100px' : '14px 0px 20px 14px',
      transition: 'transform 0.2s ease, box-shadow 0.25s ease, filter 0.2s ease, border-radius 480ms cubic-bezier(0.22,1,0.36,1)',
    };
    if (!isLoggedIn) {
      return (
        <button onClick={onSignupOpen} className="btn-primary text-sm px-6 self-stretch" style={ctaStyle}>
          Get Started
          <ArrowRight size={14} />
        </button>
      );
    }
    if (isAdmin) {
      return (
        <button onClick={() => navigate('/admin')} className="btn-primary text-sm px-6 self-stretch" style={ctaStyle}>
          <ShieldCheck size={14} />
          Admin Panel
          <ArrowRight size={14} />
        </button>
      );
    }
    return (
      <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm px-6 self-stretch" style={ctaStyle}>
        <LayoutDashboard size={14} />
        Dashboard
        <ArrowRight size={14} />
      </button>
    );
  };

  return (
    <>
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />

      <div className="fixed top-0 inset-x-0 z-50 px-3 sm:px-4 pointer-events-none">
        <nav
          className="site-nav pointer-events-auto mx-auto max-w-5xl border"
          style={{
            // Hero: a notch flush to the top edge (square top, rounded bottom).
            // Scroll: detaches into a floating rounded pill — one continuous motion.
            // Uses transform (GPU-composited, no reflow) so it stays smooth on phones.
            transform: scrolled ? 'translateY(14px)' : 'translateY(0px)',
            borderRadius: scrolled ? '30px' : '0px 0px 20px 20px',
            borderColor: 'var(--border)',
            borderTopColor: scrolled ? 'var(--border)' : 'transparent',
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: scrolled ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
            transition:
              'transform 480ms cubic-bezier(0.22,1,0.36,1), border-radius 480ms cubic-bezier(0.22,1,0.36,1), border-color 400ms ease, box-shadow 480ms ease',
            willChange: 'transform, border-radius',
          }}
        >
          <div className="pl-3 sm:pl-4 lg:pl-6 pr-3 sm:pr-4 md:pr-0">
            <div className={`flex items-center justify-between transition-[height] duration-[480ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? 'h-[52px]' : 'h-[60px]'}`}>
            <a href="/" className="flex items-center gap-3 group flex-shrink-0">
              <img src="/logo.png" alt="CloutKart" className="h-8 sm:h-10 w-auto object-contain" />
            </a>

            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-ink-body hover:text-white transition-colors duration-200 relative group font-heading"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-brand-purple to-brand-cyan group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3 h-full">
              <ThemeToggle />
              <AuthButtons />
            </div>

            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                className="relative grid h-10 w-10 place-items-center rounded-full border touch-manipulation transition-colors duration-200"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-strong)', color: 'var(--ink)' }}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
        </nav>
      </div>

      {/* Radial fan mobile menu — links arc out from the FAB */}
      <div
        className={`md:hidden fixed inset-0 z-30 transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgb(8 8 12 / 0.42)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <div className="md:hidden fixed top-1.5 right-3 z-40 pointer-events-none" aria-hidden={!menuOpen}>
        {fanItems.map((item, i) => {
          // Cascade fan: strong vertical spacing (no label overlap) + gentle
          // leftward drift, so it opens as a fan from the FAB without colliding.
          const dy = 62 + i * 54;
          const dx = 14 + i * 22;
          return (
            <a
              key={item.label}
              href={item.href ?? '#'}
              onClick={(e) => {
                if (item.onClick) { e.preventDefault(); item.onClick(); }
                setMenuOpen(false);
              }}
              className={`radial-item absolute right-0 top-0 whitespace-nowrap rounded-full font-heading font-semibold shadow-[var(--shadow-card)] ${
                item.cta ? 'text-sm px-5 py-3' : 'text-sm px-4 py-2.5'
              }`}
              style={{
                transform: menuOpen ? `translate(${-dx}px, ${dy}px)` : 'translate(0px, 6px) scale(0.55)',
                opacity: menuOpen ? 1 : 0,
                transitionDelay: menuOpen ? `${i * 45}ms` : `${(fanItems.length - i) * 22}ms`,
                pointerEvents: menuOpen ? 'auto' : 'none',
                background: item.cta ? 'var(--accent)' : 'var(--bg-elev)',
                color: item.cta ? 'var(--accent-contrast)' : 'var(--ink-body)',
                border: item.cta ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </>
  );
}
