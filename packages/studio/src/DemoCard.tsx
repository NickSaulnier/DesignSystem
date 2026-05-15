import { useState, type ReactNode } from "react";

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
}

/**
 * Wraps a demo with a "Show code" disclosure. Uses native `<details>` so the
 * open/close affordance is keyboard-accessible and screen-reader-readable
 * without any extra ARIA wiring.
 */
export function DemoCard({ children, source, label }: DemoCardProps) {
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

  return (
    <div className="demo-card">
      {label && <div className="demo-card__label">{label}</div>}
      <div className="demo-card__preview">{children}</div>
      <details className="demo-card__disclosure">
        <summary className="demo-card__summary">
          <span className="demo-card__summary-icon" aria-hidden="true">‹/›</span>
          <span className="demo-card__summary-text">Show code</span>
        </summary>
        <div className="demo-card__code-wrap">
          <button
            type="button"
            className="demo-card__copy"
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <pre className="demo-card__code" aria-label="Source code">
            <code data-language="tsx">{source}</code>
          </pre>
        </div>
      </details>
    </div>
  );
}
