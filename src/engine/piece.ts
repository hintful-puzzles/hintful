/**
 * **A piece**: the thing a cell holds on a board whose content is pieces. It
 * sits inset on its cell (`cellSurface`, `palette.ts`), so the grid shows
 * between two neighbors of one kind, and the marks a game draws at a cell's
 * edge (a cursor, a hint's ring) land beside the piece and never on it.
 *
 * A piece's kind is its shape as well as its color. Hue alone fails a
 * color-blind player, and a shape is still there in a grayscale screenshot.
 */

import { TWO_NAMES } from "./color/colors.ts";
import type { GameDrawing } from "./game.ts";
import type { Point, Rect } from "./types.ts";

export type PieceShape = "square" | "disc";

/** The shapes of the two-state pair, in the order of `TWO` (`colors.ts`). */
export const TWO_SHAPES: readonly [PieceShape, PieceShape] = ["square", "disc"];

/**
 * `source`, a help page, with each `{{pair:0}}` and `{{pair:1}}` replaced by
 * that member's name. A page names a piece's color this way and never types
 * it, so the page follows the pair as a hint's sentence does.
 */
export function expandPair(source: string): string {
  return source.replace(/\{\{pair:([^}]*)\}\}/g, (whole, index: string) => {
    const name = index === "0" ? TWO_NAMES[0] : index === "1" ? TWO_NAMES[1] : null;
    if (name === null) throw new Error(`${whole}: the pair has members 0 and 1`);
    return name;
  });
}

/** How far a piece stands in from each side of its cell. */
const inset = (cell: Rect): number => Math.max(2, Math.round(cell.w / 9));

/** The points of a square of half-side `r` about `c`, its corners rounded. */
function roundedSquare(c: Point, r: number): Point[] {
  const corner = r * 0.32;
  const steps = 4;
  const out: Point[] = [];
  // One quarter turn per corner, starting at the bottom right and going round.
  const centers: readonly (readonly [number, number])[] = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];
  centers.forEach(([sx, sy], quarter) => {
    const cx = c.x + sx * (r - corner);
    const cy = c.y + sy * (r - corner);
    for (let i = 0; i <= steps; i++) {
      const a = ((quarter + i / steps) * Math.PI) / 2;
      out.push({ x: cx + corner * Math.cos(a), y: cy + corner * Math.sin(a) });
    }
  });
  return out;
}

/**
 * Draw a piece of `shape` in `color` on `cell`, the box of the cell's surface.
 * `grown` is how much of its size it has, for a piece that is being placed (it
 * grows from the middle) or taken away.
 */
export function drawPiece(
  dr: GameDrawing,
  cell: Rect,
  shape: PieceShape,
  color: number,
  grown = 1,
): void {
  const r = (cell.w / 2 - inset(cell)) * grown;
  if (r < 0.5) return;
  const c = { x: cell.x + cell.w / 2, y: cell.y + cell.h / 2 };
  if (shape === "disc") dr.drawCircle(c, r, color, color);
  else dr.drawPolygon(roundedSquare(c, r), color, color);
}
