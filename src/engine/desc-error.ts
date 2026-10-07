/**
 * What a game says when a game ID's description will not load.
 *
 * A player meets these in the Enter Game ID dialog, with a typo, a truncated
 * copy or an ID from another puzzle, and what helps is knowing which of those
 * it was. So the kinds are what went wrong from the player's side: a character
 * that cannot be there, a description that ends too soon or runs on too long, a
 * number out of range, a value used twice, clues that contradict each other, or
 * a layout this puzzle's IDs never have. They are worded once here because ~150 messages across 52 games had
 * spelled about six situations (`own-the-player-facing-messages`), "invalid
 * character" alone at least ten ways.
 *
 * **A {@link DescError} is made here or nowhere.** It is a branded string, so
 * a parse cannot fail with a sentence a game typed; a game with a reason
 * that is genuinely about its own rules (Mines' first click, a Keen block whose
 * operation needs two cells) says so through {@link puzzleDescError}, and
 * `desc-error.test.ts` fails when two games pass it the same sentence, since
 * then it is not about either puzzle.
 */

import {
  cappedSolveFor,
  type DifficultyContract,
  difficultyTiers,
  lowestSolvingCap,
  offersSearch,
  tierOf,
} from "./difficulty.ts";
import type { ParamConfigItem } from "./game.ts";
import { MULTIPLE_SOLUTIONS, NO_SOLUTION } from "./solve-failure.ts";

declare const descErrorBrand: unique symbol;

/** A player-facing reason a game ID's description was rejected. */
export type DescError = string & { readonly [descErrorBrand]: true };

function descError(sentence: string): DescError {
  return sentence as DescError;
}

/** The description ends before it has described the whole board. */
export const DESC_TOO_SHORT = descError(
  "This game ID is too short for its board. It may have been cut off when it was copied.",
);

/** The description goes on after the board is full, or has more of something
 * than the board has room for. */
export const DESC_TOO_LONG = descError("This game ID is too long for its board.");

/** A number the description gives is outside what its board allows. */
export const DESC_OUT_OF_RANGE = descError(
  "This game ID has a number out of range for its board.",
);

/** A value that must appear once appears twice (a tile of a sliding puzzle). */
export const DESC_REPEATED = descError("This game ID gives the same number twice.");

/** Clues that are each readable but cannot all hold at once, such as a pair of
 * cells marked both greater and less. */
export const DESC_CONTRADICTORY = descError(
  "The clues in this game ID contradict each other.",
);

/** The description's parts are not where this puzzle's descriptions put them: a
 * separator missing, or a field where another belongs. */
export const DESC_MALFORMED = descError(
  "This game ID isn't laid out the way this puzzle's game IDs are.",
);

/**
 * A character that cannot appear where it does. Name it when the parser has it:
 * a player looking at a long ID finds a named character at once.
 */
export function descBadCharacter(ch?: string): DescError {
  if (ch === undefined)
    return descError("This game ID has a character it can't contain.");
  return descError(`This game ID has "${ch}" where it can't have one.`);
}

/**
 * A board that must have exactly one of something — Inertia's and Sokoban's
 * starting square, Slide's main piece — and has `found` of them. The noun is the
 * game's; the situation is the collection's, which is why three games' own
 * sentences for it were one.
 */
export function descNeedsOne(noun: string, found: number): DescError {
  if (found === 1) throw new RangeError(`descNeedsOne: one ${noun} is not an error`);
  return descError(
    found === 0
      ? `This game ID has no ${noun}.`
      : `This game ID has more than one ${noun}.`,
  );
}

/** A description read once: what it says, or why it will not load. */
export type DescParse<T> = { ok: true; value: T } | { ok: false; error: DescError };

/** A parse's verdict: `null` when it loaded. */
export function descVerdict(parse: DescParse<unknown>): DescError | null {
  return parse.ok ? null : parse.error;
}

/**
 * Why `newState` would not build: the refusal {@link descValue} throws, and the
 * only throw {@link loadDesc} catches. Anything else `newState` throws is a bug
 * and propagates.
 */
class DescRejection extends Error {
  constructor(readonly reason: DescError) {
    super(`a desc that does not load: ${reason}`);
    this.name = "DescRejection";
  }
}

/**
 * The value of a parse, for `newState` to build from. A failed parse throws
 * {@link DescRejection}, which is how the game's one reading of its desc
 * becomes the engine's verdict on it (`loadDesc`): a game writes no validator.
 */
export function descValue<T>(parse: DescParse<T>): T {
  if (!parse.ok) throw new DescRejection(parse.error);
  return parse.value;
}

/** The puzzle has more than one solution. A game whose mistake check compares
 * the board with its answer plays only boards that have exactly one
 * ({@link loadDesc}). */
export const DESC_NOT_UNIQUE = descError(
  "This game ID's puzzle has more than one solution, and only puzzles with exactly one can be played here.",
);

/** The puzzle needs trial and error, in a game that promises deduction
 * finishes every board ({@link loadDesc}). */
export const DESC_NOT_DEDUCIBLE = descError(
  "This game ID's puzzle needs trial and error, and only puzzles that deduction alone solves can be played here.",
);

/** No tier's solver solves the puzzle, in a game whose hardest tier allows
 * trial and error: as far as the game can tell it has several solutions or
 * none ({@link loadDesc}). */
export const DESC_NO_SINGLE_ANSWER = descError(
  "This game ID's puzzle has no single solution that can be found, and only puzzles with exactly one can be played here.",
);

/** What {@link loadDesc} reads off a game: how to build a board, and, for the
 * answer's verdict, its mistake check, its solver and its tiers. */
interface Loadable<P, S> {
  newState(p: P, desc: string): S;
  findMistakes?: unknown;
  solve?(orig: S, curr: S): { ok: true } | { ok: false; error: string };
  finishesByDeduction?(state: S): boolean;
  difficulty?: DifficultyContract<P>;
  paramConfig?: readonly ParamConfigItem<P>[];
}

/** The board a desc describes, or why it describes none: the game's own
 * `newState` reaching {@link descValue}, so the board and the verdict are one
 * reading and cannot disagree. It says nothing about the board's answers, so
 * it is the whole reading only of a desc another one answers for: a save's
 * private desc, whose public one is what {@link loadVerdict} is asked. */
export function readBoard<P, S>(
  game: { newState(p: P, desc: string): S },
  p: P,
  desc: string,
): DescParse<S> {
  try {
    return { ok: true, value: game.newState(p, desc) };
  } catch (e) {
    if (e instanceof DescRejection) return { ok: false, error: e.reason };
    throw e;
  }
}

/**
 * Build state 0 from a desc, or say why it will not load: the board it
 * describes ({@link validateDesc}), then how many answers that board has.
 *
 * **A board with a mistake check has exactly one answer.** Check & Save compares
 * the player's marks with the answer and saves only a board that agrees, so a
 * saved board can always be finished; on a board with two answers it would call
 * a mark that fits the other one a mistake. So where the game's own `solve`
 * proves a board has several answers or none, the board does not load, whoever
 * wrote it.
 *
 * **A board loads only if the game's own solver solves it.** That is the test
 * every generator deals by: some cap of a tiered game's solver solves the
 * board, whatever tier its ID states, or an untiered game's
 * `finishesByDeduction` says its deductions finish it. A tier named
 * Unreasonable is a cap like any other, so a board that needs trial and error
 * loads exactly where the game has such a tier.
 */
export function loadDesc<P, S>(game: Loadable<P, S>, p: P, desc: string): DescParse<S> {
  const read = readBoard(game, p, desc);
  if (!read.ok) return read;
  const refusal =
    answerVerdict(game, read.value) ?? solverVerdict(game, p, desc, read.value);
  return refusal === null ? read : { ok: false, error: refusal };
}

function solverVerdict<P, S>(
  game: Loadable<P, S>,
  p: P,
  desc: string,
  state: S,
): DescError | null {
  const contract = game.difficulty;
  if (contract === undefined)
    return (game.finishesByDeduction?.(state) ?? true) ? null : DESC_NOT_DEDUCIBLE;
  const solve = cappedSolveFor(contract, p, desc);
  if (solve(tierOf(game, p)) === "solved") return null;
  const tiers = difficultyTiers(game) ?? [];
  if (lowestSolvingCap(solve, tiers.length) !== null) return null;
  // With a tier that allows trial and error, needing it is not what is wrong.
  return offersSearch(game) ? DESC_NO_SINGLE_ANSWER : DESC_NOT_DEDUCIBLE;
}

function answerVerdict<P, S>(game: Loadable<P, S>, state: S): DescError | null {
  if (game.findMistakes === undefined || game.solve === undefined) return null;
  const solved = game.solve(state, state);
  if (solved.ok) return null;
  if (solved.error === MULTIPLE_SOLUTIONS) return DESC_NOT_UNIQUE;
  if (solved.error === NO_SOLUTION) return DESC_CONTRADICTORY;
  return null;
}

/** Why `desc` describes no board for `p`, or `null` when it describes one,
 * whatever that board's answers: a codec's verdict. */
export function validateDesc<P>(
  game: { newState(p: P, desc: string): unknown },
  p: P,
  desc: string,
): DescError | null {
  return descVerdict(readBoard(game, p, desc));
}

/** Why `desc` will not load for `p`, or `null` when it does ({@link loadDesc}):
 * the board it describes, and that board's one answer. */
export function loadVerdict<P>(
  game: Loadable<P, unknown>,
  p: P,
  desc: string,
): DescError | null {
  return descVerdict(loadDesc(game, p, desc));
}

/**
 * A reason that is about this puzzle's own rules rather than about the shape of
 * the description: a Keen block whose operation needs two cells, more mines than
 * a safe first click leaves room for. One sentence, ending in a full stop, in the voice of
 * the kinds above ("This game ID …").
 */
export function puzzleDescError(sentence: string): DescError {
  return descError(sentence);
}
