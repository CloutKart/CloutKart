/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        heading: ['Archivo Expanded', 'Hanken Grotesk', 'system-ui', 'sans-serif'],
        mono:    ['DM Mono', 'ui-monospace', 'monospace'],
        // Renaissance kit
        'serif-display': ['Cormorant Garamond', 'NCL Gasdrifo', 'Georgia', 'serif'],
        'serif-text':    ['EB Garamond', 'Georgia', 'serif'],
      },
      colors: {
        // `white` is remapped to a theme token so the ~360 existing
        // text-white / bg-white / border-white utilities flip automatically.
        white: 'rgb(var(--white-rgb) / <alpha-value>)',
        bg: {
          DEFAULT: 'rgb(var(--bg-rgb) / <alpha-value>)',
          elev:    'rgb(var(--bg-elev-rgb) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink-rgb) / <alpha-value>)',
          strong:  'rgb(var(--ink-strong-rgb) / <alpha-value>)',
          body:    'rgb(var(--ink-body-rgb) / <alpha-value>)',
          muted:   'rgb(var(--ink-muted-rgb) / <alpha-value>)',
          dim:     'rgb(var(--ink-dim-rgb) / <alpha-value>)',
        },
        accent: {
          DEFAULT:  'rgb(var(--accent-rgb) / <alpha-value>)',
          strong:   'rgb(var(--accent-strong-rgb) / <alpha-value>)',
          ink:      'rgb(var(--accent-ink-rgb) / <alpha-value>)',
          contrast: 'rgb(var(--accent-contrast-rgb) / <alpha-value>)',
        },
        success: 'rgb(var(--success-rgb) / <alpha-value>)',
        // Back-compat: the old 4-colour rainbow now all resolve to the one
        // committed violet, so `from-brand-purple to-brand-cyan` = solid accent.
        brand: {
          purple: 'rgb(var(--accent-rgb) / <alpha-value>)',
          blue:   'rgb(var(--accent-rgb) / <alpha-value>)',
          cyan:   'rgb(var(--accent-rgb) / <alpha-value>)',
          indigo: 'rgb(var(--accent-ink-rgb) / <alpha-value>)',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, rgb(var(--accent-strong-rgb)), rgb(var(--accent-rgb)))',
        'dot-grid': 'radial-gradient(circle, var(--dot-color) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '28px 28px',
      },
      animation: {
        'float':            'float 5s ease-in-out infinite',
        'float-slow':       'floatSlow 7s ease-in-out infinite',
        'float-delayed':    'float 6s ease-in-out 2s infinite',
        'fade-up':          'fadeUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in':          'fadeIn 1s ease forwards',
        'gradient-shift':   'gradientShift 4s ease infinite',
        'spin-slow':        'spin 20s linear infinite',
        'scroll-progress':  'none',
        'marquee-reverse':  'marqueeReverse 35s linear infinite',
        'orb-drift':        'orbDrift 22s ease-in-out infinite',
        'orb-drift-alt':    'orbDriftAlt 28s ease-in-out infinite',
        'border-pulse':     'borderPulse 2.5s ease-in-out infinite',
        'count-up':         'countUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer':          'shimmer 2s ease-in-out infinite',
        'scan-line':        'scanLine 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(22px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        gradientShift: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        marqueeReverse: {
          from: { transform: 'translateX(-50%)' },
          to:   { transform: 'translateX(0)' },
        },
        orbDrift: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '25%':      { transform: 'translate(28px, -18px) scale(1.04)' },
          '50%':      { transform: 'translate(12px, 28px) scale(0.97)' },
          '75%':      { transform: 'translate(-18px, 8px) scale(1.02)' },
        },
        orbDriftAlt: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%':      { transform: 'translate(-22px, 18px) scale(1.05)' },
          '66%':      { transform: 'translate(18px, -14px) scale(0.96)' },
        },
        borderPulse: {
          '0%, 100%': { boxShadow: '0 0 0 1px rgb(var(--accent-rgb) / 0.35), var(--shadow-card)' },
          '50%':      { boxShadow: '0 0 0 1px rgb(var(--accent-rgb) / 0.70), var(--shadow-card), 0 0 24px rgb(var(--accent-rgb) / 0.12)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        scanLine: {
          '0%':   { transform: 'translateX(-102%)', opacity: '1' },
          '85%':  { opacity: '1' },
          '100%': { transform: 'translateX(102%)', opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
