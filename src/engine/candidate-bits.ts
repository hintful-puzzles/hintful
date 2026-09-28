/**
 * The collection's candidate encoding: value `n` is bit `n` of a 32-bit mask,
 * and bit 0 is unused by the games whose values start at 1.
 *
 * Both functions refuse a value the mask cannot hold. A JavaScript shift takes
 * its count mod 32, so `1 << 32` is `1` and `1 << 34` is `4`: an out-of-range
 * value does not fail, it lands on another value's bit, and a render cache keyed
 * on the mask then repaints nothing when the two change places. That is how
 * Solo's 30 and 31 once packed as the hint's target and evidence bits, and how
 * Unequal's order 32 left Mark all filling nothing.
 */

/** The largest value a mask can hold. Bit 31 is the sign of an `Int32Array`,
 * which a key compared with `!==` holds like any other bit. */
export const MAX_CANDIDATE_VALUE = 31;

function checked(n: number): number {
  if (!Number.isInteger(n) || n < 0 || n > MAX_CANDIDATE_VALUE)
    throw new RangeError(`candidate ${n} does not fit a 32-bit mask`);
  return n;
}

/** The bit for value `n`. */
export function valueBit(n: number): number {
  return 1 << checked(n);
}

/** Every value from 1 to `n`: bits 1..n, and never bit 0. Correct at 31, where
 * the familiar `(1 << (n + 1)) - (1 << 1)` wraps to -1 and sets bit 0 too. */
export function valuesOneTo(n: number): number {
  if (checked(n) === 0) return 0;
  return (-1 >>> (MAX_CANDIDATE_VALUE - n)) & ~1;
}
