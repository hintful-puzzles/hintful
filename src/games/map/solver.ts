/**
 * Map's solver: the ladder `map.description.yaml` states, compiled, on the
 * engine's marks and runner (`engine/ladder-runtime.ts`), with the reason
 * each technique records for the hint, and the engine's search above it
 * (`engine/answer-search.ts`).
 * The tiers are upstream's (`map_solver`):
 *   - Easy — `lone`: a region down to one color;
 *   - Normal — `pair`: two bordering regions down to the same two colors use
 *     both, so a region bordering both is neither;
 *   - Tricky — `weigh`: every color one region can take, each read off a
 *     neighbor down to that color and one other;
 *   - Unreasonable — a search on a most-constrained region, counting the
 *     answers to two, as upstream's recursion did.
 *
 * The board is its regions, the space's cells, and which border which, the
 * relation `borders` the map deals. A color is one more than its index
 * (`0..3`), since the marks hold no value 0.
 */

import { type Deduced, searchAnswers } from "../../engine/answer-search.ts";
import { describedSpace, popcount, rangeMask } from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  placingRung,
  runLadder,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { graphNeighbors } from "./graph.ts";
import * as map from "./map.compiled.ts";
import { DIFF_RECURSE, DIFFCOUNT } from "./state.ts";

export const SOLVER_IMPOSSIBLE = 0;
export const SOLVER_UNIQUE = 1;
/** Ambiguous, or too hard for the given difficulty. */
const SOLVER_STUCK = 2;

/** The four colors, as the marks hold them: color `i` is value `i + 1`. */
const COLORS = rangeMask(1, 4);

/** Why a technique fired, as the hint narrates it. Colors are the marks'
 * values, one more than a color's index. */
export type MapRecordReason =
  /** The region is down to one color. */
  | { kind: "lone" }
  /** `a` and `b` border each other and are down to the colors `colors`. */
  | { kind: "pair"; a: number; b: number; colors: number }
  /** Every color `middle` can take but `x` leaves `x` alone in one of `ends`,
   * each bordering the struck region; `self` where `middle` could be `x`. */
  | {
      kind: "weigh";
      middle: number;
      x: number;
      ends: readonly number[];
      self: boolean;
    };

const dealt = new WeakMap<Int32Array, map.Dealt>();

/** The board as the description deals it: which region borders which, from
 * the map's edge list, kept for the life of the graph. */
export function dealtOf(graph: Int32Array, n: number): map.Dealt {
  let dl = dealt.get(graph);
  if (dl === undefined) {
    dl = { borders: graphNeighbors(graph, n) };
    dealt.set(graph, dl);
  }
  return dl;
}

/** The ladder over the dealt borders, each technique with its reason. */
export function mapLadder(dl: map.Dealt): Ladder {
  return describedLadder(map, {
    placed: placingRung(map.placed, dl),
    lone: uncluedRung(map.lone, (): MapRecordReason => ({ kind: "lone" })),
    pair: compiledRung(
      map.pair,
      dl,
      ({ a, b }, _c, _n, m): MapRecordReason => ({
        kind: "pair",
        a,
        b,
        colors: m.cand(a),
      }),
    ),
    weigh: compiledRung(
      map.weigh,
      dl,
      ({ m: middle, x, E }, _c, _n, m): MapRecordReason => ({
        kind: "weigh",
        middle,
        x,
        ends: E.slice(),
        self: m.has(middle, x),
      }),
    ),
  });
}

/** The marks over `n` regions, each able to be any color. */
export function mapMarks(n: number, grid: Uint8Array): CellMarks {
  return new CellMarks(describedSpace(map.units, n, 1), COLORS, grid);
}

/** The marks' values of a coloring: `-1` (blank) to 0, a color to one more. */
export function gridOf(coloring: ArrayLike<number>): Uint8Array {
  return Uint8Array.from(coloring, (c) => c + 1);
}

/**
 * The positions Unreasonable's search may try. Upstream's recursion had no
 * bound; dealing 20 boards a tier at 15×20 with 30 regions, 25×30 with 75 and
 * 10×10 with 15, the most any solve tried was 45 (2026-11-02), so a board
 * this refuses is far past any a deal has come near.
 */
const SEARCH_BUDGET = 100_000;

/** Run the ladder on `m` no harder than `cap`, below Unreasonable. */
function deduce(m: CellMarks, ladder: Ladder, cap: number, dl: map.Dealt): Deduced {
  const techniques = ladderTechniques(
    m,
    ladder.entries,
    { [TIERS]: Math.min(cap, DIFF_RECURSE - 1) },
    {},
  );
  if (runLadder(m, techniques)) return "contradiction";
  if (m.grid.includes(0)) return "stuck";
  return map.isAnswer(m.grid, m.sp, dl) ? "solved" : "contradiction";
}

/** `m` divided on a most-constrained region, a copy for each color it may
 * still take. */
function assume(m: CellMarks, ladder: Ladder): CellMarks[] {
  let best = -1;
  let fewest = 5;
  for (let r = 0; r < m.grid.length; r++)
    if (m.grid[r] === 0 && popcount(m.cands[r]) < fewest) {
      best = r;
      fewest = popcount(m.cands[r]);
    }
  const out: CellMarks[] = [];
  for (let d = 1; d <= 4; d++) {
    if (!m.has(best, d)) continue;
    const sub = new CellMarks(m.sp, COLORS, m.grid.slice());
    sub.placing = ladder.placing;
    sub.cands.set(m.cands);
    sub.place(best, d);
    out.push(sub);
  }
  return out;
}

/**
 * Solve `coloring` (mutated in place) at `difficulty`. Returns the three-valued
 * verdict. `coloring` should hold clue colors (0..3) and -1 elsewhere.
 */
export function mapSolver(
  graph: Int32Array,
  n: number,
  coloring: Int32Array,
  difficulty: number,
): number {
  const dl = dealtOf(graph, n);
  const ladder = mapLadder(dl);
  const m = mapMarks(n, new Uint8Array(n));
  m.placing = ladder.placing;
  if (!m.seed(gridOf(coloring))) return SOLVER_IMPOSSIBLE;
  let solved: CellMarks;
  if (difficulty < DIFF_RECURSE) {
    const got = deduce(m, ladder, difficulty, dl);
    if (got !== "solved")
      return got === "contradiction" ? SOLVER_IMPOSSIBLE : SOLVER_STUCK;
    solved = m;
  } else {
    const answer = searchAnswers({
      start: m,
      deduce: (p) => deduce(p, ladder, difficulty, dl),
      assume: (p) => assume(p, ladder),
      solution: (p) => p,
      budget: SEARCH_BUDGET,
    });
    if (answer.kind === "none") return SOLVER_IMPOSSIBLE;
    if (answer.kind !== "one") return SOLVER_STUCK;
    solved = answer.solution;
  }
  for (let r = 0; r < n; r++) coloring[r] = solved.grid[r] - 1;
  return SOLVER_UNIQUE;
}

/** Whether `coloring`, every region colored, is an answer: no two bordering
 * regions alike, by the rules the description compiles to. */
export function isColored(graph: Int32Array, n: number, coloring: Int32Array): boolean {
  return map.isAnswer(
    gridOf(coloring),
    describedSpace(map.units, n, 1),
    dealtOf(graph, n),
  );
}

/**
 * Grade a board: the easiest difficulty at which it is uniquely solvable, or
 * null if none (matches the C standalone rater). `clues` is the immutable clue
 * coloring (0..3 / -1).
 */
export function gradeMap(
  graph: Int32Array,
  n: number,
  clues: Int32Array,
): number | null {
  for (let diff = 0; diff < DIFFCOUNT; diff++) {
    if (mapSolver(graph, n, clues.slice(), diff) === SOLVER_UNIQUE) return diff;
  }
  return null;
}
