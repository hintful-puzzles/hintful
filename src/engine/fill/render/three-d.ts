/**
 * A board drawn raised (`play.numbers.raised`) in 3D: each value stands on
 * its cell, its numeral on its top, and reaches into the tiles up, right and
 * up-right of its own. It is a second tile renderer, so no layer holds it:
 * `drawTile` paints a raised value here in place of its numeral, and the
 * runner calls the hooks below where a raised value reaches past its tile.
 */

import { COL_BACKGROUND } from "../../color/roles.ts";
import type { GameDrawing } from "../../contract/game.ts";
import type { Rect } from "../../contract/types.ts";
import { drawCellBackground, highlightFill } from "../../mechanics/note-taking-cell.ts";
import { hatchPeriod } from "../../render/hatch.ts";
import { pencilIndicatorBox } from "../../render/pencil-indicator.ts";
import { drawSides, RECEIVED_FROM, topFace } from "../../render/raised.ts";
import { type WinTone, winSlot } from "../../render/win-wave.ts";
import type { Clues, FillBoard } from "../board.ts";
import type { FillDrawState } from "../render.ts";
import { slotAt } from "../slots.ts";
import { type Layout, numberText } from "./geometry.ts";
import { drawMistake } from "./layers/mistakes.ts";
import { numeralInk } from "./layers/numerals.ts";
import { highlightOf } from "./layers/surface.ts";
import { COL_CELL, COL_INK } from "./palette.ts";
import type { FillSetup } from "./setup.ts";
import {
  FIXED,
  HINT_LINE,
  MISTAKE,
  RAISED,
  type RaisedAt,
  type TileWords,
  TONE_SHIFT,
} from "./tile-word.ts";

/**
 * The raised value of the cell whose tile is `tile`: its sides and its top,
 * in the cell's surface and its selection's wash, edged in ink; on the top
 * its numeral, its board's `glyph`, the hatch of a striped line and Check &
 * Save's outline. The clip is the caller's: a neighbor's tile, where its
 * top reaches in.
 */
export function paintRaised<C extends Clues<C>>(
  cx: FillSetup<C>,
  top: number,
  dr: GameDrawing,
  tile: Rect,
  { word, hintWord, noteWord }: Omit<RaisedAt, "tile">,
  glyph: (v: number) => string,
): void {
  const { COL_GIVEN, COL_HIGHLIGHT, COL_ENTRY } = cx.pal;
  const ts = tile.w;
  const v = word & 0xff;
  const face = topFace(tile, v, top);
  const tone = ((word >> TONE_SHIFT) & 3) as WinTone;
  const highlight = highlightOf(cx.typed, word, noteWord);
  const surface = tone ? winSlot(tone) : word & FIXED ? COL_GIVEN : COL_CELL;
  drawSides(dr, tile, face, highlightFill(highlight, COL_HIGHLIGHT, surface), COL_INK);
  drawCellBackground(dr, face, highlight, COL_HIGHLIGHT, surface);
  if (hintWord & HINT_LINE) dr.drawHatch(face, hatchPeriod(ts));
  dr.drawPolygon(
    [
      { x: face.x, y: face.y - 1 },
      { x: face.x + ts, y: face.y - 1 },
      { x: face.x + ts, y: face.y + ts - 1 },
      { x: face.x, y: face.y + ts - 1 },
    ],
    -1,
    COL_INK,
  );
  const { origin, options } = numberText(ts, face.x, face.y);
  dr.drawText(origin, options, numeralInk(word, COL_ENTRY), glyph(v));
  if (word & MISTAKE) drawMistake(dr, ts, face.x, face.y);
}

/** The raised values that reach into the tile at `(x, y)` of board `b`,
 * which may be off the board, in the order they are painted over it. */
export const raisedIntoOf =
  <C>(lay: Layout, b: FillBoard<C>, ts: number, tiles: readonly (TileWords | null)[]) =>
  (x: number, y: number): RaisedAt[] => {
    if (!lay.f.threeD) return [];
    const { w, h } = b;
    return RECEIVED_FROM.flatMap(([dx, dy]) => {
      const [sx, sy] = [x + dx, y + dy];
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) return [];
      const t = tiles[sy * w + sx];
      if (t === null || (t.lk & RAISED) === 0) return [];
      const tile = { x: lay.cellX(sx, sy, h, ts), y: lay.coord(sy, ts), w: ts, h: ts };
      return [{ tile, word: t.k, hintWord: t.hk, noteWord: t.nk }];
    });
  };

/** Which tiles of a board `w` by `h` repaint: each that changed, and in 3D
 * each a changed raised value reaches into. Turning 3D off changes every
 * tile, and turning it on every tile around a value, so in 2D none needs
 * it. */
export function repainted(
  threeD: boolean,
  w: number,
  h: number,
  tiles: readonly (TileWords | null)[],
): boolean[] {
  const repaint = tiles.map((t) => t?.changed === true);
  if (threeD)
    tiles.forEach((t, i) => {
      if (!t?.changed) return;
      const [x, y] = [i % w, Math.floor(i / w)];
      for (const [dx, dy] of RECEIVED_FROM) {
        const [rx, ry] = [x - dx, y - dy];
        if (rx >= 0 && ry >= 0 && rx < w && ry < h) repaint[ry * w + rx] = true;
      }
    });
  return repaint;
}

/**
 * The squares above the board and right of it, which the raised values of
 * its top row and right column reach into, where one of those changed: a
 * clue's slot is drawn again by the slots' site, which paints them over it,
 * and any other square is cleared to the background with them over it.
 */
export function repaintMargins<C extends Clues<C>>(
  cx: FillSetup<C>,
  lay: Layout,
  dr: GameDrawing,
  ds: FillDrawState,
  b: FillBoard<C>,
  tiles: readonly (TileWords | null)[],
  raisedInto: (x: number, y: number) => RaisedAt[],
): void {
  const ts = ds.tileSize;
  const { w, h } = b;
  const pencil = cx.notes
    ? pencilIndicatorBox(
        cx.metrics.canvasOf(b, cx.marginValues(b), cx.beneathOf(b), ts),
        ts,
      )
    : null;
  const margin = [
    ...Array.from({ length: w + 1 }, (_, x) => [x, -1] as const),
    ...Array.from({ length: h }, (_, y) => [w, y] as const),
  ];
  for (const [x, y] of margin) {
    const changed = RECEIVED_FROM.some(([dx, dy]) => {
      const [sx, sy] = [x + dx, y + dy];
      return sx >= 0 && sy >= 0 && sx < w && sy < h && tiles[sy * w + sx]?.changed;
    });
    if (!changed) continue;
    const s = cx.slotted ? slotAt(w, h, x, y) : -1;
    if (s >= 0) {
      ds.slots.forget(s);
      continue;
    }
    const box = { x: lay.coord(x, ts), y: lay.coord(y, ts), w: ts, h: ts };
    dr.clip(box);
    dr.drawRect(box, COL_BACKGROUND);
    for (const r of raisedInto(x, y))
      paintRaised(cx, lay.f.top, dr, r.tile, r, cx.glyphOf(b));
    dr.unclip();
    dr.drawUpdate(box);
    if (
      pencil !== null &&
      box.x < pencil.x + pencil.size &&
      pencil.x < box.x + box.w &&
      box.y < pencil.y + pencil.size &&
      pencil.y < box.y + box.h
    )
      ds.pencilModeShown = null;
  }
}
