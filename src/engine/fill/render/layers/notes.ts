/**
 * An open cell's notes (`play.notes`), in a grid within it, each the hint
 * strikes crossed through in its own color, so it still reads as the
 * player's. On a board drawn as pictures each note is its value's piece,
 * small, in a two-by-two grid (`cell-text.ts`'s `pictureSlots`), or, where
 * every piece points, each on the side it points to (`pointedSlot`).
 */

import { drawStrike, glyphFont } from "../../../render/draw.ts";
import type { FillBoard } from "../../board.ts";
import type { FillUi } from "../../play.ts";
import { COL_INK, type Placed } from "../palette.ts";
import { BALL, NOTES_MODE } from "../tile-word.ts";
import type { TileFrame } from "./layer.ts";

/** The values a note word holds, least first. */
export const notesIn = (noteWord: number): number[] => {
  const out: number[] = [];
  for (let v = 1; v < 32; v++) if (noteWord & (1 << v)) out.push(v);
  return out;
};

/** Cell `i`'s note word: its notes, and `NOTES_MODE` where the selection,
 * on it (`selected`), takes notes, or is armed for one. */
export const noteKey = <C>(
  b: FillBoard<C>,
  i: number,
  selected: boolean,
  ui: FillUi,
): number =>
  (b.pencil?.[i] ?? 0) |
  (selected && (ui.pencilMode === true || ui.armed === "note") ? NOTES_MODE : 0);

/** A cell's notes, each its glyph; or where `pieceOf` is given, the board
 * drawn as pictures, each its value's piece. */
export function paintNotes(
  COL_PENCIL: number,
  glyph: (v: number) => string,
  { dr, ts, at, tile, word, lineWord, noteWord, part, struck, lay }: TileFrame,
  pieceOf: ((v: number) => Placed | null) | null,
): void {
  if ((word & 0xff) !== 0) return;
  const shown = notesIn(noteWord);
  if (pieceOf !== null) {
    const walls = part?.walls ?? null;
    const pieces = shown.map(pieceOf);
    // Where every piece points, each note sits on the side it points to,
    // whatever else the cell notes; else they fill the cell in turn.
    const ways = pieces.map((p) => p?.painter.points ?? null);
    const boxes = ways.every((way): way is readonly [number, number] => way !== null)
      ? ways.map((way) => lay.pointedSlot(ts, at, walls, way))
      : lay.pictureSlots(ts, at, walls, shown.length);
    boxes.forEach((box, j) => {
      const placed = pieces[j];
      // The piece is drawn in three quarters of its tile: a tile a third
      // larger than the slot fills it.
      const grown = Math.floor((box.w * 4) / 3);
      const inset = Math.floor((grown - box.w) / 2);
      const piece = { x: box.x - inset, y: box.y - inset, w: grown, h: grown };
      const middle = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
      if (placed?.painter.note !== undefined) placed.painter.note(dr, box, placed.slot);
      else if (placed !== null) placed.painter.paint(dr, piece, placed.slot, false);
      else
        dr.drawText(
          middle,
          glyphFont(Math.floor(box.w / 2)),
          COL_PENCIL,
          glyph(shown[j]),
        );
      // A piece's own ink is its outline's, which a strike through it
      // keeps; a glyph's, and a note drawn as one, the pencil's.
      if (struck & (1 << shown[j]))
        drawStrike(
          dr,
          middle,
          Math.floor((box.w * 2) / 3),
          placed === null || placed.painter.note !== undefined ? COL_PENCIL : COL_INK,
          tile,
          { slant: true },
        );
    });
    return;
  }
  lay
    .noteSlots(ts, at, part?.walls ?? null, shown.length, (lineWord & BALL) !== 0)
    .forEach(({ origin, options }, j) => {
      dr.drawText(origin, options, COL_PENCIL, glyph(shown[j]));
      if (struck & (1 << shown[j]))
        drawStrike(dr, origin, options.size, COL_PENCIL, tile);
    });
}
