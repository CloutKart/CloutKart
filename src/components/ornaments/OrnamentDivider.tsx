// OrnamentDivider — a section divider: an engraved botanical fleuron centered between
// two tapering hairlines. The fleuron is a generated engraving (dark ink) that inverts
// to light ink on the dark canvas via the `.engraving` class.

export default function OrnamentDivider({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 'h-4 sm:h-5' : 'h-5 sm:h-7';
  return (
    <div className={`ornament-rule mx-auto max-w-3xl px-6 my-12 md:my-16 ${className}`} aria-hidden="true">
      <img src="/engravings/fleuron.webp" alt="" className={`engraving ${h} w-auto`} style={{ opacity: 0.85 }} />
    </div>
  );
}
