import { useMemo, useState, type ReactNode } from "react";
import { tokenizeTsxLines } from "./highlightTsx.js";

interface DemoCardProps {
  /** The rendered demo. */
  children: ReactNode;
  /**
   * The JSX source that produced the demo. Authored by hand — React can't
   * reflect on JSX at runtime, so this is the unavoidable duplication.
   * Drift risk is real; keep snippets minimal and stable.
   */
  source: string;
  /** Optional label above the preview, e.g. "Variants" or "Sizes". */
  label?: string;
  /** Override the language badge text. Defaults to "TSX". */
  language?: string;
}

/**
 * Wraps a demo with a "Show code" disclosure. Uses native `<details>` so the
 * open/close affordance is keyboard-accessible and screen-reader-readable
 * without any extra ARIA wiring.
 */
export function DemoCard({
  children,
  source,
  label,
  language = "TSX",
}: DemoCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  // Tokenize once per source change. The tokenizer is pure + fast enough that
  // a useMemo is plenty — no need for an off-thread worker.
  const lines = useMemo(() => tokenizeTsxLines(source), [source]);

  return (
    <div className="demo-card">
      {label && <div className="demo-card__label">{label}</div>}
      <div className="demo-card__preview">{children}</div>
      <details className="demo-card__disclosure">
        <summary className="demo-card__summary">
          <CodeIcon />
          <span className="demo-card__summary-text">Show code</span>
        </summary>
        <div className="demo-card__code-wrap">
          <span className="demo-card__lang" aria-hidden="true">{language}</span>
          <button
            type="button"
            className="demo-card__copy"
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <pre className="demo-card__code" aria-label="Source code">
            <code data-language="tsx">
              {lines.map((tokens, i) => (
                <span key={i} className="demo-card__line">
                  {tokens.length === 0
                    ? " "
                    : tokens.map((tok, j) => (
                        <span key={j} data-token={tok.kind}>{tok.text}</span>
                      ))}
                </span>
              ))}
            </code>
          </pre>
        </div>
      </details>
    </div>
  );
}

function CodeIcon() {
  // Two angle-bracket strokes forming </>. 14×14 viewBox, uses currentColor so
  // it tints with the summary's text color (which we toggle on hover).
  return (
    <svg
      className="demo-card__icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 6 L2 12 L8 18" />
      <path d="M16 6 L22 12 L16 18" />
    </svg>
  );
}
