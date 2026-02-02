/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // StoryForge color palette
        'sf-brown': {
          50: '#FAF8F5',
          100: '#F5F1EB',
          200: '#E8DFD1',
          300: '#D4C4AB',
          400: '#B5A088',
          500: '#8B7355',
          600: '#6B5D4D',
          700: '#5C574F',
          800: '#433D35',
        },
        'sf-cream': {
          DEFAULT: '#FDF8F3',
          dark: '#F5EFEA',
        },
        'sf-purple': {
          DEFAULT: '#7B6B9B',
          light: '#9B8AC4',
        },
        'sf-accent': {
          DEFAULT: '#B8936E',
        },
        'sf-red': {
          DEFAULT: '#9B4D4D',
          500: '#9B4D4D',
        },
        'accent-blue': '#6B7DB3',
        'accent-green': '#5B8E6B',
        'accent-red': '#9B4D4D',
        'accent-purple': '#7B6B9B',
        'accent-gold': '#B8936E',
        
        // System colors
        'surface-primary': '#FFFFFF',
        'surface-secondary': '#FAF8F5',
        'surface-tertiary': '#F5F1EB',
        'border': '#E8DFD1',
        'primary': {
          400: '#B5A088',
          500: '#8B7355',
          600: '#6B5D4D',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Merriweather', 'Georgia', 'serif'],
        'display': ['Merriweather', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
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
      },
    },
  },
  plugins: [],
}