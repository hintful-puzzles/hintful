/**
 * Two answers to "does deduction finish this board": the one a game that
 * deduces nothing gives `Game.finishesByDeduction`, and the hint's walk a
 * tiered game asks at the tier beneath Unreasonable.
 *
 * A deductive game has tiers, and is held to a pasted board through them
 * (docs/games/solver-and-generator.md § "Giving a deductive game an
 * Unreasonable tier"). What is left without tiers is the games with nothing
 * to deduce, and Mines, whose answer is hidden and whose test is its own.
 */

import type { GameStatus } from "./types.ts";

/** What {@link hintFinishes} reads off a game. */
interface Deducing<State, Move> {
  readonly id: string;
  hint?(state: State): { ok: true; steps: { move: Move }[] } | { ok: false };
  executeMove(s: State, m: Move): State;
  status(s: State): GameStatus;
}

/**
 * `Game.finishesByDeduction` for a game that deduces nothing: a sliding
 * puzzle, a search, a guessing game. Its hint walks or searches and its
 * boards are judged by being reachable, so there is no board deduction would
 * leave unfinished, and every board that parses loads.
 *
 * Not for a game whose hint can run out of deduction: that one has tiers, or
 * a test of its own.
 */
export function nothingToDeduce(): boolean {
  return true;
}

/** Far above any board's plan count: a plan is made again only when the one
 * before it has been played out, and most games plan to the end at once. */
const PLAN_LIMIT = 10_000;

/**
 * Say whether `game`'s hint, played from `state` a whole plan at a time, ends
 * on a solved board. A refusal of any kind is a no: a board with no marks on
 * it has no player's mistake for one to be about. It is what a game with an
 * Unreasonable tier asks at the tier beneath it, beside its solver: the hint
 * is what a player is left with when it stops, and a solver can settle a
 * board its hint cannot.
 */
export function hintFinishes<State, Move>(
  game: Deducing<State, Move>,
  state: State,
): boolean {
  if (game.hint === undefined) throw new Error(`${game.id}: hintFinishes needs a hint`);
  let board = state;
  for (let plans = 0; plans < PLAN_LIMIT; plans++) {
    if (game.status(board) === "solved") return true;
    const plan = game.hint(board);
    if (!plan.ok) return false;
    for (const step of plan.steps) board = game.executeMove(board, step.move);
  }
  throw new Error(`${game.id}: ${PLAN_LIMIT} hint plans did not finish the board`);
}
