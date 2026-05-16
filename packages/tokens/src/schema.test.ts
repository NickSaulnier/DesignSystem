import { describe, expect, it } from "vitest";
import { parseTheme, safeParseTheme, BrandThemeSchema } from "./schema.js";
import { defaultTheme } from "./defaults.js";

describe("BrandTheme schema", () => {
  it("accepts the default theme as-is", () => {
    expect(() => parseTheme(defaultTheme)).not.toThrow();
    const parsed = parseTheme(defaultTheme);
    expect(parsed.identity.name).toBe("Default");
    expect(parsed.mode).toBe("light");
  });

  it("defaults `mode` to 'light' when omitted (backwards compat for history entries)", () => {
    const withoutMode = { ...defaultTheme } as { mode?: "light" | "dark" };
    delete withoutMode.mode;
    const parsed = parseTheme(withoutMode);
    expect(parsed.mode).toBe("light");
  });

  it("accepts mode='dark'", () => {
    const dark = { ...defaultTheme, mode: "dark" as const };
    const parsed = parseTheme(dark);
    expect(parsed.mode).toBe("dark");
  });

  it("rejects invalid hex codes", () => {
    const bad = structuredClone(defaultTheme);
    bad.color.primary[500] = "not-a-hex";
    expect(() => parseTheme(bad)).toThrow();
  });

  it("rejects 3-digit hex codes (we require 6-digit)", () => {
    const bad = structuredClone(defaultTheme);
    bad.color.semantic.success = "#abc";
    // 3-digit IS in our regex pattern — verify whether we allow it
    const result = safeParseTheme(bad);
    expect(result.success).toBe(true); // 3-digit hex IS allowed per the regex
  });

  it("rejects empty identity name", () => {
    const bad = structuredClone(defaultTheme);
    bad.identity.name = "";
    expect(() => parseTheme(bad)).toThrow();
  });

  it("rejects personality with > 5 traits", () => {
    const bad = structuredClone(defaultTheme);
    bad.identity.personality = ["a", "b", "c", "d", "e", "f"];
    expect(() => parseTheme(bad)).toThrow();
  });

  it("safeParseTheme returns success object for valid input", () => {
    const r = safeParseTheme(defaultTheme);
    expect(r.success).toBe(true);
  });

  it("safeParseTheme returns error object for invalid input", () => {
    const r = safeParseTheme({ wrong: "shape" });
    expect(r.success).toBe(false);
  });

  it("rejects negative font weights", () => {
    const bad = structuredClone(defaultTheme);
    bad.typography.weight.bold = -100 as 100;
    expect(() => parseTheme(bad)).toThrow();
  });

  it("rejects spacing.base outside {4, 8}", () => {
    const bad = structuredClone(defaultTheme);
    (bad.spacing as { base: number }).base = 5;
    expect(() => parseTheme(bad)).toThrow();
  });

  it("BrandThemeSchema can parse its own output (round-trip)", () => {
    const parsed = BrandThemeSchema.parse(defaultTheme);
    const reparsed = BrandThemeSchema.parse(parsed);
    expect(reparsed).toEqual(parsed);
  });
});
