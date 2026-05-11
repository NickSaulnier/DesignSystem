import type { BrandTheme } from "@design-system/tokens";
import type { ThemeGenerationOutput } from "@design-system/theme-engine";

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

export async function generateThemeFromDescription(
  description: string,
  signal?: AbortSignal,
): Promise<GenerateThemeResponse> {
  const res = await fetch("/api/generate-theme", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
    signal,
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as GenerateThemeError;
      if (body.error) message = body.error;
    } catch {
      // body wasn't JSON — keep the status-text message
    }
    throw new Error(message);
  }

  return (await res.json()) as GenerateThemeResponse;
}
