import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0d0d0d",
        surface: "#1c1c1e",
        "primary-active": "#3a3a3c",
        primary: "#2c2c2e",
        accent: "#ff9f0a",
        "accent-muted": "rgba(255,159,10,0.15)",
        muted: "#8e8e93",
        danger: "#ff453a",
        sep: "rgba(255,255,255,0.12)",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
