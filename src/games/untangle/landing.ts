/**
 * Where a dragged point can land, as the hint has to plan for it.
 *
 * A drop lands on a whole pixel (`pointerDrop`), or on a snap cell with the
 * snap-to-grid preference on, and the hint does not know the tile size the
 * board is drawn at. So a spot it asks for is one whose every nearby landing
 * reads the same: the landing is within {@link HALF_PIXEL} of the spot on each
 * axis at any tile size from {@link TS_MIN} up, and the spot keeps clear of the
 * play-area clamp there.
 */

import { PLAY_MARGIN, type RationalPoint } from "./state.ts";

/**
 * The smallest tile size, in pixels per board unit, the hint's spots are
 * guaranteed at. The midend draws at whatever tile fits the view and enforces
 * no floor, so this one is chosen: below 16 px a unit is barely wider than a
 * point's 12 px blob, so points a unit apart run together and cannot be told
 * apart under a finger, and the play-area clamp (`PLAY_MARGIN`, 8 px) would
 * swallow the half unit of frame gap every preset keeps (`EDGE_GAP` of a point
 * spacing, which is at least 1.5 units from 6 points up). At 16 px it does not.
 */
export const TS_MIN = 16;

/** How far a drop can land from the spot it was aimed at, on each axis, in
 * board units: half a pixel at {@link TS_MIN}. */
export const HALF_PIXEL = 1 / (2 * TS_MIN);

/** How close to the frame a spot may be, in board units: nearer, and the
 * play-area clamp moves the drop at the smallest tile size. */
export const FRAME_MARGIN = PLAY_MARGIN / TS_MIN;

/**
 * Is `p` within the half-pixel box of `t`, the square of half-width
 * {@link HALF_PIXEL} around it? Exact: the coordinates are integers over their
 * denominators.
 */
export function withinReach(p: RationalPoint, t: RationalPoint): boolean {
  const near = (a: number, b: number) =>
    Math.abs(a * t.d - b * p.d) * 2 * TS_MIN <= p.d * t.d;
  return near(p.x, t.x) && near(p.y, t.y);
}

/** The snap grid's denominator, for `n` points (as `placeDraggedPoint`). */
export const snapDenominator = (n: number): number => 2 * (n - 1);

/** Snap cell `g`'s center along one axis, over {@link snapDenominator}. */
export const snapCenter = (w: number, g: number): number => (2 * g + 1) * w;

/**
 * Can the pointer land on every snap cell at {@link TS_MIN}? A cell narrower
 * than a pixel may take no drop at all, and a drop aimed at a cell's center
 * lands up to half a pixel off it.
 */
export const snapCellsLandable = (n: number, w: number): boolean => w * TS_MIN > n - 1;
