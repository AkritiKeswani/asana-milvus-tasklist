import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}", // App Router files under src
    "./src/components/**/*.{js,ts,jsx,tsx}", // Components under src (if you have any)
    "./src/**/*.{js,ts,jsx,tsx}", // All other files under src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;