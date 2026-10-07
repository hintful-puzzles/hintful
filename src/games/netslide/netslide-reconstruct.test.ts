/**
 * Recovering the finished grid from the board alone — what lets Solve and Hint
 * work on a game that arrived as a shared link or a bookmark, carrying no `aux`.
 * The reported board is `?id=3x3:52h9hbd4h4v34`, a descriptive id.
 */

import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { parseAux } from "./hint.ts";
import { netslideGame } from "./index.ts";
import { findSolutions, isReachable, reconstructSolution } from "./reconstruct.ts";
import {
  isComplete,
  type NetslideMove,
  type NetslideParams,
  type NetslideState,
  newState,
} from "./state.ts";

/** The board from the bug report, as a descriptive id: no `aux` anywhere. */
const REPORTED = { params: "3x3b1", desc: "52h9hbd4h4v34" } as const;
const REPORTED_PARAMS: NetslideParams = {
  w: 3,
  h: 3,
  wrapping: false,
  barrierProbability: 1,
  movetarget: 0,
};

const PRESETS = (netslideGame.presets().submenu ?? [])
  .map((p) => p.params)
  .filter((p): p is NetslideParams => p !== undefined);

/** Every slide the player may legally make. */
function legalMoves(w: number, h: number, cx: number, cy: number): NetslideMove[] {
  const moves: NetslideMove[] = [];
  for (let y = 0; y < h; y++) {
    if (y === cy) continue;
    moves.push({ type: "slide", axis: "row", index: y, dir: 1 });
    moves.push({ type: "slide", axis: "row", index: y, dir: -1 });
  }
  for (let x = 0; x < w; x++) {
    if (x === cx) continue;
    moves.push({ type: "slide", axis: "col", index: x, dir: 1 });
    moves.push({ type: "slide", axis: "col", index: x, dir: -1 });
  }
  return moves;
}

describe("recovering the finished grid", () => {
  it("recovers a grid that really is finished, on every preset", () => {
    for (const params of PRESETS) {
      for (const seed of ["r-a", "r-b", "r-c"]) {
        const { desc } = netslideGame.newDesc(params, randomNew(seed));
        const state = netslideGame.newState(params, desc);

        const grid = reconstructSolution(state);
        expect(
          grid,
          `${params.w}x${params.h}/${seed}: nothing recovered`,
        ).not.toBeNull();
        if (!grid) continue;

        expect(isComplete({ ...state, tiles: grid })).toBe(true);
      }
    }
  });

  it("recovers the generator's own grid when the barriers pin it", () => {
    // At barrier probability 1 every wall the solution permits is drawn in, which
    // pins the answer: the only finished grid is the one the generator made.
    const params: NetslideParams = { ...REPORTED_PARAMS };
    for (const seed of ["pin-a", "pin-b", "pin-c", "pin-d"]) {
      const { desc, aux } = netslideGame.newDesc(params, randomNew(seed));
      const state = netslideGame.newState(params, desc);
      const grid = reconstructSolution(state) as Uint8Array;
      expect(Array.from(grid)).toEqual(
        Array.from(parseAux(aux ?? null, 9) as Uint8Array),
      );
    }
  });

  it("uses the same grid for the whole game, however the board is scrambled", () => {
    // The answer turns only on the tile multiset, the barriers and the center
    // tile, and a slide changes none of them. That is where the hint's stability
    // across recomputes comes from, so it is asserted rather than assumed.
    const { desc } = netslideGame.newDesc(REPORTED_PARAMS, randomNew("stable-1"));
    let at = netslideGame.newState(REPORTED_PARAMS, desc);
    const first = reconstructSolution(at) as Uint8Array;

    const moves = legalMoves(at.w, at.h, at.cx, at.cy);
    for (let i = 0; i < 12; i++) {
      at = netslideGame.executeMove(at, moves[i % moves.length]);
      expect(Array.from(reconstructSolution(at) as Uint8Array)).toEqual(
        Array.from(first),
      );
    }
  });

  it("never picks a finished grid the board cannot actually be slid into", () => {
    // Not every valid-looking answer is reachable. A slide of a line of length k is
    // a k-cycle — even exactly when k is odd — so on a 3×3 *every* move is even and
    // only half the arrangements exist at all. Enumerating a 3×3's whole reachable
    // set gives 20 160 = 8!/2, the alternating group exactly, and a board can easily
    // have valid finished grids outside it. `isReachable` is checked here against
    // brute force, not against theory.
    const boards: NetslideState[] = [];
    for (const params of PRESETS.filter((p) => p.w === 3 && p.h === 3)) {
      for (const seed of ["reach-a", "reach-b", "reach-c"]) {
        const { desc } = netslideGame.newDesc(params, randomNew(seed));
        boards.push(netslideGame.newState(params, desc));
      }
    }
    // The pick is at stake only on a board whose first finished grid is out of
    // reach, and a dealt board is rarely one: 14 of 900 were (2026-10-07), every
    // one of them wrapping. So two are written down, and held to being such a
    // board, or the last assertion below says nothing about the pick.
    for (const desc of ["814cb9726", "3219ec847"]) {
      const state = netslideGame.newState(
        { ...REPORTED_PARAMS, wrapping: true, barrierProbability: 0 },
        desc,
      );
      const [first] = findSolutions(state, 1);
      expect(isReachable(state, first), `${desc}: its first grid is in reach`).toBe(
        false,
      );
      boards.push(state);
    }

    for (const state of boards) {
      const key = (t: ArrayLike<number>) => Array.from(t).join(",");
      const reachable = new Set<string>([key(state.tiles)]);
      let frontier = [state];
      while (frontier.length > 0) {
        const next: typeof frontier = [];
        for (const board of frontier) {
          for (const m of legalMoves(board.w, board.h, board.cx, board.cy)) {
            const slid = netslideGame.executeMove(board, m);
            const k = key(slid.tiles);
            if (reachable.has(k)) continue;
            reachable.add(k);
            next.push(slid);
          }
        }
        frontier = next;
      }

      for (const candidate of findSolutions(state, 200)) {
        expect(
          isReachable(state, candidate),
          "the reachability test disagreed with brute force",
        ).toBe(reachable.has(key(candidate)));
      }

      const picked = reconstructSolution(state) as Uint8Array;
      expect(reachable.has(key(picked)), "picked an unreachable grid").toBe(true);
    }
  });
});

describe("a board with no `aux` at all (the reported bug)", () => {
  it("hints, and following the hint finishes the reported board", () => {
    let at = newState(REPORTED_PARAMS, REPORTED.desc);
    expect(isComplete(at)).toBe(false);

    for (let move = 0; move < 60 && !isComplete(at); move++) {
      const res = netslideGame.hint?.(at, undefined);
      expect(res?.ok, `hint refused after ${move} moves`).toBe(true);
      if (!res?.ok) return;
      expect(res.steps[0].explanation.length).toBeGreaterThan(0);
      at = netslideGame.executeMove(at, res.steps[0].move);
    }
    expect(isComplete(at)).toBe(true);
  });

  it("solves the reported board", () => {
    const at = newState(REPORTED_PARAMS, REPORTED.desc);
    const res = netslideGame.solve?.(at, at, undefined);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    expect(isComplete(netslideGame.executeMove(at, res.move))).toBe(true);
  });

  it("finishes any board on any preset, with nothing but the board to go on", () => {
    // *Solve from any position*: every preset, the generator's answer withheld
    // throughout, and the hint followed the way the midend follows it — a plan is
    // kept while it is being followed, and recomputed when it runs out.
    //
    // Nine tenths of this is the three 5x5 presets (measured 2026-10-07), and
    // they are what it alone catches: no other test follows a hint to the end on
    // a 5x5 that is not wrapping, and `hint-resume.test.ts` names this walk as
    // its cover for the board size it leaves out. Planted the same day, a hint
    // with no exact search stopped finishing on one board of the eighteen, a
    // 5x5 with neither wrapping nor barriers, and no other walk of Netslide's
    // noticed.
    for (const params of PRESETS) {
      const label = `${params.w}x${params.h}${params.wrapping ? "w" : ""}`;
      for (const seed of ["walk-a", "walk-b"]) {
        const { desc } = netslideGame.newDesc(params, randomNew(`${label}-${seed}`));
        let at = netslideGame.newState(params, desc);

        for (let ask = 0; ask < 40 && !isComplete(at); ask++) {
          const res = netslideGame.hint?.(at, undefined);
          expect(res?.ok, `${label}/${seed}: hint gave up`).toBe(true);
          if (!res?.ok) break;

          for (const step of res.steps) {
            at = netslideGame.executeMove(at, step.move);
            if (isComplete(at)) break;
          }
        }
        expect(isComplete(at), `${label}/${seed}: never finished`).toBe(true);
      }
    }
  });
});
