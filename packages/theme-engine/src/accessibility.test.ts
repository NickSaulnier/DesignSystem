import { describe, expect, it } from "vitest";
import { contrast, ensureContrast, ensureTextOnSurface } from "./accessibility.js";

describe("contrast", () => {
  it("returns 21 for black on white (maximum WCAG ratio)", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("returns 1 for identical colors", () => {
    expect(contrast("#3b82f6", "#3b82f6")).toBeCloseTo(1, 5);
  });

  it("is symmetric (order of foreground/background doesn't matter)", () => {
    const a = contrast("#3b82f6", "#ffffff");
    const b = contrast("#ffffff", "#3b82f6");
    expect(a).toBeCloseTo(b, 5);
  });
});

describe("ensureContrast", () => {
  it("returns the input unchanged if it already passes the target", () => {
    // Black on white passes 21:1 — way over any AA threshold.
    expect(ensureContrast("#000000", "#ffffff", 4.5)).toBe("#000000");
  });

  it("darkens a too-light foreground on a light background", () => {
    // Light grey #aaaaaa on white is roughly 2.85:1 — fails AA body (4.5).
    const adjusted = ensureContrast("#aaaaaa", "#ffffff", 4.5);
    expect(adjusted).not.toBe("#aaaaaa");
    expect(contrast(adjusted, "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });

  it("lightens a too-dark foreground on a dark background", () => {
    // #555555 on #1a1a1a fails AA body.
    const adjusted = ensureContrast("#555555", "#1a1a1a", 4.5);
    expect(adjusted).not.toBe("#555555");
    expect(contrast(adjusted, "#1a1a1a")).toBeGreaterThanOrEqual(4.5);
  });

  it("never reduces contrast below the input's starting ratio", () => {
    // Even when target is unreachable, the function returns the best candidate
    // it found rather than something worse than the original.
    const before = contrast("#cccccc", "#ffffff");
    const after  = contrast(ensureContrast("#cccccc", "#ffffff", 21), "#ffffff");
    expect(after).toBeGreaterThanOrEqual(before);
  });
});

describe("ensureTextOnSurface", () => {
  it("uses 4.5:1 as the AA body-text target", () => {
    const before = "#cccccc";
    const after  = ensureTextOnSurface(before, "#ffffff");
    expect(contrast(after, "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });
});
