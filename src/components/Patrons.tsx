import { useEffect, useRef } from 'react';

// V2 "The Patrons" — patronage is the one Renaissance idea that doesn't need
// updating. Names carved into a stone slab, museum-plaque quiet: no carousel,
// no logos, no motion loops. Hovering a name strikes a single puff of stone
// dust, as if it was just carved. The most timeless section on the site.
// Placeholder patrons — swap for real clients when supplied.
const PATRONS = [
  'Brewora', 'Aurelia Skincare', 'Northwind Apparel', 'Casa Verde',
  'Lumen & Co.', 'Atlas Supply', 'Velvet Fig', 'Kindred Goods',
];

export default function Patrons() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 90);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 [overflow-x:clip]" id="patrons" style={{ background: 'transparent' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="reveal mono-label mb-6" style={{ letterSpacing: '0.3em' }}>The Patrons</p>
          <h2 className="reveal delay-100 font-authored font-semibold leading-[1.04]"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4.2rem)', color: 'var(--ink)' }}>
            Those who
            <br />
            commissioned the work.
          </h2>
        </div>

        <div className="reveal delay-200 patron-slab">
          <span className="patron-slab-word font-authored" aria-hidden="true">Patroni</span>
          <div className="patron-grid">
            {PATRONS.map((name) => (
              <span key={name} className="patron-name font-authored">{name}</span>
            ))}
          </div>
          <span className="accession">No. 019 · 2045</span>
        </div>
      </div>
    </section>
  );
}
