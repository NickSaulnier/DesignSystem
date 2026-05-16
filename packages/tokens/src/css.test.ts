import { describe, expect, it } from "vitest";
import { themeToCSSVars, themeToCSSString, CSS_VAR_PREFIX } from "./css.js";
import { defaultTheme } from "./defaults.js";

describe("themeToCSSVars", () => {
  it("emits a flat object with --ds-* keys", () => {
    const vars = themeToCSSVars(defaultTheme);
    expect(Object.keys(vars).length).toBeGreaterThan(60); // many tokens
    for (const key of Object.keys(vars)) {
      expect(key.startsWith(CSS_VAR_PREFIX)).toBe(true);
    }
  });

  it("emits all 11 stops for each color scale", () => {
    const vars = themeToCSSVars(defaultTheme);
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      expect(vars[`--ds-color-primary-${step}`]).toBe(defaultTheme.color.primary[step as 50]);
      expect(vars[`--ds-color-secondary-${step}`]).toBe(defaultTheme.color.secondary[step as 50]);
      expect(vars[`--ds-color-neutral-${step}`]).toBe(defaultTheme.color.neutral[step as 50]);
    }
  });

  it("emits semantic colors", () => {
    const vars = themeToCSSVars(defaultTheme);
    expect(vars["--ds-color-success"]).toBe(defaultTheme.color.semantic.success);
    expect(vars["--ds-color-warning"]).toBe(defaultTheme.color.semantic.warning);
    expect(vars["--ds-color-error"]).toBe(defaultTheme.color.semantic.error);
    expect(vars["--ds-color-info"]).toBe(defaultTheme.color.semantic.info);
  });

  it("emits surface tokens", () => {
    const vars = themeToCSSVars(defaultTheme);
    expect(vars["--ds-surface-base"]).toBe(defaultTheme.color.surface.base);
    expect(vars["--ds-surface-raised"]).toBe(defaultTheme.color.surface.raised);
    expect(vars["--ds-surface-overlay"]).toBe(defaultTheme.color.surface.overlay);
  });

  it("emits font families, weights, and type scale steps", () => {
    const vars = themeToCSSVars(defaultTheme);
    expect(vars["--ds-font-heading"]).toBe(defaultTheme.typography.fontFamily.heading);
    expect(vars["--ds-font-body"]).toBe(defaultTheme.typography.fontFamily.body);
    expect(vars["--ds-weight-bold"]).toBe(String(defaultTheme.typography.weight.bold));
    expect(vars["--ds-text-base-size"]).toBe(defaultTheme.typography.scale.base.size);
  });

  it("emits motion duration + easing", () => {
    const vars = themeToCSSVars(defaultTheme);
    expect(vars["--ds-duration-fast"]).toBe(defaultTheme.motion.duration.fast);
    expect(vars["--ds-easing-standard"]).toBe(defaultTheme.motion.easing.standard);
  });
});

describe("themeToCSSString", () => {
  it("wraps the vars in :root by default", () => {
    const css = themeToCSSString(defaultTheme);
    expect(css.startsWith(":root {")).toBe(true);
    expect(css.endsWith("}")).toBe(true);
  });

  it("accepts a custom selector", () => {
    const css = themeToCSSString(defaultTheme, ".dark");
    expect(css.startsWith(".dark {")).toBe(true);
  });

  it("contains a recognizable --ds-color-primary-500 line", () => {
    const css = themeToCSSString(defaultTheme);
    expect(css).toContain("--ds-color-primary-500: #3b82f6;");
  });

  it("ends every variable line with a semicolon", () => {
    const css = themeToCSSString(defaultTheme);
    const varLines = css
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("--ds-"));
    expect(varLines.length).toBeGreaterThan(60);
    for (const line of varLines) {
      expect(line).toMatch(/^--ds-[\w-]+:\s.+;$/);
    }
  });
});
