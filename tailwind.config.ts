import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#06070d",
        "ink-2": "#0a0c15",
        "ink-3": "#0e1119",
        panel: "rgba(255,255,255,0.03)",
        line: "rgba(255,255,255,0.08)",
        "line-strong": "rgba(255,255,255,0.14)",
        muted: "#9ba3b8",
        dim: "#6b7286",
        violet: "#a78bfa",
        cyan: "#67e8f9",
        magenta: "#f0abfc",
        mint: "#7ee2b8",
        amber: "#f2c46d",
        rose: "#f28b9b"
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 90px rgba(139,92,246,.28)",
        "glow-sm": "0 0 40px rgba(139,92,246,.18)",
        "glow-cyan": "0 0 70px rgba(34,211,238,.16)",
        card: "0 30px 90px rgba(0,0,0,.5)",
        "inner-line": "inset 0 1px 0 rgba(255,255,255,.06)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      keyframes: {
        "aurora-a": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(4vw,-3vh,0) scale(1.12)" }
        },
        "aurora-b": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1.05)" },
          "50%": { transform: "translate3d(-5vw,4vh,0) scale(.92)" }
        },
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
        "aurora-a": "aurora-a 16s ease-in-out infinite",
        "aurora-b": "aurora-b 20s ease-in-out infinite",
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
