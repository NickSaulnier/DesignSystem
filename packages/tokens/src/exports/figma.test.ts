import { describe, expect, it } from "vitest";
import { themeToFigmaTokens, themeToFigmaTokensString } from "./figma.js";
import { defaultTheme } from "../defaults.js";

interface DTToken { $value: unknown; $type: string }
interface DTColorScale { [step: string]: DTToken }

describe("themeToFigmaTokens", () => {
  it("emits W3C-shaped tokens with $value + $type", () => {
    const tk = themeToFigmaTokens(defaultTheme) as { color: { primary: DTColorScale } };
    const p500 = tk.color.primary["500"];
    expect(p500.$value).toBe(defaultTheme.color.primary[500]);
    expect(p500.$type).toBe("color");
  });

  it("nests color scales under color.{name}.{step}", () => {
    const tk = themeToFigmaTokens(defaultTheme) as { color: { primary: DTColorScale; secondary: DTColorScale; neutral: DTColorScale } };
    for (const step of ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]) {
      expect(tk.color.primary[step].$type).toBe("color");
      expect(tk.color.secondary[step].$type).toBe("color");
      expect(tk.color.neutral[step].$type).toBe("color");
    }
  });

  it("emits semantic colors under color.semantic", () => {
    const tk = themeToFigmaTokens(defaultTheme) as { color: { semantic: { success: DTToken; warning: DTToken; error: DTToken; info: DTToken } } };
    expect(tk.color.semantic.success.$value).toBe(defaultTheme.color.semantic.success);
    expect(tk.color.semantic.success.$type).toBe("color");
  });

  it("parses cubic-bezier easings into [x1,y1,x2,y2] arrays", () => {
    const tk = themeToFigmaTokens(defaultTheme) as { motion: { easing: { standard: DTToken } } };
    const easing = tk.motion.easing.standard;
    expect(easing.$type).toBe("cubicBezier");
    expect(Array.isArray(easing.$value)).toBe(true);
    expect((easing.$value as number[]).length).toBe(4);
    expect((easing.$value as number[])[0]).toBe(0.4);
  });

  it("emits dimensions for spacing + radius + borderWidth", () => {
    const tk = themeToFigmaTokens(defaultTheme) as {
      space: Record<string, DTToken>;
      radius: Record<string, DTToken>;
      borderWidth: Record<string, DTToken>;
    };
    expect(tk.space.md.$type).toBe("dimension");
    expect(tk.radius.md.$type).toBe("dimension");
    expect(tk.borderWidth.base.$type).toBe("dimension");
  });

  it("splits font stacks into arrays under typography.fontFamily.*", () => {
    const tk = themeToFigmaTokens(defaultTheme) as { typography: { fontFamily: { body: DTToken } } };
    const body = tk.typography.fontFamily.body;
    expect(body.$type).toBe("fontFamily");
    expect(Array.isArray(body.$value)).toBe(true);
    expect((body.$value as string[]).length).toBeGreaterThan(1);
  });
});

describe("themeToFigmaTokensString", () => {
  it("produces parseable JSON with the same shape as themeToFigmaTokens", () => {
    const s = themeToFigmaTokensString(defaultTheme);
    const parsed = JSON.parse(s) as { color: { primary: DTColorScale } };
    expect(parsed.color.primary["500"].$value).toBe(defaultTheme.color.primary[500]);
  });

  it("ends with a trailing newline", () => {
    const s = themeToFigmaTokensString(defaultTheme);
    expect(s.endsWith("\n")).toBe(true);
  });
});
