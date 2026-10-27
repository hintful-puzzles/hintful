/**
 * What each test file costs: the CPU time `test-cost-setup.ts` measured in the
 * worker and appended to the log `scripts/gate.sh` names in `TEST_COST_RUN`,
 * one JSON line per file.
 *
 *     node scripts/checks/test-cost.ts report <log>
 *
 * prints the files that cost the most, the run's total, and the CPU time of
 * {@link calibrate}'s fixed workload on this machine.
 */
import { readFileSync } from "node:fs";

/** One test file's cost in one run. A spread file's share is its own entry,
 * told apart by `project`. */
interface Cost {
  file: string;
  project: string;
  /** User plus system CPU seconds. */
  cpu: number;
}

function readRun(log: string): Cost[] {
  return readFileSync(log, "utf8")
    .split("\n")
    .filter((line) => line !== "")
    .map((line) => JSON.parse(line) as Cost);
}

/** A file and its share, as a reader names it. */
function label(cost: Cost): string {
  return cost.project === "main" ? cost.file : `${cost.file} (${cost.project})`;
}

/**
 * A fixed, deterministic workload of the kind the suite does, timed in CPU
 * seconds: a breadth-first search keyed by strings in a `Map`, and a
 * backtracking fill of typed arrays. It imports nothing from the tree, so a
 * change to a game cannot change it.
 */
function calibrate(): number {
  const start = process.cpuUsage();
  let checksum = 0;
  for (let round = 0; round < 6; round++) checksum += slidingSearch(round);
  for (let round = 0; round < 40; round++) checksum += latinFill(9, round);
  const { user, system } = process.cpuUsage(start);
  // Read, so the work cannot be optimized away.
  if (checksum === -1) throw new Error("unreachable");
  return (user + system) / 1e6;
}

/** States reached from one of a few scrambles of the 3x3 sliding puzzle. */
function slidingSearch(seed: number): number {
  const startState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  let blank = 8;
  let rng = seed * 7919 + 1;
  for (let i = 0; i < 40; i++) {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    const moves = neighbors(blank);
    const to = moves[rng % moves.length];
    startState[blank] = startState[to];
    startState[to] = 0;
    blank = to;
  }
  const seen = new Map<string, number>([[startState.join(""), 0]]);
  const queue: number[][] = [startState];
  for (let head = 0; head < queue.length; head++) {
    const state = queue[head];
    const depth = seen.get(state.join("")) ?? 0;
    const hole = state.indexOf(0);
    for (const to of neighbors(hole)) {
      const next = state.slice();
      next[hole] = next[to];
      next[to] = 0;
      const key = next.join("");
      if (!seen.has(key)) {
        seen.set(key, depth + 1);
        queue.push(next);
      }
    }
  }
  return seen.size;
}

function neighbors(cell: number): number[] {
  const x = cell % 3;
  const y = Math.floor(cell / 3);
  const out: number[] = [];
  if (x > 0) out.push(cell - 1);
  if (x < 2) out.push(cell + 1);
  if (y > 0) out.push(cell - 3);
  if (y < 2) out.push(cell + 3);
  return out;
}

/** Counts the ways to finish a Latin square of order `n` whose first row is
 * rotated by `seed`, stopping at a fixed number of completions. */
function latinFill(n: number, seed: number): number {
  const grid = new Int8Array(n * n);
  const rowUsed = new Int32Array(n);
  const colUsed = new Int32Array(n);
  for (let x = 0; x < n; x++) {
    const v = ((x + seed) % n) + 1;
    grid[x] = v;
    rowUsed[0] |= 1 << v;
    colUsed[x] |= 1 << v;
  }
  let found = 0;
  const limit = 2000;
  const fill = (cell: number): void => {
    if (found >= limit) return;
    if (cell === n * n) {
      found++;
      return;
    }
    const x = cell % n;
    const y = Math.floor(cell / n);
    for (let v = 1; v <= n; v++) {
      const bit = 1 << v;
      if ((rowUsed[y] | colUsed[x]) & bit) continue;
      grid[cell] = v;
      rowUsed[y] |= bit;
      colUsed[x] |= bit;
      fill(cell + 1);
      rowUsed[y] &= ~bit;
      colUsed[x] &= ~bit;
    }
    grid[cell] = 0;
  };
  fill(n);
  return found;
}

function report(log: string): void {
  const costs = readRun(log).sort((a, b) => b.cpu - a.cpu);
  const total = costs.reduce((sum, c) => sum + c.cpu, 0);
  console.log(
    `Test CPU time: ${(total / 60).toFixed(1)} minutes over ${costs.length} files.`,
  );
  for (const cost of costs.filter((c) => c.cpu >= 5))
    console.log(`${cost.cpu.toFixed(1).padStart(8)} s  ${label(cost)}`);
  const unit = [calibrate(), calibrate(), calibrate()].sort((a, b) => a - b);
  console.log(`Calibration workload: ${unit.map((u) => u.toFixed(3)).join(", ")} s`);
}

if (process.argv[1] === import.meta.filename) {
  const [command, log] = process.argv.slice(2);
  if (command !== "report" || log === undefined)
    throw new Error("usage: test-cost.ts report <log>");
  report(log);
}
