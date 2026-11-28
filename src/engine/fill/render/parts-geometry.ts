/**
 * Where a board of parts (`parts.ts`) is drawn on its squares: each square
 * as four triangles, top, bottom, left and right, each holding a part, so
 * the drawing may split a square along a diagonal between two parts and
 * smooth a jagged border; and the point each part's label, and each border
 * between two parts, is drawn at. Upstream map.c's `new_game`, its drawing
 * half: the parts themselves are whole squares, as the ID says.
 */

import { shuffle } from "../../board/shuffle.ts";
import { randomNew } from "../../random/index.ts";
import type { Squares } from "../../solve/describe-runtime.ts";

/** A square's triangles, as upstream numbers them. */
export const TOP = 0;
export const BOTTOM = 1;
export const LEFT = 2;
export const RIGHT = 3;

export interface PartsGeometry {
  readonly w: number;
  readonly h: number;
  /** The parts' count. */
  readonly n: number;
  /** The part of triangle `t` of square `s`, at `t * w * h + s`. */
  readonly quadrants: Int32Array;
  /** Each part's label point, in half squares. */
  readonly labels: readonly { readonly x: number; readonly y: number }[];
  /** The point of the border between parts `a` and `b`, in half squares, at
   * `a * n + b` (both ways round), where they share one. */
  readonly borders: ReadonlyMap<number, { readonly x: number; readonly y: number }>;
}

/** The geometry of partition `map`, its diagonals chosen by `seed` (the
 * board's ID, as upstream seeds them), so one ID always draws alike. */
export function partsGeometry(map: Squares, seed: string): PartsGeometry {
  const { w, h } = map;
  const wh = w * h;
  const n = map.cells.length;
  const quadrants = new Int32Array(4 * wh);
  for (let t = 0; t < 4; t++) quadrants.set(map.of, t * wh);
  smooth(w, h, quadrants, seed);
  const { labels, borders } = labelPoints(w, h, n, quadrants);
  return { w, h, n, quadrants, labels, borders };
}

/**
 * Split a square diagonally where two parts meet it on opposite corners,
 * until none is left to split: a square of part `c` with one neighbor part
 * above and left of it and another below and right (or the mirror) is cut
 * between them, so a staircase border reads as one slope. The squares are
 * visited in an order shuffled from `seed`.
 */
function smooth(w: number, h: number, q: Int32Array, seed: string): void {
  const wh = w * h;
  const rs = randomNew(seed);
  const order = Array.from({ length: wh }, (_, i) => i);
  shuffle(order, rs);
  const at = (t: number, x: number, y: number) => q[t * wh + y * w + x];
  let changed: boolean;
  do {
    changed = false;
    for (const s of order) {
      const x = s % w;
      const y = Math.floor(s / w);
      if (x === 0 || x === w - 1 || y === 0 || y === h - 1) continue;
      if (at(TOP, x, y) !== at(BOTTOM, x, y)) continue;
      const c = q[s];
      const above = at(BOTTOM, x, y - 1);
      const below = at(TOP, x, y + 1);
      const left = at(RIGHT, x - 1, y);
      const right = at(LEFT, x + 1, y);
      if (above === below || (above !== c && below !== c)) continue;
      if ((left === above && right === below) || (left === below && right === above)) {
        q[TOP * wh + s] = above;
        q[BOTTOM * wh + s] = below;
        q[LEFT * wh + s] = left;
        q[RIGHT * wh + s] = right;
        changed = true;
      }
    }
  } while (changed);
}

/**
 * Upstream's two passes: every point where a part shows (a square's middle,
 * a corner all its triangles share) and every point on a border between two
 * parts is gathered, the mean of each part's and each border's taken, and
 * the gathered point nearest the mean kept. Coordinates are in half squares.
 */
function labelPoints(
  w: number,
  h: number,
  n: number,
  q: Int32Array,
): Pick<PartsGeometry, "labels" | "borders"> {
  const wh = w * h;
  const at = (t: number, x: number, y: number) => q[t * wh + y * w + x];
  // A part `p` is key `p * n + p`, a border `a * n + b` with `a < b`.
  const sum = new Map<number, { x: number; y: number; k: number }>();
  const best = new Map<number, { x: number; y: number; d: number }>();
  const visit = (pass: number, a: number, b: number, x: number, y: number) => {
    const key = Math.min(a, b) * n + Math.max(a, b);
    if (pass === 0) {
      const s = sum.get(key) ?? { x: 0, y: 0, k: 0 };
      sum.set(key, { x: s.x + x, y: s.y + y, k: s.k + 1 });
      return;
    }
    const s = sum.get(key);
    if (s === undefined) return;
    // Not `Math.hypot`, which may round apart from upstream's square root
    // and break a tie the other way.
    const dx = x - s.x / s.k;
    const dy = y - s.y / s.k;
    const d = Math.sqrt(dx * dx + dy * dy);
    const got = best.get(key);
    if (got === undefined || d < got.d) best.set(key, { x, y, d });
  };
  for (let pass = 0; pass < 2; pass++)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (x + 1 < w)
          visit(pass, at(RIGHT, x, y), at(LEFT, x + 1, y), (x + 1) * 2, y * 2 + 1);
        if (y + 1 < h)
          visit(pass, at(BOTTOM, x, y), at(TOP, x, y + 1), x * 2 + 1, (y + 1) * 2);
        // The square's middle: its diagonal where it is split, else its
        // part's.
        visit(pass, at(TOP, x, y), at(BOTTOM, x, y), x * 2 + 1, y * 2 + 1);
        if (x + 1 >= w || y + 1 >= h) continue;
        // The eight triangles round the corner below and right, clockwise:
        // one part there is a point of it, two meeting once each way a
        // point of their border.
        const ring = [
          at(RIGHT, x, y),
          at(LEFT, x + 1, y),
          at(BOTTOM, x + 1, y),
          at(TOP, x + 1, y + 1),
          at(LEFT, x + 1, y + 1),
          at(RIGHT, x, y + 1),
          at(TOP, x, y + 1),
          at(BOTTOM, x, y),
        ];
        const others = new Set(ring.filter((p) => p !== ring[0]));
        const turns = ring.filter((p, i) => p !== ring[(i + 1) % 8]).length;
        if (others.size === 0) visit(pass, ring[0], ring[0], (x + 1) * 2, (y + 1) * 2);
        else if (others.size === 1 && turns === 2)
          visit(pass, ring[0], [...others][0], (x + 1) * 2, (y + 1) * 2);
      }
  const labels = Array.from({ length: n }, (_, p) => {
    const got = best.get(p * n + p);
    if (got === undefined) throw new Error(`parts: part ${p} has no label point`);
    return { x: got.x, y: got.y };
  });
  const borders = new Map<number, { x: number; y: number }>();
  for (const [key, { x, y }] of best) {
    const a = Math.floor(key / n);
    const b = key % n;
    if (a === b) continue;
    borders.set(a * n + b, { x, y });
    borders.set(b * n + a, { x, y });
  }
  return { labels, borders };
}

/** Whether square `s` is split along a diagonal between two parts. */
export const split = (g: PartsGeometry, s: number): boolean =>
  g.quadrants[TOP * g.w * g.h + s] !== g.quadrants[BOTTOM * g.w * g.h + s];

/** The part of triangle `t` of square `s`. */
export const partAt = (g: PartsGeometry, t: number, s: number): number =>
  g.quadrants[t * g.w * g.h + s];
