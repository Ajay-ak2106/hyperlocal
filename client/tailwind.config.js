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
          bg: '#05090e',
          'bg-alt': '#091018',
          panel: '#0c1622',
          'panel-glass': 'rgba(12, 22, 34, 0.85)',
          surface: '#112030',
          border: '#163044',
          'border-bright': '#00ff9d',
          green: '#00ff9d', // Primary glowing neon green from reference
          'green-light': '#5cffbe',
          'green-dark': '#00b870',
          cyan: '#00e5ff',  // Electric tactical cyan
          blue: '#0284c7',
          amber: '#ffb703', // Warning gold
          red: '#ff2a55',   // Crisis neon crimson
          muted: '#64748b'
        },
        emergency: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#ff2a55',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        flood: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#00e5ff',
          600: '#0284c7',
          700: '#0369a1',
        },
        safety: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#00ff9d',
          600: '#00d684',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#ffb703',
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(0, 255, 157, 0.35)',
        'neon-green-sm': '0 0 10px rgba(0, 255, 157, 0.25)',
        'neon-green-inset': 'inset 0 0 15px rgba(0, 255, 157, 0.15)',
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.35)',
        'neon-red': '0 0 20px rgba(255, 42, 85, 0.4)',
        'hud': '0 8px 32px 0 rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(0, 255, 157, 0.2)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'radar-sweep': 'radar 4s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }
    },
  },
  plugins: [],
}
