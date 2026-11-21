/**
 * The game registry: `puzzleId` → the game's implementation. Each game
 * registers itself as its module loads, and `src/games/index.ts` loads them
 * all and holds the registry to the catalog.
 */

import { offersSearch } from "../contract/difficulty.ts";
import type { Game } from "../contract/game.ts";
import { type EngineCore, Midend } from "./midend.ts";

const factories = new Map<string, () => EngineCore>();
const games = new Map<string, Game<unknown, unknown, unknown, unknown, unknown>>();

/**
 * Register a game. Generics are inferred from the passed `Game`, so no `any`
 * escapes: the stored factory is `() => EngineCore`.
 *
 * A second game under a claimed id is an error: the copy-paste bug of a game
 * copied without renaming.
 */
export function registerGame<P, S, M, U, D>(game: Game<P, S, M, U, D>): void {
  if (games.has(game.id)) {
    throw new Error(`A game is already registered for "${game.id}"`);
  }
  assertRegistrable(game);
  factories.set(game.id, () => new Midend(game));
  games.set(game.id, game);
}

/**
 * Throws where `game` breaks a rule every registered game keeps. Exported for
 * the skeletons, which are games that never register: the copy of one does.
 */
export function assertRegistrable<P, S, M, U, D>(game: Game<P, S, M, U, D>): void {
  // A pasted board is held to the game's solver through one of the two, and a
  // game that names neither would load every board as if it had been asked.
  const tiered = game.difficulty !== undefined;
  if (tiered === (game.finishesByDeduction !== undefined)) {
    throw new Error(
      tiered
        ? `${game.id}: a game with difficulty tiers is held to them, so it leaves finishesByDeduction out`
        : `${game.id}: a game without difficulty tiers says whether deduction finishes a board (finishesByDeduction), with nothingToDeduce where it deduces nothing`,
    );
  }
  // One way to say a board has no answer: a second could disagree with the first.
  if (game.hasNoSolution !== undefined && game.findMistakes !== undefined) {
    throw new Error(
      `${game.id}: a game with a mistake check says a board has no solution through solve, so it leaves hasNoSolution out`,
    );
  }
  // Repeated hints finish any board: a board with mistakes is cleared, and a
  // board deduction cannot finish is given one element of the answer.
  if (game.findMistakes !== undefined && game.clearMistakes === undefined) {
    throw new Error(
      `${game.id}: a game with a mistake check says how a mistake is taken off (clearMistakes)`,
    );
  }
  // The gesture a hint step is played by is the hint's, or made from its
  // targets through the game's verbs: one or the other, so it is never in doubt.
  const { gesture, targets } = game.hint;
  if ((gesture === undefined) === (targets === undefined)) {
    throw new Error(
      `${game.id}: a hint has its gesture or its targets, one of the two (GameHint.gesture)`,
    );
  }
  if (targets !== undefined && game.targetVerbs === undefined) {
    throw new Error(
      `${game.id}: a hint's targets are played through the game's targetVerbs, which it lacks`,
    );
  }
  if (offersSearch(game) && game.revealOne === undefined) {
    throw new Error(
      `${game.id}: a game with a tier that allows trial and error says how one element of the answer is put on the board (revealOne)`,
    );
  }
}

/** True iff a game is registered for `puzzleId`. */
export function hasTsGame(puzzleId: string): boolean {
  return factories.has(puzzleId);
}

/** Get the registered Game instance for the given puzzle ID. */
export function getTsGame(
  puzzleId: string,
): Game<unknown, unknown, unknown, unknown, unknown> | null {
  return games.get(puzzleId) ?? null;
}

/** All registered puzzle ids. */
export function registeredGameIds(): string[] {
  return [...factories.keys()];
}

/** Construct the engine core for `puzzleId`, or `null` if no game is
 * registered under that id. */
export function createTsEngine(puzzleId: string): EngineCore | null {
  return factories.get(puzzleId)?.() ?? null;
}

/** Test-only: take back a game a test registered. */
export function _unregisterGame(puzzleId: string): void {
  factories.delete(puzzleId);
  games.delete(puzzleId);
}
