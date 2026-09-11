/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Aqua and teal read well on the navy surfaces (8.1:1 and 6.9:1) but
          // not on white — use tealDeep when the background is light.
          aqua: '#67c8b8',
          teal: '#49c3c8',
          tealDeep: '#278286',
          // Working blue for anything that carries meaning — text, links, icons,
          // filled buttons. Calibrated against brand-mist (the darkest surface it sits
          // on) so it clears WCAG AA as body text everywhere: 4.88:1 on white,
          // 4.72:1 on brand-surface, 4.54:1 on brand-mist.
          blue: '#2d75b2',
          // The old, brighter blue. Decorative only: gradient stops, glows and
          // tinted washes with nothing rendered on top. White text on it is
          // 3.16:1, which is why it no longer backs anything readable.
          blueLight: '#3e97da',
          navy: '#1a1d6d',
          ink: '#173252',
          mist: '#edf9f9',
          surface: '#f7fcfc',
          line: '#cfe7e7',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
