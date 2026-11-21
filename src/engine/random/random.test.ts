/*
 * What a generator asks of the RNG: a seed gives the same stream every time, a
 * copy or an encoded state continues it, and a draw stays in its range. Which
 * numbers the stream holds is not pinned: no board a player keeps names a seed
 * (docs/doctrine.md § "Upstream"). A Mines desc dealt before the first click is
 * an RNG state, but the layout it deals also turns on the hint's ladder, which
 * moves it more often than this module ever would.
 */

import { describe, expect, it } from "vitest";
import {
  randomBits,
  randomCopy,
  randomNew,
  randomStateDecode,
  randomStateEncode,
  randomUpto,
} from "./index.ts";

const draws = (seed: string, n: number): number[] => {
  const rs = randomNew(seed);
  return Array.from({ length: n }, () => randomBits(rs, 32));
};

describe("the seeded RNG", () => {
  it("deals the same stream from the same seed, and another from another", () => {
    // 200 draws of 32 bits run through ten refills of the 20-byte buffer.
    expect(draws("alpha", 200)).toEqual(draws("alpha", 200));
    expect(draws("alpha", 200)).not.toEqual(draws("beta", 200));
  });

  it("draws 32 bits as an unsigned value, and fewer within their width", () => {
    const rs = randomNew("width");
    let high = false;
    for (let i = 0; i < 500; i++) {
      const v = randomBits(rs, 32);
      expect(Number.isInteger(v) && v >= 0 && v < 2 ** 32).toBe(true);
      if (v >= 2 ** 31) high = true;
      const narrow = randomBits(rs, 5);
      expect(narrow >= 0 && narrow < 32).toBe(true);
    }
    // A sign-extending draw would never land in the top half.
    expect(high).toBe(true);
  });

  it("draws below a limit, reaching every value", () => {
    const rs = randomNew("upto");
    for (const limit of [1, 2, 3, 7, 10, 1000]) {
      const seen = new Set<number>();
      for (let i = 0; i < 40 * limit; i++) {
        const v = randomUpto(rs, limit);
        expect(Number.isInteger(v) && v >= 0 && v < limit).toBe(true);
        seen.add(v);
      }
      expect(seen.size).toBe(limit);
    }
  });

  it("continues the stream from a copy, which then runs on its own", () => {
    const rs = randomNew("copy");
    randomBits(rs, 24);
    const copy = randomCopy(rs);
    const a = Array.from({ length: 50 }, () => randomBits(rs, 32));
    const b = Array.from({ length: 50 }, () => randomBits(copy, 32));
    expect(b).toEqual(a);
  });

  it("continues the stream from an encoded state", () => {
    const rs = randomNew("encode");
    randomBits(rs, 32);
    randomUpto(rs, 9);
    const decoded = randomStateDecode(randomStateEncode(rs));
    expect(randomStateEncode(decoded)).toBe(randomStateEncode(rs));
    const a = Array.from({ length: 50 }, () => randomBits(rs, 32));
    const b = Array.from({ length: 50 }, () => randomBits(decoded, 32));
    expect(b).toEqual(a);
  });
});
