/**
 * Mathrax solver — the game-specific clue deduction plus a thin difficulty
 * driver over the shared generic `LatinSolver` (`engine/latin.ts`), exactly the
 * Latin-family shape (docs/games/solver-and-generator.md § "The Latin family").
 *
 * Everything Latin — positional/numeric elimination, set elimination, forcing
 * chains, and the guess-and-verify recursion that doubles as the uniqueness
 * check — comes from the framework. Mathrax adds a single user-solver body
 * (`applyOptions`) wired at three difficulty rungs: for every cell it intersects
 * the candidate set with {@link mathraxOptions} across the (up to four) clues at
 * its corners, and writes the eliminations back into the cube.
 *
 * The three rungs are the *same* body under two gates:
 * - **Easy** (`simple`) only reads an arithmetic clue when the cell across the
 *   intersection is already confirmed to a single digit;
 * - **Easy and Normal** only commit an elimination that immediately confirms a
 *   single digit;
 * - **Tricky** propagates fully.
 *
 * Byte-match surface: the generator is solver-gated, so this file's exact
 * deductive *strength* decides which puzzles exist (docs/games/solver-and-generator.md § "Solver-gated generation"). The
 * candidate masks therefore keep upstream's `BIT(d) = 1 << (d − 1)` convention
 * verbatim — do not "align" them with the player-facing pencil-mark encoding.
 */

import type {
  DeductionRecord,
  DeductionRecorder,
} from "../../engine/deduction-record.ts";
import {
  DIFF_AMBIGUOUS,
  DIFF_IMPOSSIBLE,
  DIFF_UNFINISHED,
  type LatinReason,
  type LatinSolver,
  latinSolver,
} from "../../engine/latin.ts";
import {
  bitOf,
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_RECURSIVE,
  DIFF_TRICKY,
  mathraxOptions,
} from "./state.ts";

/** Solver verdicts, upstream `mathrax_solve`'s return codes. */
export const SOLVE_IMPOSSIBLE = -1;
export const SOLVE_STUCK = 0;
export const SOLVE_UNIQUE = 1;
export const SOLVE_AMBIGUOUS = 2;

/**
 * Why a Mathrax-specific deduction ruled a candidate out — the premise the hint
 * narrates and highlights. Combined with {@link LatinReason} (the generic
 * positional/set/forcing deductions) it covers every technique the recording
 * solver fires. The `kind` fields never collide with the Latin reasons.
 *
 * There is **one** clue arm, not one per clue shape, because everything else a
 * sentence needs is derivable: the packed `clue` carries its operation and
 * number, the intersection `(cx, cy)` plus the acted-on cell give the cell
 * diagonally across it, and whether that cell shows a digit is a fact about the
 * *working board* the hint re-derives at narration time rather than a fact the
 * solver could record (docs/games/hints.md § "Re-derive a placement's why"
 * applies the same rule to a single).
 */
export type MathraxReason =
  /** The clue packed in `clue`, sitting at interior intersection `(cx, cy)`. */
  | { kind: "clue"; clue: number; cx: number; cy: number }
  /** A *hidden* single — number `n` fits only one cell of a row (`line: "row"`,
   * `index` = its y) or column (`line: "col"`, `index` = its x), the cell itself
   * still showing several candidates. Re-derived from the working board at
   * placement time (the recording solver conflates it with the naked single
   * under the generic `single`). */
  | { kind: "hiddenSingle"; n: number; line: "row" | "col"; index: number };

/** A reason attached to a recorded Mathrax deduction. */
export type HintReason = MathraxReason | LatinReason;

/** One recorded Mathrax deduction op (a {@link DeductionRecord} with a narrowed
 * reason). */
export interface HintOp extends DeductionRecord {
  reason: HintReason;
}

/** The per-solve context: the candidate cube mirrored in Mathrax's own `BIT(d)`
 * form, plus the clues. The mirror narrows as the solve runs, so each recursive
 * guess needs its own copy — unlike Keen/Towers, whose contexts are immutable. */
interface MathraxCtx {
  marks: Int32Array;
  clues: Int32Array;
}

/**
 * The four corners of a cell, as the step from the cell to the one diagonally
 * across each intersection, in upstream's order (bottom-right, top-right,
 * bottom-left, top-left).
 *
 * The clue itself sits at interior intersection `(cx, cy)` with
 * `cx = dx > 0 ? x : x − 1`, and a corner exists exactly when that intersection
 * is on the `(o−1) × (o−1)` clue grid — which is also exactly when the cell
 * `(x + dx, y + dy)` is on the board.
 */
const CORNERS: ReadonlyArray<{ dx: number; dy: number }> = [
  { dx: 1, dy: 1 },
  { dx: 1, dy: -1 },
  { dx: -1, dy: 1 },
  { dx: -1, dy: -1 },
];

/**
 * The one Mathrax deduction, at difficulty rung `diff` (upstream
 * `mathrax_solver_apply_options`). Returns the number of candidates eliminated,
 * or `−1` on a contradiction (a cell left with no candidate at all).
 *
 * **On the recording path it commits one clue's eliminations and returns**, so
 * each recorded firing (one `solver.group`) is one clue acting on one cell and a
 * hint step never narrates one clue while striking marks another ruled out. The
 * cell's own gate is unchanged — the commit still waits on the *intersection*
 * across every incident clue — so this is a finer attribution of the same
 * eliminations, not a different solver. Without a recorder the whole board is
 * swept in one call, as the C does.
 */
function applyOptions(solver: LatinSolver, ctx: MathraxCtx, diff: number): number {
  const o = solver.o;
  const co = o - 1;
  const simple = diff === DIFF_EASY;
  const marks = ctx.marks;
  const clues = ctx.clues;
  const rec = solver.recorder;

  // Pull the cube's eliminations into our own bitmap (it only ever loses bits).
  for (let y = 0; y < o; y++) {
    for (let x = 0; x < o; x++) {
      for (let d = 1; d <= o; d++) {
        if (!solver.cubeGet(x, y, d)) marks[y * o + x] &= ~bitOf(d);
      }
    }
  }

  let ret = 0;
  for (let y = 0; y < o; y++) {
    for (let x = 0; x < o; x++) {
      // Drop every candidate that no incident clue can pair with.
      let m = marks[y * o + x];
      for (const { dx, dy } of CORNERS) {
        const cx = dx > 0 ? x : x - 1;
        const cy = dy > 0 ? y : y - 1;
        if (cx < 0 || cy < 0 || cx >= co || cy >= co) continue;
        m &= mathraxOptions(clues[cy * co + cx], marks[(y + dy) * o + x + dx], simple);
      }

      if (!m) return -1;

      // Normal and below only act on a clue that immediately confirms a digit.
      if (diff <= DIFF_NORMAL && m & (m - 1)) continue;

      if (!rec) {
        for (let d = 1; d <= o; d++) {
          if (solver.cubeGet(x, y, d) && !(m & bitOf(d))) {
            solver.cube[solver.cubepos(x, y, d)] = 0;
            ret++;
          }
        }
        continue;
      }

      // Attribute the same eliminations to the clue that forces each. A
      // candidate outside `m` is outside some incident clue's options, so the
      // corner loop reaches every one of them.
      for (const { dx, dy } of CORNERS) {
        const cx = dx > 0 ? x : x - 1;
        const cy = dy > 0 ? y : y - 1;
        if (cx < 0 || cy < 0 || cx >= co || cy >= co) continue;
        const clue = clues[cy * co + cx];
        const opts = mathraxOptions(clue, marks[(y + dy) * o + x + dx], simple);
        let fired = 0;
        for (let d = 1; d <= o; d++) {
          if (solver.cubeGet(x, y, d) && !(opts & bitOf(d))) {
            rec({
              kind: "elim",
              x,
              y,
              n: d,
              reason: { kind: "clue", clue, cx, cy },
              group: solver.group,
            });
            solver.cube[solver.cubepos(x, y, d)] = 0;
            fired++;
          }
        }
        if (fired) return fired;
      }
    }
  }

  return ret;
}

const solverEasy = (s: LatinSolver, c: MathraxCtx): number =>
  applyOptions(s, c, DIFF_EASY);
const solverNormal = (s: LatinSolver, c: MathraxCtx): number =>
  applyOptions(s, c, DIFF_NORMAL);
const solverTricky = (s: LatinSolver, c: MathraxCtx): number =>
  applyOptions(s, c, DIFF_TRICKY);

/**
 * Solve `grid` (0 = blank, **written back in place** with the first solution
 * found, exactly as upstream) under `clues`, up to difficulty `maxdiff`.
 * Returns one of {@link SOLVE_IMPOSSIBLE} / {@link SOLVE_STUCK} /
 * {@link SOLVE_UNIQUE} / {@link SOLVE_AMBIGUOUS}.
 *
 * The write-back is load-bearing: the generator's two clue-stripping loops keep
 * their own backup of the puzzle and restore it after each trial solve.
 *
 * `recorder` is the hint path's only extra: see {@link recordMathraxDeductions}.
 */
export function mathraxSolve(
  o: number,
  grid: Uint8Array,
  clues: Int32Array,
  maxdiff: number,
  recorder?: DeductionRecorder,
): number {
  const maxbits = (1 << o) - 1;
  const marks = new Int32Array(o * o);
  for (let i = 0; i < o * o; i++) marks[i] = grid[i] ? bitOf(grid[i]) : maxbits;

  const diff = latinSolver<MathraxCtx>(grid, o, {
    maxdiff,
    diffSimple: DIFF_EASY,
    diffSet0: DIFF_NORMAL,
    diffSet1: DIFF_TRICKY,
    diffForcing: DIFF_TRICKY,
    diffRecursive: DIFF_RECURSIVE,
    usersolvers: [solverEasy, solverNormal, solverTricky, null, null],
    // Upstream `mathrax_valid` is a constant `true` — Latin uniqueness plus the
    // clue eliminations are the whole rule set — so the generic post-check is
    // simply skipped.
    valid: null,
    ctx: { marks, clues },
    // Upstream `clone_ctx`; the clues never change and stay shared.
    ctxNew: (c) => ({ marks: c.marks.slice(), clues: c.clues }),
    recorder,
    budgetLabel: "mathrax hint",
  });

  if (diff === DIFF_IMPOSSIBLE) return SOLVE_IMPOSSIBLE;
  if (diff === DIFF_UNFINISHED) return SOLVE_STUCK;
  if (diff === DIFF_AMBIGUOUS) return SOLVE_AMBIGUOUS;
  return SOLVE_UNIQUE;
}

/**
 * Run the recording solver on a sound candidate cube seeded from `grid` (the
 * placed givens/entries only — never the player's notes), up to `maxdiff`, and
 * return every candidate elimination and cell placement it makes, in solver
 * order, each tagged with the rule + premise that forced it. This is the raw
 * deduction script a hint narrates. `grid` is treated read-only (a working copy
 * is solved internally).
 */
export function recordMathraxDeductions(
  o: number,
  clues: Int32Array,
  grid: Uint8Array,
  maxdiff: number,
): HintOp[] {
  const ops: HintOp[] = [];
  mathraxSolve(o, grid.slice(), clues, maxdiff, (r) => ops.push(r as HintOp));
  return ops;
}
