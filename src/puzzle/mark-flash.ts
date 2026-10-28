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

/** How much of each pixel the marks cover in the hint inks (0–255), from the
 * board drawn with the inks in white and in black, each with the marks and
 * without them. Whatever lies under an ink, a pixel it covers by `a` is `255a`
 * lighter in white than in black, and a pixel drawn alike either way, the
 * marks' or not, cancels out. */
function inkCoverage(
  white: { shown: Uint8ClampedArray; hidden: Uint8ClampedArray },
  black: { shown: Uint8ClampedArray; hidden: Uint8ClampedArray },
): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(white.shown.length / 4);
  for (let i = 0, p = 0; i < white.shown.length; i += 4, p++) {
    let d = 0;
    for (let k = i; k < i + 3; k++)
      d = Math.max(
        d,
        white.shown[k] - white.hidden[k] - (black.shown[k] - black.hidden[k]),
      );
    out[p] = d;
  }
  return out;
}

/** A board drawn with a reference's marks (`shown`) and without them
 * (`hidden`), as RGBA. */
export interface FramePair {
  readonly shown: Uint8ClampedArray;
  readonly hidden: Uint8ClampedArray;
}

/** How much each pixel is one reference's marks, from the board drawn as it
 * is and with the hint inks in white and in black ({@link inkCoverage}). A
 * pixel the inks cover is the marks' by its coverage, and any other by its
 * difference ({@link markAlpha}). A pixel the inks cover more without the
 * reference is no mark of its: another mark is drawn there in its absence, as
 * the side two outlined cells share is once one of them is not outlined. */
export function referenceAlpha(
  drawn: FramePair,
  white: FramePair,
  black: FramePair,
): Uint8ClampedArray<ArrayBuffer> {
  const alpha = markAlpha(drawn.shown, drawn.hidden);
  const ink = inkCoverage(white, black);
  const swapped = ({ shown, hidden }: FramePair) => ({ shown: hidden, hidden: shown });
  const gained = inkCoverage(swapped(white), swapped(black));
  for (let p = 0; p < alpha.length; p++) {
    if (ink[p] > 0) alpha[p] = ink[p];
    else if (gained[p] > 0) alpha[p] = 0;
  }
  return alpha;
}

/** The marks without the specks a canvas leaves between two frames. Chrome's
 * GPU canvas antialiases a line a little differently as the frame's other
 * paths change, so lines no reference touches differ in faint runs a pixel
 * wide, and a pressed pill's leader would point at one. A mark has a solid
 * core: a pixel all the mark's, or most of it with `CORE_NEIGHBORS` of its
 * eight neighbors as much. Only the pixels within `reach` of a core are kept,
 * which keeps a mark's antialiased rim. Marks with no core keep every pixel:
 * a hairline is never a speck to be cleared. */
export function withoutSpecks(
  alpha: Uint8ClampedArray<ArrayBuffer>,
  width: number,
  reach = 2,
): Uint8ClampedArray<ArrayBuffer> {
  const height = alpha.length / width;
  const most = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < width && y < height && alpha[y * width + x] >= 128;
  // Whether a core lies within `reach` along the row, then down the column:
  // the square round each pixel, in two passes.
  const row = new Uint8Array(alpha.length);
  let cores = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (alpha[p] < 128) continue;
      let beside = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++)
          if ((dx || dy) && most(x + dx, y + dy)) beside++;
      if (alpha[p] < 255 && beside < CORE_NEIGHBORS) continue;
      cores++;
      for (let dx = -reach; dx <= reach; dx++)
        if (x + dx >= 0 && x + dx < width) row[p + dx] = 1;
    }
  if (cores === 0) return alpha;
  const out = new Uint8ClampedArray(alpha.length);
  for (let p = 0; p < alpha.length; p++) {
    if (alpha[p] === 0) continue;
    const y = (p - (p % width)) / width;
    for (let dy = -reach; dy <= reach; dy++)
      if (y + dy >= 0 && y + dy < height && row[p + dy * width]) {
        out[p] = alpha[p];
        break;
      }
  }
  return out;
}

/** How many of a pixel's eight neighbors a mark's core pixel has as much of
 * the mark: a speck's run, a pixel wide, has two at most. */
const CORE_NEIGHBORS = 3;

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
 * pixels; `null` where they hold none. "Most of" is half the marks' strongest
 * pixel, not half a pixel: stripes are drawn translucent, and hold no pixel
 * whole. */
export function nearestMarked(
  alpha: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
): { x: number; y: number } | null {
  let strongest = 0;
  for (const a of alpha) if (a > strongest) strongest = a;
  const most = Math.max(1, Math.ceil(strongest / 2));
  let best: { x: number; y: number } | null = null;
  let bestD = Number.POSITIVE_INFINITY;
  for (let p = 0; p < alpha.length; p++) {
    if (alpha[p] < most) continue;
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

/** Every reference's marks repainted in its color (`#rrggbb`, `null` for one
 * that draws nothing), as RGBA over the canvas they were measured on, each
 * edged `reach` pixels wide so that it reads on whatever the game drew under
 * it (`edged`). The largest marks are laid first: a reference whose marks lie
 * inside another's ("region 1" of "the chain") would otherwise be painted
 * over, and its pill name a color the board does not show. */
export function repainted(
  marks: {
    readonly width: number;
    readonly height: number;
    readonly refs: readonly ReferenceMarks[];
    readonly roles: readonly string[];
  },
  colors: readonly (string | null)[],
  reach: number,
): Uint8ClampedArray<ArrayBuffer> {
  const pixels = new Uint8ClampedArray(marks.width * marks.height * 4);
  const size = marks.refs.map((r) => r.alpha.reduce((n, a) => (a > 0 ? n + 1 : n), 0));
  const order = marks.refs.map((_, i) => i).sort((a, b) => size[b] - size[a]);
  for (const i of order) {
    const r = marks.refs[i];
    const color = colors[i];
    if (!color) continue;
    const hex = (k: number) => Number.parseInt(color.slice(k, k + 2), 16);
    const rgb = [hex(1), hex(3), hex(5)] as const;
    // Stripes run under the game's content, which an edge beside them would
    // cover, so theirs eats into the band; and half as wide, since across a
    // diagonal band a square's reach goes √2 as far.
    const layer =
      marks.roles[i] === "stripes"
        ? edged(r, marks.width, rgb, edgeFor(rgb), Math.max(1, reach >> 1), "inside")
        : edged(r, marks.width, rgb, edgeFor(rgb), reach, "outside");
    for (let p = 3; p < layer.length; p += 4)
      if (layer[p] > 0) pixels.set(layer.subarray(p - 3, p + 1), p - 3);
  }
  return pixels;
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
