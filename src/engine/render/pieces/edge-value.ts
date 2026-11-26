/**
 * The painters that draw a value of an answer whose values sit on the edges
 * between squares (`answer.value.sort: edge`), by the name a description's
 * `paint:` gives: a wall on the side two squares share, a line from one
 * square's middle to the other's, or a cross on the side.
 *
 * An edge runs one of two ways, so a painter's text is two strings, and a
 * value has no glyph of its own: the text format prints an edge where a
 * boxed grid prints the wall between its squares (`board/grid-text.ts`).
 *
 * Each of the edge's two squares draws its half, in its own clip: a painter
 * is told the square and the side, and draws what lies in that square.
 */

import { INK, RULED_OUT } from "../../color/palette.ts";
import type { GameDrawing } from "../../contract/game.ts";
import type { Color, Rect } from "../../contract/types.ts";
import { wallHalf } from "../region-walls.ts";

/** What an edge's value prints as in a boxed grid's text, and how its
 * square draws it. */
export interface EdgeValuePainter {
  /** Between two squares side by side, in the one-character wall. */
  readonly beside: string;
  /** Between two squares one above the other, in the three-character wall. */
  readonly above: string;
  /** The color the mark is drawn in, one of the palette's named colors. */
  colors(background: Color): readonly Color[];
  /** The part of the mark that lies in `tile`, on its side `d` (up, right,
   * down, left), in `color`. */
  paint(dr: GameDrawing, tile: Rect, d: number, color: number): void;
}

/** The middle of `tile`'s side `d`. */
function sideMiddle(tile: Rect, d: number): { x: number; y: number } {
  const half = Math.floor(tile.w / 2);
  return [
    { x: tile.x + half, y: tile.y },
    { x: tile.x + tile.w, y: tile.y + half },
    { x: tile.x + half, y: tile.y + tile.h },
    { x: tile.x, y: tile.y + half },
  ][d];
}

/** A wall: the thick line a partition's regions are drawn with
 * (`region-walls.ts`), this square's half of it. */
const wall: EdgeValuePainter = {
  beside: "|",
  above: "---",
  colors: () => [INK],
  paint(dr, { x, y, w: ts }, d, color) {
    const g = wallHalf(ts);
    const far = ts - g;
    dr.drawRect(
      [
        { x, y, w: ts, h: 1 + g },
        { x: x + far, y, w: g, h: ts },
        { x, y: y + far, w: ts, h: g },
        { x, y, w: 1 + g, h: ts },
      ][d],
      color,
    );
  },
};

/** A line: Pearl's and Tracks' laid line, from the square's middle to the
 * side, with a cap at the middle where it meets the square's other lines. */
const line: EdgeValuePainter = {
  beside: "-",
  above: " | ",
  colors: () => [INK],
  paint(dr, tile, d, color) {
    const half = Math.floor(tile.w / 2);
    const t = Math.max(1, half >> 2);
    const cx = tile.x + half;
    const cy = tile.y + half;
    const to = sideMiddle(tile, d);
    const x0 = Math.min(cx, to.x) - t;
    const y0 = Math.min(cy, to.y) - t;
    dr.drawRect(
      {
        x: x0,
        y: y0,
        w: Math.abs(to.x - cx) + 2 * t + 1,
        h: Math.abs(to.y - cy) + 2 * t + 1,
      },
      color,
    );
  },
};

/** A cross: the edge ruled out, a small cross on the side, as Pearl's. */
const cross: EdgeValuePainter = {
  beside: "x",
  above: " x ",
  colors: () => [RULED_OUT],
  paint(dr, tile, d, color) {
    const { x, y } = sideMiddle(tile, d);
    const r = Math.max(2, Math.floor(tile.w / 8));
    const thick = Math.max(1, Math.floor(tile.w / 24));
    dr.drawLine({ x: x - r, y: y - r }, { x: x + r, y: y + r }, color, thick);
    dr.drawLine({ x: x - r, y: y + r }, { x: x + r, y: y - r }, color, thick);
  },
};

export const EDGE_VALUE_PAINTERS = { wall, line, cross } as const satisfies Record<
  string,
  EdgeValuePainter
>;

export type EdgeValuePainterName = keyof typeof EDGE_VALUE_PAINTERS;
