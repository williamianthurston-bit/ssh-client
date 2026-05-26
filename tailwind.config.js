/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{js,ts,jsx,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        'app-bg': '#1C1C2E',
        'sidebar-bg': '#13131F',
        'terminal-bg': '#0D0D1A',
        'modal-bg': '#1F1F33',
        'accent': '#6E3FC5',
        'accent-hover': '#8A5FD8',
        'accent-light': 'rgba(110, 63, 197, 0.15)',
        'text-primary': '#E4E6F0',
        'text-muted': '#8888AA',
        'border-color': '#2E2E48',
        'tab-active': '#6E3FC5',
        'tab-inactive': '#1A1A2C',
        'success': '#4CAF82',
        'error': '#E05D5D',
        'warning': '#F5A623',
        'host-item': '#1E1E30',
        'host-item-hover': '#252540',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'modal': '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(110,63,197,0.2)',
        'sidebar-item': 'inset 3px 0 0 #6E3FC5',
      }
    }
  },
  plugins: []
}
