/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./public/**/*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.html",
    "./src/html/**/*.html",
  ],
  theme: {
    extend: {
		fontSize: {
        'fluid-sm': 'clamp(0.875rem, 1.5vw, 1rem)',
        'fluid-base': 'clamp(1rem, 2vw, 1.25rem)',
        'fluid-lg': 'clamp(1.125rem, 2.5vw, 1.5rem)',
        'fluid-xl': 'clamp(2rem, 4vw, 5rem)',
      }
	},
  },
  plugins: [],
}
