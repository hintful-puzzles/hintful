/*
 * Twiddle's proof that no turns put a board in order (`hasNoSolution`).
 *
 * The proof is three things every turn keeps. It must never hold for a board
 * turns do reach, which is checked against the turns themselves, and each of
 * the three must be what refuses some board, which is one board apiece.
 */
import { describe, expect, it } from "vitest";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { twiddleGame } from "./index.ts";
import { decodeParams, hasNoSolution, newState, type TwiddleState } from "./state.ts";

function solved(params: string): TwiddleState {
  const p = decodeParams(params);
  const wh = p.w * p.h;
  const tiles = Array.from({ length: wh }, (_, i) =>
    String(p.rowsonly ? Math.floor(i / p.w) + 1 : i + 1),
  );
  const desc = p.orientable ? tiles.map((t) => `${t}u`).join("") : tiles.join(",");
  return newState(p, desc);
}

function turned(s: TwiddleState, x: number, y: number, dir: 1 | -1): TwiddleState {
  return twiddleGame.executeMove(s, { type: "rotate", x, y, dir });
}

const keyOf = (s: TwiddleState) => `${s.numbers.join(",")}|${s.orient.join("")}`;

/** Every board turns reach from the solved one. */
function reachable(params: string): Map<string, TwiddleState> {
  const start = solved(params);
  const seen = new Map([[keyOf(start), start]]);
  const queue = [start];
  for (let s = queue.pop(); s; s = queue.pop()) {
    for (let y = 0; y + s.n <= s.h; y++) {
      for (let x = 0; x + s.n <= s.w; x++) {
        const next = turned(s, x, y, 1);
        if (seen.has(keyOf(next))) continue;
        seen.set(keyOf(next), next);
        queue.push(next);
      }
    }
  }
  return seen;
}

describe("Twiddle's proof that a board has no solution", () => {
  it("holds for no board the turns reach, on boards small enough to list", () => {
    // Each flag and each parity of block.
    let listed = 0;
    for (const params of ["3x2n2", "3x2n2r", "3x2n2o", "2x2n2o", "3x3n3", "3x3n3o"]) {
      const boards = reachable(params);
      expect(boards.size, params).toBeGreaterThan(1);
      listed += boards.size;
      const refused = [...boards.values()].filter(hasNoSolution).map(keyOf);
      expect(refused, params).toEqual([]);
    }
    // 3x2n2 alone reaches 120 boards, a sixth of its arrangements: the proof
    // passes the other five sixths, and nothing here says it should not.
    expect(listed).toBeGreaterThan(120);
  });

  it("holds for no board a long shuffle reaches, at every size and flag offered", () => {
    let walked = 0;
    for (const params of [
      "3x3n2r",
      "3x3n2o",
      "4x4n2",
      "4x4n3",
      "4x4n3o",
      "5x5n3",
      "5x5n3r",
      "6x6n4",
      "6x6n4o",
      "6x6n6",
      "7x7n5o",
    ]) {
      const rng = randomNew(`twiddle-no-solution-${params}`);
      let s = solved(params);
      for (let i = 0; i < 200; i++) {
        const x = randomUpto(rng, s.w - s.n + 1);
        const y = randomUpto(rng, s.h - s.n + 1);
        s = turned(s, x, y, randomUpto(rng, 2) === 0 ? 1 : -1);
        walked++;
        expect(hasNoSolution(s), `${params} after ${i + 1} turns`).toBe(false);
      }
    }
    expect(walked).toBe(2200);
  });

  const board = (params: string, desc: string) => newState(decodeParams(params), desc);

  it("refuses a tile off its color of the checkerboard, under a block of odd side", () => {
    // 1 and 2 swapped, and 8 and 9: two swaps make an even arrangement, so
    // only the four tiles off their color refuse it.
    expect(hasNoSolution(board("3x3n3", "2,1,3,4,5,6,7,9,8"))).toBe(true);
    // With one number to a row, a 1 and a 2 that change places across colors
    // are refused, and a pair that keeps to one color is not.
    expect(hasNoSolution(board("3x3n3r", "2,1,1,1,2,2,3,3,3"))).toBe(true);
    expect(hasNoSolution(board("3x3n3r", "1,2,1,1,2,2,3,3,3"))).toBe(false);
  });

  it("refuses an odd arrangement, where every turn is even", () => {
    // 1 and 3 swapped: both corners, so each stays on its color.
    expect(hasNoSolution(board("3x3n3", "3,2,1,4,5,6,7,8,9"))).toBe(true);
    expect(
      hasNoSolution(board("4x4n4", "3,2,1,4,5,6,7,8,9,10,11,12,13,14,15,16")),
    ).toBe(true);
    // A block of side 2 is one cycle of four, which is odd: nothing is claimed.
    expect(hasNoSolution(board("3x3n2", "3,2,1,4,5,6,7,8,9"))).toBe(false);
    // Nor where two tiles share a number, which a swap of them hides.
    expect(hasNoSolution(board("3x3n3r", "1,1,1,2,2,2,3,3,3"))).toBe(false);
  });

  it("refuses a tile whose turns and color disagree, under a block of even side", () => {
    // Two tiles a quarter turn round, opposite ways, and every tile at home:
    // the turns add up to none, so only each tile's own parity refuses it.
    expect(hasNoSolution(board("2x2n2o", "1l2r3u4u"))).toBe(true);
  });

  it("refuses turns that do not add up to whole ones, under a block of even side", () => {
    // One tile a half turn round: its color and its turns still agree.
    expect(hasNoSolution(board("2x2n2o", "1d2u3u4u"))).toBe(true);
    expect(hasNoSolution(board("2x2n2o", "1d2d3u4u"))).toBe(false);
  });
});
