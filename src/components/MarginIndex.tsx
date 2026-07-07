import { useEffect, useState } from 'react';

// V2 kit — the margin index: roman-numeral chapter marks (I–VII) down the right
// edge of the viewport, one per major section, lighting up in purple as the
// reader passes. Replaces nothing (the scroll progress bar stays); it reads like
// chapter marks in a bound book and doubles as navigation. Desktop only (CSS).
const CHAPTERS: { numeral: string; id: string; label: string }[] = [
  { numeral: 'I', id: 'hero', label: 'The Contact' },
  { numeral: 'II', id: 'about', label: 'The Movement' },
  { numeral: 'III', id: 'pixie', label: 'The Muse' },
  { numeral: 'IV', id: 'process', label: 'The Workshop' },
  { numeral: 'V', id: 'pricing', label: 'The Commission' },
  { numeral: 'VI', id: 'portfolio', label: 'The Gallery' },
  { numeral: 'VII', id: 'contact', label: 'The Letter' },
];

export default function MarginIndex() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    // Pick the chapter whose section currently owns the middle of the viewport.
    const sections = CHAPTERS
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let current = CHAPTERS[0].id;
      for (const el of sections) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid) current = el.id;
      }
      setActive(current);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <nav className="margin-index" aria-label="Chapters">
      {CHAPTERS.map((c) => (
        <button
          key={c.id}
          className={active === c.id ? 'is-active' : ''}
          title={c.label}
          aria-label={`${c.label} — chapter ${c.numeral}`}
          aria-current={active === c.id ? 'true' : undefined}
          onClick={() => document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth' })}
        >
          {c.numeral}
        </button>
      ))}
    </nav>
  );
}
