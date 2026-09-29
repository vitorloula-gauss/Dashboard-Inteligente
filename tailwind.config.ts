import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAF8", // --bg-paper
        foreground: "#0E1812", // --fg-1 (--ink-900)
        white: "#FFFFFF",
        gauss: {
          green: "#39B54A", // Mandatory brand token
          100: "#E6F5EA",
          300: "#8FD79A",
          700: "#2A8D38",
          900: "#1B5D24",
          dark: "#07100A", // --ink-1000
          lightGreen: "#E6F5EA",
          borderGreen: "#8FD79A"
        },
        ink: {
          50: "#F8FAF8",
          100: "#F1F3F1",
          200: "#E2E5E2",
          300: "#C2C7C3",
          400: "#969C97",
          500: "#6B736E",
          600: "#475149",
          700: "#2A332E",
          800: "#1A241E",
          900: "#0E1812",
          1000: "#07100A",
        },
        signal: {
          solar: "#F2B441",
          grid: "#2B6CFF",
          warn: "#D9534F",
          ok: "#39B54A",
        }
      },
      fontFamily: {
        sans: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        body: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        wordmark: ['var(--font-bebas)', 'Impact', 'sans-serif'],
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "14px",
        xl: "22px",
        pill: "999px",
      },
      boxShadow: {
        xs: "0 1px 0 rgba(7,16,10,0.04)",
        sm: "0 1px 2px rgba(7,16,10,0.06), 0 1px 1px rgba(7,16,10,0.04)",
        md: "0 6px 16px -4px rgba(7,16,10,0.10), 0 2px 4px rgba(7,16,10,0.04)",
        lg: "0 24px 48px -12px rgba(7,16,10,0.18)",
        glowGreen: "0 0 0 4px rgba(57,181,74,0.18)",
      }
    },
  },
  plugins: [],
};
export default config;