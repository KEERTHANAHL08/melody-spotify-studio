/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF9FF',
        surface: '#FFFFFF',
        lavender: {
          DEFAULT: '#B8A6E8',
          soft: '#E9E1FA',
          accent: '#8B75C9',
          dark: '#765DB8',
        },
        pastel: {
          pink: '#F7DCE8',
          peach: '#FFE7D6',
          mint: '#DDF3E4',
          blue: '#DDEBFA',
          yellow: '#FFF1C9',
          lilac: '#E9E1FA',
          lavender: '#B8A6E8'
        },
        primary: {
          text: '#302C3F',
          DEFAULT: '#8B75C9',
        },
        secondary: {
          text: '#777487',
        },
        border: {
          subtle: '#EEEAF5',
        }
      },
      borderRadius: {
        'card': '20px',
        'inner': '14px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(184, 166, 232, 0.12)',
        'card': '0 2px 12px -1px rgba(139, 117, 201, 0.08)',
        'hover': '0 8px 30px -4px rgba(139, 117, 201, 0.16)',
      }
    },
  },
  plugins: [],
}
