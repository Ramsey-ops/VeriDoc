/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07110d",
          900: "#101914",
          800: "#18231d",
          700: "#27342d",
        },
        bank: {
          50: "#ecfdf6",
          100: "#d2f9e7",
          500: "#12b981",
          600: "#059669",
          700: "#047857",
        },
        ivory: "#fbfaf7",
      },
      boxShadow: {
        premium: "0 24px 80px rgba(7, 17, 13, 0.12)",
        lift: "0 16px 40px rgba(7, 17, 13, 0.1)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
