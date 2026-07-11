/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          charcoal: "#0B0C10",
          navy: "#151B26",
          dark: "#1F2833",
          card: "rgba(31, 40, 51, 0.45)",
          gray: "#C0C0C0",
          cream: "#F4F6F9",
          gold: {
            light: "#E2C799",
            DEFAULT: "#C5A880",
            dark: "#9F8A6C",
            bright: "#DFBA82",
          }
        }
      },
      fontFamily: {
        serif: ["Cinzel", "Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "Montserrat", "sans-serif"],
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
