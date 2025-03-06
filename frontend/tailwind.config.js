/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          primary: "#00e676", // El color verde que usas en tus iconos
        },
      },
    },
    plugins: [],
  }