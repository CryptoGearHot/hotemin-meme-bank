import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        summer: "0 30px 80px rgba(16, 32, 51, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
