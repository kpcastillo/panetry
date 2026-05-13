export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        crust:   "#1a1208",
        dough:   "#f5ead7",
        butter:  "#e8c97e",
        jam:     "#c0392b",
        cream:   "#fdf6ec",
        smoke:   "#6b5e4e",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body:    ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}