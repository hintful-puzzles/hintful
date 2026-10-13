/**
 * Tier-1 tests for the fills a division's regions take.
 *
 * What a renderer relies on: two regions that share a side differ, whatever
 * the division and however few fills; the answer is the division's alone; and
 * the fills are spread, so a board of ten regions is not two colors and a
 * stray third.
 */
import { describe, expect, it } from "vitest";
import { growFromSeeds, regionNumbers, scatterSeeds } from "./divide.ts";
import { randomNew } from "./random/index.ts";
import { regionFills } from "./region-fill.ts";

/** A division of a `w` by `h` grid into `count` regions, drawn from `seed`. */
function division(w: number, h: number, count: number, seed: string): Int32Array {
  const rng = randomNew(seed);
  const p = { w, h };
  return regionNumbers(growFromSeeds(p, scatterSeeds(p, count, rng), rng), w * h);
}

/** How many pairs of cells side by side lie in two regions of one fill. */
function clashes(regions: Int32Array, w: number, fills: Uint8Array): number {
  let n = 0;
  regions.forEach((r, i) => {
    const right = (i + 1) % w === 0 ? r : regions[i + 1];
    const below = i + w < regions.length ? regions[i + w] : r;
    for (const other of [right, below])
      if (other !== r && fills[other] === fills[r]) n++;
  });
  return n;
}

const SHAPES: [w: number, h: number, count: number][] = [
  [5, 5, 5],
  [8, 8, 8],
  [10, 10, 10],
  [14, 14, 14],
  [9, 9, 40],
  [12, 7, 25],
];
const SEEDS = 12;

describe("regionFills", () => {
  it.each([4, 6, 8])("with %i fills, regions sharing a side differ", (k) => {
    let pairs = 0;
    for (const [w, h, count] of SHAPES) {
      for (let s = 0; s < SEEDS; s++) {
        const regions = division(w, h, count, `fill-${s}`);
        const fills = regionFills(regions, w, k);
        expect(fills.length).toBe(count);
        expect(Math.max(...fills)).toBeLessThan(k);
        expect(clashes(regions, w, fills), `${w}x${h}/${count} #${s}`).toBe(0);
        // The walls the claim is about: pairs side by side in two regions.
        regions.forEach((r, i) => {
          if ((i + 1) % w !== 0 && regions[i + 1] !== r) pairs++;
        });
      }
    }
    expect(pairs).toBeGreaterThan(1000);
  });

  it("is the division's alone", () => {
    const regions = division(10, 10, 10, "again");
    expect(regionFills(regions, 10, 6)).toEqual(regionFills(regions, 10, 6));
  });

  it("spreads the fills: none is used twice before each is used once", () => {
    for (let s = 0; s < SEEDS; s++) {
      const regions = division(10, 10, 10, `spread-${s}`);
      const used = new Set(regionFills(regions, 10, 6));
      expect(used.size, `#${s}`).toBe(6);
    }
  });

  it("gives three stripes two fills, and the outer two the same", () => {
    // Regions 0 and 2 never touch, so the one constraint is the middle's.
    const fills = regionFills([0, 1, 2, 0, 1, 2], 3, 2);
    expect(fills[0]).not.toBe(fills[1]);
    expect(fills[2]).not.toBe(fills[1]);
  });

  it("keeps apart two regions that meet at a corner, where a fill is free", () => {
    // A quartered square: each quarter shares a side with two others and
    // meets the fourth at the middle. Two fills would do; with four, the
    // diagonal pairs differ as well.
    const fills = regionFills([0, 1, 2, 3], 2, 4);
    expect(new Set(fills).size).toBe(4);
  });

  it("throws where the division needs more fills than it is given", () => {
    // Three regions each beside the other two.
    expect(() => regionFills([0, 0, 1, 2], 2, 2)).toThrow(/2 fills/);
  });
});
