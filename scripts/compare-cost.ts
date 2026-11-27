/**
 * What a change costs a game's hint walk and its deal, counted in instructions
 * retired:
 *
 *     npm run compare-cost -- --base <commit> [--quick | --rounds <n>] <game…>
 *     npm run compare-cost -- --baseline <dir> [--quick | --rounds <n>] <game…>
 *
 * `--base` checks the commit out as a worktree in the system's temporary
 * directory, and removes it when the command ends, however it ends;
 * `--baseline` takes a checkout already made. It refuses a baseline whose
 * `package-lock.json` differs from this tree's, whose dependencies would then
 * not be its own, and otherwise links this tree's `node_modules` into it. It
 * copies its worker and the worker's config there too, so both trees walk
 * with the same code, and stops at a tree its config cannot bundle, with
 * Vite's message.
 *
 * **`--quick`** deals one board a menu entry and counts one round: no spread
 * is measured, so it is read only for a large change, the kind a flip has
 * shipped unseen (a deal three times dearer). Every flip runs it; the full
 * run, five rounds of four boards an entry, gives a family's figures and
 * settles a change the quick run shows (`docs/method.md` § "Compare a cost in
 * instructions, not in time").
 *
 * **What is counted is the bundle** (`scripts/checks/cost.vite.config.mts`):
 * each tree's worker and the named games, built by Vite as the app builds
 * them, DEV off, and run by Node. Under vitest's module runner every import
 * is read through a getter, and DEV checks run, which weigh on some games'
 * work more than others': Light Up's born deal read 2.1 times the
 * hand-written one's there and 1.7 times bundled, and one tree's spread was
 * ten times the bundle's (`count-cost-on-the-bundled-engine`'s design.md).
 *
 * **Why instructions, and not time** (`docs/method.md` § "Compare a cost in
 * instructions, not in time"): CPU time is the work at the speed of the core
 * it got, and on this machine it moves with the load by a fifth. macOS counts
 * the instructions a process retires (`/usr/bin/time -l`), which the load
 * does not move; elsewhere this says so and stops.
 *
 * **What it runs.** The boards are dealt once, at the baseline: four on each
 * menu board of at most 100 squares (one under `--quick`). Then, round by round, alternating which
 * tree goes first, each tree runs three processes a game: one that only loads
 * the bundle, one that walks every board by its hint to the end, and one that
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
 * The bundle runs in the process `time` wraps: a child's instructions are
 * not in its count.
 *
 * Steps and technique tries are the engine's own counts and are exact; tries
 * read "–" in a tree from before the counter (`techniqueTries`).
 */
import { spawn, spawnSync } from "node:child_process";
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

/** What a worker run writes back (`scripts/checks/cost-walk.ts`). */
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
const WORKER = "scripts/checks/cost-walk.ts";
const CONFIG = "scripts/checks/cost.vite.config.mts";
/** A run that has not ended in this long is killed, and the command with it. */
const KILL_MS = 600_000;

function usage(why: string): never {
  console.error(`compare-cost: ${why}`);
  console.error(
    "usage: npm run compare-cost -- (--base <commit> | --baseline <dir>) [--quick | --rounds <n>] <game…>",
  );
  process.exit(2);
}

interface Args {
  /** A commit to check out, or a checkout already made. */
  baseline: { commit: string } | { dir: string };
  rounds: number;
  /** Boards dealt on each menu entry. */
  boards: number;
  games: string[];
}

function parseArgs(argv: readonly string[]): Args {
  let baseline: Args["baseline"] | null = null;
  let rounds: number | null = null;
  let quick = false;
  const games: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--baseline")
      baseline = {
        dir: path.resolve(argv[++i] ?? usage("--baseline needs a directory")),
      };
    else if (arg === "--base")
      baseline = { commit: argv[++i] ?? usage("--base needs a commit") };
    else if (arg === "--rounds") rounds = Number(argv[++i]);
    else if (arg === "--quick") quick = true;
    else if (arg.startsWith("-")) usage(`no option ${arg}`);
    else games.push(arg);
  }
  if (baseline === null) usage("name the baseline with --base or --baseline");
  if (quick && rounds !== null) usage("--quick counts one round; drop --rounds");
  if (rounds !== null && (!Number.isInteger(rounds) || rounds < 2))
    usage("--rounds is a whole number of 2 or more");
  if (games.length === 0) usage("name the games to compare");
  return { baseline, rounds: quick ? 1 : (rounds ?? 5), boards: quick ? 1 : 4, games };
}

/** Check `commit` out where the scratch directory is, so the exit that
 * removes the one removes the other; the worktree is unregistered then too. */
function checkedOut(commit: string): string {
  const git = (args: readonly string[]) => {
    const r = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
    if (r.status !== 0) usage(`git ${args.join(" ")}:\n${r.stderr.trim()}`);
    return r.stdout.trim();
  };
  const sha = git(["rev-parse", "--verify", `${commit}^{commit}`]);
  const dir = path.join(scratch, `base-${sha.slice(0, 9)}`);
  git(["worktree", "add", "--detach", dir, sha]);
  process.on("exit", () => {
    spawnSync("git", ["worktree", "remove", "--force", dir], { cwd: ROOT });
    spawnSync("git", ["worktree", "prune"], { cwd: ROOT });
  });
  return dir;
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

/** Run `command` in `tree` to its end, or reject with what it printed. */
function finished(
  tree: string,
  command: string,
  args: readonly string[],
  env: Record<string, string>,
  what: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: tree, env: { ...process.env, ...env } });
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
      if (code === 0) resolve(stderr);
      else reject(new Error(`${what} in ${tree} failed:\n${stdout}\n${stderr}`));
    });
  });
}

/** Bundle `tree`'s worker with `games`, as the app bundles the engine. */
async function bundled(tree: string, games: readonly string[]): Promise<string> {
  const bundle = path.join(scratch, `${path.basename(tree)}-${bundles++}.mjs`);
  await finished(
    tree,
    process.execPath,
    [path.join(tree, "node_modules/vite/bin/vite.js"), "build", "-c", CONFIG],
    { COST_BUNDLE: bundle, COST_GAMES: games.join(",") },
    "bundling the worker",
  );
  if (!existsSync(bundle))
    throw new Error(`bundling the worker in ${tree} wrote no ${bundle}`);
  return bundle;
}
let bundles = 0;

/** One run of a worker `bundle`, counted by the kernel. */
async function counted(bundle: string, env: Record<string, string>): Promise<Counted> {
  const out = path.join(scratch, "out.json");
  rmSync(out, { force: true });
  const stderr = await finished(
    scratch,
    "/usr/bin/time",
    ["-l", process.execPath, "--predictable", bundle],
    { ...env, COST_OUT: out },
    `a ${env["COST_KIND"]} run of ${bundle}`,
  );
  const field = (name: string) =>
    Number(new RegExp(`^\\s*(\\d+)\\s+${name}$`, "m").exec(stderr)?.[1] ?? Number.NaN);
  if (!existsSync(out)) throw new Error(`a run of ${bundle} wrote no ${out}`);
  const instructions = field("instructions retired");
  if (Number.isNaN(instructions))
    throw new Error(`/usr/bin/time printed no instructions retired:\n${stderr}`);
  return {
    instructions,
    cycles: field("cycles elapsed"),
    out: JSON.parse(readFileSync(out, "utf8")) as CostRun,
  };
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
  unsolved: readonly string[];
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
  const args = parseArgs(process.argv.slice(2));
  const { rounds, boards: boardsAnEntry, games } = args;
  if (process.platform !== "darwin")
    usage(
      `this is ${process.platform}, and the count is macOS's (/usr/bin/time -l, instructions retired): no figure is reported in its place`,
    );
  const baseline =
    "dir" in args.baseline ? args.baseline.dir : checkedOut(args.baseline.commit);
  prepareBaseline(baseline);
  console.error("bundling the worker in each tree");
  const trees = {
    baseline: await bundled(baseline, games),
    working: await bundled(ROOT, games),
  } as const;

  console.error(`dealing the boards at ${baseline}`);
  const dealt = await counted(trees.baseline, {
    COST_KIND: "list",
    COST_GAMES: games.join(","),
    COST_BOARDS: String(boardsAnEntry),
  });
  const boards = dealt.out.boards ?? {};
  const lines: string[] = [];
  for (const game of games) {
    let ids = boards[game] ?? [];
    const list = path.join(scratch, `${game}.json`);
    writeFileSync(list, JSON.stringify(ids));
    const run = (bundle: string, kind: string) =>
      counted(bundle, { COST_KIND: kind, COST_GAME: game, COST_LIST: list });

    // The warm-up: what each tree refuses is walked in neither.
    const refused = new Map<string, string>();
    for (const [name, bundle] of Object.entries(trees)) {
      console.error(`${game}: warm-up in the ${name} tree`);
      const { out } = await run(bundle, "walk");
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
        unsolved: [],
      },
      working: {
        walk: [],
        walkCycles: [],
        deal: [],
        steps: 0,
        tries: null,
        unsolved: [],
      },
    };
    for (let r = 0; r < rounds; r++) {
      const order = (
        r % 2 === 0 ? ["baseline", "working"] : ["working", "baseline"]
      ) as ("baseline" | "working")[];
      for (const name of order) {
        console.error(`${game}: round ${r + 1} of ${rounds}, ${name} tree`);
        const bundle = trees[name];
        const none = await run(bundle, "none");
        const walk = await run(bundle, "walk");
        const deal = await run(bundle, "deal");
        const side = sides[name];
        side.walk.push(walk.instructions - none.instructions);
        side.walkCycles.push(walk.cycles - none.cycles);
        side.deal.push(deal.instructions - none.instructions);
        side.steps = walk.out.steps ?? 0;
        side.tries = walk.out.tries ?? null;
        side.unsolved = walk.out.unsolved ?? [];
      }
    }
    const { baseline: b, working: w } = sides;
    const tries = (n: number | null) => (n === null ? "–" : String(n));
    lines.push(
      [
        `${game} (${ids.length} boards, ${rounds} round${rounds === 1 ? "" : "s"})`,
        `  walk instructions ${compared(b.walk, w.walk)}`,
        `  walk cycles       ${compared(b.walkCycles, w.walkCycles)}`,
        `  deal instructions ${compared(b.deal, w.deal)}`,
        `  steps ${b.steps} / ${w.steps}, technique tries ${tries(b.tries)} / ${tries(w.tries)}` +
          (b.unsolved.length + w.unsolved.length > 0
            ? `, unsolved ${b.unsolved.length} / ${w.unsolved.length}`
            : ""),
        ...[...refused].map(([id, why]) => `  refused ${id}: ${why}`),
        // A walk left unsolved is a defect to open, so each is named.
        ...b.unsolved.map((id) => `  unsolved in the baseline: ${id}`),
        ...w.unsolved.map((id) => `  unsolved in the working tree: ${id}`),
      ].join("\n"),
    );
    console.error(lines.at(-1));
  }
  const against =
    "commit" in args.baseline
      ? `Baseline ${args.baseline.commit}`
      : `Baseline ${baseline}`;
  console.log(
    rounds === 1
      ? `${against} / working tree ${ROOT}: one round net of start-up, no spread measured; read only a large change, and settle one with the full run\n`
      : `${against} / working tree ${ROOT}: median net of start-up, ± half the larger spread\n`,
  );
  console.log(lines.join("\n"));
}

await main();
