export { generateTheme, DEFAULT_MODEL } from "./generate.js";
export type { GenerateOptions, GenerateResult } from "./generate.js";

export { composeTheme } from "./compose.js";
export type { ComposeResult } from "./compose.js";

export { generateColorScale, generateNeutralScale } from "./color.js";

export { contrast, ensureContrast, ensureTextOnSurface } from "./accessibility.js";

export { FONT_PAIRS, FONT_PAIR_IDS, getFontPair } from "./fonts.js";
export type { FontPair } from "./fonts.js";

export {
  ThemeGenerationSchema,
  BrandSchema,
  CharacteristicsSchema,
  ColorsSchema,
  TypographySchema,
  isValidHex,
} from "./schemas.js";
export type {
  ThemeGenerationOutput,
  Brand,
  Characteristics,
  Colors,
} from "./schemas.js";
