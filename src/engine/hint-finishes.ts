/**
 * Whether a game's own hint and Solve both finish a board: the answer an
 * untiered deductive game gives `Game.finishesByDeduction` unless it has a
 * cheaper one that is as true.
 *
 * It asks the hint as well as the solver because the hint is what a player is
 * left with when it stops, and a solver can settle a board its hint cannot
 * (docs/games/solver-and-generator.md § "Loading holds a board to the same
 * promise").
 */

import type { GameStatus } from "./types.ts";

/** What {@link hintAndSolveFinish} reads off a game. */
interface Deducing<State, Move> {
  readonly id: string;
  hint?(state: State): { ok: true; steps: { move: Move }[] } | { ok: false };
  solve?(orig: State, curr: State): { ok: boolean };
  executeMove(s: State, m: Move): State;
  status(s: State): GameStatus;
}

/**
 * `Game.finishesByDeduction` for a game that deduces nothing: a sliding
 * puzzle, a search, a guessing game. Its hint walks or searches and its
 * boards are judged by being reachable, so there is no board deduction would
 * leave unfinished, and every board that parses loads.
 *
 * Not for a game whose hint can run out of deduction: that one refuses the
 * board at load, with its own test or {@link hintAndSolveFinish}.
 */
export function nothingToDeduce(): boolean {
  return true;
}

/** Far above any board's plan count: a plan is made again only when the one
 * before it has been played out, and most games plan to the end at once. */
const PLAN_LIMIT = 10_000;

/**
 * Say whether `game`'s Solve answers `state` and its hint, played from there a
 * whole plan at a time, ends on a solved board. A refusal of any kind is a no:
 * a board with no marks on it has no player's mistake for one to be about.
 */
export function hintAndSolveFinish<State, Move>(
  game: Deducing<State, Move>,
  state: State,
): boolean {
  if (game.hint === undefined)
    throw new Error(`${game.id}: hintAndSolveFinish needs a hint`);
  if (game.solve?.(state, state).ok === false) return false;
  let board = state;
  for (let plans = 0; plans < PLAN_LIMIT; plans++) {
    if (game.status(board) === "solved") return true;
    const plan = game.hint(board);
    if (!plan.ok) return false;
    for (const step of plan.steps) board = game.executeMove(board, step.move);
  }
  throw new Error(`${game.id}: ${PLAN_LIMIT} hint plans did not finish the board`);
}
