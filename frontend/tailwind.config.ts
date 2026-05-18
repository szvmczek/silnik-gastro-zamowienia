import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.2, 0.7, 0.3, 1)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "180ms",
        slow: "260ms",
      },
      keyframes: {
        dotpulse: {
          "0%": { boxShadow: "0 0 0 0 rgb(var(--color-primary) / 0.45)" },
          "100%": { boxShadow: "0 0 0 10px rgb(var(--color-primary) / 0)" },
        },
        urgentPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)" },
          "50%": { boxShadow: "0 0 12px 2px rgba(239, 68, 68, 0.35)" },
        },
        adminPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.42)" },
          "50%": { boxShadow: "0 0 0 10px rgba(245, 158, 11, 0)" },
        },
      },
      animation: {
        dotpulse: "dotpulse 1.8s ease-out infinite",
        "urgent-pulse": "urgentPulse 2.5s ease-in-out infinite",
        "pulse-new": "adminPulse 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
