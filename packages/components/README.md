# @nicksaulnier/design-system-components

React components driven by `--ds-*` CSS variables. Zero runtime styling overhead — one stylesheet import and you're done.

## Install

```bash
npm install @nicksaulnier/design-system-components @nicksaulnier/design-system-tokens
```

`@nicksaulnier/design-system-tokens` is required to emit the CSS variables the components consume. `react` and `react-dom` (>=18) are peer dependencies.

## Quick start

```tsx
import "@nicksaulnier/design-system-components/styles.css";
import { defaultTheme, injectTheme } from "@nicksaulnier/design-system-tokens";
import { Button, Card, CardHeader, CardTitle, Badge } from "@nicksaulnier/design-system-components";

injectTheme(defaultTheme);

export function App() {
  return (
    <Card elevation="elevated">
      <CardHeader>
        <CardTitle>Hello</CardTitle>
        <Badge variant="solid" tone="success">live</Badge>
      </CardHeader>
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

## Components

`Alert`, `Avatar`, `Badge`, `Button`, `Card` (+ `CardHeader`, `CardBody`, `CardFooter`, `CardTitle`, `CardDescription`), `Input`, `Toggle`.

Every component is theme-aware via CSS variables — swap themes by calling `injectTheme(otherTheme)` and the entire component tree retones instantly. No re-render, no context provider, no runtime CSS-in-JS.

## License

MIT — see [LICENSE](./LICENSE).

## Repository

[github.com/NickSaulnier/DesignSystem](https://github.com/NickSaulnier/DesignSystem) — full source, monorepo, and the Claude-powered theme studio that generates these themes from plain-language brand descriptions.
