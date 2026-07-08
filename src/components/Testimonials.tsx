import { useEffect, useRef } from 'react';

// V2 "Transmissions" — testimonials as recovered letters: paper, ink, signature,
// sealed with a wax stamp whose pressed pattern is a barely-visible circuit —
// set by a machine on behalf of a human signer. Hovering a letter lifts its
// seal to reveal the signature beneath; it re-seals when you leave. The one
// place a visitor gets to open the letter themselves.
// Placeholder letters — swap for real client words when supplied.
const LETTERS = [
  {
    no: '031',
    body: 'We came for the speed and stayed for the taste. The first three statics outperformed a year of what we made in-house — and they still feel like us.',
    name: 'Meera Kapoor',
    role: 'Founder, Aurelia Skincare',
  },
  {
    no: '044',
    body: 'The brief went in on a Tuesday. By Thursday we had a campaign we would have paid an agency a quarter for. I keep the first hook pinned above my desk.',
    name: 'Daniel Osei',
    role: 'CMO, Northwind Apparel',
  },
  {
    no: '052',
    body: 'Working with Pixie feels less like software and more like a colleague who never sleeps and never misses. Our ROAS did the arguing for me at the board meeting.',
    name: 'Sofia Marchetti',
    role: 'Growth Lead, Casa Verde',
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 110);
            });
          }
        });
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 [overflow-x:clip]" id="letters" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <p className="reveal mono-label mb-6" style={{ letterSpacing: '0.3em' }}>The Correspondence</p>
          <h2 className="reveal delay-100 font-authored font-semibold leading-[1.04]"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4.2rem)', color: 'var(--ink)' }}>
            Letters from
            <br />
            <span style={{ color: 'var(--accent-ink)' }}>the patrons.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {LETTERS.map((l, i) => (
            <div key={l.no} className="reveal letter" style={{ transitionDelay: `${i * 110}ms` }}>
              <div className="artifact letter-paper px-6 pt-7 pb-16">
                <span className="accession" style={{ color: 'rgba(60,48,30,0.45)' }}>No. {l.no} · 2045</span>
                <p className="drop-cap font-authored letter-body">{l.body}</p>
                {/* signature — beneath the seal until the reader lifts it */}
                <div className="letter-signature">
                  <span className="font-authored italic" style={{ fontSize: '17px' }}>{l.name}</span>
                  <span className="letter-role">{l.role}</span>
                </div>
                {/* the wax seal, pressed by a machine on behalf of a human signer */}
                <div className="wax-seal" aria-hidden="true">
                  <span className="wax-seal-circuit" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
