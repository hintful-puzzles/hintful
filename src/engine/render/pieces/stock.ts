/**
 * The pieces every shading game draws the same way: a shaded cell and a cell
 * ruled out (`docs/rendering.md` § "When two games share a mechanic, they
 * share its look too").
 */

import { CLEAR, CLEAR_MARK, RULED_OUT, SHADED } from "../../color/palette.ts";
import { COL_BACKGROUND, COL_ERROR } from "../../color/roles.ts";
import type { GameDrawing } from "../../contract/game.ts";
import type { Rect } from "../../contract/types.ts";
import { drawPiece, drawPiecePart, drawRuledOutCross, SHADED_SHAPE } from "../piece.ts";
import { type Painter, surfaceOf } from "./painter.ts";

/** A shaded cell: the engine's shaded piece. */
export const shade: Painter = {
  colors: () => [SHADED],
  surface: null,
  grows: true,
  dark: true,
  paint(dr, tile, slot, error, grown = 1) {
    drawPiece(dr, surfaceOf(tile), SHADED_SHAPE, error ? COL_ERROR : slot[0], grown);
  },
};

/** A shaded cell that pairs with one beside it: the shaded piece, and half
 * of a domino where it and one neighbor are shaded alone, reaching across the
 * line between them (Norinori). */
export const domino: Painter = {
  colors: () => [SHADED],
  surface: null,
  dark: true,
  joins: true,
  paint(dr, tile, slot, error, _grown, _occupied, joined = 0) {
    drawPiecePart(dr, surfaceOf(tile), joined, error ? COL_ERROR : slot[0], {
      ends: "square",
      divider: COL_BACKGROUND,
      reach: tile,
    });
  },
};

/** A cell said clear on a board colored half and half: the clear square, a
 * surface of its own (`CLEAR`) with the cross faint in its middle
 * (`CLEAR_MARK`), none where a number takes the middle. */
export const clear: Painter = {
  colors: () => [CLEAR, CLEAR_MARK],
  surface: 0,
  paint(dr, tile, slot, error, _grown, occupied = false) {
    if (!occupied) drawRuledOutCross(dr, surfaceOf(tile), error ? COL_ERROR : slot[1]);
  },
};

/** A cell whose number the player keeps: a ring round the number, the
 * puzzle's own mark for it (Singles', upstream's circle), unfilled so the
 * surface and a hatch on it show through; on a cell with no number, the
 * cross. It stands in from the cell's edge, so a hint's band or the cursor
 * there lands beside it. */
export const ring: Painter = {
  colors: () => [RULED_OUT],
  surface: null,
  paint(dr, tile, slot, error, _grown, occupied = false) {
    const cell = surfaceOf(tile);
    const color = error ? COL_ERROR : slot[0];
    if (occupied) drawRingIn(dr, cell, color);
    else drawRuledOutCross(dr, cell, color);
  },
};

/** The ring round what `cell` holds, in `color`: Singles' kept number's,
 * and Salad's ball, a square known to hold a symbol. */
export function drawRingIn(dr: GameDrawing, cell: Rect, color: number): void {
  const c = { x: cell.x + cell.w / 2, y: cell.y + cell.h / 2 };
  const r =
    (cell.w - 1) / 2 - Math.max(Math.max(2, cell.w >> 4) + 1, Math.round(cell.w / 10));
  const weight = Math.max(2, Math.round(cell.w / 24));
  // Half-pixel steps: one-pixel strokes a whole pixel apart leave specks of
  // surface between them.
  for (let i = 0; i < 2 * weight - 1; i++) dr.drawCircle(c, r - i / 2, -1, color);
}

/** A cell the player has ruled out: the engine's cross, none where a number
 * takes the middle (a numbered square dealt clear, Range's). */
export const cross: Painter = {
  colors: () => [RULED_OUT],
  surface: null,
  paint(dr, tile, slot, error, _grown, occupied = false) {
    if (!occupied) drawRuledOutCross(dr, surfaceOf(tile), error ? COL_ERROR : slot[0]);
  },
};
