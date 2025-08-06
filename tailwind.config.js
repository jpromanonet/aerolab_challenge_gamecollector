// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: 'rgba(255, 0, 174, 0.5)',
          100: '#E7C0DB',
          200: '#C698B8',
          600: '#FF00AE',
        },
        violet: {
          50: '#E2DCE7',
          100: '#E7C0DB',
          600: '#6727A6',
          900: '#3C1661',
        },
        red: {
          600: '#D23F63',
        },
        green: {
          600: '#67C076',
        },
      },
    },
  },
  plugins: [],
}