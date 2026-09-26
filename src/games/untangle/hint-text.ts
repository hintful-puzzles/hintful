/**
 * Every sentence Untangle's hint speaks.
 *
 * Which sentence a step gets is `hint.ts`'s to decide from what it measured;
 * this file decides only how it reads. The counts are the game's own exact
 * crossing test, taken on the board the step applies to, and are written as
 * numerals so a sentence never mixes "12" with "three".
 */

export const say = {
  /** A move that leaves the point's lines in fewer crossings than before. */
  clear: (before: number, after: number): string => {
    if (after > 0)
      return `Moving this point here cuts its crossings from ${before} to ${after}.`;
    if (before === 1) return "Moving this point here clears its only crossing.";
    if (before === 2) return "Moving this point here clears both of its crossings.";
    return `Moving this point here clears all ${before} of its crossings.`;
  },

  /**
   * A move taken when the search found none that removes a crossing: what it
   * does to the point's own crossings (never fewer — that would be `clear`),
   * and, when the very next step removes some, how many. Only what the player
   * can see on the board: the solved layout the move heads for is not.
   */
  rearrange: (before: number, after: number, opens: number | null): string => {
    const change =
      after === before
        ? before === 0
          ? "keeps its lines clear"
          : `keeps its crossings at ${before}`
        : `raises its crossings from ${before} to ${after}`;
    // The payoff, when there is one, is the reason for the move; without one,
    // the reason is that nothing better was found.
    return opens === null
      ? `No single move cuts the crossings from here. Moving this point here ${change}.`
      : `Moving this point here ${change}, but frees a move that removes ${opens}.`;
  },

  /**
   * A leg of a journey that moves several marked points so that none of their
   * lines crosses anything. The first leg says what the whole journey does —
   * clears every crossing on the board, or every crossing the marked points
   * are in — and each leg what its own move does to its point's crossings,
   * which may rise on the way while the other marked points are still to move.
   */
  journey: (
    leg: number,
    legs: number,
    finishes: boolean,
    before: number,
    after: number,
  ): string => {
    const change =
      after === 0
        ? before === 0
          ? "its lines stay clear"
          : before === 1
            ? "it clears its only crossing"
            : before === 2
              ? "it clears both of its crossings"
              : `it clears all ${before} of its crossings`
        : after < before
          ? `it cuts its crossings from ${before} to ${after}`
          : after === before
            ? `it keeps its crossings at ${before}`
            : `it raises its crossings from ${before} to ${after}`;
    if (leg === 0) {
      const what = finishes
        ? "clears every crossing"
        : "clears every crossing they are in";
      return `Moving the ${legs} marked points ${what}. This one first: ${change}.`;
    }
    return leg === legs - 1
      ? `The last marked point: ${change}.`
      : `The next marked point: ${change}.`;
  },
};
