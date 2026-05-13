import type { BrandTheme } from "@design-system/tokens";
import type { GenerationPhase, ThemeGenerationOutput } from "@design-system/theme-engine";

export interface GenerateThemeResponse {
  theme:       BrandTheme;
  raw:         ThemeGenerationOutput;
  adjustments: string[];
  usage: {
    inputTokens:         number;
    outputTokens:        number;
    cacheCreationTokens: number;
    cacheReadTokens:     number;
  };
  elapsedMs: number;
}

export interface GenerateThemeError {
  error: string;
}

export type StreamEvent =
  | { type: "phase"; phase: GenerationPhase }
  | { type: "done";  result: GenerateThemeResponse }
  | { type: "error"; message: string };

/**
 * Stream a theme generation. Yields phase/done/error events.
 *
 * Uses Server-Sent Events (`text/event-stream`) under the hood. EventSource isn't
 * usable here because it doesn't support POST — we read the response body directly.
 */
export async function* streamThemeGeneration(
  description: string,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent, void, void> {
  const res = await fetch("/api/generate-theme", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept":       "text/event-stream",
    },
    body: JSON.stringify({ description }),
    signal,
  });

  if (!res.ok || !res.body) {
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const errBody = (await res.json()) as GenerateThemeError;
      if (errBody.error) message = errBody.error;
    } catch { /* keep status-text message */ }
    yield { type: "error", message };
    return;
  }

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line. The last segment may be incomplete.
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const frame of parts) {
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (!payload) continue;
          try {
            yield JSON.parse(payload) as StreamEvent;
          } catch {
            // Malformed frame — skip.
          }
        }
      }
    }
  } finally {
    // Best-effort: ensure the underlying network stream is released even if the
    // consumer abandons the iterator. `cancel()` is idempotent.
    try { await reader.cancel(); } catch { /* ignore */ }
  }
}
