/**
 * Skeleton's rendering: a loop over the squares that repaints only the ones
 * whose packed key changed (docs/rendering.md § "The tile cache and the diff
 * key").
 *
 * A square draws its own half of each of its four sides: the line from its
 * middle to the side, its half of a cross on the side, and its half of a wall
 * along it. A line between two squares is the two halves, and a cross or a
 * wall is whole once both squares have drawn. So a square's key holds what is
 * on each of its sides, in a word of its own beside the word for the square.
 */

import {
  CURSOR,
  cellSurface,
  DRAG_ADD,
  DRAG_REMOVE,
  ERROR,
  FLASH,
  FLASH_LEAD,
  GRID_DARK,
  HINT_OUTLINE,
  INK,
  RULED_OUT,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawRectCorners } from "../../engine/draw.ts";
import { drawEdgeHints, edgeHintWords, stepEdgeHints } from "../../engine/edge-hint.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { drawMarkSides, outlineSides } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import {
  CROSS,
  dragPreview,
  type EdgeMistake,
  LINE,
} from "../../engine/line-drawing.ts";
import { NOTHING_TO_CLEAR } from "../../engine/ring.ts";
import {
  DOWN,
  DX,
  DY,
  type EdgeLayout,
  LEFT,
  RIGHT,
  reverse,
  squareCenter,
  squareEdges,
  UP,
} from "../../engine/square-edges.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
import type { SkeletonHighlights } from "./hint.ts";
import { skeletonLines, withChanges } from "./moves.ts";
import { SkeletonBoard } from "./solver.ts";
import type {
  SkeletonMove,
  SkeletonParams,
  SkeletonState,
  SkeletonUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 40;

// --- palette ----------------------------------------------------------------

const COL_BACKGROUND = 0;
const COL_GRID = 1;
const COL_CELL = 2;
const COL_LINE = 3;
const COL_RULED_OUT = 4;
export const COL_WALL = 5;
/** A line that breaks a rule already: it closes a loop short of every
 * square. */
export const COL_ERROR = 6;
const COL_DRAG_ADD = 7;
const COL_DRAG_REMOVE = 8;
const COL_CURSOR = 9;
/** The squares a hint step reasons from, and the edges it tries lines on.
 * The edges it decides are ringed by the engine (`drawEdgeHints`). */
export const COL_HINT_EVIDENCE = 10;
const COL_FLASH = 11;
const COL_FLASH_LEAD = 12;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_LINE] = INK;
  out[COL_RULED_OUT] = RULED_OUT;
  out[COL_WALL] = GRID_DARK;
  out[COL_ERROR] = ERROR;
  out[COL_DRAG_ADD] = DRAG_ADD;
  out[COL_DRAG_REMOVE] = DRAG_REMOVE;
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT_EVIDENCE] = HINT_OUTLINE;
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  return out;
}

// --- geometry ---------------------------------------------------------------

const border = (ts: number): number => Math.floor(ts / 4);

export function computeSize(p: SkeletonParams, ts: number): Size {
  return { w: p.w * ts + 2 * border(ts) + 1, h: p.h * ts + 2 * border(ts) + 1 };
}

/** The board's pixel layout, as `engine/square-edges.ts` aims at an edge in
 * it. */
export const layout = (ts: number): EdgeLayout => ({ tile: ts, border: border(ts) });

/** The middle of square `i`. */
export function centerOf(state: SkeletonState, ts: number, i: number): Point {
  return squareCenter(squareEdges(state.w, state.h), layout(ts), i);
}

/** How far a wall reaches into each square beside it. */
const wallHalf = (ts: number): number => Math.max(2, ts >> 4);

// --- draw state -------------------------------------------------------------

// Word 0, the square: the cursor, the win flash's tone, and the sides of the
// hint's outline it draws (`hint-mark.ts`'s side bits).
const F_CURSOR = 1 << 0;
const K_TONE = 1;
const K_OUTLINE = 3;

// Word 1, the sides: seven bits a side, by direction.
const SIDE_BITS = 7;
// The side's mark in bits 0-1, then whether it is a wall or the board's rim,
// whether its line breaks a rule, whether Check & Save found it wrong, and
// what the drag would do to it.
const S_WALL = 1 << 2;
const S_ERROR = 1 << 3;
const S_WRONG = 1 << 4;
const S_DRAG_ADD = 1 << 5;
const S_DRAG_REMOVE = 1 << 6;

// Word 2, the hint on the sides: `edge-hint.ts`'s word.
const WORDS = 3;

export interface SkeletonDrawState {
  started: boolean;
  tileSize: number;
  /** What each square shows on the canvas, three words a square; -1 before
   * the first frame. */
  cache: Int32Array;
}

export function newDrawState(
  state: SkeletonState,
  tileSize: number,
): SkeletonDrawState {
  return {
    started: false,
    tileSize,
    cache: new Int32Array(state.w * state.h * WORDS).fill(-1),
  };
}

// --- one square -------------------------------------------------------------

function drawTile(
  dr: GameDrawing,
  ds: SkeletonDrawState,
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
  const side = (k: number): number =>
    (sides >> (k * SIDE_BITS)) & ((1 << SIDE_BITS) - 1);

  // The square's own box: its top and left grid lines and its surface. What
  // it draws of a side's cross or wall reaches the side and stops, and the
  // square beyond draws the rest.
  dr.clip({ x: px, y: py, w: ts, h: ts });
  dr.drawRect({ x: px, y: py, w: ts, h: ts }, COL_GRID);
  dr.drawRect(
    { x: px + 1, y: py + 1, w: ts - 1, h: ts - 1 },
    tone ? winSlot(tone, COL_FLASH, COL_FLASH_LEAD) : COL_CELL,
  );

  // The walls, as bands along the sides, under the hint's outline so that
  // the outline is seen whole.
  const reach = wallHalf(ts);
  const band: Record<number, { x: number; y: number; w: number; h: number }> = {
    [RIGHT]: { x: px + ts - reach, y: py, w: reach, h: ts },
    [UP]: { x: px, y: py, w: ts, h: reach + 1 },
    [LEFT]: { x: px, y: py, w: reach + 1, h: ts },
    [DOWN]: { x: px, y: py + ts - reach, w: ts, h: reach },
  };
  for (const k of [RIGHT, UP, LEFT, DOWN])
    if (side(k) & S_WALL) dr.drawRect(band[k], COL_WALL);

  // The hint's outline, inside the square and under the lines and crosses
  // on its sides.
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

  const sideEnd = (d: number): Point => ({
    x: cx + DX[d] * (half + (DX[d] > 0 ? 1 : 0)),
    y: cy + DY[d] * (half + (DY[d] > 0 ? 1 : 0)),
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

  // The lines, each from the middle to its side. A line's ends are round, so
  // two halves meeting in the middle make a round turn; two that run straight
  // through are one stroke, as two round ends overlapping there darken their
  // soft edges into a knob.
  type Stroke = { k: number; color: number; weight: number };
  const segmentsOf = (strokes: readonly Stroke[]) => {
    const [p, q] = strokes;
    return strokes.length === 2 &&
      q.k === reverse(p.k) &&
      p.color === q.color &&
      p.weight === q.weight
      ? [{ from: sideEnd(p.k), to: sideEnd(q.k), color: p.color, weight: p.weight }]
      : strokes.map(({ k, color, weight }) => ({
          from: { x: cx, y: cy },
          to: sideEnd(k),
          color,
          weight,
        }));
  };

  // The step's edges, under the player's own: the tried thin in the outline's
  // ink, the asked ones at the weight of a laid line.
  const small = Math.max(2, Math.floor(ts / 8));
  const hintCross = Math.max(2, ts >> 4);
  // An asked side is ringed by a pill across it, round the line from this
  // middle to the next or round the cross on the side; each of its two
  // squares draws its half in its own clip.
  drawEdgeHints(dr, hints, COL_HINT_EVIDENCE, {
    cross: (sides, ink) => {
      for (let k = 0; k < 4; k++) if (sides & (1 << k)) cross(k, ink, small, hintCross);
    },
    line: (sides, ink, role) => {
      const weight = role === "ring" ? thick : Math.max(2, thick >> 1);
      const strokes: Stroke[] = [];
      for (let k = 0; k < 4; k++)
        if (sides & (1 << k)) strokes.push({ k, color: ink, weight });
      for (const { from, to } of segmentsOf(strokes))
        dr.drawLine(from, to, ink, weight);
    },
    ring: (d, shape) => {
      const m = sideEnd(d);
      const long = shape === "line" ? ts : Math.floor(ts * 0.6);
      const short = Math.floor(ts * 0.6);
      const w2 = (DX[d] !== 0 ? long : short) / 2;
      const h2 = (DX[d] !== 0 ? short : long) / 2;
      return {
        box: { x: m.x - w2, y: m.y - h2, w: 2 * w2, h: 2 * h2 },
        clear: NOTHING_TO_CLEAR,
        thickness: Math.max(2, ts >> 4),
        room: { x: m.x - ts, y: m.y - ts, w: 2 * ts, h: 2 * ts },
      };
    },
  });

  // The player's crosses, under any line.
  for (let k = 0; k < 4; k++) {
    const s = side(k);
    if ((s & 3) === CROSS) cross(k, s & S_WRONG ? COL_ERROR : COL_RULED_OUT, small, 1);
  }

  const strokes: Stroke[] = [];
  for (let k = 0; k < 4; k++) {
    const s = side(k);
    let color = -1;
    if (s & S_DRAG_ADD) color = COL_DRAG_ADD;
    else if (s & S_DRAG_REMOVE) color = COL_DRAG_REMOVE;
    else if ((s & 3) === LINE)
      color = s & S_WRONG || s & S_ERROR ? COL_ERROR : COL_LINE;
    if (color >= 0) strokes.push({ k, color, weight: thick });
  }
  for (const { from, to, color, weight } of segmentsOf(strokes))
    dr.drawLine(from, to, color, weight);

  if (square & F_CURSOR)
    drawRectCorners(dr, cx, cy, half - 3, COL_CURSOR, Math.max(2, ts >> 4));

  dr.unclip();
  dr.drawUpdate({ x: px, y: py, w: ts, h: ts });
}

// --- redraw -----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: SkeletonDrawState,
  _prev: SkeletonState | null,
  state: SkeletonState,
  _dir: number,
  ui: SkeletonUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<SkeletonMove, SkeletonHighlights>,
  mistakes?: readonly EdgeMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h, walls } = state;
  const g = squareEdges(w, h);
  const b = border(ts);

  if (!ds.started) {
    // The rim is a wall all round, its outer half drawn here in the border
    // where no square repaints it.
    const reach = wallHalf(ts);
    dr.drawRect(
      {
        x: b - reach,
        y: b - reach,
        w: w * ts + 1 + 2 * reach,
        h: h * ts + 1 + 2 * reach,
      },
      COL_WALL,
    );
    ds.started = true;
  }

  // What the board shows: the state, with the drag as it would be released.
  const drag = dragPreview(skeletonLines, state, ui.drag);
  const edges = withChanges(state, drag);
  const dragged = new Map(drag.map((c) => [c.edge, c.mark]));
  const broken = brokenEdges(state, edges);
  const wrong = new Set(mistakes?.map((m) => m.edge));

  // The displayed step's marks, read from its words and from nowhere else:
  // the kinds read here are the kinds a sentence may name.
  const named = stepMarks(hint);
  // A step rings edges and never a square, so the marks on squares are all
  // outlines, round the area they cover together.
  const evidence = new Set(named.of("outline", CELL).map((c) => c.y * w + c.x));
  const inEvidence = (x: number, y: number): boolean =>
    x >= 0 && x < w && y >= 0 && y < h && evidence.has(y * w + x);
  const hintWords = edgeHintWords(
    g,
    stepEdgeHints(
      named,
      hint?.move.kind === "edges" ? hint.move.changes : [],
      hint?.highlights?.tried,
    ),
  );

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const square =
        (ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y ? F_CURSOR : 0) |
        (flash.win(sweepStep(x, y)) << K_TONE) |
        (inEvidence(x, y) ? outlineSides(x, y, inEvidence) << K_OUTLINE : 0);
      let sides = 0;
      const hints = hintWords[i];
      for (let k = 0; k < 4; k++) {
        const e = g.around[i * 4 + k];
        if (e < 0) {
          sides |= S_WALL << (k * SIDE_BITS);
          continue;
        }
        const was = dragged.get(e);
        const s =
          edges[e] |
          (walls[e] ? S_WALL : 0) |
          (broken[e] ? S_ERROR : 0) |
          (wrong.has(e) && was === undefined ? S_WRONG : 0) |
          (was === LINE ? S_DRAG_ADD : 0) |
          (was !== undefined && was !== LINE && state.edges[e] === LINE
            ? S_DRAG_REMOVE
            : 0);
        sides |= s << (k * SIDE_BITS);
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

/** 1 on each line of a loop closed short of every square, which no more
 * lines can mend. */
function brokenEdges(state: SkeletonState, edges: Uint8Array): Uint8Array {
  const board = new SkeletonBoard(state.w, state.h, state.walls, edges);
  const { dsf } = board.pieces();
  const { g } = board;
  // A piece is a loop where it has as many lines as squares.
  const lines = new Int32Array(g.cells);
  for (let e = 0; e < g.edgeCount; e++)
    if (edges[e] === LINE) lines[dsf.canonify(g.a[e])]++;
  const out = new Uint8Array(g.edgeCount);
  for (let e = 0; e < g.edgeCount; e++) {
    if (edges[e] !== LINE) continue;
    const root = dsf.canonify(g.a[e]);
    if (lines[root] >= dsf.size(root) && dsf.size(root) < g.cells) out[e] = 1;
  }
  return out;
}
