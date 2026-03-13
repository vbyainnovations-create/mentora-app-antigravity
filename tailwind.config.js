/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#194F8A', // Mentora Blue (Original)
          foreground: '#ffffff',
          dark: '#0F172A',   // Midnight/Slate-900
        },
        secondary: {
          DEFAULT: '#31975B', // Mentora Green (Original)
          foreground: '#ffffff',
          emerald: '#065F46', // Emerald-800
        },
        slate: {
          900: '#0F172A',
          800: '#1E293B',
          600: '#475569',
          500: '#64748B',
        },
        emerald: {
          50: '#ECFDF5',
          800: '#065F46',
          900: '#064E3B',
        },
        background: '#ffffff',
        foreground: '#0F172A',
      },
    },
  },
  plugins: [],
}
