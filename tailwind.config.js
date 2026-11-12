/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./frontend/**/*.html", "./frontend/js/**/*.js"],
  theme: {
    extend: {
      fontFamily: { vazir: ["Vazirmatn", "Tahoma", "sans-serif"] },
      colors: {
        brand: {
          DEFAULT: "#ff6b81",
          dark: "#e54861",
          light: "#fff1f3",
        },
      },
    },
  },
  plugins: [],
};
