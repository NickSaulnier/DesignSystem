import { useMemo, useState } from "react";
import { Button } from "@nicksaulnier/design-system-components";
import {
  themeToCSSString,
  themeToTailwindConfigString,
  themeToFigmaTokensString,
  type BrandTheme,
} from "@nicksaulnier/design-system-tokens";

type Format = "css" | "tailwind" | "figma";

interface FormatSpec {
  id:       Format;
  label:    string;
  filename: string;
  language: string;
  build:    (theme: BrandTheme) => string;
}

const FORMATS: FormatSpec[] = [
  {
    id:       "css",
    label:    "CSS variables",
    filename: "theme.css",
    language: "css",
    build:    (t) => themeToCSSString(t),
  },
  {
    id:       "tailwind",
    label:    "Tailwind config",
    filename: "tailwind.config.js",
    language: "javascript",
    build:    (t) => themeToTailwindConfigString(t),
  },
  {
    id:       "figma",
    label:    "Figma Tokens (W3C)",
    filename: "design-tokens.json",
    language: "json",
    build:    (t) => themeToFigmaTokensString(t),
  },
];

interface ExportPanelProps {
  theme: BrandTheme;
}

export function ExportPanel({ theme }: ExportPanelProps) {
  const [active, setActive] = useState<Format>("css");
  const [copied, setCopied] = useState(false);

  const spec     = (FORMATS.find((f) => f.id === active) ?? FORMATS[0]) as FormatSpec;
  const contents = useMemo(() => spec.build(theme), [spec, theme]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contents);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = spec.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="gallery__section export-panel">
      <h2 className="gallery__section-title">Export</h2>
      <p className="gallery__section-description">
        Drop the generated theme into your toolchain. CSS variables work everywhere;
        the Tailwind config is ready to spread into <code>theme.extend</code>; the
        Figma Tokens JSON imports into the Tokens Studio plugin.
      </p>

      <div className="export-panel__tabs" role="tablist" aria-label="Export format">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={active === f.id}
            className={`export-panel__tab${active === f.id ? " export-panel__tab--active" : ""}`}
            onClick={() => setActive(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="export-panel__toolbar">
        <span className="export-panel__filename">{spec.filename}</span>
        <div className="export-panel__actions">
          <Button size="sm" variant="ghost" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button size="sm" variant="secondary" onClick={handleDownload}>
            Download
          </Button>
        </div>
      </div>

      <pre className="export-panel__code" aria-label={`${spec.label} output`}>
        <code data-language={spec.language}>{contents}</code>
      </pre>
    </section>
  );
}
