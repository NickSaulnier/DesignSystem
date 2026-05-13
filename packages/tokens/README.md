# @nicksaulnier/design-system-tokens

Design token schema, Zod validators, CSS variable emitter, and export adapters for the AI-powered design system.

## Install

```bash
npm install @nicksaulnier/design-system-tokens
```

## Quick start

```ts
import {
  defaultTheme,
  injectTheme,
  parseTheme,
  type BrandTheme,
} from "@nicksaulnier/design-system-tokens";

// Apply a theme to the document (sets --ds-* CSS variables on <html>)
injectTheme(defaultTheme);

// Validate an arbitrary object against the BrandTheme schema
const valid: BrandTheme = parseTheme(someInput);
```

## What's in the box

| Export | Purpose |
|---|---|
| `BrandThemeSchema`, `parseTheme`, `safeParseTheme` | Zod schema + validators for the full theme shape |
| `ColorScaleSchema`, `TypeScaleSchema`, ... | Sub-schemas for individual token groups |
| `defaultTheme` | A complete neutral baseline theme |
| `themeToCSSVars`, `themeToCSSString` | Convert a theme to `--ds-*` CSS variables |
| `injectTheme(theme, { animated })` | Set CSS vars on `<html>` (optional View Transitions animation) |
| `clearTheme()` | Remove all `--ds-*` variables |
| `themeToTailwindConfig`, `themeToTailwindConfigString` | Export as a Tailwind config object / drop-in `tailwind.config.js` |
| `themeToFigmaTokens`, `themeToFigmaTokensString` | Export as W3C Design Tokens JSON |

## CSS variable naming

All variables are prefixed `--ds-` to avoid collisions:

```css
:root {
  --ds-color-primary-500: #3b82f6;
  --ds-text-primary: #18181b;
  --ds-space-md: 1rem;
  --ds-radius-md: 0.5rem;
  /* ...and so on */
}
```

Pair with [@nicksaulnier/design-system-components](https://www.npmjs.com/package/@nicksaulnier/design-system-components) for ready-made React components driven by these variables, or roll your own.

## License

MIT — see [LICENSE](./LICENSE).

## Repository

[github.com/NickSaulnier/DesignSystem](https://github.com/NickSaulnier/DesignSystem) — full source, monorepo, and the Claude-powered theme studio.
