# AI-Powered Design System

A React component library where you describe a brand in plain language and Claude generates a complete, consistent design system — then applies it live across real components.

Built as four composable packages: a token schema, a component library, a Claude-powered theme engine, and an interactive studio.

---

## Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Add your Anthropic API key
cp .env.example .env
# then edit .env and paste your key from https://console.anthropic.com/settings/keys

# 3. Build the workspace packages (tokens, components, theme-engine)
pnpm build

# 4. Start the Studio
pnpm --filter @nicksaulnier/design-system-studio dev
```

Open http://localhost:5173, type a brand description (or click a preset), and click **Generate theme**. The entire UI retones in one frame.

**Requirements:** Node 18+, pnpm 9+, an Anthropic API key with credits.

---

## How it works

```
┌────────────────────┐    POST /api/generate-theme    ┌──────────────────────┐
│  Studio (browser)  │ ─────────────────────────────▶ │  Vite middleware     │
│  React + CSS vars  │ ◀─────────────────────────────│  (server-side only)  │
└────────────────────┘       BrandTheme JSON          └──────────┬───────────┘
         │                                                       │
         │ injectTheme(theme)                                    │ generateTheme(description)
         ▼                                                       ▼
   sets --ds-* CSS vars                              ┌──────────────────────┐
   on <html>                                         │  @nicksaulnier/design-system-     │
                                                     │  theme-engine        │
                                                     │                      │
                                                     │  • Claude API call   │
                                                     │    (structured JSON) │
                                                     │  • Color scale       │
                                                     │    expansion (LCH)   │
                                                     │  • Font pair lookup  │
                                                     │  • WCAG contrast fix │
                                                     └──────────┬───────────┘
                                                                │
                                                                ▼
                                                       claude-opus-4-7
                                                       via Anthropic SDK
```

A single Claude call returns brand-level decisions (personality, color seeds, font ID, character enums). Local composition then expands those decisions into a full token set: 11-stop LCH scales from the seeds, radius/shadow/motion presets keyed off the character enums, and WCAG AA contrast enforcement on every text/surface pair.

**The Anthropic API key never reaches the browser.** The SDK runs only in the Vite middleware, server-side.

### Claude integration details

- **Model:** `claude-opus-4-7`
- **Structured outputs** (`output_config.format` + `zodOutputFormat`) — schema-enforced JSON, no retry loop needed
- **Adaptive thinking** — Claude reasons about brand attributes internally before emitting tokens
- **Prompt caching** on the system prompt (which contains the font catalog and design heuristics) — every byte is stable across requests, so the prefix is cached after the first call

### Reliability levers

| Concern | Mechanism |
|---|---|
| Invalid JSON | `messages.parse()` validates against the Zod schema before returning |
| Invalid hex codes | Post-parse validation in [`validateHexFields`](packages/theme-engine/src/schemas.ts) |
| Invented font names | Claude picks from a fixed list of [10 curated pairs](packages/theme-engine/src/fonts.ts) by tag |
| Muddy color scales | LCH color space (perceptually uniform) via `culori`, gamut-clamped |
| Low contrast | `ensureContrast()` walks LCH lightness until WCAG AA passes — adjusts, never rejects |
| Inconsistent radius/shadow/motion | Mapped from `borderCharacter` / `visualMood` / `motionCharacter` enums via presets |

---

## Packages

```
packages/
├── tokens/         # @nicksaulnier/design-system-tokens
├── components/     # @nicksaulnier/design-system-components
├── theme-engine/   # @nicksaulnier/design-system-theme-engine
└── studio/         # @nicksaulnier/design-system-studio  (private)
```

### `@nicksaulnier/design-system-tokens`

The contract. A Zod schema for `BrandTheme` plus a CSS-variable emitter.

```ts
import { defaultTheme, injectTheme, parseTheme } from "@nicksaulnier/design-system-tokens";

injectTheme(defaultTheme);          // sets --ds-* on document.documentElement
const valid = parseTheme(unknown);  // validate any external theme JSON
```

Every variable is prefixed `--ds-` to avoid collisions. The default theme is a neutral blue baseline used as the boot-up theme and as a fallback.

### `@nicksaulnier/design-system-components`

React components consuming `--ds-*` CSS variables — no JS-side styling. One stylesheet (`styles.css`), zero runtime overhead.

Currently shipped: `Button`, `Card` (+ `CardHeader` / `CardBody` / `CardFooter` / `CardTitle` / `CardDescription`), `Badge`, `Input`.

```tsx
import "@nicksaulnier/design-system-components/styles.css";
import { Button, Card, Badge, Input } from "@nicksaulnier/design-system-components";
```

### `@nicksaulnier/design-system-theme-engine`

Claude integration. One function:

```ts
import { generateTheme } from "@nicksaulnier/design-system-theme-engine";

const result = await generateTheme("a calm meditation app for tired parents");
// result.theme — fully-validated BrandTheme
// result.adjustments — notes on contrast fixes that were applied
// result.usage — token counts (input, output, cache read, cache create)
```

Requires `ANTHROPIC_API_KEY` in the environment. **Must run server-side** — never import this into client bundle code.

### `@nicksaulnier/design-system-studio` *(private)*

Vite + React playground. Brand input panel (textarea + presets + history) on the left, live component gallery on the right. The studio's own chrome consumes the same `--ds-*` variables, so the entire app retones when you generate a new theme — not just the showcased components.

---

## Project structure

```
DesignSystem/
├── .env.example
├── package.json              # pnpm workspace root
├── pnpm-workspace.yaml
├── turbo.json                # Turborepo pipeline
├── tsconfig.base.json
├── PLAN.md                   # Original technical plan document
└── packages/
    ├── tokens/
    │   └── src/
    │       ├── schema.ts     # Zod BrandTheme schema + types
    │       ├── css.ts        # themeToCSSVars, injectTheme, clearTheme
    │       ├── defaults.ts   # The hardcoded default theme
    │       └── index.ts
    ├── components/
    │   ├── src/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Input.tsx
    │   │   ├── styles.css    # All component styles, --ds-*-driven
    │   │   └── index.ts
    │   └── scripts/copy-css.mjs
    ├── theme-engine/
    │   └── src/
    │       ├── schemas.ts    # Zod schema for what Claude returns
    │       ├── prompts.ts    # Stable system prompt (cacheable)
    │       ├── fonts.ts      # Curated font pairs + tag index
    │       ├── color.ts      # LCH scale generation (culori)
    │       ├── accessibility.ts  # contrast + ensureContrast
    │       ├── compose.ts    # Brand decisions -> full BrandTheme
    │       ├── generate.ts   # Orchestrator: Claude call + compose
    │       └── index.ts
    └── studio/
        ├── vite.config.ts    # Hosts /api/generate-theme middleware
        └── src/
            ├── App.tsx       # Split-pane layout + state
            ├── BrandInput.tsx
            ├── Gallery.tsx
            ├── api.ts        # Client-side fetch wrapper
            ├── main.tsx
            ├── index.css     # Studio chrome (also --ds-*-driven)
            └── ...
```

---

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Component styling | Plain CSS + CSS variables | Zero runtime overhead, one-file import, no peer config |
| Token validation | Zod | Catch malformed Claude output before it ever renders |
| Color manipulation | `culori` (LCH) | Perceptually uniform color scales from a single seed |
| Anthropic SDK | `@anthropic-ai/sdk` 0.95+ | Structured outputs via `messages.parse()` + `zodOutputFormat` |
| Bundler (libraries) | `tsup` | Painless TS library bundling — ESM + CJS + `.d.ts` |
| Studio | Vite + React 18 | Fast iteration; native ESM dev server |
| Monorepo | pnpm workspaces + Turborepo | Independent packages, shared dev tooling |
| TypeScript | 5.x, strict, `noUncheckedIndexedAccess` | Catches whole classes of bugs at the compiler |

---

## Development

```bash
# Type-check everything
pnpm typecheck

# Rebuild a single package
pnpm --filter @nicksaulnier/design-system-theme-engine build

# Rebuild theme-engine in watch mode while iterating on the engine
pnpm --filter @nicksaulnier/design-system-theme-engine dev

# Run the studio dev server
pnpm --filter @nicksaulnier/design-system-studio dev
```

**Note on workspace deps:** the Studio imports `@nicksaulnier/design-system-theme-engine` from its built `dist/`, so if you change theme-engine source you'll need to rebuild it (or run its `dev` task in parallel) before the change is visible to the Studio.

---

## Security model

- The Anthropic API key lives in `.env` at the repo root. `.env` is gitignored — never committed.
- The SDK is imported only in [`vite.config.ts`](packages/studio/vite.config.ts), which runs server-side. The browser bundle has no SDK code and no key.
- The browser POSTs to `/api/generate-theme`. The middleware reads `process.env.ANTHROPIC_API_KEY`, calls the SDK, and returns only the resulting `BrandTheme` JSON.
- For a production deploy, swap the Vite middleware for a Node server (Express/Fastify) or a serverless function. Client-side code requires no changes.

---

## Roadmap

- [ ] Export formats: CSS variables, Tailwind config, Figma Tokens (W3C)
- [ ] Streamed generation with progress events ("analyzing brand…" → "generating tokens…" → "verifying accessibility…")
- [ ] More components: Alert, Avatar, Toggle, Typography scale showcase
- [ ] Dark-mode variant generation
- [ ] Persistent theme history (localStorage)
- [ ] Animated theme transitions on swap
- [ ] Publish `@nicksaulnier/design-system-tokens` and `@nicksaulnier/design-system-components` to npm
