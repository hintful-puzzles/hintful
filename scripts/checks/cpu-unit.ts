/**
 * How fast this machine is today, for the gate's cost budget
 * (`test-cost.ts`): the CPU seconds a fixed workload takes.
 *
 * GitHub's runners differ: two Gate runs a few hours apart (40553996591 and
 * 40568467469, 2026-10-27) took 1.6 to 1.8 times the CPU, and the wall time,
 * for test files neither changed. A budget in raw seconds passes a tree on one
 * runner and fails it on the next. Divided by this workload's time on the
 * same machine, the costs of the two runs are in one unit.
 *
 * It does not convert between kinds of machine: on a laptop with no
 * hyperthreads the suite ran 1.5 to 2.3 times faster than on CI, and this
 * workload 1.3 times, since CI's four workers share two cores and a lone
 * workload does not. So a laptop's costs read low, and CI is the stricter
 * judge.
 */

/** This machine's time for the workload, in CPU seconds: the least of three
 * runs, since a run can only be slowed by what else the machine does. */
export function cpuUnit(): number {
  return Math.min(calibrate(), calibrate(), calibrate());
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
