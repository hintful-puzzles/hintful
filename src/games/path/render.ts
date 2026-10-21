/**
 * Path's rendering: a loop over the squares that repaints only the ones whose
 * packed key changed (docs/rendering.md § "The tile cache and the diff key").
 *
 * A square draws its own half of each of its four sides: the line from its
 * middle to the side, and its half of a cross on the side. A line between two
 * squares is the two halves, and a cross is whole once both squares have
 * drawn. So a square's key holds what is on each of its sides, in a word of
 * its own beside the word for what the square holds.
 */

import {
  CURSOR,
  cellSurface,
  clueDoneColor,
  DRAG_ADD,
  DRAG_REMOVE,
  ERROR,
  FLASH,
  FLASH_LEAD,
  givenSurface,
  HINT_OUTLINE,
  HINT_RING,
  INK,
  RULED_OUT,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawRectCorners, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { fromCoord } from "../../engine/geometry.ts";
import { drawMarkSides, outlineSides } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
import type { PathHighlights } from "./hint.ts";
import { EDGE } from "./hint-text.ts";
import type { PathMistake } from "./index.ts";
import { dragChanges, withChanges } from "./moves.ts";
import {
  CROSS,
  geometry,
  LINE,
  NO_END,
  type PathMove,
  type PathParams,
  type PathState,
  type PathUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 40;

// --- palette ----------------------------------------------------------------

const COL_BACKGROUND = 0;
const COL_GRID = 1;
const COL_CELL = 2;
/** The disc under a number. */
const COL_GIVEN = 3;
const COL_LINE = 4;
const COL_RULED_OUT = 5;
const COL_TEXT = 6;
/** A line that breaks a rule already: it closes a loop, or joins two
 * different numbers. */
export const COL_ERROR = 7;
/** A number whose path is drawn whole. */
const COL_DONE = 8;
const COL_DRAG_ADD = 9;
const COL_DRAG_REMOVE = 10;
const COL_CURSOR = 11;
/** The edges a hint step decides, drawn as the line or cross it asks for. */
export const COL_HINT = 12;
/** The squares a step reasons from, and the edges a supposition would
 * force. */
export const COL_HINT_EVIDENCE = 13;
const COL_FLASH = 14;
const COL_FLASH_LEAD = 15;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_GIVEN] = givenSurface(defaultBackground);
  out[COL_LINE] = INK;
  out[COL_RULED_OUT] = RULED_OUT;
  out[COL_TEXT] = INK;
  out[COL_ERROR] = ERROR;
  out[COL_DONE] = clueDoneColor(defaultBackground);
  out[COL_DRAG_ADD] = DRAG_ADD;
  out[COL_DRAG_REMOVE] = DRAG_REMOVE;
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT] = HINT_RING;
  out[COL_HINT_EVIDENCE] = HINT_OUTLINE;
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  return out;
}

// --- geometry ---------------------------------------------------------------

export const border = (ts: number): number => Math.floor(ts / 4);

export function computeSize(p: PathParams, ts: number): Size {
  return { w: p.w * ts + 2 * border(ts) + 1, h: p.h * ts + 2 * border(ts) + 1 };
}

/** The square under pixel `p`, or `-1` off the board. */
export function cellAt(state: PathState, ts: number, p: Point): number {
  const x = fromCoord(p.x, ts, border(ts));
  const y = fromCoord(p.y, ts, border(ts));
  return x >= 0 && x < state.w && y >= 0 && y < state.h ? y * state.w + x : -1;
}

/** The middle of square `i`. */
export function centerOf(state: PathState, ts: number, i: number): Point {
  const b = border(ts);
  const half = Math.floor(ts / 2);
  return {
    x: (i % state.w) * ts + b + half,
    y: Math.floor(i / state.w) * ts + b + half,
  };
}

/** Which way each of a square's four sides lies, in `Geometry.around`'s
 * order: up, left, right, down. */
const SIDES: readonly Point[] = [
  { x: 0, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
];

/**
 * The edge a press at `p` is aimed at: the side of its square it lies
 * nearest, or `null` near the square's middle or on the board's rim, where
 * no edge is.
 */
export function edgeAt(state: PathState, ts: number, p: Point): number | null {
  const i = cellAt(state, ts, p);
  if (i < 0) return null;
  const c = centerOf(state, ts, i);
  const [dx, dy] = [p.x - c.x, p.y - c.y];
  if (Math.max(Math.abs(dx), Math.abs(dy)) < ts / 4) return null;
  const side = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : dy < 0 ? 0 : 3;
  const e = geometry(state.w, state.h).around[i * 4 + side];
  return e >= 0 ? e : null;
}

/** A point a press aims at edge `e` from, inside its first square and well
 * toward the side, so that {@link edgeAt} reads it back as `e`. */
export function pointAtEdge(state: PathState, ts: number, e: number): Point {
  const g = geometry(state.w, state.h);
  const i = g.a[e];
  const side = g.around[i * 4 + 2] === e ? 2 : 3;
  const c = centerOf(state, ts, i);
  const reach = Math.floor((3 * ts) / 8);
  return { x: c.x + SIDES[side].x * reach, y: c.y + SIDES[side].y * reach };
}

// --- draw state -------------------------------------------------------------

// Word 0, the square: its number in bits 0-7, then the cursor, the win
// flash's tone, whether its path is whole, and the sides of the hint's
// outline it draws (`hint-mark.ts`'s side bits).
const F_CURSOR = 1 << 8;
const K_TONE = 9;
const F_DONE = 1 << 11;
const K_OUTLINE = 12;

// Word 1, the sides: seven bits a side, in `SIDES` order.
const SIDE_BITS = 7;
// The side's mark in bits 0-1, then whether its line breaks a rule, whether
// Check & Save found it wrong, and what the drag would do to it.
const S_ERROR = 1 << 2;
const S_WRONG = 1 << 3;
const S_DRAG_ADD = 1 << 4;
const S_DRAG_REMOVE = 1 << 5;

// Word 2, the hint on the sides: six bits a side. What the step shows there
// in bits 0-2, and its place in a supposition's chain in bits 3-5.
const HINT_SIDE_BITS = 6;
const H_LINE = 1;
const H_CROSS = 2;
const H_CHAIN_LINE = 3;
const H_CHAIN_CROSS = 4;
const K_ORDER = 3;

const WORDS = 3;

export interface PathDrawState {
  started: boolean;
  tileSize: number;
  /** What each square shows on the canvas, three words a square; -1 before
   * the first frame. */
  cache: Int32Array;
}

export function newDrawState(state: PathState, tileSize: number): PathDrawState {
  const squares = state.w * state.h;
  return {
    started: false,
    tileSize,
    cache: new Int32Array(squares * WORDS).fill(-1),
  };
}

// --- one square -------------------------------------------------------------

function drawTile(
  dr: GameDrawing,
  ds: PathDrawState,
  x: number,
  y: number,
  square: number,
  sides: number,
  hints: number,
): void {
  const ts = ds.tileSize;
  const b = border(ts);
  const px = x * ts + b;
  const py = y * ts + b;
  const half = Math.floor(ts / 2);
  const cx = px + half;
  const cy = py + half;
  const tone = ((square >> K_TONE) & 3) as WinTone;
  const thick = Math.max(2, Math.floor(ts / 7));

  // The square's own box: its top and left grid lines and its surface. What
  // it draws of a side's cross reaches the side and stops, and the square
  // beyond draws the rest.
  dr.clip({ x: px, y: py, w: ts, h: ts });
  dr.drawRect({ x: px, y: py, w: ts, h: ts }, COL_GRID);
  dr.drawRect(
    { x: px + 1, y: py + 1, w: ts - 1, h: ts - 1 },
    tone ? winSlot(tone, COL_FLASH, COL_FLASH_LEAD) : COL_CELL,
  );
  // The hint's outline, inside the square and under everything it holds, so
  // the lines and crosses on its sides stay on top of it (as Pearl's).
  drawMarkSides(
    dr,
    {
      box: { x: px + 1, y: py + 1, w: ts - 1, h: ts - 1 },
      outer: 0,
      inner: Math.max(2, ts >> 4),
    },
    (square >> K_OUTLINE) & 0xf,
    COL_HINT_EVIDENCE,
  );

  const sideEnd = (k: number): Point => ({
    x: cx + SIDES[k].x * (half + (SIDES[k].x > 0 ? 1 : 0)),
    y: cy + SIDES[k].y * (half + (SIDES[k].y > 0 ? 1 : 0)),
  });
  const cross = (k: number, color: number, size: number, weight: number): void => {
    const m = sideEnd(k);
    dr.drawLine(
      { x: m.x - size, y: m.y - size },
      { x: m.x + size, y: m.y + size },
      color,
      weight,
    );
    dr.drawLine(
      { x: m.x - size, y: m.y + size },
      { x: m.x + size, y: m.y - size },
      color,
      weight,
    );
  };

  // Crosses first, the player's and the step's, under any line.
  const small = Math.max(2, Math.floor(ts / 8));
  for (let k = 0; k < 4; k++) {
    const s = (sides >> (k * SIDE_BITS)) & ((1 << SIDE_BITS) - 1);
    const h = (hints >> (k * HINT_SIDE_BITS)) & 7;
    if ((s & 3) === CROSS) cross(k, s & S_WRONG ? COL_ERROR : COL_RULED_OUT, small, 1);
    else if (h === H_CROSS) cross(k, COL_HINT, small, Math.max(2, ts >> 4));
    else if (h === H_CHAIN_CROSS)
      cross(k, COL_HINT_EVIDENCE, small, Math.max(2, ts >> 4));
  }

  // The lines, each from the middle to its side. A line's ends are round, so
  // two halves meeting in the middle make a round turn; two that run straight
  // through are one stroke, as two round ends overlapping there darken their
  // soft edges into a knob.
  const strokes: { k: number; color: number; weight: number }[] = [];
  for (let k = 0; k < 4; k++) {
    const s = (sides >> (k * SIDE_BITS)) & ((1 << SIDE_BITS) - 1);
    const h = (hints >> (k * HINT_SIDE_BITS)) & 7;
    let color = -1;
    let weight = thick;
    if (s & S_DRAG_ADD) color = COL_DRAG_ADD;
    else if (s & S_DRAG_REMOVE) color = COL_DRAG_REMOVE;
    else if ((s & 3) === LINE)
      color = s & S_WRONG || s & S_ERROR ? COL_ERROR : COL_LINE;
    else if (h === H_LINE) color = COL_HINT;
    else if (h === H_CHAIN_LINE) {
      color = COL_HINT_EVIDENCE;
      weight = Math.max(2, thick >> 1);
    }
    if (color >= 0) strokes.push({ k, color, weight });
  }
  const [p, q] = strokes;
  if (
    strokes.length === 2 &&
    p.k + q.k === 3 &&
    p.color === q.color &&
    p.weight === q.weight
  ) {
    dr.drawLine(sideEnd(p.k), sideEnd(q.k), p.color, p.weight);
  } else {
    for (const { k, color, weight } of strokes)
      dr.drawLine({ x: cx, y: cy }, sideEnd(k), color, weight);
  }

  const number = square & 0xff;
  if (number !== NO_END) {
    const r = Math.floor((ts * 3) / 8);
    dr.drawCircle(
      { x: cx, y: cy },
      r,
      COL_GIVEN,
      square & F_DONE ? COL_DONE : COL_TEXT,
    );
    dr.drawText(
      { x: cx, y: cy },
      glyphFont(Math.floor(number > 9 ? ts / 3 : (ts * 2) / 5)),
      square & F_DONE ? COL_DONE : COL_TEXT,
      String(number),
    );
  }

  if (square & F_CURSOR)
    drawRectCorners(dr, cx, cy, half - 3, COL_CURSOR, Math.max(2, ts >> 4));

  // A chain's ordinal sits beside its edge's middle, off the line it
  // numbers, between the discs of the two squares: a square's corner is
  // where `drawHintOrdinal` puts one, and an edge has no corner. Both
  // squares of the edge draw it, each its own half.
  for (let k = 0; k < 4; k++) {
    const order = (hints >> (k * HINT_SIDE_BITS + K_ORDER)) & 7;
    if (order === 0) continue;
    const m = sideEnd(k);
    const off = Math.floor(ts / 4);
    dr.drawText(
      SIDES[k].x !== 0 ? { x: m.x, y: m.y - off } : { x: m.x + off, y: m.y },
      {
        align: "center",
        baseline: "mathematical",
        fontType: "variable",
        size: Math.max(8, off),
      },
      COL_HINT_EVIDENCE,
      String(order),
    );
  }

  dr.unclip();
  dr.drawUpdate({ x: px, y: py, w: ts, h: ts });
}

// --- redraw -----------------------------------------------------------------

/** The edges of every piece of line that breaks a rule: one that closes a
 * loop, or that joins two different numbers. */
function brokenEdges(state: PathState, edges: Uint8Array): Uint8Array {
  const { ends } = state;
  const g = geometry(state.w, state.h);
  // Each piece, walked from a square of it, by the squares it passes.
  const piece = new Int32Array(g.cells).fill(-1);
  const numbers: number[][] = [];
  const looped: boolean[] = [];
  for (let start = 0; start < g.cells; start++) {
    if (piece[start] >= 0) continue;
    const id = numbers.length;
    numbers.push([]);
    looped.push(false);
    const stack = [start];
    piece[start] = id;
    let squares = 0;
    let links = 0;
    while (stack.length > 0) {
      const i = stack.pop() as number;
      squares++;
      if (ends[i] !== NO_END) numbers[id].push(ends[i]);
      for (let k = 0; k < 4; k++) {
        const e = g.around[i * 4 + k];
        if (e < 0 || edges[e] !== LINE) continue;
        links++;
        const j = g.a[e] === i ? g.b[e] : g.a[e];
        if (piece[j] < 0) {
          piece[j] = id;
          stack.push(j);
        }
      }
    }
    // Every link was counted from both its squares.
    looped[id] = links / 2 >= squares;
  }
  const out = new Uint8Array(g.edgeCount);
  for (let e = 0; e < g.edgeCount; e++) {
    if (edges[e] !== LINE) continue;
    const id = piece[g.a[e]];
    const nums = numbers[id];
    if (looped[id] || nums.some((v) => v !== nums[0])) out[e] = 1;
  }
  return out;
}

export function redraw(
  dr: GameDrawing,
  ds: PathDrawState,
  _prev: PathState | null,
  state: PathState,
  _dir: number,
  ui: PathUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<PathMove, PathHighlights>,
  mistakes?: readonly PathMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h, ends } = state;
  const g = geometry(w, h);
  const b = border(ts);

  if (!ds.started) {
    dr.drawRect({ x: b, y: b, w: w * ts + 1, h: h * ts + 1 }, COL_GRID);
    ds.started = true;
  }

  // What the board shows: the state, with the drag as it would be released.
  const drag =
    ui.drag && ui.drag.cells.length > 1 ? dragChanges(state, ui.drag.cells) : [];
  const edges = withChanges(state, drag);
  const dragged = new Map(drag.map((c) => [c.edge, c.mark]));
  const broken = brokenEdges(state, edges);
  const wrong = new Set(mistakes?.map((m) => m.edge));
  const done = doneNumbers(state, edges);

  // The displayed step's marks, read from its words and from nowhere else:
  // the kinds read here are the kinds a sentence may name.
  const named = stepMarks(hint);
  // A step rings edges and never a square, so the marks on squares are all
  // outlines, round the area they cover together.
  const evidence = new Set(named.of("outline", CELL).map((c) => c.y * w + c.x));
  const inEvidence = (x: number, y: number): boolean =>
    x >= 0 && x < w && y >= 0 && y < h && evidence.has(y * w + x);
  const asked = new Map<number, number>();
  if (hint && hint.move.kind === "edges")
    for (const e of named.of("ring", EDGE))
      asked.set(
        e,
        hint.move.changes.find((c) => c.edge === e)?.mark === CROSS ? H_CROSS : H_LINE,
      );
  const chain = new Map<number, { mark: number; order: number }>();
  for (const link of hint?.highlights?.chain ?? [])
    if (named.of("outline", EDGE).includes(link.edge))
      chain.set(link.edge, {
        mark: link.mark === CROSS ? H_CHAIN_CROSS : H_CHAIN_LINE,
        order: link.order,
      });

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const square =
        ends[i] |
        (ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y ? F_CURSOR : 0) |
        (flash.win(sweepStep(x, y)) << K_TONE) |
        (ends[i] !== NO_END && done.has(ends[i]) ? F_DONE : 0) |
        (inEvidence(x, y) ? outlineSides(x, y, inEvidence) << K_OUTLINE : 0);
      let sides = 0;
      let hints = 0;
      for (let k = 0; k < 4; k++) {
        const e = g.around[i * 4 + k];
        if (e < 0) continue;
        const was = dragged.get(e);
        const side =
          edges[e] |
          (broken[e] ? S_ERROR : 0) |
          (wrong.has(e) && was === undefined ? S_WRONG : 0) |
          (was === LINE ? S_DRAG_ADD : 0) |
          (was !== undefined && was !== LINE && state.edges[e] === LINE
            ? S_DRAG_REMOVE
            : 0);
        sides |= side << (k * SIDE_BITS);
        const link = chain.get(e);
        const mark = asked.get(e) ?? link?.mark ?? 0;
        const order = link?.order ?? 0;
        hints |= (mark | (order << K_ORDER)) << (k * HINT_SIDE_BITS);
      }
      const at = i * WORDS;
      if (
        ds.cache[at] === square &&
        ds.cache[at + 1] === sides &&
        ds.cache[at + 2] === hints
      )
        continue;
      drawTile(dr, ds, x, y, square, sides, hints);
      ds.cache[at] = square;
      ds.cache[at + 1] = sides;
      ds.cache[at + 2] = hints;
    }
  }
}

/** The numbers whose two squares a line joins, with nothing broken on it. */
function doneNumbers(state: PathState, edges: Uint8Array): Set<number> {
  const { ends } = state;
  const g = geometry(state.w, state.h);
  const out = new Set<number>();
  for (let start = 0; start < g.cells; start++) {
    if (ends[start] === NO_END) continue;
    // Walk the line from one end; it must reach the like number.
    let prev = -1;
    let at = start;
    for (;;) {
      let next = -1;
      for (let k = 0; k < 4; k++) {
        const e = g.around[at * 4 + k];
        if (e < 0 || edges[e] !== LINE) continue;
        const j = g.a[e] === at ? g.b[e] : g.a[e];
        if (j !== prev) next = j;
      }
      if (next < 0 || next === start) break;
      prev = at;
      at = next;
      if (ends[at] !== NO_END) {
        if (ends[at] === ends[start]) out.add(ends[at]);
        break;
      }
    }
  }
  return out;
}
