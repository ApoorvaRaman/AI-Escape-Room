import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neon: { cyan: "#00F0FF", green: "#39FF14", red: "#FF3131" },
        space: "#0B0F17",
        panel: "#111827",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0,240,255,0.0)" },
          "50%": { boxShadow: "0 0 18px 2px rgba(0,240,255,0.35)" },
        },
        alarm: {
          "0%, 100%": { opacity: "1", textShadow: "0 0 12px rgba(255,49,49,0.9)" },
          "50%": { opacity: "0.45", textShadow: "none" },
        },
        blink: { "0%, 49%": { opacity: "1" }, "50%, 100%": { opacity: "0" } },
      },
      animation: {
        glow: "glow 2.4s ease-in-out infinite",
        alarm: "alarm 0.9s ease-in-out infinite",
        blink: "blink 1s steps(1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
