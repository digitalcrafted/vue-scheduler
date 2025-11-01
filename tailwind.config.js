/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  // Don't include base styles to avoid global resets when imported
  corePlugins: {
    preflight: false, // Disable Tailwind's base/reset styles
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
