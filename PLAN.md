# AI-Powered Design System — Technical Plan

## Overview

A React component library where users describe a brand in plain language and Claude generates a complete, consistent design system applied live across real UI components. The system has three distinct layers: a Theme Engine, a Component Library, and a Studio App.

---

## Repository Structure

```
design-system/
├── packages/
│   ├── tokens/          # Token schema, Zod validators, type definitions
│   ├── theme-engine/    # Claude integration, color generation, token normalization
│   ├── components/      # React component library
│   └── studio/          # Interactive playground app (Vite + React)
├── docs/                # Documentation site (optional: Storybook or MDX)
├── package.json         # pnpm workspace root
└── turbo.json           # Turborepo pipeline config
```

**Monorepo tooling:** pnpm workspaces + Turborepo. Keeps packages independently versioned and buildable while sharing dev tooling.

---

## Phase 1 — Foundation

### 1.1 Token Schema (`packages/tokens`)

The schema is the contract between Claude's output and the component system. Every token must be typed and validated before rendering.

**Stack:** TypeScript, Zod

```typescript
// packages/tokens/src/schema.ts

import { z } from "zod";

const ColorScaleSchema = z.object({
  50: z.string(),
  100: z.string(),
  200: z.string(),
  300: z.string(),
  400: z.string(),
  500: z.string(),
  600: z.string(),
  700: z.string(),
  800: z.string(),
  900: z.string(),
  950: z.string(),
});

const TypeScaleSchema = z.object({
  xs:   z.object({ size: z.string(), lineHeight: z.string() }),
  sm:   z.object({ size: z.string(), lineHeight: z.string() }),
  base: z.object({ size: z.string(), lineHeight: z.string() }),
  lg:   z.object({ size: z.string(), lineHeight: z.string() }),
  xl:   z.object({ size: z.string(), lineHeight: z.string() }),
  "2xl": z.object({ size: z.string(), lineHeight: z.string() }),
  "3xl": z.object({ size: z.string(), lineHeight: z.string() }),
  "4xl": z.object({ size: z.string(), lineHeight: z.string() }),
  "5xl": z.object({ size: z.string(), lineHeight: z.string() }),
});

const ShadowScaleSchema = z.object({
  none: z.string(),
  sm:   z.string(),
  base: z.string(),
  md:   z.string(),
  lg:   z.string(),
  xl:   z.string(),
});

export const BrandThemeSchema = z.object({
  identity: z.object({
    name:        z.string(),
    description: z.string(),
    personality: z.array(z.string()),
  }),
  color: z.object({
    primary:   ColorScaleSchema,
    secondary: ColorScaleSchema,
    neutral:   ColorScaleSchema,
    semantic: z.object({
      success: z.string(),
      warning: z.string(),
      error:   z.string(),
      info:    z.string(),
    }),
    surface: z.object({
      base:    z.string(),
      raised:  z.string(),
      overlay: z.string(),
    }),
  }),
  typography: z.object({
    fontFamily: z.object({
      heading: z.string(),
      body:    z.string(),
      mono:    z.string(),
    }),
    scale:      TypeScaleSchema,
    weight: z.object({
      normal: z.number(),
      medium: z.number(),
      bold:   z.number(),
    }),
    lineHeight: z.object({
      tight:   z.number(),
      base:    z.number(),
      relaxed: z.number(),
    }),
  }),
  spacing: z.object({
    base:  z.number(),   // px grid unit (4 or 8)
    scale: z.object({
      xs:  z.string(),
      sm:  z.string(),
      md:  z.string(),
      lg:  z.string(),
      xl:  z.string(),
      "2xl": z.string(),
      "3xl": z.string(),
    }),
  }),
  border: z.object({
    radius: z.object({
      none: z.string(),
      sm:   z.string(),
      md:   z.string(),
      lg:   z.string(),
      xl:   z.string(),
      full: z.string(),
    }),
    width: z.object({
      thin:  z.string(),
      base:  z.string(),
      thick: z.string(),
    }),
  }),
  shadow: ShadowScaleSchema,
  motion: z.object({
    duration: z.object({
      fast: z.string(),
      base: z.string(),
      slow: z.string(),
    }),
    easing: z.object({
      standard:    z.string(),
      decelerate:  z.string(),
      accelerate:  z.string(),
    }),
  }),
});

export type BrandTheme = z.infer<typeof BrandThemeSchema>;
export type ColorScale = z.infer<typeof ColorScaleSchema>;
```

**Exports:** `BrandThemeSchema`, `BrandTheme` type, individual sub-schemas for incremental validation.

---

### 1.2 CSS Variable Emission (`packages/tokens`)

Tokens are emitted as CSS custom properties scoped to `[data-theme]`. Components consume variables — never raw token values. This is what enables live switching.

```typescript
// packages/tokens/src/css.ts

export function themeToCSSVars(theme: BrandTheme): Record<string, string> {
  return {
    "--color-primary-50":  theme.color.primary[50],
    "--color-primary-500": theme.color.primary[500],
    // ... full flatten
    "--font-heading":      theme.typography.fontFamily.heading,
    "--radius-md":         theme.border.radius.md,
    "--shadow-base":       theme.shadow.base,
    "--duration-base":     theme.motion.duration.base,
    // ...
  };
}

export function injectTheme(theme: BrandTheme, target: HTMLElement = document.documentElement): void {
  const vars = themeToCSSVars(theme);
  for (const [key, value] of Object.entries(vars)) {
    target.style.setProperty(key, value);
  }
}
```

---

### 1.3 Core Components (`packages/components`)

**Styling approach:** CSS Modules with CSS variables. Zero runtime overhead. Full TypeScript. No Tailwind dependency for consumers.

Component file structure:
```
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.module.css
│   └── index.ts
├── Input/
├── Card/
├── Badge/
├── Alert/
├── Avatar/
├── Toggle/
└── Typography/
    └── (Heading, Text, Code)
```

**Button example — CSS Module:**
```css
/* Button.module.css */
.root {
  font-family: var(--font-body);
  font-weight: var(--weight-medium);
  border-radius: var(--radius-md);
  transition: all var(--duration-base) var(--easing-standard);
  cursor: pointer;
}

.primary {
  background: var(--color-primary-500);
  color: white;
  box-shadow: var(--shadow-sm);
}

.primary:hover {
  background: var(--color-primary-600);
  box-shadow: var(--shadow-base);
}
```

**Button component:**
```tsx
// Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", children, ...props }: ButtonProps) {
  return (
    <button className={clsx(styles.root, styles[variant], styles[size])} {...props}>
      {children}
    </button>
  );
}
```

**Priority build order:**
1. Button (exercises color, radius, shadow, motion most visibly)
2. Card (surface hierarchy, radius)
3. Badge (color palette breadth)
4. Input (surface, border, focus states)
5. Alert (semantic colors)
6. Typography scale (font families, weights)
7. Avatar (radius extremes)
8. Toggle / Switch (motion, primary color)

---

### 1.4 Default Theme (hardcoded)

Before wiring Claude, ship a complete hardcoded default theme. This validates the entire stack end-to-end and gives you a fallback.

```typescript
export const defaultTheme: BrandTheme = {
  identity: {
    name: "Default",
    description: "Neutral baseline theme",
    personality: ["clean", "professional", "accessible"],
  },
  color: {
    primary: {
      50: "#eff6ff", 100: "#dbeafe", /* ... */ 500: "#3b82f6", /* ... */ 950: "#172554",
    },
    // ...
  },
  // ...
};
```

---

## Phase 2 — AI Integration

### 2.1 Claude Prompt Architecture (`packages/theme-engine`)

**Two-pass generation:**

**Pass 1 — Brand Analysis**

```
System: You are a senior brand strategist and design systems expert. 
Extract brand attributes from user descriptions with precision.

User: "{{userDescription}}"

Return JSON:
{
  "personality": ["adjective1", "adjective2", ...],   // max 5
  "audience": "description of target user",
  "industry": "sector",
  "toneOfVoice": "formal | conversational | playful | authoritative",
  "visualMood": "minimal | expressive | structured | organic",
  "colorDirection": {
    "hue": "warm | cool | neutral | vibrant | muted",
    "primarySeedHex": "#xxxxxx",   // single anchor color
    "secondarySeedHex": "#xxxxxx"
  },
  "typographyDirection": {
    "headingStyle": "serif | sans-serif | display | monospace",
    "bodyStyle": "serif | sans-serif | humanist",
    "pairingRationale": "brief explanation"
  },
  "motionCharacter": "snappy | smooth | minimal | expressive",
  "borderCharacter": "sharp | slightly-rounded | rounded | pill"
}
```

**Pass 2 — Token Generation**

```
System: You are a design systems engineer producing design tokens for a React component library.
Given brand attributes, generate a complete, accessible design token set.

Rules:
- All colors must be valid hex codes
- Primary 500 must achieve WCAG AA contrast (4.5:1) against white OR black surface
- Font families must be available on Google Fonts
- Spacing base must be 4 or 8
- Return ONLY valid JSON matching the schema below — no prose, no markdown fences

Brand attributes:
{{brandAttributesJSON}}

Schema:
{{schemaDefinition}}
```

### 2.2 Color Scale Generation

Claude provides one seed hex per palette. Generate the full 11-stop scale using `culori` in LCH color space for perceptual uniformity.

```typescript
// packages/theme-engine/src/color.ts
import { converter, formatHex, interpolate } from "culori";

const lch = converter("lch");

export function generateColorScale(seedHex: string): ColorScale {
  const seed = lch(seedHex);
  
  // Anchor: 500 = seed color
  // Lighter stops: increase L toward 97, reduce C
  // Darker stops: decrease L toward 10, increase C slightly
  
  const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const lightness = [97, 94, 87, 76, 63, seed.l, 46, 37, 28, 19, 12];
  const chroma    = [8,  14, 28, 42, 55, seed.c, 58, 55, 46, 36, 28];
  
  return Object.fromEntries(
    stops.map((stop, i) => [
      stop,
      formatHex({ mode: "lch", l: lightness[i], c: chroma[i], h: seed.h }),
    ])
  ) as ColorScale;
}
```

### 2.3 Accessibility Enforcement

After generation, before rendering, verify and fix contrast.

```typescript
// packages/theme-engine/src/accessibility.ts
import { wcagContrast } from "culori";

export function enforceContrast(theme: BrandTheme): BrandTheme {
  // Verify primary-500 against white and black surfaces
  // Auto-shift lightness until AA is met — never reject the whole theme
  // Check semantic colors against relevant surfaces
  // Log adjustments made so the Studio can display them
}
```

### 2.4 Font Loading

Use a curated pairing list — do not allow freeform font names from Claude, which risks loading failures.

```typescript
export const APPROVED_FONT_PAIRS: FontPair[] = [
  { heading: "Inter",        body: "Inter",        tags: ["sans", "neutral", "modern"] },
  { heading: "Playfair Display", body: "Source Serif 4", tags: ["serif", "editorial", "premium"] },
  { heading: "Space Grotesk", body: "DM Sans",     tags: ["sans", "technical", "startup"] },
  { heading: "Fraunces",     body: "Nunito",        tags: ["serif", "playful", "warm"] },
  { heading: "Cabinet Grotesk", body: "Satoshi",   tags: ["sans", "bold", "contemporary"] },
  { heading: "Libre Baskerville", body: "Lato",    tags: ["serif", "trustworthy", "formal"] },
  // ...
];
```

Claude selects a pair by tag matching from its `typographyDirection` output. The Studio dynamically loads fonts via `@fontsource` packages or the Google Fonts API link injection.

### 2.5 Validation + Retry

```typescript
// packages/theme-engine/src/generate.ts
export async function generateTheme(description: string): Promise<BrandTheme> {
  const brandAttrs = await runPass1(description);
  
  for (let attempt = 0; attempt < 3; attempt++) {
    const raw = await runPass2(brandAttrs);
    
    const parsed = BrandThemeSchema.safeParse(raw);
    if (parsed.success) {
      return enforceContrast(parsed.data);
    }
    
    // Feed Zod error back to Claude on retry
    // "The previous response failed validation: {{zodError}}. Fix only the invalid fields."
  }
  
  throw new Error("Theme generation failed after 3 attempts");
}
```

---

## Phase 3 — Studio App (`packages/studio`)

**Stack:** Vite + React + TypeScript

### Layout

```
┌─────────────────────────────────────────────────────┐
│  HEADER: Logo + theme name + export button          │
├──────────────────┬──────────────────────────────────┤
│  LEFT PANEL      │  RIGHT PANEL                     │
│                  │                                  │
│  Brand Input     │  Component Preview               │
│  ─────────────   │  ─────────────────               │
│  [text area]     │  [tabs: Button | Card | Form...] │
│  [Generate btn]  │                                  │
│                  │  Token Inspector                 │
│  Theme History   │  ─────────────────               │
│  ─────────────   │  Color palette swatches          │
│  • saved theme 1 │  Typography specimen             │
│  • saved theme 2 │  Spacing/radius/shadow grid      │
│                  │                                  │
└──────────────────┴──────────────────────────────────┘
```

### State Management

```typescript
interface StudioState {
  currentTheme: BrandTheme | null;
  themeHistory: Array<{ theme: BrandTheme; description: string; createdAt: Date }>;
  generationStatus: "idle" | "analyzing" | "generating" | "applying" | "error";
  generationError: string | null;
  selectedPreviewTab: string;
}
```

### Live Preview Mechanism

```tsx
// Apply theme to preview iframe or scoped container
// Use data-theme attribute + CSS variable injection
// Preview container is isolated from Studio chrome

function ThemeProvider({ theme, children }: { theme: BrandTheme; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (ref.current && theme) {
      injectTheme(theme, ref.current);
    }
  }, [theme]);
  
  return <div ref={ref} data-theme="generated">{children}</div>;
}
```

---

## Phase 4 — Export + Package

### Export Formats

| Format | Output | Use case |
|---|---|---|
| CSS Variables | `:root { --color-primary-500: ... }` | Any web project |
| Tailwind Config | `theme.extend: { colors: ... }` | Tailwind projects |
| Figma Tokens | W3C Design Tokens JSON | Figma Variables import |
| JS Object | `export const theme = { ... }` | Direct JS consumption |

### npm Package

- `packages/components` published as `@your-org/ds-components`
- `packages/tokens` published as `@your-org/ds-tokens`
- Peer deps: React 18+
- Bundle with `tsup` — ESM + CJS + `.d.ts`
- Include a `style.css` with base CSS variables for the default theme

---

## Key Technical Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Claude returns invalid JSON | Zod validation + retry loop with error feedback in prompt |
| Color scale looks muddy | LCH color space via `culori` — perceptually uniform scales |
| Generated font names don't load | Curated approved pairs list; Claude picks by tag, not by name |
| Low contrast accessibility failures | Post-generation contrast enforcement — adjust, don't reject |
| Typography pairing looks bad | Curated pairs from known-good combinations |
| Slow generation UX | Stream Pass 1 result to UI, show "Analyzing brand..." then "Generating tokens..." |
| CSS variable naming collisions | All vars prefixed with `--ds-` namespace |

---

## Build Order (Start Here)

```
Week 1:  Token schema + Zod validators + TypeScript types
Week 2:  CSS variable emitter + default theme + theme injection
Week 3:  Button, Card, Badge, Input components (consuming CSS vars)
Week 4:  Studio shell (layout, state, ThemeProvider, hardcoded theme wired)
Week 5:  Claude Pass 1 prompt + brand attribute extraction
Week 6:  Claude Pass 2 prompt + full token generation + Zod retry loop
Week 7:  Color scale generation (culori) + accessibility enforcement
Week 8:  Font pairing system + Studio polish + theme history
Week 9:  Export formats (CSS, Tailwind, Figma Tokens)
Week 10: npm packaging + docs
```

---

## Dependencies

```json
{
  "packages/tokens": {
    "zod": "^3.x"
  },
  "packages/theme-engine": {
    "culori": "^3.x",
    "@anthropic-ai/sdk": "^0.x",
    "zod": "^3.x"
  },
  "packages/components": {
    "clsx": "^2.x",
    "react": "^18.x"
  },
  "packages/studio": {
    "vite": "^5.x",
    "react": "^18.x",
    "@fontsource-variable/*": "latest"
  },
  "root devDependencies": {
    "typescript": "^5.x",
    "turbo": "^2.x",
    "tsup": "^8.x"
  }
}
```

---

## First Three Files to Write

1. `packages/tokens/src/schema.ts` — Zod schema + TypeScript types
2. `packages/tokens/src/css.ts` — Token-to-CSS-variable flattener
3. `packages/tokens/src/defaults.ts` — Complete hardcoded default theme

Everything else builds on these three.
