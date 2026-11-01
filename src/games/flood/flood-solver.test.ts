// Tier-1 solver tests: the heuristic solver completes every generated
// board, picks a playable color, and stays within the grid-area bound.
import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { executeMove } from "./index.ts";
import { joinedBy } from "./render.ts";
import { choosemove, completed, fill, SolverScratch, solveMoves } from "./solver.ts";
import { type FloodParams, newDesc, newState, positionOf, rulesOf } from "./state.ts";

describe("Flood solver completeness", () => {
  for (const p of [
    { w: 12, h: 12, colors: 6, leniency: 0 },
    { w: 16, h: 16, colors: 6, leniency: 0 },
    { w: 12, h: 12, colors: 3, leniency: 0 },
    { w: 12, h: 12, colors: 4, leniency: 0 },
  ] as FloodParams[]) {
    // Heavy but seed-deterministic: five fixed seeds of generate+solve per
    // preset (16×16c6 is the ~0.65s worst case). A regression fails an assertion
    // below; slowness under contention means nothing, so nothing is clock-gated.
    it(`solves several seeds of ${p.w}x${p.h}c${p.colors}`, () => {
      for (let s = 0; s < 5; s++) {
        const { desc } = newDesc(p, randomNew(`solver-${p.colors}-${p.w}-${s}`));
        const state = newState(p, desc);
        const moves = solveMoves(p.w, p.h, state.grid, state.colors);
        expect(moves.length).toBeGreaterThan(0);
        // Replaying the moves completes the board.
        const grid = Uint8Array.from(state.grid);
        const queue = new Int32Array(p.w * p.h);
        for (const c of moves) {
          expect(c).not.toBe(grid[0]); // never the current corner color
          fill(p.w, p.h, grid, 0, 0, c, queue);
        }
        expect(completed(grid)).toBe(true);
      }
    });
  }
});

describe("Flood's planner", () => {
  // The planner fills in place, as upstream's par is set, and the hint rings
  // what a fill joins: each held to the description's fill.
  it("fills, and rings what joins, as the description's fill does", () => {
    const rng = randomNew("flood planner fill");
    for (const p of [
      { w: 2, h: 3, colors: 3, leniency: 0 },
      { w: 6, h: 5, colors: 4, leniency: 2 },
      { w: 12, h: 12, colors: 6, leniency: 5 },
    ] as FloodParams[]) {
      let state = newState(p, newDesc(p, rng).desc);
      const rules = rulesOf(state);
      for (let step = 0; !completed(state.grid); step++) {
        for (const m of rules.moves(positionOf(state))) {
          const after = rules.play(positionOf(state), m);
          const grid = Uint8Array.from(state.grid);
          fill(p.w, p.h, grid, 0, 0, m.k, new Int32Array(p.w * p.h));
          expect([...grid]).toEqual([...after.color]);
          // What joins is what was outside the region and is inside it after.
          const region = (g: ArrayLike<number>) => {
            const q = Uint8Array.from(g);
            fill(p.w, p.h, q, 0, 0, state.colors, new Int32Array(p.w * p.h));
            return q;
          };
          const before = region(state.grid);
          const joined = [...region(after.color)].flatMap((v, i) =>
            v === state.colors && before[i] !== state.colors ? [i] : [],
          );
          expect(joinedBy(state, m.k)).toEqual(joined);
        }
        const k = solveMoves(p.w, p.h, state.grid, state.colors)[0];
        state = executeMove(state, { type: "fill", color: k });
        expect(step).toBeLessThan(p.w * p.h);
      }
    }
  });
});

describe("Flood look-ahead", () => {
  it("a single choosemove is one of the playable colors", () => {
    const p: FloodParams = { w: 4, h: 4, colors: 4, leniency: 0 };
    const { desc } = newDesc(p, randomNew("lookahead"));
    const state = newState(p, desc);
    const scratch = new SolverScratch(p.w, p.h);
    const move = choosemove(p.w, p.h, state.grid, 0, 0, p.colors, scratch);
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThan(p.colors);
    expect(move).not.toBe(state.grid[0]);
  });

  it("never exceeds the grid-area bound on a small board", () => {
    const p: FloodParams = { w: 6, h: 6, colors: 5, leniency: 0 };
    for (let s = 0; s < 20; s++) {
      const { desc } = newDesc(p, randomNew(`bound-${s}`));
      const state = newState(p, desc);
      const moves = solveMoves(p.w, p.h, state.grid, state.colors);
      expect(moves.length).toBeLessThanOrEqual(p.w * p.h);
    }
  });
});
