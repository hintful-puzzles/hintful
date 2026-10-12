/**
 * One game's verdict, in one command: `npm run game -- <id>`.
 *
 * What refuses a game's commit is mostly not its own tests. It is the
 * cross-game guards, which take their population from the registry, and a
 * session writing a game met them one at a time, in the gate. This runs, for
 * one game, what a commit staging that game would run, and nothing of any
 * other game's:
 *
 *   1. the typecheck, both projects;
 *   2. biome over the game's directory, read-only;
 *   3. every test file that reaches the game (`gameTestFiles`), with the run
 *      scoped to the game exactly as the commit hook scopes it
 *      (`src/engine/testing/game-scope.ts`): a guard's case titled for another
 *      game is skipped, and so is a floor over the whole collection.
 *
 * Every step runs whatever the one before it found, so a first run names
 * everything the game owes.
 *
 * **Each refusal is reported with the guide sections its guard cites.** The
 * sections are read out of the refusing test file, where
 * `scripts/checks/guide-sections.mjs` holds every citation to a real heading,
 * so there is no table here of which guard means which section. A guard that
 * cites none says what it asks in its own header.
 *
 * **It ends by saying what it did not run**, counted from the run where it
 * can be, because a green result here is a commit's and not the gate's.
 *
 * It writes nothing in the repository.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fold, namedCitations } from "./checks/guide-citations.ts";
import { gameOf } from "./checks/reach.ts";
import { gameTestFiles } from "./checks/select-tests.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

/** How many of one file's refused cases the report names. */
const CASES_NAMED = 6;

const id = process.argv[2] ?? "";
if (!/^[a-z0-9-]+$/.test(id) || !existsSync(path.join(ROOT, "src", "games", id))) {
  console.error(
    id === ""
      ? "usage: npm run game -- <id>, the name of a directory under src/games/"
      : `game: src/games/${id}/ is not a game's directory`,
  );
  process.exit(2);
}

/** Run a step with its output shown as it comes, and say whether it passed. */
function passes(command: string, args: string[], env: NodeJS.ProcessEnv = {}): boolean {
  const run = spawnSync(command, args, {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: "inherit",
  });
  return run.status === 0;
}

interface VitestJson {
  testResults: {
    name: string;
    status: string;
    message?: string;
    assertionResults: {
      fullName: string;
      status: string;
      failureMessages: string[];
    }[];
  }[];
}

/** One test file that refused the game, and the cases that did. */
interface Refusal {
  file: string;
  /** Empty where the file failed before any case ran. */
  cases: string[];
  /** Whether a stored snapshot is what disagreed. */
  snapshot: boolean;
}

/** What the scoped run found. */
interface TestRun {
  files: number;
  passed: number;
  refusals: Refusal[];
  /** Skipped cases titled for another game. */
  otherGames: number;
  /** Every other skipped case: a floor over the collection, a deferred check. */
  overTheCollection: number;
}

function runTests(files: readonly string[]): TestRun | null {
  const out = mkdtempSync(path.join(tmpdir(), "game-verdict-"));
  const json = path.join(out, "report.json");
  try {
    passes(
      "npx",
      [
        "vitest",
        "run",
        "--passWithNoTests",
        // As CI runs: a snapshot the game has no row in yet fails, where a
        // local run would write the row and pass, in a file the author did
        // not open.
        "--update=none",
        // A dot a test, and each failure in full: a line per file would bury
        // the handful that refuse under the hundred that pass.
        "--reporter=dot",
        "--reporter=json",
        `--outputFile.json=${json}`,
        ...files,
      ],
      // The commit hook's two variables: the role, and the game it stages.
      { GATE_PRECOMMIT: "1", GATE_GAME_SCOPE: id },
    );
    let report: VitestJson;
    try {
      report = JSON.parse(readFileSync(json, "utf8")) as VitestJson;
    } catch {
      return null;
    }
    const run: TestRun = {
      files: report.testResults.length,
      passed: 0,
      refusals: [],
      otherGames: 0,
      overTheCollection: 0,
    };
    for (const result of report.testResults) {
      const file = path.relative(ROOT, result.name);
      const failed = result.assertionResults.filter((a) => a.status === "failed");
      for (const a of result.assertionResults) {
        if (a.status === "passed") run.passed++;
        else if (a.status !== "failed") {
          // A case's title is `<id>: …` after its describe titles, as
          // `otherGamesFilter` reads it.
          const titled = /(?:^| )([a-z0-9-]+): /.exec(a.fullName)?.[1];
          if (titled !== undefined && titled !== id && isGame(titled)) run.otherGames++;
          else run.overTheCollection++;
        }
      }
      if (failed.length > 0 || result.status === "failed") {
        run.refusals.push({
          file,
          cases: failed.map((a) => a.fullName),
          snapshot: failed.some((a) => /snapshot/i.test(a.failureMessages.join("\n"))),
        });
      }
    }
    return run;
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

function isGame(name: string): boolean {
  return existsSync(path.join(ROOT, "src", "games", name));
}

/** The guide sections a test file cites, each once, in the order written. */
function sectionsCited(file: string): string[] {
  const text = fold(readFileSync(path.join(ROOT, file), "utf8"));
  return [
    ...new Set(namedCitations(text).map((c) => `docs/${c.guide} § "${c.heading}"`)),
  ].filter((cite) => existsSync(path.join(ROOT, cite.slice(0, cite.indexOf(" §")))));
}

function reportRefusal(refusal: Refusal): void {
  console.log(`\n✗ ${refusal.file}`);
  if (refusal.cases.length === 0)
    console.log("    failed before any of its cases ran: its error is above");
  for (const name of refusal.cases.slice(0, CASES_NAMED)) console.log(`    ${name}`);
  if (refusal.cases.length > CASES_NAMED)
    console.log(`    and ${refusal.cases.length - CASES_NAMED} more`);
  if (gameOf(refusal.file) !== null) return;
  const sections = sectionsCited(refusal.file);
  if (sections.length === 0)
    console.log("  Its header says what it asks of a game; it cites no guide.");
  else {
    console.log("  What it asks of a game:");
    for (const section of sections) console.log(`    ${section}`);
  }
}

const started = Date.now();
console.log(
  `The verdict on ${id}: the typecheck, biome, and every test that reads it.\n`,
);

const typed = passes("npm", ["run", "-s", "typecheck"]);
const formatted = passes("npx", ["biome", "check", `src/games/${id}`]);
const files = gameTestFiles(id);
const run = files.length === 0 ? null : runTests(files);

console.log(`\n${"─".repeat(72)}`);
console.log(`${typed ? "✓" : "✗"} typecheck${typed ? "" : ": its errors are above"}`);
console.log(
  `${formatted ? "✓" : "✗"} biome over src/games/${id}${formatted ? "" : ": `npm run check` fixes what it can"}`,
);
if (run === null) {
  console.log(
    files.length === 0
      ? `✗ no test file reaches ${id}: the selection is broken, or the game has no file`
      : "✗ vitest wrote no report: its error is above",
  );
} else {
  const refused = run.refusals.reduce((n, r) => n + Math.max(1, r.cases.length), 0);
  console.log(
    run.refusals.length === 0
      ? `✓ ${run.passed} tests in ${run.files} files, of which ${files.filter((f) => gameOf(f) !== null).length} are the game's own`
      : `✗ ${refused} refusals in ${run.refusals.length} of ${run.files} test files (${run.passed} tests passed)`,
  );
  // The game's own tests first: a guard's refusal often follows from one.
  const own = (r: Refusal) => (gameOf(r.file) === null ? 1 : 0);
  for (const refusal of [...run.refusals].sort((a, b) => own(a) - own(b)))
    reportRefusal(refusal);
  if (run.refusals.some((r) => r.snapshot)) {
    console.log(
      "\n  A stored snapshot disagreed. Read its diff above, and where the game is",
    );
    console.log("  right, write it again: npx vitest run <the test file> -u");
  }
  console.log("\nNot run here:");
  console.log(
    `  - ${run.otherGames} cases of the other games, and ${run.overTheCollection} checks over the whole`,
  );
  console.log(
    "    collection or deferred to a wider run. The push runs them when a commit",
  );
  console.log("    reaches shared code, and CI runs them always.");
  console.log(
    "  - The second and later boards of each kind in a cross-game sweep, which CI",
  );
  console.log("    walks. One guard, wide: npx vitest run <its file>");
  console.log(
    "  - The gate's checks that read no game (spelling, the guides, the specs, dead",
  );
  console.log("    exports) and the production build. The commit hook runs them.");
  console.log(
    '  - The app. docs/new-game.md § "The acceptance gate" says what to look at.',
  );
}
console.log(`\n${Math.round((Date.now() - started) / 1000)} s.`);

process.exit(typed && formatted && run !== null && run.refusals.length === 0 ? 0 : 1);
