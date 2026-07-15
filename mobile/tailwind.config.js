/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontSize: {
        xs: ['13px', { lineHeight: '18px' }],
        sm: ['15px', { lineHeight: '21px' }],
        base: ['17px', { lineHeight: '25px' }],
        lg: ['20px', { lineHeight: '28px' }],
        xl: ['23px', { lineHeight: '31px' }],
        '2xl': ['27px', { lineHeight: '35px' }],
        '3xl': ['33px', { lineHeight: '42px' }],
        '4xl': ['39px', { lineHeight: '48px' }],
        '5xl': ['50px', { lineHeight: '58px' }],
      },
      colors: {
        primary: '#8E9E6E',
        secondary: '#D6DDC6',
        accent: '#F4E0AC',
        charcoal: '#10120C',
        'brand-green': '#8E9E6E',
        'brand-light': '#D6DDC6',
        'brand-cream': '#F4E0AC',
        'brand-dark': '#10120C',
      },
      keyframes: {
        'arrow-right': {
          '0%, 100%': { transform: 'translateX(0px)' },
          '50%': { transform: 'translateX(4px)' },
        },
        'arrow-left': {
          '0%, 100%': { transform: 'translateX(0px)' },
          '50%': { transform: 'translateX(-4px)' },
        },
        'arrow-up-right': {
          '0%, 100%': { transform: 'translate(0px, 0px)' },
          '50%': { transform: 'translate(3px, -3px)' },
        },
      },
      animation: {
        'arrow-right': 'arrow-right 1s ease-in-out infinite',
        'arrow-left': 'arrow-left 1s ease-in-out infinite',
        'arrow-up-right': 'arrow-up-right 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
