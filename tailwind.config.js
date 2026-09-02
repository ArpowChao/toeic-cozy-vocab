/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F4EFE6',
          300: '#EADFCF',
          400: '#DFCDB8',
        },
        latte: {
          100: '#F0E5DC',
          200: '#DFCCBD',
          300: '#C7A992',
          400: '#AB8466',
          500: '#8C5E3C',
          600: '#6F4627',
          700: '#54341B',
          800: '#3A2312',
          900: '#24150A',
        },
        amberGold: {
          100: '#FEF3E2',
          200: '#FDE2B8',
          300: '#FCCF88',
          400: '#F5B048',
          500: '#E59866',
          600: '#D97724',
        },
        sage: {
          50: '#F2F7F4',
          100: '#E1EDE6',
          200: '#C4DDD0',
          300: '#9EBFB0',
          400: '#7AA090',
          500: '#5E937A',
          600: '#487560',
          700: '#355747',
        },
        terracotta: {
          100: '#FCEBE9',
          200: '#F7CEC8',
          300: '#EE9F94',
          400: '#E57B6E',
          500: '#D96B5B',
          600: '#C14B3A',
        },
        cozyDark: {
          50: '#685D56',
          100: '#564B44',
          200: '#463C36',
          300: '#372E29',
          400: '#2D2520',
          500: '#221B17',
          600: '#17120F',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', '"Noto Sans TC"', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'cozy-sm': '0 2px 8px -2px rgba(92, 60, 39, 0.06), 0 1px 4px -1px rgba(92, 60, 39, 0.04)',
        'cozy': '0 8px 24px -4px rgba(92, 60, 39, 0.08), 0 2px 8px -2px rgba(92, 60, 39, 0.04)',
        'cozy-lg': '0 16px 36px -6px rgba(92, 60, 39, 0.12), 0 4px 12px -2px rgba(92, 60, 39, 0.06)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
