/**
 * The gate's cost budget: what each test file may cost, what the suite may,
 * and what a hook's run may, all in CPU time (`build-pipeline`, "The gate
 * holds each test file to a cost budget" and "A hook's run is held to a
 * ceiling").
 *
 *     node scripts/checks/test-cost.ts report <log> [--suite]
 *
 * reads the costs `test-cost-setup.ts` appended to the log the gate names in
 * `TEST_COST_RUN`, prints the dearest files, records the costs for the hooks'
 * next plans, and fails when a file is over its budget, or, with `--suite`
 * (the whole suite ran), when the total is over the suite's.
 *
 *     node scripts/checks/test-cost.ts fit <commit|push>
 *
 * reads a plan `select-tests.ts` printed and prints the part of it that fits
 * the hook's ceiling, from the costs the last runs recorded. What a commit
 * leaves out is the push's (the list in {@link DEFERRED}), and what a push
 * leaves out is CI's, which runs everything.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * The budgets in CPU seconds on CI's runner, where they bind (design D3 of
 * `enforce-test-time-budgets`): no one file is a fifth of a worker's share of
 * a ten-minute run, and the suite is about ten minutes on four workers.
 */
const CI_BUDGET = { file: 120, suite: 2400, commit: 90, push: 300 };

/**
 * How many CPU seconds CI's runner takes for one of this machine's, at the
 * least: measured 2026-10-27 over files that did not change between a CI run
 * and a local one, the ratio ran from 1.5 to 2.3 by file (a fixed workload
 * timed alone gave 1.3, which is why there is no calibration). The least, so
 * that a file within CI's budget is within this machine's.
 */
const LOCAL_SPEED = 1.5;

/** The budgets on the machine this runs on. */
const BUDGET = process.env["CI"]
  ? CI_BUDGET
  : {
      file: CI_BUDGET.file / LOCAL_SPEED,
      suite: CI_BUDGET.suite / LOCAL_SPEED,
      commit: CI_BUDGET.commit / LOCAL_SPEED,
      push: CI_BUDGET.push / LOCAL_SPEED,
    };

/** Past this share of its budget a file is named as near it, and passes:
 * CPU time is not perfectly stable (paging inflates `sys`, and three suites
 * oversubscribing a laptop raised a file's by a fifth). */
const NEAR = 0.9;

const CACHE = "node_modules/.cache/test-cost";
/** The costs each file last recorded on this machine. */
const RECORD = path.join(CACHE, "costs.json");
/** The files a commit hook left to the push, one per line. */
const DEFERRED = path.join(CACHE, "deferred");

const TREATMENTS =
  'docs/testing.md § "Right-sizing the gate" gives the treatments: write down a ' +
  "board a search finds, turn a board count down where the property is " +
  "systematic, move more of the same to the slow tier, or retire what a cheaper " +
  "test already catches.";

/** One test file's cost in one run, as the setup file wrote it. A spread
 * file's share is its own entry, told apart by `project`. */
interface Line {
  file: string;
  project: string;
  /** User plus system CPU seconds, with {@link inherited}. */
  cpu: number;
  /** The seconds of the boards it used that an earlier file in its worker
   * dealt: charged to it, and counted once in the suite's total. */
  inherited: number;
  /** The seconds of the boards it dealt itself, part of {@link cpu}. */
  dealt: number;
  /** The seconds of the cases titled for each game. */
  games: Record<string, number>;
  /** Whether the run skipped some games' cases. */
  narrowed: boolean;
}

/** What a file's share costs, in seconds: the cases titled for no game, and
 * those of each game. */
interface Entry {
  base: number;
  games: Record<string, number>;
}

/** Per file, per project. */
type CostRecord = Record<string, Record<string, Entry>>;

function readRun(log: string): Line[] {
  return readFileSync(log, "utf8")
    .split("\n")
    .filter((line) => line !== "")
    .map((line) => JSON.parse(line) as Line);
}

function readRecord(): CostRecord {
  if (!existsSync(RECORD)) return {};
  return JSON.parse(readFileSync(RECORD, "utf8")) as CostRecord;
}

/** A file and its share, as a reader names it. */
function label(file: string, project: string): string {
  return project === "main" ? file : `${file} (${project})`;
}

const seconds = (s: number): string => `${s.toFixed(0).padStart(5)} s`;

/** Prints the run's costs, records them, and says whether they are within
 * budget. */
function report(log: string, wholeSuite: boolean): boolean {
  const lines = readRun(log).sort((a, b) => b.cpu - a.cpu);
  const total = lines.reduce((sum, l) => sum + l.cpu - l.inherited, 0);
  console.log(
    `Test CPU time: ${(total / 60).toFixed(1)} minutes over ${lines.length} files, ` +
      `${(lines.reduce((sum, l) => sum + l.dealt, 0) / 60).toFixed(1)} of them dealing boards.`,
  );
  const over: string[] = [];
  for (const l of lines) {
    const at = `${seconds(l.cpu)}  ${label(l.file, l.project)}`;
    if (l.cpu > BUDGET.file) over.push(at);
    else if (l.cpu > NEAR * BUDGET.file)
      console.log(`${at}  (near the budget of ${BUDGET.file.toFixed(0)} s)`);
    else if (l.cpu >= 10) console.log(at);
  }
  record(lines);
  let ok = true;
  if (over.length > 0) {
    console.log(`\n✗ over the budget of ${BUDGET.file.toFixed(0)} s a file:`);
    for (const at of over) console.log(at);
    ok = false;
  }
  if (wholeSuite && total > BUDGET.suite) {
    console.log(
      `\n✗ the suite cost ${(total / 60).toFixed(1)} minutes, over its budget of ${(BUDGET.suite / 60).toFixed(0)}.`,
    );
    ok = false;
  } else if (wholeSuite && total > NEAR * BUDGET.suite) {
    console.log(
      `The suite is near its budget of ${(BUDGET.suite / 60).toFixed(0)} minutes.`,
    );
  }
  if (!ok) console.log(TREATMENTS);
  return ok;
}

/** Keeps each file's costs for the hooks' next plans. A run that skipped some
 * games' cases keeps the other games' costs from before. */
function record(lines: readonly Line[]): void {
  const kept = readRecord();
  // A run of a file runs every share of it, so the shares it ran replace the
  // file's record whole: a file spread since keeps no stale entry.
  const before = { ...kept };
  for (const file of new Set(lines.map((l) => l.file))) kept[file] = {};
  for (const l of lines) {
    const games: Record<string, number> = l.narrowed
      ? { ...before[l.file]?.[l.project]?.games }
      : {};
    let inGames = 0;
    for (const [id, s] of Object.entries(l.games)) {
      games[id] = s;
      inGames += s;
    }
    kept[l.file] = { ...kept[l.file], [l.project]: { base: l.cpu - inGames, games } };
  }
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(RECORD, JSON.stringify(kept));
}

/** A plan's lines, as `select-tests.ts` prints them. */
interface Plan {
  scope: string[];
  whole: string[];
  narrow: string[];
  /** The test files a commit stages, which it runs `whole`: none in a push's
   * plan, nor in `ALL`, where every file is whole. */
  staged: string[];
}

function readPlan(role: "commit" | "push", text: string): Plan | "NOTHING" {
  const lines = text.split("\n").filter((l) => l !== "");
  if (lines.includes("NOTHING")) return "NOTHING";
  if (lines.includes("ALL")) {
    const files = execFileSync(
      "git",
      ["ls-files", ":(glob)src/**/*.test.ts", ":(glob)vite-plugins/**/*.test.ts"],
      { encoding: "utf8" },
    );
    const whole = files.split("\n").filter(Boolean);
    return { scope: [], whole, narrow: [], staged: [] };
  }
  const of = (kind: string) =>
    lines.filter((l) => l.startsWith(`${kind} `)).map((l) => l.slice(kind.length + 1));
  const scope = of("scope")[0];
  return {
    scope: scope === undefined || scope === "-" ? [] : scope.split(","),
    whole: of("whole"),
    narrow: of("narrow"),
    staged: role === "commit" ? of("whole") : [],
  };
}

function printPlan(plan: Plan): string {
  return [
    ...(plan.narrow.length > 0 ? [`scope ${plan.scope.join(",") || "-"}`] : []),
    ...plan.whole.map((f) => `whole ${f}`),
    ...plan.narrow.map((f) => `narrow ${f}`),
  ].join("\n");
}

/** What a file costs run whole (`scope` null), or narrowed to `scope`, in
 * seconds, or `null` when no run here has recorded it. */
function predicted(
  kept: CostRecord,
  file: string,
  scope: readonly string[] | null,
): number | null {
  const shares = kept[file];
  if (shares === undefined) return null;
  let s = 0;
  for (const entry of Object.values(shares)) {
    s += entry.base;
    for (const [id, g] of Object.entries(entry.games))
      if (scope === null || scope.includes(id)) s += g;
  }
  return s;
}

/**
 * The part of a hook's plan that fits its ceiling. A file no run has recorded
 * runs, and records; so does a test file a commit stages, which is what the
 * author just wrote. The rest is taken cheapest first while it fits, so the
 * most files run, and a commit writes what it left out to {@link DEFERRED}.
 */
function fitPlan(role: "commit" | "push", text: string): string {
  const plan = readPlan(role, text);
  if (plan === "NOTHING") return "NOTHING";
  const kept = readRecord();
  const ceiling = BUDGET[role];
  const items = [
    ...plan.whole.map((file) => ({
      file,
      kind: "whole" as const,
      cost: predicted(kept, file, null),
    })),
    ...plan.narrow.map((file) => ({
      file,
      kind: "narrow" as const,
      cost: predicted(kept, file, plan.scope),
    })),
  ];
  const alwaysRuns = (i: (typeof items)[number]) =>
    i.cost === null || plan.staged.includes(i.file);
  const fitted: Plan = { scope: plan.scope, whole: [], narrow: [], staged: [] };
  const left: typeof items = [];
  let spent = 0;
  for (const item of items.filter(alwaysRuns)) {
    fitted[item.kind].push(item.file);
    spent += item.cost ?? 0;
  }
  const rest = items
    .filter((i) => !alwaysRuns(i))
    .sort((a, b) => (a.cost ?? 0) - (b.cost ?? 0));
  for (const item of rest) {
    const cost = item.cost ?? 0;
    if (spent + cost <= ceiling) {
      fitted[item.kind].push(item.file);
      spent += cost;
    } else left.push(item);
  }
  const unmeasured = items.filter((i) => i.cost === null).length;
  process.stderr.write(
    `${spent > ceiling ? "!" : "✓"} this ${role}'s tests should cost ${spent.toFixed(0)} s ` +
      `of CPU, of its ceiling of ${ceiling.toFixed(0)}` +
      (unmeasured > 0
        ? `, besides ${unmeasured} file(s) no run here has measured`
        : "") +
      (spent > ceiling ? ": the test files it stages run whatever they cost" : "") +
      ".\n",
  );
  if (left.length > 0) {
    const leftCost = left.reduce((sum, i) => sum + (i.cost ?? 0), 0);
    process.stderr.write(
      `  ${left.length} file(s), ${leftCost.toFixed(0)} s, are left to ` +
        `${role === "commit" ? "the push" : "the Gate workflow in CI"}. The dearest:\n` +
        left
          .slice(-5)
          .reverse()
          .map((i) => `  ${seconds(i.cost ?? 0)}  ${i.file}\n`)
          .join(""),
    );
    if (role === "commit") {
      mkdirSync(CACHE, { recursive: true });
      const before = existsSync(DEFERRED) ? readFileSync(DEFERRED, "utf8") : "";
      writeFileSync(DEFERRED, before + left.map((i) => `${i.file}\n`).join(""));
    }
  }
  return printPlan(fitted);
}

if (process.argv[1] === import.meta.filename) {
  const [command, arg] = process.argv.slice(2);
  if (command === "report" && arg !== undefined) {
    if (!report(arg, process.argv.includes("--suite"))) process.exitCode = 1;
  } else if (command === "fit" && (arg === "commit" || arg === "push")) {
    process.stdout.write(`${fitPlan(arg, readFileSync(0, "utf8"))}\n`);
  } else {
    throw new Error("usage: test-cost.ts report <log> [--suite] | fit <commit|push>");
  }
}
