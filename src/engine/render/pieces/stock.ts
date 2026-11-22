/**
 * The pieces every shading game draws the same way: a shaded cell and a cell
 * ruled out (`docs/rendering.md` § "When two games share a mechanic, they
 * share its look too").
 */

import { RULED_OUT, SHADED } from "../../color/palette.ts";
import { COL_ERROR } from "../../color/roles.ts";
import { drawPiece, drawRuledOutCross, SHADED_SHAPE } from "../piece.ts";
import { type Painter, surfaceOf } from "./painter.ts";

/** A shaded cell: the engine's shaded piece. */
export const shade: Painter = {
  colors: () => [SHADED],
  surface: null,
  grows: true,
  paint(dr, tile, slot, error, grown = 1) {
    drawPiece(dr, surfaceOf(tile), SHADED_SHAPE, error ? COL_ERROR : slot[0], grown);
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
