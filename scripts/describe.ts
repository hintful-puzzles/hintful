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
import { lintDescription } from "../src/describe/lint.ts";
import { loadDescriptionFile } from "../src/describe/load.ts";
import { unchecked } from "../src/describe/soundness.ts";
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
const skipped: string[] = [];
for (const [f, file] of sources) {
  if (!compiles(file)) {
    // Steps with nothing to compile them into are almost certainly a
    // techniques list cut by mistake, so they are named even at --quiet.
    if ("steps" in file && file.steps !== undefined)
      console.warn(
        `${f}: has steps but no techniques, so it does not compile; write \`techniques: []\` for a game with none`,
      );
    else skipped.push(f);
    continue;
  }
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
if (!quiet)
  for (const f of skipped)
    console.log(`${f}: not compiled, a help page or rules with no techniques`);
for (const f of removed) console.log(`removed ${f}: no description compiles to it`);
if (!quiet || written.length + removed.length > 0)
  console.log(
    `describe: ${wanted.size} compiled modules, ${written.length} written, ${removed.length} removed.`,
  );
const findings = [...sources].flatMap(([f, file]) =>
  lintDescription(file).map((x) => ({ ...x, source: f })),
);
for (const x of findings)
  console.warn(`${x.error ? "error" : "warning"} ${x.source} ${x.where}: ${x.message}`);
// A technique edited, or its rules, since it was last checked sound: the gate
// fails on it, so the writer hears it here with the command that checks it.
const verdicts = JSON.parse(
  readFileSync(`${root}src/describe/soundness.json`, "utf8"),
) as Record<string, string>;
const due = unchecked(sources, verdicts);
const gamesOf = (keys: readonly string[]): string =>
  [
    ...new Set(
      keys.map((k) => {
        const file = sources.get(k.split("#")[0]);
        return file === undefined ? "" : "library" in file ? file.library : file.game;
      }),
    ),
  ].join(",");
if (due.techniques.length > 0)
  console.warn(
    [
      `${due.techniques.length} techniques read differently from when they were last checked sound:`,
      ...due.techniques.map((k) => `  ${k}`),
      `Check them: CHECK_GAMES=${gamesOf(due.techniques)} npx vitest run -c research/technique-check/vitest.config.ts describe-check`,
    ].join("\n"),
  );
if (due.deadEnds.length > 0)
  console.warn(
    [
      `${due.deadEnds.length} dead-end claims read differently from when they were last checked sound:`,
      ...due.deadEnds.map((k) => `  ${k}`),
      `Check them: GAMES=${gamesOf(due.deadEnds)} npx vitest run -c research/technique-check/vitest.config.ts dead-end-check`,
    ].join("\n"),
  );
if (due.orphans.length > 0)
  console.warn(
    [
      `${due.orphans.length} verdicts in src/describe/soundness.json are for a technique or claim that is gone; delete them:`,
      ...due.orphans.map((k) => `  ${k}`),
    ].join("\n"),
  );
if (findings.some((x) => x.error)) process.exitCode = 1;
if (steep.length > 0)
  console.warn(
    [
      "Techniques whose dearest read grows steeply with the board, each a place a",
      'description may cost more than a hand-written ladder (docs/descriptions.md § "What a technique compiles to"):',
      ...steep,
    ].join("\n"),
  );
