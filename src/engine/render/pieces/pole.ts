/**
 * A magnet's poles and a neutral tile (upstream Magnets): each square's half
 * of the tile it lies in, joined across to the other half where that holds
 * a piece too, a + pole red, a − pole ink and a neutral tile green, its mark
 * drawn in the board's background.
 */

import { GREEN, RED } from "../../color/colors.ts";
import { INK } from "../../color/palette.ts";
import { COL_BACKGROUND, COL_ERROR } from "../../color/roles.ts";
import type { GameDrawing } from "../../contract/game.ts";
import type { Color, Rect } from "../../contract/types.ts";
import { drawPiecePart, drawRuledOutCross } from "../piece.ts";
import { type Painter, surfaceOf } from "./painter.ts";

type Mark = "plus" | "minus" | "cross";

/** A pole's bar, and the + pole's upright, as upstream draws them: a bar
 * half the cell wide, an eighth of it thick. */
function drawPole(dr: GameDrawing, cell: Rect, mark: "plus" | "minus", color: number) {
  const cx = cell.x + Math.floor(cell.w / 2);
  const cy = cell.y + Math.floor(cell.h / 2);
  const long = Math.floor(cell.w / 4);
  const thin = Math.max(1, Math.floor(cell.w / 16));
  dr.drawRect({ x: cx - long, y: cy - thin, w: 2 * long + 1, h: 2 * thin + 1 }, color);
  if (mark === "plus")
    dr.drawRect(
      { x: cx - thin, y: cy - long, w: 2 * thin + 1, h: 2 * long + 1 },
      color,
    );
}

const tileHalf = (fill: Color, mark: Mark, dark: boolean): Painter => ({
  colors: () => [fill],
  surface: null,
  dark,
  joins: true,
  paint(dr, tile, slot, error, _grown, _occupied, joined = 0) {
    const cell = surfaceOf(tile);
    drawPiecePart(dr, cell, joined, slot[0], {
      ends: "square",
      divider: null,
      reach: tile,
    });
    // A rule broken at a pole is a red badge under its mark, which tells it
    // on the + pole's own red by the ring of ink round it.
    if (error) {
      const at = { x: cell.x + cell.w / 2, y: cell.y + cell.h / 2 };
      dr.drawCircle(at, cell.w * 0.36, COL_ERROR, COL_BACKGROUND);
    }
    if (mark === "cross") drawRuledOutCross(dr, cell, COL_BACKGROUND);
    else drawPole(dr, cell, mark, COL_BACKGROUND);
  },
});

/** A magnet's + pole. */
export const plus: Painter = tileHalf(RED, "plus", false);

/** A magnet's − pole. */
export const minus: Painter = tileHalf(INK, "minus", true);

/** A neutral tile's square. */
export const neutral: Painter = tileHalf(GREEN, "cross", false);
