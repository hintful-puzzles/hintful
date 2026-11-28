/**
 * A painter draws one piece in a cell: what a fill game's description names
 * by `paint:` for each value (`engine/fill/render/palette.ts`). It declares the colors
 * it is drawn in, so the board's palette is the painters' colors and no game
 * numbers a slot of its own.
 */

import type { GameDrawing } from "../../contract/game.ts";
import type { Color, Rect } from "../../contract/types.ts";
import type { PairIndex } from "../piece.ts";

export interface Painter {
  /** The colors the piece is drawn in, from the board's background, each
   * one of the palette's named colors. Two painters naming one color share
   * its slot, since it means one thing on the board (the ground under a
   * tent, a tree and grass). */
  colors(background: Color): readonly Color[];
  /** The surface a cell holding the piece takes, as an index into
   * {@link colors}, or `null` for the board's surface of an undecided cell. */
  readonly surface: number | null;
  /** Whether the piece is its {@link surface} alone, a color and nothing
   * drawn on it, so the key placing it is painted in the color. */
  readonly swatch?: boolean;
  /** The member of the two-state pair the piece is, which a hint names it
   * by (`PAIR_NAMES`), where it is one. */
  readonly pair?: PairIndex;
  /** The line the piece runs along, where it is a line through its cell: a
   * drag along that line places it, and it rules no other piece out. */
  readonly axis?: "row" | "column";
  /** Whether {@link paint} draws a piece just placed by its `grown`, so a
   * placement of it is worth an animation. */
  readonly grows?: boolean;
  /** Whether the piece is dark, so a number written over it is light. */
  readonly dark?: boolean;
  /** Whether two of the piece side by side, each beside no other, are drawn
   * as one: {@link paint} is told the side its other half is on. */
  readonly joins?: boolean;
  /** Whether the piece runs straight through alike pieces in a line, as one
   * hull: {@link paint} is told the sides it runs on to, or `JOINED_OPEN`
   * where the board does not yet say which way it runs. */
  readonly runs?: boolean;
  /** The way the piece points, a step across the grid (`[0, -1]` up), where
   * it is an arrow: a note of it sits on that side of its cell, where every
   * piece of the board points. */
  readonly points?: readonly [number, number];
  /** What a cell the puzzle gave holding the piece draws in place of
   * {@link paint}, to tell it from one the player placed (Boats' waves on
   * given water, where the player's water takes the cross). */
  given?(dr: GameDrawing, tile: Rect, slot: readonly number[]): void;
  /** What a note of the piece draws in `box`, in place of {@link paint}
   * small, where the piece in the player's colors would not read as a note
   * (Rome's arrow, a stroke the same weight whoever drew it). */
  note?(dr: GameDrawing, box: Rect, slot: readonly number[]): void;
  /**
   * Draw the piece in `tile`, the cell's whole box, the color at index `i`
   * of {@link colors} in slot `slot[i]`. `error` where a rule breaks at the
   * cell, which a piece shows in the error role. `grown`, from 0 to 1, is
   * how far a piece just placed has grown from the middle of its cell; a
   * piece that does not grow is drawn whole. `occupied` where a number
   * takes the middle of the cell, which a mark that is no piece leaves to it.
   * `joined`, for a piece that {@link joins}, is the side its other half is
   * on (`JOIN_*`, `piece.ts`), or 0.
   */
  paint(
    dr: GameDrawing,
    tile: Rect,
    slot: readonly number[],
    error: boolean,
    grown?: number,
    occupied?: boolean,
    joined?: number,
  ): void;
}

/** The box of a tile's surface: inside the grid line on its top and left. */
export const surfaceOf = (tile: Rect): Rect => ({
  x: tile.x + 1,
  y: tile.y + 1,
  w: tile.w - 1,
  h: tile.h - 1,
});
