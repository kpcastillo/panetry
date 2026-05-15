export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        crust:   "#B0C4B1",
        dough:   "#f5ead7",
        butter:  "#D7D98A",
        jam:     "#F88F8F",
        cream:   "#fdf6ec",
        smoke:   "#4A5759",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body:    ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}