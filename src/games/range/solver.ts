/**
 * Range's solver: the ladder `range.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`), the answer check
 * its rules compile to, the search beneath the ladder, and the generator, a
 * port of `range.c`'s `new_game_desc`.
 *
 * The ladder is Easy: a shaded square's neighbors are clear, a number's view
 * capped where it can run no further, a number's view made to reach its
 * count, and a square that would cut the clear squares in two kept clear.
 * Beneath it, a search by trial and error ({@link searchAnswers}) counts a
 * board's answers to two. It serves the Solve command and `findMistakes`, and
 * deals the Unreasonable tier. An Easy board is kept only where the ladder
 * finishes it, as upstream's three rules did. The view's bound is tighter
 * than upstream's (the description's `far` reads every gap, where upstream's
 * `solver_reasoning_not_too_big` read the first), so the ladder finishes
 * every board upstream's do and some they do not.
 *
 * A hint walks the same ladder, one firing at a time, and says each square
 * a firing decides as a step of its own.
 *
 * The live error overlay ({@link findErrors}) stays the game's own: it judges
 * a board still being filled, which no rule of the answer says.
 */

import {
  type Answer,
  answerCache,
  type Deduced,
  DIFF_EASY,
  dealUnreasonable,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
} from "../../engine/describe-runtime.ts";
import { Dsf } from "../../engine/dsf.ts";
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
import type { RandomState } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import * as range from "./range.compiled.ts";
import {
  BLACK,
  type Cell,
  EMPTY,
  idx,
  outOfBounds,
  type RangeParams,
  type RangeState,
  WHITE,
} from "./state.ts";

/** The four orthogonal steps, as row and column deltas. Defined here, not in
 * `state.ts`: the hot loops read them, and under vitest an imported binding
 * compiles to a getter call per access, which measures **1.62–1.73× on this
 * generator** against an A/A control of 0.98–1.01 (re-measured 2026-09-12 with
 * both arms in one process, rotated and interleaved).
 *
 * **This buys nothing for a player** — `vite build` flattens the two modules
 * into one scope and the read becomes a direct `var` access. Keeping them local
 * is worth it only because it keeps the *suite* fast; do not read it as a rule
 * against shared constants. `docs/testing.md` § "Timing anything under
 * vitest". */
export const DR = [1, 0, -1, 0];
export const DC = [0, 1, 0, -1];

/** What the description reads a square as holding. */
const SHADED = 1;
const CLEAR = 2;

/** Why a cell is forced — the premise the hint narrates and highlights. */
export type HintReason =
  | { kind: "adjacency"; from: Cell } // a neighbor of this black must be white
  | { kind: "satisfied"; clue: Cell; n: number } // clue's run is full → cap it black
  | { kind: "overrun"; clue: Cell; n: number } // white here would exceed the clue
  | { kind: "reach"; clue: Cell; n: number } // clue can only reach its count this way
  | { kind: "connect" }; // black here would disconnect the white region

export interface HintMove {
  r: number;
  c: number;
  value: number;
  reason: HintReason;
  /** The solver's working grid at the moment this move fired (this move
   * and every prior deduction applied) — the board state the hint's area
   * highlight is computed against, so the shaded run reflects what the
   * player sees as they follow the plan. */
  grid: Int8Array;
}

// --- the board as the description reads it -----------------------------------

/** The last board size's space, which every move's `status` reads again. */
let lastSpace: GridSpace | null = null;
function spaceOf(w: number, h: number): GridSpace {
  if (lastSpace?.w !== w || lastSpace.h !== h)
    lastSpace = describedSpace(range.units, w, h);
  return lastSpace;
}

/** The board as the description deals it: the numbers. */
function dealtOf(grid: Int8Array): range.Dealt {
  const at: number[] = [];
  const v: number[] = [];
  grid.forEach((n, c) => {
    if (n > 0) {
      at.push(c);
      v.push(n);
    }
  });
  return { number: clueList(at, v, grid.length) };
}

/** The value the description reads in each square of a grid: a numbered
 * square is clear, and an undecided one holds none. */
function valuesOf(grid: Int8Array): Uint8Array {
  return Uint8Array.from(grid, (v) =>
    v > 0 || v === WHITE ? CLEAR : v === BLACK ? SHADED : 0,
  );
}

/** Write what the marks decided into a grid's undecided squares. */
function writeBack(grid: Int8Array, values: Uint8Array | Int8Array): void {
  for (let c = 0; c < grid.length; c++)
    if (grid[c] === EMPTY && values[c] !== 0)
      grid[c] = values[c] === SHADED ? BLACK : WHITE;
}

const at = (sp: GridSpace, c: number): Cell => ({ r: (c / sp.w) | 0, c: c % sp.w });

/** The ladder over the dealt board, each technique with its reason: built
 * from the binding, on the marks before the firing. */
function rangeLadder(dl: range.Dealt): Ladder {
  return describedLadder(range, {
    besideShaded: uncluedRung(range.besideShaded, ({ c }, _p, _to, m) => ({
      kind: "adjacency",
      from: at(m.sp, c),
    })),
    capped: compiledRung(range.capped, dl, ({ k, n, W }, _p, _to, m) => ({
      kind: W === n ? "satisfied" : "overrun",
      clue: at(m.sp, k),
      n,
    })),
    reach: compiledRung(range.reach, dl, ({ k, n }, _p, _to, m) => ({
      kind: "reach",
      clue: at(m.sp, k),
      n,
    })),
    cut: uncluedRung(range.cut, () => ({ kind: "connect" })),
  });
}

/** The marks over a grid and the ladder over its numbers, or `null` where
 * the grid holds a value a square cannot. */
function deduction(
  grid: Int8Array,
  w: number,
  h: number,
): { m: CellMarks; ladder: Ladder; dl: range.Dealt } | null {
  const sp = spaceOf(w, h);
  const dl = dealtOf(grid);
  const m = new CellMarks(sp, (1 << SHADED) | (1 << CLEAR), valuesOf(grid));
  if (!m.seed(m.grid, (c) => range.domainOf(sp, dl, c))) return null;
  return { m, ladder: rangeLadder(dl), dl };
}

/** Run the ladder on `m` to a fixpoint and say what it reached. */
function deduce(m: CellMarks, ladder: Ladder, dl: range.Dealt): Deduced {
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: 0 }, {});
  if (runLadder(m, techniques)) return "contradiction";
  if (m.grid.includes(0)) return "stuck";
  return range.isAnswer(m.grid, m.sp, dl) ? "solved" : "contradiction";
}

/** Run the ladder on `grid` in place, filling what it decides; returns the
 * number of cells it filled. */
export function applyRules(grid: Int8Array, w: number, h: number): number {
  const d = deduction(grid, w, h);
  if (d === null) return 0;
  deduce(d.m, d.ladder, d.dl);
  const before = grid.filter((v) => v === EMPTY).length;
  writeBack(grid, d.m.grid);
  return before - grid.filter((v) => v === EMPTY).length;
}

/** Whether the ladder alone decides every cell of a clue grid and breaks no
 * rule doing it: the test `stripClues` keeps a clue's removal by, and the
 * walk a hint plan narrates. */
export function deductionFinishes(grid: Int8Array, w: number, h: number): boolean {
  const d = deduction(grid, w, h);
  return d !== null && deduce(d.m, d.ladder, d.dl) === "solved";
}

/** Whether a grid is solved: it breaks no rule, an undecided cell counting
 * as clear. */
export function isSolved(grid: Int8Array, w: number, h: number): boolean {
  const g = Uint8Array.from(grid, (v) => (v === BLACK ? SHADED : CLEAR));
  return range.isAnswer(g, spaceOf(w, h), dealtOf(grid));
}

// --- the hint's walk ---------------------------------------------------------

/** The cells a firing's premise reads, besides those it decides: its number
 * or the shaded square beside it. */
function readsOf(reason: HintReason): Cell[] {
  if ("clue" in reason) return [reason.clue];
  if ("from" in reason) return [reason.from];
  return [];
}

/**
 * The ladder's firings from `grid` (the player's current marks), every
 * forced cell recorded in order with the reason that forces it — the data a
 * hint plan narrates — each with the grid as it stands once that cell is
 * made.
 *
 * One firing at a time, each the one that carries on from the cells the plan
 * has just decided (`ladderWalk`), so a plan finishes the clue it is working
 * on before it moves on.
 */
export function deduceHintPlan(grid: Int8Array, w: number, h: number): HintMove[] {
  const d = deduction(grid, w, h);
  if (d === null) return [];
  const { m, ladder } = d;
  m.budget = stepBudget("range hint");
  const walk = ladderWalk(
    m,
    ladder.entries,
    { [TIERS]: 0 },
    ({ facts, reasons }: Taken) => [
      ...facts.filter((_, i) => i % 3 === 1),
      ...(reasons as HintReason[]).flatMap(readsOf).map((p) => idx(p.r, p.c, w)),
    ],
  );
  const plan: HintMove[] = [];
  const now = grid.slice();
  for (;;) {
    const taken = walk.next();
    if (taken === null || taken === "contradiction") break;
    const { facts, reasons } = taken;
    for (let i = 0; i < facts.length; i += 3) {
      const cell = facts[i + 1];
      const value = facts[i + 2] === SHADED ? BLACK : WHITE;
      now[cell] = value;
      plan.push({
        ...at(m.sp, cell),
        value,
        reason: reasons[i / 3] as HintReason,
        grid: now.slice(),
      });
    }
  }
  return plan;
}

// --- the live error overlay --------------------------------------------------

// Cell-state bit masks: BLACK/WHITE/EMPTY (−2/−1/0) map to bits 0/1/2
// via `1 << (v + 2)`. `HIGH` is every bit above bit 2 — a clue cell
// (grid > 0) is counted by a run iff the mask carries some high bit
// (i.e. the run was built to include "positive" values).
const MASK_BLACK = 1; // 1 << (BLACK + 2)
const MASK_EMPTY = 4; // 1 << (EMPTY + 2)
const HIGH = ~(MASK_BLACK | (1 << (WHITE + 2)) | MASK_EMPTY); // ~7
/** The cells known to be white: a white mark, or a clue. */
const MASK_KNOWN_WHITE = ~(MASK_BLACK | MASK_EMPTY);

/** Length of the run of cells from (r,c) along (dr,dc) whose state
 * matches `mask`; a clue cell matches iff `mask` carries a high bit. */
function runLength(
  grid: Int8Array,
  w: number,
  h: number,
  r: number,
  c: number,
  dr: number,
  dc: number,
  mask: number,
): number {
  let sz = 0;
  while (!outOfBounds(r, c, w, h)) {
    const v = grid[idx(r, c, w)];
    if (v > 0) {
      if (!(mask & HIGH)) break;
    } else if (!((1 << (v + 2)) & mask)) {
      break;
    }
    sz++;
    r += dr;
    c += dc;
  }
  return sz;
}

/** How many cells a clue at (r, c) sees: itself plus, in each direction, the
 * run matching `mask`. */
function seenFrom(
  grid: Int8Array,
  w: number,
  h: number,
  r: number,
  c: number,
  mask: number,
): number {
  let seen = 1;
  for (let j = 0; j < 4; j++) {
    seen += runLength(grid, w, h, r + DR[j], c + DC[j], DR[j], DC[j], mask);
  }
  return seen;
}

/**
 * Flag in `report` each cell of a board still being filled that breaks a
 * rule: a shaded square beside another, a clue that falls short even with
 * every undecided cell clear or already sees too many with only the known
 * clear ones, and the clear cells outside the largest group of them. Port of
 * `find_errors`.
 */
export function findErrors(
  grid: Int8Array,
  w: number,
  h: number,
  report: boolean[],
): void {
  const n = w * h;
  const dsf = new Dsf(n);
  let nblack = 0;
  let anyWhite = -1;

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const i = idx(r, c, w);
      const v = grid[i];
      if (v === BLACK) {
        nblack++;
        for (let j = 0; j < 4; j++) {
          const rr = r + DR[j];
          const cc = c + DC[j];
          if (outOfBounds(rr, cc, w, h)) continue;
          if (grid[idx(rr, cc, w)] !== BLACK) continue;
          report[i] = true;
          break;
        }
        continue;
      }
      if (
        v > 0 &&
        (seenFrom(grid, w, h, r, c, ~MASK_BLACK) < v ||
          seenFrom(grid, w, h, r, c, MASK_KNOWN_WHITE) > v)
      )
        report[i] = true;
      anyWhite = i;
      if (r + 1 < h && grid[i + w] !== BLACK) dsf.merge(i, i + w);
      if (c + 1 < w && grid[i + 1] !== BLACK) dsf.merge(i, i + 1);
    }
  }

  if (anyWhite === -1 || nblack + dsf.size(anyWhite) >= n) return;
  // Pick the largest component as canonical; flag every cell outside it.
  let canonical = -1;
  let biggest = 0;
  for (let i = 0; i < n; i++) {
    if (grid[i] !== BLACK) {
      const size = dsf.size(i);
      if (size > biggest) {
        biggest = size;
        canonical = dsf.canonify(i);
      }
    }
  }
  for (let i = 0; i < n; i++) {
    if (grid[i] !== BLACK && dsf.canonify(i) !== canonical) report[i] = true;
  }
}

// --- the answer (Solve command + findMistakes + the Unreasonable tier) -----

/** A board's one answer: its grid with every non-clue cell BLACK or WHITE. */
export type RangeAnswer = Answer<Int8Array>;

/**
 * The positions the search may try before it gives up, which decides which
 * Unreasonable boards exist ({@link AnswerSearch.budget}): lowering it
 * refuses boards in saved games.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a clue grid's answers up to two, by trial and error over the ladder:
 * where it stops, take the first undecided cell and assume it shaded, and
 * then clear. A position no answer fits is one a technique finds
 * inconsistent, or a full one the answer check refuses.
 */
export function searchAnswers(
  clueGrid: Int8Array,
  w: number,
  h: number,
  budget: number = SEARCH_BUDGET,
): RangeAnswer {
  const d = deduction(clueGrid, w, h);
  if (d === null) return { kind: "none" };
  const { ladder, dl } = d;
  return searchBoard<CellMarks, Int8Array>({
    start: d.m,
    deduce: (m) => deduce(m, ladder, dl),
    assume(m) {
      const cell = m.grid.indexOf(0);
      if (cell < 0) return [];
      return [SHADED, CLEAR].map((value) => {
        const sub = new CellMarks(m.sp, m.domain, m.grid.slice());
        sub.cands.set(m.cands);
        sub.place(cell, value);
        return sub;
      });
    },
    solution: (m) => {
      const solved = clueGrid.slice();
      writeBack(solved, m.grid);
      return solved;
    },
    budget,
  });
}

/** Keyed on a state's clues, which every state of one game shares. */
const answers = answerCache<Int8Array, Int8Array>();

/** What a search of a state's clues established about their answers. The
 * player's marks are not read. */
export function answerOf(state: RangeState): RangeAnswer {
  return answers(state.clues, () => searchAnswers(state.clues, state.w, state.h));
}

// --- generation ------------------------------------------------------------

/** Flood-count the white-connected region reaching `cell`, restoring the
 * grid afterwards. Port of `dfs_count_white`. */
function floodCountWhite(grid: Int8Array, w: number, h: number, cell: number): number {
  const stack = [cell];
  const visited: number[] = [];
  for (let i = stack.pop(); i !== undefined; i = stack.pop()) {
    if (grid[i] !== WHITE) continue;
    grid[i] = EMPTY; // temporary visited marker
    visited.push(i);
    const r = Math.floor(i / w);
    const c = i % w;
    for (let j = 0; j < 4; j++) {
      const rr = r + DR[j];
      const cc = c + DC[j];
      if (!outOfBounds(rr, cc, w, h)) stack.push(idx(rr, cc, w));
    }
  }
  for (const i of visited) grid[i] = WHITE;
  return visited.length;
}

/** Paint the first third of `order` black where that keeps blacks apart and
 * the whites connected. */
function chooseBlackSquares(
  grid: Int8Array,
  w: number,
  h: number,
  order: number[],
): void {
  const n = w * h;
  grid.fill(WHITE);
  const anyWhiteCell = order[n - 1]; // never a black candidate, so it stays white
  let nBlack = 0;

  for (let k = 0; k < Math.floor(n / 3); k++) {
    const i = order[k];
    const c = i % w;
    const r = Math.floor(i / w);

    let hasBlackNeighbor = false;
    for (let j = 0; j < 4; j++) {
      const rr = r + DR[j];
      const cc = c + DC[j];
      if (outOfBounds(rr, cc, w, h)) continue;
      if (grid[idx(rr, cc, w)] === BLACK) {
        hasBlackNeighbor = true;
        break;
      }
    }
    if (hasBlackNeighbor) continue;

    grid[i] = BLACK;
    nBlack++;
    if (floodCountWhite(grid, w, h, anyWhiteCell) + nBlack < n) {
      grid[i] = WHITE; // would disconnect the white region — revert
      nBlack--;
    }
  }
}

function computeClues(grid: Int8Array, w: number, h: number): void {
  // White cells start at WHITE (−1); adding the horizontal and vertical
  // run lengths yields −1 + h + v = h + v − 1, the clue. Black stays −2.
  for (let r = 0; r < h; r++) {
    let runSize = 0;
    for (let c = 0; c <= w; c++) {
      if (c === w || grid[idx(r, c, w)] === BLACK) {
        for (let cc = c - runSize; cc < c; cc++) grid[idx(r, cc, w)] += runSize;
        runSize = 0;
      } else {
        runSize++;
      }
    }
  }
  for (let c = 0; c < w; c++) {
    let runSize = 0;
    for (let r = 0; r <= h; r++) {
      if (r === h || grid[idx(r, c, w)] === BLACK) {
        for (let rr = r - runSize; rr < r; rr++) grid[idx(rr, c, w)] += runSize;
        runSize = 0;
      } else {
        runSize++;
      }
    }
  }
}

/** Count the cells the ladder determines on a copy of the grid. Equal to the
 * number of EMPTY cells iff the board is solvable. */
function solvableFillCount(grid: Int8Array, w: number, h: number): number {
  return applyRules(grid.slice(), w, h);
}

/** Blank clues — those rotationally symmetric to a black square, then
 * symmetric pairs in random order — keeping only removals that leave the
 * board uniquely solvable without recursion. Returns the number of cells
 * removed, or −1 if the symmetric-removal stage left it unsolvable.
 * Port of `newdesc_strip_clues`. */
function stripClues(grid: Int8Array, w: number, h: number, order: number[]): number {
  const n = w * h;
  const rotate = (x: number): number => n - 1 - x;
  const swap = (i: number, j: number): void => {
    const t = order[i];
    order[i] = order[j];
    order[j] = t;
  };

  // Partition `order` into [0,left) symmetric-to-black, [left,right) other,
  // [right,n) black. Nothing in [left,right) is black, then or later.
  let left = 0;
  let right = n;
  for (let k = 0; ; k++) {
    while (k < right && grid[order[k]] === BLACK) {
      right--;
      swap(right, k);
    }
    if (k >= right) break;
    if (grid[rotate(order[k])] === BLACK) {
      swap(k, left);
      left++;
    }
  }

  for (let k = 0; k < left; k++) grid[order[k]] = EMPTY;
  for (let k = right; k < n; k++) grid[order[k]] = EMPTY;

  let cluesRemoved = left + (n - right);

  if (solvableFillCount(grid, w, h) < cluesRemoved) return -1;

  for (let k = left; k < right; k++) {
    const i = order[k];
    const j = rotate(i);
    const clue = grid[i];
    const clueRot = grid[j];
    // `order` holds both squares of a pair, so a pair that went is met again
    // from its other square. Upstream runs the solver on it there, and that
    // run cannot pass: it is asked for two squares more than are undecided.
    if (clue === EMPTY) continue;
    grid[i] = EMPTY;
    grid[j] = EMPTY;
    const delta = i === j ? 1 : 2;
    cluesRemoved += delta;
    if (solvableFillCount(grid, w, h) === cluesRemoved) continue;
    grid[i] = clue;
    grid[j] = clueRot;
    cluesRemoved -= delta;
  }

  return cluesRemoved;
}

/**
 * Strip an Easy board further: each symmetric pair of clues still showing,
 * in the strip's order, gone while `one` still holds.
 *
 * It is an Easy board stripped further and not one strip by the search.
 * Measured 2026-10-10, that way took longer (0.37 s against 0.22 at 11×16,
 * 0.14 s against 0.09 at 9×13) and left the hint less to do: a median of 124
 * squares of 176 undecided against 90.
 *
 * Measured the same day on twelve boards a size: a dealt board needs a median
 * of 9 positions at 6×9 and 17 to 21 at the larger presets, and 29 at most.
 * On 180 dealt boards a square that breaks a rule the moment it is filled, a
 * deduction the rules lack, finishes none, and a square tried and followed
 * through the rules to a broken one finishes every one.
 */
function stripFurther(grid: Int8Array, order: number[], one: () => boolean): void {
  const n = grid.length;
  for (const i of order) {
    const j = n - 1 - i;
    const clue = grid[i];
    const clueRot = grid[j];
    if (clue <= 0 || clueRot <= 0) continue;
    grid[i] = EMPTY;
    grid[j] = EMPTY;
    if (one()) continue;
    grid[i] = clue;
    grid[j] = clueRot;
  }
}

/** Generate a rotationally-symmetric board with one answer; returns the clue
 * grid (clue cells > 0, every other cell EMPTY). At Easy the ladder
 * finishes it, and at Unreasonable it does not. */
export function generateGrid(p: RangeParams, rng: RandomState): Int8Array {
  const { w, h } = p;
  const grid = new Int8Array(w * h);
  const order = Array.from({ length: w * h }, (_, i) => i);
  /** Draw an Easy board into `grid`, or `null` where these black squares
   * gave none. */
  const easyGrid = (): Int8Array | null => {
    shuffle(order, rng);
    chooseBlackSquares(grid, w, h, order);
    computeClues(grid, w, h);
    shuffle(order, rng);
    return stripClues(grid, w, h, order) < 0 ? null : grid;
  };
  const label = `range: generation (${w}x${h})`;
  if (p.diff !== DIFF_EASY)
    return dealUnreasonable<Int8Array>({
      label,
      draw: easyGrid,
      strip: (board, one) => stripFurther(board, order, one),
      deduced: (board) => deductionFinishes(board, w, h),
      answer: (board, budget) => searchAnswers(board, w, h, budget),
    });
  const attempt = retryLimit(label);
  do attempt();
  while (easyGrid() === null);
  return grid;
}
