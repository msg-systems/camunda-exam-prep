/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        camunda: {
          DEFAULT: '#FC5D0D',
          dark: '#1a1a1a',
        },
      },
    },
  },
  plugins: [],
};
