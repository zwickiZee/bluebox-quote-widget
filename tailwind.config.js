/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./dist/index.html", 
  ],
  theme: {
    extend: {
      fontFamily: {
        objektiv: ['"objektiv-mk1"', 'sans-serif'],
        objektiv2: ['"objektiv-mk2"', 'sans-serif'],
        objektiv3: ['"objektiv-mk3"', 'sans-serif'],
        proxima: ['"proxima-nova"', 'sans-serif'],
      },
      colors: {
        gray: colors.gray,
      },
    },
  },
  plugins: [],
};