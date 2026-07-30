import { cpSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(root, "node_modules/stockfish.wasm");
const targetDir = join(root, "public/engine");

if (!existsSync(sourceDir)) {
  console.warn("stockfish.wasm package not found, skipping copy");
  process.exit(0);
}

mkdirSync(targetDir, { recursive: true });

for (const file of ["stockfish.js", "stockfish.wasm", "stockfish.worker.js"]) {
  cpSync(join(sourceDir, file), join(targetDir, file));
}

console.log("Copied Stockfish engine assets to public/engine");
