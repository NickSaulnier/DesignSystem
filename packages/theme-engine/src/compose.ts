import { converter, formatHex, clampChroma, type Lch } from "culori";
import {
  type BrandTheme,
  type ColorScale,
  defaultTheme,
} from "@nicksaulnier/design-system-tokens";
import { generateColorScale, generateNeutralScale } from "./color.js";
import { ensureTextOnSurface, contrast } from "./accessibility.js";
import { getFontPair } from "./fonts.js";
import { type Characteristics, type ThemeGenerationOutput } from "./schemas.js";

const toLch = converter("lch");

const RADIUS_PRESETS: Record<Characteristics["borderCharacter"], BrandTheme["border"]["radius"]> = {
  sharp:              { none: "0", sm: "0",       md: "0.125rem", lg: "0.25rem",  xl: "0.375rem", full: "9999px" },
  "slightly-rounded": { none: "0", sm: "0.25rem", md: "0.5rem",   lg: "0.75rem",  xl: "1rem",     full: "9999px" },
  rounded:            { none: "0", sm: "0.5rem",  md: "0.875rem", lg: "1.25rem",  xl: "1.75rem",  full: "9999px" },
  pill:               { none: "0", sm: "1rem",    md: "1.5rem",   lg: "2rem",     xl: "2.5rem",   full: "9999px" },
};

const MOTION_PRESETS: Record<Characteristics["motionCharacter"], BrandTheme["motion"]> = {
  snappy: {
    duration: { fast: "100ms", base: "180ms", slow: "280ms" },
    easing: {
      standard:   "cubic-bezier(0.4, 0, 0.2, 1)",
      decelerate: "cubic-bezier(0, 0, 0.2, 1)",
      accelerate: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },
  smooth: {
    duration: { fast: "180ms", base: "320ms", slow: "500ms" },
    easing: {
      standard:   "cubic-bezier(0.45, 0, 0.55, 1)",
      decelerate: "cubic-bezier(0.16, 1, 0.3, 1)",
      accelerate: "cubic-bezier(0.7, 0, 0.84, 0)",
    },
  },
  minimal: {
    duration: { fast: "80ms", base: "140ms", slow: "220ms" },
    easing: {
      standard:   "linear",
      decelerate: "ease-out",
      accelerate: "ease-in",
    },
  },
  expressive: {
    duration: { fast: "220ms", base: "400ms", slow: "650ms" },
    easing: {
      standard:   "cubic-bezier(0.34, 1.56, 0.64, 1)",
      decelerate: "cubic-bezier(0.22, 1, 0.36, 1)",
      accelerate: "cubic-bezier(0.55, 0, 1, 0.45)",
    },
  },
};

const SHADOW_PRESETS: Record<Characteristics["visualMood"], BrandTheme["shadow"]> = {
  minimal: {
    none: "none",
    sm:   "0 1px 1px 0 rgb(0 0 0 / 0.03)",
    base: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md:   "0 2px 4px -1px rgb(0 0 0 / 0.06)",
    lg:   "0 4px 8px -2px rgb(0 0 0 / 0.08)",
    xl:   "0 8px 16px -4px rgb(0 0 0 / 0.10)",
  },
  structured: {
    none: "none",
    sm:   "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base: "0 1px 3px 0 rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.10)",
    md:   "0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.10)",
    lg:   "0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.10)",
    xl:   "0 20px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.10)",
  },
  expressive: {
    none: "none",
    sm:   "0 2px 4px 0 rgb(0 0 0 / 0.08)",
    base: "0 4px 8px -2px rgb(0 0 0 / 0.12), 0 2px 4px -2px rgb(0 0 0 / 0.10)",
    md:   "0 8px 16px -4px rgb(0 0 0 / 0.14), 0 4px 8px -4px rgb(0 0 0 / 0.10)",
    lg:   "0 16px 32px -8px rgb(0 0 0 / 0.18), 0 8px 16px -8px rgb(0 0 0 / 0.12)",
    xl:   "0 32px 64px -16px rgb(0 0 0 / 0.24), 0 16px 32px -16px rgb(0 0 0 / 0.14)",
  },
  organic: {
    none: "none",
    sm:   "0 2px 6px 0 rgb(0 0 0 / 0.06)",
    base: "0 4px 12px -2px rgb(0 0 0 / 0.10)",
    md:   "0 8px 24px -4px rgb(0 0 0 / 0.12)",
    lg:   "0 16px 40px -8px rgb(0 0 0 / 0.16)",
    xl:   "0 24px 56px -12px rgb(0 0 0 / 0.20)",
  },
};

function pickSurfaces(neutral: ColorScale): BrandTheme["color"]["surface"] {
  return {
    base:    "#ffffff",
    raised:  neutral[50],
    overlay: neutral[100],
  };
}

function pickTextColors(neutral: ColorScale, surface: string): BrandTheme["color"]["text"] {
  return {
    primary:   ensureTextOnSurface(neutral[950], surface),
    secondary: ensureTextOnSurface(neutral[700], surface),
    muted:     ensureTextOnSurface(neutral[500], surface),
    inverse:   neutral[50],
  };
}

/** Adjust semantic colors so each meets WCAG AA against a white surface. */
function fixSemanticContrast(
  semantic: { success: string; warning: string; error: string; info: string },
  surface: string,
): { fixed: typeof semantic; adjustments: string[] } {
  const adjustments: string[] = [];
  const fixed = { ...semantic };
  for (const key of ["success", "warning", "error", "info"] as const) {
    const before = fixed[key];
    const after  = ensureTextOnSurface(before, surface);
    if (after.toLowerCase() !== before.toLowerCase()) {
      adjustments.push(`semantic.${key}: ${before} → ${after} (contrast was ${contrast(before, surface).toFixed(2)})`);
    }
    fixed[key] = after;
  }
  return { fixed, adjustments };
}

export interface ComposeResult {
  theme:       BrandTheme;
  /** Notes about contrast adjustments that were made. */
  adjustments: string[];
}

/**
 * Compose a full BrandTheme from Claude's brand-level output.
 *
 * Steps:
 * 1. Expand primary/secondary seeds into 11-stop scales via LCH.
 * 2. Generate a neutral scale with the requested hue cast.
 * 3. Derive surface + text colors from the neutral scale, ensuring WCAG AA contrast.
 * 4. Fix any semantic colors that fail contrast against the base surface.
 * 5. Map characteristics → radius, motion, shadow tokens via presets.
 * 6. Look up the font pair by ID.
 */
export function composeTheme(output: ThemeGenerationOutput): ComposeResult {
  const adjustments: string[] = [];

  const primary   = generateColorScale(output.colors.primarySeedHex);
  const secondary = generateColorScale(output.colors.secondarySeedHex);

  const neutralSeed =
    output.colors.neutralCast === "warm" ? "#a8a29e"
    : output.colors.neutralCast === "cool" ? "#71717a"
    : undefined;
  const neutral = generateNeutralScale(neutralSeed);

  const surface = pickSurfaces(neutral);
  const text    = pickTextColors(neutral, surface.base);

  const { fixed: semantic, adjustments: semAdjustments } = fixSemanticContrast(
    output.colors.semantic,
    surface.base,
  );
  adjustments.push(...semAdjustments);

  // Verify primary 500 contrasts well against white text (button readability).
  const primary500 = primary[500];
  if (contrast("#ffffff", primary500) < 3.5) {
    adjustments.push(
      `primary.500 (${primary500}) has low contrast vs white text (${contrast("#ffffff", primary500).toFixed(2)}). Consider a darker seed.`,
    );
  }

  const fontPair = getFontPair(output.typography.fontPairId);

  const theme: BrandTheme = {
    mode: "light",
    identity: {
      name:        output.brand.name,
      description: output.brand.description,
      personality: output.brand.personality,
    },
    color: {
      primary,
      secondary,
      neutral,
      semantic,
      surface,
      text,
    },
    typography: {
      fontFamily: {
        heading: fontPair.heading,
        body:    fontPair.body,
        mono:    fontPair.mono,
      },
      scale:         defaultTheme.typography.scale,
      weight:        defaultTheme.typography.weight,
      lineHeight:    defaultTheme.typography.lineHeight,
      letterSpacing: defaultTheme.typography.letterSpacing,
    },
    spacing: defaultTheme.spacing,
    border: {
      radius: RADIUS_PRESETS[output.characteristics.borderCharacter],
      width:  defaultTheme.border.width,
    },
    shadow: SHADOW_PRESETS[output.characteristics.visualMood],
    motion: MOTION_PRESETS[output.characteristics.motionCharacter],
  };

  return { theme, adjustments };
}

/**
 * Derive a dark-mode counterpart to a light theme.
 *
 * Approach:
 * - Reverse the 11-stop scales for primary/secondary/neutral so step 50 becomes the
 *   darkest tone and step 950 becomes the lightest. Step 500 (the brand mid-tone) is
 *   preserved. This keeps semantic step mapping intact: `primary-100` always reads as
 *   "very close to the current surface", `primary-900` as "strong contrast".
 * - If the primary/secondary seed is already very dark (LCH L < 35), brighten it to
 *   ~L 60 before regenerating its scale. Otherwise primary buttons in dark mode would
 *   sink into the background.
 * - Surfaces pull from the reversed neutral's low steps; text from the high steps.
 * - Semantic colors are re-contrasted against the new dark surface (typically lightened).
 *
 * Pure function — does not mutate the input theme.
 */
export function deriveDarkVariant(light: BrandTheme): BrandTheme {
  const primary   = scaleForDarkMode(light.color.primary);
  const secondary = scaleForDarkMode(light.color.secondary);
  const neutral   = reverseColorScale(light.color.neutral);

  const surface: BrandTheme["color"]["surface"] = {
    base:    neutral[50],
    raised:  neutral[100],
    overlay: neutral[200],
  };

  const text: BrandTheme["color"]["text"] = {
    primary:   ensureTextOnSurface(neutral[950], surface.base),
    secondary: ensureTextOnSurface(neutral[800], surface.base),
    muted:     ensureTextOnSurface(neutral[600], surface.base),
    inverse:   neutral[50],
  };

  const { fixed: semantic } = fixSemanticContrast(light.color.semantic, surface.base);

  return {
    ...light,
    mode: "dark",
    color: {
      ...light.color,
      primary,
      secondary,
      neutral,
      semantic,
      surface,
      text,
    },
  };
}

function reverseColorScale(scale: ColorScale): ColorScale {
  return {
    50:  scale[950],
    100: scale[900],
    200: scale[800],
    300: scale[700],
    400: scale[600],
    500: scale[500],
    600: scale[400],
    700: scale[300],
    800: scale[200],
    900: scale[100],
    950: scale[50],
  };
}

/**
 * Produce the dark-mode counterpart of an accent scale.
 * If the seed (step 500) is already dark, regenerate from a brightened seed first;
 * otherwise just reverse the existing scale.
 */
function scaleForDarkMode(lightScale: ColorScale): ColorScale {
  const seed = toLch(lightScale[500]);
  if (seed && typeof seed.l === "number" && seed.l < 35) {
    const brightened: Lch = { mode: "lch", l: 60, c: seed.c, h: seed.h ?? 0 };
    const newSeedHex = formatHex(clampChroma(brightened, "lch"));
    return reverseColorScale(generateColorScale(newSeedHex));
  }
  return reverseColorScale(lightScale);
}
