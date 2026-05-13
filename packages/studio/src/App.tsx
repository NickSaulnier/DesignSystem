import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  defaultTheme,
  injectTheme,
  safeParseTheme,
  type BrandTheme,
} from "@nicksaulnier/design-system-tokens";
import {
  deriveDarkVariant,
  type GenerationPhase,
} from "@nicksaulnier/design-system-theme-engine";
import { Gallery } from "./Gallery.js";
import {
  BrandInput,
  type GenerationMeta,
  type GenerationStatus,
  type HistoryEntry,
} from "./BrandInput.js";
import { streamThemeGeneration } from "./api.js";

const HISTORY_LIMIT = 12;
const HISTORY_KEY   = "ds-studio:theme-history:v1";
const MODE_KEY      = "ds-studio:mode:v1";

type ModePreference = "light" | "dark" | "auto";

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

function loadMode(): ModePreference {
  if (typeof localStorage === "undefined") return "light";
  const raw = localStorage.getItem(MODE_KEY);
  return raw === "light" || raw === "dark" || raw === "auto" ? raw : "light";
}

function prefersDark(): boolean {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function App() {
  const [theme, setTheme]           = useState<BrandTheme>(defaultTheme);
  const [status, setStatus]         = useState<GenerationStatus>("idle");
  const [errorMessage, setError]    = useState<string | null>(null);
  const [lastMeta, setLastMeta]     = useState<GenerationMeta | null>(null);
  const [history, setHistory]       = useState<HistoryEntry[]>(() => loadHistory());
  const [modePref, setModePref]     = useState<ModePreference>(() => loadMode());
  const [systemDark, setSystemDark] = useState<boolean>(() => prefersDark());
  const [phase, setPhase]           = useState<GenerationPhase | null>(null);
  const abortRef                    = useRef<AbortController | null>(null);
  const firstRender                 = useRef(true);

  // Subscribe to system prefers-color-scheme so "auto" stays current.
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      try { localStorage.setItem(MODE_KEY, modePref); } catch { /* ignore */ }
    }
  }, [modePref]);

  const effectiveDark = modePref === "dark" || (modePref === "auto" && systemDark);

  const displayTheme = useMemo(
    () => (effectiveDark ? deriveDarkVariant(theme) : theme),
    [effectiveDark, theme],
  );

  useEffect(() => {
    // Skip the View Transitions animation on the initial paint — only animate swaps.
    injectTheme(displayTheme, { animated: !firstRender.current });
    firstRender.current = false;
  }, [displayTheme]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const handleGenerate = useCallback(async (description: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("generating");
    setError(null);
    setPhase(null);

    try {
      for await (const event of streamThemeGeneration(description, controller.signal)) {
        if (controller.signal.aborted) return;

        if (event.type === "phase") {
          setPhase(event.phase);
        } else if (event.type === "done") {
          const result = event.result;
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
          setPhase(null);
        } else if (event.type === "error") {
          setError(event.message);
          setStatus("error");
          setPhase(null);
        }
      }
    } catch (err) {
      if (controller.signal.aborted) {
        setStatus("idle");
        setPhase(null);
        return;
      }
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
      setPhase(null);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
    setPhase(null);
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
              Theme: <strong>{displayTheme.identity.name}</strong> — {displayTheme.identity.personality.join(" · ")}
            </div>
          </div>
        </div>
        <ModeToggle value={modePref} onChange={setModePref} />
      </header>

      <main className="studio__split">
        <aside className="studio__sidebar">
          <BrandInput
            status={status}
            phase={phase}
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
          <Gallery theme={displayTheme} />
        </section>
      </main>
    </div>
  );
}

interface ModeToggleProps {
  value:    ModePreference;
  onChange: (next: ModePreference) => void;
}

function ModeToggle({ value, onChange }: ModeToggleProps) {
  const options: Array<{ id: ModePreference; label: string; glyph: string }> = [
    { id: "light", label: "Light", glyph: "☀" },
    { id: "auto",  label: "Auto",  glyph: "◐" },
    { id: "dark",  label: "Dark",  glyph: "☾" },
  ];
  return (
    <div className="mode-toggle" role="radiogroup" aria-label="Color mode">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          className={`mode-toggle__option${value === o.id ? " mode-toggle__option--active" : ""}`}
          onClick={() => onChange(o.id)}
          title={o.label}
        >
          <span aria-hidden="true">{o.glyph}</span>
          <span className="mode-toggle__label">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
