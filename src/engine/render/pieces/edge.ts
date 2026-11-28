/**
 * The painters that draw a clue at an edge in the gap between its two cells
 * (`play.gaps`, `engine/fill/render/sites/gaps.ts`), by the name a
 * description gives.
 * A clue valued one of the edge's ends is drawn toward the other end; a clue
 * valued a number, from the edge's end above or left of the other.
 */

import { COL_BACKGROUND } from "../../color/roles.ts";
import type { GameDrawing } from "../../contract/game.ts";
import type { Rect } from "../../contract/types.ts";

/** A direction from a cell, up, right, down and left. */
export type Side = 0 | 1 | 2 | 3;

/** A clue as its painter reads it: the side, from the end the clue is drawn
 * from, its other end lies on, and its value, where it is a number. */
export interface EdgeClue {
  readonly toward: Side;
  readonly value: number;
}

export interface EdgePainter {
  /** What the clues it draws are valued: one of the edge's ends, or a
   * number. */
  readonly of: "end" | "number";
  /**
   * Draw the clue in `gap`, the box between the two cells, in the palette's
   * slot `color`; `broken` where the clue breaks.
   */
  paint(
    dr: GameDrawing,
    gap: Rect,
    clue: EdgeClue,
    color: number,
    broken: boolean,
  ): void;
  /** Whether the clue is drawn on a board where it holds: a press marks only
   * a clue that is. */
  shows(clue: EdgeClue): boolean;
  /** The clue as one character of the board's text, between its cells. */
  glyph(clue: EdgeClue): string;
}

/**
 * A greater-than sign, its open side to the greater end and its point to
 * the lesser (upstream unequal.c's `draw_gt`): two strokes a polygon of six
 * points, two pixels thick.
 */
const chevron: EdgePainter = {
  of: "end",
  paint(dr, gap, { toward }, color) {
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
  shows: () => true,
  glyph: ({ toward }) => "^>v<"[toward],
};

/**
 * A bar across the gap where the clue is 1, and none where it is 0
 * (upstream unequal.c's `draw_adjs`): a band a quarter of the gap thick down
 * its middle. A 0 that breaks, two neighbors one apart with no bar, is the
 * band's outline.
 */
const bar: EdgePainter = {
  of: "number",
  paint(dr, gap, clue, color, broken) {
    if (clue.value === 0 && !broken) return;
    const across = clue.toward === 1 || clue.toward === 3;
    const thin = across ? gap.w : gap.h;
    const at = Math.floor((3 * (thin + 1)) / 8);
    const width = Math.floor((thin + 1) / 4);
    const band = across
      ? { x: gap.x + at, y: gap.y, w: width, h: gap.h }
      : { x: gap.x, y: gap.y + at, w: gap.w, h: width };
    if (clue.value !== 0) {
      dr.drawRect(band, color);
      return;
    }
    const [r, b] = [band.x + band.w - 1, band.y + band.h - 1];
    dr.drawPolygon(
      [
        { x: band.x, y: band.y },
        { x: r, y: band.y },
        { x: r, y: b },
        { x: band.x, y: b },
      ],
      -1,
      color,
    );
  },
  shows: (clue) => clue.value !== 0,
  glyph: (clue) => (clue.value === 0 ? " " : clue.toward === 1 ? "|" : "-"),
};

/**
 * A horseshoe, valued by which end holds the other: 1 the end the clue is
 * drawn from (above or left), 2 the other, 0 neither. Its open side faces
 * the end that holds, its rounded side the end held (upstream subsets.c's
 * `draw_arrow`): a ring two pixels thick, seven tenths of the gap across,
 * whose half toward the holder is drawn as two straight legs. A 0 that
 * breaks, two neighbors one of which holds the other, is a cross.
 */
const shoe: EdgePainter = {
  of: "number",
  paint(dr, gap, { toward, value }, color, broken) {
    const across = toward === 1 || toward === 3;
    const thin = across ? gap.w : gap.h;
    const radius = Math.floor((Math.floor(thin * 0.7) | 1) / 2);
    const cx = gap.x + Math.floor(gap.w / 2);
    const cy = gap.y + Math.floor(gap.h / 2);
    if (value === 0) {
      if (!broken) return;
      for (const s of [1, -1])
        dr.drawLine(
          { x: cx - radius, y: cy - s * radius },
          { x: cx + radius, y: cy + s * radius },
          color,
          2,
        );
      return;
    }
    const d = 2 * radius + 1;
    dr.drawCircle({ x: cx, y: cy }, radius, color, color);
    dr.drawCircle({ x: cx, y: cy }, radius - 2, COL_BACKGROUND, COL_BACKGROUND);
    // The half toward the holder, the end the clue is drawn from where it
    // is 1, squared off into two legs.
    const back = value === 1;
    if (across) {
      const x = back ? cx - radius : cx + 1;
      dr.drawRect({ x, y: cy - radius, w: radius, h: d }, color);
      dr.drawRect({ x, y: cy - radius + 2, w: radius, h: d - 4 }, COL_BACKGROUND);
    } else {
      const y = back ? cy - radius : cy + 1;
      dr.drawRect({ x: cx - radius, y, w: d, h: radius }, color);
      dr.drawRect({ x: cx - radius + 2, y, w: d - 4, h: radius }, COL_BACKGROUND);
    }
  },
  shows: (clue) => clue.value !== 0,
  glyph: ({ toward, value }) =>
    value === 0
      ? " "
      : toward === 1
        ? value === 1
          ? "⊃"
          : "⊂"
        : value === 1
          ? "∪"
          : "∩",
};

export const EDGE_PAINTERS = { chevron, bar, shoe } as const satisfies Record<
  string,
  EdgePainter
>;

export type EdgePainterName = keyof typeof EDGE_PAINTERS;
