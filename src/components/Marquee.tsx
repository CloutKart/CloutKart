const items = [
  'Static Ads', 'Video Ads', 'UGC Concepts', 'Story Format',
  'Hook Writing', 'Performance Creative', 'D2C Growth', 'Reels',
  'Email Creative', 'Brand Campaigns', '500+ Brands Scaled', '48h Turnaround',
  'Message-First Strategy', 'Pixie AI', 'Conversion-Led Design',
];

const itemsRow2 = [
  'ROAS Growth', 'Brief to Creative', 'D2C Expertise', 'Fast Iteration',
  'Pixie Engine', 'Hook Engineering', 'Message Strategy', 'Performance Ads',
  'Creative Operations', 'Brand Scaling', 'CTR Improvement', 'Ad Production',
  'Creative Testing', 'Campaign Assets', 'Result-Driven',
];

function Row({ data, anim, ink }: { data: string[]; anim: string; ink: number }) {
  return (
    <div className={`flex ${anim} whitespace-nowrap`}>
      {[...data, ...data].map((item, i) => (
        <span key={i} className="inline-flex items-center gap-5 px-6">
          <span
            className="font-serif-display small-caps oldstyle-nums text-lg sm:text-xl leading-none"
            style={{ color: `rgb(var(--ink-rgb) / ${ink})`, letterSpacing: '0.06em' }}
          >
            {item}
          </span>
          <span aria-hidden className="text-sm leading-none" style={{ color: 'rgb(var(--accent-rgb) / 0.5)' }}>❦</span>
        </span>
      ))}
    </div>
  );
}

// A carved inscription frieze (architrave), not a ticker: serif small-caps terms
// separated by fleurons, running between two hairline rules.
export default function Marquee() {
  return (
    <div
      className="overflow-hidden relative py-6 sm:py-8 space-y-2"
      style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--bg), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--bg), transparent)' }} />
      <Row data={items} anim="animate-marquee" ink={0.74} />
      <Row data={itemsRow2} anim="animate-marquee-reverse" ink={0.5} />
    </div>
  );
}
