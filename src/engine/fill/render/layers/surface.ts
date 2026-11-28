/**
 * The bottom of a tile: the grid line or the walls, its part's and the
 * player's dividers', and the surface
 * inside them, the piece's own, the win flash's, a dealt cell's, a washed
 * cell's, the part's fill or an undecided cell's; under it the selection's
 * wash and a striped line's hatch, and the diagonals the board has as units.
 */

import type { Rect } from "../../../contract/types.ts";
import { regionFills } from "../../../generate/region-fill.ts";
import {
  type CellHighlight,
  drawCellBackground,
  HIGHLIGHT_ENTRY,
  HIGHLIGHT_NONE,
  HIGHLIGHT_NOTES,
} from "../../../mechanics/note-taking-cell.ts";
import { hatchPeriod } from "../../../render/hatch.ts";
import {
  drawInsetWalls,
  drawWalledSquare,
  regionWalls,
} from "../../../render/region-walls.ts";
import { type WinTone, winSlot } from "../../../render/win-wave.ts";
import type { Partition } from "../../../solve/describe-runtime.ts";
import { type Clues, type FillBoard, spaceOf, walledParts } from "../../board.ts";
import { dividerSides } from "../../dividers.ts";
import type { FillDrawState } from "../../render.ts";
import { COL_CELL, COL_GRID, type FillPalette, REGION_SURFACES } from "../palette.ts";
import type { FillSetup } from "../setup.ts";
import {
  ALONG_COLUMN,
  ALONG_ROW,
  CURSOR,
  DIVIDER_SHIFT,
  DIVIDER_SIDES,
  FIXED,
  HINT_LINE,
  NOTES_MODE,
  TONE_SHIFT,
  WASHED,
} from "../tile-word.ts";
import type { TileFrame } from "./layer.ts";

/** Each cell's walls and the slot of its part's fill, where the board has
 * a partition drawn; and where it has them, its inset partition's walls
 * and the diagonals through it. */
export function partsOf<C extends Clues<C>>(
  { module, inset, pal }: FillSetup<C>,
  b: FillBoard<C>,
): FillDrawState["parts"] {
  const of = walledParts(module, b);
  if (of === null) return null;
  const fills = regionFills(of, b.w, REGION_SURFACES.length);
  const sp = spaceOf(module, b);
  const diagonal = new Uint8Array(b.w * b.h);
  sp.diagonals.forEach((L, k) => {
    if (!sp.units.includes(L)) return;
    for (const c of sp.lineCells[L]) diagonal[c] |= 1 << k;
  });
  // A partition a variation adds is dealt only on a board with it on.
  const insetParts =
    inset === undefined
      ? undefined
      : ((b.dealt as Readonly<Record<string, unknown>>)[inset] as
          | Partition
          | undefined);
  return {
    walls: regionWalls(b.w, b.h, of),
    fills: Uint8Array.from(of, (r) => pal.COL_REGION + fills[r]),
    inset: insetParts === undefined ? null : regionWalls(b.w, b.h, insetParts.of),
    diagonal,
  };
}

/** Cell `(x, y)`'s walls, its part's and the player's dividers', `null`
 * where it has neither. */
export function wallsAt<C>(
  ds: FillDrawState,
  b: FillBoard<C>,
  x: number,
  y: number,
): number | null {
  const ruled = dividerSides(b, x, y);
  const part = ds.parts?.walls[y * b.w + x];
  return part === undefined ? (ruled === 0 ? null : ruled) : part | ruled;
}

/** A cell's selection as drawn: a board of numbers (`typed`) shows it as the
 * note-taking cell's highlight, where a board of buttons draws the cursor's
 * corners. */
export const highlightOf = (
  typed: boolean,
  word: number,
  noteWord: number,
): CellHighlight =>
  (word >> TONE_SHIFT) & 3 || !typed || (word & CURSOR) === 0
    ? HIGHLIGHT_NONE
    : noteWord & NOTES_MODE
      ? HIGHLIGHT_NOTES
      : HIGHLIGHT_ENTRY;

/** A sixth of a tile's stroke from each of the tile's corners that lies
 * inside a grid `boardW` wide, toward its middle: with its three neighbors'
 * a small cross at every corner inside the grid (`play.cornerCrosses`,
 * upstream abcd.c's diagonal mode). */
export function paintCornerCrosses(frame: TileFrame, boardW: number): void {
  const { dr, ts, tx, ty } = frame;
  const [x, y, h] = frame.at;
  const d = Math.floor(ts / 6);
  for (const [right, down] of [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ] as const) {
    const inside =
      (right === 0 ? x > 0 : x < boardW - 1) && (down === 0 ? y > 0 : y < h - 1);
    if (!inside) continue;
    const corner = { x: tx + right * ts, y: ty + down * ts };
    dr.drawLine(
      corner,
      { x: corner.x + (right === 0 ? d : -d), y: corner.y + (down === 0 ? d : -d) },
      COL_GRID,
      1,
    );
  }
}

/** A stroke corner to corner under the content of a square where a row
 * meets the same column (`play.leadingDiagonal`, upstream group.c's): a
 * guide to where a value is combined with itself, which no rule reads. */
export function paintLeadingDiagonal(frame: TileFrame): void {
  const { dr, ts, tx, ty } = frame;
  dr.drawLine({ x: tx, y: ty }, { x: tx + ts, y: ty + ts }, COL_GRID, 1);
}

export function paintSurface(
  pal: FillPalette,
  frame: TileFrame,
  highlight: CellHighlight,
): void {
  const { dr, ts, tile, tx, ty, word, hintWord, lineWord, part, piece } = frame;
  const [x, y, h] = frame.at;
  const { boardW } = frame.lay.f;
  const { listed } = frame.lay.m;
  const tone = ((word >> TONE_SHIFT) & 3) as WinTone;
  // A cell selected for notes keeps its plain surface under the notes'
  // triangle, a gap in a site's wash as the selection's own is, so the
  // notes stay in the pencil's ink on the surface it is tuned for.
  const along =
    highlight === HIGHLIGHT_NOTES
      ? null
      : lineWord & ALONG_ROW
        ? pal.COL_ALONG_ROW
        : lineWord & ALONG_COLUMN
          ? pal.COL_ALONG_COLUMN
          : null;
  const ground = tone
    ? winSlot(tone)
    : along !== null
      ? along
      : piece !== null && piece.painter.surface !== null
        ? piece.slot[piece.painter.surface]
        : frame.highlight >= 0
          ? pal.COL_HIGHLIGHT_PAINT + frame.highlight
          : word & FIXED
            ? pal.COL_GIVEN
            : lineWord & WASHED
              ? pal.COL_WASH
              : (part?.fill ?? COL_CELL);
  // Under the content, so the piece stays whole.
  const lay = (surface: Rect) => {
    drawCellBackground(dr, surface, highlight, pal.COL_HIGHLIGHT, ground);
    if (hintWord & HINT_LINE) dr.drawHatch(surface, hatchPeriod(ts));
  };

  // A player's divider is drawn as a wall, a part's or none beside it.
  const ruled = (lineWord & DIVIDER_SIDES) >> DIVIDER_SHIFT;
  if (part === null && ruled === 0) {
    dr.drawRect(tile, COL_GRID);
    // A board of lists doubles every fifth line inside it, to count along
    // a list by (upstream pattern.c's `grid_square`).
    const ruled = (i: number, n: number, at: 0 | 4) =>
      listed && i % 5 === at && (at === 0 ? i > 0 : i < n - 1) ? 1 : 0;
    const [l, t] = [ruled(x, boardW, 0), ruled(y, h, 0)];
    const [r, b] = [ruled(x, boardW, 4), ruled(y, h, 4)];
    lay({ x: tx + 1 + l, y: ty + 1 + t, w: ts - 1 - l - r, h: ts - 1 - t - b });
  } else {
    drawWalledSquare(
      dr,
      ts,
      tile,
      (part?.walls ?? 0) | ruled,
      { grid: COL_GRID, wall: pal.COL_WALL },
      lay,
    );
    if (part === null) return;
    // The diagonals a board has as units, corner to corner under the
    // content (upstream solo.c's X).
    if (part.diagonal & 1)
      dr.drawLine({ x: tx, y: ty }, { x: tx + ts, y: ty + ts }, COL_GRID, 1);
    if (part.diagonal & 2)
      dr.drawLine({ x: tx + ts, y: ty }, { x: tx, y: ty + ts }, COL_GRID, 1);
    // A part's clue sits inside the inset outline, clear of its dashes.
    if (part.inset >= 0) drawInsetWalls(dr, ts, tile, part.inset, pal.COL_WALL);
  }
}
