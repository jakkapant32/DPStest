import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dps: {
          navy: "#0A192F",
          blue: "#1E3A8A",
          cyan: "#06B6D4",
          dark: "#020617",
        },
      },
      fontFamily: {
        sans: ["var(--font-kanit)", "system-ui", "sans-serif"],
        bebas: ['var(--font-bebas)', "sans-serif"],
        montserrat: ['var(--font-montserrat)', "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(6, 182, 212, 0.12)",
        cyan: "0 10px 30px -5px rgba(6, 182, 212, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
