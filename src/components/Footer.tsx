import { Instagram, Twitter, Linkedin, Youtube, Mail, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const links = {
    Agency: [
      { label: 'About', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'How We Work', href: '#process' },
      { label: 'Portfolio', href: '#portfolio' },
    ],
    Services: [
      { label: 'AI Image Ads', href: '#services' },
      { label: 'TikTok Creatives', href: '#services' },
      { label: 'Video Ads', href: '#services' },
      { label: 'UGC Concepts', href: '#services' },
    ],
    Contact: [
      { label: 'Free Creatives', href: '#pricing' },
      { label: 'Send Inquiry', href: '#contact' },
      { label: 'shivam@clout-kart.com', href: 'mailto:shivam@clout-kart.com' },
    ],
  };

  const socials = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter,   href: '#', label: 'Twitter' },
    { icon: Linkedin,  href: '#', label: 'LinkedIn' },
    { icon: Youtube,   href: '#', label: 'YouTube' },
    { icon: Mail,      href: 'mailto:shivam@clout-kart.com', label: 'Email' },
  ];

  return (
    <footer
      className="relative border-t border-white/[0.06] [overflow-x:clip]"
      style={{
        background: 'var(--bg-elev)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-6 sm:pb-10">
        {/* Top row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-10 sm:mb-14">
          {/* Brand col */}
          <div className="sm:col-span-2 lg:col-span-2">
            <img
              src="/logo.png"
              alt="CloutKart"
              className="h-10 sm:h-12 w-auto object-contain mb-4 sm:mb-5 opacity-80"
            />
            <p className="font-serif-text text-base leading-relaxed max-w-xs mb-5 sm:mb-6" style={{ color: 'var(--ink-muted)' }}>
              Modern advertising for modern brands. We build the winning message first — everything else scales from there.
            </p>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 glass-card rounded-lg flex items-center justify-center text-ink-muted hover:text-white transition-all duration-200 group touch-manipulation"
                  style={{ borderRadius: '10px' }}
                >
                  <s.icon size={15} className="group-hover:scale-110 transition-transform relative z-10" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:contents gap-8">
            {Object.entries(links).map(([group, items]) => (
              <div key={group}>
                <h4 className="small-caps font-serif-text text-sm mb-4 sm:mb-5" style={{ color: 'var(--accent-ink)', letterSpacing: '0.12em' }}>{group}</h4>
                <ul className="space-y-2.5 sm:space-y-3">
                  {items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="font-serif-text text-sm sm:text-base text-ink-muted hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                      >
                        <span className="break-all">{item.label}</span>
                        {item.href.startsWith('mailto') && (
                          <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Colophon — a printer's imprint */}
        <div className="flex flex-col items-center text-center gap-5 mb-9">
          <img src="/engravings/makers-mark.webp" alt="CloutKart maker's mark" className="engraving h-16 sm:h-20 w-auto" style={{ opacity: 0.9 }} />
          <div className="ornament-rule w-full max-w-md">
            <span className="font-serif-display italic leading-none" style={{ color: 'var(--ink-muted)', fontSize: '1.4rem' }}>The message, first.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 small-caps font-serif-text text-xs sm:text-sm" style={{ color: 'var(--ink-dim)', letterSpacing: '0.1em' }}>
          <p className="oldstyle-nums">© {new Date().getFullYear()} CloutKart · All rights reserved</p>
          <p>Composed &amp; engraved in-house</p>
        </div>
      </div>
    </footer>
  );
}
