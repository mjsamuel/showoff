/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": {
            opacity: 0,
            transform: "translateY(4px) scale(0.95)",
          },
          "100%": {
            opacity: 100,
            transform: "translateY(0) scale(1)",
          },
        },
      },
      animation: {
        "fade-in": "fade-in 300ms ease-out",
      },
    },
  },
  plugins: [],
};
