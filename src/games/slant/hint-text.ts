/**
 * Every sentence Slant's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`hint.ts`'s
 * `narrate` and `vClause`); this file decides only how it reads: indication
 * first, the necessity voice, terse.
 */

/** How a slant reads, by its sign. */
const slashWord = (v: number): string => (v < 0 ? "a backslash" : "a forward slash");

/** A same-slant pair, by whether one mark joins it or a chain of them. */
const pairWord = (chain: boolean): string =>
  chain ? "its chained pair" : "its marked pair";

export const say = {
  // Continuation legs belong to a clue firing (only clue firings force
  // several squares); keep them in the necessity voice.
  /** A later square forced by the same clue; `away` when it slants away. */
  continuation: (away: boolean): string =>
    away
      ? "The same clue forces this square too, so it must slant away."
      : "The same clue forces this square too, so it must slant toward the clue.",

  /** A clue `c` still short of diagonals. */
  clueFill: (c: number): string =>
    c === 4
      ? "A 4 clue must be touched by all four diagonals, so this square must slant toward it."
      : `This ${c} clue still needs a line for every empty square left around it, so each one must slant toward it.`,

  /** A clue `c` already touched by all its diagonals. */
  clueEmpty: (c: number): string => {
    if (c === 0) {
      return "A 0 clue is touched by no diagonals, so every square around it must slant away.";
    }
    const has = c === 1 ? "its one diagonal" : `its ${c} diagonals`;
    return `This ${c} clue already touches ${has}, so every other square around it must slant away.`;
  },

  // A pair slanting alike around a point gives it exactly one line, so the
  // clue counts the pair as one.
  /** A clue `c` still short of diagonals once its same-slant pair is counted. */
  clueFillPair: (c: number, chain: boolean): string =>
    `This ${c} clue gets one line from ${pairWord(chain)} and needs the rest, so every other empty square must slant toward it.`,

  /** A clue `c` whose same-slant pair gives it its last line. */
  clueEmptyPair: (c: number, chain: boolean): string =>
    `This ${c} clue gets its last line from ${pairWord(chain)}, so every other square around it must slant away.`,

  loop: "Two corners of this square are already joined by a chain of diagonals, so it must slant the other way to avoid a loop.",

  deadend:
    "These points have one way out each; linking them here would seal a loop, so this square must slant the other way.",

  /** A square whose same-slant partner `v` is already placed. */
  equiv: (v: number, chain: boolean): string =>
    chain
      ? `A chain of marks links this square to the ringed one, so it must be ${slashWord(v)} too.`
      : `This square is marked to slant the same as the ringed one, so it must be ${slashWord(v)} too.`,

  // --- the same-slant mark, placed as a step -----------------------------

  // "From just these two" is the premise: exactly one of two squares side by
  // side around a point touches it only when they slant the same way.
  /** Two squares around a clue `c` that must share its one remaining line;
   * `pair` when the clue already counts another marked pair as one line. */
  markClue: (c: number, pair: boolean): string =>
    pair
      ? `This ${c} clue gets one line from its marked pair and needs one more from just these two, so they must slant the same way.`
      : `This ${c} clue needs one more line, from just these two empty squares, so they must slant the same way.`,

  /** Two side-by-side squares with both v-shapes ruled out, by one clause
   * each or by one `vBoth` for both. */
  markV: (clauses: string[]): string =>
    `These two can't both ${clauses.join(", or both ")}, so they must slant the same way.`,

  // A v-shape clause says what the pair can't both do at one end of its
  // shared side: touch it, or (which rules out the other v-shape) slant away
  // from it. `where` places that end: "above", "on the left", and so on.
  vClause: {
    one: (where: string): string => `touch the 1 ${where}`,
    three: (where: string): string => `slant away from the 3 ${where}`,
    /** One of the pair is placed and misses the corner `where`. */
    placed: (where: string): string =>
      `touch the corner ${where}, as one already slants away from it`,
    /**
     * Across a 2 `where`: the pair across it gives it at least one line
     * (`touch`: so these two can't both touch it) or at most one (so they
     * can't both slant away from it), because of `end` at the far side; with
     * `line`, the far side is the end of a line of 2s, each passing it on.
     */
    across: (
      touch: boolean,
      where: string,
      end: "one" | "three" | "touches" | "misses",
      line: boolean,
    ): string => {
      const head = touch ? `touch the 2 ${where}` : `slant away from the 2 ${where}`;
      const pair = line
        ? "along the 2s beyond it, the last pair"
        : "the pair across it";
      const one = line
        ? "along the 2s beyond it, one of the last pair"
        : "one of the pair across it";
      const it = line ? "the last 2" : "it";
      const why = {
        one: `${pair} can't both touch the 1`,
        three: `${pair} can't both slant away from the 3`,
        touches: `${one} already touches ${it}`,
        misses: `${one} already slants away from ${it}`,
      }[end];
      return `${head}, as ${why}`;
    },
  },

  /** Both v-shapes ruled out by the same kind of clue, one at each end. */
  vBoth: (digit: number): string =>
    digit === 1 ? "touch either 1" : "slant away from either 3",
};
