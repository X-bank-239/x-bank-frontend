import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  // Гарантируем генерацию классов палитры (бирюзовый primary, slate)
  safelist: [
    { pattern: /^(bg|text|border|ring)-primary-(50|100|200|300|400|500|600|700|800|900)$/, variants: ["hover", "dark"] },
    { pattern: /^(bg|text)-slate-(50|100|200|800|900|950)$/, variants: ["dark"] },
  ],
  theme: {
    extend: {
      colors: {
        /* Банковская палитра: тёмный бирюзовый/индиго (не зелёный как у Сбера) */
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        /* Акцент для карточек и выделений */
        accent: {
          DEFAULT: '#0d9488',
          light: '#2dd4bf',
          dark: '#0f766e',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config;
