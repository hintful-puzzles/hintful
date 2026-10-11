// Tier-2 render-ops: drive Mosaic's `redraw` against the engine's shared
// `RecordingDrawing` — the piece on the cell's surface or the clear square
// each mark state draws, clue text and its state-dependent color, cursor edge recolor, margin closing lines,
// the win flash's lit cells, the mistake outline, and the cache
// suppressing unchanged tiles.
import { describe, expect, it } from "vitest";
import { DIFF_EASY } from "../../engine/answer-search.ts";
import { newCursor } from "../../engine/pointer.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { expectWinFlashTravels, winFlashRun } from "../../engine/testing/win-flash.ts";
import { type Flash, NO_FLASH, sweepStep } from "../../engine/win-wave.ts";
import { mosaicGame } from "./index.ts";
import {
  COL_CELL,
  COL_CLEAR,
  COL_CLEAR_MARK,
  COL_CURSOR,
  COL_ERROR,
  COL_ERROR_TEXT,
  COL_FLASH,
  COL_FLASH_LEAD,
  COL_GRID,
  COL_SHADED,
  COL_TEXT,
  COL_TEXT_ON_PIECE,
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
const P3 = { width: 3, height: 3, aggressive: true, diff: DIFF_EASY };
const ALL_BLACK_DESC = "464696464";

function freshUi(): MosaicUi {
  return { cursor: newCursor() };
}

function freshDs(state: MosaicState): MosaicDrawState {
  return newDrawState(state, TS);
}

type Ops = RecordingDrawing["ops"];
/** The shaded pieces drawn. */
const pieces = (ops: Ops) =>
  ops.filter((o) => o.op === "polygon" && o.fill === COL_SHADED);
/** The strokes of the clear squares' crosses drawn, two to a cross. */
const crossStrokes = (ops: Ops) => ops.filter((o) => o.op === "line");
/** The plain cell surfaces drawn. */
const surfaces = (ops: Ops) =>
  ops.filter((o) => o.op === "rect" && o.color === COL_CELL && o.w === TS - 1);
/** The clear squares' surfaces drawn. */
const clearSurfaces = (ops: Ops) =>
  ops.filter((o) => o.op === "rect" && o.color === COL_CLEAR && o.w === TS - 1);

describe("Mosaic redraw", () => {
  it("paints unmarked tiles and clue text on first draw", () => {
    const state = newState(P3, ALL_BLACK_DESC);
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, NO_FLASH);

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
    redraw(dr, ds, null, state, 1, freshUi(), 0, NO_FLASH);
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

  it("draws a marked cell as a piece on the surface and a blank one as the clear square", () => {
    let state = newState(P3, "000000000");
    // Marking (1,1) contradicts every zero clue around it.
    state = executeMove(state, { type: "toggle", x: 1, y: 1, double: false });
    state = executeMove(state, { type: "toggle", x: 0, y: 0, double: true });
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, NO_FLASH);
    expect(surfaces(ops).length).toBe(8);
    expect(clearSurfaces(ops).length).toBe(1);
    expect(pieces(ops).length).toBe(1);
    // Every clue is contradicted: red text on bare surface, and on the piece
    // and the clear square a red badge under text in the badge's own color.
    const texts = ops.filter((o) => o.op === "text");
    expect(texts.filter((o) => o.color === COL_ERROR).length).toBe(7);
    expect(texts.filter((o) => o.color === COL_ERROR_TEXT).length).toBe(2);
    expect(ops.filter((o) => o.op === "circle" && o.fill === COL_ERROR).length).toBe(2);
  });

  it("gives a blank cell's number the square to itself, with no cross", () => {
    let state = newState(P3, ALL_BLACK_DESC);
    state = executeMove(state, { type: "toggle", x: 1, y: 1, double: true });
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 1, freshUi(), 0, NO_FLASH);
    expect(clearSurfaces(ops).length).toBe(1);
    expect(crossStrokes(ops).length).toBe(0);
  });

  it("draws a faint cross in the middle of a blank cell that has no number", () => {
    // "9" hides nothing at this size, so the cell with no number is made by
    // hand: clue -1 is how the board holds a hidden one.
    const dealt = newState(P3, ALL_BLACK_DESC);
    const clues = Int8Array.from(dealt.board.clues);
    clues[4] = -1;
    let state: MosaicState = { ...dealt, board: { ...dealt.board, clues } };
    state = executeMove(state, { type: "toggle", x: 1, y: 1, double: true });
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 1, freshUi(), 0, NO_FLASH);
    const surface = clearSurfaces(ops)[0];
    const strokes = crossStrokes(ops);
    if (surface?.op !== "rect" || strokes.length !== 2) throw new Error("not drawn");
    for (const s of strokes) {
      if (s.op !== "line") throw new Error("not a line");
      expect(s.color).toBe(COL_CLEAR_MARK);
      // Within the pixel the cross's whole-pixel middle is rounded by.
      const off = Math.hypot(
        (s.x1 + s.x2) / 2 - (surface.x + surface.w / 2),
        (s.y1 + s.y2) / 2 - (surface.y + surface.h / 2),
      );
      expect(off).toBeLessThan(1);
    }
  });

  it("draws a number on a piece in the piece's text color", () => {
    let state = newState(P3, ALL_BLACK_DESC);
    state = executeMove(state, { type: "toggle", x: 1, y: 1, double: false });
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 1, freshUi(), 0, NO_FLASH);
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
    redraw(dr, ds, null, state, 1, freshUi(), 0, NO_FLASH);
    const texts = ops.filter((o) => o.op === "text");
    expect(texts.length).toBe(9);
    // Every cell is shaded, so each solved number is on a piece.
    expect(texts.every((o) => o.color === COL_TEXT_SOLVED_ON_PIECE)).toBe(true);
  });

  it("draws a solved clue's text faint on the clear square", () => {
    let state = newState(P3, "000000000");
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        state = executeMove(state, { type: "toggle", x, y, double: true });
      }
    }
    const { dr, ops } = recordingDrawing();
    redraw(dr, freshDs(state), null, state, 1, freshUi(), 0, NO_FLASH);
    const texts = ops.filter((o) => o.op === "text");
    expect(texts.length).toBe(9);
    expect(texts.every((o) => o.color === COL_CLEAR_MARK)).toBe(true);
  });

  it("draws cursor edges in the cursor color", () => {
    const state = newState(P3, ALL_BLACK_DESC);
    const ds = freshDs(state);
    const ui = freshUi();
    ui.cursor.visible = true;
    ui.cursor.x = 1;
    ui.cursor.y = 1;
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, ui, 0, NO_FLASH);
    expect(
      ops.filter((o) => "color" in o && o.color === COL_CURSOR).length,
    ).toBeGreaterThanOrEqual(4);
  });

  it("sweeps the win flash from the bottom left to the top right", () => {
    // The flash only fires on completion, when every cell is determined:
    // complete the all-black board, bar one cell that is blank.
    let state = newState(P3, ALL_BLACK_DESC);
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const double = x === 1 && y === 1;
        state = executeMove(state, { type: "toggle", x, y, double });
      }
    }
    const paint = (flash: Flash) => {
      const { dr, ops } = recordingDrawing();
      redraw(dr, freshDs(state), null, state, 1, freshUi(), 0, flash);
      return ops;
    };
    // The cells whose ground is the flash color, each as its index.
    // Lit is either tone of the highlight, and the flash shows both.
    const tones = new Set<number>();
    const isLit = (color: number) =>
      (color === COL_FLASH || color === COL_FLASH_LEAD) && tones.add(color).size > 0;
    const run = winFlashRun(paint, (ops) => {
      // A lit cell keeps what it holds: only the surface under it changes.
      expect(pieces(ops).length).toBe(8);
      expect(crossStrokes(ops).length).toBe(0);
      return ops.flatMap((o) =>
        o.op === "rect" && isLit(o.color) && o.w === TS - 1
          ? [((o.y - TS / 2) / TS) * 3 + (o.x - TS / 2) / TS]
          : [],
      );
    });
    // The blank cell in the middle lights too, in place of its own surface.
    expectWinFlashTravels(run, 9, (i) => sweepStep(i % 3, Math.floor(i / 3)));
    expect(tones.size).toBe(2);
    expect(clearSurfaces(paint(NO_FLASH)).length).toBe(1);
  });

  it("outlines mistake cells in the error color", () => {
    let state = newState(P3, ALL_BLACK_DESC);
    state = executeMove(state, { type: "toggle", x: 1, y: 0, double: true }); // blank = wrong
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, NO_FLASH, undefined, [{ x: 1, y: 0 }]);
    const errorRects = ops.filter((o) => o.op === "rect" && o.color === COL_ERROR);
    expect(errorRects.length).toBe(4); // four outline strips
  });

  it("suppresses unchanged tiles via the cache", () => {
    const state = newState(P3, ALL_BLACK_DESC);
    const ds = freshDs(state);
    const first = recordingDrawing();
    redraw(first.dr, ds, null, state, 1, freshUi(), 0, NO_FLASH);
    expect(first.ops.length).toBeGreaterThan(0);
    const second = recordingDrawing();
    redraw(second.dr, ds, null, state, 1, freshUi(), 0, NO_FLASH);
    expect(second.ops.length).toBe(0);
    // One toggled cell redraws only its own tile (plus nothing else).
    const moved = executeMove(state, { type: "toggle", x: 0, y: 0, double: false });
    const third = recordingDrawing();
    redraw(third.dr, ds, null, moved, 1, freshUi(), 0, NO_FLASH);
    expect(surfaces(third.ops).length).toBe(1);
    expect(pieces(third.ops).length).toBe(1);
  });
});
