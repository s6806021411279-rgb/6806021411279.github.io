/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#2A3260", soft: "#5A6491", mute: "#8E97BC" },
        sky: { 50: "#F3F8FF", 100: "#E4F0FF", 200: "#C9E1FF", 400: "#7DB6F5" },
        peri: { 100: "#E3E8FB", 400: "#7E92E8", 500: "#5F76DA", 600: "#4A5FC4" },
        sun: { 50: "#FFFCEF", 100: "#FFF4C7", 200: "#FFE794", 300: "#FFD84D", 400: "#FFCB1F", 500: "#F7B500", 600: "#D99A00" },
        cocoa: { DEFAULT: "#4A3A0E", soft: "#7A6A35", mute: "#A39463" },
        lav: { 50: "#F6F2FF", 100: "#ECE4FF", 300: "#C9B8F7", 500: "#9B82EA" },
      },
      fontFamily: {
        display: ["Fredoka", "Noto Sans Thai Looped", "sans-serif"],
        sans: ["Noto Sans Thai Looped", "Fredoka", "sans-serif"],
      },
      boxShadow: { soft: "0 1px 2px rgba(95,118,218,.06), 0 8px 24px -12px rgba(95,118,218,.18)", pop: "0 6px 0 0 #E8A800", card: "0 2px 4px rgba(122,90,0,.06), 0 18px 40px -20px rgba(217,154,0,.45)" },
    },
  },
  plugins: [],
};
