/**
 * Map's graph-coloring solver (upstream `map_solver`), graded by tier:
 *   - DIFF_EASY    — {@link onlyColorLeft}: a region with one possible color;
 *   - DIFF_NORMAL  — {@link sharedPair}: two adjacent regions down to the same
 *                    two colors use both, so a region touching both is neither;
 *   - DIFF_HARD    — {@link forcingChain}: a chain of two-color regions;
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

/** The forcing-chain rung's search scratch, sized once per board. */
export interface ChainScratch {
  queue: Int32Array;
  /** The color a region is forced to on the branch being searched, -1 unseen. */
  forced: Int32Array;
  /** The region each reached region was forced from, -1 at the origin. */
  parent: Int32Array;
}

export function newChainScratch(n: number): ChainScratch {
  return {
    queue: new Int32Array(n),
    forced: new Int32Array(n),
    parent: new Int32Array(n),
  };
}

interface Scratch extends MapBoard, ChainScratch {
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
    ...newChainScratch(n),
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
 * HARD: forcing chains. From each blank two-color region, for each of its two
 * colors `c`, suppose it is the *other* one and follow the consequence through
 * every two-color neighbor it forces. A region driven to `c` that way means one
 * of it and the origin is `c` whichever the origin is, so a region adjacent to
 * both cannot be. Reported as `fire(origin, c, end, target)`; the chain from
 * `origin` to `end` is {@link chainTo} over `sc.parent`, which holds until the
 * next origin's search starts.
 */
export function forcingChain(
  b: MapBoard,
  sc: ChainScratch,
  fire: (origin: number, color: number, end: number, target: number) => void,
): void {
  const { graph, n, ngraph, coloring, possible } = b;
  const { queue, forced, parent } = sc;
  for (let i = 0; i < n; i++) {
    if (coloring[i] >= 0 || bitcount(possible[i]) !== 2) continue;

    for (let c = 0; c < FOUR; c++)
      if (possible[i] & (1 << c)) {
        const origc = 1 << c;
        forced.fill(-1);
        let head = 0;
        let tail = 0;
        queue[tail++] = i;
        forced[i] = possible[i] & ~origc;
        parent[i] = -1;

        while (head < tail) {
          const j = queue[head++];
          const currc = forced[j];

          for (
            let gi = graphVertexStart(graph, n, ngraph, j);
            gi < ngraph && graph[gi] < n * (j + 1);
            gi++
          ) {
            const k = graph[gi] - j * n;

            if (
              forced[k] < 0 &&
              coloring[k] < 0 &&
              bitcount(possible[k]) === 2 &&
              possible[k] & currc
            ) {
              queue[tail++] = k;
              forced[k] = possible[k] & ~currc;
              parent[k] = j;
            }

            if (
              currc === origc &&
              graphAdjacent(graph, n, ngraph, k, i) &&
              possible[k] & currc
            )
              fire(i, c, j, k);
          }
        }
      }
  }
}

/** The chain {@link forcingChain} walked from its origin to `end`, origin first. */
export function chainTo(sc: ChainScratch, end: number): number[] {
  const out: number[] = [];
  for (let j = end; j >= 0; j = sc.parent[j]) out.push(j);
  return out.reverse();
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
    forcingChain(sc, sc, (_i, c, _j, k) => {
      possible[k] &= ~(1 << c);
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
