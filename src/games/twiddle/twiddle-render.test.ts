// Tier-2 render test: drive Twiddle's `redraw` against a recording
// `GameDrawing` double and assert the structure of the draw calls — a
// first-draw background + recessed border + numbered tiles, a
// mid-rotation frame that draws the block's tiles at rotated coordinates
// (and settles them at animation end), and the win flash across the tiles.
import { describe, expect, it } from "vitest";
import { newCursor } from "../../engine/pointer.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import {
  expectWinFlashTravels,
  winFlashAt,
  winFlashRun,
} from "../../engine/testing/win-flash.ts";
import { type Flash, NO_FLASH, WIN_FLASH_S } from "../../engine/win-wave.ts";
import { executeMove, twiddleGame } from "./index.ts";
import {
  animLength,
  COL_FLASH,
  COL_HIGHCURSOR,
  COL_HIGHLIGHT,
  COL_LOWCURSOR,
  COL_LOWLIGHT,
  COL_TILE,
} from "./render.ts";
import { newState, type TwiddleParams, type TwiddleState } from "./state.ts";

const PALETTE = twiddleGame.colors(DEFAULT_BACKGROUND);

function recordingDrawing(): { dr: RecordingDrawing; ops: RecordingDrawing["ops"] } {
  const dr = new RecordingDrawing(PALETTE);
  return { dr, ops: dr.ops };
}

const newDrawState = twiddleGame.newDrawState as NonNullable<
  typeof twiddleGame.newDrawState
>;
const redraw = twiddleGame.redraw as NonNullable<typeof twiddleGame.redraw>;

const TS = 48;

function params(): TwiddleParams {
  return { w: 3, h: 3, n: 2, rowsonly: false, orientable: false, movetarget: 0 };
}

const UI = { cursor: newCursor() };

function fresh(state: TwiddleState) {
  const ds = newDrawState(state, TS);
  return ds;
}

function solved3x3(): TwiddleState {
  return newState(params(), "1,2,3,4,5,6,7,8,9");
}

describe("Twiddle rendering", () => {
  it("first draw paints the recessed border and numbered tiles", () => {
    const state = solved3x3();
    const ds = fresh(state);
    const { dr, ops } = recordingDrawing();

    redraw(dr, ds, null, state, 0, UI, 0, NO_FLASH);

    // The two recessed-border bevels (highlight then lowlight) before tiles.
    const firstPolys = opsOfKind(ops, "polygon").slice(0, 2);
    expect(firstPolys.map((o) => o.fill)).toEqual([COL_HIGHLIGHT, COL_LOWLIGHT]);
    // One number per cell.
    const numbers = ops.filter((o) => o.op === "text").map((o) => o.text);
    expect(numbers.length).toBe(9);
    expect(numbers).toContain("1");
    expect(numbers).toContain("9");
  });

  it("draws the rotated block's tiles off-grid mid-rotation and clips", () => {
    const prev = solved3x3();
    // Rotate block (0,0) clockwise: state.lastX/Y/R = 0,0,+1.
    const state = executeMove(prev, { type: "rotate", x: 0, y: 0, dir: 1 });
    const ds = fresh(state);
    // Prime the cache with a static draw.
    redraw(recordingDrawing().dr, ds, null, state, 0, UI, 0, NO_FLASH);

    const { dr, ops } = recordingDrawing();
    const half = animLength(state.n) / 2;
    redraw(dr, ds, prev, state, 1, UI, half, NO_FLASH);

    // Rotation clips the block region per tile.
    expect(ops.some((o) => o.op === "clip")).toBe(true);

    // "1" sits at cell (0,1) in the rotated state; its *static* center is
    // coord(0)+ts/2 = 48, coord(1)+ts/2 = 96. Mid-rotation it is rotated
    // about the block center, so it is drawn away from (48, 96).
    const moving = opsOfKind(ops, "text").find((o) => o.text === "1");
    expect(moving).toBeDefined();
    expect(moving?.x === 48 && moving?.y === 96).toBe(false);
  });

  it("settles the block tiles on their cells at animation end", () => {
    const prev = solved3x3();
    const state = executeMove(prev, { type: "rotate", x: 0, y: 0, dir: 1 });
    const ds = fresh(state);
    redraw(recordingDrawing().dr, ds, null, state, 0, UI, 0, NO_FLASH);

    const { dr, ops } = recordingDrawing();
    // animTime == animMax → angle 0 → tiles back on their grid cells.
    redraw(dr, ds, prev, state, 1, UI, animLength(state.n), NO_FLASH);
    const settled = opsOfKind(ops, "text").find((o) => o.text === "1");
    expect(settled?.x).toBe(48); // coord(0) + ts/2
    expect(settled?.y).toBe(96); // coord(1) + ts/2
  });

  it("draws cursor-colored edges around the cursor region", () => {
    const state = solved3x3();
    const ds = fresh(state);
    redraw(recordingDrawing().dr, ds, null, state, 0, UI, 0, NO_FLASH);

    const { dr, ops } = recordingDrawing();
    // Cursor visible at origin (0,0): the region's edge bevels recolor
    // their *outline* to the cursor colors.
    redraw(dr, ds, null, state, 0, { cursor: newCursor(0, 0, true) }, 0, NO_FLASH);
    expect(
      ops.some(
        (o) =>
          o.op === "polygon" &&
          (o.outline === COL_HIGHCURSOR || o.outline === COL_LOWCURSOR),
      ),
    ).toBe(true);
  });
});

describe("Twiddle: the win flash sweeps the tiles", () => {
  const state = solved3x3();
  const tiles = state.w * state.h;

  const paint = (flash: Flash, ds = fresh(state)) => {
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 0, UI, 0, flash);
    return ops;
  };
  /** The tiles whose face a frame fills with the flash color, as the `x,y`
   * the face is drawn at. */
  const lit = (ops: ReturnType<typeof paint>): string[] =>
    ops.flatMap((op) =>
      op.op === "rect" && op.color === COL_FLASH && op.w === op.h
        ? [`${op.x},${op.y}`]
        : [],
    );
  const step = (key: string): number => {
    const [x, y] = key.split(",").map(Number);
    return x - y;
  };

  it("is a solved board", () => {
    expect(twiddleGame.status(state)).toBe("solved");
  });

  it("travels every tile, from the bottom left to the top right", () => {
    expectWinFlashTravels(winFlashRun(paint, lit), tiles, step);
  });

  it("repaints a tile's own face when the flash leaves it", () => {
    const ds = fresh(state);
    paint(
      winFlashAt(WIN_FLASH_S / 2, (flash) => paint(flash)),
      ds,
    );
    const after = paint(NO_FLASH, ds);
    const faces = after.filter((op) => op.op === "rect" && op.w === op.h);
    expect(faces.length).toBeGreaterThan(0);
    expect(faces.length).toBeLessThan(tiles);
    expect(faces.every((op) => op.op === "rect" && op.color === COL_TILE)).toBe(true);
  });
});
