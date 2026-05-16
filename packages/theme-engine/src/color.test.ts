import { describe, expect, it } from "vitest";
import { generateColorScale, generateNeutralScale } from "./color.js";

describe("generateColorScale", () => {
  it("emits all 11 stops", () => {
    const scale = generateColorScale("#3b82f6");
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      expect(scale[step as 50]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("places the seed at step 500", () => {
    const seed = "#3b82f6";
    const scale = generateColorScale(seed);
    // The seed defines step 500. After LCH round-trip + gamut clamp the hex may
    // differ in the last few bits but should be very close to the seed.
    expect(scale[500].toLowerCase()).toBe(seed.toLowerCase());
  });

  it("produces a monotonic perceptual lightness gradient (50 lightest → 950 darkest)", () => {
    const scale = generateColorScale("#3b82f6");
    // Approximate luminance check using sRGB-linear weighting.
    const lum = (hex: string) => {
      const m = hex.replace("#", "").match(/.{2}/g)!;
      const [r, g, b] = m.map((c) => parseInt(c, 16) / 255);
      const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
      return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
    };
    const luminances = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
      (step) => lum(scale[step as 50]),
    );
    // Strictly decreasing.
    for (let i = 1; i < luminances.length; i++) {
      expect(luminances[i]!).toBeLessThan(luminances[i - 1]!);
    }
  });

  it("throws on an unparseable hex string", () => {
    expect(() => generateColorScale("not-a-color")).toThrow();
  });
});

describe("generateNeutralScale", () => {
  it("returns a near-neutral grey scale when no seed is supplied", () => {
    // The no-seed scale uses Tailwind's zinc palette, which has a tiny cool
    // cast (blue slightly higher than red/green). We allow up to a 12-unit
    // channel spread to call something "neutral".
    const scale = generateNeutralScale();
    for (const step of [50, 500, 950]) {
      const hex = scale[step as 50].replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      expect(spread).toBeLessThanOrEqual(12);
    }
  });

  it("tints the scale with the seed hue when provided", () => {
    // Warm cast seed — should yield a slightly-warm 500.
    const warm = generateNeutralScale("#a8a29e");
    const hex = warm[500];
    // Not pure grey — the channels differ a bit.
    const m = hex.replace("#", "").match(/.{2}/g)!;
    const [r, g, b] = m.map((c) => parseInt(c, 16));
    const channelsEqual = r === g && g === b;
    expect(channelsEqual).toBe(false);
  });
});
