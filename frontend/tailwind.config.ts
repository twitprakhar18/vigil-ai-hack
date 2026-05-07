import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        display: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        logo: ["var(--font-logo)", "Georgia", "serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#0D9488",
          light: "#CCFBF1",
          dark: "#0F766E",
        },
        vigil: {
          canvas: "#f5f8fa",
          border: "#d2dadf",
          ink: "#242424",
          muted: "#717171",
          sub: "#4f4f4f",
          active: "#46096e",
          activeBg: "#f7ecfd",
          danger: "#d95353",
          crisisGlow: "rgba(217,83,83,0.25)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
