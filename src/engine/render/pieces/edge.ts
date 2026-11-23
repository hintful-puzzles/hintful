/**
 * The painters that draw a clue at an edge in the gap between its two cells
 * (`play.gaps`, `engine/fill/render.ts`), by the name a description gives.
 * A clue valued one of the edge's ends is drawn toward the other end.
 */

import type { GameDrawing } from "../../contract/game.ts";
import type { Rect } from "../../contract/types.ts";

/** A direction from a cell, up, right, down and left. */
export type Side = 0 | 1 | 2 | 3;

export interface EdgePainter {
  /**
   * Draw the clue in `gap`, the box between the two cells, in the palette's
   * slot `color`. `toward` is the side, from the end the clue is valued, its
   * other end lies on.
   */
  paint(dr: GameDrawing, gap: Rect, toward: Side, color: number): void;
  /** The clue as one character of the board's text, between its cells. */
  glyph(toward: Side): string;
}

/**
 * A greater-than sign, its open side to the greater end and its point to
 * the lesser (upstream unequal.c's `draw_gt`): two strokes a polygon of six
 * points, two pixels thick.
 */
const chevron: EdgePainter = {
  paint(dr, gap, toward, color) {
    // Across the gap's short side, a quarter in; along it, half each way.
    const across = toward === 1 || toward === 3;
    const thin = across ? gap.w : gap.h;
    const g2 = Math.floor((thin + 1) / 2);
    const g4 = Math.floor((thin + 1) / 4);
    const long = across ? gap.h : gap.w;
    const mid = Math.floor(long / 2);
    // Its open end, then the step to its point, then back out: as `draw_gt`.
    const [ox, oy, dx1, dy1, dx2, dy2] = [
      [gap.x + mid - g2, gap.y + gap.h - g4, g2, -g2, g2, g2],
      [gap.x + g4, gap.y + mid - g2, g2, g2, -g2, g2],
      [gap.x + mid - g2, gap.y + g4, g2, g2, g2, -g2],
      [gap.x + gap.w - g4, gap.y + mid - g2, -g2, g2, g2, g2],
    ][toward];
    const xdx = dx1 + dx2 ? 0 : 1;
    const xdy = dx1 + dx2 ? 1 : 0;
    dr.drawPolygon(
      [
        { x: ox + xdx, y: oy + xdy },
        { x: ox + xdx + dx1, y: oy + xdy + dy1 },
        { x: ox + xdx + dx1 + dx2, y: oy + xdy + dy1 + dy2 },
        { x: ox - xdx + dx1 + dx2, y: oy - xdy + dy1 + dy2 },
        { x: ox - xdx + dx1, y: oy - xdy + dy1 },
        { x: ox - xdx, y: oy - xdy },
      ],
      color,
      color,
    );
  },
  glyph: (toward) => "^>v<"[toward],
};

export const EDGE_PAINTERS = { chevron } as const satisfies Record<string, EdgePainter>;

export type EdgePainterName = keyof typeof EDGE_PAINTERS;
