import type { BrandTheme } from "../schema.js";

/**
 * Convert a BrandTheme into an object suitable for spreading into the
 * `theme.extend` slot of a `tailwind.config.js` file.
 *
 * Returns a plain JS object. The caller chooses how to serialize it
 * (e.g. wrap in `module.exports = { theme: { extend: ... } }`).
 */
export function themeToTailwindConfig(theme: BrandTheme): Record<string, unknown> {
  return {
    colors: {
      primary:   { ...theme.color.primary },
      secondary: { ...theme.color.secondary },
      neutral:   { ...theme.color.neutral },
      success:   theme.color.semantic.success,
      warning:   theme.color.semantic.warning,
      error:     theme.color.semantic.error,
      info:      theme.color.semantic.info,
      surface: {
        base:    theme.color.surface.base,
        raised:  theme.color.surface.raised,
        overlay: theme.color.surface.overlay,
      },
      text: {
        primary:   theme.color.text.primary,
        secondary: theme.color.text.secondary,
        muted:     theme.color.text.muted,
        inverse:   theme.color.text.inverse,
      },
    },

    fontFamily: {
      heading: splitFontStack(theme.typography.fontFamily.heading),
      body:    splitFontStack(theme.typography.fontFamily.body),
      mono:    splitFontStack(theme.typography.fontFamily.mono),
    },

    fontSize: Object.fromEntries(
      Object.entries(theme.typography.scale).map(([step, { size, lineHeight }]) => [
        step,
        [size, { lineHeight: String(lineHeight) }],
      ]),
    ),

    fontWeight: {
      normal: String(theme.typography.weight.normal),
      medium: String(theme.typography.weight.medium),
      bold:   String(theme.typography.weight.bold),
    },

    lineHeight: {
      tight:   String(theme.typography.lineHeight.tight),
      base:    String(theme.typography.lineHeight.base),
      relaxed: String(theme.typography.lineHeight.relaxed),
    },

    letterSpacing: {
      tight:  theme.typography.letterSpacing.tight,
      normal: theme.typography.letterSpacing.normal,
      wide:   theme.typography.letterSpacing.wide,
    },

    spacing: { ...theme.spacing.scale },

    borderRadius: { ...theme.border.radius },

    borderWidth: {
      thin:  theme.border.width.thin,
      DEFAULT: theme.border.width.base,
      thick: theme.border.width.thick,
    },

    boxShadow: { ...theme.shadow },

    transitionDuration: {
      fast: theme.motion.duration.fast,
      DEFAULT: theme.motion.duration.base,
      slow: theme.motion.duration.slow,
    },

    transitionTimingFunction: {
      standard:   theme.motion.easing.standard,
      decelerate: theme.motion.easing.decelerate,
      accelerate: theme.motion.easing.accelerate,
    },
  };
}

/**
 * Serialize a Tailwind config object as a complete, drop-in `tailwind.config.js` file.
 * Output is valid CommonJS.
 */
export function themeToTailwindConfigString(theme: BrandTheme): string {
  const config = themeToTailwindConfig(theme);
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: ${stringify(config, 4)}
  },
  plugins: [],
};
`;
}

function splitFontStack(stack: string): string[] {
  return stack.split(",").map((s) => s.trim()).filter(Boolean);
}

function stringify(value: unknown, indent: number, currentDepth = 1): string {
  const pad     = " ".repeat(indent * currentDepth);
  const padPrev = " ".repeat(indent * (currentDepth - 1));

  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    const items = value.map((v) => stringify(v, indent, currentDepth + 1));
    return `[${items.join(", ")}]`;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";
  const lines = entries.map(
    ([k, v]) => `${pad}${quoteKey(k)}: ${stringify(v, indent, currentDepth + 1)}`,
  );
  return `{\n${lines.join(",\n")}\n${padPrev}}`;
}

function quoteKey(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}
