/**
 * A build that falls back on a value where a placement leaves a square none
 * (`sample.fallback`), and a partition merged on the answer (`deal.merge`),
 * on the `merging` fixture: arrows leading to goals, a goal where no arrow
 * fits and at most one in 25 squares, and areas joined until no two
 * neighbors could join and keep an arrow apiece and every goal alone.
 */

import { describe, expect, it } from "vitest";
import * as merging from "../../generated/engine/testing/fixtures/merging/merging.compiled.ts";
import { newDealCensus, takingCensus } from "../contract/deal-census.ts";
import { randomNew } from "../random/index.ts";
import { type FillBoard, solveBoard } from "./board.ts";
import { fillGame } from "./game.ts";

const game = fillGame("merging", merging);
type Board = FillBoard<merging.Dealt>;

const GOAL = 5;
const SEEDS = Array.from({ length: 12 }, (_, i) => `seed${i}`);
const SIZES = [
  [4, 4],
  [6, 6],
  [8, 5],
] as const;

/** The board dealt `w` by `h` from `seed`, and its answer. */
function dealt(w: number, h: number, seed: string): { b: Board; g: Uint8Array } {
  const p = game.decodeParams(`${w}x${h}`);
  const b = game.newState(p, game.newDesc(p, randomNew(seed)).desc);
  const solved = solveBoard(merging, b, 0);
  expect(solved.verdict).toBe("solved");
  return { b, g: Uint8Array.from(solved.values) };
}

/** Each pair of areas side by side, by their indices, once. */
function neighboringAreas(b: Board): [number, number][] {
  const { of } = b.dealt.area;
  const out = new Map<string, [number, number]>();
  for (let c = 0; c < b.w * b.h; c++)
    for (const n of [
      c % b.w < b.w - 1 ? c + 1 : -1,
      c + b.w < b.w * b.h ? c + b.w : -1,
    ])
      if (n >= 0 && of[c] !== of[n]) {
        const pair: [number, number] = of[c] < of[n] ? [of[c], of[n]] : [of[n], of[c]];
        out.set(pair.join(), pair);
      }
  return [...out.values()];
}

describe("a partition merged on the answer", () => {
  it("leaves an arrow apiece in every area, a goal alone, and no two areas that could join", () => {
    let areas = 0;
    let pairs = 0;
    for (const [w, h] of SIZES)
      for (const seed of SEEDS) {
        const { b, g } = dealt(w, h, seed);
        const { cells } = b.dealt.area;
        for (const part of cells) {
          const values = part.map((c) => g[c]);
          expect(new Set(values).size).toBe(values.length);
          if (values.includes(GOAL)) expect(values).toHaveLength(1);
        }
        // Joined, two neighbors would hold an arrow twice or a goal with
        // another square: what upstream rome.c's regions stop at.
        for (const [r, s] of neighboringAreas(b)) {
          const values = [...cells[r], ...cells[s]].map((c) => g[c]);
          const could =
            new Set(values).size === values.length && !values.includes(GOAL);
          expect(could, `${w}x${h} ${seed}: areas ${r} and ${s}`).toBe(false);
          pairs++;
        }
        areas += cells.length;
      }
    // Merged at all: fewer areas than squares, by far.
    const squares = SIZES.reduce((n, [w, h]) => n + w * h, 0) * SEEDS.length;
    expect(areas).toBeLessThan(squares / 2);
    expect(pairs).toBeGreaterThan(0);
  });
});

describe("a build's fallback", () => {
  it("lays a goal where no arrow fits, one at least and no more than its most", () => {
    for (const [w, h] of SIZES)
      for (const seed of SEEDS) {
        const { g } = dealt(w, h, seed);
        const goals = g.filter((v) => v === GOAL).length;
        expect(goals).toBeGreaterThan(0);
        expect(goals).toBeLessThanOrEqual(Math.max(1, Math.floor((w * h) / 25)));
      }
  });

  it("throws away a build that falls back on more squares than its most", () => {
    // A board under 50 squares may hold one goal, and a build on one of 36
    // or 40 needs two in about one draw in six (2026-11-28).
    const census = newDealCensus();
    takingCensus(census, () => {
      for (const seed of SEEDS) for (const [w, h] of SIZES) dealt(w, h, seed);
    });
    expect(
      census.rejected.get("fill: the build fell back on too many cells"),
    ).toBeGreaterThan(0);
  });
});
