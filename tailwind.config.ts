import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0c0e",
        "ink-2": "#111316",
        "ink-3": "#15171a",
        panel: "#15171a",
        line: "#262a30",
        "line-strong": "#343a42",
        muted: "#9aa3ad",
        dim: "#6b737d",
        // Primary action palette (green → cyan)
        lime: "#a3e635",
        green: "#4ade80",
        cyan: "#22d3ee",
        // Demoted accents (functional use only)
        violet: "#a3e635", /* legacy token name kept working = lime */
        magenta: "#e879f9",
        mint: "#7ee2b8",
        amber: "#f2c46d",
        rose: "#f28b9b"
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "sans-serif"]
      },
      boxShadow: {
        card: "0 12px 40px rgba(0,0,0,.35)",
        "inner-line": "inset 0 1px 0 rgba(255,255,255,.04)",
        btn: "0 4px 18px rgba(74,222,128,.18)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" }
        },
        pulseSoft: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: ".55" }
        }
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        "spin-slow": "spin-slow 14s linear infinite",
        shimmer: "shimmer 2.4s linear infinite",
        float: "float 7s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2.2s ease-in-out infinite"
      },
      transitionTimingFunction: {
        swift: "cubic-bezier(.22,1,.36,1)"
      }
    }
  },
  plugins: []
};

export default config;
