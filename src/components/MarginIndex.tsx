import { useEffect, useState } from 'react';

// V3 kit — the sheet index down the right edge of the viewport, one mark per
// sheet, lighting up in violet as the reader passes. Set in ROMAN numerals: the
// index is a running position mark, and roman keeps it from reading as a second,
// competing set of figures next to the arabic sheet numbers printed inside each
// section. Position n still maps 1:1 to Sheet 0n. Desktop only (CSS).
const CHAPTERS: { numeral: string; id: string; label: string }[] = [
  { numeral: 'I', id: 'about', label: 'The Offering' },
  { numeral: 'II', id: 'assembly', label: 'The Assembly' },
  { numeral: 'III', id: 'pixie', label: 'The Engine' },
  { numeral: 'IV', id: 'story', label: 'The Run' },
  { numeral: 'V', id: 'services', label: 'The Scope' },
  { numeral: 'VI', id: 'process', label: 'The Stations' },
  { numeral: 'VII', id: 'portfolio', label: 'The Gallery' },
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
          aria-label={`${c.label} — sheet ${c.numeral}`}
          aria-current={active === c.id ? 'true' : undefined}
          onClick={() => document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth' })}
        >
          {c.numeral}
        </button>
      ))}
    </nav>
  );
}
