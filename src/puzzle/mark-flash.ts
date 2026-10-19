/**
 * A reference's marks on the canvas, found by drawing the board with them
 * (`shown`) and without them (`hidden`), as RGBA: whatever differs is theirs,
 * whatever shape and color each game draws them in.
 */

/** Where a reference's marks lie, in canvas pixels. */
export interface MarkBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** One reference's marks: how much each canvas pixel is theirs (0–255, one
 * byte a pixel), and where they lie; `box` is `null` for a reference that
 * draws nothing. */
export interface ReferenceMarks {
  readonly alpha: Uint8ClampedArray<ArrayBuffer>;
  readonly box: MarkBox | null;
}

/** How much each pixel is the marks': the difference, so a mark's
 * anti-aliased rim fades as it does on the board. A mark's full color stands
 * well clear of what it covers; a rim pixel differs by a fraction of that,
 * and keeps the fraction. */
export function markAlpha(
  shown: Uint8ClampedArray,
  hidden: Uint8ClampedArray,
): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(shown.length / 4);
  for (let i = 0, p = 0; i < shown.length; i += 4, p++) {
    const d = Math.max(
      Math.abs(shown[i] - hidden[i]),
      Math.abs(shown[i + 1] - hidden[i + 1]),
      Math.abs(shown[i + 2] - hidden[i + 2]),
    );
    out[p] = Math.min(255, d * 3);
  }
  return out;
}

/** The smallest box round every pixel the marks touch. */
export function markBox(alpha: Uint8ClampedArray, width: number): MarkBox | null {
  let x0 = width;
  let y0 = Number.POSITIVE_INFINITY;
  let x1 = -1;
  let y1 = -1;
  for (let p = 0; p < alpha.length; p++) {
    if (alpha[p] === 0) continue;
    const x = p % width;
    const y = (p - x) / width;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    y1 = y;
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** The pixel the marks hold most of that lies nearest (`x`, `y`), in canvas
 * pixels; `null` where they hold none. */
export function nearestMarked(
  alpha: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
): { x: number; y: number } | null {
  let best: { x: number; y: number } | null = null;
  let bestD = Number.POSITIVE_INFINITY;
  for (let p = 0; p < alpha.length; p++) {
    if (alpha[p] < 128) continue;
    const px = p % width;
    const py = (p - px) / width;
    const d = (px - x) ** 2 + (py - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = { x: px + 0.5, y: py + 0.5 };
    }
  }
  return best;
}

/** Black or white, whichever stands farther from `color` (0–255 a channel)
 * in WCAG contrast: the edge {@link edged} gives it. */
export function edgeFor(
  color: readonly [number, number, number],
): readonly [number, number, number] {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const y = 0.2126 * lin(color[0]) + 0.7152 * lin(color[1]) + 0.0722 * lin(color[2]);
  // Contrast with black, (y + 0.05) / 0.05, against with white, 1.05 / (y + 0.05).
  return (y + 0.05) ** 2 > 0.05 * 1.05 ? [0, 0, 0] : [255, 255, 255];
}

/** How a mark takes its edge: round it, on the pixels beside it, or within
 * it, on its own outermost pixels, for a mark the game draws under its
 * content, whose neighbors are that content. */
export type EdgeSide = "outside" | "inside";

/** The marks as RGBA in `color`, edged `reach` pixels wide in `edge`. A mark
 * in one color vanishes on content of its own lightness, and a game may draw
 * anything under its marks; of two colors far apart in lightness, one stands
 * clear of whatever is under it. Outside, the edge is as opaque as the most
 * of the mark within its reach; inside, it takes whatever share of a pixel
 * the least of the mark within its reach leaves, so a rim keeps its
 * antialiasing either way. Only the pixels within `reach` of `box` are
 * looked at. */
export function edged(
  { alpha, box }: ReferenceMarks,
  width: number,
  color: readonly [number, number, number],
  edge: readonly [number, number, number],
  reach: number,
  side: EdgeSide,
): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(alpha.length * 4);
  if (!box) return out;
  const height = alpha.length / width;
  const x0 = Math.max(0, box.x - reach);
  const x1 = Math.min(width - 1, box.x + box.w - 1 + reach);
  const y0 = Math.max(0, box.y - reach);
  const y1 = Math.min(height - 1, box.y + box.h - 1 + reach);
  // The most (outside) or least (inside) of the mark within `reach` of each
  // pixel: a square's, taken across and then down. Off the canvas counts as
  // no mark. Marks are sparse and this runs on every step, so the work is
  // led by the mark's pixels: outside, each spreads its coverage over its
  // reach; inside, only the mark's own pixels look round them.
  const across = new Uint8ClampedArray(alpha.length);
  const near = new Uint8ClampedArray(alpha.length);
  const spread = (
    from: Uint8ClampedArray,
    to: Uint8ClampedArray,
    step: number,
    at: (p: number) => number,
    size: number,
  ) => {
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const p = y * width + x;
        if ((side === "outside" ? from : alpha)[p] === 0) continue;
        const c = at(p);
        const lo = Math.max(0, c - reach);
        const hi = Math.min(size - 1, c + reach);
        if (side === "outside") {
          const v = from[p];
          for (let i = lo; i <= hi; i++) {
            const q = p + (i - c) * step;
            if (to[q] < v) to[q] = v;
          }
        } else {
          let v = lo > c - reach || hi < c + reach ? 0 : 255;
          for (let i = lo; i <= hi; i++) v = Math.min(v, from[p + (i - c) * step]);
          to[p] = v;
        }
      }
  };
  spread(alpha, across, 1, (p) => p % width, width);
  spread(across, near, width, (p) => Math.floor(p / width), height);
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const p = y * width + x;
      // The pixel's coverage, and how much of it is the mark's own color.
      const cover = side === "outside" ? near[p] : alpha[p];
      if (cover === 0) continue;
      const own = side === "outside" ? alpha[p] : Math.min(near[p], alpha[p]);
      const i = p * 4;
      for (let k = 0; k < 3; k++)
        out[i + k] = (color[k] * own + edge[k] * (cover - own)) / cover;
      out[i + 3] = cover;
    }
  return out;
}

/** The marks as RGBA in one color, as opaque as each pixel is theirs. */
export function tinted(
  alpha: Uint8ClampedArray,
  [r, g, b]: readonly [number, number, number],
): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(alpha.length * 4);
  for (let p = 0; p < alpha.length; p++) {
    if (alpha[p] === 0) continue;
    const i = p * 4;
    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = alpha[p];
  }
  return out;
}
