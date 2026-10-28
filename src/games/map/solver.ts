/**
 * Map's graph-coloring solver (upstream `map_solver`), graded by tier:
 *   - DIFF_EASY    — {@link onlyColorLeft}: a region with one possible color;
 *   - DIFF_NORMAL  — {@link sharedPair}: two adjacent regions down to the same
 *                    two colors use both, so a region touching both is neither;
 *   - DIFF_HARD    — {@link weighRegion}: every color one region can take,
 *                    each read off its neighbors' dots;
 *   - DIFF_RECURSE — guess and verify (also proves uniqueness at every level).
 *
 * Each rung is a function that *reports* its firings through a callback, and
 * the two callers differ only in what they do with one. The solver applies it
 * on the spot, which is the order upstream's single loop mutated in, so a later
 * firing of the same pass sees an earlier one exactly as it did there. The hint
 * (`hint.ts`) collects the firings without applying any, because it wants every
 * one available and the witness each rests on.
 */

import { graphAdjacent, graphVertexStart } from "./graph.ts";
import { DIFF_EASY, DIFF_HARD, DIFF_NORMAL, DIFF_RECURSE, DIFFCOUNT } from "./state.ts";

const FOUR = 4;

export const SOLVER_IMPOSSIBLE = 0;
export const SOLVER_UNIQUE = 1;
/** Ambiguous, or too hard for the given difficulty. */
const SOLVER_STUCK = 2;

/** What the rungs read: the adjacency graph, each region's color (-1 blank)
 * and the colors each region may still take, as a four-bit mask. */
export interface MapBoard {
  readonly graph: Int32Array;
  readonly n: number;
  readonly ngraph: number;
  readonly coloring: Int32Array;
  readonly possible: Uint8Array;
}

interface Scratch extends MapBoard {
  depth: number;
}

function newScratch(
  graph: Int32Array,
  n: number,
  ngraph: number,
  coloring: Int32Array,
): Scratch {
  return {
    graph,
    n,
    ngraph,
    coloring,
    possible: new Uint8Array(n),
    depth: 0,
  };
}

/** Count the (up to four) set bits of a color bitmask. */
export function bitcount(word: number): number {
  let w = ((word & 0xa) >> 1) + (word & 0x5);
  w = ((w & 0xc) >> 2) + (w & 0x3);
  return w;
}

/** The regions adjacent to `i`, each once. */
export function* neighbors(
  graph: Int32Array,
  n: number,
  ngraph: number,
  i: number,
): Generator<number> {
  for (
    let j = graphVertexStart(graph, n, ngraph, i);
    j < ngraph && graph[j] < n * (i + 1);
    j++
  )
    yield graph[j] - i * n;
}

/**
 * Fix `index` to `color`, ruling that color out of every neighbor. Returns
 * false iff `color` was not a possibility for `index`.
 */
function placeColor(b: MapBoard, index: number, color: number): boolean {
  const { graph, n, ngraph, possible, coloring } = b;
  if (!(possible[index] & (1 << color))) return false;

  possible[index] = 1 << color;
  coloring[index] = color;

  for (
    let j = graphVertexStart(graph, n, ngraph, index);
    j < ngraph && graph[j] < n * (index + 1);
    j++
  ) {
    const k = graph[j] - index * n;
    possible[k] &= ~(1 << color);
  }
  return true;
}

/**
 * EASY: every blank region with exactly one possible color, reported as
 * `fire(region, color)`. Returns false iff some blank region has none, which
 * proves the board inconsistent.
 */
export function onlyColorLeft(
  b: MapBoard,
  fire: (region: number, color: number) => void,
): boolean {
  const { n, coloring, possible } = b;
  for (let i = 0; i < n; i++)
    if (coloring[i] < 0) {
      const p = possible[i];
      if (p === 0) return false;
      if ((p & (p - 1)) === 0) fire(i, 31 - Math.clz32(p));
    }
  return true;
}

/**
 * NORMAL: two adjacent blank regions whose possibilities are the same two
 * colors use both of them between them, so any region adjacent to both can be
 * neither. Reported once per such region still holding one of the two, as
 * `fire(a, b, colors, target)` with `colors` the pair's mask.
 */
export function sharedPair(
  b: MapBoard,
  fire: (a: number, b: number, colors: number, target: number) => void,
): void {
  const { graph, n, ngraph, coloring, possible } = b;
  for (let i = 0; i < ngraph; i++) {
    const j1 = Math.floor(graph[i] / n);
    const j2 = graph[i] % n;
    if (j1 > j2) continue;
    if (coloring[j1] >= 0 || coloring[j2] >= 0) continue;
    if (possible[j1] !== possible[j2]) continue;

    const v = possible[j1];
    if (bitcount(v) !== 2) continue;

    for (
      let j = graphVertexStart(graph, n, ngraph, j1);
      j < ngraph && graph[j] < n * (j1 + 1);
      j++
    ) {
      const k = graph[j] - j1 * n;
      if (graphAdjacent(graph, n, ngraph, k, j2) && possible[k] & v) fire(j1, j2, v, k);
    }
  }
}

/**
 * HARD: weigh every color a blank region `middle` can take. Each color is read
 * off the board as it stands: a neighbor whose two dots are that color and `x`
 * is left only `x`. A region that, whichever color `middle` takes, touches the
 * `x` it leaves, or touches `middle` where that color is `x` itself, cannot be
 * `x`. Reported as `fire(middle, x, ends, target)`, `ends` holding one
 * neighbor of both per color of `middle` other than `x`.
 *
 * Each way is one color placed and its neighbors' dots read, nothing
 * propagated further: Path's weighed square, on a graph. A three-region
 * forcing chain is exactly the case of a two-color `middle`, and a longer one
 * is a supposition, which Unreasonable's search covers.
 */
export function weighRegion(
  b: MapBoard,
  fire: (middle: number, x: number, ends: readonly number[], target: number) => void,
): void {
  const { graph, n, ngraph, coloring, possible } = b;
  const touch = (a: number, c: number) => graphAdjacent(graph, n, ngraph, a, c);
  for (let m = 0; m < n; m++) {
    if (coloring[m] >= 0) continue;
    const around = [...neighbors(graph, n, ngraph, m)].filter((k) => coloring[k] < 0);
    for (let x = 0; x < FOUR; x++) {
      // Per color of `middle` but `x`, the neighbors that color leaves only `x`.
      const leftX: number[][] = [];
      for (let c = 0; c < FOUR; c++)
        if (c !== x && possible[m] & (1 << c)) {
          const pair = (1 << c) | (1 << x);
          leftX.push(around.filter((k) => possible[k] === pair));
        }
      if (leftX.length === 0 || leftX.some((ks) => ks.length === 0)) continue;
      const self = (possible[m] & (1 << x)) !== 0;

      const seen = new Set<number>();
      for (const k0 of leftX[0])
        for (const t of neighbors(graph, n, ngraph, k0)) {
          if (t === m || seen.has(t)) continue;
          seen.add(t);
          if (coloring[t] >= 0 || !(possible[t] & (1 << x))) continue;
          if (self && !touch(t, m)) continue;
          const ends: number[] = [];
          for (const ks of leftX) {
            const k = ks.find((k) => k !== t && touch(k, t));
            if (k === undefined) break;
            ends.push(k);
          }
          if (ends.length === leftX.length) fire(m, x, ends, t);
        }
    }
  }
}

// The difficulty tiers are caps on how far down this ladder the solver may go,
// so each rung runs against the same board and the cap stays one number. Every
// rung restarts the loop when it fires, which is what makes a lower rung always
// run to exhaustion before a higher one is tried.
function solve(sc: Scratch, difficulty: number): number {
  const { n, coloring, possible } = sc;
  if (sc.depth === 0) {
    for (let i = 0; i < n; i++) possible[i] = (1 << FOUR) - 1;
    for (let i = 0; i < n; i++)
      if (coloring[i] >= 0 && !placeColor(sc, i, coloring[i])) return SOLVER_IMPOSSIBLE; // clues aren't even consistent
  }

  for (;;) {
    let doneSomething = false;

    if (difficulty < DIFF_EASY) break;
    const consistent = onlyColorLeft(sc, (i, c) => {
      placeColor(sc, i, c);
      doneSomething = true;
    });
    if (!consistent) return SOLVER_IMPOSSIBLE;
    if (doneSomething) continue;

    if (difficulty < DIFF_NORMAL) break;
    sharedPair(sc, (_a, _b, v, k) => {
      possible[k] &= ~v;
      doneSomething = true;
    });
    if (doneSomething) continue;

    if (difficulty < DIFF_HARD) break;
    weighRegion(sc, (_m, x, _ends, t) => {
      possible[t] &= ~(1 << x);
      doneSomething = true;
    });
    if (!doneSomething) break;
  }

  if (!coloring.includes(-1)) return SOLVER_UNIQUE; // every region colored

  if (difficulty < DIFF_RECURSE) return SOLVER_STUCK;

  // Recurse on a most-constrained region.
  let best = -1;
  let bestc = FOUR + 1;
  for (let i = 0; i < n; i++)
    if (coloring[i] < 0) {
      const c = bitcount(possible[i]);
      if (c < bestc) {
        best = i;
        bestc = c;
      }
    }

  const origcoloring = coloring.slice();
  const subcoloring = new Int32Array(n);
  const rsc = newScratch(sc.graph, n, sc.ngraph, subcoloring);
  rsc.depth = sc.depth + 1;
  let weAlreadyGotOne = false;
  let ret = SOLVER_IMPOSSIBLE;

  for (let i = 0; i < FOUR; i++) {
    if (!(possible[best] & (1 << i))) continue;

    rsc.possible.set(possible);
    subcoloring.set(origcoloring);
    placeColor(rsc, best, i);

    const subret = solve(rsc, difficulty);

    if (subret === SOLVER_STUCK || (subret === SOLVER_UNIQUE && weAlreadyGotOne)) {
      ret = SOLVER_STUCK;
      break;
    }
    if (subret === SOLVER_UNIQUE) {
      coloring.set(subcoloring);
      weAlreadyGotOne = true;
      ret = SOLVER_UNIQUE;
    }
  }

  return ret;
}

/**
 * Solve `coloring` (mutated in place) at `difficulty`. Returns the three-valued
 * verdict. `coloring` should hold clue colors (0..3) and -1 elsewhere.
 */
export function mapSolver(
  graph: Int32Array,
  n: number,
  ngraph: number,
  coloring: Int32Array,
  difficulty: number,
): number {
  return solve(newScratch(graph, n, ngraph, coloring), difficulty);
}

/**
 * Grade a board: the easiest difficulty at which it is uniquely solvable, or
 * null if none (matches the C standalone rater). `clues` is the immutable clue
 * coloring (0..3 / -1).
 */
export function gradeMap(
  graph: Int32Array,
  n: number,
  ngraph: number,
  clues: Int32Array,
): number | null {
  for (let diff = 0; diff < DIFFCOUNT; diff++) {
    const coloring = clues.slice();
    if (mapSolver(graph, n, ngraph, coloring, diff) === SOLVER_UNIQUE) {
      return diff;
    }
  }
  return null;
}
