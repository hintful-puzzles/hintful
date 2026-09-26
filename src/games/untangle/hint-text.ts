/**
 * Every sentence Untangle's hint speaks.
 *
 * Which sentence a step gets is `hint.ts`'s to decide from what it measured;
 * this file decides only how it reads. The counts are the game's own exact
 * crossing test, taken on the board the step applies to.
 */

const NUMBER_WORDS = ["no", "one", "two", "three", "four", "five", "six"] as const;

const crossings = (k: number): string =>
  `${NUMBER_WORDS[k] ?? k} crossing${k === 1 ? "" : "s"}`;

export const say = {
  /** A move that leaves the point's lines in fewer crossings than before. */
  clear: (before: number, after: number): string =>
    after === 0
      ? `This point's lines make ${crossings(before)}. Moved here, they make none.`
      : `This point's lines make ${crossings(before)}. Moved here, they make only ${NUMBER_WORDS[after] ?? after}.`,

  /** No single move helps, so the step heads for the untangled layout. */
  rebuild:
    "No single move reduces the crossings from here, so build toward an untangled layout: this point goes to its place in it.",
};
