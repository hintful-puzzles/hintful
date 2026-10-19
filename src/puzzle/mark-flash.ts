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
