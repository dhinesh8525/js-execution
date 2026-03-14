import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'editor-bg': '#1e1e1e',
        'panel-bg': '#252526',
        'panel-border': '#3c3c3c',
        'accent-blue': '#007acc',
        'accent-green': '#4ec9b0',
        'accent-yellow': '#dcdcaa',
        'accent-orange': '#ce9178',
        'accent-purple': '#c586c0',
        'stack-frame': '#264f78',
        'heap-object': '#3c3c3c',
        'scope-block': '#2d2d30',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'pop-in': 'pop-in 0.2s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 122, 204, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 122, 204, 0.8)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
