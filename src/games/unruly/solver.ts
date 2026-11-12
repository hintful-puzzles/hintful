/**
 * Unruly solver: the ladder `unruly.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`), with the reason
 * each technique records for the hint; the answer check its rules compile to,
 * which the state reads; and the error overlay the renderer reads.
 *
 * The solver fills the view's own grid in place: it fills thousands of cells
 * per board during generation, where a clone per fill would be wasteful. The
 * `Game`'s `executeMove` stays pure.
 */
import { describedSpace } from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
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

// --- error-overlay flags (set by markRows, read by render.ts) -------
export const FE_HOR_ROW_LEFT = 0x0001;
const FE_HOR_ROW_MID = 0x0003;
export const FE_HOR_ROW_RIGHT = 0x0002;
export const FE_VER_ROW_TOP = 0x0004;
const FE_VER_ROW_MID = 0x000c;
export const FE_VER_ROW_BOTTOM = 0x0008;
export const FE_ROW_MATCH = 0x0020;
export const FE_COL_MATCH = 0x0040;

// --- the described ladder -----------------------------------------------

/** The ladder, with the technique the unique-rows rule adds where it is on. */
function unrulyLadder(unique: boolean): Ladder {
  return describedLadder(
    unruly,
    {
      threes: uncluedRung(unruly.threes),
      lastGap: uncluedRung(unruly.lastGap),
      quota: uncluedRung(unruly.quota),
      unique: uncluedRung(unruly.unique),
      lastOne: uncluedRung(unruly.lastOne),
    },
    undefined,
    unique ? ["unique"] : [],
  );
}

export const LADDERS = { plain: unrulyLadder(false), unique: unrulyLadder(true) };

/** The view's pieces as the ladder reads them, on the view's own grid: each
 * empty square may hold either piece. */
export function marksOf(view: GridView): CellMarks {
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

// --- the error overlay and the answer check ---------------------------------
//
// The overlay marks what is wrong on a board still being filled, which no
// rule of the answer says, and draws a row's count as its own mark; the
// answer check is the description's rules, compiled.

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

function markRowsOriented(
  view: GridView,
  horizontal: boolean,
  check: number,
  errors: Int32Array,
): void {
  const { w2, h2, grid } = view;
  const dx = horizontal ? 1 : 0;
  const dy = 1 - dx;
  const err1 = horizontal ? FE_HOR_ROW_LEFT : FE_VER_ROW_TOP;
  const err2 = horizontal ? FE_HOR_ROW_MID : FE_VER_ROW_MID;
  const err3 = horizontal ? FE_HOR_ROW_RIGHT : FE_VER_ROW_BOTTOM;
  for (let y = dy; y < h2 - dy; y++) {
    for (let x = dx; x < w2 - dx; x++) {
      const i1 = (y - dy) * w2 + (x - dx);
      const i2 = y * w2 + x;
      const i3 = (y + dy) * w2 + (x + dx);
      if (grid[i1] === check && grid[i2] === check && grid[i3] === check) {
        errors[i1] |= err1;
        errors[i2] |= err2;
        errors[i3] |= err3;
      }
    }
  }
}

function markUnique(view: GridView, horizontal: boolean, errors: Int32Array): void {
  const { w2, h2, grid } = view;
  const rmult = horizontal ? w2 : 1;
  const cmult = horizontal ? 1 : w2;
  const nr = horizontal ? h2 : w2;
  const nc = horizontal ? w2 : h2;
  const err = horizontal ? FE_ROW_MATCH : FE_COL_MATCH;
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
        for (let c = 0; c < nc; c++) {
          errors[r * rmult + c * cmult] |= err;
          errors[r2 * rmult + c * cmult] |= err;
        }
      }
    }
  }
}

/** Mark every three-in-a-row run (and, in unique mode, every identical
 * full row/column pair) into `errors`. */
export function markRows(view: GridView, errors: Int32Array): void {
  markRowsOriented(view, true, ONE, errors);
  markRowsOriented(view, false, ONE, errors);
  markRowsOriented(view, true, ZERO, errors);
  markRowsOriented(view, false, ZERO, errors);
  if (view.unique) {
    markUnique(view, true, errors);
    markUnique(view, false, errors);
  }
}

/** Mark each row and column holding more of a piece than its half into
 * `errors`, laid out as upstream: `[0,h2)` rows-ones, `[h2,2h2)` rows-zeros,
 * `[2h2,2h2+w2)` cols-ones, `[2h2+w2,2h2+2w2)` cols-zeros. */
export function markCounts(view: GridView, errors: Uint8Array): void {
  const { w2, h2 } = view;
  const w = w2 / 2;
  const h = h2 / 2;
  const s = countsOf(view);
  for (let i = 0; i < w2; i++) {
    errors[2 * h2 + i] = s.onesCols[i] > h ? 1 : 0;
    errors[2 * h2 + w2 + i] = s.zerosCols[i] > h ? 1 : 0;
  }
  for (let i = 0; i < h2; i++) {
    errors[i] = s.onesRows[i] > w ? 1 : 0;
    errors[h2 + i] = s.zerosRows[i] > w ? 1 : 0;
  }
}

/** Whether the grid is an answer, by the rules its description compiles to. */
export function isComplete(view: GridView): boolean {
  return unruly.isAnswer(
    view.grid,
    describedSpace(unruly.units, view.w2, view.h2),
    view.unique ? ["unique"] : [],
  );
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
