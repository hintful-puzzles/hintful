/**
 * What Solve says when it will not solve.
 *
 * `SolveResult`'s error is one of these and nothing else: the type is the
 * union of their literal types, so a game cannot return a sentence of its own.
 * Thirty-three spellings of seven situations were the reason
 * (`own-the-player-facing-messages`), and a player who meets the same situation
 * in two games should read the same words.
 *
 * **A situation a hint can also meet is worded once, for both.** A finished
 * board and a solver that cannot settle the puzzle are the same fact whether
 * the player asked for a hint or for the answer, so {@link ALREADY_SOLVED} and
 * {@link PUZZLE_NOT_REASONABLE} are `hint-refusal.ts`'s, and a hint that must
 * say a position has no way forward says {@link NO_SOLUTION_FROM_HERE}.
 *
 * The midend answers {@link ALREADY_SOLVED} itself for a board whose status is
 * solved, before asking the game, so a `solve` checks for a finished board only
 * where its status would not say so.
 */

import type { ALREADY_SOLVED, PUZZLE_NOT_REASONABLE } from "./hint-refusal.ts";

/**
 * The puzzle has no solution at all. Only a game ID the player typed can be such
 * a puzzle, since every generator deals a solvable one, and only a solver that
 * *proved* it may say it: one that merely failed says
 * {@link PUZZLE_NOT_REASONABLE}, which is true either way.
 */
export const NO_SOLUTION = "This puzzle has no solution.";

/**
 * The puzzle has more than one solution, so there is no single answer to show.
 * Said only by a solver that established it, not by one that gave up.
 */
export const MULTIPLE_SOLUTIONS =
  "This puzzle has more than one solution, so there is no single answer to show.";

/**
 * The player's moves have left a position the solver cannot finish from, in a
 * game whose moves can lose (Inertia's ball, a peg that can no longer be
 * jumped). Worded as what was *found*, because such a solver is usually a
 * heuristic or a bounded search rather than a proof, and the way back is undo.
 */
export const NO_SOLUTION_FROM_HERE =
  "No solution can be found from this position. Undo, and try from an earlier one.";

/**
 * A game with no solver knows its answer only from the generator, and a game ID
 * typed or shared by link does not carry it.
 */
export const SOLUTION_UNKNOWN =
  "This game ID doesn't include its solution, and this puzzle has no solver to work one out.";

/**
 * The board does not exist yet: it is laid out around the player's first move
 * (Mines). A situation rather than a failure, so it says what to do.
 */
export const NOT_STARTED =
  "There is nothing to solve yet: this board is laid out when you make your first move.";

/** Every reason Solve can give for not solving. */
export type SolveFailure =
  | typeof ALREADY_SOLVED
  | typeof PUZZLE_NOT_REASONABLE
  | typeof NO_SOLUTION
  | typeof MULTIPLE_SOLUTIONS
  | typeof NO_SOLUTION_FROM_HERE
  | typeof SOLUTION_UNKNOWN
  | typeof NOT_STARTED;
