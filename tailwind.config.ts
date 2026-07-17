import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F3ED",   // varm off-white baggrund
        surface: "#FFFFFF",  // kort/formularer
        ink: "#2B2A27",      // varm antracit i stedet for sort
        line: "#E4DECF",     // bløde varme kantfarver
        accent: "#5C7A6B",   // dæmpet salviegrøn
        "accent-soft": "#E9EFE9",
        rust: "#A85436",     // dæmpet terrakotta til "slet"/advarsler
        "rust-soft": "#F5E7E0",
        gold: "#8A6420",
        "gold-soft": "#F7EFDD",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "0.85rem",
      },
    },
  },
  plugins: [],
};
export default config;
