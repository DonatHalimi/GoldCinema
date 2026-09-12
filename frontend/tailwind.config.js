/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        marquee: {
          bg: 'rgb(var(--color-bg) / <alpha-value>)',
          panel: 'rgb(var(--color-panel) / <alpha-value>)',
          panel2: 'rgb(var(--color-panel2) / <alpha-value>)',
          line: 'rgb(var(--color-line) / <alpha-value>)',
          gold: 'rgb(var(--color-gold) / <alpha-value>)',
          goldBright: 'rgb(var(--color-goldBright) / <alpha-value>)',
          goldDim: 'rgb(var(--color-goldDim) / <alpha-value>)',
          marquee: 'rgb(var(--color-error) / <alpha-value>)',
          cream: 'rgb(var(--color-cream) / <alpha-value>)',
          muted: 'rgb(var(--color-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'film-grain':
          'radial-gradient(circle at 1px 1px, rgb(var(--color-goldBright) / 0.06) 1px, transparent 0)',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgb(var(--color-glow) / var(--glow-opacity))',
      },
    },
  },
  plugins: [],
};