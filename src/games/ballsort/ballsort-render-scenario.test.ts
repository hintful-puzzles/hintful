/**
 * Ball Sort's frames: the run picked up, a pour mid-flight, and the board a
 * pour settles on.
 */
import { describe, expect, it } from "vitest";
import { LEFT_BUTTON, LEFT_RELEASE } from "../../engine/input/pointer.ts";
import { NO_FLASH } from "../../engine/render/win-wave.ts";
import {
  type DrawOp,
  RecordingDrawing,
} from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { ballsortGame as G } from "./index.ts";
import {
  COL_BALL,
  COL_HELD,
  newDrawState,
  POUR_SECONDS,
  PREFERRED_TILE_SIZE,
  redraw,
  tubeAt,
  tubeCenter,
} from "./render.ts";
import { decodeParams, encodeDesc, newState, newUi, poured } from "./state.ts";

const PARAMS = "5h4e1";
const DESC = "caae,dada,ecbc,bdbe,debc,";
const ID = `${PARAMS}:${DESC}`;
const TS = PREFERRED_TILE_SIZE;

const discs = (ops: readonly DrawOp[], color: number) =>
  ops.filter(
    (o): o is Extract<DrawOp, { op: "circle" }> =>
      o.op === "circle" && o.fill === color,
  );

describe("Ball Sort's frames", () => {
  it("lifts the run a tap picks up, ringed", () => {
    const s = newState(decodeParams(PARAMS), DESC);
    const at = tubeCenter(s, TS, 0);
    const idle = renderScenario({ game: G, id: ID });
    const held = renderScenario({
      game: G,
      id: ID,
      presses: [LEFT_BUTTON, LEFT_RELEASE],
      at,
    });
    expect(discs(idle.recording.ops, COL_HELD)).toEqual([]);
    // Tube 0's top run is the one c: one ball held.
    expect(discs(held.recording.ops, COL_HELD)).toHaveLength(1);
  });

  it("never pours a ball down through the tube it leaves, into the tube below", () => {
    const p = decodeParams(PARAMS);
    const before = newState(p, DESC);
    // Tube 5 stands right below tube 2 in a board of two rows of three.
    expect(tubeAt(before, TS, 5).col).toBe(tubeAt(before, TS, 2).col);
    const after = poured(before, { type: "pour", from: 2, to: 5 });
    const teal = COL_BALL + 3 - 1;
    const { inside } = tubeAt(before, TS, 2);
    const within = (o: { cx: number; cy: number }) =>
      o.cx >= inside.x &&
      o.cx <= inside.x + inside.w &&
      o.cy >= inside.y &&
      o.cy <= inside.y + inside.h;
    let frames = 0;
    for (let k = 3; k < 10; k++) {
      const rec = new RecordingDrawing(G.colors(DEFAULT_BACKGROUND));
      const t = (k / 10) * POUR_SECONDS;
      redraw(rec, newDrawState(after, TS), {
        prev: before,
        state: after,
        dir: 1,
        ui: newUi(after),
        animTime: t,
        flash: NO_FLASH,
      });
      // The teal ball still in tube 2, and no other.
      expect(discs(rec.ops, teal).filter(within), `${t}s`).toHaveLength(1);
      frames++;
    }
    expect(frames).toBe(7);
  });

  it("settles a pour on the frame the poured board paints", () => {
    const after = poured(newState(decodeParams(PARAMS), DESC), {
      type: "pour",
      from: 2,
      to: 5,
    });
    const sorted = (ops: readonly DrawOp[]) =>
      ops
        .filter((o) => o.op === "circle")
        .map((o) => JSON.stringify(o))
        .sort();
    const played = renderScenario({
      game: G,
      id: ID,
      moves: [{ type: "pour", from: 2, to: 5 }],
      settle: true,
    });
    const loaded = renderScenario({ game: G, id: `${PARAMS}:${encodeDesc(after)}` });
    expect(sorted(played.recording.ops)).toEqual(sorted(loaded.recording.ops));
  });
});
