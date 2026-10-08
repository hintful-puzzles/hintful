// Tier-2 render-ops: drive Mosaic's `redraw` against the engine's shared
// `RecordingDrawing` — the piece or cross each mark state draws on the cell's
// surface, clue text and its state-dependent color, cursor edge recolor, margin closing lines,
// the completion-flash inversion, the mistake outline, and the cache
// suppressing unchanged tiles.
import { describe, expect, it } from "vitest";
import { newCursor } from "../../engine/pointer.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { mosaicGame } from "./index.ts";
import {
  COL_CELL,
  COL_CURSOR,
  COL_ERROR,
  COL_ERROR_TEXT,
  COL_GRID,
  COL_RULED_OUT,
  COL_SHADED,
  COL_TEXT,
  COL_TEXT_ON_PIECE,
  COL_TEXT_SOLVED,
  COL_TEXT_SOLVED_ON_PIECE,
  type MosaicDrawState,
  newDrawState,
  redraw,
} from "./render.ts";
import { executeMove, type MosaicState, type MosaicUi, newState } from "./state.ts";

const PALETTE = mosaicGame.colors(DEFAULT_BACKGROUND);

/** A frame recorded through the shared recorder, which captures every
 * primitive — the local double this replaced dropped `drawPolygon` and
 * `drawCircle` on the floor and kept only a color from each `drawLine`. */
function recordingDrawing(): { dr: RecordingDrawing; ops: RecordingDrawing["ops"] } {
  const dr = new RecordingDrawing(PALETTE);
  return { dr, ops: dr.ops };
}

const TS = 32;
const P3 = { width: 3, height: 3, aggressive: true };
const ALL_BLACK_DESC = "464696464";

function freshUi(): MosaicUi {
  return { lastX: -1, lastY: -1, lastState: 0, cursor: newCursor() };
}

function freshDs(state: MosaicState): MosaicDrawState {
  return newDrawState(state, TS);
}

type Ops = RecordingDrawing["ops"];
/** The shaded pieces drawn. */
const pieces = (ops: Ops) =>
  ops.filter((o) => o.op === "polygon" && o.fill === COL_SHADED);
/** The strokes of the ruled-out crosses drawn, two to a cross. */
const crossStrokes = (ops: Ops) =>
  ops.filter((o) => o.op === "line" && o.color === COL_RULED_OUT);
/** The cell surfaces drawn. */
const surfaces = (ops: Ops) =>
  ops.filter((o) => o.op === "rect" && o.color === COL_CELL && o.w === TS - 1);

describe("Mosaic redraw", () => {
  it("paints unmarked tiles and clue text on first draw", () => {
    const state = newState(P3, ALL_BLACK_DESC);
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, 0);

    // 9 cells of plain surface, holding nothing.
    expect(surfaces(ops).length).toBe(9);
    expect(pieces(ops).length + crossStrokes(ops).length).toBe(0);
    // Every clue drawn, in ink on the bare surface.
    const texts = ops.filter((o) => o.op === "text");
    expect(texts.length).toBe(9);
    expect(texts.every((o) => o.color === COL_TEXT)).toBe(true);
    expect(texts.map((o) => o.text).join("")).toBe(ALL_BLACK_DESC);
    // Grid lines present.
    expect(ops.some((o) => o.op === "rect" && o.color === COL_GRID && o.h === 1)).toBe(
      true,
    );
  });

  it("draws the closing grid lines from the margin row/column", () => {
    const state = newState(P3, ALL_BLACK_DESC);
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, 0);
    const m = Math.floor(TS / 2);
    // The margin column (x=3) draws a vertical closing line at 3*ts+margin-1.
    expect(
      ops.some(
        (o) =>
          o.op === "rect" &&
          o.color === COL_GRID &&
          o.w === 1 &&
          o.x === 3 * TS + m - 1,
      ),
    ).toBe(true);
  });

  it("draws a marked cell as a piece and a blank one as a cross, on the same surface", () => {
    let state = newState(P3, "000000000");
    // Marking (1,1) contradicts every zero clue around it.
    state = executeMove(state, { type: "toggle", x: 1, y: 1, double: false });
    state = executeMove(state, { type: "toggle", x: 0, y: 0, double: true });
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, 0);
    expect(surfaces(ops).length).toBe(9);
    expect(pieces(ops).length).toBe(1);
    expect(crossStrokes(ops).length).toBe(2);
    // Every clue is contradicted: red text on bare surface, and on the piece
    // a red badge under text in the badge's own text color.
    const texts = ops.filter((o) => o.op === "text");
    expect(texts.filter((o) => o.color === COL_ERROR).length).toBe(8);
    expect(texts.filter((o) => o.color === COL_ERROR_TEXT).length).toBe(1);
    expect(ops.filter((o) => o.op === "circle" && o.fill === COL_ERROR).length).toBe(1);
  });

  it("keeps a blank cell's cross off the middle, where its number is", () => {
    let state = newState(P3, ALL_BLACK_DESC);
    state = executeMove(state, { type: "toggle", x: 1, y: 1, double: true });
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 1, freshUi(), 0, 0);
    const strokes = crossStrokes(ops);
    const text = ops.find((o) => o.op === "text" && o.text === "9");
    if (strokes.length !== 2 || text?.op !== "text") throw new Error("not drawn");
    // Every stroke end is right of the number's middle and above it, by more
    // than a digit's half width at this tile size.
    const clear = TS / 8;
    for (const s of strokes) {
      if (s.op !== "line") throw new Error("not a line");
      expect(Math.min(s.x1, s.x2) - text.x).toBeGreaterThan(clear);
      expect(text.y - Math.max(s.y1, s.y2)).toBeGreaterThan(clear);
    }
  });

  it("draws a number on a piece in the piece's text color", () => {
    let state = newState(P3, ALL_BLACK_DESC);
    state = executeMove(state, { type: "toggle", x: 1, y: 1, double: false });
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 1, freshUi(), 0, 0);
    const texts = ops.filter((o) => o.op === "text");
    expect(
      texts.filter((o) => o.color === COL_TEXT_ON_PIECE).map((o) => o.text),
    ).toEqual(["9"]);
    expect(texts.filter((o) => o.color === COL_TEXT).length).toBe(8);
  });

  it("grays out a solved clue's text", () => {
    let state = newState(P3, ALL_BLACK_DESC);
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        state = executeMove(state, { type: "toggle", x, y, double: false });
      }
    }
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, 0);
    const texts = ops.filter((o) => o.op === "text");
    expect(texts.length).toBe(9);
    // Every cell is shaded, so each solved number is on a piece.
    expect(texts.every((o) => o.color === COL_TEXT_SOLVED_ON_PIECE)).toBe(true);
  });

  it("grays out a solved clue's text on bare surface", () => {
    let state = newState(P3, "000000000");
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        state = executeMove(state, { type: "toggle", x, y, double: true });
      }
    }
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 1, freshUi(), 0, 0);
    const texts = ops.filter((o) => o.op === "text");
    expect(texts.length).toBe(9);
    expect(texts.every((o) => o.color === COL_TEXT_SOLVED)).toBe(true);
  });

  it("draws cursor edges in the cursor color", () => {
    const state = newState(P3, ALL_BLACK_DESC);
    const ds = freshDs(state);
    const ui = freshUi();
    ui.cursor.visible = true;
    ui.cursor.x = 1;
    ui.cursor.y = 1;
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, ui, 0, 0);
    expect(
      ops.filter((o) => "color" in o && o.color === COL_CURSOR).length,
    ).toBeGreaterThanOrEqual(4);
  });

  it("inverts marked/blank during the flash thirds", () => {
    // The flash only fires on completion, when every cell is determined:
    // complete the all-black board, then flash.
    let state = newState(P3, ALL_BLACK_DESC);
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        state = executeMove(state, { type: "toggle", x, y, double: false });
      }
    }
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    // flashTime 0.1 ≤ FLASH_TIME/3 → inverted: every marked cell draws blank.
    redraw(dr, ds, null, state, 1, freshUi(), 0, 0.1);
    expect(crossStrokes(ops).length).toBe(18);
    expect(pieces(ops).length).toBe(0);
    // Mid-flash (middle third) the board draws normally again.
    const second = recordingDrawing();
    redraw(second.dr, ds, null, state, 1, freshUi(), 0, 0.25);
    expect(pieces(second.ops).length).toBe(9);
  });

  it("outlines mistake cells in the error color", () => {
    let state = newState(P3, ALL_BLACK_DESC);
    state = executeMove(state, { type: "toggle", x: 1, y: 0, double: true }); // blank = wrong
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, 0, undefined, [{ x: 1, y: 0 }]);
    const errorRects = ops.filter((o) => o.op === "rect" && o.color === COL_ERROR);
    expect(errorRects.length).toBe(4); // four outline strips
  });

  it("suppresses unchanged tiles via the cache", () => {
    const state = newState(P3, ALL_BLACK_DESC);
    const ds = freshDs(state);
    const first = recordingDrawing();
    redraw(first.dr, ds, null, state, 1, freshUi(), 0, 0);
    expect(first.ops.length).toBeGreaterThan(0);
    const second = recordingDrawing();
    redraw(second.dr, ds, null, state, 1, freshUi(), 0, 0);
    expect(second.ops.length).toBe(0);
    // One toggled cell redraws only its own tile (plus nothing else).
    const moved = executeMove(state, { type: "toggle", x: 0, y: 0, double: false });
    const third = recordingDrawing();
    redraw(third.dr, ds, null, moved, 1, freshUi(), 0, 0);
    expect(surfaces(third.ops).length).toBe(1);
    expect(pieces(third.ops).length).toBe(1);
  });
});
