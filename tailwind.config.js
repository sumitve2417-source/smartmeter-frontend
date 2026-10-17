/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff', 100: '#dbe7fe', 400: '#5b8def', 500: '#3866e0',
          600: '#2d54c4', 700: '#24439c', 900: '#152a63'
        },
        accent: { 500: '#ff8a3d', 600: '#f4711c' }
      },
      boxShadow: { card: '0 2px 10px rgba(20,30,60,0.06)' },
      borderRadius: { xl2: '1.25rem' }
    }
  },
  plugins: []
}
