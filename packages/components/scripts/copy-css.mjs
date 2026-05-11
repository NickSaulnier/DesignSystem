import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src  = resolve(here, "../src/styles.css");
const dest = resolve(here, "../dist/styles.css");

if (!existsSync(dirname(dest))) {
  mkdirSync(dirname(dest), { recursive: true });
}

copyFileSync(src, dest);
console.log(`copied ${src} -> ${dest}`);
