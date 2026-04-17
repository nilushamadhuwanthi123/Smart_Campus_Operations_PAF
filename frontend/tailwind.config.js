/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#30364F',
        secondary: '#ACBAC4',
        accent: '#E1D9BC',
        light: '#F0F0DB',
      },
      boxShadow: {
        panel: '0 18px 40px rgba(48, 54, 79, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
