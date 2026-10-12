/**
 * Rome's board generator — port of `rome_generate*` / `new_game_desc` in
 * `puzzles/unreleased/rome.c`.
 *
 * Three stages, then a difficulty gate, retried until one passes:
 *
 * 1. {@link generateArrows} — fill the grid square by square in shuffled
 *    order, taking the first legal arrow from a shuffled direction list and
 *    dropping a **goal** where no arrow is legal, running the Easy solver
 *    after each placement so the partial board stays consistent. A
 *    cluster-avoidance pass steers away from growing runs of three or more
 *    identical arrows.
 * 2. {@link generateRegions} — from single-square regions, join neighboring
 *    regions in a shuffled order (the engine's `mergeNeighbors`) wherever the
 *    two share no arrow and neither is a goal, so a region can never exceed
 *    the four distinct arrows.
 * 3. {@link generateClues} — blank each non-goal clue in shuffled order, and
 *    keep it blanked only while the board still solves at the target
 *    difficulty.
 *
 * The gate then demands the board solve **at** `diff` and **not** at
 * `diff - 1`, so the difficulty is exactly right.
 *
 * Every draw is a `shuffle`, and the solver in between is deterministic, so
 * the description is a pure function of the seed over the bit-identical
 * `random.ts`. That is what the byte-for-byte differential checks, so the
 * draw order and the iteration order here are both fixed.
 */

import { mergeNeighbors } from "../../engine/divide.ts";
import { Dsf } from "../../engine/dsf.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { romeSolve, validateGame } from "./solver.ts";
import {
  cloneState,
  DIFF_EASY,
  EMPTY,
  encodeDesc,
  FM_ARROWMASK,
  FM_DOWN,
  FM_GOAL,
  FM_LEFT,
  FM_RIGHT,
  FM_UP,
  newBoard,
  type RomeParams,
  type RomeState,
  STATUS_COMPLETE,
} from "./state.ts";

/**
 * Detect clusters of identical arrows and suggest, per square, the arrows that
 * would grow one further.
 *
 * Two upstream details here are load-bearing and look like oversights:
 *
 * - **`arrdsf` is never reinitialized** between calls, so merges accumulate
 *   across the whole fill — two squares joined while both were still empty
 *   (empty squares all share an arrow mask of zero, so they *all* merge) stay
 *   joined afterwards. `suggest` likewise accumulates and is never cleared.
 * - **`suggest[i1] |= grid[i2]`** ORs the neighbor's *whole* cell, not just
 *   its arrow bits, so goal and rule-violation bits land in `suggest` too.
 *   They are inert (the only consumer masks against a candidate set that holds
 *   arrow bits alone), but the write is reproduced as-is.
 *
 * Both feed the generator's arrow choices, hence the description.
 */
function joinArrows(board: RomeState, arrdsf: Dsf, suggest: Int32Array): void {
  const { w, h, grid } = board;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w - 1; x++) {
      const i1 = y * w + x;
      if ((grid[i1] & FM_ARROWMASK) === (grid[i1 + 1] & FM_ARROWMASK)) {
        arrdsf.merge(i1, i1 + 1);
      }
    }
  }
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w; x++) {
      const i1 = y * w + x;
      if ((grid[i1] & FM_ARROWMASK) === (grid[i1 + w] & FM_ARROWMASK)) {
        arrdsf.merge(i1, i1 + w);
      }
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i1 = y * w + x;
      if (x < w - 1 && arrdsf.size(i1 + 1) >= 3) suggest[i1] |= grid[i1 + 1];
      if (x > 0 && arrdsf.size(i1 - 1) >= 3) suggest[i1] |= grid[i1 - 1];
      if (y < h - 1 && arrdsf.size(i1 + w) >= 3) suggest[i1] |= grid[i1 + w];
      if (y > 0 && arrdsf.size(i1 - w) >= 3) suggest[i1] |= grid[i1 - w];
    }
  }
}

/** Stage 1: fill every square with an arrow (or a goal where none is legal). */
function generateArrows(board: RomeState, rng: RandomState): boolean {
  const { w, h, grid, pencil } = board;
  const s = w * h;

  const spaces = Array.from({ length: s }, (_, i) => i);
  const arrdsf = new Dsf(s);
  const suggest = new Int32Array(s);
  // Shuffled in place and *not* reset between squares, exactly as upstream's
  // once-allocated array.
  const arrows = [FM_UP, FM_DOWN, FM_LEFT, FM_RIGHT];

  pencil.fill(FM_ARROWMASK);
  shuffle(spaces, rng);

  for (const i of spaces) {
    if (grid[i] !== EMPTY) continue;

    // No arrow can legally go here, so this square becomes a goal.
    if (pencil[i] === EMPTY) {
      grid[i] = FM_GOAL;
      continue;
    }

    joinArrows(board, arrdsf, suggest);

    // Avoid growing a cluster, but only while some other option remains.
    if (pencil[i] & ~suggest[i]) pencil[i] &= ~suggest[i];

    shuffle(arrows, rng);
    grid[i] = arrows.find((arrow) => pencil[i] & arrow) ?? EMPTY;

    // Propagate: this also refreshes `pencil` for the squares still to come.
    romeSolve(board, DIFF_EASY);
  }

  // Keep the number of goal squares to a minimum.
  const goals = grid.filter((c) => c & FM_GOAL).length;
  if (goals > Math.max(1, Math.floor(s / 25))) return false;
  return validateGame(board, false) === STATUS_COMPLETE;
}

/**
 * Stage 2: grow the outlined regions by removing borders at random. Two
 * regions holding the same arrow cannot join, and nor can a goal, which stays
 * alone in a region of one square.
 */
function generateRegions(board: RomeState, rng: RandomState): Dsf {
  const { grid } = board;
  return mergeNeighbors(board, rng, {
    of: (square) => grid[square],
    join: (a, b) => (a & b || (a | b) & FM_GOAL ? null : a | b),
  });
}

/** Stage 3: blank every clue the puzzle can be solved without. */
function generateClues(board: RomeState, rng: RandomState, diff: number): void {
  const { grid } = board;

  const spaces = Array.from({ length: grid.length }, (_, i) => i);
  shuffle(spaces, rng);
  const kept = grid.slice();

  for (const i of spaces) {
    if (grid[i] & FM_GOAL) continue;

    grid[i] = EMPTY;
    const status = romeSolve(board, diff);
    grid.set(kept); // the solver filled the board in; put the clues back

    if (status === STATUS_COMPLETE) {
      grid[i] = EMPTY;
      kept[i] = EMPTY;
    }
  }
}

/**
 * One generation attempt: the three stages plus the exact-difficulty gate.
 * `blank` is a board of one-square regions, which the arrows are laid on, and
 * the board returned is the same squares under the regions of stage 2.
 */
function romeGenerate(
  blank: RomeState,
  rng: RandomState,
  diff: number,
): RomeState | null {
  if (!generateArrows(blank, rng)) return null;
  const board = { ...blank, regions: generateRegions(blank, rng) };
  generateClues(board, rng, diff);

  // It must solve at the target difficulty...
  if (romeSolve(cloneState(board), diff) !== STATUS_COMPLETE) return null;
  // ...and must NOT solve one tier easier, so the tier is exactly right.
  if (diff !== 0 && romeSolve(cloneState(board), diff - 1) === STATUS_COMPLETE)
    return null;
  return board;
}

/** Upstream `new_game_desc`. Retries the whole pipeline until an attempt
 * passes the gate; Rome carries no `aux`, so `solve` re-derives the solution
 * from the clues. */
export function newRomeDesc(p: RomeParams, rng: RandomState): { desc: string } {
  const blank = newBoard(p.w, p.h);
  const attempt = retryLimit("rome: generation");

  for (;;) {
    attempt();
    blank.grid.fill(EMPTY);
    blank.pencil.fill(EMPTY);
    const board = romeGenerate(blank, rng, p.diff);
    if (board) return { desc: encodeDesc(p.w, p.h, board.regions, board.grid) };
  }
}
