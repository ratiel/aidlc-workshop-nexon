/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'status-pending': '#FFC107',
        'status-preparing': '#2196F3',
        'status-completed': '#4CAF50',
      },
      minWidth: {
        touch: '44px',
      },
      minHeight: {
        touch: '44px',
      },
      spacing: {
        touch: '44px',
      },
    },
  },
  plugins: [],
}
