import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', './data/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#2F6B3A', 50: '#EEF5EC', 100: '#D8E8D3', 200: '#B3D2A9', 300: '#86B67A', 400: '#5A9550', 500: '#3E7B3A', 600: '#2F6B3A', 700: '#24542D', 800: '#1A3F22', 900: '#13311F', 950: '#0B1F13' },
        bark: { DEFAULT: '#6B4A2B', 50: '#F6EFE7', 100: '#E9D9C6', 200: '#D3B590', 300: '#B78E62', 400: '#9A6B3C', 500: '#6B4A2B', 600: '#553A22', 700: '#3F2B19' },
        sand: { DEFAULT: '#F3EBDD', 50: '#FBF7EF', 100: '#F7F1E6', 200: '#F3EBDD', 300: '#E8DAC1', 400: '#D9C4A0' },
        honey: { DEFAULT: '#F2D675', 100: '#FBF1C9', 200: '#F7E6A2', 300: '#F2D675', 400: '#E6BF3F', 500: '#C99C1E' },
        berry: { DEFAULT: '#A3262A', 50: '#FBECEC', 100: '#F5D0D0', 500: '#C8323C', 600: '#A3262A', 700: '#7E1C20' },
        ink: '#1C2A1F',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(19,49,31,.06), 0 8px 24px -12px rgba(19,49,31,.18)',
        lift: '0 2px 4px rgba(19,49,31,.08), 0 18px 40px -16px rgba(19,49,31,.30)',
      },
      borderRadius: { xl: '14px', '2xl': '20px' },
      keyframes: {
        ticker: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        pop: { '0%': { transform: 'scale(.96)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
      animation: { ticker: 'ticker 60s linear infinite', pop: 'pop .18s ease-out' },
    },
  },
  plugins: [],
};

export default config;
