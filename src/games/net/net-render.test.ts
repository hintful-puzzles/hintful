/**
 * Render tier-2.5 tests: drive real frames through a `Midend` with the recording
 * `GameDrawing`, assert the ops that matter, and snapshot the record.
 *
 * This is the guard that Net's rotated-polygon wires, the three color passes
 * (black / powered-cyan / error-red), the endpoint + source boxes, the
 * locked-gray background, and the barrier rectangles are all emitted.
 */

import { describe, expect, it } from "vitest";
import { DIFF_EASY } from "../../engine/answer-search.ts";
import { randomNew } from "../../engine/random/index.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { expectWinFlashTravels, winFlashRun } from "../../engine/testing/win-flash.ts";
import { type Flash, NO_FLASH } from "../../engine/win-wave.ts";
import { DIRECTIONS, offset, opposite } from "../../engine/wires.ts";
import { newDesc } from "./generator.ts";
import { netGame } from "./index.ts";
import {
  boardMargin,
  COL_BARRIER,
  COL_BORDER,
  COL_LOCKED,
  COL_POWERED,
  COL_WIRE,
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
  diff: DIFF_EASY,
};
const P5B: NetParams = {
  w: 5,
  h: 5,
  wrapping: false,
  barrierProbability: 1,
  diff: DIFF_EASY,
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
});

describe("Net: the win flash spreads from the source along the wires", () => {
  const WRAPPED: NetParams = { ...P5B, w: 6, h: 6, wrapping: true };
  const { state, solveMove } = board(WRAPPED, "render-flash");
  // Solve locks every tile; the top row is unlocked again, so the board
  // has tiles on both surfaces.
  const solved = Array.from({ length: state.w }, (_, x) => x).reduce(
    (s, x) => netGame.executeMove(s, { type: "lock", x, y: 0 }),
    netGame.executeMove(state, solveMove),
  );
  const { w, h } = solved;
  const ui = newUi(solved);

  /** The tiles on the lifted surface in a frame drawn from nothing, by cell. */
  function lifted(flash: Flash): Set<number> {
    const ds = preferredDrawState(netGame, solved);
    const m = boardMargin(ds.tileSize);
    const dr = new RecordingDrawing(netGame.colors(DEFAULT_BACKGROUND));
    netGame.redraw(dr, ds, null, solved, 1, ui, 0, flash);
    return new Set(
      opsOfKind(dr.ops, "rect")
        .filter((o) => o.color === COL_LOCKED)
        .map(
          (o) =>
            Math.floor((o.y - m) / ds.tileSize) * w +
            Math.floor((o.x - m) / ds.tileSize),
        ),
    );
  }
  const settled = lifted(NO_FLASH);
  /** Whether a wire runs from tile `a` into a neighbor in `among`. */
  function wired(a: number, among: ReadonlySet<number>): boolean {
    return DIRECTIONS.some((d) => {
      if (!(solved.tiles[a] & d) || solved.barriers[a] & d) return false;
      const o = offset(a % w, Math.floor(a / w), d, w, h);
      const b = o.y * w + o.x;
      return among.has(b) && (solved.tiles[b] & opposite(d)) !== 0;
    });
  }

  it("lights the source first, then each tile after one its wire comes from", () => {
    expect(netGame.status(solved)).toBe("solved");
    expect(settled.size).toBe(w * (h - 1));
    const source = ui.cy * w + ui.cx;
    // Each tile's distance from the source, a ring of wired tiles at a time.
    const distance = new Map([[source, 0]]);
    for (let d = 1; distance.size < w * h; d++) {
      const reached = new Set(distance.keys());
      const ring = [...solved.tiles.keys()].filter(
        (i) => !reached.has(i) && wired(i, reached),
      );
      expect(ring.length).toBeGreaterThan(0);
      for (const i of ring) distance.set(i, d);
    }
    const run = winFlashRun(
      lifted,
      (frame) =>
        [...solved.tiles.keys()].filter((i) => frame.has(i) !== settled.has(i)),
      150,
    );
    expectWinFlashTravels(run, w * h, (i) => distance.get(i) ?? -1);
    expect(run.frames[0]).toEqual([source]);
  });
});
