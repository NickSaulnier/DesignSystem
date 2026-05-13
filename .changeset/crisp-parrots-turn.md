---
"@nicksaulnier/design-system-tokens": minor
"@nicksaulnier/design-system-components": minor
---

Initial public release.

- `@nicksaulnier/design-system-tokens`: Zod-validated `BrandTheme` schema, CSS variable emitter (`themeToCSSString`, `injectTheme`, `clearTheme`), default theme, and export adapters for Tailwind config (`themeToTailwindConfig`, `themeToTailwindConfigString`) and W3C Design Tokens JSON (`themeToFigmaTokens`, `themeToFigmaTokensString`).
- `@nicksaulnier/design-system-components`: `Alert`, `Avatar`, `Badge`, `Button`, `Card` (+ subcomponents), `Input`, `Toggle` — all driven by `--ds-*` CSS variables. One stylesheet, zero runtime overhead.
