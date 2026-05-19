import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        roseApp: "#ff6f91",
        roseSoft: "#fff1f5",
        ink: "#2f2630"
      },
      boxShadow: {
        phone: "0 24px 80px rgba(255, 111, 145, 0.20)",
        card: "0 12px 32px rgba(31, 23, 31, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
