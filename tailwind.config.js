/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          main: "#080C16",
          section: "#252B37",
          glass: "rgba(8,12,22,0.5)",
        },
        primary: "#427CF0",
        accent: {
          green: "#22C38E",
          purple: "#855CD6",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#9DA3AF",
          muted: "rgba(157,163,175,0.7)",
        },
        success: "#22C38E",
        danger: "#EF4444",
        warning: "#F59E0B",
        card: {
          bg: "rgba(11,17,30,0.5)",
          border: "rgba(255,255,255,0.1)",
          "border-hover": "rgba(255,255,255,0.2)",
        },
        glow: {
          blue: "rgba(66,124,240,0.2)",
          green: "rgba(34,195,142,0.15)",
          purple: "rgba(133,92,214,0.1)",
        },
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
