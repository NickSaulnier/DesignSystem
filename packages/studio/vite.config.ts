import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";
import { generateTheme, generateThemeStreamed } from "@nicksaulnier/design-system-theme-engine";

const here = dirname(fileURLToPath(import.meta.url));

// Load .env from the monorepo root (D:/Projects/DesignSystem/.env).
// Keys are read into process.env on the dev-server side only — never bundled into client JS.
dotenv.config({ path: resolve(here, "../../.env") });

export default defineConfig({
  plugins: [
    react(),
    {
      name: "theme-engine-api",
      configureServer(server) {
        server.middlewares.use("/api/generate-theme", async (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Allow", "POST");
            res.end("Method Not Allowed");
            return;
          }

          if (!process.env.ANTHROPIC_API_KEY) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
              error: "ANTHROPIC_API_KEY is not set. Add it to .env at the repo root.",
            }));
            return;
          }

          let body: { description?: string };
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid JSON body." }));
            return;
          }

          if (!body.description || typeof body.description !== "string") {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing 'description' string in request body." }));
            return;
          }

          const accept     = req.headers.accept ?? "";
          const wantsSSE   = accept.includes("text/event-stream");
          const started    = Date.now();

          // Abort the engine call if the client disconnects (cancels the fetch).
          const abortController = new AbortController();
          req.on("close",  () => abortController.abort());
          req.on("aborted", () => abortController.abort());

          if (wantsSSE) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            // Disable proxy buffering — keeps phase events from being held back.
            res.setHeader("X-Accel-Buffering", "no");

            const sendFrame = (data: unknown) => {
              res.write(`data: ${JSON.stringify(data)}\n\n`);
            };

            try {
              for await (const event of generateThemeStreamed(body.description, {
                signal: abortController.signal,
              })) {
                if (event.type === "done") {
                  const elapsed = Date.now() - started;
                  sendFrame({
                    type: "done",
                    result: { ...event.result, elapsedMs: elapsed },
                  });
                } else {
                  sendFrame(event);
                }
              }
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              console.error("[theme-engine-api] streamed generation failed:", message);
              sendFrame({ type: "error", message });
            } finally {
              res.end();
            }
            return;
          }

          // Non-streaming JSON response (preserves backwards compatibility).
          try {
            const result  = await generateTheme(body.description, {
              signal: abortController.signal,
            });
            const elapsed = Date.now() - started;

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ...result, elapsedMs: elapsed }));
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("[theme-engine-api] generation failed:", message);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: message }));
          }
        });
      },
    },
  ],
  server: {
    port: 5173,
    strictPort: false,
  },
});
