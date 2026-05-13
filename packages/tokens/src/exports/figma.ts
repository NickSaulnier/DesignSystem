import type { BrandTheme } from "../schema.js";

/**
 * W3C Design Tokens Format Module (draft):
 * https://tr.designtokens.org/format/
 *
 * Each token is a leaf object with $value + $type. Token groups have no special
 * markers — they're plain nested objects. The result is importable into the
 * Tokens Studio Figma plugin and any other W3C-aware tool.
 */

type DTToken = { $value: unknown; $type: string; $description?: string };
type DTGroup = { [key: string]: DTToken | DTGroup };

export function themeToFigmaTokens(theme: BrandTheme): Record<string, unknown> {
  return {
    $description: `Design tokens for ${theme.identity.name}. ${theme.identity.description}`.trim(),

    color: {
      primary:   colorScaleGroup(theme.color.primary),
      secondary: colorScaleGroup(theme.color.secondary),
      neutral:   colorScaleGroup(theme.color.neutral),
      semantic: {
        success: colorToken(theme.color.semantic.success),
        warning: colorToken(theme.color.semantic.warning),
        error:   colorToken(theme.color.semantic.error),
        info:    colorToken(theme.color.semantic.info),
      },
      surface: {
        base:    colorToken(theme.color.surface.base),
        raised:  colorToken(theme.color.surface.raised),
        overlay: colorToken(theme.color.surface.overlay),
      },
      text: {
        primary:   colorToken(theme.color.text.primary),
        secondary: colorToken(theme.color.text.secondary),
        muted:     colorToken(theme.color.text.muted),
        inverse:   colorToken(theme.color.text.inverse),
      },
    },

    typography: {
      fontFamily: {
        heading: fontFamilyToken(theme.typography.fontFamily.heading),
        body:    fontFamilyToken(theme.typography.fontFamily.body),
        mono:    fontFamilyToken(theme.typography.fontFamily.mono),
      },
      fontWeight: {
        normal: weightToken(theme.typography.weight.normal),
        medium: weightToken(theme.typography.weight.medium),
        bold:   weightToken(theme.typography.weight.bold),
      },
      fontSize: Object.fromEntries(
        Object.entries(theme.typography.scale).map(([step, { size }]) => [
          step,
          dimensionToken(size),
        ]),
      ),
      lineHeight: {
        tight:   numberToken(theme.typography.lineHeight.tight),
        base:    numberToken(theme.typography.lineHeight.base),
        relaxed: numberToken(theme.typography.lineHeight.relaxed),
      },
      letterSpacing: {
        tight:  dimensionToken(theme.typography.letterSpacing.tight),
        normal: dimensionToken(theme.typography.letterSpacing.normal),
        wide:   dimensionToken(theme.typography.letterSpacing.wide),
      },
    },

    space: Object.fromEntries(
      Object.entries(theme.spacing.scale).map(([step, value]) => [step, dimensionToken(value)]),
    ),

    radius: Object.fromEntries(
      Object.entries(theme.border.radius).map(([step, value]) => [step, dimensionToken(value)]),
    ),

    borderWidth: {
      thin:  dimensionToken(theme.border.width.thin),
      base:  dimensionToken(theme.border.width.base),
      thick: dimensionToken(theme.border.width.thick),
    },

    shadow: Object.fromEntries(
      Object.entries(theme.shadow).map(([step, value]) => [
        step,
        // The W3C $type:"shadow" requires parsed structured values. Most consumers
        // (Tokens Studio especially) accept a string $value as a fallback — use that.
        { $value: value, $type: "shadow" } as DTToken,
      ]),
    ),

    motion: {
      duration: {
        fast: durationToken(theme.motion.duration.fast),
        base: durationToken(theme.motion.duration.base),
        slow: durationToken(theme.motion.duration.slow),
      },
      easing: {
        standard:   cubicBezierToken(theme.motion.easing.standard),
        decelerate: cubicBezierToken(theme.motion.easing.decelerate),
        accelerate: cubicBezierToken(theme.motion.easing.accelerate),
      },
    },
  };
}

export function themeToFigmaTokensString(theme: BrandTheme): string {
  return JSON.stringify(themeToFigmaTokens(theme), null, 2) + "\n";
}

function colorScaleGroup(scale: Record<string, string>): DTGroup {
  const out: DTGroup = {};
  for (const [step, hex] of Object.entries(scale)) {
    out[step] = colorToken(hex);
  }
  return out;
}

function colorToken(hex: string): DTToken {
  return { $value: hex, $type: "color" };
}

function fontFamilyToken(stack: string): DTToken {
  return {
    $value: stack.split(",").map((s) => s.trim()).filter(Boolean),
    $type: "fontFamily",
  };
}

function weightToken(weight: number): DTToken {
  return { $value: weight, $type: "fontWeight" };
}

function dimensionToken(value: string): DTToken {
  return { $value: value, $type: "dimension" };
}

function numberToken(value: number): DTToken {
  return { $value: value, $type: "number" };
}

function durationToken(value: string): DTToken {
  return { $value: value, $type: "duration" };
}

function cubicBezierToken(value: string): DTToken {
  // The W3C $type:"cubicBezier" wants [x1, y1, x2, y2]. Try to parse; fall back to
  // a string $value with $type:"cubicBezier" if it isn't a parseable cubic-bezier().
  const m = /^cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/.exec(value);
  if (m) {
    return { $value: [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])], $type: "cubicBezier" };
  }
  return { $value: value, $type: "cubicBezier" };
}
