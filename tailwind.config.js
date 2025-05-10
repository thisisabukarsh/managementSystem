/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          light: "#3b82f6",
        },
        secondary: {
          DEFAULT: "#c0c0c0", // Silver/metallic secondary color
          light: "#d9d9d9",
          dark: "#a6a6a6",
        },
        accent: {
          DEFAULT: "#ffd700", // Gold accent color
          light: "#ffe033",
          dark: "#ccac00",
        },
        success: {
          DEFAULT: "#22c55e",
          light: "#86efac",
          dark: "#15803d",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fcd34d",
          dark: "#b45309",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#fca5a5",
          dark: "#b91c1c",
        },
      },
      fontFamily: {
        sans: ["Tajawal", "sans-serif"],
        heading: ["Cairo", "sans-serif"],
      },
      boxShadow: {
        elegant:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        card: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
