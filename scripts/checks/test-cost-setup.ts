/**
 * The CPU time a test file costs, for the gate's cost budget
 * (`test-cost.ts`, beside this file), appended to the log the gate names in
 * `TEST_COST_RUN`. A run outside the gate names no log and records nothing.
 *
 * A vitest setup file runs before each test file's imports, and a forks-pool
 * worker runs one file at a time, so the process's CPU time between here and
 * the file's last `afterAll` is that file's work whatever else the machine is
 * doing. Wall time is no measure of it: contention inflates wall several-fold
 * and unevenly (`docs/testing.md` § "Timing anything under vitest").
 *
 * With `isolate: false` a worker's files share what one of them computed, so
 * a file's own CPU time depends on what its worker ran before it. The boards
 * the sweeps share are most of that, and a file is charged for each board it
 * used that an earlier file dealt (`dealt.ts`), so a cheap file stays cheap
 * whatever order it runs in. What remains is the module graph: a worker's
 * first file pays for importing the registry, about 20 seconds.
 *
 * Each case titled for a game (`<id>: …`, the title a hook narrows by) is
 * charged to that game, so that a hook can price a run narrowed to some
 * games' cases before it starts.
 */
import { appendFileSync, readdirSync } from "node:fs";
import { afterAll, afterEach, beforeEach } from "vitest";
import {
  inheritedDealCost,
  openCostWindow,
  ownDealCost,
} from "../../src/engine/testing/dealt.ts";
import { scopeFromEnv } from "../../src/engine/testing/game-scope.ts";

const log = process.env["TEST_COST_RUN"];
const recording = log !== undefined && log !== "";

/** User and system CPU microseconds, with the deals this file inherited. */
function cost(): number {
  const { user, system } = process.cpuUsage();
  return user + system + inheritedDealCost();
}

const GAMES = new Set(
  recording
    ? readdirSync("src/games", { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [],
);

/** The game a case is titled for, read as `game-scope.ts` reads it: `<id>: `
 * at the start of the full name or after a space. */
function gameOf(fullName: string): string | null {
  for (const match of fullName.matchAll(/(?:^| )([a-z0-9-]+): /g))
    if (GAMES.has(match[1])) return match[1];
  return null;
}

openCostWindow();
const start = cost();
const games: Record<string, number> = {};
let caseStart = 0;

if (recording) {
  beforeEach(() => {
    caseStart = cost();
  });

  afterEach(({ task }) => {
    const names = [task.name];
    for (let suite = task.suite; suite; suite = suite.suite) names.unshift(suite.name);
    // The outermost name is the file's, which no title filter reads.
    const id = gameOf(names.slice(1).join(" "));
    if (id !== null) games[id] = (games[id] ?? 0) + (cost() - caseStart) / 1e6;
  });

  // biome-ignore lint/correctness/noEmptyPattern: vitest refuses a hook whose context is not destructured, and the file is the second argument.
  afterAll(({}, file) => {
    const inherited = inheritedDealCost() / 1e6;
    const line = {
      file: file.name,
      project: file.file.projectName ?? "",
      cpu: (cost() - start) / 1e6,
      inherited,
      dealt: ownDealCost() / 1e6,
      games,
      narrowed: scopeFromEnv(process.env) !== null,
    };
    // One short line per write, so the workers' appends do not interleave.
    appendFileSync(log as string, `${JSON.stringify(line)}\n`);
  });
}
