/** Bounds on a board's size: what the sizes alone cannot say of it, each
 * told in a sentence. */

import type { FillParams } from "../game-id.ts";

type Bound = { readonly min?: number; readonly max?: number };

/** Bounds on a board's two sides together (`play.bounds`). */
export interface SizeBounds {
  readonly sum?: Bound;
  readonly area?: Bound;
  readonly shorter?: Bound;
  readonly longer?: Bound;
}

/** What the sizes alone cannot say of a board, and of a board of a tier, by
 * the tier's index. */
export interface FillBounds {
  readonly all: SizeBounds;
  readonly tiers: readonly (SizeBounds & { readonly tier: number })[];
}

/** Each bound's measure of a board, and the start of what a board below or
 * above it is told, which ends with the bound. */
const MEASURES: Readonly<
  Record<
    keyof SizeBounds,
    { of(w: number, h: number): number; below: string; above: string }
  >
> = {
  sum: {
    of: (w, h) => w + h,
    below: "Width plus height must be at least",
    above: "Width plus height must be at most",
  },
  area: {
    of: (w, h) => w * h,
    below: "The number of squares must be at least",
    above: "The number of squares must be at most",
  },
  shorter: {
    of: Math.min,
    below: "Width and height must both be at least",
    above: "Width or height must be at most",
  },
  longer: {
    of: Math.max,
    below: "Width or height must be at least",
    above: "Width and height must both be at most",
  },
};

/** Whether board `p` is within `bounds`. */
export const within = (bounds: SizeBounds, p: FillParams): boolean =>
  beyond(bounds, p) === null;

/** What a board `p` past one of `bounds` is told, without its full stop, or
 * `null` within them. */
export function beyond(bounds: SizeBounds, p: FillParams): string | null {
  for (const [name, m] of Object.entries(MEASURES)) {
    const b = bounds[name as keyof SizeBounds];
    if (b === undefined) continue;
    const n = m.of(p.w, p.h);
    if (b.min !== undefined && n < b.min) return `${m.below} ${b.min}`;
    if (b.max !== undefined && n > b.max) return `${m.above} ${b.max}`;
  }
  return null;
}
