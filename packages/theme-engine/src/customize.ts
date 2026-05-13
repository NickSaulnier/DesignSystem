import { type BrandTheme } from "@nicksaulnier/design-system-tokens";
import { generateColorScale, generateNeutralScale } from "./color.js";
import { ensureTextOnSurface, contrast } from "./accessibility.js";
import { FONT_PAIRS, getFontPair, type FontPair } from "./fonts.js";

export type NeutralCast      = "warm" | "cool" | "pure";
export type BorderCharacter  = "sharp" | "slightly-rounded" | "rounded" | "pill";
export type VisualMood       = "minimal" | "structured" | "expressive" | "organic";
export type MotionCharacter  = "snappy" | "smooth" | "minimal" | "expressive";

/**
 * Subset of `BrandTheme` that callers can edit directly. Each field is optional —
 * `applyTokenEdits` only touches what's provided.
 */
export interface TokenEdits {
  primarySeed?:     string;
  secondarySeed?:   string;
  neutralCast?:     NeutralCast;
  semanticSuccess?: string;
  semanticWarning?: string;
  semanticError?:   string;
  semanticInfo?:    string;
  borderCharacter?: BorderCharacter;
  visualMood?:      VisualMood;
  motionCharacter?: MotionCharacter;
  fontPairId?:      string;
}

/**
 * Static preset tables — kept in sync with `compose.ts`. Pulling them out as
 * named exports lets the Studio (and any other client) introspect available
 * choices for select inputs, and lets `applyTokenEdits` apply them locally
 * without re-running Claude.
 */
export const RADIUS_PRESETS: Record<BorderCharacter, BrandTheme["border"]["radius"]> = {
  sharp:              { none: "0", sm: "0",       md: "0.125rem", lg: "0.25rem",  xl: "0.375rem", full: "9999px" },
  "slightly-rounded": { none: "0", sm: "0.25rem", md: "0.5rem",   lg: "0.75rem",  xl: "1rem",     full: "9999px" },
  rounded:            { none: "0", sm: "0.5rem",  md: "0.875rem", lg: "1.25rem",  xl: "1.75rem",  full: "9999px" },
  pill:               { none: "0", sm: "1rem",    md: "1.5rem",   lg: "2rem",     xl: "2.5rem",   full: "9999px" },
};

export const SHADOW_PRESETS: Record<VisualMood, BrandTheme["shadow"]> = {
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

export const MOTION_PRESETS: Record<MotionCharacter, BrandTheme["motion"]> = {
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

const NEUTRAL_CAST_SEEDS: Record<NeutralCast, string | undefined> = {
  warm: "#a8a29e",
  cool: "#71717a",
  pure: undefined,
};

export interface EditableSnapshot {
  primarySeed:     string;
  secondarySeed:   string;
  neutralCast:     NeutralCast | "unknown";
  semanticSuccess: string;
  semanticWarning: string;
  semanticError:   string;
  semanticInfo:    string;
  borderCharacter: BorderCharacter | "unknown";
  visualMood:      VisualMood      | "unknown";
  motionCharacter: MotionCharacter | "unknown";
  fontPairId:      string | "unknown";
}

/**
 * Extract a best-guess set of editable inputs from a fully-composed theme.
 * Used by the Studio's settings panel to populate its inputs on open.
 *
 * Color seeds round-trip exactly because `generateColorScale` writes the seed
 * into step 500. Characteristic enums and font pairs are inferred by matching
 * against the preset tables; if no match is found, `"unknown"` is returned and
 * the corresponding input renders empty until the user makes a selection.
 */
export function extractEditableSnapshot(theme: BrandTheme): EditableSnapshot {
  return {
    primarySeed:     theme.color.primary[500],
    secondarySeed:   theme.color.secondary[500],
    neutralCast:     inferNeutralCast(theme),
    semanticSuccess: theme.color.semantic.success,
    semanticWarning: theme.color.semantic.warning,
    semanticError:   theme.color.semantic.error,
    semanticInfo:    theme.color.semantic.info,
    borderCharacter: matchKey(RADIUS_PRESETS, theme.border.radius) as BorderCharacter | "unknown",
    visualMood:      matchKey(SHADOW_PRESETS, theme.shadow)        as VisualMood      | "unknown",
    motionCharacter: matchKey(MOTION_PRESETS, theme.motion)        as MotionCharacter | "unknown",
    fontPairId:      inferFontPairId(theme.typography.fontFamily.heading, theme.typography.fontFamily.body),
  };
}

/**
 * Apply a set of user edits to a base theme. Each provided field regenerates
 * the corresponding token group locally — no Claude call. Surfaces and text
 * colors are re-derived (and re-contrasted) when the neutral scale changes.
 */
export function applyTokenEdits(base: BrandTheme, edits: TokenEdits): BrandTheme {
  let primary   = base.color.primary;
  let secondary = base.color.secondary;
  let neutral   = base.color.neutral;
  let semantic  = { ...base.color.semantic };
  let surface   = { ...base.color.surface };
  let text      = { ...base.color.text };
  let radius    = base.border.radius;
  let shadow    = base.shadow;
  let motion    = base.motion;
  let fonts     = { ...base.typography.fontFamily };

  if (edits.primarySeed)   primary   = generateColorScale(edits.primarySeed);
  if (edits.secondarySeed) secondary = generateColorScale(edits.secondarySeed);

  let neutralChanged = false;
  if (edits.neutralCast) {
    neutral = generateNeutralScale(NEUTRAL_CAST_SEEDS[edits.neutralCast]);
    neutralChanged = true;
  }

  if (edits.semanticSuccess) semantic.success = edits.semanticSuccess;
  if (edits.semanticWarning) semantic.warning = edits.semanticWarning;
  if (edits.semanticError)   semantic.error   = edits.semanticError;
  if (edits.semanticInfo)    semantic.info    = edits.semanticInfo;

  // If the neutral scale was regenerated, surfaces and text need to be
  // re-derived from it (in light mode they come from neutral[50]/[100]).
  if (neutralChanged) {
    surface = {
      base:    "#ffffff",
      raised:  neutral[50],
      overlay: neutral[100],
    };
    text = {
      primary:   ensureTextOnSurface(neutral[950], surface.base),
      secondary: ensureTextOnSurface(neutral[700], surface.base),
      muted:     ensureTextOnSurface(neutral[500], surface.base),
      inverse:   neutral[50],
    };
  }

  // Re-contrast any semantic colors that were edited against the (possibly new)
  // surface — keep WCAG AA guarantees intact under user edits.
  if (
    edits.semanticSuccess || edits.semanticWarning ||
    edits.semanticError   || edits.semanticInfo   || neutralChanged
  ) {
    for (const key of ["success", "warning", "error", "info"] as const) {
      const before = semantic[key];
      const after  = ensureTextOnSurface(before, surface.base);
      semantic[key] = after;
    }
  }

  if (edits.borderCharacter) radius = RADIUS_PRESETS[edits.borderCharacter];
  if (edits.visualMood)      shadow = SHADOW_PRESETS[edits.visualMood];
  if (edits.motionCharacter) motion = MOTION_PRESETS[edits.motionCharacter];

  if (edits.fontPairId) {
    const pair = getFontPair(edits.fontPairId);
    fonts = {
      heading: pair.heading,
      body:    pair.body,
      mono:    pair.mono,
    };
  }

  return {
    ...base,
    color: { ...base.color, primary, secondary, neutral, semantic, surface, text },
    border: { ...base.border, radius },
    shadow,
    motion,
    typography: { ...base.typography, fontFamily: fonts },
  };
}

// ----- Inference helpers ----------------------------------------------------

function inferNeutralCast(theme: BrandTheme): NeutralCast | "unknown" {
  // Compare the 500 step against the known cast seeds. Approximate match — a
  // small color distance is enough since `generateNeutralScale` only quantizes
  // chroma/lightness, hue is preserved.
  const sample = theme.color.neutral[500].toLowerCase();
  for (const cast of ["warm", "cool", "pure"] as NeutralCast[]) {
    const seed = NEUTRAL_CAST_SEEDS[cast];
    const probe = generateNeutralScale(seed);
    if (probe[500].toLowerCase() === sample) return cast;
  }
  return "unknown";
}

function inferFontPairId(heading: string, body: string): string | "unknown" {
  const pair = FONT_PAIRS.find(
    (p: FontPair) => p.heading === heading && p.body === body,
  );
  return pair ? pair.id : "unknown";
}

function matchKey<T extends Record<string, unknown>>(
  table: T,
  target: T[keyof T],
): keyof T | "unknown" {
  for (const key of Object.keys(table) as (keyof T)[]) {
    if (deepEqual(table[key], target)) return key;
  }
  return "unknown";
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) =>
    deepEqual(
      (a as Record<string, unknown>)[k],
      (b as Record<string, unknown>)[k],
    ),
  );
}

// Unused but kept for `contrast()` parity with compose.ts (eslint won't complain
// when this file is consumed standalone).
void contrast;
