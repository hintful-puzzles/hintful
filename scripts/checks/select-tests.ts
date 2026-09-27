#!/usr/bin/env node
/**
 * Which test files can this commit possibly have broken, and which games'
 * cases inside them?
 *
 * Prints the plan `scripts/gate.sh` runs, one line per fact:
 *
 *     ALL                    run every test file, every game's cases
 *
 * or any number of
 *
 *     scope <id>,<id>,…      the games whose cross-game cases can have changed
 *     whole <test file>      run this file with every game's cases
 *     narrow <test file>     run this file with only the `scope` games' cases
 *
 * where `narrow` lines appear only beside a `scope` line. **`ALL` is the default
 * and every unknown answer**; a list is the exception, and it is produced only
 * when every staged path is one this script can reason about.
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
 * So a file is selected when either channel reaches a staged path:
 *
 *   1. the import graph, via `vitest list --changed --filesOnly`;
 *   2. `reach.ts`'s walk, which follows imports and reads the globs of every
 *      module it visits. That second half matters: a guard reading source
 *      through a helper (`engine/testing/engine-source.ts`) reaches what the
 *      helper's glob reaches, which a scan of the test file alone cannot see.
 *
 * ## Which cases: the reach of the games, and of the guards themselves
 *
 * A cross-game guard titles each case `<id>: …`, and `vitest.config.ts` turns
 * the `scope` into the name filter that skips the others, only for the `narrow`
 * files. `reach.ts`'s `commitPlan` says when that is sound: a `narrow` file
 * reaches no staged path except through a game, and every game that reaches one
 * is in `scope`. `src/engine/testing/game-scope.ts` states the other half, that
 * a case titled for a game reads no other game.
 *
 * ## Fail closed
 *
 * `ALL` is printed when: any staged path lies outside the directories below
 * (a config file, `package.json`, a template, a script — anything whose blast
 * radius this script does not model); the union comes out empty; or anything
 * at all goes wrong. A wrong `ALL` costs minutes. A wrong list costs a guard.
 *
 * **The hook uses this; CI never does.** `.github/workflows/ci.yml` runs the
 * whole suite on every push to `main`, which is the backstop that makes a
 * narrower per-commit run safe — the same argument that already scopes biome to
 * staged files in the hook and to the whole tree in CI.
 *
 * `src/test-selection.test.ts` keeps the channels honest: it fails if a test
 * acquires a read channel neither can see. `--verify` holds the walk to known
 * positives on the real tree.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { allTestFiles, commitPlan, ROOT, reach, testReads } from "./reach.ts";

/** Directories whose blast radius this script models. Anything else → ALL. */
const SELECTABLE = ["src/", "vite-plugins/", "help/"];

/** The import-graph channel. Vitest reads git itself, so this sees staged and
 * unstaged alike — a superset of the commit, which is the safe direction. */
function graphSelected(): Set<string> {
  const out = execFileSync(
    "npx",
    ["vitest", "list", "--changed", "--filesOnly", "--passWithNoTests"],
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

/** The reach channel: every test file whose walk reaches a staged path. */
function reachSelected(staged: readonly string[]): string[] {
  return allTestFiles().filter((test) => {
    const walk = reach(test);
    return staged.some((p) => testReads(test, walk, p));
  });
}

function stagedPaths(): string[] {
  return execFileSync(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=ACMRD"],
    { cwd: ROOT, encoding: "utf8" },
  )
    .split("\n")
    .filter(Boolean);
}

/** The plan's lines, as the header describes them. */
function plan(
  staged: readonly string[],
  graph: () => Set<string> = () => new Set(),
): string[] {
  if (staged.length === 0) return ["ALL"];
  // A path this script does not model — a config file, a template, a script,
  // a license. Its blast radius is unknown, so the answer is everything.
  if (!staged.every((p) => SELECTABLE.some((s) => p.startsWith(s)))) return ["ALL"];

  const selected = [...new Set([...graph(), ...reachSelected(staged)])].sort();
  // Empty means the two channels agree that nothing depends on the change.
  // That is possible, but it is also what a broken selector looks like.
  if (selected.length === 0) return ["ALL"];

  const cases = commitPlan(staged);
  if (cases === null) return selected.map((f) => `whole ${f}`);
  return [
    `scope ${cases.scope.join(",")}`,
    ...selected.map((f) => `${cases.whole.has(f) ? "whole" : "narrow"} ${f}`),
  ];
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
  const facts = (staged: string[]) => {
    const lines = plan(staged);
    const of = (kind: string) =>
      lines
        .filter((l) => l.startsWith(`${kind} `))
        .map((l) => l.slice(kind.length + 1));
    return {
      lines,
      scope: of("scope")[0]?.split(",") ?? [],
      whole: of("whole"),
      narrow: of("narrow"),
    };
  };

  const game = facts(["src/games/pearl/hint.ts"]);
  expect(
    game.scope.join() === "pearl" && game.whole.length === 0,
    "a Pearl-only commit narrows every file to Pearl",
  );
  expect(
    game.narrow.includes("src/engine/hint-resume.test.ts"),
    "a Pearl-only commit selects hint-resume through the registry",
  );

  const midend = facts(["src/engine/midend.ts"]);
  expect(
    midend.whole.includes("src/engine/hint-resume.test.ts"),
    "the midend is read by every guard itself, so hint-resume runs whole",
  );

  // `src/games/index.ts` sits in the games directory but belongs to no game.
  const registry = facts(["src/games/index.ts"]);
  expect(
    registry.whole.includes("src/engine/hint-resume.test.ts"),
    "the registry is read by every guard itself, so hint-resume runs whole",
  );

  // A glob in a helper, not in the test file: the walk must read it.
  const engine = facts(["src/engine/latin-hint.ts"]);
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
  // them all whole on every engine commit, and nothing would go red, only slow.
  // `engine-source.ts` and `test-source.ts` exist so that it does not.
  for (const guard of ["hint-resume", "hint-quality", "hint-ordinal", "mark-all"]) {
    expect(
      engine.narrow.includes(`src/engine/${guard}.test.ts`),
      `${guard} narrows on an engine module only some games reach`,
    );
  }

  const test = facts(["src/engine/hint-quality.test.ts"]);
  expect(
    test.whole.includes("src/engine/hint-quality.test.ts") &&
      test.whole.includes("src/engine/hint-enrollment.test.ts"),
    "a staged test runs whole, and so does test-source.ts's reader",
  );

  const snap = facts(["src/__snapshots__/capability-surface.test.ts.snap"]);
  expect(
    snap.lines.includes("whole src/capability-surface.test.ts"),
    "a staged snapshot selects its own test",
  );

  const help = facts(["help/games/pearl.md"]);
  expect(
    help.lines.includes("whole src/help-coverage.test.ts"),
    "a help page selects help-coverage through its glob",
  );

  if (problems.length > 0) {
    console.error("✗ select-tests.ts missed a known coupling, or stopped narrowing:");
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log(
    "✓ select-tests.ts sees every known coupling, and still narrows (8 plans).",
  );
}

if (process.argv[1] === import.meta.filename) {
  if (process.argv.includes("--verify")) {
    verify();
  } else {
    let lines: string[];
    try {
      lines = plan(stagedPaths(), graphSelected);
    } catch {
      // Any failure at all — vitest missing, git unavailable, a parse error —
      // resolves to the safe answer rather than to a smaller test run.
      lines = ["ALL"];
    }
    process.stdout.write(`${lines.join("\n")}\n`);
  }
}
