import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        // Design v3 „PIEC" — ciemna ciepła paleta publicznej części.
        // Wartości żyją w styles/piec.css pod html[data-public-theme="piec"],
        // więc w panelu admina te klasy nie mają czego rozwiązać i nie są
        // tam używane. Akcent celowo NIE jest tu duplikowany — to `primary`.
        piec: {
          bg: "var(--piec-bg)",
          deep: "var(--piec-bg-deep)",
          surface: "var(--piec-surface)",
          surface2: "var(--piec-surface-2)",
          surface3: "var(--piec-surface-3)",
          ink: "rgb(var(--piec-ink-rgb) / <alpha-value>)",
          ok: "var(--piec-ok)",
          okSoft: "var(--piec-ok-soft)",
          warn: "var(--piec-warn)",
          warnSoft: "var(--piec-warn-soft)",
          warnBg: "var(--piec-warn-bg)",
        },
        // Czytelny tekst na akcencie — liczony z luminancji w themeLoader.
        onPrimary: "var(--color-on-primary)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        display: ["Anton", "Impact", "ui-sans-serif", "system-ui", "sans-serif"],
        plex: ["IBM Plex Sans", "ui-sans-serif", "system-ui", "sans-serif"],
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
        // Design v3 „PIEC" — 1:1 z <style> w paczce.
        piecShimmer: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.9" },
        },
        piecCountBump: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.34)" },
          "100%": { transform: "scale(1)" },
        },
        piecHeroDrift: {
          "0%": { transform: "scale(1.06) translate3d(0, 0, 0)" },
          "100%": { transform: "scale(1.14) translate3d(-1.2%, -1.4%, 0)" },
        },
        // Puls kropki: zielony = otwarte, bursztynowy = aktywny krok trackingu.
        piecPulseDot: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(143, 187, 110, 0.5)" },
          "50%": { boxShadow: "0 0 0 6px rgba(143, 187, 110, 0)" },
        },
        piecPulseAmber: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgb(var(--color-primary) / 0.55)" },
          "50%": { boxShadow: "0 0 0 8px rgb(var(--color-primary) / 0)" },
        },
        piecNavForward: {
          from: { opacity: "0", transform: "translateX(14px)" },
          to: { opacity: "1", transform: "none" },
        },
        piecNavBack: {
          from: { opacity: "0", transform: "translateX(-14px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        dotpulse: "dotpulse 1.8s ease-out infinite",
        "urgent-pulse": "urgentPulse 2.5s ease-in-out infinite",
        "pulse-new": "adminPulse 1.8s ease-out infinite",
        "piec-shimmer": "piecShimmer 1.6s ease-in-out infinite",
        "piec-bump": "piecCountBump 0.22s cubic-bezier(0.2, 0.8, 0.3, 1)",
        "piec-drift": "piecHeroDrift 26s ease-in-out infinite alternate",
        "piec-dot": "piecPulseDot 2.2s ease-out infinite",
        "piec-amber": "piecPulseAmber 1.8s ease-out infinite",
        "piec-fwd": "piecNavForward 0.19s cubic-bezier(0.2, 0.7, 0.3, 1) both",
        "piec-back": "piecNavBack 0.19s cubic-bezier(0.2, 0.7, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
