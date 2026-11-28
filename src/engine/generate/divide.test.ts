/**
 * Tier-1 tests for the division of a grid into unequal regions.
 *
 * What is asserted is what a caller relies on from each walk: every cell in
 * one region, every region connected, the game's rule never broken, and a
 * rule that cannot be met reported and not looped on. The rules here are made
 * by hand. The draws of each walk are not asserted: which board a seed deals
 * is free to change, and Seismic's property tests run on `growToSize`.
 */
import { describe, expect, it } from "vitest";
import { Dsf } from "../board/dsf.ts";
import { randomNew } from "../random/index.ts";
import {
  type DividedGrid,
  growFromSeeds,
  growToSize,
  mergeToCount,
  regionNumbers,
  scatterSeeds,
} from "./divide.ts";
import { adjacentCells } from "./redivide.ts";

const SHAPES: DividedGrid[] = [
  { w: 5, h: 5 },
  { w: 8, h: 6 },
  { w: 10, h: 10 },
  { w: 1, h: 7 },
  { w: 9, h: 1 },
];
const SEEDS = 8;

/** Each region's cells. */
function regionsOf(division: Dsf, p: DividedGrid): number[][] {
  const byRoot = new Map<number, number[]>();
  for (let i = 0; i < p.w * p.h; i++) {
    const root = division.canonify(i);
    const cells = byRoot.get(root);
    if (cells) cells.push(i);
    else byRoot.set(root, [i]);
  }
  return [...byRoot.values()];
}

function connected(p: DividedGrid, cells: readonly number[]): boolean {
  const left = new Set(cells);
  const stack = [cells[0]];
  left.delete(cells[0]);
  for (let i = stack.pop(); i !== undefined; i = stack.pop()) {
    for (const j of adjacentCells(p, i)) if (left.delete(j)) stack.push(j);
  }
  return left.size === 0;
}

/** Whether `cells` go round a cell that is not theirs: the rest of the grid,
 * with a rim of one cell added, is not one piece when cells that touch at a
 * corner count as joined. */
function enclosesAnother(p: DividedGrid, cells: readonly number[]): boolean {
  const W = p.w + 2;
  const H = p.h + 2;
  const mine = new Set(cells.map((i) => (Math.floor(i / p.w) + 1) * W + (i % p.w) + 1));
  const seen = new Set([0]);
  const stack = [0];
  for (let i = stack.pop(); i !== undefined; i = stack.pop()) {
    const x = i % W;
    const y = Math.floor(i / W);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
        const j = yy * W + xx;
        if (mine.has(j) || seen.has(j)) continue;
        seen.add(j);
        stack.push(j);
      }
  }
  return seen.size + mine.size < W * H;
}

/** Every cell in one region, and every region connected. */
function expectDivision(division: Dsf, p: DividedGrid, label: string): number[][] {
  const groups = regionsOf(division, p);
  expect(groups.reduce((n, g) => n + g.length, 0)).toBe(p.w * p.h);
  for (const g of groups)
    expect(connected(p, g), `${label}: ${g.join(",")} is not connected`).toBe(true);
  return groups;
}

function eachDraw(run: (p: DividedGrid, seed: string) => void): void {
  for (const p of SHAPES)
    for (let s = 0; s < SEEDS; s++) run(p, `divide-${p.w}x${p.h}-${s}`);
}

/** A rule on size alone: no region over `most` cells. */
const sizeRule = (most: number) => ({
  of: () => 1,
  join: (a: number, b: number) => (a + b <= most ? a + b : null),
});

describe("mergeToCount", () => {
  it("stops at the count asked for", () => {
    eachDraw((p, seed) => {
      const count = Math.min(3, p.w * p.h);
      const division = mergeToCount(
        p,
        randomNew(seed),
        { of: () => 0, join: () => 0 },
        count,
      );
      if (division === null) throw new Error(`${seed}: a free rule was not met`);
      expect(expectDivision(division, p, seed)).toHaveLength(count);
    });
  });

  it("reports a rule that cannot be met, and does not loop", () => {
    const p = { w: 6, h: 6 };
    const rng = randomNew("unmet");
    // Nothing may join.
    expect(mergeToCount(p, rng, { of: () => 0, join: () => null }, 6)).toBeNull();
    // Pairs at most, so no fewer than eighteen regions.
    expect(mergeToCount(p, rng, sizeRule(2), 17)).toBeNull();
    // More regions than there are to start with.
    expect(mergeToCount(p, rng, sizeRule(2), 37)).toBeNull();
  });

  it("joins scattered tokens two to a region, most times it is asked", () => {
    // Star Battle's rule in small: `2n` one-token regions into `n` regions of
    // exactly two. A join order that ignores how few choices a region has
    // meets this a few times in a hundred.
    const p = { w: 10, h: 10 };
    const rng = randomNew("tokens");
    const TRIES = 40;
    let met = 0;
    for (let t = 0; t < TRIES; t++) {
      const seeds = scatterSeeds(p, 20, rng);
      const division = mergeToCount(
        p,
        rng,
        { from: growFromSeeds(p, seeds, rng), ...sizeRule(2) },
        10,
      );
      if (division === null) continue;
      met++;
      const groups = expectDivision(division, p, `tokens ${t}`);
      expect(groups).toHaveLength(10);
      for (const g of groups)
        expect(g.filter((i) => seeds.includes(i))).toHaveLength(2);
    }
    expect(met).toBeGreaterThan(TRIES / 2);
  });
});

describe("growFromSeeds", () => {
  it("grows one region round each seed, and none encloses another", () => {
    eachDraw((p, seed) => {
      const rng = randomNew(seed);
      const n = Math.max(1, Math.floor((p.w * p.h) / 5));
      const seeds = scatterSeeds(p, n, rng);
      expect(new Set(seeds).size).toBe(n);
      const groups = expectDivision(growFromSeeds(p, seeds, rng), p, seed);
      expect(groups).toHaveLength(n);
      for (const g of groups) {
        expect(
          g.filter((i) => seeds.includes(i)),
          seed,
        ).toHaveLength(1);
        expect(enclosesAnother(p, g), `${seed}: ${g.join(",")}`).toBe(false);
      }
    });
  });

  it("encloses no region over the draws it takes to see one enclosed", () => {
    // Growth that takes a cell wherever a region touches it encloses a
    // region in about one draw of a hundred with two seeds on a 7x7 (3 of
    // 200, measured 2026-10-12), so the shapes above do not see it.
    const p = { w: 7, h: 7 };
    const rng = randomNew("enclose");
    for (let draw = 0; draw < 600; draw++) {
      const division = growFromSeeds(p, scatterSeeds(p, 2, rng), rng);
      for (const g of regionsOf(division, p))
        expect(enclosesAnother(p, g), `draw ${draw}: ${g.join(",")}`).toBe(false);
    }
  });

  it("takes the seeds a game places", () => {
    const p = { w: 4, h: 4 };
    const division = growFromSeeds(p, [0, 15], randomNew("placed"));
    expect(expectDivision(division, p, "placed")).toHaveLength(2);
    expect(division.equivalent(0, 15)).toBe(false);
  });

  it("leaves the cells set aside a region each, and none where they wall a cell off", () => {
    const p = { w: 4, h: 4 };
    // The middle column's top three set aside: the left grows round them.
    const aside = new Set([1, 5, 9]);
    const division = growFromSeeds(p, [0, 3], randomNew("aside"), aside);
    expect(division).not.toBeNull();
    for (const i of aside) expect((division as Dsf).size(i)).toBe(1);
    const grown = (division as Dsf).size(0) + (division as Dsf).size(3);
    expect(grown).toBe(16 - aside.size);
    // A corner cut off by the cells set aside beside it.
    expect(growFromSeeds(p, [15], randomNew("walled"), new Set([1, 4]))).toBeNull();
  });

  it("refuses two seeds on one cell, and more seeds than cells", () => {
    const p = { w: 3, h: 3 };
    expect(() => growFromSeeds(p, [4, 4], randomNew("twice"))).toThrow();
    expect(() => scatterSeeds(p, 10, randomNew("many"))).toThrow();
  });
});

describe("growToSize", () => {
  it("grows no region past the size drawn for it", () => {
    eachDraw((p, seed) => {
      const rng = randomNew(seed);
      const sizes = [2, 3, 5];
      let draws = 0;
      const division = growToSize(p, rng, () => sizes[draws++ % sizes.length]);
      const groups = expectDivision(division, p, seed);
      expect(draws).toBe(groups.length);
      for (const g of groups) expect(g.length, seed).toBeLessThanOrEqual(5);
      // The sizes drawn are reached, and not only undershot.
      if (p.w * p.h >= 25) expect(groups.some((g) => g.length === 5)).toBe(true);
    });
  });

  it("deals single cells at a size of one, and one region at a size of all", () => {
    const p = { w: 5, h: 4 };
    expect(
      regionsOf(
        growToSize(p, randomNew("one"), () => 1),
        p,
      ),
    ).toHaveLength(20);
    expect(
      regionsOf(
        growToSize(p, randomNew("all"), () => 20),
        p,
      ),
    ).toHaveLength(1);
  });
});

describe("regionNumbers", () => {
  it("numbers regions in the order their first cells are read", () => {
    // Columns of a 3x2, joined from the right so no root is a first cell.
    const division = new Dsf(6);
    division.merge(5, 2);
    division.merge(4, 1);
    division.merge(3, 0);
    expect([...regionNumbers(division, 6)]).toEqual([0, 1, 2, 0, 1, 2]);
  });
});
