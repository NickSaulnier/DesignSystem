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

export type GenerationPhase = "analyzing" | "tokens" | "accessibility";

export type ProgressEvent =
  | { type: "phase"; phase: GenerationPhase }
  | { type: "done";  result: GenerateResult }
  | { type: "error"; message: string };

export interface GenerateOptions {
  /** Override the Anthropic client (useful for testing). */
  client?: Anthropic;
  /** Model ID. Defaults to claude-opus-4-7. */
  model?:  string;
  /** Max output tokens. Default 4096 — generation output is small. */
  maxTokens?: number;
  /** Cancel the in-flight request. */
  signal?: AbortSignal;
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
 * Stream a theme generation as a sequence of `ProgressEvent`s.
 *
 * Three phase events surface internal progress to UI:
 * 1. `analyzing` — fires immediately, before the Claude call.
 * 2. `tokens`    — fires when the first non-thinking content block arrives. Adaptive
 *                  thinking emits thinking blocks first; the model's actual structured
 *                  output starts later. This event is the user-visible "Claude is
 *                  producing tokens" signal.
 * 3. `accessibility` — fires before the local `composeTheme` pass, which expands seeds
 *                      into scales and runs contrast adjustments.
 *
 * Always terminates with exactly one `done` or `error` event.
 *
 * Requires `ANTHROPIC_API_KEY` in the environment (or pass a pre-configured client).
 */
export async function* generateThemeStreamed(
  brandDescription: string,
  opts: GenerateOptions = {},
): AsyncGenerator<ProgressEvent, void, void> {
  if (!brandDescription || brandDescription.trim().length < 3) {
    yield { type: "error", message: "Brand description must be at least 3 characters." };
    return;
  }

  const client    = opts.client    ?? new Anthropic();
  const model     = opts.model     ?? DEFAULT_MODEL;
  const maxTokens = opts.maxTokens ?? 4096;

  yield { type: "phase", phase: "analyzing" };

  try {
    const stream = client.messages.stream(
      {
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
          // SDK .d.ts types ZodType from zod v3; runtime uses zod/v4.
          format: zodOutputFormat(ThemeGenerationSchema as never),
        },
      },
      opts.signal ? { signal: opts.signal } : undefined,
    );

    let tokensPhaseEmitted = false;
    for await (const event of stream) {
      if (event.type === "content_block_start") {
        const blockType = event.content_block.type;
        // Adaptive thinking fires `thinking` (and possibly `redacted_thinking`) blocks
        // first; the actual output JSON arrives in a `text` block afterwards.
        if (
          !tokensPhaseEmitted
          && blockType !== "thinking"
          && blockType !== "redacted_thinking"
        ) {
          tokensPhaseEmitted = true;
          yield { type: "phase", phase: "tokens" };
        }
      }
    }

    const finalMessage = await stream.finalMessage();

    // Extract the structured output. `messages.stream()` doesn't populate
    // `parsed_output` the way `parse()` does, so reconstruct it from the text
    // content and validate ourselves.
    const parsed = extractParsedOutput(finalMessage);

    // Structured outputs guarantees schema shape; we still validate hex format ourselves
    // because regex constraints are stripped from the JSON schema we send to the API.
    validateHexFields(parsed);

    yield { type: "phase", phase: "accessibility" };

    const { theme, adjustments }: ComposeResult = composeTheme(parsed);
    const validated = parseTheme(theme);

    const usage = finalMessage.usage as Anthropic.Messages.Usage & {
      cache_creation_input_tokens?: number | null;
      cache_read_input_tokens?: number | null;
    };

    yield {
      type: "done",
      result: {
        theme:       validated,
        raw:         parsed,
        adjustments,
        usage: {
          inputTokens:         usage.input_tokens,
          outputTokens:        usage.output_tokens,
          cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
          cacheReadTokens:     usage.cache_read_input_tokens     ?? 0,
        },
      },
    };
  } catch (err) {
    if (opts.signal?.aborted) return;
    const message = err instanceof Error ? err.message : String(err);
    yield { type: "error", message };
  }
}

/**
 * Generate a BrandTheme from a free-text brand description (non-streaming convenience).
 *
 * Wraps `generateThemeStreamed` and discards intermediate phase events. Use the
 * streamed variant directly if you want to surface progress to a UI.
 */
export async function generateTheme(
  brandDescription: string,
  opts: GenerateOptions = {},
): Promise<GenerateResult> {
  for await (const event of generateThemeStreamed(brandDescription, opts)) {
    if (event.type === "done")  return event.result;
    if (event.type === "error") throw new Error(event.message);
  }
  throw new Error("Stream ended without a terminal event.");
}

function extractParsedOutput(message: Anthropic.Messages.Message): ThemeGenerationOutput {
  // Prefer the SDK-parsed structured output if present.
  const sdkParsed = (message as { parsed_output?: ThemeGenerationOutput }).parsed_output;
  if (sdkParsed) return sdkParsed;

  // Fall back to concatenating text blocks and parsing JSON ourselves. Structured
  // outputs guarantees the model's text content is the JSON we asked for.
  const text = message.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  if (!text) {
    throw new Error("Claude returned no text content — the model may have refused.");
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse Claude output as JSON: ${err instanceof Error ? err.message : String(err)}`);
  }

  return ThemeGenerationSchema.parse(json);
}
