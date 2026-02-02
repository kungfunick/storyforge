/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          50: '#F8F6F1',
          100: '#EDE9E0',
          200: '#E0DCD4',
          300: '#C4BFB5',
          400: '#8A8480',
          500: '#5C574F',
          600: '#2D2A26',
          700: '#1F1D1A',
          800: '#14120F',
          900: '#0A0908',
        },
        // Accent colors
        accent: {
          purple: '#9B8AC4',
          blue: '#6B7DB3',
          green: '#5B8E6B',
          red: '#9B4D4D',
          gold: '#C4A85B',
          pink: '#C45B8E',
        },
        // Semantic colors
        surface: {
          primary: '#F8F6F1',
          secondary: '#FFFFFF',
          tertiary: '#EDE9E0',
        },
        border: '#E0DCD4',
      },
      fontFamily: {
        serif: ['Crimson Pro', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
