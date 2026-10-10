/**
 * Mosaic solver and generator (the solver half of upstream's `mosaic.c`:
 * `solve_cell`, `solve_check`, `solve_game_actual`, `hide_clues`,
 * `new_game_desc`).
 *
 * One deduction rule, three drivers: generation feasibility
 * (`solveCheck`, desc-side, knows full/empty), clue minimization
 * (`hideClues`), and the Solve command / mistake check
 * (`solveGameActual`, board-side, clue numbers only).
 */

import {
  type Answer,
  answerCache,
  type Deduced,
  DIFF_EASY,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import { type RandomState, randomBits } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import {
  countAround,
  encodeBoard,
  type MosaicBoard,
  type MosaicMistake,
  type MosaicParams,
  type MosaicState,
  STATE_BLANK,
  STATE_MARK_MASK,
  STATE_MARKED,
  STATE_UNMARKED,
} from "./state.ts";

// --- solver scratch -----------------------------------------------------

/** Upstream's `struct solution_cell[]` as parallel typed arrays:
 * `hideClues` runs `solveCheck` once per candidate clue, so this is the
 * hot allocation. */
export interface Solution {
  /** STATE_UNMARKED / STATE_MARKED / STATE_BLANK per cell. */
  cell: Uint8Array;
  solved: Uint8Array;
  /** Set when this clue's deduction actually narrowed something —
   * a not-needed clue is hidden for free by `hideClues`. */
  needed: Uint8Array;
}

function newSolution(size: number): Solution {
  return {
    cell: new Uint8Array(size),
    solved: new Uint8Array(size),
    needed: new Uint8Array(size),
  };
}

type CellResult = "progress" | "none" | "contradiction";

/** Set every still-unmarked neighbor (3×3, clipped) to `mark`. */
function markAround(
  width: number,
  height: number,
  sol: Solution,
  x: number,
  y: number,
  mark: number,
): void {
  for (let j = Math.max(0, y - 1); j <= Math.min(height - 1, y + 1); j++) {
    for (let i = Math.max(0, x - 1); i <= Math.min(width - 1, x + 1); i++) {
      const pos = j * width + i;
      if (sol.cell[pos] === STATE_UNMARKED) sol.cell[pos] = mark;
    }
  }
}

/**
 * The whole deduction rule (upstream `solve_cell`). `clue < 0` means
 * the cell shows no clue; `full`/`empty` are the generation-side
 * shortcuts (the clue saturates its neighborhood / is zero) and are
 * always false on the board-side drivers.
 */
export function solveCell(
  width: number,
  height: number,
  clue: number,
  full: boolean,
  empty: boolean,
  sol: Solution,
  x: number,
  y: number,
): CellResult {
  const pos = y * width + x;
  if (sol.solved[pos]) return "none";
  const { marked, blank, total } = countAround(width, height, sol.cell, x, y);
  const determined = marked + blank === total;

  if (clue < 0) {
    // No clue here; solved once its neighborhood is determined.
    if (!determined) return "none";
    sol.solved[pos] = 1;
    return "progress";
  }
  // The unknowns are forced blank once the clue is met, and marked once it
  // needs all of them. A neighborhood with more marked than the clue, or too
  // few left to reach it, is a contradiction whether or not it is determined:
  // upstream says so only of a determined one, which is all a board with an
  // answer asks, and a search has to be told of the other as it happens.
  let mark: number;
  if (full) mark = STATE_MARKED;
  else if (empty || marked === clue) mark = STATE_BLANK;
  else if (clue === total - blank) mark = STATE_MARKED;
  else if (marked > clue || clue > total - blank) return "contradiction";
  else return "none";
  sol.solved[pos] = 1;
  if (!determined) sol.needed[pos] = 1;
  markAround(width, height, sol, x, y, mark);
  return "progress";
}

// --- generation-side cells ------------------------------------------------

/** The generator's per-cell knowledge (upstream `struct desc_cell`),
 * as parallel typed arrays. */
export interface GenCells {
  clue: Int8Array;
  shown: Uint8Array;
  full: Uint8Array;
  empty: Uint8Array;
}

/** Compute one cell's clue from the image (upstream `populate_cell`): the
 * marked cells of its clipped 3×3 neighborhood, itself included. "Full"
 * means the clue saturates the neighborhood (9 interior, 6 edge, 4
 * corner), "empty" that it is 0. */
export function populateCell(
  width: number,
  height: number,
  image: Uint8Array,
  x: number,
  y: number,
): { clue: number; full: boolean; empty: boolean } {
  let clue = 0;
  let total = 0;
  for (let j = Math.max(0, y - 1); j <= Math.min(height - 1, y + 1); j++) {
    for (let i = Math.max(0, x - 1); i <= Math.min(width - 1, x + 1); i++) {
      clue += image[j * width + i];
      total++;
    }
  }
  return { clue, full: clue === total, empty: clue === 0 };
}

/** Upstream `start_point_check`, quirk included: `newDesc` scans only the
 * first `(width-1)*(height-1)` cells, not the whole board. Scanning them
 * all would change every generated board. */
export function startPointCheck(cells: GenCells, scanSize: number): boolean {
  for (let i = 0; i < scanSize; i++) {
    if (cells.empty[i] || cells.full[i]) return true;
  }
  return false;
}

/**
 * Desc-side feasibility check (upstream `solve_check`): run the
 * deduction over the shown clues — in rng-shuffled order when `rng` is
 * given (generation), stable scan order otherwise (the re-checks
 * inside `hideClues`) — until no progress. Returns whether every cell
 * of the board was determined, plus the solution (for `needed`).
 */
export function solveCheck(
  width: number,
  height: number,
  cells: GenCells,
  rng: RandomState | null,
): { solved: boolean; sol: Solution } {
  const size = width * height;
  const sol = newSolution(size);
  const shownPos: number[] = [];
  for (let pos = 0; pos < size; pos++) {
    if (cells.shown[pos]) shownPos.push(pos);
  }
  if (rng) shuffle(shownPos, rng);

  let solvedCount = 0;
  let madeProgress = true;
  let error = false;
  while (solvedCount < shownPos.length && madeProgress && !error) {
    madeProgress = false;
    for (const pos of shownPos) {
      const res = solveCell(
        width,
        height,
        cells.clue[pos],
        cells.full[pos] !== 0,
        cells.empty[pos] !== 0,
        sol,
        pos % width,
        Math.floor(pos / width),
      );
      if (res === "contradiction") {
        error = true;
        break;
      }
      if (res === "progress") {
        solvedCount++;
        madeProgress = true;
      }
    }
  }

  // Like upstream, count the determined cells only after a round that
  // made progress.
  let determined = 0;
  if (madeProgress) {
    for (let pos = 0; pos < size; pos++) {
      if (sol.cell[pos] & STATE_MARK_MASK) determined++;
    }
  }
  return { solved: determined === size, sol };
}

/**
 * Board-side solve (upstream `solve_game_actual`): only the clue
 * numbers are known (no full/empty shortcuts), every cell is visited
 * each round. Returns the solution cells, or `null` when deduction
 * stalls or contradicts.
 */
export function solveGameActual(board: MosaicBoard): Uint8Array | null {
  const cells = new Uint8Array(board.width * board.height);
  return settle(board, cells) === "solved" ? cells : null;
}

/**
 * Run the rule over every cell of `board` until nothing more follows from
 * `cells`, the marks so far, which it fills in place. `"solved"` is every
 * cell marked and every clue met.
 */
function settle(board: MosaicBoard, cells: Uint8Array): Deduced {
  const { width, height, clues } = board;
  const size = width * height;
  const sol: Solution = {
    cell: cells,
    solved: new Uint8Array(size),
    needed: new Uint8Array(size),
  };

  let solvedCount = 0;
  let madeProgress = true;
  let error = false;
  while (solvedCount < size && madeProgress && !error) {
    madeProgress = false;
    for (let y = 0; y < height && !error; y++) {
      for (let x = 0; x < width; x++) {
        const res = solveCell(
          width,
          height,
          clues[y * width + x],
          false,
          false,
          sol,
          x,
          y,
        );
        if (res === "contradiction") {
          error = true;
          break;
        }
        if (res === "progress") {
          madeProgress = true;
          solvedCount++;
        }
      }
    }
  }
  if (error) return "contradiction";
  return solvedCount === size ? "solved" : "stuck";
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a board's answers; the one answer is each
 * cell's mark, `STATE_MARKED` or `STATE_BLANK`. */
export type MosaicAnswer = Answer<Uint8Array>;

/**
 * The positions a search may try before it gives up, each one a square
 * assumed shaded or clear and the rule run from it.
 *
 * It decides which Unreasonable boards exist: a board that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games. A dealt board needs 30 at most,
 * the generator's own bound, so the rest is room for a pasted one. Measured
 * 2026-10-10, running it out on a board with half its clues gone takes 0.1 s
 * at 30×30, 0.2 s at 50×50 and about a second at 100×100.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a board's answers up to two, by trial and error over the rule: where
 * it stops, take an empty square of the number with the fewest left to decide
 * and assume it each way.
 */
export function searchAnswers(
  board: MosaicBoard,
  budget: number = SEARCH_BUDGET,
): MosaicAnswer {
  return searchBoard<Uint8Array, Uint8Array>({
    start: new Uint8Array(board.width * board.height),
    deduce: (cells) => settle(board, cells),
    assume: (cells) => assumeSquare(board, cells),
    solution: (cells) => cells,
    budget,
  });
}

/**
 * The two positions a stuck one divides into: one empty square, shaded and
 * then clear. The square is the first empty one in the block of the number
 * with the fewest empty squares, where either way is likeliest to settle the
 * rest of the block. With no such number it is the first empty square: one no
 * number counts, which is free and so gives the board two answers.
 */
function assumeSquare(board: MosaicBoard, cells: Uint8Array): Uint8Array[] {
  const { width, height, clues } = board;
  let at = cells.indexOf(STATE_UNMARKED);
  let fewest = Number.POSITIVE_INFINITY;
  for (let pos = 0; pos < clues.length; pos++) {
    if (clues[pos] < 0) continue;
    const x = pos % width;
    const y = Math.floor(pos / width);
    const { marked, blank, total } = countAround(width, height, cells, x, y);
    const open = total - marked - blank;
    if (open === 0 || open >= fewest) continue;
    fewest = open;
    at = firstOpenAround(width, height, cells, x, y);
  }
  if (at < 0) return [];
  return [STATE_MARKED, STATE_BLANK].map((mark) => {
    const next = cells.slice();
    next[at] = mark;
    return next;
  });
}

/** The first unmarked cell of the block round (x,y), in reading order. */
function firstOpenAround(
  width: number,
  height: number,
  cells: Uint8Array,
  x: number,
  y: number,
): number {
  for (let j = Math.max(0, y - 1); j <= Math.min(height - 1, y + 1); j++)
    for (let i = Math.max(0, x - 1); i <= Math.min(width - 1, x + 1); i++)
      if (cells[j * width + i] === STATE_UNMARKED) return j * width + i;
  return -1;
}

/** Keyed on a state's board, which every state of a game shares. */
const answers = answerCache<MosaicBoard, Uint8Array>();

/** What a search of a state's board established about its answers. The
 * player's marks are not read. */
export function answerOf(state: { board: MosaicBoard }): MosaicAnswer {
  return answers(state.board, () => searchAnswers(state.board));
}

// --- generator --------------------------------------------------------------

/** Hide clues the deduction never needed; in aggressive mode also try
 * hiding each needed clue in random order, reverting hides that break
 * solvability (upstream `hide_clues`). */
export function hideClues(
  width: number,
  height: number,
  cells: GenCells,
  rng: RandomState,
  aggressive: boolean,
): void {
  const { sol } = solveCheck(width, height, cells, rng);
  const size = width * height;
  const needed: number[] = [];
  for (let pos = 0; pos < size; pos++) {
    if (!sol.needed[pos]) cells.shown[pos] = 0;
    else if (aggressive) needed.push(pos);
  }
  if (aggressive) {
    shuffle(needed, rng);
    for (const pos of needed) {
      cells.shown[pos] = 0;
      if (!solveCheck(width, height, cells, null).solved) {
        cells.shown[pos] = 1;
      }
    }
  }
}

/** An Easy board's clues, `-1` where hidden (upstream `new_game_desc`):
 * random image → clues → regenerate until a usable starting deduction exists
 * and the deduction completes → hide clues. */
function easyClues(p: MosaicParams, rng: RandomState): Int8Array {
  const { width, height, aggressive } = p;
  const size = width * height;
  const image = new Uint8Array(size);
  const cells: GenCells = {
    clue: new Int8Array(size),
    shown: new Uint8Array(size),
    full: new Uint8Array(size),
    empty: new Uint8Array(size),
  };

  const attempt = retryLimit(`mosaic: generation (${width}x${height})`);
  do {
    attempt();
    for (let i = 0; i < size; i++) image[i] = randomBits(rng, 1);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = y * width + x;
        const { clue, full, empty } = populateCell(width, height, image, x, y);
        cells.clue[pos] = clue;
        cells.shown[pos] = 1;
        cells.full[pos] = full ? 1 : 0;
        cells.empty[pos] = empty ? 1 : 0;
      }
    }
  } while (
    !startPointCheck(cells, (width - 1) * (height - 1)) ||
    !solveCheck(width, height, cells, rng).solved
  );
  hideClues(width, height, cells, rng, aggressive);

  const clues = new Int8Array(size);
  for (let pos = 0; pos < size; pos++) {
    clues[pos] = cells.shown[pos] ? cells.clue[pos] : -1;
  }
  return clues;
}

/**
 * The positions the search may try when a clue is hidden from an Unreasonable
 * board, far under the 2,000 it has by default. Hiding stops only when the
 * search can no longer prove one answer, so it takes a board up to whatever
 * the search is allowed, and this is how hard the tier's boards are.
 *
 * Measured 2026-10-10 with aggressive generation: a dealt board needs a
 * median of 9 positions at 5×5, 21 at 10×10 and 29 at 25×25, and the rule
 * leaves a median of 58 squares of 100 undecided at 10×10 and 485 of 625 at
 * 25×25. Most of these boards do not need a trial: comparing two numbers
 * whose blocks overlap, which the rule does not do, finishes 34 of 40 at
 * 10×10 and 11 of 16 at 15×15. Without aggressive generation a board needs a
 * median of 5 to 7 positions and that comparison finishes every one seen.
 */
const HIDING_BUDGET = 30;

/**
 * An Unreasonable board's clues: an Easy board's with more hidden, each while
 * the search still proves one answer within {@link HIDING_BUDGET}, kept once
 * the rule stops short on what is left. With aggressive generation every
 * clue is tried. Without it hiding stops at the first clue whose loss stops
 * the rule, so the board keeps the rest of its numbers.
 *
 * It starts from an Easy board and not from every clue, which the search
 * could strip as well: stripped that way most boards have no number the rule
 * can start from, and the hint has nothing to say on them (the rule left a
 * median of 90 squares of 100 undecided at 10×10, against 58 this way).
 */
function unreasonableClues(p: MosaicParams, rng: RandomState): Int8Array {
  const { width, height, aggressive } = p;
  const size = width * height;
  // Only the smallest boards are often thrown away for giving up no clue.
  const attempt = retryLimit(`mosaic: Unreasonable generation (${width}x${height})`);
  for (;;) {
    attempt();
    const clues = easyClues(p, rng);
    const board: MosaicBoard = { width, height, clues };
    const shown: number[] = [];
    for (let pos = 0; pos < size; pos++) if (clues[pos] >= 0) shown.push(pos);
    shuffle(shown, rng);
    let hidden = false;
    for (const pos of shown) {
      const clue = clues[pos];
      clues[pos] = -1;
      if (searchAnswers(board, HIDING_BUDGET).kind !== "one") {
        clues[pos] = clue;
        continue;
      }
      hidden = true;
      if (!aggressive && solveGameActual(board) === null) return clues;
    }
    // The rule deduces no more from fewer clues, so asking once is enough.
    if (hidden && solveGameActual(board) === null) return clues;
  }
}

export function newDesc(p: MosaicParams, rng: RandomState): { desc: string } {
  const clues = p.diff === DIFF_EASY ? easyClues(p, rng) : unreasonableClues(p, rng);
  return { desc: encodeBoard({ width: p.width, height: p.height, clues }) };
}

// --- solve command + mistakes -------------------------------------------------

/** Hex-pack the solution's marked-cell bitmap, MSB first (the payload
 * of upstream's `s…` solve move). */
export function encodeSolution(solCells: Uint8Array): string {
  let out = "";
  for (let i = 0; i < solCells.length; i += 8) {
    let byte = 0;
    for (let bit = 0; bit < 8; bit++) {
      byte <<= 1;
      if (i + bit < solCells.length && solCells[i + bit] === STATE_MARKED) byte |= 1;
    }
    out += byte.toString(16).padStart(2, "0");
  }
  return out;
}

/** Every determined cell whose mark contradicts the board's one answer, which
 * the search found at either tier. Where it did not prove there is exactly
 * one, there is nothing to check against and no mistake is reported. */
export function findMistakes(state: MosaicState): MosaicMistake[] {
  const answer = answerOf(state);
  if (answer.kind !== "one") return [];
  const solCells = answer.solution;
  const { width, cells } = state;
  const mistakes: MosaicMistake[] = [];
  for (let pos = 0; pos < cells.length; pos++) {
    const mark = cells[pos] & STATE_MARK_MASK;
    if (mark !== STATE_UNMARKED && mark !== solCells[pos]) {
      mistakes.push({ x: pos % width, y: Math.floor(pos / width) });
    }
  }
  return mistakes;
}
