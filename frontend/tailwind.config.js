/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        marquee: {
          bg: '#15130F',
          panel: '#1E1B15',
          panel2: '#262218',
          line: '#3A331F',
          gold: '#C6A15B',
          goldBright: '#E8C773',
          goldDim: '#8A713C',
          marquee: '#B9482F',
          cream: '#F3ECDD',
          muted: '#B8AD95',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'film-grain':
          "radial-gradient(circle at 1px 1px, rgba(230,199,115,0.06) 1px, transparent 0)",
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(230, 199, 115, 0.35)',
      },
    },
  },
  plugins: [],
};
