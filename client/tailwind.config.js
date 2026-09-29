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
        cyber: {
          bg: '#0b1120',
          'bg-alt': '#0f172a',
          panel: '#1e293b',
          'panel-glass': 'rgba(30, 41, 59, 0.85)',
          surface: '#334155',
          border: '#334155',
          'border-bright': '#10b981',
          green: '#10b981', // Natural emerald green
          'green-light': '#34d399',
          'green-dark': '#059669',
          cyan: '#0284c7',  // Natural ocean blue
          blue: '#2563eb',
          amber: '#f59e0b', // Warm amber
          red: '#ef4444',   // Clear emergency red
          muted: '#94a3b8'
        },
        emergency: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        flood: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        },
        safety: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'natural-card': '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
        'natural-glow-green': '0 0 15px rgba(16, 185, 129, 0.25)',
        'natural-glow-blue': '0 0 15px rgba(2, 132, 199, 0.25)',
        'natural-glow-red': '0 0 15px rgba(239, 68, 68, 0.25)',
        'hud': '0 4px 24px 0 rgba(0, 0, 0, 0.35)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
