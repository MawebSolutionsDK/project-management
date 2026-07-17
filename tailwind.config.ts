import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Mørkt, køligt SaaS-tema (retning B) - samme semantiske token-navne som før,
        // så ALLE komponenter (card/input/btn/StatusBadge osv.) automatisk følger med.
        canvas: "#0B0D12", // side-baggrund, næsten sort med et køligt skær
        surface: "#14171F", // kort/formularer - lidt lysere mørk skifer
        ink: "#E7E9EE", // lys tekst (og lys knap-baggrund via bg-ink, jf. btn-primary)
        line: "#262B36", // dæmpede mørke kantfarver
        accent: "#7C93FF", // levende indigo/blå accent
        "accent-soft": "#1C2036", // mørk indigo-tint til badges/aktiv-tilstand
        rust: "#F2685C", // varm rød til advarsler/slet, lysnet for kontrast på mørk baggrund
        "rust-soft": "#33191A",
        gold: "#E8B75A",
        "gold-soft": "#332912",
        teal: "#5FD4C4",
        "teal-soft": "#122A28",
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
