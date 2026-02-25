/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nueva paleta Camiones
        // Negro profundo
        black: "#000000",
        // Rojo principal
        brandRed: {
          DEFAULT: "#9A0000",
          dark: "#6E0000",
        },
        // Grises personalizados
        gray: {
          50: "#D9D9DC",
          100: "#D9D9DC",
          200: "#8D8979",
          500: "#3F3E3B",
          700: "#000000",
          900: "#000000",
        },
        // Ajustes de azules usados como primarios -> los mapeamos a la nueva paleta
        blue: {
          50: "#D9D9DC",
          100: "#D9D9DC",
          500: "#9A0000",
          600: "#9A0000",
          700: "#000000",
        },
        red: {
          600: "#9A0000",
          700: "#000000",
        },
      },
    },
  },
  plugins: [],
}

