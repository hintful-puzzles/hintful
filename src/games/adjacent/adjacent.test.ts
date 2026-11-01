/**
 * Behavioral tests for Adjacent (tier 1 + tier 2.5): what is its own, the bar.
 * The board, its moves, input and keypad it shares with Unequal are tested
 * through Unequal.
 */

import { describe, expect, it } from "vitest";
import { DESC_CONTRADICTORY, validateDesc } from "../../engine/desc-error.ts";
import { cappedSolveFor, lowestSolvingCap } from "../../engine/difficulty.ts";
import { newEdgeClueDesc } from "../../engine/edge-clue-latin/generator.ts";
import {
  COL_ERROR,
  coord,
  PREFERRED_TILE_SIZE,
} from "../../engine/edge-clue-latin/render.ts";
import { solveEdgeClues } from "../../engine/edge-clue-latin/solver.ts";
import {
  diffToLevel,
  type EdgeClueParams,
  type EdgeClueState,
  encodeParams,
  F_ERROR_RIGHT,
  markErrors,
  newState,
  newUi,
} from "../../engine/edge-clue-latin/state.ts";
import { Midend } from "../../engine/index.ts";
import { DIFF_IMPOSSIBLE } from "../../engine/latin.ts";
import { paramsError } from "../../engine/params.ts";
import { CURSOR_LEFT, CURSOR_RIGHT, MOD_SHFT } from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { adjacentGame } from "./index.ts";
import { BARS, decodeParams } from "./state.ts";

function gen(
  order: number,
  diff: EdgeClueParams["diff"],
  seed: string,
): { p: EdgeClueParams; desc: string; st: EdgeClueState } {
  const p: EdgeClueParams = { order, diff };
  const { desc } = newEdgeClueDesc(BARS, p, randomNew(seed));
  return { p, desc, st: newState(BARS, p, desc) };
}

/** The lowest tier whose deductions solve a board, by the game's own contract. */
function lowestCap(p: EdgeClueParams, desc: string): number | null {
  const { difficulty } = adjacentGame;
  if (!difficulty) throw new Error("adjacent: expected a difficulty contract");
  return lowestSolvingCap(cappedSolveFor(difficulty, p, desc), 5);
}

// --- params + codec --------------------------------------------------------

describe("adjacent params", () => {
  it("round-trips, and defaults to 5x5 Normal", () => {
    const a: EdgeClueParams = { order: 5, diff: "tricky" };
    expect(encodeParams(a, true)).toBe("5dk");
    expect(encodeParams(a, false)).toBe("5");
    expect(decodeParams("5dk")).toEqual(a);
    expect(decodeParams("")).toEqual({ order: 5, diff: "easy" });
    // Upstream deals Adjacent as Unequal's mode `a`.
    expect(decodeParams("5adk")).toEqual(a);
  });

  it("refuses a board below 5 at Tricky or above", () => {
    expect(paramsError(adjacentGame, { order: 4, diff: "tricky" }, true)).toBe(
      "Size must be at least 5 for puzzles of this difficulty.",
    );
    expect(paramsError(adjacentGame, { order: 4, diff: "easy" }, true)).toBeNull();
    expect(paramsError(adjacentGame, { order: 5, diff: "tricky" }, true)).toBeNull();
  });
});

describe("adjacent desc codec", () => {
  it("refuses a bar flagged from one end only", () => {
    const p: EdgeClueParams = { order: 4, diff: "easy" };
    const rest = "0,".repeat(14);
    expect(validateDesc(adjacentGame, p, `0R,0L,${rest}`)).toBeNull();
    expect(validateDesc(adjacentGame, p, `0R,0,${rest}`)).toBe(DESC_CONTRADICTORY);
  });
});

// --- generator -------------------------------------------------------------

describe("adjacent generator", () => {
  it("deals every bar the answer makes true, and no other", () => {
    const { st } = gen(5, "tricky", "g-5-adjacent-tricky");
    const soln = Uint8Array.from(st.immutable);
    expect(solveEdgeClues(5, BARS, st.clueFlags, soln, 4)).not.toBe(DIFF_IMPOSSIBLE);
    // With the answer filled in, no gap, barred or not, is in error.
    const solved = { ...st, grid: Int8Array.from(soln) };
    const err = new Int32Array(25);
    expect(adjacentGame.status(solved)).toBe("solved");
    markErrors(solved, err);
    expect(err.every((f) => f === 0)).toBe(true);
  });

  it("generates an exactly-graded board", () => {
    const { p, desc, st } = gen(5, "tricky", "g-5-adjacent-tricky");
    expect(validateDesc(adjacentGame, p, desc)).toBeNull();
    const want = diffToLevel("tricky");
    const soln = Uint8Array.from(st.immutable);
    expect(solveEdgeClues(5, BARS, st.clueFlags, soln, want)).toBe(want);
    expect(lowestCap(p, desc)).toBe(want);
  });

  // The cells where a board of the tier is rare: most deals take more than
  // fifty tries, which is where the generator used to hand back the tier below.
  it.each([
    [5, "extreme"],
    [6, "extreme"],
  ] as const)("deals a rare tier at its tier: %s %s", (order, diff) => {
    for (let seed = 0; seed < 4; seed++) {
      const { p, desc } = gen(order, diff, `rare-${order}-adjacent-${seed}`);
      expect(lowestCap(p, desc), `seed ${seed}`).toBe(diffToLevel(diff));
    }
  });
});

// --- controls ----------------------------------------------------------------

describe("adjacent controls", () => {
  it("marks a bar spent from either of its cells", () => {
    // A bar between (0,0) and (1,0), flagged from both.
    const st = newState(BARS, { order: 3, diff: "trivial" }, "0R,0L,0,0,0,0,0,0,0,");
    const ds = adjacentGame.newDrawState(st, PREFERRED_TILE_SIZE);
    const press = (s: EdgeClueState, x: number, key: number) => {
      const ui = newUi(s);
      ui.cursor = { x, y: 0, visible: true };
      const move = adjacentGame.interpretMove(
        s,
        ui,
        ds,
        { x: 0, y: 0 },
        key | MOD_SHFT,
      );
      if (move === null || typeof move !== "object" || !("type" in move))
        throw new Error("no move");
      return adjacentGame.executeMove(s, move);
    };
    const spent = (s: EdgeClueState) => s.spent.some((f) => f !== 0);
    const once = press(st, 1, CURSOR_LEFT);
    expect(spent(once)).toBe(true);
    expect(spent(press(once, 0, CURSOR_RIGHT))).toBe(false);
  });
});

// --- the error check ---------------------------------------------------------

describe("adjacent errors", () => {
  it("flags two neighbors one apart with no bar between them", () => {
    // A 4x4 with no bars at all: 1 beside 2 breaks the missing bar.
    const st = newState(BARS, { order: 4, diff: "easy" }, "0,".repeat(16));
    st.grid[0] = 1;
    st.grid[1] = 2;
    const err = new Int32Array(16);
    markErrors(st, err);
    expect(err[0] & F_ERROR_RIGHT).toBeTruthy();
  });
});

describe("adjacent mistake overlay", () => {
  it("boxes a wrong number in red, inset in its cell", () => {
    const { desc, st } = gen(5, "tricky", "mistake-paint");
    const o = st.order;
    const soln = Uint8Array.from(st.immutable);
    solveEdgeClues(o, BARS, st.clueFlags, soln, 4);
    const i = [...st.immutable].indexOf(0);
    const x = i % o;
    const y = (i / o) | 0;
    const r = renderScenario({
      game: adjacentGame,
      id: `5dk:${desc}`,
      moves: [{ type: "set", x, y, n: soln[i] === o ? 1 : soln[i] + 1, pencil: false }],
      showMistakes: true,
    });
    expect(r.mistakeCount).toBe(1);
    const corner = [
      coord(x, PREFERRED_TILE_SIZE) + 2,
      coord(y, PREFERRED_TILE_SIZE) + 2,
    ];
    expect(
      r.recording.ops.some(
        (op) =>
          op.op === "polygon" &&
          op.outline === COL_ERROR &&
          op.points[0][0] === corner[0] &&
          op.points[0][1] === corner[1],
      ),
    ).toBe(true);
  });
});

// --- Solve via a real Midend ----------------------------------------------

describe("adjacent Solve via Midend", () => {
  it("solves a freshly generated board, and a save round-trips", () => {
    const me = new Midend(adjacentGame);
    expect(me.newGameFromId("5dk#adjacent-solve")).toBeNull();
    const saved = me.saveGame();
    expect(me.solve()).toBeNull();
    const solved = (me as unknown as { state: EdgeClueState }).state;
    expect(adjacentGame.status(solved)).toBe("solved");
    const me2 = new Midend(adjacentGame);
    expect(me2.loadGame(saved)).toBeNull();
  });
});

// --- tier 2.5: render scenarios --------------------------------------------

describe("adjacent render", () => {
  it("draws the bars", () => {
    const { desc } = gen(5, "tricky", "render-a");
    const r = renderScenario({ game: adjacentGame, id: `5dk:${desc}` });
    // Bars are filled rects in the gaps; the board has many of them.
    const rects = r.recording.ops.filter((o) => o.op === "rect");
    expect(rects.length).toBeGreaterThan(0);
    expect(r.recording.ops).toMatchSnapshot();
  });

  it("writes a bar as | across and - down", () => {
    const st = newState(BARS, { order: 3, diff: "trivial" }, "1R,2DL,3,0,0U,0,0,0,0,");
    expect(adjacentGame.textFormat?.(st)).toBe("1|2 3\n  -  \n. . .\n     \n. . .\n");
  });
});
