/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{js,ts,jsx,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        app:      '#0b0f1c',
        sidebar:  '#0d1120',
        panel:    '#111827',
        card:     '#141c2e',
        input:    '#141c2e',
        hover:    '#1a2540',
        terminal: '#080c14',
        modal:    '#0f1625',
        accent:   '#3b82f6',
        'accent-hover':  '#2563eb',
        'accent-green':  '#22c55e',
        border:   '#1e2d45',
        'border-light':  '#151f35',
        primary:  '#e2e8f0',
        secondary:'#8896b3',
        muted:    '#4a5a78',
        success:  '#22c55e',
        warning:  '#f97316',
        error:    '#ef4444',
        ubuntu:   '#e95420',
      },
      fontFamily: {
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    }
  },
  plugins: []
}
