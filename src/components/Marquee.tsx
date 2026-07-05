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

export default function Marquee() {
  return (
    <div className="overflow-hidden relative space-y-2 py-5" style={{ borderTop: '1px solid rgb(var(--white-rgb) / 0.05)', borderBottom: '1px solid rgb(var(--white-rgb) / 0.05)' }}>
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--bg), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--bg), transparent)' }} />

      {/* Row 1 — forward */}
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3.5 px-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--ink-dim)' }}>
              {item}
            </span>
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'rgb(var(--accent-rgb) / 0.45)' }} />
          </span>
        ))}
      </div>

      {/* Row 2 — reverse, slightly dimmer, indigo dots */}
      <div className="flex animate-marquee-reverse whitespace-nowrap">
        {[...itemsRow2, ...itemsRow2].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3.5 px-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--ink-dim)' }}>
              {item}
            </span>
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'rgb(var(--accent-rgb) / 0.35)' }} />
          </span>
        ))}
      </div>
    </div>
  );
}
