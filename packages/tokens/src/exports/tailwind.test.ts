import { describe, expect, it } from "vitest";
import {
  themeToTailwindConfig,
  themeToTailwindConfigString,
} from "./tailwind.js";
import { defaultTheme } from "../defaults.js";

describe("themeToTailwindConfig", () => {
  it("maps every color scale step into colors.{name}.{step}", () => {
    const cfg = themeToTailwindConfig(defaultTheme) as {
      colors: { primary: Record<string, string>; secondary: Record<string, string>; neutral: Record<string, string> };
    };
    for (const step of ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]) {
      expect(cfg.colors.primary[step]).toBe(defaultTheme.color.primary[Number(step) as 50]);
      expect(cfg.colors.secondary[step]).toBe(defaultTheme.color.secondary[Number(step) as 50]);
      expect(cfg.colors.neutral[step]).toBe(defaultTheme.color.neutral[Number(step) as 50]);
    }
  });

  it("flattens semantic colors directly under colors.*", () => {
    const cfg = themeToTailwindConfig(defaultTheme) as { colors: Record<string, string> };
    expect(cfg.colors.success).toBe(defaultTheme.color.semantic.success);
    expect(cfg.colors.warning).toBe(defaultTheme.color.semantic.warning);
    expect(cfg.colors.error).toBe(defaultTheme.color.semantic.error);
    expect(cfg.colors.info).toBe(defaultTheme.color.semantic.info);
  });

  it("exposes the type scale via fontSize.{step}", () => {
    const cfg = themeToTailwindConfig(defaultTheme) as { fontSize: Record<string, [string, { lineHeight: string }]> };
    const baseFs = cfg.fontSize.base;
    expect(baseFs[0]).toBe(defaultTheme.typography.scale.base.size);
    expect(baseFs[1].lineHeight).toBe(String(defaultTheme.typography.scale.base.lineHeight));
  });

  it("splits font stacks into arrays", () => {
    const cfg = themeToTailwindConfig(defaultTheme) as { fontFamily: { body: string[] } };
    // Default body is `'Inter', system-ui, -apple-system, sans-serif`
    expect(Array.isArray(cfg.fontFamily.body)).toBe(true);
    expect(cfg.fontFamily.body.length).toBeGreaterThan(1);
    expect(cfg.fontFamily.body[0]).toMatch(/Inter/);
  });

  it("returns a plain object — caller serializes", () => {
    const cfg = themeToTailwindConfig(defaultTheme);
    expect(typeof cfg).toBe("object");
    // Should not throw when JSON.stringify'd
    expect(() => JSON.stringify(cfg)).not.toThrow();
  });
});

describe("themeToTailwindConfigString", () => {
  it("produces a string starting with the Tailwind config preamble", () => {
    const s = themeToTailwindConfigString(defaultTheme);
    expect(s).toContain("@type {import('tailwindcss').Config}");
    expect(s).toContain("module.exports = {");
    expect(s).toContain("theme: {");
    expect(s).toContain("extend: {");
  });

  it("evaluates as valid CommonJS module via `new Function`", () => {
    const s = themeToTailwindConfigString(defaultTheme);
    const sandbox: { exports: { theme?: { extend?: { colors?: { primary?: Record<string, string> } } } } } = { exports: {} };
    const fn = new Function("module", "exports", s);
    fn(sandbox, sandbox.exports);
    expect(sandbox.exports.theme?.extend?.colors?.primary?.["500"]).toBe(defaultTheme.color.primary[500]);
  });
});
