// Tier-2 render-ops: drive Unruly's `redraw` against a recording
// `GameDrawing` double — a piece per state, the 3-in-a-row error bars, the
// count badge, the lifted cell under a given, the cursor outline, the
// win flash across the cells, and the cache suppressing unchanged tiles.
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { CELL, mark, phrase, so } from "../../engine/hint-words.ts";
import { newCursor } from "../../engine/pointer.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import {
  expectWinFlashTravels,
  winFlashAt,
  winFlashRun,
} from "../../engine/testing/win-flash.ts";
import { type Flash, NO_FLASH, WIN_FLASH_S } from "../../engine/win-wave.ts";
import { type Cell, ONE, ZERO } from "./constants.ts";
import type { UnrulyHint } from "./index.ts";
import { unrulyGame } from "./index.ts";
import {
  COL_0,
  COL_1,
  COL_CURSOR,
  COL_EMPTY,
  COL_ERROR,
  COL_ERROR_TEXT,
  COL_GIVEN,
  COL_HINT,
  COL_HINT_REF,
  newDrawState,
  PLACE_ANIM_TIME,
  redraw,
  type UnrulyDrawState,
} from "./render.ts";
import {
  encodeGrid,
  executeMove,
  newState,
  type UnrulyMove,
  type UnrulyParams,
  type UnrulyState,
  type UnrulyUi,
} from "./state.ts";

const PALETTE = unrulyGame.colors(DEFAULT_BACKGROUND);

function recordingDrawing(): { dr: RecordingDrawing; ops: RecordingDrawing["ops"] } {
  const dr = new RecordingDrawing(PALETTE);
  return { dr, ops: dr.ops };
}

const TS = 32;
const P: UnrulyParams = { w2: 6, h2: 6, unique: false, diff: 0 };

function freshUi(): UnrulyUi {
  return { cursor: newCursor() };
}

function freshDs(state: UnrulyState): UnrulyDrawState {
  return newDrawState(state, TS);
}

/** A blank (no-clue) board of P's size. */
function blank(): UnrulyState {
  const desc = encodeGrid(new Uint8Array(P.w2 * P.h2), P.w2 * P.h2);
  return newState(P, desc);
}

/** A board with one immutable clue of the given color at (0,0). */
function withClue(value: Cell): UnrulyState {
  const grid = new Uint8Array(P.w2 * P.h2);
  grid[0] = value;
  return newState(P, encodeGrid(grid, P.w2 * P.h2));
}

function place(state: UnrulyState, x: number, y: number, value: Cell): UnrulyState {
  return executeMove(state, { type: "place", x, y, value });
}

/** The cell surfaces of a frame: full-size rects, narrowed so their color reads. */
const bodies = (ops: RecordingDrawing["ops"]) =>
  opsOfKind(ops, "rect").filter((o) => o.w === TS - 1 && o.h === TS - 1);

/** The square pieces of a frame, with how wide each is drawn. */
const squares = (ops: RecordingDrawing["ops"]) =>
  opsOfKind(ops, "polygon")
    .filter((o) => o.fill === COL_1)
    .map((o) => {
      const xs = o.points.map((p) => p[0]);
      return Math.max(...xs) - Math.min(...xs);
    });
/** The disc pieces of a frame. */
const discs = (ops: RecordingDrawing["ops"]) =>
  opsOfKind(ops, "circle").filter((o) => o.fill === COL_0);

describe("Unruly redraw", () => {
  it("fills empty tiles neutral on first draw, plus the outer grid frame", () => {
    const state = blank();
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, NO_FLASH);
    // 36 empty tile bodies.
    expect(bodies(ops).filter((o) => o.color === COL_EMPTY).length).toBe(36);
    // The outer grid edge frame was drawn on first draw.
    expect(ops.some((o) => o.op === "rect" && o.color === 1)).toBe(true);
  });

  it("draws a one as a square and a zero as a disc, on a surface that stays quiet", () => {
    let state = blank();
    state = place(state, 1, 1, ONE);
    state = place(state, 2, 2, ZERO);
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, NO_FLASH);
    expect(squares(ops)).toHaveLength(1);
    expect(discs(ops)).toHaveLength(1);
    // The piece carries the state, so no cell is filled in a piece's color.
    expect(bodies(ops).every((o) => o.color === COL_EMPTY)).toBe(true);
  });

  it("draws error bars across a three-in-a-row", () => {
    let state = blank();
    state = place(state, 0, 0, ONE);
    state = place(state, 1, 0, ONE);
    state = place(state, 2, 0, ONE);
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, NO_FLASH);
    // The error rectangle helper emits 4 strips per affected tile.
    expect(
      ops.filter((o) => o.op === "rect" && o.color === COL_ERROR).length,
    ).toBeGreaterThanOrEqual(4);
  });

  it("marks the count `!` when a row exceeds its color target", () => {
    // 4 ones in a 6-wide row (target 3) → the row's ones count is exceeded.
    let state = blank();
    state = place(state, 0, 0, ONE);
    state = place(state, 2, 0, ONE);
    state = place(state, 4, 0, ONE);
    state = place(state, 5, 0, ONE);
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, NO_FLASH);
    // A badge: the `!` in the error's text color, on a disc of the error color.
    const marks = opsOfKind(ops, "text").filter((o) => o.text === "!");
    expect(marks).toHaveLength(4);
    for (const m of marks) expect(m.color).toBe(COL_ERROR_TEXT);
    expect(opsOfKind(ops, "circle").filter((o) => o.fill === COL_ERROR)).toHaveLength(
      4,
    );
  });

  it("lifts the cell under a given, and under no piece the player placed", () => {
    const state = place(withClue(ONE), 3, 3, ONE);
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, NO_FLASH);
    expect(squares(ops)).toHaveLength(2);
    expect(bodies(ops).filter((o) => o.color === COL_GIVEN)).toHaveLength(1);
  });

  it("draws the cursor outline in the cursor color", () => {
    const state = blank();
    const ds = freshDs(state);
    const ui = freshUi();
    ui.cursor.visible = true;
    ui.cursor.x = 2;
    ui.cursor.y = 3;
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, ui, 0, NO_FLASH);
    expect(
      ops.filter((o) => "color" in o && o.color === COL_CURSOR).length,
    ).toBeGreaterThanOrEqual(4);
  });

  it("outlines mistake cells in the error color", () => {
    // A single placed cell (no live 3-in-a-row / count error), flagged as a
    // mistake → only the four inset outline strips are error-colored.
    let state = blank();
    state = place(state, 2, 2, ZERO);
    const ds = freshDs(state);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, NO_FLASH, undefined, [{ x: 2, y: 2 }]);
    const errorRects = ops.filter((o) => o.op === "rect" && o.color === COL_ERROR);
    expect(errorRects.length).toBe(4);
  });

  it("grows a placed piece from the middle, and shrinks one taken away", () => {
    const empty = blank();
    const filled = place(empty, 0, 0, ONE);
    const widthAt = (
      prev: UnrulyState | null,
      state: UnrulyState,
      animTime: number,
    ): number[] => {
      const { dr, ops } = recordingDrawing();
      redraw(dr, freshDs(state), prev, state, 1, freshUi(), animTime, NO_FLASH);
      return squares(ops);
    };
    const [settled] = widthAt(null, filled, 0);
    const [early] = widthAt(empty, filled, PLACE_ANIM_TIME / 4);
    const [late] = widthAt(empty, filled, (PLACE_ANIM_TIME * 3) / 4);
    expect(early).toBeGreaterThan(0);
    expect(early).toBeLessThan(late);
    expect(late).toBeLessThan(settled);
    // Taken away: the piece that was there, getting smaller.
    const [going] = widthAt(filled, empty, PLACE_ANIM_TIME / 4);
    const [nearlyGone] = widthAt(filled, empty, (PLACE_ANIM_TIME * 3) / 4);
    expect(going).toBeLessThan(settled);
    expect(nearlyGone).toBeLessThan(going);
    expect(widthAt(null, empty, 0)).toEqual([]);
  });

  it("renders a displayed hint: target ring, hatched line, premise ring", () => {
    // A clue at (0,0) (a ring premise) and an empty target at (2,0) forced to
    // the same kind, both on row 0, which the sentence names.
    const state = withClue(ONE);
    const ds = freshDs(state);
    const target = { x: 2, y: 0, value: ONE as Cell };
    const row0 = Array.from({ length: state.w2 }, (_, x) => ({ x, y: 0 }));
    const words = so({
      look: phrase`${mark.the("outline", CELL, [{ x: 0, y: 0 }], "cell")} is filled`,
      move: phrase`${mark.the("ring", CELL, [{ x: 2, y: 0 }], "cell")} on ${mark.the("stripes", CELL, row0, "row")} must match it`,
    });
    const hint: HintStep<UnrulyMove, UnrulyHint> = {
      move: { type: "place", x: 2, y: 0, value: ONE },
      rung: "threes",
      explanation: words.text,
      words,
      highlights: { target },
    };
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, NO_FLASH, hint);
    // Target cell: a COL_HINT **ring**, and no COL_HINT body. A fill in a game
    // whose move is "put one of two pieces here" reads as a third piece
    // already placed, so the cell keeps its own surface under the mark.
    expect(
      opsOfKind(ops, "rect").filter(
        (o) => o.color === COL_HINT && !(o.w === TS - 1 && o.h === TS - 1),
      ).length,
    ).toBe(4);
    expect(bodies(ops).some((o) => o.color === COL_HINT)).toBe(false);
    // The row is hatched, every cell of it whatever it holds, over its own fill.
    const hatches = opsOfKind(ops, "hatch");
    expect(hatches).toHaveLength(state.w2);
    for (const h of hatches) expect(h.color).toBe(COL_HINT);
    expect(new Set(hatches.map((h) => h.y)).size).toBe(1);
    // Premise ring: COL_HINT_REF outline strips around the cited clue — a
    // distinct color from the COL_HINT move, so premise and move don't read
    // as the same element type (the element-type color legend).
    expect(
      opsOfKind(ops, "rect").filter(
        (o) => o.color === COL_HINT_REF && !(o.w === TS - 1 && o.h === TS - 1),
      ).length,
    ).toBeGreaterThanOrEqual(4);
  });

  it("suppresses unchanged tiles via the cache", () => {
    const state = blank();
    const ds = freshDs(state);
    const first = recordingDrawing();
    redraw(first.dr, ds, null, state, 1, freshUi(), 0, NO_FLASH);
    expect(first.ops.length).toBeGreaterThan(0);
    const second = recordingDrawing();
    redraw(second.dr, ds, null, state, 1, freshUi(), 0, NO_FLASH);
    expect(second.ops.length).toBe(0);
    // One placed cell redraws only its own tile body.
    const moved = place(state, 0, 0, ONE);
    const third = recordingDrawing();
    redraw(third.dr, ds, null, moved, 1, freshUi(), 0, NO_FLASH);
    expect(bodies(third.ops).length).toBe(1);
  });
});

describe("Unruly: the win flash sweeps the cells", () => {
  // A board with no given, so a lifted surface is the flash's alone. Rows
  // alternate between one pattern and its inverse.
  const row = [1, 1, 0, 0, 1, 0];
  let state = blank();
  for (let y = 0; y < P.h2; y++) {
    for (let x = 0; x < P.w2; x++) {
      state = place(state, x, y, row[x] === y % 2 ? ZERO : ONE);
    }
  }
  const cells = P.w2 * P.h2;

  const paint = (flash: Flash, ds = freshDs(state)) => {
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, state, 1, freshUi(), 0, flash);
    return ops;
  };
  /** The cells a frame draws on the lifted surface, as the `x,y` drawn at. */
  const lit = (ops: ReturnType<typeof paint>): string[] =>
    bodies(ops).flatMap((op) => (op.color === COL_GIVEN ? [`${op.x},${op.y}`] : []));
  const step = (key: string): number => {
    const [x, y] = key.split(",").map(Number);
    return x - y;
  };

  it("is a solved board", () => {
    expect(unrulyGame.status(state)).toBe("solved");
  });

  it("travels every cell, from the bottom left to the top right", () => {
    expectWinFlashTravels(winFlashRun(paint, lit), cells, step);
  });

  it("drops a given to the plain surface while the flash is on it", () => {
    // The same board with its top-left cell a given, which rests lifted.
    const given = withClue(state.grid[0] as Cell);
    const surfaceAt = (ops: RecordingDrawing["ops"]) =>
      bodies(ops).reduce((top, op) => (op.x + op.y < top.x + top.y ? op : top)).color;
    const paintGiven = (flash: Flash) => {
      const { dr, ops } = recordingDrawing();
      redraw(dr, freshDs(given), null, given, 1, freshUi(), 0, flash);
      return ops;
    };
    expect(surfaceAt(paintGiven(NO_FLASH))).toBe(COL_GIVEN);
    const surfaces = winFlashRun(paintGiven, (ops) => [surfaceAt(ops)]).frames.flat();
    expect(new Set(surfaces)).toEqual(new Set([COL_GIVEN, COL_EMPTY]));
  });

  it("lowers a cell to its own surface when the flash leaves it", () => {
    const ds = freshDs(state);
    paint(
      winFlashAt(WIN_FLASH_S / 2, (flash) => paint(flash)),
      ds,
    );
    const after = bodies(paint(NO_FLASH, ds));
    expect(after.length).toBeGreaterThan(0);
    expect(after.length).toBeLessThan(cells);
    expect(new Set(after.map((op) => op.color))).toEqual(new Set([COL_EMPTY]));
  });
});
