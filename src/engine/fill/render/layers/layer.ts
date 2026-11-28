/**
 * What a cell layer paints from: one tile, its words and its place. A layer
 * is a module of this folder, and `tile.ts`'s `drawTile` calls each in its
 * paint order, which is the one list of what lies over what.
 */

import type { GameDrawing } from "../../../contract/game.ts";
import type { Rect } from "../../../contract/types.ts";
import type { CellLayout } from "../cell-text.ts";
import type { Placed } from "../palette.ts";
import type { CellPart } from "../tile-word.ts";
import type { Breach } from "./breaches.ts";

export interface TileFrame {
  readonly dr: GameDrawing;
  readonly ts: number;
  /** The cell, on a board `h` high. */
  readonly at: readonly [number, number, number];
  /** The tile's top left, and the tile. */
  readonly tx: number;
  readonly ty: number;
  readonly tile: Rect;
  readonly word: number;
  readonly hintWord: number;
  readonly lineWord: number;
  /** On a board that keeps notes, the cell's notes, bit `v` a value's, and
   * `NOTES_MODE` where the selection takes notes. */
  readonly noteWord: number;
  /** On an answer on the edges, the values on the tile's sides and their
   * errors (`tile-word.ts`'s edge word); 0 on one on the cells. */
  readonly edgeWord: number;
  /** The number on the cell, `-1` where it has none. */
  readonly n: number;
  /** The cell's walls and fill, where the board deals a partition. */
  readonly part: CellPart | null;
  /** The notes a hint's step strikes from the cell, bit `v` a value's. */
  readonly struck: number;
  /** The clue of the part this is the first cell of, as written; `null`
   * where it is none's first. */
  readonly label: string | null;
  /** The labels of a breach on the cell (`breaches.ts`), or `null`. */
  readonly breach: Breach | null;
  /** The player's highlight on the cell (`play.highlights`), by its index,
   * `-1` for none. */
  readonly highlight: number;
  /** The value's piece as drawn: none on an open cell, or where the wash
   * leaves it out. */
  readonly piece: Placed | null;
  readonly lay: CellLayout;
}
