// Tier-2 render test: drive Same Game's `redraw` against a recording
// `GameDrawing` double and assert the draw-call structure — the framed
// field, the seamless join fill between same-color neighbors, the
// selection outer rect (COL_SEL), and the stuck board's inner recolor
// (COL_INK).
import { describe, expect, it } from "vitest";
import { newCursor } from "../../engine/pointer.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { expectWinFlashTravels, winFlashRun } from "../../engine/testing/win-flash.ts";
import { type Flash, NO_FLASH, ownFlash, sweepStep } from "../../engine/win-wave.ts";
import { samegameGame } from "./index.ts";
import {
  COL_FLASH,
  COL_LIFTED,
  FLASH_FRAME,
  newDrawState,
  redraw,
  type SamegameDrawState,
} from "./render.ts";
import {
  newState,
  type SamegameParams,
  type SamegameState,
  type SamegameUi,
} from "./state.ts";

const PALETTE = samegameGame.colors(DEFAULT_BACKGROUND);

function recordingDrawing(): { dr: RecordingDrawing; ops: RecordingDrawing["ops"] } {
  const dr = new RecordingDrawing(PALETTE);
  return { dr, ops: dr.ops };
}

const TS = 32; // tilegap = 2, tileinner = 30, TILE_SIZE = 32.

function freshDs(state: SamegameState): SamegameDrawState {
  const ds = newDrawState(state, TS);
  return ds;
}

function mkState(desc: string, p?: Partial<SamegameParams>): SamegameState {
  return newState({ w: 2, h: 1, ncols: 3, scoresub: 2, ...p }, desc);
}

function emptyUi(state: SamegameState): SamegameUi {
  return {
    selected: new Array<boolean>(state.w * state.h).fill(false),
    nselected: 0,
    cursor: newCursor(),
  };
}

describe("Same Game redraw", () => {
  it("frames the field with a line and no bevel", () => {
    const state = mkState("1,2");
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 1, emptyUi(state), 0, NO_FLASH);
    expect(ops.some((o) => o.op === "polygon")).toBe(false);
    // The frame (COL_GRID = 14), then the field one pixel inside it
    // (COL_CELL = 12): 2 tiles and a gap wide, plus the frame's two pixels.
    const [frame, field] = ops;
    expect(frame).toMatchObject({ op: "rect", color: 14, w: 2 * TS + 2 + 2 });
    expect(field).toMatchObject({ op: "rect", color: 12, w: 2 * TS + 2 });
  });

  it("draws an emptied cell as the field's own surface", () => {
    const dealt = mkState("1,2");
    const state = { ...dealt, tiles: dealt.tiles.map((t, i) => (i === 0 ? 0 : t)) };
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 1, emptyUi(state), 0, NO_FLASH);
    const at = ops.filter((o) => o.op === "rect" && o.x === 16 && o.y === 16);
    expect(at.map((o) => o.op === "rect" && o.color)).toEqual([12]);
  });

  it("fills the gap between same-color neighbors (a seamless join)", () => {
    // Two color-1 tiles side by side: the left tile joins right, so it
    // paints a full-TILE_SIZE-wide rect in its color (COL_1 = 1).
    const state = mkState("1,1");
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 1, emptyUi(state), 0, NO_FLASH);
    expect(ops.some((o) => o.op === "rect" && o.color === 1 && o.w === TS)).toBe(true);
    // A differing pair leaves the inner-only width (no full-width join fill).
    const state2 = mkState("1,2");
    const r2 = recordingDrawing();
    redraw(r2.dr, freshDs(state2), null, state2, 1, emptyUi(state2), 0, NO_FLASH);
    expect(r2.ops.some((o) => o.op === "rect" && o.color === 1 && o.w === TS)).toBe(
      false,
    );
  });

  it("draws a COL_SEL outer rect for a selected tile", () => {
    const state = mkState("1,1");
    const ui = emptyUi(state);
    ui.selected[0] = true;
    ui.nselected = 1;
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 1, ui, 0, NO_FLASH);
    // COL_SEL = palette index 11.
    expect(ops.some((o) => o.op === "rect" && o.color === 11)).toBe(true);
  });

  it("recolors tile innards to COL_INK on a stuck board", () => {
    const state: SamegameState = { ...mkState("1,2"), impossible: true };
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 1, emptyUi(state), 0, NO_FLASH);
    // COL_INK = palette index 10 (drawn as the inner square).
    expect(ops.some((o) => o.op === "rect" && o.color === 10)).toBe(true);
  });
});

describe("Same Game: the win flash on a cleared board", () => {
  const dealt = mkState("1,1,1,2,2,2,3,3,3", { w: 3, h: 3 });
  const state: SamegameState = { ...dealt, tiles: dealt.tiles.map(() => 0) };
  const palette = PALETTE;
  const paint = (flash: Flash) => {
    const dr = new RecordingDrawing(palette);
    redraw(dr, freshDs(state), null, state, 1, emptyUi(state), 0, flash);
    return dr;
  };
  /** Where each square painted in the flash color is drawn, as `x,y`. */
  const run = winFlashRun(paint, (dr) =>
    dr.ops.flatMap((o) =>
      o.op === "rect" && o.color === COL_FLASH ? [`${o.x},${o.y}`] : [],
    ),
  );
  /** The sweep's diagonal through a square drawn at `at`. */
  const diagonal = (at: string): number => {
    const [x, y] = at.split(",").map(Number);
    return sweepStep(x, y);
  };

  it("lights every cell of the field, and never its margin, from the bottom left to the top right", () => {
    expectWinFlashTravels(run, state.w * state.h, diagonal);
  });
});

describe("Same Game: the flash of a board with no move left", () => {
  const state: SamegameState = { ...mkState("1,2"), impossible: true };
  /** Whether the field's margin, the one rect wider than a tile, is lit. */
  const marginLit = (time: number): boolean => {
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 1, emptyUi(state), 0, ownFlash(time));
    return ops.some((o) => o.op === "rect" && o.color === COL_LIFTED && o.w > TS);
  };

  it("lifts the whole field on its first beat and rests it on its second", () => {
    expect(marginLit(FLASH_FRAME / 2)).toBe(true);
    expect(marginLit(FLASH_FRAME * 1.5)).toBe(false);
  });
});
