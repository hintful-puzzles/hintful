/**
 * Where the text a cell holds is placed in it: a part's clue, its notes and a
 * typed value. A hint's ring goes round what a cell holds, so each place is
 * fitted to the ring's box (`ringTextBox`), and a clue is set as large as a
 * ring can still step round it.
 */

import type { DrawTextOptions, Point } from "../../contract/types.ts";
import { type NoteSlot, noteGrid } from "../../mechanics/note-taking-cell.ts";
import { glyphFont } from "../../render/draw.ts";
import { type MarkBand, ringTextBox, ringThickness } from "../../render/hint-mark.ts";
import { clearOfRises } from "../../render/raised.ts";
import { ringFits, textBox } from "../../render/ring.ts";
import { type Layout, numberText } from "./geometry.ts";

/** The most notes a cell's ring is fitted round under a clue: the digits,
 * as no board of clues at parts is wider than nine. */
const NOTES_CHECKED = 9;

/** A part's clue's font: a quarter of the tile, from the left. */
const labelFont = (ts: number) =>
  ({
    align: "left",
    baseline: "alphabetic",
    fontType: "variable",
    size: Math.floor(ts / 4),
  }) as const;

export type CellLayout = ReturnType<typeof cellLayoutOf>;

/** Layout `lay` with the places of a cell's text, on a board of clues at
 * parts where `labeled`; `labelSizes` keeps each clue's size across frames. */
export function cellLayoutOf(
  lay: Layout,
  labeled: boolean,
  labelSizes: Map<string, number>,
) {
  const { markBand } = lay;
  const { threeD, top } = lay.f;

  /** Where a part's clue `text` is written in cell `(x, y)`: the top left
   * of the box a hint's ring goes round (upstream keen.c's). */
  const labelText = (
    ts: number,
    at: readonly [number, number, number],
    walls: number | null,
    text: string,
  ) => {
    const band = markBand(ts, at, walls);
    const area = ringTextBox(band);
    const place = (size: number) => {
      const options = { ...labelFont(ts), size };
      const ink = textBox({ x: 0, y: 0 }, options, text);
      return { origin: { x: area.x - ink.x, y: area.y - ink.y }, options };
    };
    // Every glyph a clue says inks one width, so its length decides its size.
    const key = `${ts}:${walls}:${text.length}`;
    let size = labelSizes.get(key);
    if (size === undefined) {
      size = labelFont(ts).size;
      while (size > 1 && !ringStepsRound(ts, at, walls, band, place(size), text))
        size--;
      labelSizes.set(key, size);
    }
    return place(size);
  };

  /** Whether a hint's ring on cell `(x, y)`, centered on it, steps round its
   * clue set at `t`: on the empty cell, and round every count of notes
   * below the clue. A clue of four characters at a small tile, and of five at
   * any, is set smaller until one does. */
  const ringStepsRound = (
    ts: number,
    at: readonly [number, number, number],
    walls: number | null,
    band: MarkBand,
    t: { origin: Point; options: DrawTextOptions },
    text: string,
  ): boolean => {
    const avoid = [textBox(t.origin, t.options, text)];
    const thickness = ringThickness(band);
    const room = { ...band.box };
    for (let count = 0; count <= NOTES_CHECKED; count++) {
      const enclose = noteSlots(ts, at, walls, count).map(({ origin, options }) =>
        textBox(origin, options, "8"),
      );
      if (ringFits(band.box, { enclose, avoid }, thickness, room, true) === null)
        return false;
    }
    return true;
  };

  /** On a board of clues at parts, the part of cell `(x, y)` a hint's ring
   * goes round below a clue's line, in every cell, so a clue neither shrinks
   * what a cell holds nor moves it off its neighbors' rows. */
  const belowClue = (
    ts: number,
    at: readonly [number, number, number],
    walls: number | null,
  ) => {
    const area = ringTextBox(markBand(ts, at, walls));
    // A clue's digits and signs ink one height whatever they say.
    const line = textBox({ x: 0, y: 0 }, labelFont(ts), "0");
    const top = area.y + line.h + Math.max(1, Math.floor(ts / 32));
    return { ...area, y: top, h: area.y + area.h - top };
  };

  /** Where `count` notes go in cell `(x, y)`, in order: the box a hint's
   * ring goes round, so it encloses them all, below a clue's line on a board
   * of clues at parts. */
  const noteSlots = (
    ts: number,
    at: readonly [number, number, number],
    walls: number | null,
    count: number,
  ): NoteSlot[] => {
    const band = markBand(ts, at, walls);
    // In 3D, clear of where the tallest value next door reaches in.
    const area = labeled
      ? belowClue(ts, at, walls)
      : threeD
        ? ringTextBox(band, { within: clearOfRises(band.box, top) })
        : ringTextBox(band);
    return noteGrid(area, count);
  };

  /** Where a typed value goes in cell `(x, y)`, its tile at `(tx, ty)`: the
   * tile's middle; on a board of clues at parts, the middle of the cell below
   * a clue's line, at half a tile as upstream keen.c's, so a clue never sits
   * under the value. */
  const valueText = (
    ts: number,
    at: readonly [number, number, number],
    walls: number | null,
    tx: number,
    ty: number,
  ) => {
    if (!labeled) return numberText(ts, tx, ty);
    const area = belowClue(ts, at, walls);
    return {
      origin: { x: tx + Math.floor(ts / 2), y: Math.floor(area.y + area.h / 2) },
      options: glyphFont(Math.floor(ts / 2)),
    };
  };

  return { ...lay, labelText, noteSlots, valueText };
}
