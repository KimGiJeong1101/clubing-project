/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#faf7f4",
          100: "#f2ebe3",
          200: "#e4d5c4",
          300: "#d4b99e",
          400: "#c49a78",
          500: "#b87f5a",
          600: "#a6836f",
          700: "#8a6a58",
          800: "#70564a",
          900: "#5c473e",
        },
        khaki: {
          50: "#f9f8f0",
          100: "#f0edda",
          200: "#e2d9b5",
          300: "#cfc289",
          400: "#bcab62",
          500: "#a89448",
          600: "#8a7a3c",
          700: "#6b5f30",
          800: "#565903",
          900: "#3e4002",
        },
      },
      fontFamily: {
        hanbit: ["KCC-Hanbit", "sans-serif"],
        nanum: ["NanumSquareNeo", "sans-serif"],
        "nanum-light": ["NanumSquareNeoLight", "sans-serif"],
        "nanum-bold": ["NanumSquareNeoBold", "sans-serif"],
        "nanum-extrabold": ["NanumSquareNeoExtraBold", "sans-serif"],
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
        },
      },
    },
  },
  plugins: [],
};
