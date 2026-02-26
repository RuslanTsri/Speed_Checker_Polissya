/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Додаємо твій фірмовий помаранчевий (з orange-200)
        brand: {
          orange: '#FF6D00',
          light: '#F5F5F5',
          gray: '#C3C3C3'
        }
      }
    },
  },
  plugins: [],
}