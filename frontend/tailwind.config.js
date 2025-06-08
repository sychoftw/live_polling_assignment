/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        
        'dark-text': '#E0E0E0',
        'dark-text-secondary': '#A0A0A0',
        'purple-primary': '#5A4FFF',
        'purple-secondary': '#8A4FFF',
        'card-bg-light': '#F2F2F2',
        
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}