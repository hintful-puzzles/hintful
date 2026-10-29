/**
 * `npm run describe`: compile every `*.description.json` under `src/` to the
 * `*.compiled.ts` beside it (`src/describe/sources.ts` says which). A file
 * with a `library` key is a library of techniques; any other is a game's
 * description, which places a library's techniques with `use`.
 *
 * `src/describe/compile.test.ts` compiles them again in the gate and fails
 * where a compiled module is not what its description compiles to.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "tinyglobby";
import { compiledPath, compileSource } from "../src/describe/sources.ts";

const root = new URL("..", import.meta.url).pathname;
const files = globSync("src/**/*.description.json", { cwd: root }).sort();
const sources = new Map(
  files.map((f) => [f, JSON.parse(readFileSync(`${root}${f}`, "utf8")) as unknown]),
);
for (const f of files) {
  const out = compiledPath(f);
  writeFileSync(`${root}${out}`, compileSource(f, sources));
  console.log(`${f} -> ${out}`);
}
