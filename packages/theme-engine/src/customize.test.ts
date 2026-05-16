import { describe, expect, it } from "vitest";
import { defaultTheme } from "@nicksaulnier/design-system-tokens";
import { applyTokenEdits, extractEditableSnapshot } from "./customize.js";

describe("applyTokenEdits", () => {
  it("returns an unchanged theme when no edits are provided", () => {
    const out = applyTokenEdits(defaultTheme, {});
    expect(out.color.primary[500]).toBe(defaultTheme.color.primary[500]);
    expect(out.border.radius.md).toBe(defaultTheme.border.radius.md);
  });

  it("regenerates the primary scale when primarySeed changes", () => {
    const out = applyTokenEdits(defaultTheme, { primarySeed: "#e11d48" });
    expect(out.color.primary[500].toLowerCase()).toBe("#e11d48");
    // Other scales untouched.
    expect(out.color.secondary[500]).toBe(defaultTheme.color.secondary[500]);
  });

  it("regenerates the secondary scale when secondarySeed changes", () => {
    const out = applyTokenEdits(defaultTheme, { secondarySeed: "#10b981" });
    expect(out.color.secondary[500].toLowerCase()).toBe("#10b981");
  });

  it("regenerates the neutral scale AND refreshes surfaces/text when neutralCast changes", () => {
    const warm = applyTokenEdits(defaultTheme, { neutralCast: "warm" });
    const pure = applyTokenEdits(defaultTheme, { neutralCast: "pure" });
    // Surfaces are now driven by the new neutral 50/100 — they shouldn't both be #fafafa.
    expect(warm.color.surface.raised).not.toBe(pure.color.surface.raised);
  });

  it("applies semantic color edits and re-contrasts against the surface", () => {
    const out = applyTokenEdits(defaultTheme, { semanticSuccess: "#22c55e" });
    // Ensure contrast >= 4.5 on the (light) surface — the function should adjust if needed.
    const ratio = contrastBetween(out.color.semantic.success, out.color.surface.base);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("swaps radius presets when borderCharacter changes", () => {
    const sharp = applyTokenEdits(defaultTheme, { borderCharacter: "sharp" });
    const pill  = applyTokenEdits(defaultTheme, { borderCharacter: "pill" });
    expect(sharp.border.radius.md).toBe("0.125rem");
    expect(pill.border.radius.md).toBe("1.5rem");
  });

  it("swaps motion presets when motionCharacter changes", () => {
    const snappy     = applyTokenEdits(defaultTheme, { motionCharacter: "snappy" });
    const expressive = applyTokenEdits(defaultTheme, { motionCharacter: "expressive" });
    expect(snappy.motion.duration.base).toBe("180ms");
    expect(expressive.motion.duration.base).toBe("400ms");
  });

  it("swaps shadow presets when visualMood changes", () => {
    const minimal    = applyTokenEdits(defaultTheme, { visualMood: "minimal" });
    const expressive = applyTokenEdits(defaultTheme, { visualMood: "expressive" });
    expect(minimal.shadow.md).not.toBe(expressive.shadow.md);
  });

  it("replaces font families when fontPairId changes", () => {
    const out = applyTokenEdits(defaultTheme, { fontPairId: "playfair-source-serif" });
    expect(out.typography.fontFamily.heading).toContain("Playfair Display");
  });

  it("does not mutate the input theme (pure function)", () => {
    const beforeSnapshot = JSON.stringify(defaultTheme);
    applyTokenEdits(defaultTheme, {
      primarySeed:     "#e11d48",
      borderCharacter: "pill",
      motionCharacter: "expressive",
      fontPairId:      "playfair-source-serif",
    });
    expect(JSON.stringify(defaultTheme)).toBe(beforeSnapshot);
  });
});

describe("extractEditableSnapshot", () => {
  it("round-trips primary + secondary seeds (step 500)", () => {
    const snap = extractEditableSnapshot(defaultTheme);
    expect(snap.primarySeed).toBe(defaultTheme.color.primary[500]);
    expect(snap.secondarySeed).toBe(defaultTheme.color.secondary[500]);
  });

  it("identifies the neutral cast of the default theme as 'pure'", () => {
    const snap = extractEditableSnapshot(defaultTheme);
    expect(snap.neutralCast).toBe("pure");
  });

  it("returns 'unknown' for fields that don't match any preset", () => {
    // Default theme's shadow string formatting (`0.1` vs `0.10`) differs from
    // SHADOW_PRESETS — so visualMood is intentionally not matched.
    const snap = extractEditableSnapshot(defaultTheme);
    expect(snap.visualMood).toBe("unknown");
  });
});

// ----- helpers --------------------------------------------------------------

function contrastBetween(fg: string, bg: string): number {
  const lFg = relLuminance(fg);
  const lBg = relLuminance(bg);
  const [a, b] = lFg > lBg ? [lFg, lBg] : [lBg, lFg];
  return (a + 0.05) / (b + 0.05);
}

function relLuminance(hex: string): number {
  const m = hex.replace("#", "").match(/.{2}/g)!;
  const [r, g, b] = m.map((c) => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
