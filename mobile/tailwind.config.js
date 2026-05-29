/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#8E9E6E",
        secondary: "#D6DDC6",
        accent: "#F4E0AC",
        charcoal: "#10120C",
        "brand-green": "#8E9E6E",
        "brand-light": "#D6DDC6",
        "brand-cream": "#F4E0AC",
        "brand-dark": "#10120C",
      },
    },
  },
  plugins: [],
}