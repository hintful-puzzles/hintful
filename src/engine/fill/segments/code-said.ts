/** What a `codes` segment's code stands for, read alike by the segment and
 * by the compiler's check of it. The compiler runs under node's type
 * stripping, so this module imports nothing. */

/** A kind whose number follows the code, or a kind and one of its values
 * (`parity 0`), the code whole. */
export function codeSaid(said: string): { kind: string; value: number | null } {
  const [kind, value] = said.split(" ");
  return { kind, value: value === undefined ? null : Number(value) };
}
