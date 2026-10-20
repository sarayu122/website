/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 50px rgba(89, 75, 80, 0.08)',
      },
      colors: {
        blush: '#FBE4EA',
        cream: '#FFFDF9',
        lavender: '#EAE4F8',
        sky: '#E6F3FA',
        rose: '#D98198',
        cocoa: '#594B50',
      },
    },
  },
  plugins: [],
}

