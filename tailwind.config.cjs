/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./resources/**/*.{vue,js,ts,jsx,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5E60FE',
        accent: '#F5D34D',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 