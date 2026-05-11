import { useState, type FormEvent } from "react";
import { Button } from "@design-system/components";
import type { BrandTheme } from "@design-system/tokens";

export type GenerationStatus = "idle" | "generating" | "success" | "error";

export interface HistoryEntry {
  description: string;
  theme:       BrandTheme;
  createdAt:   number;
}

export interface GenerationMeta {
  adjustments: string[];
  usage: {
    inputTokens:         number;
    outputTokens:        number;
    cacheCreationTokens: number;
    cacheReadTokens:     number;
  };
  elapsedMs: number;
}

interface BrandInputProps {
  status:          GenerationStatus;
  errorMessage:    string | null;
  lastMeta:        GenerationMeta | null;
  history:         HistoryEntry[];
  onGenerate:      (description: string) => void;
  onCancel:        () => void;
  onReset:         () => void;
  onRestore:       (entry: HistoryEntry) => void;
  onClearHistory:  () => void;
}

const PRESETS: Array<{ label: string; value: string }> = [
  {
    label: "Playful fintech for Gen Z",
    value: "A playful fintech app for Gen Z. Vibrant, optimistic, and approachable — meant to make personal finance feel less intimidating. The audience is 18-25 year olds taking control of their money for the first time.",
  },
  {
    label: "Serious medical records platform",
    value: "A medical records platform used by hospital administrators. Trustworthy, calm, and precise — the audience handles sensitive data and needs the UI to communicate authority and reliability above all else.",
  },
  {
    label: "Indie editorial magazine",
    value: "An online editorial magazine covering art, architecture, and design. Premium and literary, with a strong typographic point of view. Readers expect a quiet, sophisticated reading experience.",
  },
  {
    label: "Developer tool, terminal-first",
    value: "An open-source developer tool for managing local Kubernetes clusters. Terminal-first sensibility, technical and a bit playful. Audience is mid-to-senior software engineers who appreciate a sharp, distinctive look.",
  },
];

export function BrandInput({
  status,
  errorMessage,
  lastMeta,
  history,
  onGenerate,
  onCancel,
  onReset,
  onRestore,
  onClearHistory,
}: BrandInputProps) {
  const [description, setDescription] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!description.trim() || status === "generating") return;
    onGenerate(description);
  };

  const handlePreset = (preset: string) => {
    setDescription(preset);
  };

  return (
    <div className="brand-input">
      <section className="brand-input__section">
        <h2 className="brand-input__title">Describe a brand</h2>
        <p className="brand-input__subtitle">
          Claude generates a complete design system. The whole UI retones instantly.
        </p>

        <form onSubmit={handleSubmit} className="brand-input__form">
          <textarea
            className="brand-input__textarea ds-input"
            rows={6}
            placeholder="e.g. A calm meditation app for tired parents — earthy, soft, restorative…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={status === "generating"}
          />

          <div className="brand-input__actions">
            {status === "generating" ? (
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            ) : (
              <Button type="submit" variant="primary" disabled={!description.trim()}>
                Generate theme
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={onReset} disabled={status === "generating"}>
              Reset
            </Button>
          </div>
        </form>
      </section>

      <section className="brand-input__section">
        <h3 className="brand-input__subheading">Try a preset</h3>
        <div className="brand-input__presets">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="brand-input__preset"
              onClick={() => handlePreset(p.value)}
              disabled={status === "generating"}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {status === "generating" && (
        <section className="brand-input__section brand-input__status brand-input__status--working">
          <div className="brand-input__spinner" aria-hidden="true" />
          <div>
            <strong>Generating theme…</strong>
            <p>Claude is analyzing the brand and selecting design tokens.</p>
          </div>
        </section>
      )}

      {status === "error" && errorMessage && (
        <section className="brand-input__section brand-input__status brand-input__status--error">
          <strong>Generation failed</strong>
          <p>{errorMessage}</p>
        </section>
      )}

      {status === "success" && lastMeta && (
        <section className="brand-input__section">
          <h3 className="brand-input__subheading">Last generation</h3>
          <ul className="brand-input__meta">
            <li>
              <span>Elapsed</span>
              <strong>{(lastMeta.elapsedMs / 1000).toFixed(1)}s</strong>
            </li>
            <li>
              <span>Input tokens</span>
              <strong>{lastMeta.usage.inputTokens.toLocaleString()}</strong>
            </li>
            <li>
              <span>Output tokens</span>
              <strong>{lastMeta.usage.outputTokens.toLocaleString()}</strong>
            </li>
            {lastMeta.usage.cacheReadTokens > 0 && (
              <li>
                <span>Cache read</span>
                <strong>{lastMeta.usage.cacheReadTokens.toLocaleString()}</strong>
              </li>
            )}
          </ul>
          {lastMeta.adjustments.length > 0 && (
            <details className="brand-input__adjustments">
              <summary>Accessibility adjustments ({lastMeta.adjustments.length})</summary>
              <ul>
                {lastMeta.adjustments.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      {history.length > 0 && (
        <section className="brand-input__section">
          <div className="brand-input__history-header">
            <h3 className="brand-input__subheading">History</h3>
            <button
              type="button"
              className="brand-input__clear-history"
              onClick={onClearHistory}
              disabled={status === "generating"}
            >
              Clear
            </button>
          </div>
          <ul className="brand-input__history">
            {history.map((entry) => (
              <li key={entry.createdAt}>
                <button
                  type="button"
                  className="brand-input__history-item"
                  onClick={() => onRestore(entry)}
                  title={entry.description}
                >
                  <strong>{entry.theme.identity.name}</strong>
                  <span>{entry.description.slice(0, 80)}{entry.description.length > 80 ? "…" : ""}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

