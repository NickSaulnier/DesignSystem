import type { BrandTheme } from "./schema.js";

export const defaultTheme: BrandTheme = {
  identity: {
    name: "Default",
    description: "Neutral baseline theme — calm, accessible, professional.",
    personality: ["clean", "professional", "accessible", "modern"],
  },

  color: {
    primary: {
      50:  "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },
    secondary: {
      50:  "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
      950: "#2e1065",
    },
    neutral: {
      50:  "#fafafa",
      100: "#f4f4f5",
      200: "#e4e4e7",
      300: "#d4d4d8",
      400: "#a1a1aa",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
      950: "#09090b",
    },
    semantic: {
      success: "#16a34a",
      warning: "#d97706",
      error:   "#dc2626",
      info:    "#0284c7",
    },
    surface: {
      base:    "#ffffff",
      raised:  "#fafafa",
      overlay: "#f4f4f5",
    },
    text: {
      primary:   "#18181b",
      secondary: "#3f3f46",
      muted:     "#71717a",
      inverse:   "#fafafa",
    },
  },

  typography: {
    fontFamily: {
      heading: "'Inter', system-ui, -apple-system, sans-serif",
      body:    "'Inter', system-ui, -apple-system, sans-serif",
      mono:    "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
    },
    scale: {
      xs:    { size: "0.75rem",  lineHeight: "1rem"     },
      sm:    { size: "0.875rem", lineHeight: "1.25rem"  },
      base:  { size: "1rem",     lineHeight: "1.5rem"   },
      lg:    { size: "1.125rem", lineHeight: "1.75rem"  },
      xl:    { size: "1.25rem",  lineHeight: "1.75rem"  },
      "2xl": { size: "1.5rem",   lineHeight: "2rem"     },
      "3xl": { size: "1.875rem", lineHeight: "2.25rem"  },
      "4xl": { size: "2.25rem",  lineHeight: "2.5rem"   },
      "5xl": { size: "3rem",     lineHeight: "1"        },
    },
    weight: {
      normal: 400,
      medium: 500,
      bold:   700,
    },
    lineHeight: {
      tight:   1.2,
      base:    1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight:  "-0.025em",
      normal: "0",
      wide:   "0.025em",
    },
  },

  spacing: {
    base: 4,
    scale: {
      xs:    "0.25rem",
      sm:    "0.5rem",
      md:    "1rem",
      lg:    "1.5rem",
      xl:    "2rem",
      "2xl": "3rem",
      "3xl": "4rem",
    },
  },

  border: {
    radius: {
      none: "0",
      sm:   "0.25rem",
      md:   "0.5rem",
      lg:   "0.75rem",
      xl:   "1rem",
      full: "9999px",
    },
    width: {
      thin:  "1px",
      base:  "1px",
      thick: "2px",
    },
  },

  shadow: {
    none: "none",
    sm:   "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md:   "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg:   "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl:   "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },

  motion: {
    duration: {
      fast: "150ms",
      base: "250ms",
      slow: "400ms",
    },
    easing: {
      standard:   "cubic-bezier(0.4, 0, 0.2, 1)",
      decelerate: "cubic-bezier(0, 0, 0.2, 1)",
      accelerate: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },
};
