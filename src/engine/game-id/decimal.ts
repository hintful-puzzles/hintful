/**
 * **Decimal digits in a game ID**: which character is a digit, what it stands
 * for, and how a run of them reads as an integer.
 *
 * Both halves of a game ID spend digits — a param string is `10x7n12`, and a
 * desc lists clues, counts and coordinates in decimal — so this sits *below*
 * `params.ts` and `desc-alphabet.ts` rather than in either. It is the desc-side
 * twin of `pointer.ts`'s `digitOf`: that answers *which key* is a digit, this
 * answers *which character*.
 *
 * What stays with the game is everything about the puzzle: the **bound** a
 * value must respect (Slant's clues stop at `4`, Bricks' at `7`) and what an
 * out-of-range value *means* (an error message, a sentinel, a clear). The
 * helpers say what a character is worth and never what is legal, exactly as
 * `run-length.ts` leaves each game its own value characters.
 *
 * `decimal.test.ts` guards the collection the way `emittable-keys.test.ts`
 * guards the button codes: no game source may spell a digit's character code
 * as an operand, compare a character against a one-digit string, or declare a
 * private copy of anything exported here. Twelve files each declared their own
 * `isDigit` before this existed, and some forty loops read a digit run by hand
 * under names no name-keyed scan would find.
 */

/**
 * Whether `c` is a decimal digit character.
 *
 * `c` is a character, never "whatever `s[i]` happened to be": `s[i]` past the
 * end of a string is `undefined` at runtime while typed `string`, and the
 * caller holding the index is the one place that knows the length, so the
 * bounds check lives there (`i < s.length && isDigit(s[i])`), as
 * {@link parseLeadingInt} does. Twelve game-local copies accepted
 * `undefined` to let a scan walk off the end unchecked; that is a runtime fact
 * leaking into a signature, and it spreads.
 */
export function isDigit(c: string): boolean {
  return c >= "0" && c <= "9";
}

const ZERO = "0".charCodeAt(0);

/**
 * The value a decimal digit character stands for, or `null` if `c` is not one.
 *
 * The absent case sits outside the return type because a value inside it is
 * one nobody has to check. A `-1` passed every lower-bound test by the
 * coincidence of sitting below the domain, failed silently under `!== 0`, and
 * stored `255` when written into a `Uint8Array`.
 */
export function digitValue(c: string): number | null {
  const v = c.charCodeAt(0) - ZERO;
  return v >= 0 && v <= 9 ? v : null;
}

/**
 * Read the maximal digit run starting at `start`: its integer value (`0` when
 * the run is empty, matching `atoi` on a non-digit) and the index of the first
 * character after it — unchanged from `start` when there was no digit, which
 * is how a caller tells "no number here" from "the number zero".
 */
export function parseLeadingInt(
  s: string,
  start: number,
): { value: number; next: number } {
  let i = start;
  while (i < s.length && isDigit(s[i])) i++;
  return {
    value: Number.parseInt(s.slice(start, i) || "0", 10),
    next: i,
  };
}
