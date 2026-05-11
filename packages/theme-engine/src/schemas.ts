import { z } from "zod/v4";
import { FONT_PAIR_IDS } from "./fonts.js";

// Hex colors are kept as plain strings — structured outputs strips regex constraints,
// so we validate format with Zod *after* the API call.
const Hex = z.string();

export const BrandSchema = z.object({
  name:        z.string(),
  description: z.string(),
  personality: z.array(z.string()),
});

export const CharacteristicsSchema = z.object({
  toneOfVoice:     z.enum(["formal", "conversational", "playful", "authoritative"]),
  visualMood:      z.enum(["minimal", "expressive", "structured", "organic"]),
  motionCharacter: z.enum(["snappy", "smooth", "minimal", "expressive"]),
  borderCharacter: z.enum(["sharp", "slightly-rounded", "rounded", "pill"]),
});

export const ColorsSchema = z.object({
  primarySeedHex:   Hex,
  secondarySeedHex: Hex,
  neutralCast:      z.enum(["warm", "cool", "pure"]),
  semantic: z.object({
    success: Hex,
    warning: Hex,
    error:   Hex,
    info:    Hex,
  }),
  rationale: z.string(),
});

export const TypographySchema = z.object({
  fontPairId: z.enum(FONT_PAIR_IDS as unknown as [string, ...string[]]),
});

/**
 * The single Claude API call returns this structure.
 * Color scales, surface/text colors, spacing, radius, shadow, motion are derived
 * locally from these brand-level decisions.
 */
export const ThemeGenerationSchema = z.object({
  brand:           BrandSchema,
  characteristics: CharacteristicsSchema,
  colors:          ColorsSchema,
  typography:      TypographySchema,
});

export type ThemeGenerationOutput = z.infer<typeof ThemeGenerationSchema>;
export type Brand                 = z.infer<typeof BrandSchema>;
export type Characteristics       = z.infer<typeof CharacteristicsSchema>;
export type Colors                = z.infer<typeof ColorsSchema>;

// Hex validator used for post-hoc validation of Claude's color output.
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidHex(value: string): boolean {
  return HEX_RE.test(value);
}

export function validateHexFields(output: ThemeGenerationOutput): void {
  const checks: Array<[string, string]> = [
    ["colors.primarySeedHex",   output.colors.primarySeedHex],
    ["colors.secondarySeedHex", output.colors.secondarySeedHex],
    ["colors.semantic.success", output.colors.semantic.success],
    ["colors.semantic.warning", output.colors.semantic.warning],
    ["colors.semantic.error",   output.colors.semantic.error],
    ["colors.semantic.info",    output.colors.semantic.info],
  ];
  for (const [path, value] of checks) {
    if (!isValidHex(value)) {
      throw new Error(`Invalid hex color at ${path}: "${value}"`);
    }
  }
}
