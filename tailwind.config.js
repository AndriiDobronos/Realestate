/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'media',
  theme: {
    extend: {
      screens: {
        'xs': { 'max': '500px' }, // всё что ≤ 500px
      },
    },
  },
  plugins: [],
}

