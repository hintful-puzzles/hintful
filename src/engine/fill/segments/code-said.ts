/** What a code of a segment's `codes` stands for, read alike by the segment
 * and by the compiler's check of it. The compiler runs under node's type
 * stripping, so this module imports nothing. */

/** What a code stands for: a kind whose number follows the code (`sum`); a
 * kind and one of its values, the code whole (`parity 0`); or that, and a
 * kind whose number may follow it at its element (`block 0, joins`). */
export interface CodeSaid {
  readonly kind: string;
  readonly value: number | null;
  readonly follows: string | null;
}

export function codeSaid(said: string): CodeSaid {
  const [clue, follows] = said.split(", ");
  const [kind, value] = clue.split(" ");
  return {
    kind,
    value: value === undefined ? null : Number(value),
    follows: follows ?? null,
  };
}

/** Whether `code` is a number, which stands in place of a number of the
 * segment's own kind (Bricks' `7`), and not a code a clue is read by. */
export const isNumberCode = (code: string): boolean => /^[0-9]+$/.test(code);
