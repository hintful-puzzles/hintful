/**
 * Which test files are **source scans**: cheap enough to run ahead of the rest.
 *
 * A source scan reads this repo's source as text, through a raw
 * `import.meta.glob`, and asserts something about its shape. It costs
 * milliseconds, and it used to be reported after the whole `vitest run`, because
 * it is a vitest file like any other. `scripts/gate.sh` runs this set as a pass
 * of its own ahead of the rest (`GATE_TEST_PASS` in `vitest.config.ts`).
 *
 * ## Membership is derived from what the file is
 *
 * No roster names a member. A test file is a source scan when BOTH hold:
 *
 *   1. it calls `import.meta.glob` with a `?raw` query, and every glob it calls
 *      has a query (`?raw` or `?url`), so none of them imports code;
 *   2. its import closure reaches no module under `src/games/`.
 *
 * The second is what makes the set cheap, and it is a fact about structure
 * rather than a timing: a board needs a `Game`, and a `Game` comes from a
 * module under `src/games/`. A file that cannot reach one cannot build a board,
 * and cannot even pay the import cost of the registry.
 *
 * The closure is walked over relative specifiers with `ts.preProcessFile`, which
 * reads imports the way the compiler does. It counts `import type` as an edge,
 * and a specifier it cannot resolve ends membership. Both can only move a file
 * *out* of the scan set, and a file outside it still runs, in the main pass.
 *
 * ## Why a wrong answer here cannot lose a test
 *
 * `vitest.config.ts` gives this one list to the scan pass's `include` and to
 * the main pass's `exclude`, so every file is in exactly one pass whatever the
 * list says. `--verify` asks vitest itself, not this function, to confirm it.
 * The worst a misclassification can do is put a slow file in the fast pass.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(import.meta.dirname, "../..");

/** Mirrors `vitest.config.ts`'s `include`; `--verify` checks the two agree. */
const TEST_ROOTS = ["src", "vite-plugins"];

const GAMES = `${path.join(ROOT, "src", "games")}${path.sep}`;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith(".test.ts")) out.push(full);
  }
  return out;
}

function allTestFiles(): string[] {
  return TEST_ROOTS.flatMap((r) => walk(path.join(ROOT, r)))
    .map((f) => path.relative(ROOT, f))
    .sort();
}

type GlobQuery = "?raw" | "?url" | null;

/**
 * The query of every `import.meta.glob` call in `text`, or `null` for a glob
 * that imports modules.
 *
 * Read from the syntax tree rather than with a regular expression, because the
 * doc comments in this tree mention `import.meta.glob(…)` constantly. A regex
 * first pass took that prose for calls and dropped `test-selection.test.ts`.
 * The query sits either in the pattern (`"./x/*.ts?raw"`) or in the options
 * (`{ query: "?raw" }`).
 */
function globQueries(file: string, text: string): GlobQuery[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const out: GlobQuery[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(source) === "import.meta.glob"
    ) {
      const [patterns, options] = node.arguments;
      let query: string | null = null;
      if (options && ts.isObjectLiteralExpression(options)) {
        for (const p of options.properties) {
          if (
            ts.isPropertyAssignment(p) &&
            p.name.getText(source) === "query" &&
            ts.isStringLiteralLike(p.initializer)
          ) {
            query = p.initializer.text;
          }
        }
      }
      const inPattern = patterns?.getText(source).match(/\?(raw|url)\b/);
      if (query === null && inPattern) query = `?${inPattern[1]}`;
      out.push(query === "?raw" || query === "?url" ? query : null);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return out;
}

/** The files `file` imports by relative specifier, resolved as the bundler
 * resolves them (as written, then `.ts`, then `index.ts`). A queried import
 * (`?raw`, `?url`) is text and is skipped; an unresolvable one is `null`. */
function importTargets(file: string, text: string): (string | null)[] {
  const out: (string | null)[] = [];
  for (const { fileName } of ts.preProcessFile(text, true, true).importedFiles) {
    if (!fileName.startsWith(".") && !fileName.startsWith("/")) continue;
    if (fileName.includes("?")) continue;
    const abs = fileName.startsWith("/")
      ? path.join(ROOT, fileName)
      : path.resolve(path.dirname(file), fileName);
    const resolved = [abs, `${abs}.ts`, path.join(abs, "index.ts")].find(
      (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
    );
    out.push(resolved ?? null);
  }
  return out;
}

function isSourceScan(file: string): boolean {
  const text = readFileSync(file, "utf8");
  const queries = globQueries(file, text);
  if (!queries.includes("?raw")) return false;
  if (queries.includes(null)) return false;

  const seen = new Set([file]);
  const queue = [file];
  for (let current = queue.pop(); current !== undefined; current = queue.pop()) {
    const source = current === file ? text : readFileSync(current, "utf8");
    for (const target of importTargets(current, source)) {
      if (target === null || target.startsWith(GAMES)) return false;
      if (seen.has(target) || !/\.[mc]?[jt]s$/.test(target)) continue;
      seen.add(target);
      queue.push(target);
    }
  }
  return true;
}

/** The source-scan test files, repo-relative and sorted. */
export function sourceScanTests(): string[] {
  return allTestFiles().filter((f) => isSourceScan(path.join(ROOT, f)));
}

/** What vitest will run under `GATE_TEST_PASS=<pass>`, repo-relative. */
function listed(pass: "scan" | "main" | null): string[] {
  const env = { ...process.env };
  if (pass === null) delete env["GATE_TEST_PASS"];
  else env["GATE_TEST_PASS"] = pass;
  const out = execFileSync("npx", ["vitest", "list", "--filesOnly", "--json"], {
    cwd: ROOT,
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  const files = JSON.parse(out) as { file: string }[];
  return files.map(({ file }) => path.relative(ROOT, file)).sort();
}

/**
 * Ask vitest, not this script, what each pass runs, and require that the two
 * passes partition what an unsplit run would run: every file in exactly one,
 * and the scan pass not empty. The partition is by construction in
 * `vitest.config.ts`; this is what would notice the day it stops being.
 */
function verify(): void {
  const scan = listed("scan");
  const main = listed("main");
  const whole = listed(null);
  const problems: string[] = [];
  const count = new Map<string, number>();
  for (const f of [...scan, ...main]) count.set(f, (count.get(f) ?? 0) + 1);
  for (const f of whole) {
    const n = count.get(f) ?? 0;
    if (n !== 1) problems.push(`${f} runs in ${n} passes`);
  }
  for (const f of count.keys()) {
    if (!whole.includes(f)) problems.push(`${f} runs only when the suite is split`);
  }
  // A walk that disagrees with vitest's `include` would classify a population
  // other than the one that runs.
  if (allTestFiles().join("\n") !== whole.join("\n")) {
    problems.push("this script's test roots disagree with vitest.config.ts's include");
  }
  if (scan.length === 0) problems.push("the scan pass runs no files");
  if (problems.length > 0) {
    console.error("✗ the scan/main test split is not a partition:");
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log(
    `✓ ${whole.length} test files, each in exactly one pass (${scan.length} source scans).`,
  );
}

if (process.argv[1] === import.meta.filename) {
  if (process.argv.includes("--verify")) verify();
  else process.stdout.write(`${sourceScanTests().join("\n")}\n`);
}
