import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";
import { generateTheme } from "@design-system/theme-engine";

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

          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            const body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { description?: string };

            if (!body.description || typeof body.description !== "string") {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing 'description' string in request body." }));
              return;
            }

            const started = Date.now();
            const result  = await generateTheme(body.description);
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
