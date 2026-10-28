/**
 * Clusters solver — port of `clusters_validate` / `clusters_solver_try` /
 * `clusters_solve_game` in `puzzles/unreleased/clusters.c`.
 *
 * It is deduction, not guess-and-backtrack search:
 *   - `clustersValidate` classifies a grid COMPLETE / UNFINISHED / INVALID
 *     from local neighbor counts;
 *   - `solverTry` (difficulty 0, Easy) forces an empty cell's color whenever
 *     the opposite color would make the board INVALID — a single-cell proof by
 *     contradiction;
 *   - `solverCount` (difficulty 1, Normal) reads two tiles' counts over the
 *     squares both touch. Upstream's Normal ran the Easy fixpoint from a
 *     supposed color, a Search, which the count replaced on 2026-10-28; a board
 *     that needs it is Unreasonable, and the search for its answer is
 *     {@link answerSearch}.
 * Because the generator is solver-gated, this solver's exact verdict on every
 * intermediate board decides which puzzles exist.
 *
 * ## The `F_ERROR` contamination quirk (it decides which boards exist)
 *
 * Upstream `clusters_validate` **mutates an `F_ERROR` bit into the grid** on
 * every filled cell (set on a rule violation, cleared otherwise), and the
 * generator never masks it out: it survives the two-color fill (which only
 * rewrites cleared cells), the isolated-cell flip (`^= COLMASK` leaves bit 3
 * untouched), and the reduce-to-dots (`|= F_SINGLE`), so it reaches the
 * prune's *full-byte* `grid[i] == grid[i-1]` comparison. Two adjacent dots
 * that would prune away survive if their `F_ERROR` bits differ. So the
 * mutating validate the solver/generator use ({@link clustersValidate}) writes
 * it exactly as C does, while the play-side checks ({@link clustersStatus},
 * {@link findErrors}) do not mutate, so persisted state and the renderer stay
 * `F_ERROR`-free.
 */

import { type Answer, searchAnswers } from "../../engine/answer-search.ts";
import {
  findingTechniques,
  runDeductionFixpoint,
  singleFirings,
} from "../../engine/deduction-fixpoint.ts";
import { deduceHintPlan as accumulateHintPlan } from "../../engine/hint-plan.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import {
  type ClustersFill,
  COLMASK,
  DIFF_TRICKY,
  F_COLOR_0,
  F_COLOR_1,
  F_ERROR,
  F_SINGLE,
  opposite,
} from "./state.ts";

export const COMPLETE = 0;
export const UNFINISHED = 1;
export const INVALID = 2;
export type ClustersStatus = typeof COMPLETE | typeof UNFINISHED | typeof INVALID;

const DX = [-1, 1, 0, 0];
const DY = [0, 0, -1, 1];

/** Same- and other-color orthogonal-neighbor counts of cell `(x,y)` relative
 * to color `col` (a `COLMASK` value), plus how many neighbors exist at all
 * (`max`) — upstream `clusters_count` summed over the four directions. */
function neighborCounts(
  grid: Uint8Array,
  w: number,
  h: number,
  x: number,
  y: number,
  col: number,
): { same: number; other: number; max: number } {
  let same = 0;
  let other = 0;
  let max = 0;
  for (let d = 0; d < 4; d++) {
    const nx = x + DX[d];
    const ny = y + DY[d];
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
    max++;
    const nc = grid[ny * w + nx] & COLMASK;
    if (nc === col) same++;
    else if (nc !== 0) other++;
  }
  return { same, other, max };
}

/** Which rule the filled cell `i` breaks, or null — upstream
 * `clusters_validate`'s three error conditions, in its order:
 *  - `surrounded`: wholly surrounded by the other color (`other === max`);
 *  - `dotOvercount`: a dot (`F_SINGLE`) touching more than one same-color
 *    neighbor;
 *  - `reachTwo`: a non-dot that can no longer reach two same-color neighbors
 *    (`other === max - 1`). */
function errorKind(
  grid: Uint8Array,
  w: number,
  h: number,
  i: number,
): ClustersRuleKind | null {
  const cell = grid[i];
  const col = cell & COLMASK;
  if (col === 0) return null;
  const x = i % w;
  const y = (i - x) / w;
  const { same, other, max } = neighborCounts(grid, w, h, x, y, col);
  if (other === max) return "surrounded";
  if (cell & F_SINGLE && same > 1) return "dotOvercount";
  if (!(cell & F_SINGLE) && other === max - 1) return "reachTwo";
  return null;
}

/** Core classifier. `markGrid` writes the `F_ERROR` bit into `grid` exactly as
 * upstream does (the quirk above); `errors`, if given, collects the
 * offending cell indices (for the pure play-side checks). An empty cell (byte
 * 0) downgrades COMPLETE to UNFINISHED. */
function classify(
  grid: Uint8Array,
  w: number,
  h: number,
  markGrid: boolean,
  errors?: number[],
): ClustersStatus {
  const s = w * h;
  let anyEmpty = false;
  let anyError = false;
  for (let i = 0; i < s; i++) {
    if (grid[i] === 0) {
      anyEmpty = true;
      continue;
    }
    if (errorKind(grid, w, h, i) !== null) {
      anyError = true;
      errors?.push(i);
      if (markGrid) grid[i] |= F_ERROR;
    } else if (markGrid) {
      grid[i] &= ~F_ERROR;
    }
  }
  if (anyError) return INVALID;
  return anyEmpty ? UNFINISHED : COMPLETE;
}

/** The generator/solver validate: classifies AND mutates the `F_ERROR` bit
 * into `grid` (upstream fidelity — see the module note). */
function clustersValidate(grid: Uint8Array, w: number, h: number): ClustersStatus {
  return classify(grid, w, h, true);
}

/** Pure classifier for the play side (executeMove / solve) — no mutation. */
export function clustersStatus(grid: Uint8Array, w: number, h: number): ClustersStatus {
  return classify(grid, w, h, false);
}

/** The indices of every cell that breaks a rule — pure, for `findMistakes`
 * and the live-error renderer. */
export function findErrors(grid: Uint8Array, w: number, h: number): number[] {
  const errors: number[] = [];
  classify(grid, w, h, false, errors);
  return errors;
}

/** Difficulty-0 deduction: for each empty cell, if coloring it one way makes
 * the board INVALID, force the other color. Returns how many cells it fixed
 * (0 = no progress). Mutates `grid` in place (including its `F_ERROR` bits). */
function solverTry(grid: Uint8Array, w: number, h: number): number {
  const s = w * h;
  let ret = 0;
  for (let i = 0; i < s; i++) {
    if (grid[i] !== 0) continue;
    for (let d = 0; d <= 1; d++) {
      grid[i] = d ? F_COLOR_1 : F_COLOR_0;
      if (clustersValidate(grid, w, h) === INVALID) {
        grid[i] = d ? F_COLOR_0 : F_COLOR_1; // forced to the opposite color
        ret++;
        break;
      }
      grid[i] = 0; // no contradiction — undo and try the other color
    }
  }
  return ret;
}

/** The empty orthogonal neighbors of cell `i`. */
function emptyAround(grid: Uint8Array, w: number, h: number, i: number): number[] {
  const x = i % w;
  const y = (i - x) / w;
  const out: number[] = [];
  for (let d = 0; d < 4; d++) {
    const nx = x + DX[d];
    const ny = y + DY[d];
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
    if (grid[ny * w + nx] === 0) out.push(ny * w + nx);
  }
  return out;
}

/** How many of tile `i`'s empty neighbors can still take its color: at least
 * `lo` and at most `hi`. A dot takes exactly one tile of its color, and any
 * other tile at least two. */
function colorRange(
  grid: Uint8Array,
  w: number,
  h: number,
  i: number,
): { open: number[]; lo: number; hi: number } {
  const col = grid[i] & COLMASK;
  const x = i % w;
  const { same } = neighborCounts(grid, w, h, x, (i - x) / w, col);
  const open = emptyAround(grid, w, h, i);
  if (grid[i] & F_SINGLE) return { open, lo: 1 - same, hi: 1 - same };
  return { open, lo: Math.max(0, 2 - same), hi: open.length };
}

/**
 * Normal's rung: two tiles' counts over the squares both touch. Tile `b`
 * bounds how many of those shared squares can take tile `a`'s color, and that
 * settles `a`'s other empty neighbors: where every one `a` may still take is
 * bound to be among the shared squares (`a` a dot whose one is there), the
 * others take the other color; where too few can be there for what `a` needs,
 * the others take `a`'s color. Every premise is a count of colors on the
 * board, and nothing is supposed. Yields one deduction for each square
 * settled, in scan order of `a`, then `b`. Leaves `grid` unchanged.
 */
function* countDeductions(
  grid: Uint8Array,
  w: number,
  h: number,
): Generator<ClustersDeduction> {
  const s = w * h;
  const tiles: number[] = [];
  for (let i = 0; i < s; i++)
    if (grid[i] & COLMASK && emptyAround(grid, w, h, i).length) tiles.push(i);
  for (const a of tiles) {
    const ca = (grid[a] & COLMASK) as ClustersFill;
    const A = colorRange(grid, w, h, a);
    for (const b of tiles) {
      if (b === a) continue;
      const shared = A.open.filter((u) => emptyAround(grid, w, h, b).includes(u));
      if (shared.length === 0) continue;
      const rest = A.open.filter((u) => !shared.includes(u));
      if (rest.length === 0) continue;
      // How many shared squares can take `a`'s color, by `b`'s count alone.
      const B = colorRange(grid, w, h, b);
      const bOther = B.open.filter((u) => !shared.includes(u)).length;
      const sameColor = (grid[b] & COLMASK) === ca;
      const least = sameColor
        ? Math.max(0, B.lo - bOther)
        : Math.max(0, shared.length - B.hi);
      const most = sameColor
        ? Math.min(shared.length, B.hi)
        : shared.length - Math.max(0, B.lo - bOther);
      let fill: ClustersFill | null = null;
      let form: "full" | "short" | null = null;
      // `b` must add something: `a`'s count alone is the Easy rung's.
      if (A.hi > 0 && least >= A.hi) {
        fill = opposite(ca);
        form = "full";
      } else if (A.lo - most >= rest.length && most < shared.length) {
        fill = ca;
        form = "short";
      }
      if (fill === null || form === null) continue;
      for (const index of rest)
        yield {
          index,
          fill,
          refuted: opposite(fill),
          reason: { kind: "count", a, b, shared, form, most },
        };
    }
  }
}

/** Normal's rung for the solver: colors every square
 * {@link countDeductions} settles. Mutates `grid` in place. */
function solverCount(grid: Uint8Array, w: number, h: number): number {
  let ret = 0;
  for (const d of countDeductions(grid, w, h)) {
    if (grid[d.index] !== 0) continue;
    grid[d.index] = d.fill;
    ret++;
  }
  return ret;
}

/**
 * Run the solver to a fixpoint on the shared ordered technique ladder
 * (`engine/deduction-fixpoint.ts`). `maxdiff` 0 uses `solverTry` only; ≥ 1 adds
 * `solverCount`. Returns the final verdict — COMPLETE if fully solved,
 * INVALID on a contradiction, UNFINISHED if it gets stuck. Mutates `grid`.
 *
 * `clustersValidate` both stops the loop *and* supplies the verdict, while the
 * runner's `settled` hook is a boolean, so the verdict rides out in a local:
 * `settled` runs exactly where upstream's validate call ran, once per iteration.
 */
export function solveGame(
  grid: Uint8Array,
  w: number,
  h: number,
  maxdiff: number,
): ClustersStatus {
  // The last verdict `settled` saw — UNFINISHED when the ladder stops because
  // nothing fired rather than because the board settled.
  let status: ClustersStatus = UNFINISHED;
  runDeductionFixpoint({
    techniques: [
      { id: "single-cell-refutation", tier: 0, run: () => solverTry(grid, w, h) },
      { id: "count", tier: 1, run: () => solverCount(grid, w, h) },
    ],
    maxTier: maxdiff,
    settled: () => {
      status = clustersValidate(grid, w, h);
      return status !== UNFINISHED;
    },
  });
  return status;
}

/** How many positions {@link answerSearch} may try. Lowering it refuses
 * boards in saved games: those of Unreasonable, and those dealt at Normal
 * before 2026-10-28, which may need the supposition Normal then had. Of 90 of
 * those, dealt at 7x7, 6x8 and 9x9, 74 do, and each took at most 25 positions
 * (2026-10-28). */
const ANSWER_BUDGET = 5000;

/**
 * The answers of the board `givens` holds, counted to two by trial and error
 * over the whole ladder: where it stops, an empty square is tried in each
 * color and the ladder run again. The answer is the board's colors.
 */
export function answerSearch(
  givens: Uint8Array,
  w: number,
  h: number,
  budget = ANSWER_BUDGET,
): Answer<Uint8Array> {
  return searchAnswers<Uint8Array, Uint8Array>({
    start: givens.slice(),
    deduce: (grid) => {
      const status = solveGame(grid, w, h, DIFF_TRICKY);
      if (status === COMPLETE) return "solved";
      return status === INVALID ? "contradiction" : "stuck";
    },
    assume: (grid) => {
      const i = grid.indexOf(0);
      return [F_COLOR_0, F_COLOR_1].map((fill) => {
        const copy = grid.slice();
        copy[i] = fill;
        return copy;
      });
    },
    solution: (grid) => grid.map((tile) => tile & ~F_ERROR),
    budget,
  });
}

// --- hint plan --------------------------------------------------------------
//
// A *parallel recorder* over the same contradiction deduction
// (docs/hints-candidates.md § "A candidate game off the shared walk"): separate code
// reusing this module's primitives, so the generator's `solveGame` path above
// stays byte-identical by construction — no recorder flag threads through it.
// Where the generator only needs *that* a coloring is refuted, the hint also
// needs *why* (which rule trips, at which cell), so each firing re-derives its
// contradiction in detail.
//
// The plan discipline deliberately differs from `solveGame`'s pass-sweeps:
// firings restart the row-major scan after each firing (one deduction = one
// plan step, cheapest first). Both rungs are deterministic, so a recomputed
// plan continues exactly where the previous one left off. Confluence makes
// the different order safe: a refuted coloring stays refuted as more cells
// fill in (the three error conditions are monotone — filling cells can only
// create errors, never cure them), and a count's bounds only narrow, so any
// scan order reaches the same verdict.

/** Which of `errorKind`'s three rules a refuted coloring breaks. */
export type ClustersRuleKind = "surrounded" | "dotOvercount" | "reachTwo";

/** The rule violation a refuted coloring runs into: `cell` is where the
 * board breaks (the tentatively-colored cell itself, or a neighbor). */
export interface ClustersContradiction {
  kind: ClustersRuleKind;
  cell: number;
}

export type ClustersReason =
  | { kind: "direct"; at: ClustersContradiction }
  /** Tile `b`'s count over the squares it shares with tile `a` settles
   * `a`'s other empty neighbors: `full` where `a`'s last tile of its color
   * must be among them, `short` where at most `most` of them can take `a`'s
   * color and `a` needs every other. */
  | {
      kind: "count";
      a: number;
      b: number;
      shared: number[];
      form: "full" | "short";
      most: number;
    };

/** The rungs a hint step can be: the reasons' kinds. */
export const CLUSTERS_RUNGS = ["direct", "count"] as const;
export type ClustersRung = (typeof CLUSTERS_RUNGS)[number];

/** One forced move: coloring `index` with `refuted` breaks `reason`, so it
 * must be `fill`. */
export interface ClustersDeduction {
  index: number;
  fill: ClustersFill;
  refuted: ClustersFill;
  reason: ClustersReason;
}

/** The whole remaining plan. `verdict` COMPLETE means the deductions solve
 * the board — which also *certifies the position*: the error conditions are
 * monotone, so a complete zero-error grid is the unique solution, and a
 * position containing a wrong tile cannot end COMPLETE.
 *
 * On a board this deduction solves from its givens, which every dealt board
 * is, such a position ends INVALID and never UNFINISHED. Each refutation the
 * solve from the givens used still holds with more cells filled, so the plan
 * goes on placing solution colors until it meets the wrong tile, and that
 * tile's own refutation is then on the board: an error at once, or one the
 * single-cell forcings run into. UNFINISHED is left for a board the deduction
 * cannot finish from its givens, which only a typed-in description can be. */
export interface ClustersHintPlan {
  verdict: ClustersStatus;
  deductions: ClustersDeduction[];
}

/** After filling cell `i` on an otherwise error-free board, a new violation
 * can only sit at `i` or an orthogonal neighbor (the three error conditions
 * read one cell's neighborhood). Returns the first, preferring `i` itself. */
function contradictionAround(
  grid: Uint8Array,
  w: number,
  h: number,
  i: number,
): ClustersContradiction | null {
  const kind = errorKind(grid, w, h, i);
  if (kind) return { kind, cell: i };
  const x = i % w;
  const y = (i - x) / w;
  for (let d = 0; d < 4; d++) {
    const nx = x + DX[d];
    const ny = y + DY[d];
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
    const n = ny * w + nx;
    const nKind = errorKind(grid, w, h, n);
    if (nKind) return { kind: nKind, cell: n };
  }
  return null;
}

/** Every single-cell contradiction firing in row-major order (red tried
 * first, as `solverTry` does). Leaves `grid` unchanged. */
function* directDeductions(
  grid: Uint8Array,
  w: number,
  h: number,
): Generator<ClustersDeduction> {
  const s = w * h;
  for (let i = 0; i < s; i++) {
    if (grid[i] !== 0) continue;
    for (let d = 0; d <= 1; d++) {
      const refuted: ClustersFill = d ? F_COLOR_1 : F_COLOR_0;
      grid[i] = refuted;
      const at = contradictionAround(grid, w, h, i);
      grid[i] = 0;
      if (at) {
        yield {
          index: i,
          fill: opposite(refuted),
          refuted,
          reason: { kind: "direct", at },
        };
        break;
      }
    }
  }
}

/** The cells a deduction's premise reads, which a hint plan continues from:
 * the cell, and the cell whose rule its trial broke or the two tiles whose
 * counts it reads, each with the cells beside it. */
function readsOf(d: ClustersDeduction, w: number, h: number): number[] {
  const around = (c: number): number[] => {
    const x = c % w;
    const y = (c - x) / w;
    return [
      c,
      ...(x > 0 ? [c - 1] : []),
      ...(x < w - 1 ? [c + 1] : []),
      ...(y > 0 ? [c - w] : []),
      ...(y < h - 1 ? [c + w] : []),
    ];
  };
  const { reason } = d;
  const read = reason.kind === "direct" ? [reason.at.cell] : [reason.a, reason.b];
  return [...around(d.index), ...read.flatMap(around)];
}

/** Run the deduction from the player's current grid, recording every forced
 * move in order with the rule its refuted coloring would break, or the counts
 * that settle it — the data a hint narrates. Single-cell firings lead; a
 * stall falls back to the two-tile count. Operates on a clone. */
export function deduceHintPlan(
  grid0: Uint8Array,
  w: number,
  h: number,
): ClustersHintPlan {
  // Hint-only path, so the budget is unconditional.
  const budget = stepBudget("clusters hint");
  const board = grid0.slice();
  let last: ClustersDeduction | null = null;
  const pass = singleFirings({
    techniques: findingTechniques<ClustersDeduction>(
      [
        { id: "direct", tier: 0, find: () => directDeductions(board, w, h) },
        { id: "count", tier: 1, find: () => countDeductions(board, w, h) },
      ],
      (d) => {
        board[d.index] = d.fill;
        last = d;
      },
      { reads: (d) => readsOf(d, w, h), writes: (d) => [d.index] },
    ),
    budget,
    // A plan works on the clusters beside its last fill before it moves on.
    continuing: true,
  });
  const { status, plan } = accumulateHintPlan<
    Uint8Array,
    ClustersDeduction,
    ClustersStatus
  >({
    board,
    status: (grid) => clustersStatus(grid, w, h),
    incomplete: UNFINISHED,
    next: () => (pass.next() ? last : null),
    budget,
  });
  return { verdict: status, deductions: plan };
}
