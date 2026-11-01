/**
 * Mosaic's solver and generator: the ladder `mosaic.description.yaml` states,
 * compiled, on the engine's marks and runner (`engine/ladder-runtime.ts`), with
 * the reason each technique records for the hint; the answer check its rules
 * compile to; the search for a board's answers over the ladder; and the
 * generator, which grades every board it deals on the same ladder.
 *
 * Upstream's generator ran its own copy of the first two techniques, with
 * shortcuts for a number that is 0 or fills its block; the ladder fires on
 * those numbers first anyway, so Easy boards are dealt by it too.
 */

import {
  type Answer,
  answerCache,
  type Deduced,
  DIFF_EASY,
  dealUnreasonable,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import { clueList, describedSpace } from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  ladderWalk,
  runLadder,
  TIERS as SCALE,
  type Taken,
} from "../../engine/ladder-runtime.ts";
import { type RandomState, randomBits } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { GameStatus } from "../../engine/types.ts";
import * as mosaic from "./mosaic.compiled.ts";
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

// --- the described ladder ---------------------------------------------------

/** The steps a hint can be, simplest first: two readings of one number,
 * then two of a pair. */
export const MOSAIC_RUNGS = ["met", "needsAll", "needsMore", "sameNeed"] as const;
export type MosaicRung = (typeof MOSAIC_RUNGS)[number];

/**
 * Why a firing decides its squares. Squares and numbers are indices into the
 * board.
 *
 * - `met`: `clue` has its shaded squares, so the rest of its block is clear.
 * - `needsAll`: `clue` needs every square it has left, so they are shaded.
 * - `needsMore`: `clue` needs `by` more shaded squares than `other` does, and
 *   has `by` empty squares outside `other`'s block, which are shaded.
 * - `sameNeed`: `clue` and `other` need the same number more, and `clue` has
 *   no empty square outside `other`'s block, so `other`'s outside `clue`'s
 *   are clear.
 */
export type MosaicReason =
  | { readonly rung: "met" | "needsAll"; readonly clue: number }
  | {
      readonly rung: "needsMore" | "sameNeed";
      readonly clue: number;
      readonly other: number;
      /** The shaded squares `clue` still needs. */
      readonly need: number;
      /** How many more that is than `other` needs: none for `sameNeed`. */
      readonly by: number;
    };

/** The board's numbers as the description reads them. */
function dealtOf(board: MosaicBoard): mosaic.Dealt {
  const at: number[] = [];
  const v: number[] = [];
  board.clues.forEach((n, pos) => {
    if (n < 0) return;
    at.push(pos);
    v.push(n);
  });
  return { count: clueList(at, v, board.clues.length) };
}

/** The ladder over the numbers `dealt` deals. */
function mosaicLadder(dealt: mosaic.Dealt): Ladder {
  return describedLadder(mosaic, {
    alone: compiledRung(
      mosaic.alone,
      dealt,
      ({ c, n }): MosaicReason => ({
        rung: n === 0 ? "met" : "needsAll",
        clue: c,
      }),
    ),
    compared: compiledRung(
      mosaic.compared,
      dealt,
      ({ c, b, n, by }): MosaicReason => ({
        rung: by > 0 ? "needsMore" : "sameNeed",
        clue: c,
        other: b,
        need: n,
        by,
      }),
    ),
  });
}

/** The values a square may hold: shaded or clear. */
const DOMAIN = (1 << STATE_MARKED) | (1 << STATE_BLANK);

/** The marks the ladder reads, on `grid` itself, each square
 * {@link STATE_UNMARKED}, {@link STATE_MARKED} or {@link STATE_BLANK}. */
function marksOf(board: MosaicBoard, grid: Uint8Array): CellMarks {
  const m = new CellMarks(
    describedSpace(mosaic.units, board.width, board.height),
    DOMAIN,
    grid,
  );
  m.seed(grid);
  return m;
}

/** Whether `grid`, every square shaded or clear, is the board's answer. */
function isAnswer(board: MosaicBoard, grid: Uint8Array): boolean {
  return mosaic.isAnswer(
    grid,
    describedSpace(mosaic.units, board.width, board.height),
    dealtOf(board),
  );
}

/** Solved where every square is shaded or clear and the numbers say so, by
 * the rules the description compiles to. */
export function status(state: MosaicState): GameStatus {
  return isAnswer(
    state.board,
    state.cells.map((v) => v & STATE_MARK_MASK),
  )
    ? "solved"
    : "ongoing";
}

/** What deducing on a grid established, and the highest tier that fired. */
interface Deduction {
  verdict: Deduced;
  grade: number;
}

/**
 * Deduce on `grid` in place with the ladder capped at tier `cap`. `fired`,
 * where given, is told each number a firing reads first, as it fires.
 */
function deduceAt(
  board: MosaicBoard,
  grid: Uint8Array,
  cap: number,
  fired: ((clue: number) => void) | null = null,
): Deduction {
  const m = marksOf(board, grid);
  if (fired) {
    m.recorder = (rec) => {
      fired((rec.reason as MosaicReason).clue);
    };
    m.budget = stepBudget("mosaic deduction");
    m.wholePasses = true;
  }
  const grades = { [SCALE]: -1 };
  const { entries } = mosaicLadder(dealtOf(board));
  const impossible = runLadder(
    m,
    ladderTechniques(m, entries, { [SCALE]: cap }, grades),
  );
  const verdict: Deduced = impossible
    ? "contradiction"
    : grid.includes(STATE_UNMARKED)
      ? "stuck"
      : isAnswer(board, grid)
        ? "solved"
        : "contradiction";
  return { verdict, grade: grades[SCALE] };
}

/**
 * Board-side solve: only the clue numbers are known. Returns the solution
 * cells, or `null` when deduction stalls or contradicts.
 */
export function solveGameActual(board: MosaicBoard): Uint8Array | null {
  const cells = new Uint8Array(board.width * board.height);
  return deduceAt(board, cells, DIFF_NORMAL).verdict === "solved" ? cells : null;
}

/**
 * The lowest tier whose deduction finishes `board`: {@link DIFF_EASY} where
 * one number at a time does, {@link DIFF_NORMAL} where two had to be compared,
 * and `null` where the deduction stops short. The ladder compares only where
 * no number decides anything alone, so a comparison made is one needed.
 */
export function deductionTier(board: MosaicBoard): number | null {
  const { verdict, grade } = deduceAt(
    board,
    new Uint8Array(board.width * board.height),
    DIFF_NORMAL,
  );
  return verdict === "solved" ? Math.max(grade, DIFF_EASY) : null;
}

/**
 * The hint's walk over the ladder from `grid`, a copy of the player's marks,
 * one firing a call: the one that carries on from the squares the last
 * decided (`ladderWalk`).
 */
export function mosaicWalk(
  board: MosaicBoard,
  grid: Uint8Array,
): () => Taken | null | "contradiction" {
  const m = marksOf(board, grid);
  m.budget = stepBudget("mosaic hint");
  const { width: w, height: h } = board;
  const block = (c: number): number[] => {
    const out: number[] = [];
    const x = c % w;
    const y = (c / w) | 0;
    for (let j = Math.max(0, y - 1); j <= Math.min(h - 1, y + 1); j++)
      for (let i = Math.max(0, x - 1); i <= Math.min(w - 1, x + 1); i++)
        out.push(j * w + i);
    return out;
  };
  // The blocks of the numbers a firing counts.
  const reads = ({ reasons }: Taken): number[] => {
    const reason = reasons[0] as MosaicReason;
    return "other" in reason
      ? [...block(reason.clue), ...block(reason.other)]
      : block(reason.clue);
  };
  const { entries } = mosaicLadder(dealtOf(board));
  const walk = ladderWalk(m, entries, { [SCALE]: DIFF_NORMAL }, reads);
  return () => walk.next();
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

/**
 * Count a board's answers up to two, by trial and error over the deduction:
 * where it stops, take an empty square of the number with the fewest left to
 * decide and assume it each way.
 */
export function searchAnswers(
  board: MosaicBoard,
  budget: number = SEARCH_BUDGET,
): MosaicAnswer {
  return searchBoard<Uint8Array, Uint8Array>({
    start: new Uint8Array(board.width * board.height),
    deduce: (cells) => deduceAt(board, cells, DIFF_NORMAL).verdict,
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

/** A random picture's clues, every one showing: each the shaded squares of
 * its block, its own included. */
function everyClue(p: MosaicParams, rng: RandomState): Int8Array {
  const { width, height } = p;
  const size = width * height;
  const image = new Uint8Array(size);
  for (let i = 0; i < size; i++)
    image[i] = randomBits(rng, 1) ? STATE_MARKED : STATE_BLANK;
  return Int8Array.from({ length: size }, (_, pos) => {
    const { marked } = countAround(
      width,
      height,
      image,
      pos % width,
      Math.floor(pos / width),
    );
    return marked;
  });
}

/**
 * An Easy board's clues, `-1` where hidden: a random picture's, dealt where
 * one number at a time finishes it, with the numbers that deduction never read
 * hidden. With aggressive generation each number it read is then tried hidden
 * too, in random order, and kept hidden where one number at a time still
 * finishes.
 */
function easyClues(p: MosaicParams, rng: RandomState): Int8Array {
  const { width, height, aggressive } = p;
  const attempt = retryLimit(`mosaic: generation (${width}x${height})`);
  for (;;) {
    attempt();
    const board: MosaicBoard = { width, height, clues: everyClue(p, rng) };
    const { clues } = board;
    const read = new Set<number>();
    const finishes = (into: ((clue: number) => void) | null = null): boolean =>
      deduceAt(board, new Uint8Array(width * height), DIFF_EASY, into).verdict ===
      "solved";
    if (!finishes((clue) => read.add(clue))) continue;
    // Each firing reads only its own number, so the deduction that finished
    // the board finishes it without the numbers it never read.
    for (let pos = 0; pos < clues.length; pos++) if (!read.has(pos)) clues[pos] = -1;
    if (aggressive) {
      const order = [...read];
      shuffle(order, rng);
      for (const pos of order) {
        const clue = clues[pos] as number;
        clues[pos] = -1;
        if (!finishes()) clues[pos] = clue;
      }
    }
    return clues;
  }
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
 * With aggressive generation every clue is tried, as an Easy board's are.
 * Without it only as many are tried as the board's shorter side, so the board
 * keeps most of its numbers and a large one is dealt in the time a few
 * deductions take.
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
