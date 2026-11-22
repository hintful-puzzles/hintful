/**
 * The two-state pair's pieces, a block and a disc, each in its member's color
 * (`TWO`, `colors.ts`): the pieces of a game whose two values are alike, as
 * Unruly's (`docs/rendering.md` § "When two games share a mechanic, they
 * share its look too").
 */

import { TWO } from "../../color/colors.ts";
import { ERROR_TEXT } from "../../color/palette.ts";
import { COL_ERROR } from "../../color/roles.ts";
import type { GameDrawing } from "../../contract/game.ts";
import type { Rect } from "../../contract/types.ts";
import { glyphFont } from "../draw.ts";
import { drawPiece, type PairIndex, TWO_SHAPES } from "../piece.ts";
import { type Painter, surfaceOf } from "./painter.ts";

/** A rule broken at a pair piece: a badge with a `!` over its middle, since red
 * ink on a purple piece differs in hue and not in lightness. */
function drawBadge(dr: GameDrawing, tile: Rect, text: number): void {
  const at = { x: tile.x + Math.floor(tile.w / 2), y: tile.y + Math.floor(tile.h / 2) };
  dr.drawCircle(at, tile.w / 4, COL_ERROR, COL_ERROR);
  dr.drawText(at, glyphFont(Math.floor((tile.w * 2) / 5)), text, "!");
}

const pairPiece = (i: PairIndex): Painter => ({
  colors: () => [TWO[i], ERROR_TEXT],
  surface: null,
  pair: i,
  grows: true,
  paint(dr, tile, slot, error, grown = 1) {
    drawPiece(dr, surfaceOf(tile), TWO_SHAPES[i], slot[0], grown);
    if (error) drawBadge(dr, tile, slot[1]);
  },
});

/** The pair's first piece, the block. */
export const block: Painter = pairPiece(0);

/** The pair's second piece, the disc. */
export const disc: Painter = pairPiece(1);
