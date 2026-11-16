/**
 * `npm run describe`: compile every `*.description.yaml` under `src/` that
 * compiles to its module under `src/generated/` (`src/describe/sources.ts`
 * says which, and where). A file with a `library` key is a library of
 * techniques; any other is a game's description, which places a library's
 * techniques with `use`.
 *
 * The modules are generated and never committed. Every command that reads one
 * runs this first (`docs/descriptions.md` § "What every game does"), so
 * it writes only a module whose text changed, and removes one no description
 * compiles to any more, which would otherwise stay importable. `--quiet` says
 * nothing when nothing changed, and only how much did when something did.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { globSync } from "tinyglobby";
import { WARN_GROWTH } from "../src/describe/compile.ts";
import { loadDescriptionFile } from "../src/describe/load.ts";
import {
  compiledPath,
  compileSource,
  compiles,
  GENERATED,
} from "../src/describe/sources.ts";

const quiet = process.argv.includes("--quiet");
const root = new URL("..", import.meta.url).pathname;
const files = globSync("src/**/*.description.yaml", {
  cwd: root,
  ignore: [`${GENERATED}/**`],
}).sort();
const sources = new Map(
  files.map((f) => [f, loadDescriptionFile(readFileSync(`${root}${f}`, "utf8"), f)]),
);
const written: string[] = [];
const steep: string[] = [];
const wanted = new Set<string>();
for (const [f, file] of sources) {
  if (!compiles(file)) continue;
  const out = compiledPath(f);
  wanted.add(out);
  const code = compileSource(f, sources);
  const path = `${root}${out}`;
  if (existsSync(path) && readFileSync(path, "utf8") === code) continue;
  // A dev server and a test run may generate at once, and a reader must never
  // see half a module: each writes its own file and renames it into place.
  mkdirSync(dirname(path), { recursive: true });
  const partial = `${path}.${process.pid}.partial`;
  writeFileSync(partial, code);
  renameSync(partial, path);
  written.push(`${f} -> ${out}`);
  // Each technique states its growth above it (`techniqueGrowth`).
  for (const m of code.matchAll(
    /grows with the board as n\^([\d.]+)\. \*\/\nexport function (\w+)/g,
  ))
    if (2 * Number(m[1]) >= WARN_GROWTH) steep.push(`  ${out} ${m[2]}: n^${m[1]}`);
}
const removed = globSync(`${GENERATED}/**/*.compiled.ts`, { cwd: root }).filter(
  (f) => !wanted.has(f),
);
for (const f of removed) rmSync(`${root}${f}`);

if (!quiet) for (const line of written) console.log(line);
for (const f of removed) console.log(`removed ${f}: no description compiles to it`);
if (!quiet || written.length + removed.length > 0)
  console.log(
    `describe: ${wanted.size} compiled modules, ${written.length} written, ${removed.length} removed.`,
  );
if (steep.length > 0)
  console.warn(
    [
      "Techniques whose dearest read grows steeply with the board, each a place a",
      'description may cost more than a hand-written ladder (docs/descriptions.md § "What a technique compiles to"):',
      ...steep,
    ].join("\n"),
  );
