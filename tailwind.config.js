/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      colors: {
        brand: {
          purple: '#A855F7',
          blue:   '#3B82F6',
          cyan:   '#06B6D4',
          indigo: '#6366F1',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #A855F7, #3B82F6, #06B6D4)',
        'dot-grid': 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
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
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(168,85,247,0.35), 0 8px 32px rgba(0,0,0,0.45)' },
          '50%':      { boxShadow: '0 0 0 1px rgba(168,85,247,0.7), 0 8px 32px rgba(0,0,0,0.45), 0 0 24px rgba(168,85,247,0.12)' },
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
