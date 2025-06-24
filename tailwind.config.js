// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        arabic: ['Noto Kufi Arabic', 'sans-serif'],
      },
      colors: {
        primary: 'var(--primary-color, #2563eb)',
        secondary: 'var(--secondary-color, #475569)',
        accent: 'var(--accent-color, #10b981)',
        neutral: 'var(--neutral-color, #1e293b)',
        'base-100': 'var(--base-100-color, #ffffff)',
        'base-200': 'var(--base-200-color, #f1f5f9)',
        'base-300': 'var(--base-300-color, #e2e8f0)',
      },
    }
  },
  plugins: [],
}