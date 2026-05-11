import type { BrandTheme, ColorScale } from "./schema.js";

export const CSS_VAR_PREFIX = "--ds";

type CssVars = Record<string, string>;

function flattenColorScale(name: string, scale: ColorScale, vars: CssVars): void {
  for (const [step, hex] of Object.entries(scale)) {
    vars[`${CSS_VAR_PREFIX}-color-${name}-${step}`] = hex;
  }
}

export function themeToCSSVars(theme: BrandTheme): CssVars {
  const vars: CssVars = {};

  flattenColorScale("primary",   theme.color.primary,   vars);
  flattenColorScale("secondary", theme.color.secondary, vars);
  flattenColorScale("neutral",   theme.color.neutral,   vars);

  vars[`${CSS_VAR_PREFIX}-color-success`] = theme.color.semantic.success;
  vars[`${CSS_VAR_PREFIX}-color-warning`] = theme.color.semantic.warning;
  vars[`${CSS_VAR_PREFIX}-color-error`]   = theme.color.semantic.error;
  vars[`${CSS_VAR_PREFIX}-color-info`]    = theme.color.semantic.info;

  vars[`${CSS_VAR_PREFIX}-surface-base`]    = theme.color.surface.base;
  vars[`${CSS_VAR_PREFIX}-surface-raised`]  = theme.color.surface.raised;
  vars[`${CSS_VAR_PREFIX}-surface-overlay`] = theme.color.surface.overlay;

  vars[`${CSS_VAR_PREFIX}-text-primary`]   = theme.color.text.primary;
  vars[`${CSS_VAR_PREFIX}-text-secondary`] = theme.color.text.secondary;
  vars[`${CSS_VAR_PREFIX}-text-muted`]     = theme.color.text.muted;
  vars[`${CSS_VAR_PREFIX}-text-inverse`]   = theme.color.text.inverse;

  vars[`${CSS_VAR_PREFIX}-font-heading`] = theme.typography.fontFamily.heading;
  vars[`${CSS_VAR_PREFIX}-font-body`]    = theme.typography.fontFamily.body;
  vars[`${CSS_VAR_PREFIX}-font-mono`]    = theme.typography.fontFamily.mono;

  for (const [step, { size, lineHeight }] of Object.entries(theme.typography.scale)) {
    vars[`${CSS_VAR_PREFIX}-text-${step}-size`]        = size;
    vars[`${CSS_VAR_PREFIX}-text-${step}-line-height`] = String(lineHeight);
  }

  vars[`${CSS_VAR_PREFIX}-weight-normal`] = String(theme.typography.weight.normal);
  vars[`${CSS_VAR_PREFIX}-weight-medium`] = String(theme.typography.weight.medium);
  vars[`${CSS_VAR_PREFIX}-weight-bold`]   = String(theme.typography.weight.bold);

  vars[`${CSS_VAR_PREFIX}-line-height-tight`]   = String(theme.typography.lineHeight.tight);
  vars[`${CSS_VAR_PREFIX}-line-height-base`]    = String(theme.typography.lineHeight.base);
  vars[`${CSS_VAR_PREFIX}-line-height-relaxed`] = String(theme.typography.lineHeight.relaxed);

  vars[`${CSS_VAR_PREFIX}-letter-spacing-tight`]  = theme.typography.letterSpacing.tight;
  vars[`${CSS_VAR_PREFIX}-letter-spacing-normal`] = theme.typography.letterSpacing.normal;
  vars[`${CSS_VAR_PREFIX}-letter-spacing-wide`]   = theme.typography.letterSpacing.wide;

  for (const [step, value] of Object.entries(theme.spacing.scale)) {
    vars[`${CSS_VAR_PREFIX}-space-${step}`] = value;
  }

  for (const [step, value] of Object.entries(theme.border.radius)) {
    vars[`${CSS_VAR_PREFIX}-radius-${step}`] = value;
  }

  vars[`${CSS_VAR_PREFIX}-border-thin`]  = theme.border.width.thin;
  vars[`${CSS_VAR_PREFIX}-border-base`]  = theme.border.width.base;
  vars[`${CSS_VAR_PREFIX}-border-thick`] = theme.border.width.thick;

  for (const [step, value] of Object.entries(theme.shadow)) {
    vars[`${CSS_VAR_PREFIX}-shadow-${step}`] = value;
  }

  vars[`${CSS_VAR_PREFIX}-duration-fast`] = theme.motion.duration.fast;
  vars[`${CSS_VAR_PREFIX}-duration-base`] = theme.motion.duration.base;
  vars[`${CSS_VAR_PREFIX}-duration-slow`] = theme.motion.duration.slow;

  vars[`${CSS_VAR_PREFIX}-easing-standard`]   = theme.motion.easing.standard;
  vars[`${CSS_VAR_PREFIX}-easing-decelerate`] = theme.motion.easing.decelerate;
  vars[`${CSS_VAR_PREFIX}-easing-accelerate`] = theme.motion.easing.accelerate;

  return vars;
}

export function themeToCSSString(theme: BrandTheme, selector: string = ":root"): string {
  const vars = themeToCSSVars(theme);
  const lines = Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

export interface InjectThemeOptions {
  /** Target element to set CSS variables on. Defaults to documentElement. */
  target?: HTMLElement;
  /**
   * If true and the browser supports the View Transitions API, the swap is
   * animated as a crossfade. Falls back to instant swap on unsupported browsers.
   */
  animated?: boolean;
}

export function injectTheme(theme: BrandTheme, options: InjectThemeOptions = {}): void {
  if (typeof document === "undefined") {
    throw new Error("injectTheme requires a DOM environment");
  }
  const el   = options.target ?? document.documentElement;
  const vars = themeToCSSVars(theme);
  const apply = () => {
    for (const [key, value] of Object.entries(vars)) {
      el.style.setProperty(key, value);
    }
  };

  if (options.animated && typeof document.startViewTransition === "function") {
    document.startViewTransition(apply);
    return;
  }
  apply();
}

export function clearTheme(target?: HTMLElement): void {
  if (typeof document === "undefined") return;
  const el = target ?? document.documentElement;
  for (const name of Array.from(el.style)) {
    if (name.startsWith(CSS_VAR_PREFIX)) {
      el.style.removeProperty(name);
    }
  }
}
