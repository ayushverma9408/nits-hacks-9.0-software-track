/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        edith: {
          ink: '#090d18',
          panel: '#101827',
          blue: '#69a8ff',
          green: '#55d6a1',
          red: '#ff7185',
          purple: '#a88bff'
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif']
      }
    }
  },
  plugins: []
};
