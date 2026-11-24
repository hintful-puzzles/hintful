#!/usr/bin/env node
/**
 * No file of the fill engine is over 800 lines (`fill-engine-by-concern`,
 * design.md § 7). The engine is `src/engine/fill/` and the compiler's part,
 * `src/describe/compile-fill.ts` with `src/describe/fill/`, tests excluded. A
 * concept of the fill board is one module that registers with the code that
 * runs it; a runner that gathers concepts again grows past the bound, which
 * the largest single concepts, the derive and the hide, sit well under.
 *
 * Files are read from disk, not from git, so a new untracked file counts
 * before it is added.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const BOUND = 800;

const root = fileURLToPath(new URL("../..", import.meta.url));
const files = [
  ...["src/engine/fill", "src/describe/fill"].flatMap((dir) =>
    readdirSync(join(root, dir), { recursive: true }).map((f) => join(dir, String(f))),
  ),
  "src/describe/compile-fill.ts",
].filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));

const over = [];
for (const file of files) {
  const text = readFileSync(join(root, file), "utf8");
  const lines = text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
  if (lines > BOUND) over.push(`  ${relative(".", file)}: ${lines} lines`);
}

if (over.length > 0) {
  console.error(
    `✗ fill-lines: ${over.length} file(s) of the fill engine over ${BOUND} lines:`,
  );
  for (const line of over) console.error(line);
  console.error(
    "  Split the file by concept, a module that registers with its runner (docs/engine-catalog.md).",
  );
  process.exit(1);
}
console.log(
  `✓ fill-lines: ${files.length} files of the fill engine, none over ${BOUND} lines.`,
);
