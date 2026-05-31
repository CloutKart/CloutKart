const items = [
  'Static Ads', 'Video Ads', 'UGC Concepts', 'Story Format',
  'Hook Writing', 'Performance Creative', 'D2C Growth', 'Reels',
  'Email Creative', 'Brand Campaigns', '500+ Brands Scaled', '48h Turnaround',
  'Message-First Strategy', 'Pixie AI', 'Conversion-Led Design',
];

export default function Marquee() {
  return (
    <div className="overflow-hidden py-4 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      {/* fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #080808, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #080808, transparent)' }} />

      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3.5 px-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#6B7280' }}>
              {item}
            </span>
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'rgba(168,85,247,0.45)' }} />
          </span>
        ))}
      </div>
    </div>
  );
}
