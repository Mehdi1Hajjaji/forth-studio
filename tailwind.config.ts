import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#050B1A",
        surface: "#111827",
        "surface-muted": "#1F2937",
        accent: {
          DEFAULT: "#6366F1",
          foreground: "#F5F3FF",
        },
        success: "#22C55E",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 45px -25px rgba(99, 102, 241, 0.45)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top, rgba(99, 102, 241, 0.4), transparent 55%)",
      },
    },
  },
  plugins: [],
};

export default config;
