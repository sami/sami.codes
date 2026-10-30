/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./templates/**/*.twig', './js/site.js', './js/game.js'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--color-brand)',
        'brand-light': 'var(--color-brand-light)',
        'brand-dark': 'var(--color-brand-dark)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
