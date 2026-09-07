/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        void: {
          950: '#07090c',
          900: '#0b0e13',
          850: '#0e131a',
          800: '#121822',
          700: '#19212d',
          600: '#232c3a',
          500: '#3a4557',
        },
        cyan: {
          400: '#5fd4e0',
          500: '#2fb8c9',
        },
        violet: {
          400: '#8b8fe8',
          500: '#6c70d6',
        },
        signal: {
          green: '#4fd48a',
          amber: '#e8a94f',
          red: '#e8615f',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(95,212,224,0.15), 0 0 24px -4px rgba(95,212,224,0.25)',
        panel: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 30px -12px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
