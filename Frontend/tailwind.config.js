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
        'fluid-sm': 'clamp(0.55rem, 1vw, 0.7rem)',
        'fluid-base': 'clamp(0.75rem, 1.5vw, 0.8rem)',
		'fluid-lg': 'clamp(0.9rem, 2vw, 1.1rem)',
        'fluid-xl': 'clamp(1.125rem, 2.5vw, 1.5rem)',
        'fluid-xll': 'clamp(2rem, 4vw, 5rem)',
      }
	},
  },
  plugins: [],
}
