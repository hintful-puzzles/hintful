import { describe, expect, it } from "vitest";
import { hashWords, PositionStore } from "./position-store.ts";

/** A position of three words, from a number. */
function packed(n: number): Int32Array {
  return Int32Array.from([n, n * 7919, -n]);
}

describe("PositionStore", () => {
  it("finds every position it was given, past its pools' and index's first sizes", () => {
    const store = new PositionStore(3);
    // Past 4,096 positions the pools grow, and the index grows at half full.
    const count = 20_000;
    for (let n = 0; n < count; n++) {
      const p = packed(n);
      expect(store.find(p, hashWords(p, 0, 3))).toBe(-1);
      store.add(p, hashWords(p, 0, 3), n - 1, n % 4, n);
    }
    expect(store.count).toBe(count);
    const out = new Int32Array(3);
    for (let n = 0; n < count; n += 997) {
      const p = packed(n);
      const at = store.find(p, hashWords(p, 0, 3));
      expect(at).toBe(n);
      store.read(at, out);
      expect(Array.from(out)).toEqual(Array.from(p));
      expect(store.depth[at]).toBe(n);
    }
    // One word different is another position.
    const near = Int32Array.from([5, 5 * 7919, -6]);
    expect(store.find(near, hashWords(near, 0, 3))).toBe(-1);
  });

  it("reads the line to a position back from the root, in the order made", () => {
    const store = new PositionStore(3);
    // A chain 0 → 1 → 2 → 3 by moves 2, 0, 1, and a branch off the root.
    const moves = [-1, 2, 0, 1];
    for (let n = 0; n < 4; n++) {
      const p = packed(n);
      store.add(p, hashWords(p, 0, 3), n - 1, moves[n], n);
    }
    const branch = packed(9);
    const b = store.add(branch, hashWords(branch, 0, 3), 0, 3, 1);
    expect(store.lineTo(3)).toEqual([2, 0, 1]);
    expect(store.lineTo(b)).toEqual([3]);
    expect(store.lineTo(0)).toEqual([]);
  });
});
