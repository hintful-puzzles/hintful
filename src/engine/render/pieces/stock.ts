/**
 * The pieces every shading game draws the same way: a shaded cell and a cell
 * ruled out (`docs/rendering.md` § "When two games share a mechanic, they
 * share its look too").
 */

import { CLEAR, CLEAR_MARK, RULED_OUT, SHADED } from "../../color/palette.ts";
import { COL_BACKGROUND, COL_ERROR } from "../../color/roles.ts";
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
 * surface of its own with the cross faint in its middle, none where a number
 * takes the middle (`drawClearSquare`). */
export const clear: Painter = {
  colors: () => [CLEAR, CLEAR_MARK],
  surface: 0,
  paint(dr, tile, slot, error, _grown, occupied = false) {
    if (!occupied) drawRuledOutCross(dr, surfaceOf(tile), error ? COL_ERROR : slot[1]);
  },
};

/** A cell the player has ruled out: the engine's cross. */
export const cross: Painter = {
  colors: () => [RULED_OUT],
  surface: null,
  paint(dr, tile, slot, error) {
    drawRuledOutCross(dr, surfaceOf(tile), error ? COL_ERROR : slot[0]);
  },
};
