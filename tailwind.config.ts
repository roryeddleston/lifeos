import type { Config } from "tailwindcss";

const config: Config = {
  // Required so next-themes can toggle class on <html>
  darkMode: "class",

  // Adjust globs to exactly where your components/pages live
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],

  theme: {
    extend: {},
  },

  // Keep as an array; add plugins here if/when needed
  plugins: [],
};

export default config;
