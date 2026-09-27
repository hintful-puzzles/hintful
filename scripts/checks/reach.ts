/**
 * What a file can read: the one walk behind the pre-commit hook's test
 * selection, its game scope and the source-scan split.
 *
 * A file reaches another in three ways, and the walk follows all three:
 *
 *   1. an import, static or dynamic, by relative or root-anchored specifier,
 *      read with `ts.preProcessFile` the way the compiler reads it. A queried
 *      import (`?raw`, `?url`) reaches the file as text and is not followed;
 *   2. an `import.meta.glob` call, taken as the literal directory before its
 *      first wildcard. That is coarser than the pattern and only ever in the
 *      direction of reaching more (`select-tests.ts` says why a hand-rolled
 *      pattern matcher is the thing to avoid). A pattern that is not a literal
 *      reaches everything;
 *   3. `new URL("./x", import.meta.url)`, which is how the app names its worker.
 *
 * **The globs are read in every file the walk visits, not only in the file it
 * starts from.** A guard that reads source through a helper, as the ones built
 * on `engine/testing/enrollment.ts` do, reaches whatever the helper's globs
 * reach, and a walk that read only the test file would miss it.
 *
 * Every answer here errs toward reaching more. The callers turn "reaches" into
 * "runs", so an over-reach costs time and an under-reach costs a check.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

export const ROOT = path.resolve(import.meta.dirname, "../..");

/** Where the suite's test files live; mirrors `vitest.config.ts`'s `include`,
 * which `source-scans.ts --verify` checks. */
const TEST_ROOTS = ["src", "vite-plugins"];

const SCRIPT = /\.[mc]?[jt]s$/;
const GAME_PATH = /^src\/games\/([^/]+)\//;

/** The game whose directory holds `file` (repo-relative), or `null`. */
export function gameOf(file: string): string | null {
  return GAME_PATH.exec(file)?.[1] ?? null;
}

function walk(dir: string, keep: (file: string) => boolean, out: string[] = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, keep, out);
    else if (keep(full)) out.push(full);
  }
  return out;
}

/** Every test file in the suite, repo-relative and sorted. */
export function allTestFiles(): string[] {
  return TEST_ROOTS.flatMap((r) =>
    walk(path.join(ROOT, r), (f) => f.endsWith(".test.ts")),
  )
    .map((f) => path.relative(ROOT, f))
    .sort();
}

/** The game ids, one per directory under `src/games/`. */
function gameIds(): string[] {
  return readdirSync(path.join(ROOT, "src", "games"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

/**
 * Where one glob pattern can match: under `base`, a repo-relative directory
 * ending in `/` (or `""` for everything), with a name ending in `suffix`; or
 * exactly `base`, when the pattern has no wildcard. The suffix is read only
 * from a last segment of the plain form `*<literal>`, so `**​/*.test.ts` does
 * not reach a `.snap` beside it, and anything fancier keeps no suffix.
 */
interface GlobBase {
  base: string;
  suffix: string;
}

interface GlobCall {
  bases: GlobBase[];
  /** `?raw`, `?url`, or `null` for a glob that imports modules. */
  query: string | null;
}

/** What one file says it reads, before anything is followed. */
interface Edges {
  /** Repo-relative targets of its imports; `null` for a specifier that
   * resolves to no file. A queried import (`?raw`) reads its target as text. */
  imports: { target: string | null; queried: boolean }[];
  globs: GlobCall[];
}

const EVERYTHING: GlobBase = { base: "", suffix: "" };

/** Where one glob pattern written in `fromFile` can match. A root-anchored
 * pattern (`/src/…`) is relative to the repository, as Vite reads it. */
function globBase(pattern: string, fromFile: string): GlobBase {
  if (!/^(\.{1,2})?\//.test(pattern)) return EVERYTHING;
  const wildcard = pattern.search(/[*?{[]/);
  const literal = wildcard === -1 ? pattern : pattern.slice(0, wildcard);
  const dir =
    wildcard === -1 ? literal : literal.slice(0, literal.lastIndexOf("/") + 1);
  const abs = dir.startsWith("/")
    ? path.join(ROOT, dir)
    : path.resolve(path.dirname(path.join(ROOT, fromFile)), dir);
  const rel = path.relative(ROOT, abs);
  if (rel.startsWith("..")) return EVERYTHING;
  if (wildcard === -1) return { base: rel, suffix: "" };
  const last = pattern.slice(pattern.lastIndexOf("/") + 1);
  const suffix = /^[^*?{}[\]]+$/.test(last)
    ? `/${last}`
    : (/^\*([^*?{}[\]]+)$/.exec(last)?.[1] ?? "");
  return { base: rel === "" ? "" : `${rel}/`, suffix };
}

/** Whether a glob with this base can match `file` (repo-relative). */
function globReaches({ base, suffix }: GlobBase, file: string): boolean {
  if (base === file) return true;
  if (base !== "" && !base.endsWith("/")) return false;
  return file.startsWith(base) && file.endsWith(suffix);
}

/**
 * Every `import.meta.glob` call in `text`, read from the syntax tree: the doc
 * comments in this tree mention the call constantly, and a regular expression
 * takes that prose for calls (`source-scans.ts` hit it first).
 */
function globCalls(file: string, text: string): GlobCall[] {
  if (!text.includes("import.meta.glob")) return [];
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const out: GlobCall[] = [];
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
      const literals =
        patterns === undefined
          ? null
          : ts.isStringLiteralLike(patterns)
            ? [patterns.text]
            : ts.isArrayLiteralExpression(patterns) &&
                patterns.elements.every(ts.isStringLiteralLike)
              ? patterns.elements.map((e) => (e as ts.StringLiteralLike).text)
              : null;
      const bases =
        literals === null
          ? [EVERYTHING]
          : literals
              // A negated pattern only removes files, so ignoring it reaches more.
              .filter((p) => !p.startsWith("!"))
              .map((p) => globBase(p.replace(/\?.*$/, ""), file));
      out.push({ bases, query: query === "?raw" || query === "?url" ? query : null });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return out;
}

const URL_REF =
  /new URL\(\s*["'`](\.{1,2}\/[^"'`]+)["'`]\s*,\s*import\.meta\.url\s*\)/g;

function resolve(fromFile: string, spec: string): string | null {
  const abs = spec.startsWith("/")
    ? path.join(ROOT, spec)
    : path.resolve(path.dirname(path.join(ROOT, fromFile)), spec);
  const hit = [abs, `${abs}.ts`, path.join(abs, "index.ts")].find(
    (c) => existsSync(c) && statSync(c).isFile(),
  );
  return hit === undefined ? null : path.relative(ROOT, hit);
}

const edgeCache = new Map<string, Edges>();

/** What `file` (repo-relative) reads directly. */
export function edges(file: string): Edges {
  const hit = edgeCache.get(file);
  if (hit !== undefined) return hit;
  const source = readFileSync(path.join(ROOT, file), "utf8");
  const imports: Edges["imports"] = [];
  const specs = ts
    .preProcessFile(source, true, true)
    .importedFiles.map((f) => f.fileName)
    .concat([...source.matchAll(URL_REF)].map((m) => m[1] ?? ""));
  for (const spec of specs) {
    if (!spec.startsWith(".") && !spec.startsWith("/")) continue;
    const target = resolve(file, spec.replace(/\?.*$/, ""));
    imports.push({ target, queried: spec.includes("?") });
  }
  const result = { imports, globs: globCalls(file, source) };
  edgeCache.set(file, result);
  return result;
}

/** Everything one walk reached. */
interface Reach {
  /** Repo-relative files imported as modules, and the walk's own start. */
  files: Set<string>;
  /** Repo-relative files imported as text (`?raw`, `?url`). */
  texts: Set<string>;
  /** Where the globs on the walk can match. */
  bases: GlobBase[];
  /**
   * Whether the walk reaches every file: through a glob that imports modules,
   * whose closure this walk does not expand, or through an import that
   * resolves to no file, which it cannot follow.
   */
  everything: boolean;
}

/** Whether every base lies under a game directory, so a cut walk treats the
 * glob as reading the games it sweeps rather than something of its own. */
const intoGames = (bases: GlobBase[]) =>
  bases.every(({ base }) => base.startsWith("src/games/"));

/**
 * The walk from `start` (repo-relative).
 *
 * With `cutAtGames`, it does not enter a game directory other than `start`'s
 * own. That separates what a guard reads *itself* from what it reads only
 * through the games it sweeps, and it is why a glob that imports game modules
 * does not make a cut walk reach everything: it reaches the games, and the cut
 * is exactly the decision not to follow them.
 */
export function reach(start: string, { cutAtGames = false } = {}): Reach {
  const own = gameOf(start);
  const out: Reach = {
    files: new Set([start]),
    texts: new Set(),
    bases: [],
    everything: false,
  };
  const queue = [start];
  for (let file = queue.pop(); file !== undefined; file = queue.pop()) {
    const { imports, globs } = edges(file);
    for (const glob of globs) {
      out.bases.push(...glob.bases);
      if (glob.query === null && !(cutAtGames && intoGames(glob.bases))) {
        out.everything = true;
      }
    }
    for (const { target, queried } of imports) {
      if (target === null) {
        out.everything = true;
        continue;
      }
      const game = gameOf(target);
      if (cutAtGames && game !== null && game !== own) continue;
      if (queried) {
        out.texts.add(target);
      } else if (!out.files.has(target)) {
        out.files.add(target);
        if (SCRIPT.test(target)) queue.push(target);
      }
    }
  }
  return out;
}

/** Whether a walk reached `file` (repo-relative), by import or by glob. */
function reaches(r: Reach, file: string): boolean {
  return (
    r.everything ||
    r.files.has(file) ||
    r.texts.has(file) ||
    r.bases.some((b) => globReaches(b, file))
  );
}

/** The snapshot file vitest writes for `test`, which only that test reads. */
function snapshotOf(test: string): string {
  return path.join(path.dirname(test), "__snapshots__", `${path.basename(test)}.snap`);
}

/** Whether `test` reads `file`: by reaching it, or as its own snapshot. */
export function testReads(test: string, walk: Reach, file: string): boolean {
  return reaches(walk, file) || snapshotOf(test) === file;
}

/** What a commit's cross-game cases need: see {@link commitPlan}. */
interface CommitPlan {
  /** The games whose cases can have changed, sorted. Never empty. */
  scope: string[];
  /** The test files outside game directories that read a staged path
   * themselves, and so must run every game's cases. */
  whole: Set<string>;
}

/**
 * Which games' cross-game cases a commit can have changed, and which test files
 * read what it changed themselves. `null` when nothing can be narrowed.
 *
 * A staged path under `src/games/<id>/` puts `<id>` in scope and nothing else:
 * a case titled for another game does not read it (`src/engine/testing/
 * game-scope.ts` states that half). Any other staged path puts in scope every
 * game whose own walk reaches it, and puts in `whole` every test file outside
 * the game directories whose walk reaches it without going through a game. A
 * case in a file outside `whole` then depends on the path only through its
 * game, so skipping the cases of the games outside scope cannot hide a failure
 * the commit caused.
 */
export function commitPlan(staged: readonly string[]): CommitPlan | null {
  const scope = new Set<string>();
  const others = staged.filter((p) => {
    const id = gameOf(p);
    if (id !== null) scope.add(id);
    return id === null;
  });
  const whole = new Set<string>();
  if (others.length > 0) {
    for (const test of allTestFiles()) {
      if (gameOf(test) !== null) continue;
      const own = reach(test, { cutAtGames: true });
      if (others.some((p) => testReads(test, own, p))) whole.add(test);
    }
    for (const id of gameIds()) {
      const walks = walk(
        path.join(ROOT, "src", "games", id),
        (f) => /\.[mc]?[jt]s$/.test(f) && !f.endsWith(".test.ts"),
      ).map((f) => reach(path.relative(ROOT, f)));
      if (others.some((p) => walks.some((w) => reaches(w, p)))) scope.add(id);
    }
  }
  // An empty scope would skip every game's cases; it arises only when no game
  // reaches the change, and then nothing outside `whole` can read it either.
  // Declining to narrow is the answer that needs no argument.
  return scope.size === 0 ? null : { scope: [...scope].sort(), whole };
}
