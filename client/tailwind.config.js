/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FDFBF7',
        panel: '#F4F1EA',
        panel2: '#F9F8F6',
        line: '#E8E5DF',
        ink: '#1A1A1A',
        ink2: '#333333',
        muted: '#736E65',
        muted2: '#908B82',
        muted3: '#4A4741',
        gold: '#C5A880',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
