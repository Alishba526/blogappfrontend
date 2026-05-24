import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#002A5A',
        secondary: '#C5A059',
        purple: {
          50: '#eef2f8',
          100: '#d9e2ef',
          200: '#b8c9e0',
          300: '#8baad0',
          400: '#5a86b9',
          500: '#3569a1',
          600: '#002A5A',
          700: '#00234a',
          800: '#001c3c',
          900: '#00162e',
        },
        pink: {
          50: '#fcfaf6',
          100: '#f8f1e5',
          200: '#f1e2c8',
          300: '#e8cfa5',
          400: '#ddb57c',
          500: '#C5A059',
          600: '#b38e4a',
          700: '#91713b',
          800: '#755b30',
          900: '#604a27',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
