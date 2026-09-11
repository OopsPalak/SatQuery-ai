/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        isro: {
          bg: '#080c14',          // Deep space / telemetry slate base
          panel: '#0e1626',       // Technical GIS panel background
          border: '#1e2d4a',      // Crisp grid border line
          header: '#0a101d',      // Top status command bar
          cyan: '#06b6d4',        // Secondary radar highlights
          cyanDark: '#0891b2',
          blue: '#2563eb',        // Main optical vector highlight
          amber: '#f59e0b',       // SAR backscatter anomaly alert
          emerald: '#10b981',     // Verified confidence highlight
          red: '#ef4444',         // Severe threshold alert
          muted: '#64748b',       // Secondary telemetry label
          light: '#cbd5e1',       // High readability text
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Space Mono"', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'none': '0px',
        'xs': '2px',
        'sm': '4px',
        'md': '4px',             // Strict rule: NO pill-shaped rounded buttons!
      }
    },
  },
  plugins: [],
}
