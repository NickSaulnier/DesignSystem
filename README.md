# AI-Powered Design System

A React component library where you describe a brand in plain language and Claude generates a complete, consistent design system — then applies it live across real components.

Built as four composable packages: a token schema, a component library, a Claude-powered theme engine, and an interactive studio.

**Highlights**

- One prompt in plain language → full token set (color scales, typography pair, semantic colors, radius/shadow/motion presets) in ~5–10 seconds.
- Animated, schema-validated, WCAG-AA-enforced. No invalid hex codes, no muddy color scales, no contrast failures.
- **18-component library** — buttons, forms, overlays, navigation, data display. Every component drives off `--ds-*` CSS variables, so a single theme swap retones the whole tree.
- **Live retoning** — the entire UI (chrome included) reflows in one frame via CSS variables. No re-render, no provider, no runtime CSS-in-JS.
- **Streamed progress** — UI shows phase events as Claude works (`Analyzing brand…` → `Generating tokens…` → `Verifying contrast…`).
- **Dark mode** derived deterministically from any generated theme. Toggle Light / Auto / Dark in the header. Native browser controls (select popups, scrollbars) retone via `color-scheme` too.
- **Export** the result as CSS variables, a drop-in `tailwind.config.js`, or W3C Design Tokens JSON.
- **Persistent history** of every generation, restorable in one click.

---

## Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Add your Anthropic API key
cp .env.example .env
# then edit .env and paste your key from https://console.anthropic.com/settings/keys

# 3. Build the workspace packages
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
│  React + CSS vars  │ ◀───── SSE: phase events ──── │  (server-side only)  │
└────────────────────┘        + final BrandTheme      └──────────┬───────────┘
         │                                                       │
         │ injectTheme(theme)                                    │ generateThemeStreamed(...)
         ▼                                                       ▼
   sets --ds-* CSS vars                              ┌──────────────────────┐
   on <html> (animated                               │  theme-engine        │
   with View Transitions)                            │                      │
                                                     │  • Claude API call   │
                                                     │    (structured JSON, │
                                                     │     streamed)        │
                                                     │  • Color scale       │
                                                     │    expansion (LCH)   │
                                                     │  • Font pair lookup  │
                                                     │  • WCAG contrast fix │
                                                     │  • Dark variant      │
                                                     │    derivation        │
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
- **Streamed responses** — phase events surface progress to the UI; non-thinking content blocks trigger the `tokens` phase signal
- **Prompt caching** on the system prompt (font catalog + heuristics) — every byte is stable across requests, so the prefix is cached after the first call
- **Hue exploration** — the user-message contains a per-request random hue hint, so identical brand descriptions don't deterministically produce the same palette

### Reliability levers

| Concern | Mechanism |
|---|---|
| Invalid JSON | Zod schema validation on the accumulated streamed message before composition |
| Invalid hex codes | Post-parse validation in [`validateHexFields`](packages/theme-engine/src/schemas.ts) |
| Invented font names | Claude picks from a fixed list of [10 curated pairs](packages/theme-engine/src/fonts.ts) by tag |
| Muddy color scales | LCH color space (perceptually uniform) via `culori`, gamut-clamped |
| Low contrast | `ensureContrast()` walks LCH lightness until WCAG AA passes — adjusts, never rejects |
| Inconsistent radius/shadow/motion | Mapped from `borderCharacter` / `visualMood` / `motionCharacter` enums via presets |
| Dark mode coherence | `deriveDarkVariant` reverses scales rather than asking the model twice; bright-seed guard for already-dark brands |
| Cancellation | `AbortController` propagates from browser → Vite middleware → SDK call; tokens stop billing immediately |

---

## Packages

```
packages/
├── tokens/         # @nicksaulnier/design-system-tokens         (published)
├── components/     # @nicksaulnier/design-system-components     (published)
├── theme-engine/   # @nicksaulnier/design-system-theme-engine   (private, server-side)
└── studio/         # @nicksaulnier/design-system-studio         (private)
```

### `@nicksaulnier/design-system-tokens`

The contract. A Zod schema for `BrandTheme`, a CSS-variable emitter, and pure-function export adapters.

```ts
import {
  defaultTheme,
  injectTheme,
  parseTheme,
  themeToCSSString,
  themeToTailwindConfigString,
  themeToFigmaTokensString,
} from "@nicksaulnier/design-system-tokens";

injectTheme(defaultTheme);                       // sets --ds-* on <html>
const valid = parseTheme(unknown);               // validate any external theme JSON
const css   = themeToCSSString(defaultTheme);    // ":root { --ds-color-primary-500: ... }"
const tw    = themeToTailwindConfigString(defaultTheme);  // drop-in tailwind.config.js
const figma = themeToFigmaTokensString(defaultTheme);     // W3C Design Tokens JSON
```

Every variable is prefixed `--ds-` to avoid collisions. The default theme is a neutral blue baseline used as the boot-up theme and as a fallback.

### `@nicksaulnier/design-system-components`

React components consuming `--ds-*` CSS variables — no JS-side styling. One stylesheet (`styles.css`), zero runtime overhead.

Shipped (grouped by use):

| Category | Components |
|---|---|
| **Actions** | `Button`, `Menu` (+ `MenuTrigger` / `MenuContent` / `MenuItem` / `MenuSeparator`) |
| **Forms** | `Input`, `Select`, `Slider`, `Toggle` |
| **Feedback** | `Alert`, `Badge`, `Progress`, `Tooltip`, `Skeleton` |
| **Containment** | `Card` (+ `CardHeader` / `CardBody` / `CardFooter` / `CardTitle` / `CardDescription`), `Modal` (+ `ModalHeader` / `ModalBody` / `ModalFooter` / `ModalTitle` / `ModalDescription` / `ModalCloseButton`) |
| **Navigation** | `Tabs` (+ `TabList` / `Tab` / `TabPanel`), `Breadcrumb` (+ `BreadcrumbItem`), `Pagination` |
| **Data display** | `Table` (+ `TableHead` / `TableBody` / `TableFoot` / `TableRow` / `TableHeadCell` / `TableCell`), `Avatar` |

Overlay components (`Modal`, `Menu`) render through a synchronous `Portal` to `document.body`; `Modal` trap-focuses on open and locks body scroll. All components are keyboard-navigable per WAI-ARIA conventions.

```tsx
import "@nicksaulnier/design-system-components/styles.css";
import {
  Button, Card, Badge, Input, Toggle,
  Modal, Tooltip, Menu, MenuTrigger, MenuContent, MenuItem,
  Tabs, TabList, Tab, TabPanel, Table, Pagination, Breadcrumb,
} from "@nicksaulnier/design-system-components";
```

### `@nicksaulnier/design-system-theme-engine` *(private)*

Claude integration. Two surfaces — streaming and non-streaming:

```ts
import {
  generateTheme,           // Promise<GenerateResult>
  generateThemeStreamed,   // AsyncIterable<ProgressEvent>
  deriveDarkVariant,       // pure: BrandTheme (light) → BrandTheme (dark)
} from "@nicksaulnier/design-system-theme-engine";

// Simple: await the full result
const result = await generateTheme("a calm meditation app for tired parents");

// With progress: stream phase events
for await (const event of generateThemeStreamed("an indie magazine")) {
  if (event.type === "phase") console.log(event.phase);   // analyzing / tokens / accessibility
  if (event.type === "done")  console.log(event.result.theme);
  if (event.type === "error") console.error(event.message);
}
```

Requires `ANTHROPIC_API_KEY` in the environment. **Must run server-side** — never import this into client bundle code. (The studio imports only the pure `deriveDarkVariant` + types in the browser; everything else lives in Vite middleware.)

### `@nicksaulnier/design-system-studio` *(private)*

Vite + React playground. Brand input panel (textarea + presets + history) on the left, live component gallery on the right. The studio's own chrome consumes the same `--ds-*` variables, so the entire app retones when you generate a new theme — not just the showcased components. View Transitions animate every swap.

---

## Project structure

```
DesignSystem/
├── .changeset/                 # Changesets release infrastructure
├── .github/workflows/          # release.yml (Changesets action)
├── .env.example
├── ROADMAP.md                  # Agent-actionable task briefs
├── package.json                # pnpm workspace root
├── pnpm-workspace.yaml
├── turbo.json
└── packages/
    ├── tokens/
    │   └── src/
    │       ├── schema.ts           # Zod BrandTheme schema + types
    │       ├── css.ts              # themeToCSSVars, injectTheme, clearTheme
    │       ├── defaults.ts         # The hardcoded default theme
    │       ├── exports/
    │       │   ├── tailwind.ts     # themeToTailwindConfig(String)
    │       │   └── figma.ts        # themeToFigmaTokens(String)
    │       └── index.ts
    ├── components/
    │   └── src/
    │       ├── Alert.tsx, Avatar.tsx, Badge.tsx, Breadcrumb.tsx,
    │       ├── Button.tsx, Card.tsx, Input.tsx, Menu.tsx, Modal.tsx,
    │       ├── Pagination.tsx, Progress.tsx, Select.tsx, Skeleton.tsx,
    │       ├── Slider.tsx, Table.tsx, Tabs.tsx, Toggle.tsx, Tooltip.tsx
    │       ├── internal/
    │       │   ├── Portal.tsx          # Synchronous createPortal wrapper
    │       │   └── useFocusTrap.ts     # Tab cycling + previous-focus restore
    │       ├── styles.css              # All component styles, --ds-*-driven
    │       └── index.ts
    ├── theme-engine/
    │   └── src/
    │       ├── schemas.ts          # Zod schema for what Claude returns
    │       ├── prompts.ts          # System prompt (cacheable) + user-msg with hue hint
    │       ├── fonts.ts            # Curated font pairs + tag index
    │       ├── color.ts            # LCH scale generation (culori)
    │       ├── accessibility.ts    # contrast + ensureContrast
    │       ├── compose.ts          # composeTheme + deriveDarkVariant
    │       ├── generate.ts         # generateTheme + generateThemeStreamed
    │       └── index.ts
    └── studio/
        ├── vite.config.ts          # Hosts /api/generate-theme middleware (JSON + SSE)
        └── src/
            ├── App.tsx             # Split-pane layout, mode toggle, history
            ├── BrandInput.tsx      # Form + phase-aware progress copy
            ├── Gallery.tsx         # Live component showcase
            ├── ExportPanel.tsx     # CSS / Tailwind / Figma exports
            ├── api.ts              # Streaming SSE reader
            ├── main.tsx
            └── index.css           # Studio chrome (also --ds-*-driven)
```

---

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Component styling | Plain CSS + CSS variables | Zero runtime overhead, one-file import, no peer config |
| Token validation | Zod | Catch malformed Claude output before it ever renders |
| Color manipulation | `culori` (LCH) | Perceptually uniform color scales from a single seed |
| Anthropic SDK | `@anthropic-ai/sdk` 0.95+ | Structured outputs, streaming, adaptive thinking, prompt caching |
| Theme transitions | View Transitions API | Native crossfade on theme swap, zero JS animation cost |
| Streamed transport | SSE (`text/event-stream`) | EventSource doesn't allow POST, so we read the body ourselves |
| Bundler (libraries) | `tsup` | Painless TS library bundling — ESM + CJS + `.d.ts` |
| Studio | Vite + React 18 | Fast iteration; native ESM dev server |
| Monorepo | pnpm workspaces + Turborepo | Independent packages, shared dev tooling |
| Release | Changesets + GitHub Actions | Version PR → publish on merge |
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

### Releasing

Versioning and publishing are managed by [Changesets](https://github.com/changesets/changesets).

```bash
# Author a changeset describing what changed (interactive)
pnpm changeset

# Locally simulate the version bump
pnpm version-packages
```

On push to `main`, [`.github/workflows/release.yml`](.github/workflows/release.yml) either opens a **"Version Packages"** PR (if changesets are pending) or publishes the bumped versions to npm (after that PR is merged). Requires `NPM_TOKEN` set as a repo secret. Only `tokens` and `components` are published; `theme-engine` and `studio` are marked private/ignored.

---

## Security model

- The Anthropic API key lives in `.env` at the repo root. `.env` is gitignored — never committed.
- The SDK is imported only in [`vite.config.ts`](packages/studio/vite.config.ts), which runs server-side. The browser bundle has no SDK calls and no key.
- The browser POSTs to `/api/generate-theme` and reads the SSE event stream. The middleware reads `process.env.ANTHROPIC_API_KEY`, calls the SDK, and forwards events.
- Cancelling the fetch (`controller.abort()`) closes the TCP connection; the middleware listens on `req.close` and propagates an `AbortController` into the SDK, killing the upstream call so tokens stop billing immediately.
- For a production deploy, swap the Vite middleware for a Node server (Express/Fastify) or a serverless function. Client-side code requires no changes.

---

## Roadmap

The core platform is in place: token schema, an 18-component library, Claude-powered generation, streamed progress, dark mode, exports, persistent history. From here, five themes for the next pass:

### Coverage

- [x] ~~**More components.**~~ ✅ Shipped — 11 new components (Modal, Tooltip, Menu, Select, Slider, Progress, Tabs, Table, Pagination, Breadcrumb, Skeleton) plus an internal Portal + focus-trap layer.
- [ ] **Custom font input.** Today Claude picks one of 10 curated Google Fonts pairs. Allow users to supply a CSS `@import` URL or `@font-face` definition and have the engine treat it as the brand body/heading.
- [ ] **More export formats.** Style Dictionary, Theo, iOS Asset Catalog, Android `colors.xml`. Pure functions on `BrandTheme`, same shape as the existing Tailwind/Figma adapters.
- [ ] **Form-state primitives.** A small `<Form>` + `<Field>` pairing that wires labels, hints, errors, and `aria-describedby` automatically. Today every consumer threads `error`/`hint`/`label` props by hand on each input.
- [ ] **Date/time inputs.** `DatePicker`, `TimePicker`, and `DateRangePicker`. Largest gap in the current form surface; would also exercise locale-aware tokens.

### Studio depth

- [ ] **Color palette editor.** Once Claude lands the seeds, let the user hand-tune them. Re-run `composeTheme` locally on each change so contrast adjustments stay live.
- [ ] **Diff view.** Side-by-side view between any two history entries — color scales, font pairs, characteristic enums. Useful for understanding what a brand description nudges.
- [ ] **Theme JSON import.** Paste a `BrandTheme` JSON blob and have it validated + applied. Makes the studio useful as a quick token sanity-check without burning API tokens.

### Engine

- [ ] **Multi-theme palettes.** Optional sectional themes (marketing site vs. app product surface) generated as related variants from one brief.
- [ ] **Hosted theme-engine.** Containerize the Vite middleware logic as a real deployable service — Cloudflare Worker, Vercel function, or a small Node container. The README already notes this swap is near-one-liner.
- [ ] **Streamed cost budget.** Surface running token cost mid-stream so users can cap or cancel mid-generation if a brief is going long.

### Quality

- [x] ~~**Tests.**~~ ✅ Shipped — 77 unit tests via vitest across `@design-system/tokens` and `@design-system/theme-engine`. Covers schema validation, CSS var emit, Tailwind + Figma export adapters, LCH scale generation, WCAG contrast math, `composeTheme`, `deriveDarkVariant`, and `applyTokenEdits`. Run with `pnpm test`.
- [x] ~~**CI on PRs.**~~ ✅ Shipped — `.github/workflows/ci.yml` runs typecheck + build + test on every PR and push to `main`. Concurrency-gated so duplicate pushes cancel earlier runs.
- [ ] **A11y audit beyond contrast.** Focus rings, motion preferences (`prefers-reduced-motion`), ARIA coverage spot-checks per component.
- [ ] **Documentation site.** Astro or VitePress with live component demos against the current theme. Eats the Studio's gallery as its component reference and pairs it with usage docs.

### Settings panel — manual token editing

- [x] ~~**Direct token editing in the Studio.**~~ ✅ Shipped — `SettingsPanel` slide-over with color pickers for seeds + semantic colors, selects for neutral cast / border / visual mood / motion / font pair. Each edit re-runs `applyTokenEdits` locally (no API call) and pushes through the existing `displayTheme` pipeline so dark-mode users see edits applied dark automatically. Pairs with the still-open color palette editor under *Studio depth*.

See [ROADMAP.md](ROADMAP.md) for the original task briefs and the four completed milestones.
