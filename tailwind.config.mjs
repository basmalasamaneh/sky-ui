/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8d6e63',
          DEFAULT: '#5d4037',
          dark: '#3e2723',
        },
      },
      fontFamily: {
        amiri: ['Amiri', 'serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
