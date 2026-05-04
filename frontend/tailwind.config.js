/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A1628",
        electric: "#2563EB",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        surface: "#F8FAFC"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 16px 40px rgba(10, 22, 40, 0.08)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(32px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up 240ms ease-out",
        "slide-in": "slide-in 220ms ease-out",
      }
    },
  },
  plugins: [],
};
