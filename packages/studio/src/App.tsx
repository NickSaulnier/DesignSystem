import { useCallback, useEffect, useRef, useState } from "react";
import {
  defaultTheme,
  injectTheme,
  safeParseTheme,
  type BrandTheme,
} from "@design-system/tokens";
import { Gallery } from "./Gallery.js";
import {
  BrandInput,
  type GenerationMeta,
  type GenerationStatus,
  type HistoryEntry,
} from "./BrandInput.js";
import { generateThemeFromDescription } from "./api.js";

const HISTORY_LIMIT = 12;
const HISTORY_KEY   = "ds-studio:theme-history:v1";

function loadHistory(): HistoryEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    // Validate each entry's theme against the schema — if the schema has shifted,
    // we silently drop incompatible entries rather than crash on render.
    return parsed
      .filter((entry): entry is HistoryEntry =>
        typeof entry === "object" && entry !== null
        && "description" in entry  && typeof (entry as HistoryEntry).description === "string"
        && "createdAt"   in entry  && typeof (entry as HistoryEntry).createdAt   === "number"
        && "theme"       in entry  && safeParseTheme((entry as HistoryEntry).theme).success,
      )
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryEntry[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Quota exceeded or storage disabled — fail silently.
  }
}

export function App() {
  const [theme, setTheme]           = useState<BrandTheme>(defaultTheme);
  const [status, setStatus]         = useState<GenerationStatus>("idle");
  const [errorMessage, setError]    = useState<string | null>(null);
  const [lastMeta, setLastMeta]     = useState<GenerationMeta | null>(null);
  const [history, setHistory]       = useState<HistoryEntry[]>(() => loadHistory());
  const abortRef                    = useRef<AbortController | null>(null);
  const firstRender                 = useRef(true);

  useEffect(() => {
    // Skip the View Transitions animation on the initial paint — only animate swaps.
    injectTheme(theme, { animated: !firstRender.current });
    firstRender.current = false;
  }, [theme]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const handleGenerate = useCallback(async (description: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("generating");
    setError(null);

    try {
      const result = await generateThemeFromDescription(description, controller.signal);
      if (controller.signal.aborted) return;

      setTheme(result.theme);
      setLastMeta({
        adjustments: result.adjustments,
        usage:       result.usage,
        elapsedMs:   result.elapsedMs,
      });
      setHistory((prev) => [
        { description, theme: result.theme, createdAt: Date.now() },
        ...prev,
      ].slice(0, HISTORY_LIMIT));
      setStatus("success");
    } catch (err) {
      if (controller.signal.aborted) {
        setStatus("idle");
        return;
      }
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
  }, []);

  const handleReset = useCallback(() => {
    setTheme(defaultTheme);
    setStatus("idle");
    setError(null);
    setLastMeta(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleRestore = useCallback((entry: HistoryEntry) => {
    setTheme(entry.theme);
    setStatus("success");
    setError(null);
  }, []);

  return (
    <div className="studio">
      <header className="studio__header">
        <div className="studio__brand">
          <div className="studio__logo">DS</div>
          <div>
            <h1 className="studio__title">Design System Studio</h1>
            <div className="studio__theme-name">
              Theme: <strong>{theme.identity.name}</strong> — {theme.identity.personality.join(" · ")}
            </div>
          </div>
        </div>
      </header>

      <main className="studio__split">
        <aside className="studio__sidebar">
          <BrandInput
            status={status}
            errorMessage={errorMessage}
            lastMeta={lastMeta}
            history={history}
            onGenerate={handleGenerate}
            onCancel={handleCancel}
            onReset={handleReset}
            onRestore={handleRestore}
            onClearHistory={handleClearHistory}
          />
        </aside>
        <section className="studio__preview">
          <Gallery theme={theme} />
        </section>
      </main>
    </div>
  );
}
