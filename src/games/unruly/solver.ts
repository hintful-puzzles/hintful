/**
 * Unruly solver: the ladder `unruly.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`), with the reason
 * each technique records for the hint; and the count/run validators the state
 * and renderer reuse, the validation half of `unruly.c`.
 *
 * The solver fills the view's own grid in place: it fills thousands of cells
 * per board during generation, where a clone per fill would be wasteful. The
 * `Game`'s `executeMove` stays pure.
 */
import type { DeductionRecord } from "../../engine/deduction-record.ts";
import { describedSpace } from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  describedLadder,
  type Ladder,
  ladderTechniques,
  ladderWalk,
  runLadder,
  type Taken,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { EMPTY, ONE, ZERO } from "./constants.ts";
import type { UnrulyMistake, UnrulyState } from "./state.ts";
import * as unruly from "./unruly.compiled.ts";

/** The minimal grid view the validators/solver operate on. `UnrulyState`
 * structurally satisfies it. */
export interface GridView {
  w2: number;
  h2: number;
  unique: boolean;
  grid: Uint8Array;
}

// --- hint recording (the explained-deduction path) ----------------------

/** Why a cell is forced — the premise the hint narrates and highlights. */
export type HintReason =
  // Two of three consecutive cells are `color`; a third would be three in
  // a row, so the empty one is the opposite. `refs` are the two filled cells.
  | { kind: "threes"; horizontal: boolean; refs: [number, number]; color: number }
  // A row/column already holds its full count of `full`, so every remaining
  // empty cell is `fill`. `line` is the row (horizontal) or column index.
  | { kind: "complete"; line: number; horizontal: boolean; fill: number; full: number }
  // Unique-rows: row/col `rowA` is full and `rowB` matches it everywhere it is
  // filled except here; making this cell `fill`'s opposite would duplicate it.
  | { kind: "unique"; rowA: number; rowB: number; horizontal: boolean; fill: number }
  // A row/column with one `full` cell left: it is pinned to the `window`
  // cells (anywhere else forces three `fill` in a row next to `anchor`), so
  // every other empty cell is `fill`. `anchor` is the abutting fill, or -1.
  | {
      kind: "nearcomplete";
      line: number;
      horizontal: boolean;
      fill: number;
      window: number[];
      anchor: number;
    };

/** One forced cell of a hint plan, in deduction order. `continuesPrevious`
 * marks the 2nd+ legs of a single firing (a whole-line fill) so the midend
 * presents them as one journey. */
export interface HintMove {
  index: number;
  value: number;
  reason: HintReason;
  continuesPrevious: boolean;
}

const otherColor = (c: number): number => (c === ONE ? ZERO : ONE);

// --- error-overlay flags (set by validateRows, read by render.ts) -------
export const FE_HOR_ROW_LEFT = 0x0001;
const FE_HOR_ROW_MID = 0x0003;
export const FE_HOR_ROW_RIGHT = 0x0002;
export const FE_VER_ROW_TOP = 0x0004;
const FE_VER_ROW_MID = 0x000c;
export const FE_VER_ROW_BOTTOM = 0x0008;
export const FE_ROW_MATCH = 0x0020;
export const FE_COL_MATCH = 0x0040;

// --- the described ladder -----------------------------------------------

/** A line as a reason names it: a row's index, or a column's. */
function lineOf(m: CellMarks, L: number): { line: number; horizontal: boolean } {
  return L < m.sp.h
    ? { line: L, horizontal: true }
    : { line: L - m.sp.h, horizontal: false };
}

/** The line `L` has all its `full`, so its empty squares take the other. */
function complete(m: CellMarks, L: number, full: number): HintReason {
  return { kind: "complete", ...lineOf(m, L), fill: otherColor(full), full };
}

/** The ladder, with the technique the unique-rows rule adds where it is on. */
function unrulyLadder(unique: boolean): Ladder {
  return describedLadder(
    unruly,
    {
      threes: uncluedRung(
        unruly.threes,
        ({ L, W, x, d }, _c, _n, m): HintReason => ({
          kind: "threes",
          horizontal: L < m.sp.h,
          refs: W.filter((c) => c !== x) as [number, number],
          color: d,
        }),
      ),
      lastGap: uncluedRung(unruly.lastGap, ({ L, d }, _c, _n, m) => complete(m, L, d)),
      quota: uncluedRung(unruly.quota, ({ L, d }, _c, _n, m) => complete(m, L, d)),
      unique: uncluedRung(
        unruly.unique,
        ({ A, B, d }, _c, _n, m): HintReason => ({
          kind: "unique",
          rowA: lineOf(m, A).line,
          rowB: lineOf(m, B).line,
          horizontal: A < m.sp.h,
          fill: otherColor(d),
        }),
      ),
      lastOne: uncluedRung(
        unruly.lastOne,
        ({ L, d, W }, _c, _n, m): HintReason => ({
          kind: "nearcomplete",
          ...lineOf(m, L),
          fill: otherColor(d),
          window: W.filter((c) => !m.known(c)),
          anchor: W.find((c) => m.known(c)) ?? -1,
        }),
      ),
    },
    undefined,
    unique ? ["unique"] : [],
  );
}

const LADDERS = { plain: unrulyLadder(false), unique: unrulyLadder(true) };

/** The view's pieces as the ladder reads them, on the view's own grid: each
 * empty square may hold either piece. */
function marksOf(view: GridView): CellMarks {
  const m = new CellMarks(
    describedSpace(unruly.units, view.w2, view.h2),
    (1 << ONE) | (1 << ZERO),
    view.grid,
  );
  m.seed(view.grid);
  return m;
}

// --- solve loop ----------------------------------------------------------

/**
 * Run the ladder to a fixpoint, capped at tier `diff`, filling `view.grid` in
 * place. Returns the highest tier whose technique fired, or `-1` if none
 * did.
 */
export function solveGame(view: GridView, diff: number): number {
  const m = marksOf(view);
  const grades = { [TIERS]: -1 };
  const { entries } = view.unique ? LADDERS.unique : LADDERS.plain;
  runLadder(m, ladderTechniques(m, entries, { [TIERS]: diff }, grades));
  return grades[TIERS];
}

/** Solve a copy of `grid` on `view`'s board, capped at tier `diff`, and return
 * the worked copy; the caller's grid is untouched. */
export function solveCopy(view: GridView, grid: Uint8Array, diff: number): GridView {
  const { w2, h2, unique } = view;
  const work: GridView = { w2, h2, unique, grid: Uint8Array.from(grid) };
  solveGame(work, diff);
  return work;
}

/** The cells of line `line`, a row or a column. */
function cellsOfLine(view: GridView, line: number, horizontal: boolean): number[] {
  const { w2, h2 } = view;
  return horizontal
    ? Array.from({ length: w2 }, (_, x) => line * w2 + x)
    : Array.from({ length: h2 }, (_, y) => y * w2 + line);
}

/**
 * Run the deduction from the player's current marks at full strength,
 * recording every forced cell in order — the explained-hint plan. Returns the
 * ordered forced moves; the first is the move to surface next.
 *
 * One firing at a time, each the one beside the plan's last where there is
 * one (`ladderWalk`): a player works the rows and columns through the cells
 * just filled.
 */
export function deduceHintPlan(state: UnrulyState): HintMove[] {
  const { w2, h2, unique } = state;
  const view: GridView = { w2, h2, unique, grid: Uint8Array.from(state.grid) };
  const m = marksOf(view);
  const plan: HintMove[] = [];
  let group = -1;
  m.recorder = (rec: DeductionRecord) => {
    if (rec.kind !== "place") return;
    plan.push({
      index: rec.y * w2 + rec.x,
      value: rec.n,
      reason: rec.reason as HintReason,
      continuesPrevious: rec.group === group,
    });
    group = rec.group;
  };
  m.budget = stepBudget("unruly hint");
  // The pair that forces a cell, the row or rows a count reads, and the cells
  // it fills.
  const reads = ({ facts, reasons }: Taken): number[] => {
    const own: number[] = [];
    for (let i = 0; i < facts.length; i += 3) own.push(facts[i + 1]);
    const reason = reasons[0] as HintReason;
    switch (reason.kind) {
      case "threes":
        return [...reason.refs, ...own];
      case "complete":
      case "nearcomplete":
        return [...cellsOfLine(view, reason.line, reason.horizontal), ...own];
      case "unique":
        return [
          ...cellsOfLine(view, reason.rowA, reason.horizontal),
          ...cellsOfLine(view, reason.rowB, reason.horizontal),
        ];
    }
  };
  const { entries } = unique ? LADDERS.unique : LADDERS.plain;
  const walk = ladderWalk(m, entries, { [TIERS]: Number.MAX_SAFE_INTEGER }, reads);
  for (let f = walk.next(); f !== null && f !== "contradiction"; f = walk.next());
  return plan;
}

// --- validators ----------------------------------------------------------

/** Per-row and per-column counts of each color. */
interface Counts {
  onesRows: Int32Array;
  onesCols: Int32Array;
  zerosRows: Int32Array;
  zerosCols: Int32Array;
}

function countsOf(view: GridView): Counts {
  const { w2, h2, grid } = view;
  const s: Counts = {
    onesRows: new Int32Array(h2),
    onesCols: new Int32Array(w2),
    zerosRows: new Int32Array(h2),
    zerosCols: new Int32Array(w2),
  };
  for (let y = 0; y < h2; y++) {
    for (let x = 0; x < w2; x++) {
      const v = grid[y * w2 + x];
      if (v === ONE) {
        s.onesRows[y]++;
        s.onesCols[x]++;
      } else if (v === ZERO) {
        s.zerosRows[y]++;
        s.zerosCols[x]++;
      }
    }
  }
  return s;
}

function validateRowsOriented(
  view: GridView,
  horizontal: boolean,
  check: number,
  errors: Int32Array | null,
): number {
  const { w2, h2, grid } = view;
  const dx = horizontal ? 1 : 0;
  const dy = 1 - dx;
  const err1 = horizontal ? FE_HOR_ROW_LEFT : FE_VER_ROW_TOP;
  const err2 = horizontal ? FE_HOR_ROW_MID : FE_VER_ROW_MID;
  const err3 = horizontal ? FE_HOR_ROW_RIGHT : FE_VER_ROW_BOTTOM;
  let ret = 0;
  for (let y = dy; y < h2 - dy; y++) {
    for (let x = dx; x < w2 - dx; x++) {
      const i1 = (y - dy) * w2 + (x - dx);
      const i2 = y * w2 + x;
      const i3 = (y + dy) * w2 + (x + dx);
      if (grid[i1] === check && grid[i2] === check && grid[i3] === check) {
        ret++;
        if (errors) {
          errors[i1] |= err1;
          errors[i2] |= err2;
          errors[i3] |= err3;
        }
      }
    }
  }
  return ret;
}

function validateUnique(
  view: GridView,
  horizontal: boolean,
  errors: Int32Array | null,
): number {
  const { w2, h2, grid } = view;
  const rmult = horizontal ? w2 : 1;
  const cmult = horizontal ? 1 : w2;
  const nr = horizontal ? h2 : w2;
  const nc = horizontal ? w2 : h2;
  const err = horizontal ? FE_ROW_MATCH : FE_COL_MATCH;
  let ret = 0;
  for (let r = 0; r < nr; r++) {
    let nfull = 0;
    for (let c = 0; c < nc; c++) if (grid[r * rmult + c * cmult] !== EMPTY) nfull++;
    if (nfull !== nc) continue;
    for (let r2 = r + 1; r2 < nr; r2++) {
      let match = true;
      for (let c = 0; c < nc; c++) {
        if (grid[r * rmult + c * cmult] !== grid[r2 * rmult + c * cmult]) {
          match = false;
          break;
        }
      }
      if (match) {
        if (errors) {
          for (let c = 0; c < nc; c++) {
            errors[r * rmult + c * cmult] |= err;
            errors[r2 * rmult + c * cmult] |= err;
          }
        }
        ret++;
      }
    }
  }
  return ret;
}

/** Mark every three-in-a-row run (and, in unique mode, every identical
 * full row/column pair) into `errors`. Returns `-1` if any error exists,
 * else `0`. */
export function validateRows(view: GridView, errors: Int32Array | null): number {
  let n = 0;
  n += validateRowsOriented(view, true, ONE, errors);
  n += validateRowsOriented(view, false, ONE, errors);
  n += validateRowsOriented(view, true, ZERO, errors);
  n += validateRowsOriented(view, false, ZERO, errors);
  if (view.unique) {
    n += validateUnique(view, true, errors);
    n += validateUnique(view, false, errors);
  }
  return n ? -1 : 0;
}

/** Count check: `-1` if any row/column exceeds its target (contradiction),
 * `+1` if any is still short (incomplete), `0` if every count is exact.
 * Optionally records per-row/column over-count flags into `errors`, laid
 * out as upstream: `[0,h2)` rows-ones, `[h2,2h2)` rows-zeros,
 * `[2h2,2h2+w2)` cols-ones, `[2h2+w2,2h2+2w2)` cols-zeros. */
export function validateCounts(view: GridView, errors: Uint8Array | null): number {
  const { w2, h2 } = view;
  const w = w2 / 2;
  const h = h2 / 2;
  const s = countsOf(view);
  let below = false;
  let above = false;

  for (let i = 0; i < w2; i++) {
    if (s.onesCols[i] < h || s.zerosCols[i] < h) below = true;
    if (s.onesCols[i] > h || s.zerosCols[i] > h) above = true;
    if (errors) {
      errors[2 * h2 + i] = s.onesCols[i] > h ? 1 : 0;
      errors[2 * h2 + w2 + i] = s.zerosCols[i] > h ? 1 : 0;
    }
  }
  for (let i = 0; i < h2; i++) {
    if (s.onesRows[i] < w || s.zerosRows[i] < w) below = true;
    if (s.onesRows[i] > w || s.zerosRows[i] > w) above = true;
    if (errors) {
      errors[i] = s.onesRows[i] > w ? 1 : 0;
      errors[h2 + i] = s.zerosRows[i] > w ? 1 : 0;
    }
  }

  return above ? -1 : below ? 1 : 0;
}

/** Is the grid finished: every count balanced and no rule broken? */
export function isComplete(view: GridView): boolean {
  return validateCounts(view, null) === 0 && validateRows(view, null) === 0;
}

/**
 * Mistake-check (Check & Save): re-solve from the **immutable clues alone**
 * to the unique solution, then flag every player-placed cell whose color
 * contradicts it. Returns `[]` when the clues don't deduce a complete
 * solution (a foreign / non-unique board — undecided, so nothing to flag),
 * matching Range/Mosaic. Pure (no state mutation).
 */
export function findMistakes(state: UnrulyState): UnrulyMistake[] {
  const { w2, grid, immutable } = state;
  const clues = grid.map((v, i) => (immutable[i] ? v : EMPTY));
  const solved = solveCopy(state, clues, Number.MAX_SAFE_INTEGER);
  if (!isComplete(solved)) return [];

  const mistakes: UnrulyMistake[] = [];
  for (let i = 0; i < grid.length; i++) {
    if (!immutable[i] && grid[i] !== EMPTY && grid[i] !== solved.grid[i]) {
      mistakes.push({ x: i % w2, y: Math.floor(i / w2) });
    }
  }
  return mistakes;
}

/** Run the full solver from a copy of `view`'s grid and return the solved
 * grid as a `'0'`/`'1'` string, or `null` if it doesn't reach a valid,
 * complete solution (Solve button). */
export function solveToString(view: GridView): string | null {
  const solved = solveCopy(view, view.grid, Number.MAX_SAFE_INTEGER);
  if (!isComplete(solved)) return null;
  let out = "";
  for (const v of solved.grid) out += v === ONE ? "1" : "0";
  return out;
}
