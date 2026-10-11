/**
 * Mosaic solver and generator (the solver half of upstream's `mosaic.c`:
 * `solve_cell`, `solve_check`, `solve_game_actual`, `hide_clues`,
 * `new_game_desc`).
 *
 * Upstream's one rule (`solveCell`) deals an Easy board as upstream does:
 * generation feasibility (`solveCheck`, desc-side, knows full/empty) and clue
 * minimization (`hideClues`). A board in play is read by the whole deduction
 * (`deduce.ts`), which also compares two numbers: the board-side solve, the
 * search for a board's answers, and so Solve, the mistake check and the
 * Unreasonable deal.
 */

import {
  type Answer,
  answerCache,
  DIFF_EASY,
  dealUnreasonable,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import { type RandomState, randomBits } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { deduce } from "./deduce.ts";
import {
  countAround,
  DIFF_NORMAL,
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
 * Board-side solve (upstream `solve_game_actual`, with the comparison of two
 * numbers upstream lacks): only the clue numbers are known. Returns the
 * solution cells, or `null` when deduction stalls or contradicts.
 */
export function solveGameActual(board: MosaicBoard): Uint8Array | null {
  const cells = new Uint8Array(board.width * board.height);
  return deduce(board, cells) === "solved" ? cells : null;
}

/**
 * The lowest tier whose deduction finishes `board`: {@link DIFF_EASY} where
 * one number at a time does, {@link DIFF_NORMAL} where two had to be compared,
 * and `null` where the deduction stops short. The deduction compares only
 * where no number decides anything alone, so a comparison made is one needed.
 */
export function deductionTier(board: MosaicBoard): number | null {
  let compared = false;
  const finished = deduce(
    board,
    new Uint8Array(board.width * board.height),
    (firing) => {
      if ("other" in firing) compared = true;
    },
  );
  if (finished !== "solved") return null;
  return compared ? DIFF_NORMAL : DIFF_EASY;
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a board's answers; the one answer is each
 * cell's mark, `STATE_MARKED` or `STATE_BLANK`. */
export type MosaicAnswer = Answer<Uint8Array>;

/**
 * The positions a search may try before it gives up, each one a square
 * assumed shaded or clear and the deduction run from it.
 *
 * It decides which Unreasonable boards exist: a board that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games. A dealt board needs 30 at most,
 * the generator's own bound, so the rest is room for a pasted one. Measured
 * 2026-10-11, running it out on a board with half its clues gone takes 0.06 s
 * at 30×30, 0.08 s at 50×50 and 0.2 s at 100×100.
 */
const SEARCH_BUDGET = 2_000;

/** A position of the search: each square's mark, and the square assumed since
 * the deduction last stopped on them, which is all it has to start from. */
interface Position {
  cells: Uint8Array;
  tried: number | null;
}

/**
 * Count a board's answers up to two, by trial and error over the deduction:
 * where it stops, take an empty square of the number with the fewest left to
 * decide and assume it each way.
 */
export function searchAnswers(
  board: MosaicBoard,
  budget: number = SEARCH_BUDGET,
): MosaicAnswer {
  return searchBoard<Position, Uint8Array>({
    start: { cells: new Uint8Array(board.width * board.height), tried: null },
    deduce: ({ cells, tried }) => deduce(board, cells, null, tried),
    assume: ({ cells }) => assumeSquare(board, cells),
    solution: ({ cells }) => cells,
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
function assumeSquare(board: MosaicBoard, cells: Uint8Array): Position[] {
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
    return { cells: next, tried: at };
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
 * The clues hidden at once where generation is not aggressive, before the
 * deduction is asked. A run that stops it is gone through again a clue at a
 * time, so a long run pays for itself only while most runs pass. Measured
 * 2026-10-11 at 100×100: a board took 10 s a clue at a time, 5 s in runs of
 * 16 and 1 to 3 s in runs of 6, and 0.7 s at 50×50.
 */
const HIDING_RUN = 6;

/** Which try of an Unreasonable deal starts from every clue and not from an
 * Easy board: see {@link unreasonableClues}. */
const EVERY_CLUE_DRAW = 8;

/** A random picture's clues, every one showing. */
function everyClue(p: MosaicParams, rng: RandomState): Int8Array {
  const { width, height } = p;
  const size = width * height;
  const image = new Uint8Array(size);
  for (let i = 0; i < size; i++) image[i] = randomBits(rng, 1);
  return Int8Array.from(
    { length: size },
    (_, pos) =>
      populateCell(width, height, image, pos % width, Math.floor(pos / width)).clue,
  );
}

/**
 * An Unreasonable board's clues: an Easy board's with more hidden by the
 * search, kept where the deduction stops short. With aggressive generation
 * every clue is tried. Without it hiding stops at the first clue whose loss
 * stops the deduction, so the board keeps the rest of its numbers.
 *
 * It starts from an Easy board and not from every clue, which the search
 * could strip as well: stripped that way a 10×10 board is left with a median
 * of 62 squares of 100 the deduction does not decide, against 41 this way.
 * But no Easy board strips to an Unreasonable 3×3 or 4×3 (none in five
 * million tries), and 346 of the 105,052 3×3 boards with an answer are one.
 * So one try in {@link EVERY_CLUE_DRAW} starts from every clue: that is what
 * the smallest boards are dealt from, and at 10×10 the median left undecided
 * is what it was without it.
 *
 * Measured 2026-10-11, the squares the deduction leaves undecided on a dealt
 * board, median: 9 of 9 at 3×3, 19 of 25 at 5×5, 41 of 100 at 10×10, 72 of
 * 225 at 15×15; without aggressive generation 41 of 100 and 38 of 625. On 30
 * of 40 boards at 3×3 and 16 of 60 at 5×5 it decides nothing at all, and on
 * none of 60 at 10×10. A 10×10 board has a median of 5 steps that compare two
 * numbers before it stops.
 */
function unreasonableClues(p: MosaicParams, rng: RandomState): Int8Array {
  const { width, height, aggressive } = p;
  let draws = 0;
  return dealUnreasonable<MosaicBoard>({
    label: `mosaic: Unreasonable generation (${width}x${height})`,
    draw: () => ({
      width,
      height,
      clues: ++draws % EVERY_CLUE_DRAW === 0 ? everyClue(p, rng) : easyClues(p, rng),
    }),
    strip(board, one) {
      const { clues } = board;
      const shown: number[] = [];
      clues.forEach((clue, pos) => {
        if (clue >= 0) shown.push(pos);
      });
      shuffle(shown, rng);
      if (aggressive) {
        for (const pos of shown) {
          const clue = clues[pos];
          clues[pos] = -1;
          if (!one()) clues[pos] = clue;
        }
        return;
      }
      // A board the deduction finishes has one answer, so the search is asked
      // only of the clue whose loss stops it. A run is hidden at once and
      // gone through a clue at a time only where the deduction stops without
      // it, which leaves the board a clue at a time would.
      const finishes = (): boolean => solveGameActual(board) !== null;
      for (let from = 0; from < shown.length; from += HIDING_RUN) {
        const run = shown.slice(from, from + HIDING_RUN);
        const were = run.map((pos) => clues[pos] as number);
        for (const pos of run) clues[pos] = -1;
        if (finishes()) continue;
        run.forEach((pos, k) => {
          clues[pos] = were[k] as number;
        });
        for (const [k, pos] of run.entries()) {
          clues[pos] = -1;
          if (finishes()) continue;
          if (one()) return;
          clues[pos] = were[k] as number;
        }
      }
    },
    deduced: (board) => solveGameActual(board) !== null,
    answer: searchAnswers,
  }).clues;
}

/**
 * A Normal board's clues: an Easy board's with more hidden while the whole
 * deduction still finishes, kept where one number at a time no longer does.
 * With aggressive generation every clue is tried, as an Easy board's are by
 * upstream's rule. Without it only as many are tried as the board's shorter
 * side, so the board keeps most of its numbers and a large one is dealt in
 * the time a few deductions take.
 *
 * Hiding a clue never makes a board easier, so a comparison needed once is
 * needed on the board that is kept.
 *
 * Measured 2026-10-11, a deal and the steps that compare two numbers on the
 * board dealt, median: 1 ms and 1 at 3×3, 5 ms and 7 at 10×10, 0.4 s and 74
 * at 25×25, 0.9 s at 30×30 and 2.2 s at 35×35; without aggressive generation
 * 1.4 ms and 7 at 10×10, 0.16 s and 161 at 50×50, 1.3 s and 466 at 100×100.
 * Stopping at the first clue whose loss asks for a comparison, as the
 * Unreasonable deal stops at its first, left a 50×50 board one number short
 * of an Easy one.
 */
function normalClues(p: MosaicParams, rng: RandomState): Int8Array {
  const { width, height, aggressive } = p;
  const attempt = retryLimit(`mosaic: Normal generation (${width}x${height})`);
  for (;;) {
    attempt();
    const board: MosaicBoard = { width, height, clues: easyClues(p, rng) };
    const { clues } = board;
    const shown: number[] = [];
    clues.forEach((clue, pos) => {
      if (clue >= 0) shown.push(pos);
    });
    shuffle(shown, rng);
    let compares = false;
    for (const pos of aggressive ? shown : shown.slice(0, Math.min(width, height))) {
      const clue = clues[pos] as number;
      clues[pos] = -1;
      const tier = deductionTier(board);
      if (tier === null) clues[pos] = clue;
      else if (tier === DIFF_NORMAL) compares = true;
    }
    if (compares) return clues;
  }
}

export function newDesc(p: MosaicParams, rng: RandomState): { desc: string } {
  const clues =
    p.diff === DIFF_EASY
      ? easyClues(p, rng)
      : p.diff === DIFF_NORMAL
        ? normalClues(p, rng)
        : unreasonableClues(p, rng);
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
