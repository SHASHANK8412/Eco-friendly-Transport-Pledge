/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eco-primary': '#34D399',
        'eco-secondary': '#047857',
        'eco-accent': '#F59E0B',
      }
    },
  },
  plugins: [],
}