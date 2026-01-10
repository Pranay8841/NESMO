/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1152d4",
        backgroundlight: "#f6f6f8",
        backgrounddark: "#101622",
        accentgold: "#F59E0B",
      },
      fontFamily: {
        display: ["Work Sans", "sans-serif"],
        body: ["Noto Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
