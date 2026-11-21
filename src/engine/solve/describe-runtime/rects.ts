/** Rectangles as elements: each numbered by its corners, and its cells,
 * inner cells and rim (`describe-runtime.ts`). */

import type { GridSpace } from "./space.ts";

// --- rectangles --------------------------------------------------------------

/** The rectangle whose top left cell is `a` and bottom right `b`. */
const rectOf = (sp: GridSpace, a: number, b: number): number => a * sp.cells.length + b;
const topLeft = (sp: GridSpace, r: number): number => Math.floor(r / sp.cells.length);
const bottomRight = (sp: GridSpace, r: number): number => r % sp.cells.length;

/** Each space's rectangles by the cell they hold and their size, built at the
 * first read of each. */
const rectLists = new WeakMap<GridSpace, Map<number, readonly number[]>>();

/**
 * `rects(c, n)`: the rectangles on the grid that hold cell `c`, of `n` cells,
 * or of any number where `n` is 0: by width, then height, then from the
 * top, then from the left, as the game has always tried them.
 */
export function rectsOf(sp: GridSpace, c: number, n: number): readonly number[] {
  let bySpace = rectLists.get(sp);
  if (bySpace === undefined) {
    bySpace = new Map();
    rectLists.set(sp, bySpace);
  }
  const key = c * (sp.cells.length + 1) + n;
  let list = bySpace.get(key);
  if (list === undefined) {
    const { w, h } = sp;
    const cx = c % w;
    const cy = (c / w) | 0;
    const out: number[] = [];
    for (let rw = 1; rw <= w; rw++)
      for (let rh = 1; rh <= h; rh++) {
        if (n > 0 && rw * rh !== n) continue;
        for (let y = Math.max(0, cy - rh + 1); y <= cy && y + rh <= h; y++)
          for (let x = Math.max(0, cx - rw + 1); x <= cx && x + rw <= w; x++)
            out.push(rectOf(sp, y * w + x, (y + rh - 1) * w + x + rw - 1));
      }
    list = out;
    bySpace.set(key, list);
  }
  return list;
}

/** `width(r)`, the columns the rectangle spans. */
export function rectWidth(sp: GridSpace, r: number): number {
  return (bottomRight(sp, r) % sp.w) - (topLeft(sp, r) % sp.w) + 1;
}

/** `height(r)`, the rows the rectangle spans. */
export function rectHeight(sp: GridSpace, r: number): number {
  return ((bottomRight(sp, r) / sp.w) | 0) - ((topLeft(sp, r) / sp.w) | 0) + 1;
}

/** `c in cells(r)`, without listing them. */
export function rectHolds(sp: GridSpace, r: number, c: number): boolean {
  const a = topLeft(sp, r);
  const b = bottomRight(sp, r);
  const x = c % sp.w;
  const y = (c / sp.w) | 0;
  return (
    x >= a % sp.w && x <= b % sp.w && y >= ((a / sp.w) | 0) && y <= ((b / sp.w) | 0)
  );
}

/** `exists x in cells(r): x in cells(s)`, from the sides alone. */
export function rectMeets(sp: GridSpace, r: number, s: number): boolean {
  const { w } = sp;
  const a = topLeft(sp, r);
  const b = bottomRight(sp, r);
  const c = topLeft(sp, s);
  const d = bottomRight(sp, s);
  return (
    a % w <= d % w &&
    c % w <= b % w &&
    ((a / w) | 0) <= ((d / w) | 0) &&
    ((c / w) | 0) <= ((b / w) | 0)
  );
}

/** `forall x in cells(r): x in cells(s)`, from the sides alone. */
export function rectWithin(sp: GridSpace, r: number, s: number): boolean {
  return rectHolds(sp, s, topLeft(sp, r)) && rectHolds(sp, s, bottomRight(sp, r));
}

/** Each space's lists of a rectangle's cells, inner edges and rim, by the
 * rectangle, sparse: a ladder reads the same few rectangles' lists on every
 * pass. */
type RectParts = (readonly number[])[][];
const rectParts = new WeakMap<GridSpace, RectParts>();
let lastPartsSpace: GridSpace | null = null;
let lastParts: RectParts = [];

function keptPart(
  sp: GridSpace,
  part: number,
  r: number,
  make: (sp: GridSpace, r: number) => readonly number[],
): readonly number[] {
  if (sp !== lastPartsSpace) {
    let parts = rectParts.get(sp);
    if (parts === undefined) {
      parts = [[], [], []];
      rectParts.set(sp, parts);
    }
    lastPartsSpace = sp;
    lastParts = parts;
  }
  const kept = lastParts[part];
  if (kept[r] === undefined) kept[r] = make(sp, r);
  return kept[r];
}

/** `cells(r)`, in reading order. */
export function rectCells(sp: GridSpace, r: number): readonly number[] {
  return keptPart(sp, 0, r, cellsOfRect);
}

/** `inner(r)`: the edges between two of the rectangle's cells, in the
 * space's order. */
export function rectInner(sp: GridSpace, r: number): readonly number[] {
  return keptPart(sp, 1, r, innerOfRect);
}

/** `rim(r)`: the edges between one of the rectangle's cells and a cell
 * outside it, in the space's order. */
export function rectRim(sp: GridSpace, r: number): readonly number[] {
  return keptPart(sp, 2, r, rimOfRect);
}

function cellsOfRect(sp: GridSpace, r: number): readonly number[] {
  const a = topLeft(sp, r);
  const b = bottomRight(sp, r);
  const out: number[] = [];
  for (let y = (a / sp.w) | 0; y <= ((b / sp.w) | 0); y++)
    for (let x = a % sp.w; x <= b % sp.w; x++) out.push(y * sp.w + x);
  return out;
}

function innerOfRect(sp: GridSpace, r: number): readonly number[] {
  const a = topLeft(sp, r);
  const b = bottomRight(sp, r);
  const out: number[] = [];
  for (let y = (a / sp.w) | 0; y <= ((b / sp.w) | 0); y++)
    for (let x = a % sp.w; x <= b % sp.w; x++) {
      const c = y * sp.w + x;
      if (x < b % sp.w) out.push(sp.edgeOf(c, c + 1));
      if (y < ((b / sp.w) | 0)) out.push(sp.edgeOf(c, c + sp.w));
    }
  return out;
}

function rimOfRect(sp: GridSpace, r: number): readonly number[] {
  const { w, h } = sp;
  const a = topLeft(sp, r);
  const b = bottomRight(sp, r);
  const x0 = a % w;
  const y0 = (a / w) | 0;
  const x1 = b % w;
  const y1 = (b / w) | 0;
  const out: number[] = [];
  for (let y = y0 - 1; y <= y1; y++)
    for (let x = x0 - 1; x <= x1; x++) {
      if (x < 0 || y < 0) continue;
      const c = y * w + x;
      // The edge on the cell's right, then the one below it, each across
      // the rectangle's side.
      if (y >= y0 && x + 1 < w && (x === x0 - 1 || x === x1))
        out.push(sp.edgeOf(c, c + 1));
      if (x >= x0 && y + 1 < h && (y === y0 - 1 || y === y1))
        out.push(sp.edgeOf(c, c + w));
    }
  return out;
}
