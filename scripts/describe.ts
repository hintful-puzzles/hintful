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
import { loadDescriptionFile } from "../src/describe/load.ts";
import { compiledPath, compileSource, compiles } from "../src/describe/sources.ts";

const root = new URL("..", import.meta.url).pathname;
const files = globSync("src/**/*.description.yaml", { cwd: root }).sort();
const sources = new Map(
  files.map((f) => [f, loadDescriptionFile(readFileSync(`${root}${f}`, "utf8"), f)]),
);
for (const [f, file] of sources) {
  if (!compiles(file)) continue;
  const out = compiledPath(f);
  writeFileSync(`${root}${out}`, compileSource(f, sources));
  console.log(`${f} -> ${out}`);
}
