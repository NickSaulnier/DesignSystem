import { converter, formatHex, wcagContrast, type Lch } from "culori";

const toLch = converter("lch");

/** Compute WCAG contrast ratio between two hex colors. */
export function contrast(foreground: string, background: string): number {
  return wcagContrast(foreground, background);
}

/**
 * Adjust foreground lightness in LCH space until WCAG contrast with background meets the target.
 * Hue and chroma are preserved. Returns the original hex if it already passes.
 *
 * `target`: 4.5 for AA on body text, 3.0 for AA large, 7.0 for AAA body.
 */
export function ensureContrast(foreground: string, background: string, target = 4.5): string {
  if (contrast(foreground, background) >= target) return foreground;

  const fg = toLch(foreground);
  const bg = toLch(background);
  if (!fg || !bg) return foreground;

  const bgIsLight = bg.l > 60;
  // If background is light, darken foreground (lower L). If dark, lighten foreground.
  const direction = bgIsLight ? -1 : 1;

  let best = foreground;
  let bestContrast = contrast(foreground, background);

  // Walk L in 2-point steps. 50 steps covers the full 0-100 range.
  for (let step = 1; step <= 50; step++) {
    const newL = Math.max(0, Math.min(100, fg.l + direction * step * 2));
    const candidate: Lch = { mode: "lch", l: newL, c: fg.c, h: fg.h };
    const hex = formatHex(candidate);
    const c = contrast(hex, background);
    if (c >= target) return hex;
    if (c > bestContrast) {
      best = hex;
      bestContrast = c;
    }
  }
  return best;
}

/** Convenience: ensure a body-text color (AA = 4.5:1) against a given background. */
export function ensureTextOnSurface(text: string, surface: string): string {
  return ensureContrast(text, surface, 4.5);
}
