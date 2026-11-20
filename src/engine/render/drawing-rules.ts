/**
 * What a `GameDrawing` accepts, for the canvas drawing and the test recorder
 * alike: a call the app's canvas would refuse fails the test that makes it,
 * and a call the canvas draws nothing for leaves nothing in the record.
 */
import type { Point, Rect } from "../contract/types.ts";

/** Which argument a palette index was passed as, for the error that names it. */
export type InkRole = "fillColor" | "strokeColor";

/** Palette entry `index`, or an error naming the argument when the palette has
 * no such entry: a negative index, one past the end, or a fraction. */
export function paletteInk<T>(palette: readonly T[], index: number, role: InkRole): T {
  const ink = palette[index];
  if (ink === undefined) throw new Error(`${role} ${index} not in palette`);
  return ink;
}

/** A polygon's or circle's fill: a negative index is "no fill" (upstream's
 * `-1`), and anything else must be in the palette. Its outline has no such
 * escape. */
export const hasFill = (fill: number): boolean => fill >= 0;

/** A polygon needs a first point to start its path from. */
export function checkPolygon(coords: readonly Point[]): void {
  if (coords.length === 0) throw new Error("drawPolygon with no points");
}

/** The calls the canvas paints nothing for, so checks no ink of. */
export const paintsNothing = {
  rect: ({ w, h }: Rect): boolean => w < 1 || h < 1,
  line: (thickness: number): boolean => thickness <= 0,
  circle: (radius: number): boolean => radius <= 0,
  text: (size: number): boolean => size < 1,
  hatch: ({ w, h }: Rect, period: number): boolean => w < 1 || h < 1 || period < 2,
} as const;
