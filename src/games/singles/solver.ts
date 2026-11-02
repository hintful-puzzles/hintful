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
  ladderTechniques,
  ladderWalk,
  runLadder,
  type Taken,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Point } from "../../engine/types.ts";
import * as singles from "./singles.compiled.ts";
import { F_BLACK, F_CIRCLE, F_ERROR, type SinglesState } from "./state.ts";

/** Defined here, beside the solver, rather than in `state.ts`: imported from
 * there, generation and solving ran 1.2-1.4x slower under vitest (paired
 * timing, 2026-09-11). */
export function inGrid(s: SinglesState, x: number, y: number): boolean {
  return x >= 0 && x < s.w && y >= 0 && y < s.h;
}

/** What the description reads a square as holding. */
const COVERED = 1;
const CLEAR = 2;

/** The highest tier the ladder grades: Normal. */
const NORMAL = 1;

/**
 * Why a cell is forced — the premise a hint narrates and highlights, one
 * variant a reading of the ladder's techniques. The captured cells are the
 * deduction's evidence.
 */
export type SinglesReason =
  /** Two equal numbers one cell apart force the middle white. */
  | { kind: "sandwich"; ends: [Point, Point] }
  /** An adjacent equal pair blackens the other copies in its line. */
  | { kind: "pair"; pair: [Point, Point] }
  /** A 2×2 corner of four equal numbers blackens this diagonal. */
  | { kind: "corner4"; block: Point[] }
  /** Three equal numbers in a 2×2 corner blacken the apex. `corner` is the
   * board-corner cell that would be stranded; `matched` are the three cells
   * sharing the number. */
  | { kind: "corner3"; corner: Point; matched: Point[] }
  /** Two equal numbers in a 2×2 corner force the other neighbor white.
   * `corner` is the board-corner cell at risk of being sealed off; `pair`
   * are the two cells sharing the number. */
  | { kind: "corner2"; corner: Point; pair: [Point, Point] }
  /** An offset pair of equal numbers forces two whites. */
  | { kind: "offset"; quad: Point[] }
  /** A cell next to a black must be white. */
  | { kind: "adjBlack"; black: Point }
  /** A number sharing a line with a circle must be black. */
  | { kind: "sameLine"; circled: Point }
  /** A white cell with one non-black neighbor forces it white. */
  | { kind: "boxedIn"; cell: Point }
  /** A cell whose shading would split the white region must be white. */
  | { kind: "split"; neighbors: Point[] };

/** One forced cell recorded for a hint, in deduction order. `group` ties
 * together the cells forced by one firing. */
export interface HintRecord extends Point {
  value: "black" | "circle";
  reason: SinglesReason;
  group: number;
}

const pointOf = (sp: GridSpace, c: number): Point => ({
  x: c % sp.w,
  y: (c / sp.w) | 0,
});

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

/** The ladder over the dealt board, each technique with its reason: built
 * from the binding and the square decided, on the marks before the firing. */
function singlesLadder(dl: singles.Dealt, nums: Int8Array): Ladder {
  return describedLadder(singles, {
    besideCovered: uncluedRung(singles.besideCovered, ({ c }, _p, _to, m) => ({
      kind: "adjBlack",
      black: pointOf(m.sp, c),
    })),
    sameLine: compiledRung(singles.sameLine, dl, ({ c }, _p, _to, m) => ({
      kind: "sameLine",
      circled: pointOf(m.sp, c),
    })),
    sandwich: compiledRung(singles.sandwich, dl, ({ c, e }, _p, _to, m) => ({
      kind: "sandwich",
      ends: [pointOf(m.sp, c), pointOf(m.sp, e)],
    })),
    pair: compiledRung(singles.pair, dl, ({ c, q }, _p, _to, m) => ({
      kind: "pair",
      pair: [pointOf(m.sp, c), pointOf(m.sp, q)],
    })),
    corner: compiledRung(
      singles.corner,
      dl,
      ({ c, s, t, i, n, ns, nt, ni }, p, _to, m): SinglesReason => {
        const at = (x: number): Point => pointOf(m.sp, x);
        const corner = at(c);
        const apex = ns === n && nt === n;
        const across = ns === nt && ni === nt;
        if (apex && across) return { kind: "corner4", block: [c, s, t, i].map(at) };
        if (apex) return { kind: "corner3", corner, matched: [c, s, t].map(at) };
        if (across) return { kind: "corner3", corner, matched: [s, t, i].map(at) };
        // The pair beside the square beside the corner that is not decided.
        const side = p === t ? s : t;
        const pair: [Point, Point] =
          nums[c] === nums[side] ? [corner, at(side)] : [at(side), at(i)];
        return { kind: "corner2", corner, pair };
      },
    ),
    boxedIn: uncluedRung(singles.boxedIn, ({ c }, _p, _to, m) => ({
      kind: "boxedIn",
      cell: pointOf(m.sp, c),
    })),
    offset: compiledRung(singles.offset, dl, ({ a, b, a1, b1 }, _p, _to, m) => ({
      kind: "offset",
      quad: [a1, b1, a, b].map((x) => pointOf(m.sp, x)),
    })),
    split: uncluedRung(singles.split, (_b, p, _to, m) => ({
      kind: "split",
      neighbors: m.sp.adj4[p]
        .filter((q) => m.value(q) !== COVERED)
        .map((q) => pointOf(m.sp, q)),
    })),
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
function writeBack(state: SinglesState, grid: Uint8Array | Int8Array): void {
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
  return { m, ladder: singlesLadder(dl, state.nums), dl };
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

// --- the hint's walk ---------------------------------------------------------

/** Every cell a reason names. */
function pointsOf(w: number, reason: SinglesReason): number[] {
  const out: number[] = [];
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object" && "x" in v && "y" in v) {
      const p = v as Point;
      out.push(p.y * w + p.x);
    }
  };
  Object.values(reason).forEach(walk);
  return out;
}

/**
 * The ladder's firings from the player's current marks, each forced cell
 * recorded in order with the reason that forces it — the data a hint plan
 * narrates — at every tier, so a board the ladder finishes yields its whole
 * remaining solution.
 *
 * One firing at a time, each the one that carries on from the cells the
 * plan has just decided (`ladderWalk`): a player works outward from them.
 */
export function deduceHintPlan(state: SinglesState): HintRecord[] {
  const { m, ladder } = deduction(state);
  m.budget = stepBudget("singles hint");
  // The cells a firing's premise names, and its own.
  const reads = ({ facts, reasons }: Taken): number[] => [
    ...facts.filter((_, i) => i % 3 === 1),
    ...pointsOf(state.w, reasons[0] as SinglesReason),
  ];
  const walk = ladderWalk(m, ladder.entries, { [TIERS]: NORMAL }, reads);
  const records: HintRecord[] = [];
  for (let group = 0; ; group++) {
    const taken = walk.next();
    if (taken === null || taken === "contradiction") break;
    const { facts, reasons } = taken;
    for (let i = 0; i < facts.length; i += 3)
      records.push({
        ...pointOf(m.sp, facts[i + 1]),
        value: facts[i + 2] === COVERED ? "black" : "circle",
        reason: reasons[i / 3] as SinglesReason,
        group,
      });
  }
  return records;
}
