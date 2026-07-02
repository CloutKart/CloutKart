import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  className?: string;
}

export default function ThemeToggle({ className = '' }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={!isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`group relative grid h-11 w-11 place-items-center rounded-full border border-white/[0.10] bg-white/[0.04] text-ink-muted transition-colors duration-200 hover:border-accent/40 hover:text-ink touch-manipulation ${className}`}
    >
      {/* Two icons cross-fade + rotate so the swap reads as one motion */}
      <Sun
        size={18}
        strokeWidth={2}
        className={`col-start-1 row-start-1 transition-all duration-300 ease-out ${
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Moon
        size={18}
        strokeWidth={2}
        className={`col-start-1 row-start-1 transition-all duration-300 ease-out ${
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  );
}
