/**
 * Rectangles state construction and move execution, plus the edge-drawing
 * primitive and the correctness analysis. Kept separate from `index.ts` so
 * `render.ts` can import `gridDrawRect` for the drag preview without a cycle
 * (docs/rendering.md § "The tile cache and the diff key").
 */

import { assertNever } from "../../engine/assert-never.ts";
import { descValue } from "../../engine/desc-error.ts";
import type { GameStatus, Rect } from "../../engine/types.ts";
import {
  clueAllows,
  clueDimensions,
  HIDDEN,
  parseDesc,
  type RectMove,
  type RectParams,
  type RectState,
  SHAPE_ANY,
} from "./state.ts";

/* Upstream's `HRANGE` / `VRANGE`: an hedge is meaningful only for
 * `y ∈ [1, h-1]`, a vedge only for `x ∈ [1, w-1]`. */
export const hrange = (w: number, h: number, x: number, y: number) =>
  x >= 0 && x < w && y >= 1 && y < h;
export const vrange = (w: number, h: number, x: number, y: number) =>
  x >= 1 && x < w && y >= 0 && y < h;

/**
 * Whether the `rw × rh` box at `(x, y)` has every side drawn and no line
 * inside. It stops at the first edge that is wrong: on a board with few lines
 * a box runs to the far sides, and reading all of it for each of its squares
 * made a move on a large board cost the square of its area.
 */
function isOutlined(
  w: number,
  h: number,
  hedge: Uint8Array,
  vedge: Uint8Array,
  x: number,
  y: number,
  rw: number,
  rh: number,
): boolean {
  for (let xx = x; xx < x + rw; xx++)
    for (let yy = y; yy <= y + rh; yy++) {
      const e = !hrange(w, h, xx, yy) || hedge[yy * w + xx] !== 0;
      if (e !== (yy === y || yy === y + rh)) return false;
    }
  for (let yy = y; yy < y + rh; yy++)
    for (let xx = x; xx <= x + rw; xx++) {
      const e = !vrange(w, h, xx, yy) || vedge[yy * w + xx] !== 0;
      if (e !== (xx === x || xx === x + rw)) return false;
    }
  return true;
}

/**
 * The rectangle drawn round the square `(x, y)`: every side a line or the
 * board's edge, and no line inside. Null where the square is in none. With no
 * line inside, the box runs from the square to the first line each way.
 */
export function outlinedBoxAt(
  s: Pick<RectState, "w" | "h" | "hedge" | "vedge">,
  x: number,
  y: number,
): Rect | null {
  const { w, h, hedge, vedge } = s;
  let x0 = x;
  while (x0 > 0 && !vedge[y * w + x0]) x0--;
  let x1 = x + 1;
  while (x1 < w && !vedge[y * w + x1]) x1++;
  let y0 = y;
  while (y0 > 0 && !hedge[y0 * w + x]) y0--;
  let y1 = y + 1;
  while (y1 < h && !hedge[y1 * w + x]) y1++;
  return isOutlined(w, h, hedge, vedge, x0, y0, x1 - x0, y1 - y0)
    ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
    : null;
}

/**
 * The box closed round the square `(x, y)` and round one clue. The whole
 * board before any line, or a box holding several clues or none, is not one.
 */
function clueBoxAt(s: RectState, x: number, y: number): Rect | null {
  const box = outlinedBoxAt(s, x, y);
  if (!box) return null;
  let clues = 0;
  for (let yy = box.y; yy < box.y + box.h; yy++)
    for (let xx = box.x; xx < box.x + box.w; xx++) if (s.grid[yy * s.w + xx]) clues++;
  return clues === 1 ? box : null;
}

/**
 * The rectangle the player drew round the square `(x, y)`, by a drag or a
 * resize, while it is still closed round one clue: what the player means by
 * a rectangle, which a drag from it resizes and the hint reads as theirs. A
 * box their lines close by chance, such as what is left beside one drawn
 * across the board, is not one.
 */
export function drawnBoxAt(s: RectState, x: number, y: number): Rect | null {
  const box = clueBoxAt(s, x, y);
  if (!box) return null;
  const drew = s.drawn.some(
    (d) => d.x === box.x && d.y === box.y && d.w === box.w && d.h === box.h,
  );
  return drew ? box : null;
}

/**
 * What the player's marks say, read as the hint and the mistake check read
 * them. A rectangle drawn round one clue ({@link drawnBoxAt}) says its
 * squares are that clue's:
 * the clue's rectangle contains it. It is **final** where it has its clue's
 * number of squares, since then no other of that size contains it; until
 * then it may still grow, and its sides are not lines, but for one with
 * another clue's rectangle across it, which two clues' squares settle.
 * Every other drawn edge is a line.
 */
export interface Claims {
  /** For each square, the clue whose drawn rectangle holds it, or -1. */
  readonly owner: Int32Array;
  /** Each clue's drawn rectangle, by the clue's square: whether it is final,
   * and whether it is beyond mending, no rectangle the clue allows on the
   * board containing it, which is a rule broken before any answer is asked. */
  readonly boxes: ReadonlyMap<
    number,
    { readonly box: Rect; readonly final: boolean; readonly broken: boolean }
  >;
  /** The drawn edges that are lines, in the state's layout. */
  readonly hedge: Uint8Array;
  readonly vedge: Uint8Array;
}

export function readClaims(s: RectState): Claims {
  const { w, h, grid } = s;
  const owner = new Int32Array(w * h).fill(-1);
  const boxes = new Map<number, { box: Rect; final: boolean; broken: boolean }>();
  for (let c = 0; c < w * h; c++) {
    if (!grid[c]) continue;
    const box = drawnBoxAt(s, c % w, Math.floor(c / w));
    if (!box) continue;
    const mendable = clueDimensions(s.shapes[c], grid[c], w, h).some(
      ([rw, rh]) => rw >= box.w && rh >= box.h && rw <= w && rh <= h,
    );
    boxes.set(c, {
      box,
      final: grid[c] !== HIDDEN && box.w * box.h === grid[c],
      broken: !mendable,
    });
    for (let y = box.y; y < box.y + box.h; y++)
      for (let x = box.x; x < box.x + box.w; x++) owner[y * w + x] = c;
  }
  const hedge = s.hedge.slice();
  const vedge = s.vedge.slice();
  const claimed = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < w && y < h && owner[y * w + x] >= 0;
  for (const { box, final } of boxes.values()) {
    if (final) continue;
    for (let x = box.x; x < box.x + box.w; x++) {
      if (!claimed(x, box.y - 1)) hedge[box.y * w + x] = 0;
      const b = box.y + box.h;
      if (b < h && !claimed(x, b)) hedge[b * w + x] = 0;
    }
    for (let y = box.y; y < box.y + box.h; y++) {
      if (!claimed(box.x - 1, y)) vedge[y * w + box.x] = 0;
      const r = box.x + box.w;
      if (r < w && !claimed(r, y)) vedge[y * w + r] = 0;
    }
  }
  return { owner, boxes, hedge, vedge };
}

/**
 * The resize a player's drag makes of the rectangle `from`: its sides are
 * taken up, but for those that are a side of another drawn rectangle as well,
 * and `to` is drawn, clearing any line inside it. `really` as in
 * {@link gridDrawRect}; `c` is what a drawn side becomes, and `off` what a
 * side taken up becomes, which the drag's preview colors.
 */
export function resizeEdges(
  s: Pick<RectState, "w" | "h" | "hedge" | "vedge">,
  from: Rect,
  to: Rect,
  hedge: Uint8Array,
  vedge: Uint8Array,
  c: number,
  off: number,
): void {
  const { w, h } = s;
  const shared = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < w && y < h && outlinedBoxAt(s, x, y) !== null;
  for (let x = from.x; x < from.x + from.w; x++) {
    if (hrange(w, h, x, from.y) && !shared(x, from.y - 1)) hedge[from.y * w + x] = off;
    const b = from.y + from.h;
    if (hrange(w, h, x, b) && !shared(x, b)) hedge[b * w + x] = off;
  }
  for (let y = from.y; y < from.y + from.h; y++) {
    if (vrange(w, h, from.x, y) && !shared(from.x - 1, y)) vedge[y * w + from.x] = off;
    const r = from.x + from.w;
    if (vrange(w, h, r, y) && !shared(r, y)) vedge[y * w + r] = off;
  }
  gridDrawRect(w, h, hedge, vedge, c, true, true, to.x, to.y, to.x + to.w, to.y + to.h);
}

/**
 * Recompute the per-cell correctness overlay (upstream `get_correct`). A cell
 * is correct (1) iff it belongs to a valid rectangle — every boundary edge
 * present, no interior edge, and exactly one contained clue, which allows the
 * rectangle's size and shape; otherwise 0.
 */
function getCorrect(
  w: number,
  h: number,
  grid: Int32Array,
  shapes: Uint8Array,
  hedge: Uint8Array,
  vedge: Uint8Array,
): Uint8Array {
  const ret = new Uint8Array(w * h).fill(0xff);

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      if (ret[y * w + x] !== 0xff) continue;

      // Find the rectangle starting at this point.
      let rw = 1;
      while (x + rw < w && !vedge[y * w + (x + rw)]) rw++;
      let rh = 1;
      while (y + rh < h && !hedge[(y + rh) * w + x]) rh++;

      let valid = isOutlined(w, h, hedge, vedge, x, y, rw, rh);
      if (!valid) {
        ret[y * w + x] = 0;
        continue;
      }

      // We have a rectangle. Find its one clue.
      let clue = -1;
      for (let xx = x; xx < x + rw; xx++) {
        for (let yy = y; yy < y + rh; yy++) {
          if (grid[yy * w + xx]) {
            if (clue >= 0) valid = false; // two clues
            clue = yy * w + xx;
          }
        }
      }
      if (clue < 0 || !clueAllows(shapes[clue], grid[clue], rw, rh)) valid = false;

      const fill = valid ? 1 : 0;
      for (let xx = x; xx < x + rw; xx++)
        for (let yy = y; yy < y + rh; yy++) ret[yy * w + xx] = fill;
    }
  }

  return ret;
}

/**
 * Draw (or measure) the edges of the rectangle box `(x1,y1)`–`(x2,y2)` into the
 * given edge grids (upstream `grid_draw_rect`). `c` is the edge value, `really`
 * commits (vs. just measuring `changed`), `outline` draws the boundary edges
 * (and, when `c === 1`, clears interior edges); `!outline` clears interior only.
 * Returns whether anything changed.
 */
export function gridDrawRect(
  w: number,
  h: number,
  hedge: Uint8Array,
  vedge: Uint8Array,
  c: number,
  really: boolean,
  outline: boolean,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): boolean {
  let changed = false;

  // Horizontal edges.
  for (let x = x1; x < x2; x++)
    for (let y = y1; y <= y2; y++)
      if (hrange(w, h, x, y)) {
        let val = hedge[y * w + x];
        if (y === y1 || y === y2) {
          if (!outline) continue;
          val = c;
        } else if (c === 1) {
          val = 0;
        }
        changed = changed || hedge[y * w + x] !== val;
        if (really) hedge[y * w + x] = val;
      }

  // Vertical edges.
  for (let y = y1; y < y2; y++)
    for (let x = x1; x <= x2; x++)
      if (vrange(w, h, x, y)) {
        let val = vedge[y * w + x];
        if (x === x1 || x === x2) {
          if (!outline) continue;
          val = c;
        } else if (c === 1) {
          val = 0;
        }
        changed = changed || vedge[y * w + x] !== val;
        if (really) vedge[y * w + x] = val;
      }

  return changed;
}

/** Parse the desc into the initial state (all edges clear). */
export function newState(params: RectParams, desc: string): RectState {
  const { w, h } = params;
  const area = w * h;
  const { grid, shapes } = descValue(parseDesc(params, desc));
  const vedge = new Uint8Array(area);
  const hedge = new Uint8Array(area);
  const correct = getCorrect(w, h, grid, shapes, hedge, vedge);
  return { w, h, grid, shapes, vedge, hedge, drawn: [], correct };
}

const overlaps = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

export function cloneRectState(s: RectState): RectState {
  return {
    ...s,
    vedge: s.vedge.slice(),
    hedge: s.hedge.slice(),
    correct: s.correct.slice(),
  };
}

/** Pure move execution: returns a NEW state (upstream `execute_move`). Every
 * move type, the solve path included, recomputes `correct`, which is what
 * `isSolved` reads. */
export function executeMove(from: RectState, move: RectMove): RectState {
  const { w, h } = from;
  const next = cloneRectState(from);
  const hedge = next.hedge;
  const vedge = next.vedge;
  // A rectangle drawn, or resized, replaces any drawn before that it lies
  // over; a clearing drag takes away those it reaches.
  let drawn = from.drawn;

  if (move.type === "solve") {
    drawn = [];
    // Row-major bit runs over the meaningful edges; a short run leaves the
    // remaining edges clear.
    let i = 0;
    for (let y = 0; y < h; y++)
      for (let x = 1; x < w; x++) vedge[y * w + x] = move.vedge[i++] === "1" ? 1 : 0;
    i = 0;
    for (let y = 1; y < h; y++)
      for (let x = 0; x < w; x++) hedge[y * w + x] = move.hedge[i++] === "1" ? 1 : 0;
  } else if (move.type === "rect") {
    gridDrawRect(
      w,
      h,
      hedge,
      vedge,
      1,
      true,
      !move.erasing,
      move.x,
      move.y,
      move.x + move.w,
      move.y + move.h,
    );
    const r = { x: move.x, y: move.y, w: move.w, h: move.h };
    drawn = drawn.filter((d) => !overlaps(d, r));
    if (!move.erasing) drawn = [...drawn, r];
  } else if (move.type === "edge") {
    if (move.edge === "h") hedge[move.y * w + move.x] ^= 1;
    else vedge[move.y * w + move.x] ^= 1;
  } else if (move.type === "resize") {
    resizeEdges(from, move.from, move.to, hedge, vedge, 1, 0);
    drawn = [
      ...drawn.filter((d) => !overlaps(d, move.from) && !overlaps(d, move.to)),
      move.to,
    ];
  } else {
    return assertNever(move, "rect: executeMove");
  }

  const correct = getCorrect(w, h, next.grid, next.shapes, hedge, vedge);
  return { ...next, drawn, correct };
}

/** Solved: every cell lies in a valid rectangle. */
export function isSolved(s: RectState): boolean {
  return !s.correct.includes(0);
}

export function status(s: RectState): GameStatus {
  return isSolved(s) ? "solved" : "ongoing";
}

/** A clue as the text format writes it: its number, or `?` where it shows
 * none, after `S`, `T` or `W` for a shape. */
function clueText(state: RectState, i: number): string {
  const n = state.grid[i];
  if (!n) return "";
  const shape = state.shapes[i] === SHAPE_ANY ? "" : " STW"[state.shapes[i]];
  return shape + (n === HIDDEN ? "?" : String(n));
}

export function textFormat(state: RectState): string {
  const { w, h, hedge, vedge } = state;

  // Column width: at least 2, else the widest clue.
  let col = 2;
  for (let i = 0; i < w * h; i++) {
    const len = clueText(state, i).length;
    if (col < len) col = len;
  }

  // Whether the edge on the top / left of cell (cx, cy) is drawn; the grid's
  // outer border always is.
  const hOn = (cx: number, cy: number) =>
    cy === 0 || cy === h || (hrange(w, h, cx, cy) && hedge[cy * w + cx] !== 0);
  const vOn = (cx: number, cy: number) =>
    cx === 0 || cx === w || (vrange(w, h, cx, cy) && vedge[cy * w + cx] !== 0);

  let out = "";
  for (let y = 0; y <= 2 * h; y++) {
    for (let x = 0; x <= 2 * w; x++) {
      const cx = Math.floor(x / 2);
      const cy = Math.floor(y / 2);
      if (x & y & 1) {
        out += clueText(state, cy * w + cx).padStart(col);
      } else if (x & 1) {
        out += (hOn(cx, cy) ? "-" : " ").repeat(col);
      } else if (y & 1) {
        out += vOn(cx, cy) ? "|" : " ";
      } else {
        const hl = hOn(cx - 1, cy);
        const hr = hOn(cx, cy);
        const vu = vOn(cx, cy - 1);
        const vd = vOn(cx, cy);
        if (!hl && !hr && !vu && !vd) out += " ";
        else if (hl && hr && !vu && !vd) out += "-";
        else if (!hl && !hr && vu && vd) out += "|";
        else out += "+";
      }
    }
    out += "\n";
  }
  return out;
}
