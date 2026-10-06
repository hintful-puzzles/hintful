/**
 * Deal every game at sizes past its menu's largest, and report how long each
 * took: `npm run deal-walk -- [game…]`, every game when none is named.
 *
 * A Custom dialog takes any size its fields allow, and for most games that has
 * no upper end. This asks what a deal costs out there, and how it fails: by
 * getting slow, by running its retry bound out, by throwing, or by never
 * coming back. `scripts/checks/deal-walk.test.ts` says which sizes it deals.
 * It writes `metrics/deal-walk.md`, a line a ladder, and keeps the sections of
 * the games it was not asked for.
 *
 * **A report and not a gate.** It is tens of minutes for the collection, and
 * its numbers are one machine's on one day. A cell here is a few deals, which
 * is enough to find where a ladder leaves a second and not enough to draw a
 * line: before a bound is written, deal the sizes each side of it a dozen
 * times (docs/games/solver-and-generator.md § "Bound a generator by its tail,
 * not its median").
 *
 * **Each game is dealt in a process of its own, which this watches.** A
 * generator is synchronous, so one that never ends cannot be timed out from
 * inside. A deal that has not come back in `DEAL_WALK_KILL_MS` is killed and
 * written down as such, as is one that takes the process down (the heap is
 * held to `DEAL_WALK_HEAP_MB`, so a board too large for memory dies quickly),
 * and the game's walk starts again at the ladder after it.
 *
 * **To count the sizes each side of a line**, name them:
 *
 *     DEAL_WALK_CELLS="9dr 8dr" DEAL_WALK_SEEDS=12 npm run deal-walk -- mathrax
 *
 * deals each of those params twelve times, however long they take and however
 * many never come back, and prints the line instead of writing the report.
 *
 * Settings, all environment variables: `DEAL_WALK_SEEDS` deals a cell at most (4),
 * `DEAL_WALK_STOP_MS` the deal that ends a ladder (10,000),
 * `DEAL_WALK_KILL_MS` (60,000), `DEAL_WALK_HEAP_MB` (2,048), and
 * `DEAL_WALK_JOBS` games at once (2: more of them and the times measure each
 * other).
 */
import { type ChildProcess, execFileSync, spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { freemem, loadavg, tmpdir } from "node:os";
import path from "node:path";
import {
  type DealWalkCell,
  type DealWalkState,
  EMPTY_STATE,
} from "./deal-walk-report.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "metrics/deal-walk.md");
const VITEST = path.join(ROOT, "node_modules/vitest/vitest.mjs");

const setting = (name: string, fallback: number): number =>
  Number(process.env[name] ?? fallback);
const SEEDS = setting("DEAL_WALK_SEEDS", 4);
const STOP_MS = setting("DEAL_WALK_STOP_MS", 10_000);
const KILL_MS = setting("DEAL_WALK_KILL_MS", 60_000);
const HEAP_MB = setting("DEAL_WALK_HEAP_MB", 2048);
const JOBS = setting("DEAL_WALK_JOBS", 2);
const CELLS = process.env["DEAL_WALK_CELLS"] ?? null;

/** The walker, in one process with its worker a thread of it, so that killing
 * the process ends a deal that is still running. */
function vitestArgs(): string[] {
  return [
    VITEST,
    "run",
    "-c",
    "scripts/checks/diff.vitest.config.mts",
    "--pool=threads",
    "deal-walk",
  ];
}

function gameIds(scratch: string): string[] {
  const list = path.join(scratch, "games.json");
  const run = spawnSync(process.execPath, vitestArgs(), {
    cwd: ROOT,
    env: { ...process.env, DEAL_WALK_LIST: list },
    encoding: "utf8",
  });
  if (!existsSync(list)) throw new Error(`vitest listed no games:\n${run.stdout}`);
  return JSON.parse(readFileSync(list, "utf8")) as string[];
}

/** The walkers alive, which end with this script however it ends: one left
 * behind in a deal that never returns holds a core until it is found. */
const running = new Set<ChildProcess>();
/** Where the walkers' state files are, which goes with this script too. */
const scratch = mkdtempSync(path.join(tmpdir(), "deal-walk-"));
process.on("exit", () => {
  for (const child of running) child.kill("SIGKILL");
  rmSync(scratch, { recursive: true, force: true });
});
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
  process.on(signal, () => process.exit(1));
}

/** Walk one game to its end, starting its process again after each deal that
 * took one down. */
async function walkGame(id: string, scratch: string): Promise<DealWalkState> {
  const statePath = path.join(scratch, `${id}.json`);
  writeFileSync(statePath, JSON.stringify(EMPTY_STATE));
  const read = (): DealWalkState =>
    JSON.parse(readFileSync(statePath, "utf8")) as DealWalkState;
  let died: string | null = null;
  for (;;) {
    const before = readFileSync(statePath, "utf8");
    const ended = await new Promise<string>((resolve) => {
      const started = Date.now();
      const child = spawn(process.execPath, vitestArgs(), {
        cwd: ROOT,
        stdio: ["ignore", "ignore", "pipe"],
        env: {
          ...process.env,
          NODE_OPTIONS: `--max-old-space-size=${HEAP_MB}`,
          DEAL_WALK_GAME: id,
          DEAL_WALK_STATE: statePath,
          DEAL_WALK_SEEDS: String(SEEDS),
          DEAL_WALK_STOP_MS: String(STOP_MS),
          ...(died === null ? {} : { DEAL_WALK_DIED: died }),
        },
      });
      let stderr = "";
      child.stderr.on("data", (chunk: Buffer) => {
        stderr = (stderr + chunk.toString()).slice(-2000);
      });
      running.add(child);
      let killed = false;
      // The state file is written before every deal, so its age is how long
      // the deal in flight has run. A process just started has yet to write
      // it, and the file it finds still names the deal that ended the last.
      const watch = setInterval(() => {
        const written = Math.max(started, statSync(statePath).mtimeMs);
        if (Date.now() - written < KILL_MS) return;
        killed = true;
        child.kill("SIGKILL");
      }, 1000);
      child.on("close", (code, signal) => {
        clearInterval(watch);
        running.delete(child);
        if (killed) resolve(`no answer in ${KILL_MS / 1000} s`);
        else if (/out of memory|heap limit/i.test(stderr)) resolve("out of memory");
        else resolve(`the process ended (${signal ?? `exit ${code}`})`);
      });
    });
    const state = read();
    if (state.done) return state;
    // A run that wrote nothing would be started again for ever.
    if (readFileSync(statePath, "utf8") === before) {
      throw new Error(`${id}: the walk stopped without dealing: ${ended}`);
    }
    died = ended;
  }
}

const seconds = (ms: number): string =>
  ms < 950 ? `${(ms / 1000).toFixed(1)}` : `${Math.round(ms / 1000)}`;

/** A cell as the report's line has it. */
function renderCell(cell: DealWalkCell): string {
  const name = `\`${cell.label}\``;
  if (cell.refusal !== null) return `${name} refused`;
  const parts: string[] = [];
  if (cell.ms.length > 0) {
    const mean = cell.ms.reduce((a, b) => a + b, 0) / cell.ms.length;
    const worst = Math.max(...cell.ms);
    parts.push(worst < 100 ? "quick" : `${seconds(mean)} s, slowest ${seconds(worst)}`);
  }
  const deals = cell.ms.length + cell.lost;
  if (cell.gaveUp > 0) parts.push(`gave up on ${cell.gaveUp} of ${deals}`);
  if (cell.threw !== null) parts.push(`threw ${cell.threw}`);
  if (cell.died !== null) parts.push(`**${cell.died}** on ${cell.lost} of ${deals}`);
  return `${name} ${parts.join(", ")}`;
}

function renderGame(state: DealWalkState): string {
  if (state.ladders.length === 0) return "No size field.";
  const cells = new Map(state.cells.map((c) => [c.label, c]));
  const lines: string[] = [];
  const refusals = new Set<string>();
  for (const ladder of state.ladders) {
    const dealt = ladder.flatMap((label) => cells.get(label) ?? []);
    for (const c of dealt) if (c.refusal !== null) refusals.add(c.refusal);
    // A run of quick cells says no more than its two ends.
    const quick = (c: DealWalkCell): boolean =>
      c.refusal === null &&
      c.gaveUp === 0 &&
      c.threw === null &&
      c.died === null &&
      Math.max(0, ...c.ms) < 100;
    const shown: string[] = [];
    for (let i = 0; i < dealt.length; i++) {
      let j = i;
      while (j + 1 < dealt.length && quick(dealt[i]) && quick(dealt[j + 1])) j++;
      if (j > i + 1) {
        shown.push(`\`${dealt[i].label}\` to \`${dealt[j].label}\` quick`);
        i = j;
      } else shown.push(renderCell(dealt[i]));
    }
    lines.push(`- ${shown.join(" · ")}`);
  }
  if (refusals.size > 0) {
    lines.push("", "Refused with:", ...[...refusals].map((r) => `- ${r}`));
  }
  return lines.join("\n");
}

const HEADING = "## ";

/** The report's sections as they stand on disk, by game, each without its
 * heading. */
function sectionsOnDisk(): Map<string, string> {
  const out = new Map<string, string>();
  if (!existsSync(OUT)) return out;
  const [, ...blocks] = `\n${readFileSync(OUT, "utf8")}`.split(`\n${HEADING}`);
  for (const block of blocks) {
    const end = block.indexOf("\n");
    out.set(block.slice(0, end), block.slice(end + 1).trim());
  }
  return out;
}

/** What else the machine was doing, since every time here is a wall clock's. */
function machine(): string {
  const load = loadavg()[0].toFixed(1);
  const free = (freemem() / 2 ** 30).toFixed(1);
  let swap = "";
  try {
    swap = `, swap ${execFileSync("sysctl", ["-n", "vm.swapusage"], { encoding: "utf8" }).trim()}`;
  } catch {
    // Only macOS answers this, and the load and free memory stand without it.
  }
  return `load ${load}, ${free} GB free${swap}`;
}

function write(sections: Map<string, string>): void {
  const lines = [
    "# Deal walk",
    "",
    "Each line is one ladder: a menu's largest size at one tier, then 1.5, 2, 3,",
    "4, 6 and 8 times it, ending at the first rung that is slow or fails. A game",
    "without tiers starts from its smallest size. A time is the mean of a",
    "cell's deals in seconds, then its slowest; `quick` is every deal under a",
    "tenth of a second. `npm run deal-walk` writes this, and",
    "`scripts/deal-walk.ts` says how to read it.",
    "",
  ];
  for (const id of [...sections.keys()].sort()) {
    lines.push(`${HEADING}${id}`, "", sections.get(id) ?? "", "");
  }
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${lines.join("\n").trimEnd()}\n`);
}

const all = gameIds(scratch);
const asked = process.argv.slice(2);
const unknown = asked.filter((id) => !all.includes(id));
if (unknown.length > 0) throw new Error(`no such game: ${unknown.join(", ")}`);
if (CELLS !== null) {
  if (asked.length !== 1) throw new Error("DEAL_WALK_CELLS is one game's params");
  const state = await walkGame(asked[0], scratch);
  console.log(`${renderGame(state)}\n\n${machine()}`);
} else {
  const queue = asked.length > 0 ? [...asked] : [...all];
  const sections = asked.length > 0 ? sectionsOnDisk() : new Map<string, string>();
  const settings = `up to ${SEEDS} deals a cell, a ladder ended by a deal over ${STOP_MS / 1000} s, a deal killed at ${KILL_MS / 1000} s, a ${HEAP_MB} MB heap, games dealt at once: ${Math.min(JOBS, queue.length)}`;
  const today = new Date().toISOString().slice(0, 10);

  const worker = async (): Promise<void> => {
    for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
      // Each game says when it was dealt and under what, since a walk of some
      // games leaves the others' sections as an earlier run wrote them.
      const stamp = `Dealt ${today}: ${settings}; at its start, ${machine()}.`;
      const state = await walkGame(id, scratch);
      sections.set(id, `${renderGame(state)}\n\n${stamp}`);
      write(sections);
      console.log(`deal-walk: ${id}`);
    }
  };
  await Promise.all(Array.from({ length: JOBS }, worker));
}
