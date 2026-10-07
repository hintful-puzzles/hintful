/**
 * Render tier-2.5 tests: drive real frames through a `Midend` with the recording
 * `GameDrawing`, assert the ops that matter, and snapshot the record.
 *
 * This is the guard that Net's rotated-polygon wires, the three color passes
 * (black / powered-cyan / error-red), the endpoint + source boxes, the
 * locked-gray background, and the barrier rectangles are all emitted.
 */

import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { newDesc } from "./generator.ts";
import { netGame } from "./index.ts";
import {
  COL_BARRIER,
  COL_BORDER,
  COL_LOCKED,
  COL_POWERED,
  COL_WIRE,
  FLASH_FRAME,
} from "./render.ts";
import { type NetMove, type NetParams, newState, newUi } from "./state.ts";

/** A reproducible `params:desc` id and the matching state/solve move. */
function board(
  p: NetParams,
  seed: string,
): { id: string; state: ReturnType<typeof newState>; solveMove: NetMove } {
  const { desc } = newDesc(p, randomNew(seed));
  const id = `${netGame.encodeParams(p, true)}:${desc}`;
  const state = newState(p, desc);
  const solveResult = netGame.solve?.(state, state);
  if (!solveResult?.ok) throw new Error("board should be solvable");
  return { id, state, solveMove: solveResult.move };
}

const P5: NetParams = {
  w: 5,
  h: 5,
  wrapping: false,
  barrierProbability: 0,
};
const P5B: NetParams = {
  w: 5,
  h: 5,
  wrapping: false,
  barrierProbability: 1,
};

describe("net render", () => {
  it("opener frame: draws grid borders, wire polygons and the source box", () => {
    const { id } = board(P5, "render-opener");
    const { recording } = renderScenario({ game: netGame, id });
    const ops = recording.ops;

    // Grid lines are rects in the grid color; wires are ink-filled polygons.
    expect(ops.some((o) => o.op === "rect" && o.color === COL_BORDER)).toBe(true);
    expect(ops.some((o) => o.op === "polygon" && o.fill === COL_WIRE)).toBe(true);

    expect(ops).toMatchSnapshot();
  });

  it("solving the board lights more powered wires cyan", () => {
    const { id, solveMove } = board(P5, "render-powered");
    const poweredCount = (ops: readonly { op: string; fill?: number }[]) =>
      ops.filter((o) => o.op === "polygon" && o.fill === COL_POWERED).length;

    // An unsolved board powers only the tiles reachable from the source; a solved
    // board powers every wire, so the count strictly increases.
    const before = renderScenario({ game: netGame, id });
    const after = renderScenario({ game: netGame, id, moves: [solveMove] });
    expect(poweredCount(after.recording.ops)).toBeGreaterThan(
      poweredCount(before.recording.ops),
    );
  });

  it("a locked tile, and no other, is drawn on the lifted surface", () => {
    const { id } = board(P5, "render-locked");
    const lifted = (moves: NetMove[]) =>
      renderScenario({ game: netGame, id, moves }).recording.ops.filter(
        (o) => o.op === "rect" && o.color === COL_LOCKED,
      ).length;
    expect(lifted([])).toBe(0);
    expect(lifted([{ type: "lock", x: 2, y: 2 }])).toBe(1);
  });

  it("a barrier preset draws red barrier rectangles", () => {
    const { id } = board(P5B, "render-barrier");
    const { recording } = renderScenario({ game: netGame, id });
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_BARRIER)).toBe(
      true,
    );
  });

  // When the flash plays (not on Solve) is the engine's, tested in
  // `midend.test.ts`; how long it runs is Net's, sweeping the whole board.
  it("the win flash lasts long enough to sweep the board", () => {
    const { state, solveMove } = board(P5, "render-noflash");
    const solved = netGame.executeMove(state, solveMove);
    expect(netGame.solvedFlash?.(solved, newUi(solved))).toBeCloseTo(
      FLASH_FRAME * (Math.max(solved.w, solved.h) + 4),
    );
  });
});
