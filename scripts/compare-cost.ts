/**
 * What a change costs a game's hint walk and its deal, counted in instructions
 * retired: `npm run compare-cost -- --baseline <dir> [--rounds <n>] <game…>`.
 *
 * The baseline is a checkout of the commit to compare against, made beside
 * the session's other scratch files and never inside this tree:
 *
 *     git worktree add --detach <scratchpad>/base <commit>
 *     npm run compare-cost -- --baseline <scratchpad>/base tents boats
 *     git worktree remove --force <scratchpad>/base
 *
 * It refuses a baseline whose `package-lock.json` differs from this tree's,
 * whose dependencies would then not be its own, and otherwise links this
 * tree's `node_modules` into it. It copies its worker and the worker's config
 * there too, so both trees walk with the same code.
 *
 * **Why instructions, and not time** (`docs/method.md` § "Compare a cost in
 * instructions, not in time"): CPU time is the work at the speed of the core
 * it got, and on this machine it moves with the load by a fifth. macOS counts
 * the instructions a process retires (`/usr/bin/time -l`), which the load
 * does not move; elsewhere this says so and stops.
 *
 * **What it runs.** The boards are dealt once, at the baseline: four on each
 * menu board of at most 100 squares. Then, round by round, alternating which
 * tree goes first, each tree runs three processes a game: one that only loads
 * the game, one that walks every board by its hint to the end, and one that
 * deals each board's params once. A figure is a run's count less the
 * loading run's of the same round, and the line gives the median over the
 * rounds and the spread of one tree's rounds (largest less smallest). A
 * difference inside the larger spread is reported as none. The first round
 * is a warm-up that is not counted, and finds the boards either tree
 * refuses, which are named and walked in neither.
 *
 * Node runs with V8's `--predictable`, which took the spread of one tree's
 * Tents walk from 10% to 2% (2026-11-23): the compiler's helper threads are
 * counted too, and left to themselves they do a different amount each run.
 * The worker runs in vitest's thread pool, because a forked worker's
 * instructions are not in the count of the process `time` wraps.
 *
 * Steps and technique tries are the engine's own counts and are exact; tries
 * read "–" in a tree from before the counter (`techniqueTries`).
 */
import { spawn } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/** What a worker run writes back (`scripts/checks/cost-walk.test.ts`). */
export interface CostRun {
  /** The boards a `list` dealt, by game. */
  boards?: Record<string, string[]>;
  /** The boards a `walk` could not load, each with why. */
  refused?: Record<string, string>;
  steps?: number;
  /** `null` where the tree has no counter. */
  tries?: number | null;
  /** Walks that ended unsolved, by ID. */
  unsolved?: string[];
}

const ROOT = path.resolve(import.meta.dirname, "..");
const WORKER = "scripts/checks/cost-walk.test.ts";
const CONFIG = "scripts/checks/cost.vitest.config.mts";
/** A run that has not ended in this long is killed, and the command with it. */
const KILL_MS = 600_000;

function usage(why: string): never {
  console.error(`compare-cost: ${why}`);
  console.error(
    "usage: npm run compare-cost -- --baseline <dir> [--rounds <n>] <game…>",
  );
  process.exit(2);
}

function parseArgs(argv: readonly string[]): {
  baseline: string;
  rounds: number;
  games: string[];
} {
  let baseline: string | null = null;
  let rounds = 5;
  const games: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--baseline")
      baseline = argv[++i] ?? usage("--baseline needs a directory");
    else if (arg === "--rounds") rounds = Number(argv[++i]);
    else if (arg.startsWith("-")) usage(`no option ${arg}`);
    else games.push(arg);
  }
  if (baseline === null) usage("name the baseline tree with --baseline");
  if (!Number.isInteger(rounds) || rounds < 2)
    usage("--rounds is a whole number of 2 or more");
  if (games.length === 0) usage("name the games to compare");
  return { baseline: path.resolve(baseline), rounds, games };
}

/** Make `tree` a baseline this can run in, or say why it cannot be one. */
function prepareBaseline(tree: string): void {
  const lock = (dir: string) => path.join(dir, "package-lock.json");
  if (!existsSync(lock(tree)))
    usage(`${tree} holds no package-lock.json: not a checkout`);
  if (readFileSync(lock(tree), "utf8") !== readFileSync(lock(ROOT), "utf8"))
    usage(
      `${lock(tree)} differs from ${lock(ROOT)}: the baseline's dependencies would not be its own`,
    );
  if (!existsSync(path.join(tree, "node_modules")))
    symlinkSync(path.join(ROOT, "node_modules"), path.join(tree, "node_modules"));
  for (const file of [WORKER, CONFIG]) {
    mkdirSync(path.dirname(path.join(tree, file)), { recursive: true });
    copyFileSync(path.join(ROOT, file), path.join(tree, file));
  }
}

interface Counted {
  instructions: number;
  cycles: number;
  out: CostRun;
}

const scratch = mkdtempSync(path.join(tmpdir(), "compare-cost-"));
process.on("exit", () => rmSync(scratch, { recursive: true, force: true }));
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const)
  process.on(signal, () => process.exit(1));

/** One worker run in `tree`, counted by the kernel. */
function counted(tree: string, env: Record<string, string>): Promise<Counted> {
  const out = path.join(scratch, "out.json");
  rmSync(out, { force: true });
  return new Promise((resolve, reject) => {
    const child = spawn(
      "/usr/bin/time",
      [
        "-l",
        process.execPath,
        "--predictable",
        path.join(tree, "node_modules/vitest/vitest.mjs"),
        "run",
        "-c",
        CONFIG,
      ],
      { cwd: tree, env: { ...process.env, ...env, COST_OUT: out } },
    );
    let stderr = "";
    let stdout = "";
    child.stderr.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    child.stdout.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    const timer = setTimeout(() => child.kill("SIGKILL"), KILL_MS);
    child.on("close", (code) => {
      clearTimeout(timer);
      const field = (name: string) =>
        Number(
          new RegExp(`^\\s*(\\d+)\\s+${name}$`, "m").exec(stderr)?.[1] ?? Number.NaN,
        );
      if (code !== 0 || !existsSync(out)) {
        reject(
          new Error(
            `a run in ${tree} failed (${env["COST_KIND"]}):\n${stdout}\n${stderr}`,
          ),
        );
        return;
      }
      const instructions = field("instructions retired");
      if (Number.isNaN(instructions)) {
        reject(new Error(`/usr/bin/time printed no instructions retired:\n${stderr}`));
        return;
      }
      resolve({
        instructions,
        cycles: field("cycles elapsed"),
        out: JSON.parse(readFileSync(out, "utf8")) as CostRun,
      });
    });
  });
}

const median = (xs: readonly number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const spread = (xs: readonly number[]): number => Math.max(...xs) - Math.min(...xs);
const giga = (n: number): string => (n / 1e9).toFixed(3);

interface Side {
  walk: number[];
  walkCycles: number[];
  deal: number[];
  steps: number;
  tries: number | null;
  unsolved: number;
}

/** A line's comparison of one figure: the medians, and the change unless it
 * is inside either tree's spread. */
function compared(base: readonly number[], work: readonly number[]): string {
  const b = median(base);
  const w = median(work);
  const noise = Math.max(spread(base), spread(work));
  const change =
    Math.abs(w - b) <= noise
      ? "none"
      : `${w > b ? "+" : ""}${(((w - b) / b) * 100).toFixed(1)}%`;
  return `${giga(b)} / ${giga(w)} G (±${giga(noise / 2)}) ${change}`;
}

async function main(): Promise<void> {
  const { baseline, rounds, games } = parseArgs(process.argv.slice(2));
  if (process.platform !== "darwin")
    usage(
      `this is ${process.platform}, and the count is macOS's (/usr/bin/time -l, instructions retired): no figure is reported in its place`,
    );
  prepareBaseline(baseline);
  const trees = { baseline, working: ROOT } as const;

  console.error(`dealing the boards at ${baseline}`);
  const dealt = await counted(baseline, {
    COST_KIND: "list",
    COST_GAMES: games.join(","),
  });
  const boards = dealt.out.boards ?? {};
  const lines: string[] = [];
  for (const game of games) {
    let ids = boards[game] ?? [];
    const list = path.join(scratch, `${game}.json`);
    writeFileSync(list, JSON.stringify(ids));
    const run = (tree: string, kind: string) =>
      counted(tree, { COST_KIND: kind, COST_GAME: game, COST_LIST: list });

    // The warm-up: what each tree refuses is walked in neither.
    const refused = new Map<string, string>();
    for (const [name, tree] of Object.entries(trees)) {
      console.error(`${game}: warm-up in the ${name} tree`);
      const { out } = await run(tree, "walk");
      for (const [id, why] of Object.entries(out.refused ?? {}))
        refused.set(id, `${name} refuses it: ${why}`);
    }
    ids = ids.filter((id) => !refused.has(id));
    writeFileSync(list, JSON.stringify(ids));

    const sides: Record<keyof typeof trees, Side> = {
      baseline: {
        walk: [],
        walkCycles: [],
        deal: [],
        steps: 0,
        tries: null,
        unsolved: 0,
      },
      working: {
        walk: [],
        walkCycles: [],
        deal: [],
        steps: 0,
        tries: null,
        unsolved: 0,
      },
    };
    for (let r = 0; r < rounds; r++) {
      const order = (
        r % 2 === 0 ? ["baseline", "working"] : ["working", "baseline"]
      ) as ("baseline" | "working")[];
      for (const name of order) {
        console.error(`${game}: round ${r + 1} of ${rounds}, ${name} tree`);
        const tree = trees[name];
        const none = await run(tree, "none");
        const walk = await run(tree, "walk");
        const deal = await run(tree, "deal");
        const side = sides[name];
        side.walk.push(walk.instructions - none.instructions);
        side.walkCycles.push(walk.cycles - none.cycles);
        side.deal.push(deal.instructions - none.instructions);
        side.steps = walk.out.steps ?? 0;
        side.tries = walk.out.tries ?? null;
        side.unsolved = walk.out.unsolved?.length ?? 0;
      }
    }
    const { baseline: b, working: w } = sides;
    const tries = (n: number | null) => (n === null ? "–" : String(n));
    lines.push(
      [
        `${game} (${ids.length} boards, ${rounds} rounds)`,
        `  walk instructions ${compared(b.walk, w.walk)}`,
        `  walk cycles       ${compared(b.walkCycles, w.walkCycles)}`,
        `  deal instructions ${compared(b.deal, w.deal)}`,
        `  steps ${b.steps} / ${w.steps}, technique tries ${tries(b.tries)} / ${tries(w.tries)}` +
          (b.unsolved + w.unsolved > 0
            ? `, unsolved ${b.unsolved} / ${w.unsolved}`
            : ""),
        ...[...refused].map(([id, why]) => `  refused ${id}: ${why}`),
      ].join("\n"),
    );
    console.error(lines.at(-1));
  }
  console.log(
    `Baseline ${baseline} / working tree ${ROOT}: median net of start-up, ± half the larger spread\n`,
  );
  console.log(lines.join("\n"));
}

await main();
