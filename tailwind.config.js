/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        heading: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        brand: {
          purple: 'rgb(var(--p) / <alpha-value>)',
          blue:   '#3B82F6',
          cyan:   '#06B6D4',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, rgb(var(--p)), #3B82F6, #06B6D4)',
        'dot-grid': 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '28px 28px',
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'fade-up': 'fadeUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 1s ease forwards',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'spin-slow': 'spin 20s linear infinite',
        'scroll-progress': 'none',
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
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
