#!/usr/bin/env node
/**
 * Which tests does a commit run, and which does the push that carries it?
 *
 * Prints the plan `scripts/gate.sh` runs, one line per fact:
 *
 *     ALL                    run every test file, every game's cases
 *     NOTHING                (a push only) the commits already ran all of it
 *
 * or any number of
 *
 *     scope <id>,<id>,…      the games whose cross-game cases run; `-` for none
 *     whole <test file>      run this file with every game's cases
 *     narrow <test file>     run this file with only the `scope` games' cases
 *
 * where `narrow` lines appear only beside a `scope` line. **`ALL` is every
 * unknown answer**; a list is produced only when every changed path is one this
 * script can reason about.
 *
 * ## Two plans: a commit's, and a push's
 *
 * **A push's plan is what its commits can have broken.** `--since <rev>` reads
 * the paths changed between `<rev>` and `HEAD`, selects every test file that
 * reaches one, and narrows the cross-game cases to the games that reach one
 * (`reach.ts`'s `commitPlan`, which says when that is sound).
 *
 * **A commit's plan is the part of that which is its own.** With no flag the
 * paths are the staged ones, and per-game work runs for the games the commit
 * stages and for no other: a game's own test files, and the `<id>: …` cases of
 * the cross-game guards. The games an engine path merely reaches wait for the
 * push, which is what keeps a commit to the midend from costing every game's
 * boards (`build-pipeline`, "A commit runs the per-game work of the games it
 * stages"). Two kinds of file still run `whole` in a commit: a test file that
 * is itself staged, since it is what the author just wrote, and a guard that
 * reads a staged path as text, since a source scan costs milliseconds and its
 * subject is the text.
 *
 * A push prints `NOTHING` when its commits' own plans left none of it out, so a
 * session that touched only games pushes without a second run.
 *
 * ## Which files: a union of two channels
 *
 * `vitest --changed` walks the **static import graph**, and this repo's
 * cross-game guards do not reach their subjects through imports. They read game
 * source as *text* through `import.meta.glob(..., "?raw")`, because `AGENTS.md`
 * requires a guard to find its population by reading what a game **is** rather
 * than from a manifest. A file read as text forms no import edge, so the graph
 * cannot see the coupling. Measured 2026-09-09 (`measure-test-impact-selection`):
 * on a change to a `help/` page, `vitest related` selected **nothing at all**,
 * against three guards that exist to check those files.
 *
 * So a file is selected when either channel reaches a changed path:
 *
 *   1. the import graph, via `vitest list --changed --filesOnly`;
 *   2. `reach.ts`'s walk, which follows imports and reads the globs of every
 *      module it visits. That second half matters: a guard reading source
 *      through a helper (`engine/testing/engine-source.ts`) reaches what the
 *      helper's globs reach, which a scan of the test file alone cannot see.
 *
 * ## A change to comments alone
 *
 * A source file outside the game directories whose code tokens are the same
 * before and after (`sameCode`) has changed nothing a module importing it can
 * observe. It selects only the tests that read it as text. The graph cannot say
 * which path selected a file, so it is consulted only when some path changed
 * in more than its comments. A test file is never read this way: a comment in
 * one can be an instruction to the runner.
 *
 * ## Fail closed
 *
 * A push's plan is `ALL` when any changed path lies outside the directories
 * below (a config file, `package.json`, a template, a script: anything whose
 * blast radius this script does not model), when the union comes out empty, or
 * when anything at all goes wrong. A commit with such a path runs every test
 * file outside the game directories, and the push runs the rest. A wrong `ALL`
 * costs minutes. A wrong list costs a guard.
 *
 * **The hooks use this; CI never does.** `.github/workflows/gate.yml` runs the
 * whole suite on every push to `main`, which is the backstop under both plans.
 *
 * `src/test-selection.test.ts` keeps the channels honest: it fails if a test
 * acquires a read channel neither can see. `--verify` holds the walk and both
 * plans to known positives on the real tree.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import ts from "typescript";
import {
  allTestFiles,
  commitPlan,
  gameOf,
  ROOT,
  reach,
  readsAsText,
  testReads,
} from "./reach.ts";

/** Directories whose blast radius this script models. Anything else → ALL. */
const SELECTABLE = ["src/", "vite-plugins/", "help/"];

/** The `scope` of a plan that runs no game's cases. Not a game id: an id is a
 * directory name, and `src/engine/testing/game-scope.ts` reads this back. */
const NO_GAME = "-";

/** The paths a plan is made for. */
interface Change {
  /** Every changed path, repo-relative. */
  paths: readonly string[];
  /** Those among them that changed in comments and spacing only. */
  prose: ReadonlySet<string>;
}

function git(args: string[]): string {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: 64 * 1024 * 1024,
  });
}

/** A file's text at a git object name, or `null` where it has none. */
function show(spec: string): string | null {
  try {
    return git(["show", spec]);
  } catch {
    return null;
  }
}

/** Every token of `text` that is code: the parser's own leaves, so a `/*`
 * inside a regular expression or a template is not taken for a comment. */
function codeTokens(text: string): string[] {
  const source = ts.createSourceFile("a.ts", text, ts.ScriptTarget.Latest, false);
  const out: string[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isJSDoc(node)) return;
    const children = node.getChildren(source);
    if (children.length === 0) out.push(`${node.kind} ${node.getText(source)}`);
    else children.forEach(visit);
  };
  visit(source);
  return out;
}

/** Whether two versions of a TypeScript file differ in nothing but comments
 * and spacing. */
function sameCode(before: string, after: string): boolean {
  const a = codeTokens(before);
  const b = codeTokens(after);
  return a.length === b.length && a.every((t, i) => t === b[i]);
}

/**
 * The change a plan is made for: the staged one, or with `since` everything
 * between that commit and `HEAD`. A deleted file is listed by its path and a
 * moved one by both.
 */
function changeOf(since: string | null): Change {
  const range = since === null ? ["--cached"] : [since, "HEAD"];
  const paths = git(["diff", "--name-only", "--no-renames", ...range])
    .split("\n")
    .filter(Boolean);
  const prose = new Set(
    paths.filter((p) => {
      if (!p.endsWith(".ts") || p.endsWith(".test.ts") || gameOf(p) !== null)
        return false;
      const before = show(`${since ?? "HEAD"}:${p}`);
      const after = show(since === null ? `:${p}` : `HEAD:${p}`);
      return before !== null && after !== null && sameCode(before, after);
    }),
  );
  return { paths, prose };
}

/** The import-graph channel. Vitest reads git itself: with no `since` it sees
 * staged and unstaged alike, a superset of the commit, which is the safe
 * direction. */
function graphSelected(since: string | null): Set<string> {
  const out = execFileSync(
    "npx",
    [
      "vitest",
      "list",
      since === null ? "--changed" : `--changed=${since}`,
      "--filesOnly",
      "--passWithNoTests",
    ],
    { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  );
  return new Set(
    out
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.endsWith(".test.ts"))
      .map((l) => path.relative(ROOT, path.resolve(ROOT, l))),
  );
}

type Graph = () => Set<string>;
const NO_GRAPH: Graph = () => new Set();

/** Every test file either channel selects for `change`, sorted. */
function selected(change: Change, graph: Graph): string[] {
  const code = change.paths.filter((p) => !change.prose.has(p));
  const byReach = allTestFiles().filter((test) => {
    const walk = reach(test);
    return (
      code.some((p) => testReads(test, walk, p)) ||
      [...change.prose].some((p) => readsAsText(walk, p))
    );
  });
  return [...new Set([...(code.length > 0 ? graph() : []), ...byReach])].sort();
}

/**
 * The test files outside the game directories that read a changed path as
 * text themselves, without going through a game, and every changed test file
 * among them.
 */
function ownTextReaders(paths: readonly string[]): Set<string> {
  const outside = paths.filter((p) => gameOf(p) === null);
  return new Set(
    allTestFiles().filter((test) => {
      if (gameOf(test) !== null) return false;
      if (outside.includes(test)) return true;
      const own = reach(test, { cutAtGames: true });
      return outside.some((p) => readsAsText(own, p));
    }),
  );
}

/** A push's plan, before asking whether the commits already ran it. */
function wholePlan(change: Change, graph: Graph): string[] {
  if (change.paths.length === 0) return ["ALL"];
  // A path this script does not model — a config file, a template, a script,
  // a license. Its blast radius is unknown, so the answer is everything.
  if (!change.paths.every((p) => SELECTABLE.some((s) => p.startsWith(s))))
    return ["ALL"];

  const files = selected(change, graph);
  // Empty means the two channels agree that nothing depends on the change.
  // That is possible, but it is also what a broken selector looks like.
  if (files.length === 0) return ["ALL"];

  const cases = commitPlan(change.paths.filter((p) => !change.prose.has(p)));
  if (cases === null) return files.map((f) => `whole ${f}`);
  const textReaders = ownTextReaders([...change.prose]);
  return [
    `scope ${cases.scope.join(",")}`,
    ...files.map(
      (f) => `${cases.whole.has(f) || textReaders.has(f) ? "whole" : "narrow"} ${f}`,
    ),
  ];
}

/** A commit's plan: the header says what it leaves to the push. */
function commitLines(change: Change, graph: Graph): string[] {
  if (change.paths.length === 0) return ["ALL"];
  const mine = new Set(change.paths.map(gameOf).filter((id) => id !== null));
  const own = (f: string) => {
    const id = gameOf(f);
    return id === null || mine.has(id);
  };
  const modeled = change.paths.every((p) => SELECTABLE.some((s) => p.startsWith(s)));
  // No game reaches the change (a help page, a stylesheet), so no game's
  // boards are at stake and there is nothing to leave to the push.
  if (modeled && commitPlan(change.paths.filter((p) => !change.prose.has(p))) === null)
    return wholePlan(change, graph);
  // Another game's test file runs where it reaches a staged game's own path,
  // through the registry: that is the commit's work and not the push's.
  const games: Change = {
    paths: change.paths.filter((p) => gameOf(p) !== null),
    prose: new Set(),
  };
  const throughMine = new Set(games.paths.length > 0 ? selected(games, NO_GRAPH) : []);
  let files = modeled
    ? selected(change, graph).filter((f) => own(f) || throughMine.has(f))
    : [];
  // Nothing selected, or a path with an unknown blast radius: every file that
  // is not another game's, with the per-game cases left to the push.
  if (files.length === 0) files = allTestFiles().filter(own);
  const whole = ownTextReaders(change.paths);
  return [
    `scope ${[...mine].sort().join(",") || NO_GAME}`,
    ...files.map((f) => `${whole.has(f) ? "whole" : "narrow"} ${f}`),
  ];
}

/** A plan's lines, read back. */
function facts(lines: readonly string[]) {
  const of = (kind: string) =>
    lines.filter((l) => l.startsWith(`${kind} `)).map((l) => l.slice(kind.length + 1));
  return {
    lines,
    scope: (of("scope")[0] ?? "")
      .split(",")
      .filter((id) => id !== "" && id !== NO_GAME),
    whole: of("whole"),
    narrow: of("narrow"),
  };
}

/**
 * Whether a commit's plan left out any of a push's: a file it did not run, a
 * file it narrowed that the push runs whole, or a game whose cases it skipped.
 */
function leavesOut(commit: readonly string[], push: readonly string[]): boolean {
  if (push.includes("ALL")) return true;
  if (commit.includes("ALL")) return false;
  const ran = facts(commit);
  const owed = facts(push);
  const ranFiles = new Set([...ran.whole, ...ran.narrow]);
  return (
    owed.whole.some((f) => !ran.whole.includes(f)) ||
    owed.narrow.some((f) => !ranFiles.has(f)) ||
    (owed.narrow.length > 0 && owed.scope.some((id) => !ran.scope.includes(id)))
  );
}

/** A push's plan: what its commits left out, or `NOTHING`. */
function pushLines(change: Change, graph: Graph): string[] {
  const push = wholePlan(change, graph);
  return leavesOut(commitLines(change, graph), push) ? push : ["NOTHING"];
}

/**
 * Known positives on the real tree, each one a way this script has been, or
 * could be, blind: a walk that finds nothing reports a narrow plan and looks
 * like health. Exit 1 naming each that fails.
 */
function verify(): void {
  const problems: string[] = [];
  const expect = (ok: boolean, what: string) => {
    if (!ok) problems.push(what);
  };
  const changed = (paths: string[], prose: string[] = []): Change => ({
    paths,
    prose: new Set(prose),
  });
  const push = (paths: string[], prose: string[] = []) =>
    facts(wholePlan(changed(paths, prose), NO_GRAPH));
  const commit = (paths: string[]) => facts(commitLines(changed(paths), NO_GRAPH));
  const owed = (paths: string[]) => pushLines(changed(paths), NO_GRAPH);

  const game = push(["src/games/pearl/hint.ts"]);
  expect(
    game.scope.join() === "pearl" && game.whole.length === 0,
    "a Pearl-only push narrows every file to Pearl",
  );
  expect(
    game.narrow.includes("src/engine/hint-resume.test.ts"),
    "a Pearl-only push selects hint-resume through the registry",
  );

  const midend = push(["src/engine/midend.ts"]);
  expect(
    midend.whole.includes("src/engine/hint-resume.test.ts"),
    "the midend is read by every guard itself, so hint-resume runs whole",
  );

  // `src/games/index.ts` sits in the games directory but belongs to no game.
  const registry = push(["src/games/index.ts"]);
  expect(
    registry.whole.includes("src/engine/hint-resume.test.ts"),
    "the registry is read by every guard itself, so hint-resume runs whole",
  );

  // A glob in a helper, not in the test file: the walk must read it.
  const engine = push(["src/engine/latin-hint.ts"]);
  expect(
    engine.whole.includes("src/engine/hint-em-dash.test.ts"),
    "engine-source.ts's glob puts hint-em-dash in whole for an engine module",
  );
  expect(
    engine.scope.includes("solo") && !engine.scope.includes("pearl"),
    "latin-hint.ts reaches Solo and not Pearl",
  );
  // The other direction: the saving itself. A broad glob added to a helper
  // every hint guard imports (`hint-games.ts`, `enrollment.ts`) would make
  // them all whole on every engine push, and nothing would go red, only slow.
  // `engine-source.ts` and `test-source.ts` exist so that it does not.
  for (const guard of ["hint-resume", "hint-quality", "hint-ordinal", "mark-all"]) {
    expect(
      engine.narrow.includes(`src/engine/${guard}.test.ts`),
      `${guard} narrows on an engine module only some games reach`,
    );
  }

  const test = push(["src/engine/hint-quality.test.ts"]);
  expect(
    test.whole.includes("src/engine/hint-quality.test.ts") &&
      test.whole.includes("src/engine/hint-enrollment.test.ts"),
    "a changed test runs whole, and so does test-source.ts's reader",
  );

  const snap = push(["src/__snapshots__/capability-surface.test.ts.snap"]);
  expect(
    snap.lines.includes("whole src/capability-surface.test.ts"),
    "a changed snapshot selects its own test",
  );

  const help = push(["help/games/pearl.md"]);
  expect(
    help.lines.includes("whole src/help-coverage.test.ts"),
    "a help page selects help-coverage through its glob",
  );

  // The commit's plan: the same files, and no game's boards but its own.
  const ownMidend = commit(["src/engine/midend.ts"]);
  expect(
    ownMidend.scope.length === 0 &&
      ownMidend.narrow.includes("src/engine/hint-resume.test.ts") &&
      !ownMidend.lines.some((l) => l.includes(" src/games/pearl/")),
    "a commit to the midend runs hint-resume with no game's cases, and no game's own tests",
  );
  expect(
    owed(["src/engine/midend.ts"]).includes("whole src/engine/hint-resume.test.ts"),
    "the push that carries a midend commit runs hint-resume whole",
  );
  const both = commit(["src/engine/midend.ts", "src/games/pearl/hint.ts"]);
  expect(
    both.scope.join() === "pearl" &&
      both.lines.some((l) => l.includes(" src/games/pearl/")) &&
      !both.lines.some((l) => l.includes(" src/games/solo/")),
    "a commit to the midend and to Pearl runs Pearl's cases and Pearl's tests only",
  );
  expect(
    commit(["src/engine/latin-hint.ts"]).whole.includes(
      "src/engine/hint-em-dash.test.ts",
    ),
    "a commit runs whole a guard that reads the staged module as text",
  );
  expect(
    commit(["src/engine/hint-quality.test.ts"]).whole.includes(
      "src/engine/hint-quality.test.ts",
    ),
    "a commit runs a staged test file whole",
  );
  const config = commit(["vitest.config.ts"]);
  expect(
    config.scope.length === 0 &&
      config.narrow.includes("src/engine/midend.test.ts") &&
      !config.lines.some((l) => l.includes(" src/games/pearl/")),
    "a commit to a path with an unknown blast radius runs every file outside the games",
  );
  expect(
    owed(["vitest.config.ts"]).join() === "ALL",
    "the push that carries such a commit runs everything",
  );
  for (const paths of [["src/games/pearl/hint.ts"], ["help/games/pearl.md"]]) {
    expect(
      owed(paths).join() === "NOTHING",
      `a push of ${paths.join()} alone repeats nothing its commit ran`,
    );
  }

  // Comments alone: the parser's tokens, and the readers of the text.
  expect(
    sameCode("const a = 1; // one\n", "/** One. */\nconst a =\n  1;\n") &&
      !sameCode("const a = /\\/\\*/;\n", "const a = /\\/\\* /;\n") &&
      !sameCode("const a = `/* b */`;\n", "const a = `/* c */`;\n"),
    "sameCode passes a changed comment and refuses a changed regex or template",
  );
  const prose = push(["src/games/index.ts"], ["src/games/index.ts"]);
  expect(
    prose.lines.join() !== "ALL" &&
      !prose.lines.some((l) => l.endsWith(" src/engine/hint-resume.test.ts")),
    "a comment changed in the registry does not select hint-resume",
  );
  const proseEngine = push(["src/engine/latin-hint.ts"], ["src/engine/latin-hint.ts"]);
  expect(
    proseEngine.whole.includes("src/engine/hint-em-dash.test.ts") &&
      !proseEngine.lines.some((l) => l.endsWith(" src/engine/hint-resume.test.ts")),
    "a comment changed in an engine module selects the guard that reads its text, and no walk",
  );

  if (problems.length > 0) {
    console.error("✗ select-tests.ts missed a known coupling, or stopped narrowing:");
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log("✓ select-tests.ts sees every known coupling, and still narrows.");
}

if (process.argv[1] === import.meta.filename) {
  if (process.argv.includes("--verify")) {
    verify();
  } else {
    const flag = process.argv.indexOf("--since");
    const since = flag === -1 ? null : (process.argv[flag + 1] ?? null);
    let lines: string[];
    try {
      if (flag !== -1 && since === null) throw new Error("--since needs a commit");
      let seen: Set<string> | null = null;
      const graph: Graph = () => {
        seen ??= graphSelected(since);
        return seen;
      };
      const change = changeOf(since);
      lines = since === null ? commitLines(change, graph) : pushLines(change, graph);
    } catch {
      // Any failure at all — vitest missing, git unavailable, a parse error —
      // resolves to the safe answer rather than to a smaller test run.
      lines = ["ALL"];
    }
    process.stdout.write(`${lines.join("\n")}\n`);
  }
}
