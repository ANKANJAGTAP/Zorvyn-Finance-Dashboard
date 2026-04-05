/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Intercepting core primitives to allow automatic inversion system-wide
        white: "rgb(var(--core-white) / <alpha-value>)",
        
        bg: {
          main: "rgb(var(--bg-main) / <alpha-value>)",
          section: "rgb(var(--bg-section) / <alpha-value>)",
          glass: "rgba(var(--bg-main), 0.5)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
        },
        primary: "#427CF0",
        accent: {
          green: "#22C38E",
          purple: "#855CD6",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
        success: "#22C38E",
        danger: "#EF4444",
        warning: "#F59E0B",
        card: {
          bg: "rgba(11,17,30,0.5)",
          border: "rgba(var(--core-white), 0.1)",
          "border-hover": "rgba(var(--core-white), 0.2)",
        },
        glow: {
          blue: "rgba(66,124,240,0.2)",
          green: "rgba(34,195,142,0.15)",
          purple: "rgba(133,92,214,0.1)",
        },
        border: {
          dim: "rgb(var(--core-white) / 0.06)",
        }
      },
      backgroundImage: {
        "gradient-main": "linear-gradient(135deg, #427CF0, #855CD6, #22C38E)",
        "gradient-blue": "linear-gradient(135deg, #427CF0, #22C38E)",
        "gradient-purple": "linear-gradient(135deg, #855CD6, #EC4899)",
      },
    },
  },
  plugins: [],
}
