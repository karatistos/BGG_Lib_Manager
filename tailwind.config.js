/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bgg: {
          orange: '#ff5100',
          dark: '#1e2024',
          navy: '#2c3545',
          gold: '#e29b13',
          weightLight: '#10b981',
          weightMedLight: '#0ea5e9',
          weightMedHeavy: '#f59e0b',
          weightHeavy: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}

