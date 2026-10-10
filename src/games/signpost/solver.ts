/**
 * Signpost solver — the single forced-link deduction iterated to a
 * fixpoint (upstream `solve_single` + `solve_state`).
 *
 * The one rule: if a cell has exactly one legal cell it may link *to*,
 * make that link; symmetrically, if exactly one cell may link *to* a
 * given cell, make that link. Iterating this with `updateNumbers`
 * solves every Easy board, which is what Easy means: the generator keeps
 * a board at that tier only where this does. An Unreasonable board is one
 * the search at the foot of this file proves has a single answer that this
 * stops short of.
 */

import {
  type Answer,
  answerCache,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import {
  assignStateInto,
  checkCompletion,
  cloneState,
  DXS,
  DYS,
  isValidMove,
  makeLink,
  type SignpostState,
  stripNums,
  updateNumbers,
} from "./state.ts";

/**
 * The squares cell `i`, which has no link out, may link to: those its arrow
 * points at that the move is valid to and nothing links to yet, nearest
 * first. `numbered` says the last of them holds `i`'s number plus one, which
 * settles the link and ends the walk there.
 */
function successors(
  state: SignpostState,
  i: number,
): { walked: number[]; numbered: boolean } {
  const { w, n } = state;
  const d = state.dirs[i];
  const walked: number[] = [];
  const sx = i % w;
  const sy = Math.floor(i / w);
  let x = sx;
  let y = sy;
  for (;;) {
    x += DXS[d];
    y += DYS[d];
    if (x < 0 || x >= w || y < 0 || y >= state.h) break;
    if (!isValidMove(state, true, sx, sy, x, y)) continue;

    const j = y * w + x;
    if (state.prev[j] !== -1) continue; // can't break a back-link

    walked.push(j);
    if (
      state.nums[i] > 0 &&
      state.nums[j] > 0 &&
      state.nums[i] <= n &&
      state.nums[j] <= n &&
      state.nums[j] === state.nums[i] + 1
    )
      return { walked, numbered: true };
  }
  return { walked, numbered: false };
}

/** Make every forced link. Reads `state`, writes links into `copy`;
 * returns the number of links made, or -1 if a contradiction is found.
 * `from[j]` collects the sole cell that may link to j (-1 none, -2 several). */
function solveSingle(
  state: SignpostState,
  copy: SignpostState,
  from: Int32Array,
): number {
  const { n } = state;
  let nlinks = 0;
  from.fill(-1);

  // For each cell, find its sole legal successor.
  for (let i = 0; i < n; i++) {
    if (state.next[i] !== -1) continue;
    if (state.nums[i] === n) continue; // no next from the last number

    const { walked, numbered } = successors(state, i);
    let poss = -1; // -1 none, -2 several
    for (const j of walked) {
      poss = poss === -1 ? j : -2;
      from[j] = from[j] === -1 ? i : -2;
    }
    if (numbered) {
      // The squares walked before it stay marked as ones `i` may lead to,
      // as upstream leaves them.
      poss = walked[walked.length - 1];
      from[poss] = i;
    }
    if (poss === -1) {
      copy.impossible = true;
      return -1;
    }
    if (poss !== -2) {
      makeLink(copy, i, poss);
      nlinks++;
    }
  }

  // For each cell, find its sole legal predecessor.
  for (let i = 0; i < n; i++) {
    if (state.prev[i] !== -1) continue;
    if (state.nums[i] === 1) continue; // no prev from the first number

    if (from[i] === -1) {
      copy.impossible = true;
      return -1;
    }
    if (from[i] !== -2) {
      makeLink(copy, from[i], i);
      nlinks++;
    }
  }

  return nlinks;
}

/**
 * Solve `state` in place. Returns 1 if solved, 0 if stuck, -1 if
 * impossible. Mirrors upstream `solve_state`.
 */
export function solveState(state: SignpostState): number {
  const copy = cloneState(state);
  const scratch = new Int32Array(state.n);

  do {
    updateNumbers(state);
    if (!solveSingle(state, copy, scratch)) break;
    assignStateInto(state, copy);
  } while (!state.impossible);

  updateNumbers(state);
  if (state.impossible) return -1;
  return checkCompletion(state, false) ? 1 : 0;
}

/** Whether the forced links finish the board from its arrows and its given
 * numbers. The player's links are not read. */
export function solverFinishes(board: SignpostState): boolean {
  const copy = cloneState(board);
  stripNums(copy);
  return solveState(copy) > 0;
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a board's answers; the one answer is each
 * square's link out, -1 for the last. */
export type SignpostAnswer = Answer<Int32Array>;

/**
 * The positions a search may try before it gives up, each one a square
 * assumed to link to one of the squares it could and the solver run from it.
 *
 * It decides which Unreasonable boards exist: a board that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a board's answers up to two, by trial and error over the solver:
 * where it stops, take the square with the fewest squares it could link to
 * and assume each in turn, nearest first. `board` is read for its arrows and
 * its given numbers only.
 */
export function searchAnswers(
  board: SignpostState,
  budget: number = SEARCH_BUDGET,
): SignpostAnswer {
  const start = cloneState(board);
  stripNums(start);
  start.impossible = false;
  return searchBoard<SignpostState, Int32Array>({
    start,
    deduce(position) {
      const verdict = solveState(position);
      return verdict > 0 ? "solved" : verdict < 0 ? "contradiction" : "stuck";
    },
    assume: assumeLink,
    solution: (position) => position.next,
    budget,
  });
}

/**
 * The positions a stuck one divides into: one square without a link out,
 * linked to each square it could link to. Every answer links it to exactly
 * one of them. The square is the one with the fewest, where a wrong link is
 * likeliest to be found at once.
 */
function assumeLink(position: SignpostState): SignpostState[] {
  const { n } = position;
  let at = -1;
  let fewest: number[] = [];
  for (let i = 0; i < n; i++) {
    if (position.next[i] !== -1 || position.nums[i] === n) continue;
    const { walked } = successors(position, i);
    if (at >= 0 && walked.length >= fewest.length) continue;
    at = i;
    fewest = walked;
  }
  return fewest.map((to) => {
    const linked = cloneState(position);
    makeLink(linked, at, to);
    return linked;
  });
}

/** Keyed on a state's arrows, which every state of a game shares. */
const answers = answerCache<Int8Array, Int32Array>();

/** What a search of a state's arrows and given numbers established about
 * their answers. The player's links are not read. */
export function answerOf(state: SignpostState): SignpostAnswer {
  return answers(state.dirs, () => searchAnswers(state));
}
