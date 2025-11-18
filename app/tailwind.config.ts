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
        'foxfi-primary': '#FF6B35',
        'foxfi-secondary': '#004E89',
        'foxfi-accent': '#F77F00',
        'foxfi-dark': '#1A1A2E',
        'foxfi-light': '#F5F5F5',
      },
    },
  },
  plugins: [],
}
export default config

