/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          aqua: '#67c8b8',
          teal: '#49c3c8',
          blue: '#3e97da',
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
