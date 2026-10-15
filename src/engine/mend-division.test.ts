/**
 * Tier-1 tests for the mend of a division, with judges made by hand.
 *
 * What a generator relies on: the regions stay connected and no smaller than
 * the least size, a fixed cell never moves, a mend that reports success
 * leaves a division its judge finishes, a judge that cannot be met is given
 * up and not looped on, and a second answer is broken where the judge says it
 * breaks. Star Battle's generation tests run it with a real ladder.
 */
import { describe, expect, it } from "vitest";
import { type MendJudge, mendDivision } from "./mend-division.ts";
import { randomNew } from "./random/index.ts";
import { adjacentCells } from "./redivide.ts";

const SEEDS = 12;

/** Each region's cells. */
function regionsOf(regions: Int32Array): Map<number, number[]> {
  const out = new Map<number, number[]>();
  regions.forEach((r, i) => {
    const cells = out.get(r) ?? [];
    cells.push(i);
    out.set(r, cells);
  });
  return out;
}

function connected(grid: { w: number; h: number }, cells: readonly number[]): boolean {
  const left = new Set(cells);
  const stack = [cells[0]];
  left.delete(cells[0]);
  for (let i = stack.pop(); i !== undefined; i = stack.pop())
    for (const j of adjacentCells(grid, i)) if (left.delete(j)) stack.push(j);
  return left.size === 0;
}

/** A 6x6 grid in four 3x3 quarters. */
function quarters(): Int32Array {
  return Int32Array.from({ length: 36 }, (_, i) => {
    const x = i % 6;
    const y = (i - x) / 6;
    return (y < 3 ? 0 : 2) + (x < 3 ? 0 : 1);
  });
}

/** Open while region 0 holds more than `most` cells: its cells. */
function shrinkRegionZero(regions: Int32Array, most: number): MendJudge<null> {
  return {
    deduce: () => {
      const cells = regionsOf(regions).get(0) ?? [];
      return { open: cells.length > most ? cells : [], position: null };
    },
    others: () => [],
    tooEasy: null,
  };
}

describe("mendDivision", () => {
  it.each(
    Array.from({ length: SEEDS }, (_, s) => s),
  )("seed %i: a judge that can be met is met, and the division stays whole", (s) => {
    const grid = { w: 6, h: 6 };
    const regions = quarters();
    const fixed = new Set([0, 3, 18, 21]);
    const mended = mendDivision({
      grid,
      regions,
      fixed,
      smallest: 4,
      judge: shrinkRegionZero(regions, 6),
      rng: randomNew(`mend ${s}`),
      spent: { moves: 0 },
    });
    expect(mended).toBe(true);
    const byRegion = regionsOf(regions);
    expect(byRegion.get(0)?.length).toBeLessThanOrEqual(6);
    for (const cells of byRegion.values()) {
      expect(cells.length).toBeGreaterThanOrEqual(4);
      expect(connected(grid, cells)).toBe(true);
    }
    expect([0, 3, 18, 21].map((i) => regions[i])).toEqual([0, 1, 2, 3]);
  });

  it.each(
    Array.from({ length: SEEDS }, (_, s) => s),
  )("seed %i: a judge that cannot be met is given up", (s) => {
    const grid = { w: 6, h: 6 };
    const regions = quarters();
    const mended = mendDivision({
      grid,
      regions,
      fixed: new Set(),
      smallest: 4,
      // Region 0 cannot go below the least size of 4.
      judge: shrinkRegionZero(regions, 2),
      rng: randomNew(`never ${s}`),
      spent: { moves: 0 },
    });
    expect(mended).toBe(false);
    for (const cells of regionsOf(regions).values()) {
      expect(cells.length).toBeGreaterThanOrEqual(4);
      expect(connected(grid, cells)).toBe(true);
    }
  });

  it("a division the easier tier finishes too, with no moves spent, is given up", () => {
    const regions = quarters();
    const judge: MendJudge<null> = {
      deduce: () => ({ open: [], position: null }),
      others: () => [],
      tooEasy: () => true,
    };
    const was = regions.slice();
    const mended = mendDivision({
      grid: { w: 6, h: 6 },
      regions,
      fixed: new Set(),
      smallest: 4,
      judge,
      rng: randomNew("easy"),
      spent: { moves: 0 },
    });
    expect(mended).toBe(false);
    expect(regions).toEqual(was);
  });

  it("a second answer is broken at a cell the judge says breaks it", () => {
    const regions = quarters();
    // Cell 8 (x 2, y 1) is the one that breaks the second answer; until it
    // moves, the deductions leave cell 35 open.
    const judge: MendJudge<null> = {
      deduce: () => ({ open: regions[8] === 0 ? [35] : [], position: null }),
      others: () => [[8]],
      tooEasy: null,
    };
    const mended = mendDivision({
      grid: { w: 6, h: 6 },
      regions,
      fixed: new Set(),
      smallest: 4,
      judge,
      rng: randomNew("other"),
      spent: { moves: 0 },
    });
    expect(mended).toBe(true);
    expect(regions[8]).not.toBe(0);
    expect(regions[35]).toBe(3);
  });
});
