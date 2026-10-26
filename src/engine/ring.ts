/**
 * The hint's ring: the round mark on what a step decides, and the only shape
 * the ring ink is ever drawn in (`GameDrawing.drawRing`).
 *
 * The owner chose its shape (2026-10-25, `make-rings-round`): a rounded
 * rectangle as round as the content allows, which may reach past its element,
 * and never crosses text, its own or a neighbor's. Where nothing round fits,
 * the element is not ringed: {@link ringShape} throws, and the game pads its
 * content or marks the element with another role.
 *
 * Every `GameDrawing` strokes the shape {@link ringShape} returns, so the
 * canvas, the recorder and the SVG view cannot disagree about it.
 */

import type { DrawTextOptions, Point, Rect } from "./types.ts";

/** How round a ring must be, as its corner radius over half its short side: a
 * radius of a third of the short side. Below it the mark reads as a box, and
 * a box is the outline's shape. */
export const RING_MIN_ROUNDNESS = 2 / 3;

/** How wide, in CSS pixels, the app edges a hint's marks so they read on any
 * content (`puzzle/mark-flash.ts`); a game draws in CSS pixels too, so a ring
 * keeps this far from content beyond its stroke. */
export const MARK_EDGE_PX = 1;

/** The stroke a ring is drawn with: a path (`rect`, corner `radius`), stroked
 * `thickness` wide and centered on it. */
export interface RingShape {
  readonly rect: Rect;
  readonly radius: number;
  readonly thickness: number;
}

/** The step a search over growth and radius takes, in pixels. */
const STEP = 0.5;

/** Distance between two axis-aligned rects; 0 where they touch or overlap. */
function rectDistance(a: Rect, b: Rect): number {
  const dx = Math.max(0, a.x - (b.x + b.w), b.x - (a.x + a.w));
  const dy = Math.max(0, a.y - (b.y + b.h), b.y - (a.y + a.h));
  return Math.hypot(dx, dy);
}

/** Signed distance from (`px`, `py`) to the rounded rect `r` with corner
 * `radius`: negative inside. */
function roundedDistance(r: Rect, radius: number, px: number, py: number): number {
  const qx = Math.abs(px - (r.x + r.w / 2)) - (r.w / 2 - radius);
  const qy = Math.abs(py - (r.y + r.h / 2)) - (r.h / 2 - radius);
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
    Math.min(Math.max(qx, qy), 0) -
    radius
  );
}

const inflate = (r: Rect, d: number): Rect => ({
  x: r.x - d,
  y: r.y - d,
  w: r.w + 2 * d,
  h: r.h + 2 * d,
});

/** How much of a font's size a glyph's ink takes: a digit's height, a digit's
 * advance, and the drop below the baseline of a letter that has one. Measured
 * in Chrome's canvas (2026-10-26) at 100px: digits ascend 0.70 and advance
 * 0.56 in sans-serif and 0.60 in monospace; the tallest glyph ascends 0.74
 * and the deepest descends 0.22. A wide letter (M, W) runs past the advance;
 * the text a ring keeps clear of is digits, signs and single letters. */
const GLYPH_HEIGHT = 0.74;
const GLYPH_WIDTH = 0.62;
const DESCENT = 0.22;

/**
 * The box `text` inks when drawn at `origin` with `options`, the arguments a
 * game passes `GameDrawing.drawText`: what a game hands a ring to keep clear
 * of, so it never estimates a glyph of its own.
 */
export function textBox(origin: Point, options: DrawTextOptions, text: string): Rect {
  const { size, align, baseline } = options;
  const w = text.length * size * GLYPH_WIDTH;
  // Only these drop below the baseline; capitals, digits and signs sit on it.
  const descends = /[gjpqyQJ,;]/.test(text) ? size * DESCENT : 0;
  const h = size * GLYPH_HEIGHT;
  const x =
    align === "left" ? origin.x : align === "right" ? origin.x - w : origin.x - w / 2;
  const top = baseline === "mathematical" ? origin.y - h / 2 : origin.y - h;
  return { x, y: top, w, h: h + descends };
}

/** The text a ring keeps clear of: the element's value, which it encloses,
 * and the rest nearby (a clue in the element's corner, a neighbor's text),
 * which its stroke may go round or leave outside but never cross. */
export interface RingClear {
  readonly enclose: readonly Rect[];
  readonly avoid: readonly Rect[];
}

/** For a ring round an element with no text near it. */
export const NOTHING_TO_CLEAR: RingClear = { enclose: [], avoid: [] };

/**
 * The ring round the element at `box`, clear of the text in `clear`: the
 * stroke, and the {@link MARK_EDGE_PX} the app rims it with, keep off it.
 * The stroke stays inside `room`, the pixels whose repaint the game answers
 * for when the ring moves. It may grow past `box` into `room` by up to half
 * the box's short side, and draw in from it or shift off its center by up to
 * a quarter, to step round a corner's text. The shape nearest the box wins,
 * at the roundest it fits: a circle where the box's corners are free, and a
 * rounded square where text sits in them (the owner's pick, D5).
 *
 * Throws where none is at least {@link RING_MIN_ROUNDNESS} round.
 */
export function ringShape(
  box: Rect,
  { enclose, avoid }: RingClear,
  thickness: number,
  room: Rect = box,
): RingShape {
  const shape = roundestFit(box, { enclose, avoid }, thickness, room);
  if (!shape)
    throw new Error(
      `No round ring fits round (${box.x}, ${box.y}, ${box.w}×${box.h}) clear of its ` +
        "text: pad the text, or mark this element with another role",
    );
  return shape;
}

/** A ring's way off its box: grown by `grow` all round (drawn in where it is
 * negative), then shifted by `dx`, `dy`. */
interface Move {
  readonly grow: number;
  readonly dx: number;
  readonly dy: number;
}

/**
 * The moves a ring on a box of short side `short` may make, nearest the box
 * first (`|grow| + |dx| + |dy|`), and of moves as near, a centered one first,
 * since a ring off its element's middle looks as if it marks something beside
 * it: growth up to half the short side, and drawing in or shifting up to a
 * quarter of it. Made as they are tried, so a ring that fits at once costs one
 * check, and a large box no list.
 */
function* movesFor(short: number): Generator<Move> {
  const most = Math.floor(short / 4);
  const maxGrow = short / 2;
  for (let cost = 0; cost <= maxGrow + 2 * most; cost += STEP)
    for (let shift = 0; shift <= Math.min(Math.floor(cost), 2 * most); shift++) {
      const g = cost - shift;
      for (const grow of g === 0 ? [0] : [-g, g]) {
        if (grow < -most || grow > maxGrow) continue;
        for (let dx = -Math.min(shift, most); dx <= Math.min(shift, most); dx++) {
          const rest = shift - Math.abs(dx);
          if (rest > most) continue;
          for (const dy of rest === 0 ? [0] : [-rest, rest]) yield { grow, dx, dy };
        }
      }
    }
}

/** How round a fit is tried, roundest first, down to the floor. */
const ROUNDNESS_LEVELS = [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, RING_MIN_ROUNDNESS];

function roundestFit(
  box: Rect,
  { enclose, avoid }: RingClear,
  thickness: number,
  room: Rect,
): RingShape | null {
  const reach = thickness / 2 + MARK_EDGE_PX;
  const fits = (path: Rect, radius: number): boolean => {
    // Inside: every corner of the rect is `reach` within the path, which is
    // convex, so the whole rect is.
    const inside = (c: Rect): boolean =>
      (
        [
          [c.x, c.y],
          [c.x + c.w, c.y],
          [c.x, c.y + c.h],
          [c.x + c.w, c.y + c.h],
        ] as const
      ).every(([px, py]) => roundedDistance(path, radius, px, py) <= -reach);
    // Outside: the band's outer rim is the path's inner rect pushed out by
    // radius + reach, so a rect clears it when it keeps that far from that rect.
    const core = inflate(path, -radius);
    const outside = (c: Rect): boolean => rectDistance(core, c) >= radius + reach;
    return enclose.every(inside) && avoid.every((c) => inside(c) || outside(c));
  };

  for (const { grow, dx, dy } of movesFor(Math.min(box.w, box.h))) {
    // The stroke's outer rim, which `room` must hold.
    const x = box.x - grow + dx;
    const y = box.y - grow + dy;
    if (
      x < room.x ||
      y < room.y ||
      x + box.w + 2 * grow > room.x + room.w ||
      y + box.h + 2 * grow > room.y + room.h
    )
      continue;
    const grown = inflate(box, grow - thickness / 2);
    const path = { ...grown, x: grown.x + dx, y: grown.y + dy };
    for (const roundness of ROUNDNESS_LEVELS) {
      const radius = (roundness * Math.min(path.w, path.h)) / 2;
      if (radius > 0 && fits(path, radius)) return { rect: path, radius, thickness };
    }
  }
  return null;
}
