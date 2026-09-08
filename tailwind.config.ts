import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f6f0e4",
        "cream-deep": "#efe6d4",
        paper: "#fffcf6",
        ink: "#2a2118",
        muted: "#7c6a55",
        line: "#e6dbc8",
        accent: "#b5552b",
        "accent-deep": "#8c3f1b",
        green: "#2e7d4f",
        "green-soft": "#e3f1e8",
        red: "#b3261e",
        "red-soft": "#fbe9e7",
      },
      boxShadow: {
        card: "0 1px 2px rgba(42,33,24,0.04), 0 12px 32px -12px rgba(42,33,24,0.18)",
        sheet: "0 2px 4px rgba(42,33,24,0.06), 0 30px 60px -20px rgba(42,33,24,0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
