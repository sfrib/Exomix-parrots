
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#082C53",
          600: "#082C53",
          500: "#0B3D77",
          400: "#125CA4",
        },
        accent: "#9ACD30",
        ink: "#1b2838",
        muted: "#6b7a90",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.06), 0 6px 12px rgba(8,44,83,.06)"
      },
      borderRadius: {
        xl: "14px"
      }
    },
  },
  plugins: [],
}
