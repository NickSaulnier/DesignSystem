import { z } from "zod";

const HexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, {
    message: "Must be a valid hex color (#rgb, #rrggbb, or #rrggbbaa)",
  });

const CssLength = z
  .string()
  .regex(/^-?\d*\.?\d+(px|rem|em|%|vh|vw|ch)$|^0$/, {
    message: "Must be a CSS length (px, rem, em, %, vh, vw, ch) or 0",
  });

const CssDuration = z.string().regex(/^\d+(ms|s)$/, {
  message: "Must be a CSS duration (e.g. '200ms', '0.3s')",
});

const CssEasing = z.string().min(1);

export const ColorScaleSchema = z.object({
  50:  HexColor,
  100: HexColor,
  200: HexColor,
  300: HexColor,
  400: HexColor,
  500: HexColor,
  600: HexColor,
  700: HexColor,
  800: HexColor,
  900: HexColor,
  950: HexColor,
});

const TypeStepSchema = z.object({
  size:       CssLength,
  lineHeight: z.union([CssLength, z.string().regex(/^\d*\.?\d+$/)]),
});

export const TypeScaleSchema = z.object({
  xs:    TypeStepSchema,
  sm:    TypeStepSchema,
  base:  TypeStepSchema,
  lg:    TypeStepSchema,
  xl:    TypeStepSchema,
  "2xl": TypeStepSchema,
  "3xl": TypeStepSchema,
  "4xl": TypeStepSchema,
  "5xl": TypeStepSchema,
});

export const ShadowScaleSchema = z.object({
  none: z.literal("none"),
  sm:   z.string().min(1),
  base: z.string().min(1),
  md:   z.string().min(1),
  lg:   z.string().min(1),
  xl:   z.string().min(1),
});

export const SpacingScaleSchema = z.object({
  xs:    CssLength,
  sm:    CssLength,
  md:    CssLength,
  lg:    CssLength,
  xl:    CssLength,
  "2xl": CssLength,
  "3xl": CssLength,
});

export const RadiusScaleSchema = z.object({
  none: z.literal("0"),
  sm:   CssLength,
  md:   CssLength,
  lg:   CssLength,
  xl:   CssLength,
  full: z.literal("9999px"),
});

export const BorderWidthSchema = z.object({
  thin:  CssLength,
  base:  CssLength,
  thick: CssLength,
});

export const BrandThemeSchema = z.object({
  mode: z.enum(["light", "dark"]).default("light"),

  identity: z.object({
    name:        z.string().min(1),
    description: z.string(),
    personality: z.array(z.string()).min(1).max(5),
  }),

  color: z.object({
    primary:   ColorScaleSchema,
    secondary: ColorScaleSchema,
    neutral:   ColorScaleSchema,
    semantic: z.object({
      success: HexColor,
      warning: HexColor,
      error:   HexColor,
      info:    HexColor,
    }),
    surface: z.object({
      base:    HexColor,
      raised:  HexColor,
      overlay: HexColor,
    }),
    text: z.object({
      primary:   HexColor,
      secondary: HexColor,
      muted:     HexColor,
      inverse:   HexColor,
    }),
  }),

  typography: z.object({
    fontFamily: z.object({
      heading: z.string().min(1),
      body:    z.string().min(1),
      mono:    z.string().min(1),
    }),
    scale: TypeScaleSchema,
    weight: z.object({
      normal: z.number().int().min(100).max(900),
      medium: z.number().int().min(100).max(900),
      bold:   z.number().int().min(100).max(900),
    }),
    lineHeight: z.object({
      tight:   z.number().positive(),
      base:    z.number().positive(),
      relaxed: z.number().positive(),
    }),
    letterSpacing: z.object({
      tight:  z.string(),
      normal: z.string(),
      wide:   z.string(),
    }),
  }),

  spacing: z.object({
    base:  z.union([z.literal(4), z.literal(8)]),
    scale: SpacingScaleSchema,
  }),

  border: z.object({
    radius: RadiusScaleSchema,
    width:  BorderWidthSchema,
  }),

  shadow: ShadowScaleSchema,

  motion: z.object({
    duration: z.object({
      fast: CssDuration,
      base: CssDuration,
      slow: CssDuration,
    }),
    easing: z.object({
      standard:   CssEasing,
      decelerate: CssEasing,
      accelerate: CssEasing,
    }),
  }),
});

export type BrandTheme       = z.infer<typeof BrandThemeSchema>;
export type ColorScale       = z.infer<typeof ColorScaleSchema>;
export type TypeScale        = z.infer<typeof TypeScaleSchema>;
export type ShadowScale      = z.infer<typeof ShadowScaleSchema>;
export type SpacingScale     = z.infer<typeof SpacingScaleSchema>;
export type RadiusScale      = z.infer<typeof RadiusScaleSchema>;
export type ColorScaleStep   = keyof ColorScale;

export function parseTheme(input: unknown): BrandTheme {
  return BrandThemeSchema.parse(input);
}

export function safeParseTheme(input: unknown) {
  return BrandThemeSchema.safeParse(input);
}
