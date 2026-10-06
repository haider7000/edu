/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },

        secondary: {
          DEFAULT: "#0F172A",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },

        accent: {
          DEFAULT: "#7C3AED",
          light: "#8B5CF6",
          dark: "#6D28D9",
        },

        success: "#22C55E",

        bg: "#050508",
        "bg-secondary": "#0A0A0F",
        "bg-tertiary": "#111118",

        "text-primary": "#F8FAFC",
        "text-secondary": "#CBD5E1",
        "text-muted": "#94A3B8",

        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },

      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],

        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },

      boxShadow: {
        glow: "0 0 40px rgba(37, 99, 235, 0.18)",
        "glow-strong": "0 0 70px rgba(37, 99, 235, 0.25)",
        "glow-purple": "0 0 50px rgba(124, 58, 237, 0.18)",
      },

      backgroundImage: {
        "hero-grid":
          "linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)",
      },

      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        pulseSoft: "pulseSoft 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },

      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-12px)",
          },
        },

        pulseSoft: {
          "0%, 100%": {
            opacity: "0.5",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.15)",
          },
        },

        shimmer: {
          "0%": {
            backgroundPosition: "-200% center",
          },
          "100%": {
            backgroundPosition: "200% center",
          },
        },
      },

      borderRadius: {
        "4xl": "2rem",
      },
    },
  },

  plugins: [],
};