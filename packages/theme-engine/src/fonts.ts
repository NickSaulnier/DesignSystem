/**
 * Curated font pairings. Claude picks an ID by tag match — never freeform names —
 * so the Studio can rely on the heading/body strings actually loading.
 *
 * Every family listed below is available on Google Fonts.
 */

export interface FontPair {
  id:       string;
  heading:  string;
  body:     string;
  mono:     string;
  tags:     string[];
  rationale: string;
}

const SYSTEM_SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const SYSTEM_SERIF = "ui-serif, Georgia, Cambria, serif";
const SYSTEM_MONO = "ui-monospace, 'SF Mono', Menlo, 'Cascadia Mono', monospace";

export const FONT_PAIRS: FontPair[] = [
  {
    id: "inter-jetbrains",
    heading: `"Inter", ${SYSTEM_SANS}`,
    body:    `"Inter", ${SYSTEM_SANS}`,
    mono:    `"JetBrains Mono", ${SYSTEM_MONO}`,
    tags: ["sans", "neutral", "modern", "technical", "saas", "minimal"],
    rationale: "Inter is the workhorse of modern product UI — neutral, dense, screen-optimized.",
  },
  {
    id: "space-grotesk-dm-sans",
    heading: `"Space Grotesk", ${SYSTEM_SANS}`,
    body:    `"DM Sans", ${SYSTEM_SANS}`,
    mono:    `"JetBrains Mono", ${SYSTEM_MONO}`,
    tags: ["sans", "geometric", "startup", "fintech", "developer", "contemporary"],
    rationale: "Geometric headings with a humanist body — common pairing for dev tools and modern startups.",
  },
  {
    id: "playfair-source-serif",
    heading: `"Playfair Display", ${SYSTEM_SERIF}`,
    body:    `"Source Serif 4", ${SYSTEM_SERIF}`,
    mono:    `"JetBrains Mono", ${SYSTEM_MONO}`,
    tags: ["serif", "editorial", "premium", "luxury", "publishing", "elegant"],
    rationale: "High-contrast display serif with a readable text serif — premium and editorial.",
  },
  {
    id: "fraunces-nunito",
    heading: `"Fraunces", ${SYSTEM_SERIF}`,
    body:    `"Nunito", ${SYSTEM_SANS}`,
    mono:    `"JetBrains Mono", ${SYSTEM_MONO}`,
    tags: ["serif", "warm", "playful", "friendly", "rounded", "approachable", "consumer"],
    rationale: "Soft, friendly serif paired with rounded humanist sans — warm, approachable consumer feel.",
  },
  {
    id: "libre-baskerville-lato",
    heading: `"Libre Baskerville", ${SYSTEM_SERIF}`,
    body:    `"Lato", ${SYSTEM_SANS}`,
    mono:    `"JetBrains Mono", ${SYSTEM_MONO}`,
    tags: ["serif", "trustworthy", "formal", "legal", "financial", "traditional", "authority"],
    rationale: "Classical book serif with a calm sans body — conveys authority and tradition.",
  },
  {
    id: "manrope-manrope",
    heading: `"Manrope", ${SYSTEM_SANS}`,
    body:    `"Manrope", ${SYSTEM_SANS}`,
    mono:    `"JetBrains Mono", ${SYSTEM_MONO}`,
    tags: ["sans", "modern", "geometric", "balanced", "tech", "clean"],
    rationale: "Single family used across heading and body — quiet, modern, technical without being cold.",
  },
  {
    id: "outfit-ibm-plex-sans",
    heading: `"Outfit", ${SYSTEM_SANS}`,
    body:    `"IBM Plex Sans", ${SYSTEM_SANS}`,
    mono:    `"IBM Plex Mono", ${SYSTEM_MONO}`,
    tags: ["sans", "bold", "youthful", "energetic", "vibrant", "creative", "gen-z"],
    rationale: "Bold rounded display with a technical sans body — punchy and modern without feeling generic.",
  },
  {
    id: "merriweather-open-sans",
    heading: `"Merriweather", ${SYSTEM_SERIF}`,
    body:    `"Open Sans", ${SYSTEM_SANS}`,
    mono:    `"JetBrains Mono", ${SYSTEM_MONO}`,
    tags: ["serif", "readable", "long-form", "news", "blog", "accessible", "calm"],
    rationale: "Highly readable screen-optimized serif with a neutral sans body — long-form content.",
  },
  {
    id: "dm-serif-display-inter",
    heading: `"DM Serif Display", ${SYSTEM_SERIF}`,
    body:    `"Inter", ${SYSTEM_SANS}`,
    mono:    `"JetBrains Mono", ${SYSTEM_MONO}`,
    tags: ["serif", "editorial", "modern", "high-contrast", "magazine", "fashion"],
    rationale: "Sharp high-contrast display serif with a neutral sans body — magazine-style hierarchy.",
  },
  {
    id: "space-mono-inter",
    heading: `"Space Mono", ${SYSTEM_MONO}`,
    body:    `"Inter", ${SYSTEM_SANS}`,
    mono:    `"Space Mono", ${SYSTEM_MONO}`,
    tags: ["mono", "technical", "developer", "terminal", "experimental", "indie"],
    rationale: "Monospaced headings signal a technical or indie posture — useful for developer tools.",
  },
];

export const FONT_PAIR_IDS = FONT_PAIRS.map((p) => p.id) as readonly string[];

export function getFontPair(id: string): FontPair {
  const pair = FONT_PAIRS.find((p) => p.id === id);
  if (!pair) {
    throw new Error(`Unknown font pair id: ${id}. Valid IDs: ${FONT_PAIR_IDS.join(", ")}`);
  }
  return pair;
}

/** Compact catalog string for inclusion in the Claude prompt. */
export function fontPairCatalog(): string {
  return FONT_PAIRS.map((p) => `- "${p.id}" — tags: [${p.tags.join(", ")}]. ${p.rationale}`).join("\n");
}
