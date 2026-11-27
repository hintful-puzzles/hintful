/**
 * An open cell's notes (`play.notes`), in a grid within it, each the hint
 * strikes crossed through in its own color, so it still reads as the
 * player's.
 */

import { drawStrike } from "../../../render/draw.ts";
import type { FillBoard } from "../../board.ts";
import type { FillUi } from "../../play.ts";
import { NOTES_MODE } from "../tile-word.ts";
import type { TileFrame } from "./layer.ts";

/** The values a note word holds, least first. */
export const notesIn = (noteWord: number): number[] => {
  const out: number[] = [];
  for (let v = 1; v < 32; v++) if (noteWord & (1 << v)) out.push(v);
  return out;
};

/** Cell `i`'s note word: its notes, and `NOTES_MODE` where the selection,
 * on it (`selected`), takes notes. */
export const noteKey = <C>(
  b: FillBoard<C>,
  i: number,
  selected: boolean,
  ui: FillUi,
): number =>
  (b.pencil?.[i] ?? 0) | (selected && ui.pencilMode === true ? NOTES_MODE : 0);

export function paintNotes(
  COL_PENCIL: number,
  glyph: (v: number) => string,
  { dr, ts, at, tile, word, noteWord, part, struck, lay }: TileFrame,
): void {
  if ((word & 0xff) !== 0) return;
  const shown = notesIn(noteWord);
  lay
    .noteSlots(ts, at, part?.walls ?? null, shown.length)
    .forEach(({ origin, options }, j) => {
      dr.drawText(origin, options, COL_PENCIL, glyph(shown[j]));
      if (struck & (1 << shown[j]))
        drawStrike(dr, origin, options.size, COL_PENCIL, tile);
    });
}
