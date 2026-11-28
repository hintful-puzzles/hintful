/**
 * An arrow a way, and the goal the arrows lead to: upstream rome.c's
 * `draw_arrow`, a shaft and two strokes of its head, in the player's entry
 * color, in ink where the puzzle gave it, in pencil as a note, and red where
 * a rule breaks at it; and its goal, a disc.
 */

import { GOAL, INK, pencilColor, playerEntryColor } from "../../color/palette.ts";
import { COL_ERROR } from "../../color/roles.ts";
import type { GameDrawing } from "../../contract/game.ts";
import type { Rect } from "../../contract/types.ts";
import type { Painter } from "./painter.ts";

/** The head's half-width, of the arrow's half-length (upstream's
 * `SIDE_SIZE`). */
const SIDE = 0.6;

/** The arrow's half-length, of its tile. */
const REACH = 0.3;

/** A note's half-length, of its box: upstream's 0.12 of a tile in a box a
 * quarter of it. */
const NOTE_REACH = 0.48;

/** An arrow pointing `[dx, dy]`, centered in `box` with half-length `size`,
 * in `color`. A short one is a hairline: two pixels from a 34-pixel tile up,
 * as upstream's notes are hard to see thinner on the cell's surface. */
function drawArrow(
  dr: GameDrawing,
  box: Rect,
  [dx, dy]: readonly [number, number],
  size: number,
  color: number,
): void {
  const thick = size <= 4 ? 1 : 2;
  const x = box.x + Math.floor(box.w / 2);
  const y = box.y + Math.floor(box.h / 2);
  const p = (u: number, v: number) => ({ x: Math.round(u), y: Math.round(v) });
  const tip = p(x + dx * size, y + dy * size);
  dr.drawLine(p(x - dx * size, y - dy * size), tip, color, thick);
  // The head's two strokes meet at the tip from either side of the shaft,
  // reaching back to the arrow's middle.
  const side = size * SIDE;
  for (const s of [-1, 1])
    dr.drawLine(p(x + s * dy * side, y + s * dx * side), tip, color, thick);
}

/** An arrow's colors, whichever way it points: the player's entry, the ink a
 * given is drawn in, and the pencil a note is. One function, so the four
 * arrows share their slots. */
const arrowColors: Painter["colors"] = (background) => [
  playerEntryColor(background),
  INK,
  pencilColor(background),
];

/** The arrow pointing `way`. */
function arrow(way: readonly [number, number]): Painter {
  return {
    colors: arrowColors,
    surface: null,
    points: way,
    paint(dr, tile, slot, error) {
      drawArrow(dr, tile, way, tile.w * REACH, error ? COL_ERROR : slot[0]);
    },
    given(dr, tile, slot) {
      drawArrow(dr, tile, way, tile.w * REACH, slot[1]);
    },
    note(dr, box, slot) {
      drawArrow(dr, box, way, box.w * NOTE_REACH, slot[2]);
    },
  };
}

export const arrowUp = arrow([0, -1]);
export const arrowDown = arrow([0, 1]);
export const arrowLeft = arrow([-1, 0]);
export const arrowRight = arrow([1, 0]);

/** A goal: a disc a third of its tile across from the middle, upstream's. */
export const goal: Painter = {
  colors: () => [GOAL],
  surface: null,
  paint(dr, tile, slot, error) {
    const color = error ? COL_ERROR : slot[0];
    const c = {
      x: tile.x + Math.floor(tile.w / 2),
      y: tile.y + Math.floor(tile.h / 2),
    };
    dr.drawCircle(c, Math.floor(tile.w / 3), color, color);
  },
};
