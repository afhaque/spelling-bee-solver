import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-funnel-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      colors: {
        oc: {
          bg: '#010303',
          surface: '#031512',
          primary: '#17ffdc',
          'primary-bg': 'rgba(23, 255, 220, 0.08)',
          'primary-border': 'rgba(23, 255, 220, 0.17)',
          'primary-border-strong': 'rgba(23, 255, 220, 0.5)',
          secondary: '#ffbd17',
          foreground: '#ffffff',
          'foreground-muted': 'rgba(255, 255, 255, 0.8)',
          'foreground-subtle': 'rgba(255, 255, 255, 0.56)',
          border: 'rgba(255, 255, 255, 0.1)',
          'border-accent': 'rgba(255, 255, 255, 0.25)',
        },
      },
    },
  },
  plugins: [],
}
export default config
