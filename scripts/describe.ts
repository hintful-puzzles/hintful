/**
 * `npm run describe`: compile every `*.description.yaml` under `src/` that
 * compiles to the `*.compiled.ts` beside it (`src/describe/sources.ts` says
 * which). A file with a `library` key is a library of techniques; any other
 * is a game's description, which places a library's techniques with `use`.
 *
 * `src/describe/compile.test.ts` compiles them again in the gate and fails
 * where a compiled module is not what its description compiles to.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "tinyglobby";
import { WARN_GROWTH } from "../src/describe/compile.ts";
import { loadDescriptionFile } from "../src/describe/load.ts";
import { compiledPath, compileSource, compiles } from "../src/describe/sources.ts";

const root = new URL("..", import.meta.url).pathname;
const files = globSync("src/**/*.description.yaml", { cwd: root }).sort();
const sources = new Map(
  files.map((f) => [f, loadDescriptionFile(readFileSync(`${root}${f}`, "utf8"), f)]),
);
const steep: string[] = [];
for (const [f, file] of sources) {
  if (!compiles(file)) continue;
  const out = compiledPath(f);
  const code = compileSource(f, sources);
  writeFileSync(`${root}${out}`, code);
  console.log(`${f} -> ${out}`);
  // Each technique states its growth above it (`techniqueGrowth`).
  for (const m of code.matchAll(
    /grows with the board as n\^([\d.]+)\. \*\/\nexport function (\w+)/g,
  ))
    if (2 * Number(m[1]) >= WARN_GROWTH) steep.push(`  ${out} ${m[2]}: n^${m[1]}`);
}
if (steep.length > 0)
  console.warn(
    [
      "Techniques whose dearest read grows steeply with the board, each a place a",
      'description may cost more than a hand-written ladder (docs/descriptions.md § "What a technique compiles to"):',
      ...steep,
    ].join("\n"),
  );
