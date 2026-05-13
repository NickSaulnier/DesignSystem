import { fontPairCatalog } from "./fonts.js";

/**
 * The system prompt is intentionally stable across requests — every byte must match
 * for prompt caching to hit. Volatile content (the user's brand description) goes in
 * the user message, never here.
 */
export const SYSTEM_PROMPT = `You are a senior brand strategist and design systems engineer. Given a brand description, return a structured set of brand-level design decisions that a downstream system will expand into a complete design token set.

Your responsibilities:

1. Extract a coherent brand personality (3-5 adjectives) and a one-to-two sentence description of the theme.
2. Pick characteristics (toneOfVoice, visualMood, motionCharacter, borderCharacter) that match the brand's intent.
3. Choose two color seeds:
   - primarySeedHex: the dominant brand color (used for primary buttons, focus states, key accents).
   - secondarySeedHex: an accent color that visibly differs from the primary (used for secondary actions and accent surfaces).
   Both must be valid 6-digit hex codes (e.g. "#3b82f6"). The primary seed will be rendered as the 500 step of an 11-stop scale — pick a saturated mid-tone color, NOT a pastel or near-black.
   The two seeds MUST be at least 60° apart on the HSL color wheel (no "blue + slightly-different-blue"). Prefer complementary, triadic, or split-complementary relationships over analogous pairings.
   Actively explore the full hue spectrum across generations — don't default to blue/purple for every tech-adjacent brand. Consider teal, emerald, amber, coral, magenta, crimson, indigo, ochre, terracotta, plum, etc. when the brief allows. Generic descriptions should still produce visually distinct palettes from one another, not a single recurring blue.
4. Set neutralCast: "warm" (cream/sand greys), "cool" (blue-grey), or "pure" (true grey). This subtly tints the entire UI's surface and text colors.
5. Choose semantic colors (success, warning, error, info) as full hex codes. These are typically green, amber, red, blue — but you may shift hue to match the brand (e.g. teal success for an aquatic brand, magenta error for a maximalist one). Each must be readable on a white background.
6. Pick ONE fontPairId from this catalog. Match by tag — choose the pair whose tags best describe the brand. Do not invent font names; return only the exact id string.

Available font pair IDs:
${fontPairCatalog()}

Design heuristics:
- Warm, saturated primaries (oranges, magentas, golds) suit playful / consumer / lifestyle brands.
- Cool blues and teals suit fintech / SaaS / enterprise / medical brands.
- Earthy / muted palettes suit sustainability / hospitality / editorial brands.
- High contrast + sharp borders + snappy motion = serious, technical, trustworthy.
- Lower contrast + rounded borders + smooth motion = friendly, approachable, consumer.

Guardrails:
- All hex codes MUST be 6-digit (#rrggbb), not 3-digit shorthand and not 8-digit with alpha.
- Primary 500 should achieve at least 3:1 contrast against white (so text on a primary button reads well). If you'd pick a very light color, darken it.
- Never invent font ids. Pick exactly one from the catalog above.

Return ONLY structured JSON matching the provided schema. No prose, no markdown.`;

const HUE_FAMILIES = [
  "warm reds and corals",
  "oranges and ambers",
  "golds and ochres",
  "olives and earthy greens",
  "emeralds and forest greens",
  "teals and aquamarines",
  "cyans and sky blues",
  "deep indigos and royal blues",
  "violets and purples",
  "magentas and fuchsias",
  "crimsons and burgundies",
  "terracottas and clays",
  "plums and aubergines",
  "rose and dusty pinks",
];

export function buildUserMessage(brandDescription: string): string {
  // Pick two distinct families to bias exploration. These are *suggestions* — the brief
  // still wins if it's specific ("a medical app" should not become hot pink). But they
  // break the determinism that makes every generic prompt come back blue/purple.
  const a = Math.floor(Math.random() * HUE_FAMILIES.length);
  let b = Math.floor(Math.random() * HUE_FAMILIES.length);
  if (b === a) b = (b + 1 + Math.floor(Math.random() * (HUE_FAMILIES.length - 1))) % HUE_FAMILIES.length;

  return `Brand description:

${brandDescription.trim()}

Exploration hint (consider these hue families if the brief doesn't strongly demand otherwise; ignore if they'd clash with the brand): ${HUE_FAMILIES[a]}, or ${HUE_FAMILIES[b]}.

Return the structured brand decisions now.`;
}
