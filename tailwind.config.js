/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        'xs': { 'max': '500px' }, // всё что ≤ 500px
      },
    },
  },
  plugins: [],
}

