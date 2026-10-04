/**
 * Which palette indices a frame paints **next to each other**: the pairs a
 * player has to tell apart, read off the draw record instead of off a list.
 *
 * The record is painted into an index buffer, one palette index per pixel, and
 * the buffer is then read for neighbors. Three kinds, because they owe the
 * player different things:
 *
 * - `area`: two filled regions, each several pixels across both ways, that
 *   touch or sit either side of a hairline. A wall and the floor beside it, a
 *   shaded cell and an empty one.
 * - `mark`: something thin (a line, a ring, a dot) on or beside a filled
 *   region. A grid line is one of these, and a quiet grid line is deliberate,
 *   which is why marks are not the same population as areas.
 * - `text`: a glyph and whatever was painted under its middle when it was
 *   drawn.
 *
 * A pair is two indices in **one** frame, so it is compared within a scheme.
 * That matters because dark mode exchanges some indices (`darkSwaps`), and
 * one index's light and dark values need not be one role.
 *
 * A faithful-enough painter, not a renderer: no antialiasing, a glyph is a
 * point, and a hatch is skipped because it is translucent.
 *
 * Dev/test-only; never imported by production code.
 */

import type { Size } from "../types.ts";
import type { DrawOp } from "./recording-drawing.ts";

export type NeighborKind = "area" | "mark" | "text";

export interface NeighborPair {
  kind: NeighborKind;
  /** The two palette indices, lower first for `area`; for `mark` and `text`,
   * `a` is the thin thing and `b` what it sits on. */
  a: number;
  b: number;
  /** Pixel adjacencies seen (glyphs, for `text`). */
  count: number;
}

/** A region at least this many pixels across in both directions is an area. */
const AREA_SPAN = 6;
/** How far apart two areas may sit and still be neighbors: a hairline and its
 * rounding. */
const ACROSS_HAIRLINE = 4;

/** The record painted as one palette index per pixel, `background` where
 * nothing drew. */
function paintIndices(
  ops: readonly DrawOp[],
  size: Size,
  background: number,
): Int16Array {
  const { w, h } = size;
  const buf = new Int16Array(w * h).fill(background);
  let clip: { x0: number; y0: number; x1: number; y1: number } | null = null;

  const set = (x: number, y: number, index: number): void => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    if (clip && (x < clip.x0 || y < clip.y0 || x >= clip.x1 || y >= clip.y1)) return;
    buf[y * w + x] = index;
  };
  const stamp = (x: number, y: number, side: number, index: number): void => {
    const lo = -Math.floor((side - 1) / 2);
    for (let dy = lo; dy < lo + side; dy++)
      for (let dx = lo; dx < lo + side; dx++)
        set(Math.round(x) + dx, Math.round(y) + dy, index);
  };
  const line = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    side: number,
    index: number,
  ): void => {
    const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 2));
    for (let i = 0; i <= steps; i++)
      stamp(x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps, side, index);
  };

  for (const op of ops) {
    switch (op.op) {
      case "clip":
        clip = { x0: op.x, y0: op.y, x1: op.x + op.w, y1: op.y + op.h };
        break;
      case "unclip":
        clip = null;
        break;
      case "rect":
        for (let y = op.y; y < op.y + op.h; y++)
          for (let x = op.x; x < op.x + op.w; x++) set(x, y, op.color);
        break;
      case "line":
        line(
          op.x1,
          op.y1,
          op.x2,
          op.y2,
          Math.max(1, Math.round(op.thickness)),
          op.color,
        );
        break;
      case "polygon": {
        const pts = op.points;
        if (op.fill >= 0) {
          const ys = pts.map((p) => p[1]);
          for (let y = Math.min(...ys); y <= Math.max(...ys); y++) {
            const at = y + 0.5;
            const xs: number[] = [];
            for (let i = 0; i < pts.length; i++) {
              const [ax, ay] = pts[i];
              const [bx, by] = pts[(i + 1) % pts.length];
              if (ay <= at === by <= at) continue;
              xs.push(ax + ((at - ay) * (bx - ax)) / (by - ay));
            }
            xs.sort((p, q) => p - q);
            for (let i = 0; i + 1 < xs.length; i += 2)
              for (let x = Math.round(xs[i]); x <= Math.round(xs[i + 1]); x++)
                set(x, y, op.fill);
          }
        }
        if (op.outline >= 0)
          for (let i = 0; i < pts.length; i++) {
            const [ax, ay] = pts[i];
            const [bx, by] = pts[(i + 1) % pts.length];
            line(ax, ay, bx, by, 1, op.outline);
          }
        break;
      }
      case "circle": {
        const r = op.r;
        for (let y = Math.floor(op.cy - r - 1); y <= op.cy + r + 1; y++)
          for (let x = Math.floor(op.cx - r - 1); x <= op.cx + r + 1; x++) {
            const d = Math.hypot(x - op.cx, y - op.cy);
            if (op.outline >= 0 && Math.abs(d - r) <= 0.5) set(x, y, op.outline);
            else if (op.fill >= 0 && d <= r) set(x, y, op.fill);
          }
        break;
      }
      case "text":
      case "hatch":
        break;
    }
  }
  return buf;
}

/** Whether each pixel belongs to a run of its own index at least
 * {@link AREA_SPAN} long both across and down. */
function areaMask(buf: Int16Array, { w, h }: Size): Uint8Array {
  const wide = new Uint8Array(w * h);
  const tall = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; ) {
      let end = x;
      while (end < w && buf[y * w + end] === buf[y * w + x]) end++;
      if (end - x >= AREA_SPAN) wide.fill(1, y * w + x, y * w + end);
      x = end;
    }
  for (let x = 0; x < w; x++)
    for (let y = 0; y < h; ) {
      let end = y;
      while (end < h && buf[end * w + x] === buf[y * w + x]) end++;
      if (end - y >= AREA_SPAN) for (let i = y; i < end; i++) tall[i * w + x] = 1;
      y = end;
    }
  return wide.map((v, i) => v & tall[i]);
}

/** The glyph's middle, near enough to say what it was drawn on. */
function glyphMiddle(op: Extract<DrawOp, { op: "text" }>): [number, number] {
  const half = (0.55 * op.size * op.text.length) / 2;
  const x =
    op.align === "left" ? op.x + half : op.align === "right" ? op.x - half : op.x;
  const y = op.baseline === "alphabetic" ? op.y - 0.35 * op.size : op.y;
  return [Math.round(x), Math.round(y)];
}

/**
 * Every pair of palette indices the frame paints next to each other.
 *
 * `background` is the index of the board (`PaletteScheme.board`), which is what a
 * pixel nothing drew on shows.
 */
export function paintedNeighbors(
  ops: readonly DrawOp[],
  size: Size,
  background: number,
): NeighborPair[] {
  const { w, h } = size;
  const pairs = new Map<string, NeighborPair>();
  const see = (kind: NeighborKind, a: number, b: number): void => {
    if (a === b || a < 0 || b < 0) return;
    const [lo, hi] = kind === "area" && a > b ? [b, a] : [a, b];
    const key = `${kind}:${lo}:${hi}`;
    const pair = pairs.get(key) ?? { kind, a: lo, b: hi, count: 0 };
    pair.count++;
    pairs.set(key, pair);
  };

  // A glyph sits on whatever had been painted when it was drawn, so the
  // record is replayed up to each one.
  const texts = ops.flatMap((op, i) => (op.op === "text" ? [{ op, i }] : []));
  if (texts.length > 0) {
    let upTo = 0;
    let under = paintIndices([], size, background);
    for (const { op, i } of texts) {
      // Repainting from the start is quadratic in the record, so only what
      // was drawn since the last glyph is added; a clip left open carries.
      under = paintOnto(under, ops.slice(upTo, i), ops.slice(0, upTo), size);
      upTo = i;
      const [x, y] = glyphMiddle(op);
      if (x >= 0 && y >= 0 && x < w && y < h) see("text", op.color, under[y * w + x]);
    }
  }

  const buf = paintIndices(ops, size, background);
  const area = areaMask(buf, size);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
      ]) {
        if (x + dx < w && y + dy < h) {
          const q = p + dy * w + dx;
          if (area[p] && area[q]) see("area", buf[p], buf[q]);
          else if (area[q] && !area[p]) see("mark", buf[p], buf[q]);
          else if (area[p] && !area[q]) see("mark", buf[q], buf[p]);
        }
        const fx = x + dx * ACROSS_HAIRLINE;
        const fy = y + dy * ACROSS_HAIRLINE;
        if (fx < w && fy < h) {
          const q = fy * w + fx;
          if (area[p] && area[q]) see("area", buf[p], buf[q]);
        }
      }
    }
  return [...pairs.values()];
}

/** `more` painted over `under`, with the clip state `before` left behind. */
function paintOnto(
  under: Int16Array,
  more: readonly DrawOp[],
  before: readonly DrawOp[],
  size: Size,
): Int16Array {
  let openClip: DrawOp | null = null;
  for (const op of before) {
    if (op.op === "clip") openClip = op;
    else if (op.op === "unclip") openClip = null;
  }
  // -1 never occurs as a painted index a pair is read from, so it marks the
  // pixels this stretch of the record left alone.
  const layer = paintIndices(openClip ? [openClip, ...more] : more, size, -1);
  const out = under.slice();
  for (let i = 0; i < layer.length; i++) if (layer[i] !== -1) out[i] = layer[i];
  return out;
}
