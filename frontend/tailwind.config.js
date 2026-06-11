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
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          accent: '#10B981', // emerald green
        },
        dark: {
          bg: '#0B0F19',       // Deep tech black
          card: '#111827',     // Solid gray-900
          border: '#1F2937',   // Gray-800
          hover: '#374151',    // Gray-700
          text: '#F9FAFB',     // Gray-50
          muted: '#9CA3AF',    // Gray-400
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
