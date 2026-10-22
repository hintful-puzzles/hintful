/**
 * Range solver, error-checker, and generator — port of the solver and
 * `new_game_desc` subsystems of `range.c`.
 *
 * The deductive solver applies three sound rules to a fixpoint: run-length
 * "not too big", black-adjacency, and white-connectedness via biconnected-
 * component cut vertices. Upstream also has a recursion rule; here
 * `searchAnswers` (the three rules, and trial and error where they stop, every
 * position checked by `findErrors`) counts a board's answers to two. It serves
 * the Solve command and `findMistakes`, and deals the Unreasonable tier. An
 * Easy board is kept only if uniquely solvable by the three rules without any
 * guessing, as upstream. The run-length rule bounds a run more tightly than
 * upstream's ({@link ruleNotTooBig} says why), so the rules finish every board
 * upstream's do and some they do not.
 */

import {
  type Answer,
  answerCache,
  DIFF_EASY,
  dealUnreasonable,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import { singleFirings } from "../../engine/deduction-fixpoint.ts";
import { Dsf } from "../../engine/dsf.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { SweepOffers } from "../../engine/sweep-offers.ts";
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

/** Set an EMPTY in-bounds cell; returns true iff it actually changed
 * (upstream `solver_makemove` skips non-EMPTY cells silently). */
function makeMove(
  grid: Int8Array,
  w: number,
  h: number,
  r: number,
  c: number,
  value: number,
): boolean {
  if (outOfBounds(r, c, w, h)) return false;
  const cell = idx(r, c, w);
  if (grid[cell] !== EMPTY) return false;
  grid[cell] = value;
  return true;
}

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

/** Invoked at each forced cell when the deduction is run for a hint, once the
 * cell is written. */
type Recorder = (r: number, c: number, value: number, reason: HintReason) => void;

export function findClues(grid: Int8Array, w: number, h: number): Cell[] {
  const clues: Cell[] = [];
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (grid[idx(r, c, w)] > 0) clues.push({ r, c });
    }
  }
  return clues;
}

// --- the three deductive rules ---------------------------------------------

/** A cell orthogonally adjacent to a black cell must be white. */
function ruleAdjacency(grid: Int8Array, w: number, h: number, rec?: Recorder): number {
  let made = 0;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (grid[idx(r, c, w)] !== BLACK) continue;
      for (let j = 0; j < 4; j++) {
        const rr = r + DR[j];
        const cc = c + DC[j];
        if (makeMove(grid, w, h, rr, cc, WHITE)) {
          made++;
          rec?.(rr, cc, WHITE, { kind: "adjacency", from: { r, c } });
        }
      }
    }
  }
  return made;
}

/** Whether a clue's run can end just before this cell: it is off the board,
 * shaded or undecided. A run that reaches a cell known to be white goes on
 * through it. */
function canEndBefore(
  grid: Int8Array,
  w: number,
  h: number,
  r: number,
  c: number,
): boolean {
  if (outOfBounds(r, c, w, h)) return true;
  const v = grid[idx(r, c, w)];
  return v === EMPTY || v === BLACK;
}

/**
 * A clue's run-length arithmetic. In each direction the clue's run is at
 * least the white cells it already sees and at most the furthest place it
 * can end with the other three no longer than they already are. Where the
 * most is what it sees, the next cell is shaded; and the cells the run needs
 * with the other three at their most are white.
 *
 * Upstream's `solver_reasoning_not_too_big` bounds the most by the first gap
 * alone: a run cannot fill it where that joins the white cells beyond and
 * passes the clue. A white cell marked inside a gap that long leaves a first
 * gap that fits, and the bound goes: the rule concluded less from a board
 * that says more. This bound is never above upstream's, so every board
 * upstream's rules finish these do, and it only falls as cells are decided,
 * which is what lets a hint carry on from an entry the player made first.
 */
function ruleNotTooBig(
  grid: Int8Array,
  w: number,
  h: number,
  clues: Cell[],
  rec?: Recorder,
): number {
  let made = 0;
  const least = [0, 0, 0, 0];
  const most = [0, 0, 0, 0];

  for (const clueCell of clues) {
    const { r: row, c: col } = clueCell;
    const clue = grid[idx(row, col, w)];

    let whites = 1;
    for (let j = 0; j < 4; j++) {
      least[j] = runLength(
        grid,
        w,
        h,
        row + DR[j],
        col + DC[j],
        DR[j],
        DC[j],
        MASK_KNOWN_WHITE,
      );
      whites += least[j];
    }

    let space = 1;
    for (let j = 0; j < 4; j++) {
      const room = clue - whites + least[j];
      let far = least[j];
      let r = row + (far + 1) * DR[j];
      let c = col + (far + 1) * DC[j];
      for (
        let length = far + 1;
        length <= room && !outOfBounds(r, c, w, h) && grid[idx(r, c, w)] !== BLACK;
        length++
      ) {
        r += DR[j];
        c += DC[j];
        if (canEndBefore(grid, w, h, r, c)) far = length;
      }
      most[j] = far;
      space += far;
    }

    for (let j = 0; j < 4; j++) {
      if (most[j] !== least[j]) continue;
      const r = row + (least[j] + 1) * DR[j];
      const c = col + (least[j] + 1) * DC[j];
      if (makeMove(grid, w, h, r, c, BLACK)) {
        made++;
        rec?.(r, c, BLACK, {
          kind: whites === clue ? "satisfied" : "overrun",
          clue: clueCell,
          n: clue,
        });
      }
    }

    for (let j = 0; j < 4; j++) {
      const needed = clue - space + most[j];
      let r = row + DR[j];
      let c = col + DC[j];
      for (let k = 0; k < needed; k++, r += DR[j], c += DC[j]) {
        if (makeMove(grid, w, h, r, c, WHITE)) {
          made++;
          rec?.(r, c, WHITE, { kind: "reach", clue: clueCell, n: clue });
        }
      }
    }
  }
  return made;
}

const NOT_VISITED = -1;

/** A square whose painting black would disconnect the white region (a
 * cut vertex of the white graph) must be white. DFS lowpoint
 * articulation-point detection, as upstream's
 * `solver_reasoning_connectedness` / `dfs_biconnect_visit`.
 *
 * Alone it can conclude less from a board that says more: shading the square
 * a cut vertex cut off leaves it no cut vertex. {@link ruleAdjacency} then
 * clears that same square, so the rules together lose nothing.
 *
 * The walk keeps its own stack. It goes as deep as the clear squares are
 * many, and a call a square overflows the engine's stack on a board of a few
 * thousand. */
function ruleConnectedness(
  grid: Int8Array,
  w: number,
  h: number,
  rec?: Recorder,
): number {
  const n = w * h;
  let start = 0;
  while (start < n && grid[start] === BLACK) start++;
  if (start >= n) return 0; // no white cells at all

  let made = 0;
  const cutVertex = (cell: number): void => {
    const r = Math.floor(cell / w);
    const c = cell % w;
    if (makeMove(grid, w, h, r, c, WHITE)) {
      made++;
      rec?.(r, c, WHITE, { kind: "connect" });
    }
  };

  const depth = new Int32Array(n).fill(NOT_VISITED);
  const low = new Int32Array(n);
  // The direction each square tries next, and the path from `start` to the
  // square being visited: `path[d]` is at depth `d`, and its parent is the
  // entry before it.
  const tried = new Uint8Array(n);
  const path = new Int32Array(n);
  let top = 0;
  let startChildren = 0;
  path[0] = start;
  depth[start] = 0;

  while (top >= 0) {
    const ci = path[top];
    if (tried[ci] < 4) {
      const j = tried[ci]++;
      const rr = Math.floor(ci / w) + DR[j];
      const cc = (ci % w) + DC[j];
      if (outOfBounds(rr, cc, w, h)) continue;
      const cell = idx(rr, cc, w);
      if (grid[cell] === BLACK) continue;

      if (depth[cell] === NOT_VISITED) {
        top++;
        path[top] = cell;
        depth[cell] = top;
        low[cell] = top;
      } else if (top > 0 && cell !== path[top - 1]) {
        low[ci] = Math.min(low[ci], depth[cell]);
      }
      continue;
    }

    // Every direction tried: back to the parent, which is a cut vertex when
    // nothing under this square reaches above it.
    top--;
    if (top < 0) break;
    const parent = path[top];
    if (top === 0) startChildren++;
    else if (low[ci] >= top) cutVertex(parent);
    low[parent] = Math.min(low[parent], low[ci]);
  }

  // The start has nothing above it to reach: it is a cut vertex when the
  // walk left it twice.
  if (startChildren >= 2) cutVertex(start);
  return made;
}

/** Run the three deductive rules to a fixpoint; returns the number of
 * cells newly filled. No guessing — this is the "without recursion"
 * solver the generator's uniqueness check uses. */
export function applyRules(
  grid: Int8Array,
  w: number,
  h: number,
  clues: Cell[],
): number {
  let total = 0;
  for (;;) {
    const made =
      ruleNotTooBig(grid, w, h, clues) +
      ruleAdjacency(grid, w, h) +
      ruleConnectedness(grid, w, h);
    if (made === 0) break;
    total += made;
  }
  return total;
}

/**
 * Run the deductive solver from `grid` (the player's current marks),
 * recording every forced cell in deduction order with the reason that
 * forces it — the data a hint plan narrates. Operates on a clone.
 *
 * One cell at a time, each the one beside the plan's last where there is
 * one, so a plan finishes the clue it is working on before it moves on.
 */
export function deduceHintPlan(grid: Int8Array, w: number, h: number): HintMove[] {
  const dup = grid.slice();
  const clues = findClues(dup, w, h);
  const plan: HintMove[] = [];
  let moves: HintMove[] = [];
  const offers = new SweepOffers<{ grid: Int8Array; moves: HintMove[] }, HintMove[]>({
    save: () => ({ grid: dup.slice(), moves: [...moves] }),
    restore: (s) => {
      dup.set(s.grid);
      moves = [...s.moves];
    },
    recorded: () => [...moves],
    record: (m) => {
      moves = [...m];
    },
    // The cell, and the clue or the black square that forces it.
    reads: (m) =>
      m.flatMap(({ r, c, reason }) => [
        r * w + c,
        ...("clue" in reason ? [reason.clue.r * w + reason.clue.c] : []),
        ...("from" in reason ? [reason.from.r * w + reason.from.c] : []),
      ]),
    writes: (_before, _after, m) => m.map(({ r, c }) => r * w + c),
  });
  // Each cell is a firing of its own: the plan takes every firing through
  // its offers, so a rule never runs on past the one.
  const rec: Recorder = (r, c, value, reason) => {
    moves.push({ r, c, value, reason, grid: dup.slice() });
    offers.keep();
  };
  const pass = singleFirings({
    techniques: offers.techniques([
      { id: "not-too-big", tier: 0, run: () => ruleNotTooBig(dup, w, h, clues, rec) },
      { id: "adjacency", tier: 0, run: () => ruleAdjacency(dup, w, h, rec) },
      { id: "connectedness", tier: 0, run: () => ruleConnectedness(dup, w, h, rec) },
    ]),
    budget: stepBudget("range hint"),
    continuing: true,
  });
  for (;;) {
    moves = [];
    if (!pass.next()) break;
    plan.push(...moves);
  }
  return plan;
}

// --- error checking (solved-detection + live highlight) --------------------

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

/** True iff the grid violates a rule; when `report` is supplied it is
 * filled per-cell instead (and the return value is meaningless).
 * Port of `find_errors`. */
export function findErrors(
  grid: Int8Array,
  w: number,
  h: number,
  report?: boolean[],
): boolean {
  const n = w * h;
  // All white (non-black) cells must form one connected component.
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
          if (!report) return true;
          report[i] = true;
          break;
        }
        continue;
      }
      if (v > 0) {
        // Solved means the clue sees exactly its count. As a live highlight, it
        // is wrong if it falls short even with every undecided cell white, or
        // already sees too many with only the known whites.
        const seen = seenFrom(grid, w, h, r, c, ~MASK_BLACK);
        if (!report) {
          if (seen !== v) return true;
        } else if (seen < v || seenFrom(grid, w, h, r, c, MASK_KNOWN_WHITE) > v) {
          report[i] = true;
        }
      }
      anyWhite = i;
      if (r + 1 < h && grid[i + w] !== BLACK) dsf.merge(i, i + w);
      if (c + 1 < w && grid[i + 1] !== BLACK) dsf.merge(i, i + 1);
    }
  }

  if (anyWhite !== -1 && nblack + dsf.size(anyWhite) < n) {
    if (!report) return true;
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

  return false;
}

/** Whether the three deductive rules alone decide every cell of a clue grid
 * and break no rule doing it: the test `stripClues` keeps a clue's removal by,
 * and the walk a hint plan narrates. */
export function deductionFinishes(grid: Int8Array, w: number, h: number): boolean {
  const dup = grid.slice();
  applyRules(dup, w, h, findClues(dup, w, h));
  return !dup.includes(EMPTY) && !findErrors(dup, w, h);
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
 * Count a clue grid's answers up to two, by trial and error over the three
 * rules: where they stop, take the first undecided cell and assume it
 * shaded, and then clear.
 *
 * The rules only ever fill a cell, so a position that no answer fits is
 * found by the checker: a clue that cannot see its count however the
 * undecided cells go, or already sees too many, two shaded cells side by
 * side, or clear cells cut off from the rest.
 */
export function searchAnswers(
  clueGrid: Int8Array,
  w: number,
  h: number,
  budget: number = SEARCH_BUDGET,
): RangeAnswer {
  const clues = findClues(clueGrid, w, h);
  const wrong: boolean[] = new Array(w * h);
  return searchBoard<Int8Array, Int8Array>({
    start: clueGrid.slice(),
    deduce(position) {
      applyRules(position, w, h, clues);
      wrong.fill(false);
      findErrors(position, w, h, wrong);
      if (wrong.includes(true)) return "contradiction";
      return position.includes(EMPTY) ? "stuck" : "solved";
    },
    assume(position) {
      const cell = position.indexOf(EMPTY);
      if (cell < 0) return [];
      return [BLACK, WHITE].map((value) => {
        const assumed = position.slice();
        assumed[cell] = value;
        return assumed;
      });
    },
    solution: (position) => position,
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

/** Count the cells the no-recursion solver determines on a copy of the
 * grid. Equal to the number of EMPTY cells iff the board is solvable. */
function solvableFillCount(grid: Int8Array, w: number, h: number): number {
  const dup = grid.slice();
  return applyRules(dup, w, h, findClues(dup, w, h));
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
 * grid (clue cells > 0, every other cell EMPTY). At Easy the three rules
 * finish it, which is upstream's board, and at Unreasonable they do not. */
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
