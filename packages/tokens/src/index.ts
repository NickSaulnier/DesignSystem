export {
  BrandThemeSchema,
  ColorScaleSchema,
  TypeScaleSchema,
  ShadowScaleSchema,
  SpacingScaleSchema,
  RadiusScaleSchema,
  BorderWidthSchema,
  parseTheme,
  safeParseTheme,
} from "./schema.js";

export type {
  BrandTheme,
  ColorScale,
  ColorScaleStep,
  TypeScale,
  ShadowScale,
  SpacingScale,
  RadiusScale,
} from "./schema.js";

export {
  CSS_VAR_PREFIX,
  themeToCSSVars,
  themeToCSSString,
  injectTheme,
  clearTheme,
} from "./css.js";

export { defaultTheme } from "./defaults.js";

export {
  themeToTailwindConfig,
  themeToTailwindConfigString,
} from "./exports/tailwind.js";

export {
  themeToFigmaTokens,
  themeToFigmaTokensString,
} from "./exports/figma.js";
