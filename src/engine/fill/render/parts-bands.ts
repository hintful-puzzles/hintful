/**
 * A part of a board of parts marked by a band just inside its border, square
 * by square (`parts-render.ts`): the selection, which washes the part
 * without changing its fill, since a part's fill is its value and a wash
 * over a color would read as another color; a hint's dashed outline of a
 * part it reasons from; and, for notes, the note-taking corner in the
 * part's first square. Upstream map.c draws no selection but
 * its cursor; the band is the hand-written Map's (`games/map/render.ts`,
 * "the selected region").
 *
 * A square holds one or two convex pieces: itself, or two right triangles
 * either side of its diagonal. The band in a piece is that piece clipped to
 * a strip along each of its sides that is a border, plus a square at each
 * corner a border passes through without running along the piece (the
 * inner corner of an L-shaped part, where the two strips would otherwise
 * meet at a point).
 */

import type { GameDrawing } from "../../contract/game.ts";
import {
  BOTTOM,
  LEFT,
  type PartsGeometry,
  partAt,
  RIGHT,
  TOP,
} from "./parts-geometry.ts";

interface Pt {
  readonly x: number;
  readonly y: number;
}

/** A square's piece: its outline, clockwise, and which of its sides are
 * borders between parts. */
interface Piece {
  readonly poly: readonly Pt[];
  readonly border: readonly boolean[];
}

/** A band's reach inward from a part's border, `from` to `to` pixels, in
 * `color`, and dashed with this period where `dash` is set. */
export interface Band {
  readonly from: number;
  readonly to: number;
  readonly color: number;
  readonly dash?: number;
}

/** `strip` cut into dashes along direction `(tx, ty)`, on for the first half
 * of each `period`. Measured from the canvas origin, not from the strip, so
 * the dashes of one border line up from square to square. */
function dashes(strip: readonly Pt[], tx: number, ty: number, period: number): Pt[][] {
  if (strip.length < 3) return [];
  const u = (p: Pt) => p.x * tx + p.y * ty;
  let lo = Infinity;
  let hi = -Infinity;
  for (const p of strip) {
    lo = Math.min(lo, u(p));
    hi = Math.max(hi, u(p));
  }
  const out: Pt[][] = [];
  for (let k = Math.floor(lo / period); k * period < hi; k++) {
    const a = k * period;
    const b = a + period / 2;
    out.push(
      clipHalfPlane(
        clipHalfPlane(strip, (p) => a - u(p)),
        (p) => u(p) - b,
      ),
    );
  }
  return out;
}

/** The selection band's width: wide enough to read on any fill, narrow
 * enough to leave the notes inside a small part clear. */
export const bandWidth = (ts: number): number => Math.max(2, Math.floor(ts / 8));

/** Keep the part of convex `poly` where `f` is at most zero. */
function clipHalfPlane(poly: readonly Pt[], f: (p: Pt) => number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const fp = f(p);
    const fq = f(q);
    if (fp <= 0) out.push(p);
    if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) {
      const s = fp / (fp - fq);
      out.push({ x: p.x + (q.x - p.x) * s, y: p.y + (q.y - p.y) * s });
    }
  }
  return out;
}

/** Signed distance inward from side `i` of clockwise `poly` (screen axes). */
function inwardDistance(poly: readonly Pt[], i: number): (p: Pt) => number {
  const a = poly[i];
  const b = poly[(i + 1) % poly.length];
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const nx = -(b.y - a.y) / len;
  const ny = (b.x - a.x) / len;
  return (p) => (p.x - a.x) * nx + (p.y - a.y) * ny;
}

/** `subject` clipped to convex, clockwise `clip`. */
function clipConvex(subject: readonly Pt[], clip: readonly Pt[]): Pt[] {
  let out = [...subject];
  for (let i = 0; i < clip.length && out.length > 0; i++) {
    const d = inwardDistance(clip, i);
    out = clipHalfPlane(out, (p) => -d(p));
  }
  return out;
}

/** Whether a border runs through grid point `(px, py)`: along any of the
 * four grid lines meeting there, or a diagonal ending there. */
function borderAtPoint(g: PartsGeometry, px: number, py: number): boolean {
  const { w, h } = g;
  if (px <= 0 || py <= 0 || px >= w || py >= h) return true;
  const q = (x: number, y: number, t: number) => partAt(g, t, y * w + x);
  // A split square's diagonal ends at the point where it runs through the
  // corner the point is to that square.
  const splitThrough = (x: number, y: number, leftWith: number) =>
    q(x, y, TOP) !== q(x, y, BOTTOM) && q(x, y, LEFT) === q(x, y, leftWith);
  return (
    q(px - 1, py - 1, RIGHT) !== q(px, py - 1, LEFT) ||
    q(px - 1, py, RIGHT) !== q(px, py, LEFT) ||
    q(px - 1, py - 1, BOTTOM) !== q(px - 1, py, TOP) ||
    q(px, py - 1, BOTTOM) !== q(px, py, TOP) ||
    splitThrough(px - 1, py - 1, BOTTOM) ||
    splitThrough(px, py - 1, TOP) ||
    splitThrough(px - 1, py, TOP) ||
    splitThrough(px, py, BOTTOM)
  );
}

/** Square `s`'s top and bottom pieces, drawn from `(x0, y0)`: one piece,
 * both names, where it is whole. */
function piecesOf(
  g: PartsGeometry,
  s: number,
  x0: number,
  y0: number,
  ts: number,
): [Piece, Piece] {
  const { w, h } = g;
  const x = s % w;
  const y = Math.floor(s / w);
  const q = (cx: number, cy: number, t: number) => partAt(g, t, cy * w + cx);
  const top = y === 0 || q(x, y - 1, BOTTOM) !== q(x, y, TOP);
  const bottom = y === h - 1 || q(x, y + 1, TOP) !== q(x, y, BOTTOM);
  const left = x === 0 || q(x - 1, y, RIGHT) !== q(x, y, LEFT);
  const right = x === w - 1 || q(x + 1, y, LEFT) !== q(x, y, RIGHT);
  const TL = { x: x0, y: y0 };
  const TR = { x: x0 + ts, y: y0 };
  const BR = { x: x0 + ts, y: y0 + ts };
  const BL = { x: x0, y: y0 + ts };
  if (q(x, y, TOP) === q(x, y, BOTTOM)) {
    const whole = { poly: [TL, TR, BR, BL], border: [top, right, bottom, left] };
    return [whole, whole];
  }
  // The diagonal runs top right to bottom left where the left triangle goes
  // with the top one, else top left to bottom right.
  if (q(x, y, LEFT) === q(x, y, TOP))
    return [
      { poly: [TL, TR, BL], border: [top, true, left] },
      { poly: [TR, BR, BL], border: [right, bottom, true] },
    ];
  return [
    { poly: [TL, TR, BR], border: [top, right, true] },
    { poly: [TL, BR, BL], border: [true, bottom, left] },
  ];
}

/** Paint the bands of square `s`, drawn from `(x0, y0)`, over its fills:
 * `top` in its top piece, `bottom` in its bottom one where it is split,
 * each outermost first; and the note-taking corner in each piece `corner`
 * names. */
export function drawBands(
  dr: GameDrawing,
  g: PartsGeometry,
  s: number,
  x0: number,
  y0: number,
  ts: number,
  top: readonly Band[],
  bottom: readonly Band[],
  corner: { readonly top: boolean; readonly bottom: boolean; readonly color: number },
  ink: number,
): void {
  const [topPiece, bottomPiece] = piecesOf(g, s, x0, y0, ts);
  const x = s % g.w;
  const y = Math.floor(s / g.w);
  const marked: [Piece, readonly Band[]][] = [];
  if (top.length > 0) marked.push([topPiece, top]);
  if (bottomPiece !== topPiece && bottom.length > 0) marked.push([bottomPiece, bottom]);
  const corners = [
    { px: x, py: y, kx: x0, ky: y0 },
    { px: x + 1, py: y, kx: x0 + ts, ky: y0 },
    { px: x + 1, py: y + 1, kx: x0 + ts, ky: y0 + ts },
    { px: x, py: y + 1, kx: x0, ky: y0 + ts },
  ];
  // Innermost first: an outer band's strip along one side reaches into the
  // corner an inner band's strip along the other also covers, and the outer
  // one must be left showing there.
  for (const [piece, bands] of marked)
    for (const { from, to, color, dash } of [...bands].reverse()) {
      const fill = (poly: readonly Pt[]) => {
        if (poly.length >= 3) dr.drawPolygon([...poly], color, color);
      };
      const { poly, border } = piece;
      for (let i = 0; i < poly.length; i++) {
        if (!border[i]) continue;
        const d = inwardDistance(poly, i);
        let strip = clipHalfPlane(
          clipHalfPlane(poly, (p) => d(p) - to),
          (p) => from - d(p),
        );
        // A band set in from the border keeps clear of the piece's other
        // borders too, or at a corner it reaches back across the gap.
        if (from > 0)
          for (let j = 0; j < poly.length; j++)
            if (j !== i && border[j]) {
              const dj = inwardDistance(poly, j);
              strip = clipHalfPlane(strip, (p) => from - dj(p));
            }
        if (dash === undefined) {
          fill(strip);
          continue;
        }
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        for (const seg of dashes(strip, (b.x - a.x) / len, (b.y - a.y) / len, dash))
          fill(seg);
      }
      // A dashed band needs no corner joins: its gaps already break it.
      if (dash !== undefined) continue;
      for (const k of corners) {
        // A side of the piece already running along the border from this
        // corner has covered it.
        const own = poly.some(
          (p, i) =>
            border[i] &&
            ((p.x === k.kx && p.y === k.ky) ||
              (poly[(i + 1) % poly.length].x === k.kx &&
                poly[(i + 1) % poly.length].y === k.ky)),
        );
        if (own || !borderAtPoint(g, k.px, k.py)) continue;
        const sx = k.kx === x0 ? 1 : -1;
        const sy = k.ky === y0 ? 1 : -1;
        const along = (p: Pt) => sx * (p.x - k.kx);
        const across = (p: Pt) => sy * (p.y - k.ky);
        // The band's share of the corner square is an L between `from` and
        // `to`, two convex pieces; at `from = 0` the second is empty.
        const inCorner = clipHalfPlane(
          clipHalfPlane(poly, (p) => along(p) - to),
          (p) => across(p) - to,
        );
        fill(clipHalfPlane(inCorner, (p) => from - along(p)));
        if (from > 0)
          fill(
            clipHalfPlane(
              clipHalfPlane(inCorner, (p) => along(p) - from),
              (p) => from - across(p),
            ),
          );
      }
    }
  const half = Math.floor(ts / 2);
  const triangle = [
    { x: x0, y: y0 },
    { x: x0 + half, y: y0 },
    { x: x0, y: y0 + half },
  ];
  const cornered: Piece[] = [];
  if (corner.top) cornered.push(topPiece);
  if (corner.bottom && bottomPiece !== topPiece) cornered.push(bottomPiece);
  for (const piece of cornered) {
    const poly = clipConvex(triangle, piece.poly);
    if (poly.length >= 3) dr.drawPolygon(poly, corner.color, corner.color);
  }
  // A band reaches the diagonal, which is the bottom triangle's outline:
  // stroke it again along the line the square's fill outlined it.
  if ((marked.length > 0 || cornered.length > 0) && topPiece !== bottomPiece) {
    const fromTopLeft = partAt(g, LEFT, s) === partAt(g, BOTTOM, s);
    dr.drawLine(
      { x: x0 - 1, y: fromTopLeft ? y0 - 1 : y0 + ts + 1 },
      { x: x0 + ts + 1, y: fromTopLeft ? y0 + ts + 1 : y0 - 1 },
      ink,
      1,
    );
  }
}
