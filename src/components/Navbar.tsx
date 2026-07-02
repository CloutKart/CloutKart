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

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'How We Work', href: '#process' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const AuthButtons = () => {
    if (!isLoggedIn) {
      return (
        <div className="flex items-center gap-2">
          <button onClick={onSignupOpen} className="btn-primary text-sm px-5 py-2.5">
            Get Started
            <ArrowRight size={14} />
          </button>
        </div>
      );
    }
    if (isAdmin) {
      return (
        <button onClick={() => navigate('/admin')} className="btn-primary text-sm px-5 py-2.5">
          <ShieldCheck size={14} />
          Admin Panel
          <ArrowRight size={14} />
        </button>
      );
    }
    return (
      <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm px-5 py-2.5">
        <LayoutDashboard size={14} />
        Dashboard
        <ArrowRight size={14} />
      </button>
    );
  };

  return (
    <>
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />

      <nav
        className={`site-nav fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'border-b border-white/[0.08] shadow-2xl shadow-black/60' : ''
        }`}
        style={{
          background: scrolled ? 'var(--nav-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">
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

            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <AuthButtons />
            </div>

            <div className="md:hidden flex items-center gap-1.5">
              <ThemeToggle />
              <button
                className="text-ink-body hover:text-white transition-colors p-2 -mr-2 touch-manipulation"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={() => setMenuOpen(false)}
      />

      <div
        className={`md:hidden fixed top-0 right-0 z-50 h-full w-[78vw] max-w-[300px] flex flex-col transition-transform duration-300 ease-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'var(--bg-elev)',
          borderLeft: '1px solid var(--border)',
          borderTopLeftRadius: '20px',
          borderBottomLeftRadius: '20px',
        }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <img src="/logo.png" alt="CloutKart" className="h-7 w-auto object-contain" />
          <button
            onClick={() => setMenuOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center touch-manipulation border border-white/10 hover:border-white/20 transition-colors"
          >
            <X size={16} className="text-white/60" />
          </button>
        </div>

        <div className="mx-6 h-px mb-4 bg-white/[0.06]" />

        <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-ink-body hover:text-white hover:bg-white/[0.04] transition-all duration-200 touch-manipulation font-heading"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="px-5 pb-10 pt-4 space-y-3">
          <div className="h-px mb-2 bg-white/[0.06]" />
          {!isLoggedIn ? (
            <button
              onClick={() => { setMenuOpen(false); onSignupOpen(); }}
              className="btn-primary w-full justify-center text-sm py-3.5"
            >
              Get Started <ArrowRight size={14} />
            </button>
          ) : isAdmin ? (
            <button
              onClick={() => { setMenuOpen(false); navigate('/admin'); }}
              className="btn-primary w-full justify-center text-sm py-3.5"
            >
              <ShieldCheck size={14} /> Admin Panel <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}
              className="btn-primary w-full justify-center text-sm py-3.5"
            >
              <LayoutDashboard size={14} /> Dashboard <ArrowRight size={14} />
            </button>
          )}
          <p className="text-center text-white/20 text-xs mt-4">clout-kart.com</p>
        </div>
      </div>
    </>
  );
}
