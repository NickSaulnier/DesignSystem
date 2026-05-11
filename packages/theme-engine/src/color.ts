import { converter, formatHex, clampChroma, type Lch } from "culori";
import type { ColorScale } from "@design-system/tokens";

const toLch = converter("lch");

const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const LIGHTNESS = [97, 94, 87, 76, 63, 0, 46, 37, 28, 19, 12]; // index 5 replaced with seed L
const CHROMA_FACTORS = [0.18, 0.30, 0.55, 0.78, 0.95, 1.0, 1.05, 1.0, 0.86, 0.66, 0.50];

/**
 * Generate an 11-stop color scale from a single seed hex.
 *
 * Lightness sweeps from ~97 (50) to ~12 (950) on the LCH L axis (perceptually uniform).
 * Chroma peaks near the seed and falls off toward both ends — prevents muddy lights
 * and overly grey darks.
 *
 * The seed defines stop 500. Hue is preserved across all stops.
 */
export function generateColorScale(seedHex: string): ColorScale {
  const seed = toLch(seedHex);
  if (!seed) throw new Error(`Invalid hex color: ${seedHex}`);

  const baseL = seed.l;
  const baseC = seed.c;
  const hue   = seed.h ?? 0;

  const scale: Partial<Record<(typeof STOPS)[number], string>> = {};

  for (let i = 0; i < STOPS.length; i++) {
    const stop = STOPS[i]!;
    const L = i === 5 ? baseL : LIGHTNESS[i]!;
    const C = baseC * CHROMA_FACTORS[i]!;

    const target: Lch = { mode: "lch", l: L, c: C, h: hue };
    // Clamp chroma into the displayable sRGB gamut so we don't emit out-of-gamut colors.
    const inGamut = clampChroma(target, "lch");
    scale[stop] = formatHex(inGamut);
  }

  return scale as ColorScale;
}

/**
 * Generate a neutral (low-chroma) scale. If a seed is provided, the scale picks up
 * a subtle hue cast from it — otherwise pure greyscale.
 */
export function generateNeutralScale(seedHex?: string): ColorScale {
  if (!seedHex) {
    // Pure grey scale anchored on standard Tailwind-ish zinc values.
    const greys = ["#fafafa","#f4f4f5","#e4e4e7","#d4d4d8","#a1a1aa","#71717a","#52525b","#3f3f46","#27272a","#18181b","#09090b"];
    const scale: Partial<Record<(typeof STOPS)[number], string>> = {};
    STOPS.forEach((stop, i) => { scale[stop] = greys[i]!; });
    return scale as ColorScale;
  }

  const seed = toLch(seedHex);
  if (!seed) throw new Error(`Invalid hex color: ${seedHex}`);
  const hue = seed.h ?? 0;

  // Low-chroma scale tinted with the seed's hue.
  const lightness = [98, 96, 90, 82, 64, 46, 36, 28, 20, 14, 8];
  const chroma    = [1, 2, 3, 4, 4, 4, 4, 3, 3, 2, 2];

  const scale: Partial<Record<(typeof STOPS)[number], string>> = {};
  STOPS.forEach((stop, i) => {
    const target: Lch = { mode: "lch", l: lightness[i]!, c: chroma[i]!, h: hue };
    scale[stop] = formatHex(clampChroma(target, "lch"));
  });
  return scale as ColorScale;
}
