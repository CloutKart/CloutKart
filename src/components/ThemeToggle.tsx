import { useState } from 'react';
import { PenTool, Cpu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  className?: string;
}

// The toggle is reframed as Concept ↔ Execution (Concept = light, Execution = dark).
// PenTool = the idea/Concept; Cpu = the machine/Execution. Refined line-glyphs, no emoji.
export default function ThemeToggle({ className = '' }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';           // dark === Execution
  const next = isDark ? 'Concept' : 'Execution';
  const [ripple, setRipple] = useState(0);   // bump remounts the ring → one-shot replay

  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setRipple((n) => n + 1);
        toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      role="switch"
      aria-checked={!isDark}
      aria-label={`Switch to ${next}`}
      title={`${next} mode`}
      className={`group relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-white/[0.10] bg-white/[0.04] text-ink-muted transition-[color,border-color,transform] duration-200 hover:border-accent/40 hover:text-ink active:scale-90 touch-manipulation ${className}`}
    >
      {/* press ripple — only mounted while animating so the idle button keeps a clean
          1×1 grid (an empty flow child would spawn a 2nd column and shove the glyph left) */}
      {ripple > 0 && <span key={ripple} className="toggle-ripple" aria-hidden />}

      {/* the two glyphs cross-fade + rotate so the swap reads as one motion */}
      <PenTool
        size={17}
        strokeWidth={1.7}
        className={`col-start-1 row-start-1 transition-all duration-300 ease-out ${
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Cpu
        size={18}
        strokeWidth={1.7}
        className={`col-start-1 row-start-1 transition-all duration-300 ease-out ${
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  );
}
