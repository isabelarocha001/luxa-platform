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
        luxa: {
          bg: "#0a0a0b",
          surface: "#121214",
          card: "#1a1a1e",
          border: "#2a2a30",
          muted: "#8b8b96",
          text: "#f4f4f5",
          accent: "#00aeef",
          accentHover: "#0090c8",
          pink: "#ff2d78",
        },
      },
    },
  },
  plugins: [],
};
export default config;
