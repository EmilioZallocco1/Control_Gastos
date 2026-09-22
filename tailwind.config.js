/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f6ff',
          100: '#e6edff',
          200: '#c3d4ff',
          300: '#9fb8ff',
          400: '#7b93ff',
          500: '#5b6ff5',
          600: '#4650d6',
          700: '#3740ab',
          800: '#2b3282',
          900: '#232964',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#12141f',
        },
        canvas: {
          DEFAULT: '#f5f6fb',
          dark: '#0a0b12',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgb(16 24 60 / 0.06), 0 8px 24px -8px rgb(16 24 60 / 0.10)',
        card: '0 1px 2px rgb(16 24 60 / 0.04), 0 12px 32px -12px rgb(16 24 60 / 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'scale-in': 'scale-in 0.18s ease-out',
      },
    },
  },
  plugins: [],
}
