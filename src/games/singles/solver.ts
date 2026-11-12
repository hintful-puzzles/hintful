/**
 * Singles' solver: the ladder `singles.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), and the
 * answer check its rules compile to.
 *
 * Easy is upstream's readings of the numbers (a sandwich, a touching pair,
 * a crowded corner) with what a covered or a clear square forces around it,
 * and a square with one way out. Normal adds the offset pairs and the
 * squares the uncovered ones would fall apart without.
 */

import {
  clueList,
  describedSpace,
  type GridSpace,
} from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  type LadderEntry,
  ladderTechniques,
  runLadder,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import * as singles from "./singles.compiled.ts";
import { F_BLACK, F_CIRCLE, F_ERROR, type SinglesState } from "./state.ts";

/** Defined here, beside the solver, rather than in `state.ts`: imported from
 * there, generation and solving ran 1.2-1.4x slower under vitest (paired
 * timing, 2026-09-11). */
export function inGrid(s: SinglesState, x: number, y: number): boolean {
  return x >= 0 && x < s.w && y >= 0 && y < s.h;
}

/** What the description reads a square as holding. */
export const COVERED = 1;
export const CLEAR = 2;

/** The highest tier the ladder grades: Normal. */
const NORMAL = 1;

/** The last board size's space, which every move's `status` reads again. */
let lastSpace: GridSpace | null = null;
function spaceOf(w: number, h: number): GridSpace {
  if (lastSpace?.w !== w || lastSpace.h !== h)
    lastSpace = describedSpace(singles.units, w, h);
  return lastSpace;
}

/** The board as the description deals it: every square's number. */
function dealtOf({ n, nums }: SinglesState): singles.Dealt {
  const at = Array.from({ length: n }, (_, c) => c);
  return { number: clueList(at, Array.from(nums), n) };
}

/** The ladder over the dealt board. A technique that says builds its own steps
 * (`singles.description.yaml`'s `says`), so no rung builds a reason. */
function singlesLadder(dl: singles.Dealt): Ladder {
  return describedLadder(singles, {
    besideCovered: uncluedRung(singles.besideCovered),
    sameLine: compiledRung(singles.sameLine, dl),
    sandwich: compiledRung(singles.sandwich, dl),
    pair: compiledRung(singles.pair, dl),
    corner: compiledRung(singles.corner, dl),
    boxedIn: compiledRung(singles.boxedIn, dl),
    offset: compiledRung(singles.offset, dl),
    split: compiledRung(singles.split, dl),
  });
}

/** The values the description reads off a state's marks: covered, clear, or
 * neither. */
function valuesOf(state: SinglesState): Uint8Array {
  return Uint8Array.from(state.flags, (f) =>
    f & F_BLACK ? COVERED : f & F_CIRCLE ? CLEAR : 0,
  );
}

/** Write the marks' values back into a state's flags. */
function writeBack(state: SinglesState, grid: ArrayLike<number>): void {
  for (let c = 0; c < state.n; c++) {
    state.flags[c] &= ~(F_BLACK | F_CIRCLE);
    if (grid[c] === COVERED) state.flags[c] |= F_BLACK;
    else if (grid[c] === CLEAR) state.flags[c] |= F_CIRCLE;
  }
}

/** The ladder and the marks over a state's numbers and marks. */
function deduction(state: SinglesState): {
  m: CellMarks;
  ladder: Ladder;
  dl: singles.Dealt;
} {
  const dl = dealtOf(state);
  const m = new CellMarks(
    spaceOf(state.w, state.h),
    (1 << COVERED) | (1 << CLEAR),
    valuesOf(state),
  );
  m.seed(m.grid);
  return { m, ladder: singlesLadder(dl), dl };
}

/** What a hint walks: the marks over a state's numbers and marks, and the
 * ladder's techniques. */
export function hintWalk(state: SinglesState): {
  marks: CellMarks;
  entries: readonly LadderEntry[];
} {
  const { m, ladder } = deduction(state);
  return { marks: m, entries: ladder.entries };
}

/**
 * Solve `state` from its marks, no harder than tier `cap`, writing what the
 * ladder decides into its flags. Returns -1 where the marks break the rules,
 * 0 where the ladder stops short, and 1 where it finishes the board.
 */
export function solveSpecific(state: SinglesState, cap: number): number {
  const { m, ladder, dl } = deduction(state);
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: cap }, {});
  const broken = runLadder(m, techniques);
  writeBack(state, m.grid);
  if (broken) return -1;
  if (m.grid.includes(0)) return 0;
  return singles.isAnswer(m.grid, m.sp, dl) ? 1 : -1;
}

/**
 * The generator's: cover each square of `order` still open, in turn, and run
 * the ladder after each, so the clear squares stay joined and no two covered
 * squares touch. The numbers are a Latin square's, so only the techniques
 * that read no number fire. Writes the result into `state`'s flags, and
 * returns false where a covering leaves the marks broken.
 */
export function layCovered(state: SinglesState, order: readonly number[]): boolean {
  const { m, ladder } = deduction(state);
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: NORMAL }, {});
  for (const c of order) {
    if (m.known(c)) continue;
    m.place(c, COVERED);
    if (runLadder(m, techniques)) return false;
  }
  writeBack(state, m.grid);
  return true;
}

/** Solved when the board breaks no rule, an unmarked cell counting as clear
 * (as upstream completes it). */
export function status(s: SinglesState): "solved" | "ongoing" {
  const g = Uint8Array.from(s.flags, (f) => (f & F_BLACK ? COVERED : CLEAR));
  return singles.isAnswer(g, spaceOf(s.w, s.h), dealtOf(s)) ? "solved" : "ongoing";
}

// --- the error overlay ------------------------------------------------------
//
// The overlay marks what is wrong on a board still being filled, which no
// rule of the answer says: two circled copies of a number in a line, covered
// squares side by side, and the clear squares outside the largest group.

/** Mark the errors of a board still being filled in its flags. */
export function markErrors(s: SinglesState): void {
  const { w, h, n } = s;
  for (let i = 0; i < n; i++) s.flags[i] &= ~F_ERROR;
  const black = (i: number): boolean => (s.flags[i] & F_BLACK) !== 0;

  // Covered squares side by side.
  for (let i = 0; i < n; i++) {
    if (!black(i)) continue;
    const right = i % w < w - 1 ? i + 1 : -1;
    const down = i + w < n ? i + w : -1;
    for (const p of [right, down])
      if (p >= 0 && black(p)) {
        s.flags[i] |= F_ERROR;
        s.flags[p] |= F_ERROR;
      }
  }

  // Two circled copies of a number in a row or a column.
  const line = (start: number, step: number, size: number): void => {
    for (let a = 0, i = start; a < size; a++, i += step)
      for (let b = a + 1, j = i + step; b < size; b++, j += step)
        if (s.nums[i] === s.nums[j] && s.flags[i] & F_CIRCLE && s.flags[j] & F_CIRCLE) {
          s.flags[i] |= F_ERROR;
          s.flags[j] |= F_ERROR;
        }
  };
  for (let x = 0; x < w; x++) line(x, w, h);
  for (let y = 0; y < h; y++) line(y * w, 1, w);

  // The squares not covered outside the largest group of them.
  const group = new Int32Array(n).fill(-1);
  const size: number[] = [];
  for (let i = 0; i < n; i++) {
    if (black(i) || group[i] >= 0) continue;
    const g = size.length;
    const queue = [i];
    group[i] = g;
    for (let k = 0; k < queue.length; k++) {
      const c = queue[k];
      const cx = c % w;
      for (const p of [c - w, c + w, cx > 0 ? c - 1 : -1, cx < w - 1 ? c + 1 : -1])
        if (p >= 0 && p < n && !black(p) && group[p] < 0) {
          group[p] = g;
          queue.push(p);
        }
    }
    size.push(queue.length);
  }
  const largest = size.indexOf(Math.max(...size));
  for (let i = 0; i < n; i++)
    if (!black(i) && group[i] !== largest) s.flags[i] |= F_ERROR;
}
