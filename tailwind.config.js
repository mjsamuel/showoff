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
  safelist: [{ pattern: /rotate-./ }],
  theme: {
    extend: {
      spacing: {
        160: "40rem",
      },
    },
  },
  plugins: [],
};
