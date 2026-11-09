// tailwind.config.ts
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F0EFF1",
        card: "#FAF9FC",
        ink: "#111111",
        muted: "#6E6E73",
        divider: "#D9D9DE",
        mesh: "#1D1D1F",
        primary: "#0071E3",
        success: "#34C759",
        warning: "#FF9F0A",
        error: "#FF3B30",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        card: "26px",
      },
    },
  },
  plugins: [typography],
};

export default config;