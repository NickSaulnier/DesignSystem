import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { parseTheme, type BrandTheme } from "@design-system/tokens";
import { composeTheme, type ComposeResult } from "./compose.js";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompts.js";
import {
  ThemeGenerationSchema,
  validateHexFields,
  type ThemeGenerationOutput,
} from "./schemas.js";

export const DEFAULT_MODEL = "claude-opus-4-7";

export interface GenerateOptions {
  /** Override the Anthropic client (useful for testing). */
  client?: Anthropic;
  /** Model ID. Defaults to claude-opus-4-7. */
  model?:  string;
  /** Max output tokens. Default 4096 — generation output is small. */
  maxTokens?: number;
}

export interface GenerateResult {
  theme:       BrandTheme;
  raw:         ThemeGenerationOutput;
  adjustments: string[];
  usage: {
    inputTokens:           number;
    outputTokens:          number;
    cacheCreationTokens:   number;
    cacheReadTokens:       number;
  };
}

/**
 * Generate a BrandTheme from a free-text brand description.
 *
 * Single Claude call with structured outputs (schema-enforced), prompt caching on
 * the system prompt (which contains the font catalog + heuristics), and adaptive
 * thinking. The returned brand-level decisions are composed locally into a full
 * BrandTheme — color scales expanded with culori, characteristics mapped to radius/
 * shadow/motion tokens, accessibility contrast enforced post-generation.
 *
 * Requires `ANTHROPIC_API_KEY` in the environment (or pass a pre-configured client).
 */
export async function generateTheme(
  brandDescription: string,
  opts: GenerateOptions = {},
): Promise<GenerateResult> {
  if (!brandDescription || brandDescription.trim().length < 3) {
    throw new Error("Brand description must be at least 3 characters.");
  }

  const client = opts.client ?? new Anthropic();
  const model  = opts.model  ?? DEFAULT_MODEL;
  const maxTokens = opts.maxTokens ?? 4096;

  const response = await client.messages.parse({
    model,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      { role: "user", content: buildUserMessage(brandDescription) },
    ],
    output_config: {
      // The SDK helper's .d.ts types `ZodType` from `zod` (v3), but the runtime imports
      // from `zod/v4` — our schema is built against v4 so casting is required.
      format: zodOutputFormat(ThemeGenerationSchema as never),
    },
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error("Claude returned no structured output — the model may have refused.");
  }

  // Structured outputs guarantees schema shape; we still validate hex format ourselves
  // because regex constraints are stripped from the JSON schema we send to the API.
  validateHexFields(parsed);

  const { theme, adjustments }: ComposeResult = composeTheme(parsed);

  // Final round-trip through the canonical BrandTheme schema. Catches any composition
  // bug that produced an invalid token shape.
  const validated = parseTheme(theme);

  const usage = response.usage as Anthropic.Messages.Usage & {
    cache_creation_input_tokens?: number | null;
    cache_read_input_tokens?: number | null;
  };

  return {
    theme:       validated,
    raw:         parsed,
    adjustments,
    usage: {
      inputTokens:         usage.input_tokens,
      outputTokens:        usage.output_tokens,
      cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
      cacheReadTokens:     usage.cache_read_input_tokens ?? 0,
    },
  };
}
