/**
 * A painter draws one piece in a cell: what a fill game's description names
 * by `paint:` for each value (`engine/fill/render.ts`). It declares the colors
 * it is drawn in, so the board's palette is the painters' colors and no game
 * numbers a slot of its own.
 */

import type { GameDrawing } from "../../contract/game.ts";
import type { Color, Rect } from "../../contract/types.ts";

export interface Painter {
  /** The colors the piece is drawn in, from the board's background: its
   * slots, in this order. */
  colors(background: Color): readonly Color[];
  /** The surface a cell holding the piece takes, as an index into
   * {@link colors}, or `null` for the board's surface of an undecided cell. */
  readonly surface: number | null;
  /**
   * Draw the piece in `tile`, the cell's whole box, its colors from slot
   * `base` on. `error` where a rule breaks at the cell, which a piece shows in
   * the error role.
   */
  paint(dr: GameDrawing, tile: Rect, base: number, error: boolean): void;
}

/** The box of a tile's surface: inside the grid line on its top and left. */
export const surfaceOf = (tile: Rect): Rect => ({
  x: tile.x + 1,
  y: tile.y + 1,
  w: tile.w - 1,
  h: tile.h - 1,
});
