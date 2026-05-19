import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        plum: {
          DEFAULT: "#3D1D3D",
          light: "#5A2E5A",
          dark: "#2A142A"
        },
        cream: {
          DEFAULT: "#FBF7F2",
        },
        gold: {
          DEFAULT: "#BFA07A",
          light: "#D8C0A3"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      }
    },
  },
  plugins: [],
};
export default config;
