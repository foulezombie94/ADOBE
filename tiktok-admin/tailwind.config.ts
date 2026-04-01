import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#392cc1",
        "on-primary": "#ffffff",
        "primary-container": "#534ad9",
        "on-primary-container": "#dbd7ff",
        "secondary": "#4648d4",
        "on-secondary": "#ffffff",
        "secondary-container": "#6063ee",
        "on-secondary-container": "#fffbff",
        "tertiary": "#7e3000",
        "on-tertiary": "#ffffff",
        "background": "#0a0a0c", // Hardcore Dark Mode
        "on-background": "#eff1f3",
        "surface": "#121214",
        "on-surface": "#eff1f3",
        "surface-variant": "#1c1c1f",
        "on-surface-variant": "#c7c4d8",
        "error": "#ffb4ab",
        "on-error": "#690005",
        "outline": "#918f9a",
        "tiktok-pink": "#fe2c55",
        "tiktok-cyan": "#25f4ee",
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
      },
      borderRadius: {
        "xl": "1rem",
        "2xl": "1.5rem",
      },
      backdropBlur: {
        "xs": "2px",
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
export default config;
