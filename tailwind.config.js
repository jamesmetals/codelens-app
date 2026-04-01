/** @type {import("tailwindcss").Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        zinc: {
          950: "#09090b",
          900: "#18181b",
          800: "#27272a",
          700: "#3f3f46",
          600: "#52525b",
          500: "#71717a",
          400: "#a1a1aa",
          300: "#d4d4d8",
          200: "#e4e4e7",
          100: "#f4f4f5",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
      },
      borderRadius: {
        "app-sm": "8px",
        "app-md": "12px",
        "app-lg": "16px",
        "app-xl": "20px",
        "app-2xl": "24px",
      },
      boxShadow: {
        "app-sm": "0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.08)",
        "app-md": "0 4px 12px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)",
        "app-lg": "0 12px 28px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
      },
      transitionDuration: {
        150: "150ms",
        250: "250ms",
        350: "350ms",
      },
    },
  },
  plugins: [],
};
