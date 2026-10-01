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
 * `validateDesc` cannot return a sentence a game typed; a game with a reason
 * that is genuinely about its own rules (Mines' first click, a Keen block whose
 * operation needs two cells) says so through {@link puzzleDescError}, and
 * `desc-error.test.ts` fails when two games pass it the same sentence, since
 * then it is not about either puzzle.
 */

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

/** `validateDesc`'s answer from a parse: `null` when it loaded. */
export function descVerdict(parse: DescParse<unknown>): DescError | null {
  return parse.ok ? null : parse.error;
}

/**
 * `newState`'s value from a parse. The midend validates a desc before building
 * from it, so a failure here is a bug in the caller, not a player's typo.
 */
export function descValue<T>(parse: DescParse<T>): T {
  if (!parse.ok) throw new Error(`newState given an invalid desc: ${parse.error}`);
  return parse.value;
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
