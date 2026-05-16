import { describe, expect, it } from "vitest";
import { parseTheme } from "@nicksaulnier/design-system-tokens";
import { composeTheme, deriveDarkVariant } from "./compose.js";
import { contrast } from "./accessibility.js";
import type { ThemeGenerationOutput } from "./schemas.js";

function fixture(over: Partial<ThemeGenerationOutput> = {}): ThemeGenerationOutput {
  return {
    brand: {
      name:        "Test Brand",
      description: "A test brand for unit tests.",
      personality: ["clean", "modern"],
      ...(over.brand ?? {}),
    },
    characteristics: {
      toneOfVoice:     "professional",
      visualMood:      "structured",
      motionCharacter: "snappy",
      borderCharacter: "slightly-rounded",
      ...(over.characteristics ?? {}),
    },
    colors: {
      primarySeedHex:   "#3b82f6",
      secondarySeedHex: "#8b5cf6",
      neutralCast:      "pure",
      semantic: {
        success: "#16a34a",
        warning: "#d97706",
        error:   "#dc2626",
        info:    "#0284c7",
      },
      ...(over.colors ?? {}),
    },
    typography: {
      fontPairId: "inter-jetbrains",
      ...(over.typography ?? {}),
    },
  };
}

describe("composeTheme", () => {
  it("produces a BrandTheme that validates against the schema", () => {
    const { theme } = composeTheme(fixture());
    expect(() => parseTheme(theme)).not.toThrow();
  });

  it("sets mode='light' on the output", () => {
    const { theme } = composeTheme(fixture());
    expect(theme.mode).toBe("light");
  });

  it("places the primary seed at step 500", () => {
    const { theme } = composeTheme(fixture({ colors: { primarySeedHex: "#3b82f6", secondarySeedHex: "#8b5cf6", neutralCast: "pure", semantic: { success: "#16a34a", warning: "#d97706", error: "#dc2626", info: "#0284c7" } } }));
    expect(theme.color.primary[500].toLowerCase()).toBe("#3b82f6");
  });

  it("enforces WCAG AA contrast for body text on the base surface", () => {
    const { theme } = composeTheme(fixture());
    expect(contrast(theme.color.text.primary, theme.color.surface.base)).toBeGreaterThanOrEqual(4.5);
  });

  it("returns adjustment notes when semantic colors had to be modified", () => {
    // A super-pale success color will fail AA against white surface and be lifted.
    const palePink = "#fde2e2";
    const { adjustments } = composeTheme(fixture({
      colors: {
        primarySeedHex: "#3b82f6", secondarySeedHex: "#8b5cf6", neutralCast: "pure",
        semantic: { success: palePink, warning: "#d97706", error: "#dc2626", info: "#0284c7" },
      },
    }));
    expect(adjustments.length).toBeGreaterThan(0);
    expect(adjustments.some((a) => a.startsWith("semantic.success"))).toBe(true);
  });

  it("maps borderCharacter to the matching radius preset", () => {
    const sharp = composeTheme(fixture({ characteristics: {
      toneOfVoice: "professional", visualMood: "structured", motionCharacter: "snappy", borderCharacter: "sharp",
    } })).theme;
    const pill = composeTheme(fixture({ characteristics: {
      toneOfVoice: "professional", visualMood: "structured", motionCharacter: "snappy", borderCharacter: "pill",
    } })).theme;
    expect(sharp.border.radius.md).toBe("0.125rem");
    expect(pill.border.radius.md).toBe("1.5rem");
  });
});

describe("deriveDarkVariant", () => {
  it("returns a theme with mode='dark'", () => {
    const { theme } = composeTheme(fixture());
    const dark = deriveDarkVariant(theme);
    expect(dark.mode).toBe("dark");
  });

  it("reverses the color scales (50 ↔ 950)", () => {
    const { theme } = composeTheme(fixture());
    const dark = deriveDarkVariant(theme);
    expect(dark.color.primary[50]).toBe(theme.color.primary[950]);
    expect(dark.color.primary[950]).toBe(theme.color.primary[50]);
    expect(dark.color.neutral[100]).toBe(theme.color.neutral[900]);
  });

  it("keeps step 500 stable (brand mid-tone preserved)", () => {
    const { theme } = composeTheme(fixture());
    const dark = deriveDarkVariant(theme);
    expect(dark.color.primary[500]).toBe(theme.color.primary[500]);
    expect(dark.color.secondary[500]).toBe(theme.color.secondary[500]);
  });

  it("inverts surfaces (base becomes near-black)", () => {
    const { theme } = composeTheme(fixture());
    const dark = deriveDarkVariant(theme);
    // surface.base in dark = neutral[50] of the REVERSED neutral = neutral[950] of original.
    expect(dark.color.surface.base).toBe(theme.color.neutral[950]);
  });

  it("text remains AA-contrasted against the dark surface", () => {
    const { theme } = composeTheme(fixture());
    const dark = deriveDarkVariant(theme);
    expect(contrast(dark.color.text.primary, dark.color.surface.base)).toBeGreaterThanOrEqual(4.5);
  });

  it("produces a schema-valid theme", () => {
    const { theme } = composeTheme(fixture());
    const dark = deriveDarkVariant(theme);
    expect(() => parseTheme(dark)).not.toThrow();
  });

  it("brightens a very-dark primary seed when generating the dark scale", () => {
    // A very dark navy seed — LCH L < 35.
    const darkSeedTheme = composeTheme(fixture({
      colors: {
        primarySeedHex:   "#0a1228",  // very dark navy
        secondarySeedHex: "#8b5cf6",
        neutralCast:      "pure",
        semantic: { success: "#16a34a", warning: "#d97706", error: "#dc2626", info: "#0284c7" },
      },
    })).theme;
    const dark = deriveDarkVariant(darkSeedTheme);
    // The dark-mode primary 500 should be brightened from the original dark seed.
    expect(dark.color.primary[500]).not.toBe(darkSeedTheme.color.primary[500]);
    // Light-mode primary 500 stays the original dark seed (since light-mode wasn't touched).
    expect(darkSeedTheme.color.primary[500].toLowerCase()).toBe("#0a1228");
  });
});
