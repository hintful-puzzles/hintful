/**
 * The hint's line mark: translucent diagonal bands over the squares of the row
 * or column a step's sentence calls "this row" or "this column".
 *
 * A flat fill under content cannot be tuned to work in both schemes
 * (docs/games/hints.md § "Why a fill cannot work, whatever color it is"). The
 * bands cover half the surface and the square's own symbol is drawn over them,
 * so the content keeps its own background under half its area and the line
 * still reads as one striped strip across whatever its squares hold.
 *
 * Every `GameDrawing` draws the same bands from {@link hatchBands}, so the
 * canvas, the recorder and the SVG view cannot disagree about them.
 */

import type { Point, Rect } from "./types.ts";

/** How opaque a band is over what it covers. Held against the board by
 * `puzzle/hatch-contrast.test.ts`, in both schemes. */
export const HATCH_OPACITY = 0.3;

/** The band pitch for a board of `tileSize`: a few bands per square at any
 * size, never so fine that they blur into a fill. */
export const hatchPeriod = (tileSize: number): number =>
  Math.max(6, Math.round(tileSize / 3));

/**
 * The bands covering `rect`, as parallelograms rising left to right, each
 * half of `period` wide. They are laid on the lines `x + y = k · period` of the
 * whole canvas rather than of `rect`, so two neighboring rects hatched
 * separately join into one unbroken pattern. They overhang `rect`; a drawing
 * clips them to it.
 */
export function hatchBands({ x, y, w, h }: Rect, period: number): Point[][] {
  const bands: Point[][] = [];
  const top = y;
  const bottom = y + h;
  const first = Math.floor((x + top) / period) - 1;
  const last = Math.ceil((x + w + bottom) / period);
  for (let k = first; k <= last; k++) {
    const c1 = k * period;
    const c2 = c1 + period / 2;
    bands.push([
      { x: c1 - top, y: top },
      { x: c2 - top, y: top },
      { x: c2 - bottom, y: bottom },
      { x: c1 - bottom, y: bottom },
    ]);
  }
  return bands;
}
