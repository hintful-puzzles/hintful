/**
 * Path's rendering: a loop over the squares that repaints only the ones whose
 * packed key changed (docs/rendering.md § "The tile cache and the diff key").
 *
 * A square draws its own half of each of its four sides: the line from its
 * middle to the side, and its half of a cross on the side. A line between two
 * squares is the two halves, and a cross is whole once both squares have
 * drawn. So a square's key holds what is on each of its sides, in a word of
 * its own beside the word for what the square holds. A wall is drawn the
 * same way, a square's half of a bar along the side.
 *
 * Pairs colors each pair; Path colors its one line by how far along it a
 * square sits, so the color runs from the 1 to the highest number.
 */

import { BLACK, FREE, FREE_RAMP, FREE_TEXT } from "../../engine/color/colors.ts";
import {
  CURSOR,
  cellSurface,
  DRAG_ADD,
  DRAG_REMOVE,
  ERROR,
  FLASH,
  FLASH_LEAD,
  givenSurface,
  HINT_OUTLINE,
  INK,
  RULED_OUT,
  surfaceGrid,
  wallFill,
} from "../../engine/color/palette.ts";
import { drawRectCorners, glyphFont } from "../../engine/draw.ts";
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
import { textBox } from "../../engine/ring.ts";
import { type PieceBox, spreadColors } from "../../engine/spread-colors.ts";
import {
  across,
  DX,
  DY,
  type EdgeLayout,
  edgeBetween,
  pieceThrough,
  reverse,
  sideOf,
  squareCenter,
  squareEdges,
} from "../../engine/square-edges.ts";
import type { Color, DrawTextOptions, Point, Rect, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
import type { PathHighlights } from "./hint.ts";
import { pathLines, withChanges } from "./moves.ts";
import {
  MODE_PATH,
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
/** Inside the ring of a number whose path is not yet whole. */
const COL_GIVEN = 3;
/** A line reaching no number. */
const COL_LINE = 4;
const COL_RULED_OUT = 5;
const COL_TEXT = 6;
/** A line that breaks a rule already: it closes a loop, or joins two
 * different numbers. */
export const COL_ERROR = 7;
/** The edge drawn under a pair's line, ring and disc. */
const COL_EDGE = 8;
const COL_DRAG_ADD = 9;
const COL_DRAG_REMOVE = 10;
const COL_CURSOR = 11;
/** The squares a hint step reasons from, and the edges a supposition would
 * force. The edges it decides are ringed by the engine (`drawEdgeHints`). */
export const COL_HINT_EVIDENCE = 12;
const COL_FLASH = 13;
const COL_FLASH_LEAD = 14;
/** The first of a pair's colors, one slot each: a pair's discs and every line
 * reaching them. */
const COL_PAIR = 15;
/** How many of the free colors pairs take: all but the gray, whose line in
 * the dark scheme sits near the white of a line reaching no number. */
const PAIRS = 9;
/** The first of the numbers on a pair's filled disc, one slot a color. */
const COL_PAIR_TEXT = COL_PAIR + PAIRS;
/** A wall between two squares. */
export const COL_WALL = COL_PAIR_TEXT + PAIRS;

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
  // `BLACK`, not `INK`: the edge is what a pale pair's line reads against
  // in the light scheme, and on the dark board it vanishes.
  out[COL_EDGE] = BLACK;
  out[COL_DRAG_ADD] = DRAG_ADD;
  out[COL_DRAG_REMOVE] = DRAG_REMOVE;
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT_EVIDENCE] = HINT_OUTLINE;
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  for (let k = 0; k < PAIRS; k++) {
    out[COL_PAIR + k] = FREE[k];
    out[COL_PAIR_TEXT + k] = FREE_TEXT[k];
  }
  // Structure, not ink: an ink wall read as a line reaching no number (owner,
  // 2026-10-23).
  out[COL_WALL] = wallFill(defaultBackground);
  return out;
}

// --- geometry ---------------------------------------------------------------

export const border = (ts: number): number => Math.floor(ts / 4);

export function computeSize(p: PathParams, ts: number): Size {
  return { w: p.w * ts + 2 * border(ts) + 1, h: p.h * ts + 2 * border(ts) + 1 };
}

/** The board's pixel layout, as `engine/square-edges.ts` aims at an edge in
 * it. */
export const layout = (ts: number): EdgeLayout => ({ tile: ts, border: border(ts) });

/** The middle of square `i`. */
export function centerOf(state: PathState, ts: number, i: number): Point {
  return squareCenter(squareEdges(state.w, state.h), layout(ts), i);
}

// --- draw state -------------------------------------------------------------

// Word 0, the square: its number in bits 0-7, then the cursor, the win
// flash's tone, whether its path is whole, the sides of the hint's outline
// it draws (`hint-mark.ts`'s side bits), and the color of its lines, one
// more than their pair's slot past `COL_PAIR`, or 0 for ink. Every line on a
// square is of one piece, which joins them there. On a Path number, the side
// one more than its direction where the line arrives from the number before
// in another color, and that color as the piece's is.
const F_CURSOR = 1 << 8;
const K_TONE = 9;
const F_DONE = 1 << 11;
const K_OUTLINE = 12;
const K_PIECE = 16;
const K_ARRIVES = 20;
const K_ARRIVES_COLOR = 23;

// Word 1, the sides: seven bits a side, by direction.
const SIDE_BITS = 7;
// The side's mark in bits 0-1, then whether its line breaks a rule, whether
// Check & Save found it wrong, what the drag would do to it, and whether it
// is a wall.
const S_ERROR = 1 << 2;
const S_WRONG = 1 << 3;
const S_DRAG_ADD = 1 << 4;
const S_DRAG_REMOVE = 1 << 5;
const S_WALL = 1 << 6;

// Word 2, the hint on the sides: `edge-hint.ts`'s word.
const WORDS = 3;

export interface PathDrawState {
  started: boolean;
  tileSize: number;
  /** What each square shows on the canvas, three words a square; -1 before
   * the first frame. */
  cache: Int32Array;
  /** Each number's slot past `COL_PAIR`, by the number: its pair's in
   * Pairs, and in Path that of the line from it to the next. */
  numberColor: Int32Array;
}

export function newDrawState(state: PathState, tileSize: number): PathDrawState {
  const squares = state.w * state.h;
  return {
    started: false,
    tileSize,
    cache: new Int32Array(squares * WORDS).fill(-1),
    numberColor: state.mode === MODE_PATH ? rampColors(state) : pairColors(state),
  };
}

/** A color for each number along {@link FREE_RAMP}, the line from the 1 to
 * the 2 the first and the line into the highest number the last, spread
 * evenly so that each color covers a run of numbers the same length. The
 * highest number takes the color of the line into it. */
function rampColors({ ends }: PathState): Int32Array {
  const last = Math.max(...ends);
  const steps = Math.max(1, last - 1);
  const out = new Int32Array(last + 1);
  for (let n = 1; n <= last; n++) {
    const along = Math.min(n, last - 1) - 1;
    out[n] =
      FREE_RAMP[
        Math.min(FREE_RAMP.length - 1, Math.floor((along * FREE_RAMP.length) / steps))
      ];
  }
  return out;
}

/** A color for each number, its two squares' box spread over the set
 * (`spreadColors`), so that pairs given near each other differ. */
function pairColors({ w, ends }: PathState): Int32Array {
  const boxes: PieceBox[] = [];
  ends.forEach((n, i) => {
    if (n === NO_END) return;
    const [x, y] = [i % w, Math.floor(i / w)];
    const b = boxes[n - 1];
    if (b) {
      b.x0 = Math.min(b.x0, x);
      b.y0 = Math.min(b.y0, y);
      b.x1 = Math.max(b.x1, x);
      b.y1 = Math.max(b.y1, y);
    } else boxes[n - 1] = { x0: x, y0: y, x1: x, y1: y };
  });
  return Int32Array.of(0, ...spreadColors(boxes, PAIRS));
}

// --- one square -------------------------------------------------------------

/** Where the number on the square centered at `center` is drawn, which the
 * square's text and a hint's ring both read. */
function numberText(
  center: Point,
  number: number,
  ts: number,
): { origin: Point; options: DrawTextOptions } {
  return {
    origin: center,
    options: glyphFont(Math.floor(number > 9 ? ts / 3 : (ts * 2) / 5)),
  };
}

/** `numberAt(x, y)` is the number on square (`x`, `y`), or {@link NO_END}
 * where it has none or is off the board: a hint's ring across a side keeps
 * off the numbers either side of it. */
function drawTile(
  dr: GameDrawing,
  ds: PathDrawState,
  x: number,
  y: number,
  square: number,
  sides: number,
  hints: number,
  numberAt: (x: number, y: number) => number,
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

  // The step's edges, under the player's own: a chain's thin in the outline's
  // ink, the asked ones at the weight of a laid line. An asked side is ringed
  // by a pill across it, round the line from this middle to the next or round
  // the cross on the side, and clear of the numbers on its two squares; each
  // square draws its half in its own clip.
  const small = Math.max(2, Math.floor(ts / 8));
  const hintCross = Math.max(2, ts >> 4);
  const numberBox = (sx: number, sy: number): Rect[] => {
    const n = numberAt(sx, sy);
    if (n === NO_END) return [];
    const { origin, options } = numberText(
      { x: cx + (sx - x) * ts, y: cy + (sy - y) * ts },
      n,
      ts,
    );
    return [textBox(origin, options, String(n))];
  };
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
      // On the grid line the two squares share, so both draw one pill.
      const m = {
        x: DX[d] > 0 ? px + ts : DX[d] < 0 ? px : cx,
        y: DY[d] > 0 ? py + ts : DY[d] < 0 ? py : cy,
      };
      const long = shape === "line" ? ts : Math.floor(ts * 0.6);
      const short = Math.floor(ts * 0.6);
      const w2 = (DX[d] !== 0 ? long : short) / 2;
      const h2 = (DX[d] !== 0 ? short : long) / 2;
      return {
        box: { x: m.x - w2, y: m.y - h2, w: 2 * w2, h: 2 * h2 },
        clear: {
          enclose: [],
          avoid: [...numberBox(x, y), ...numberBox(x + DX[d], y + DY[d])],
        },
        thickness: Math.max(2, ts >> 4),
        room: { x: m.x - ts, y: m.y - ts, w: 2 * ts, h: 2 * ts },
      };
    },
  });

  // The walls, this square's half of a bar along each, and the player's
  // crosses, all under any line.
  const wall = Math.max(2, Math.floor(ts / 12));
  for (let k = 0; k < 4; k++) {
    const s = (sides >> (k * SIDE_BITS)) & ((1 << SIDE_BITS) - 1);
    if (s & S_WALL) {
      const upright = DX[k] !== 0;
      const far = DX[k] > 0 || DY[k] > 0;
      dr.drawRect(
        {
          x: upright && far ? px + ts - wall : px,
          y: !upright && far ? py + ts - wall : py,
          w: upright ? wall : ts,
          h: upright ? ts : wall,
        },
        COL_WALL,
      );
    } else if ((s & 3) === CROSS)
      cross(k, s & S_WRONG ? COL_ERROR : COL_RULED_OUT, small, 1);
  }

  const piece = (square >> K_PIECE) & 0xf;
  const lineColor = piece ? COL_PAIR + piece - 1 : COL_LINE;
  const arrives = ((square >> K_ARRIVES) & 7) - 1;
  const arrivingColor = COL_PAIR + ((square >> K_ARRIVES_COLOR) & 0xf) - 1;
  const colored = (color: number): boolean =>
    color >= COL_PAIR && color < COL_PAIR + PAIRS;
  const strokes: Stroke[] = [];
  for (let k = 0; k < 4; k++) {
    const s = (sides >> (k * SIDE_BITS)) & ((1 << SIDE_BITS) - 1);
    let color = -1;
    if (s & S_DRAG_ADD) color = COL_DRAG_ADD;
    else if (s & S_DRAG_REMOVE) color = COL_DRAG_REMOVE;
    else if ((s & 3) === LINE)
      color =
        s & S_WRONG || s & S_ERROR
          ? COL_ERROR
          : k === arrives
            ? arrivingColor
            : lineColor;
    if (color >= 0) strokes.push({ k, color, weight: thick });
  }
  const segments = segmentsOf(strokes);
  // A colored line is edged, every edge before any color so that one half's
  // edge never cuts across the other half at a turn.
  for (const { from, to, color, weight } of segments)
    if (colored(color)) dr.drawLine(from, to, COL_EDGE, weight + 2);
  for (const { from, to, color, weight } of segments)
    dr.drawLine(from, to, color, weight);

  const number = square & 0xff;
  if (number !== NO_END) {
    // A ring in the number's color while its path is open, and a disc
    // filled with it once the path is whole, edged as its lines are.
    const r = Math.floor((ts * 3) / 8);
    const pair = COL_PAIR + ds.numberColor[number];
    const done = (square & F_DONE) !== 0;
    const center = { x: cx, y: cy };
    dr.drawCircle(center, r + 1, COL_EDGE, COL_EDGE);
    dr.drawCircle(center, r, pair, pair);
    if (!done) {
      const ring = Math.max(2, Math.floor(ts / 12));
      dr.drawCircle(center, r - ring, COL_EDGE, COL_EDGE);
      dr.drawCircle(center, r - ring - 1, COL_GIVEN, COL_GIVEN);
    }
    const { origin, options } = numberText(center, number, ts);
    dr.drawText(
      origin,
      options,
      done ? COL_PAIR_TEXT + ds.numberColor[number] : COL_TEXT,
      String(number),
    );
  }

  if (square & F_CURSOR)
    drawRectCorners(dr, cx, cy, half - 3, COL_CURSOR, Math.max(2, ts >> 4));

  dr.unclip();
  dr.drawUpdate({ x: px, y: py, w: ts, h: ts });
}

// --- redraw -----------------------------------------------------------------

/** The pieces of line: `broken`, the edges of every piece that breaks a
 * rule, one that closes a loop or joins two different numbers; and `reach`,
 * the number each square's piece reaches, or {@link NO_END} where it reaches
 * none or is broken. */
function pieces(
  state: PathState,
  edges: Uint8Array,
): { broken: Uint8Array; reach: Uint8Array } {
  const { ends } = state;
  const g = squareEdges(state.w, state.h);
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
  const isBroken = (id: number): boolean =>
    looped[id] || numbers[id].some((v) => v !== numbers[id][0]);
  const broken = new Uint8Array(g.edgeCount);
  for (let e = 0; e < g.edgeCount; e++)
    if (edges[e] === LINE && isBroken(piece[g.a[e]])) broken[e] = 1;
  const reach = new Uint8Array(g.cells);
  for (let i = 0; i < g.cells; i++)
    if (!isBroken(piece[i])) reach[i] = numbers[piece[i]][0] ?? NO_END;
  return { broken, reach };
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
  mistakes?: readonly EdgeMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h, ends } = state;
  const g = squareEdges(w, h);
  const b = border(ts);

  if (!ds.started) {
    dr.drawRect({ x: b, y: b, w: w * ts + 1, h: h * ts + 1 }, COL_GRID);
    ds.started = true;
  }

  // What the board shows: the state, with the drag as it would be released.
  const drag = dragPreview(pathLines, state, ui.drag);
  const edges = withChanges(state, drag);
  const dragged = new Map(drag.map((c) => [c.edge, c.mark]));
  const { broken, reach, done, arrives, arrivesFrom }: LineLook =
    state.mode === MODE_PATH
      ? onePathPieces(state, edges)
      : {
          ...pieces(state, edges),
          done: doneNumbers(state, edges),
          ...noArrivals(g.cells),
        };
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
      hint?.highlights?.chain,
    ),
  );

  const numberAt = (x: number, y: number): number =>
    x >= 0 && x < w && y >= 0 && y < h ? ends[y * w + x] : NO_END;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const square =
        ends[i] |
        (ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y ? F_CURSOR : 0) |
        (flash.win(sweepStep(x, y)) << K_TONE) |
        (ends[i] !== NO_END && done.has(ends[i]) ? F_DONE : 0) |
        (inEvidence(x, y) ? outlineSides(x, y, inEvidence) << K_OUTLINE : 0) |
        (reach[i] !== NO_END ? (ds.numberColor[reach[i]] + 1) << K_PIECE : 0) |
        (arrives[i] >= 0
          ? ((arrives[i] + 1) << K_ARRIVES) |
            ((ds.numberColor[arrivesFrom[i]] + 1) << K_ARRIVES_COLOR)
          : 0);
      let sides = 0;
      const hints = hintWords[i];
      for (let k = 0; k < 4; k++) {
        const e = g.around[i * 4 + k];
        if (e < 0) continue;
        const was = dragged.get(e);
        const side =
          edges[e] |
          (state.walls[e] ? S_WALL : 0) |
          (broken[e] ? S_ERROR : 0) |
          (wrong.has(e) && was === undefined ? S_WRONG : 0) |
          (was === LINE ? S_DRAG_ADD : 0) |
          (was !== undefined && was !== LINE && state.edges[e] === LINE
            ? S_DRAG_REMOVE
            : 0);
        sides |= side << (k * SIDE_BITS);
      }
      const at = i * WORDS;
      if (
        ds.cache[at] === square &&
        ds.cache[at + 1] === sides &&
        ds.cache[at + 2] === hints
      )
        continue;
      drawTile(dr, ds, x, y, square, sides, hints, numberAt);
      ds.cache[at] = square;
      ds.cache[at + 1] = sides;
      ds.cache[at + 2] = hints;
    }
  }
}

/** What the lines show: the broken edges, each square's color by the number
 * it takes it from (`reach`, as {@link pieces} says), the numbers whose
 * discs fill, and on a square whose line changes color, the side it changes
 * on (`arrives`, -1 for none) and the number that side's color is from. */
interface LineLook {
  broken: Uint8Array;
  reach: Uint8Array;
  done: Set<number>;
  arrives: Int8Array;
  arrivesFrom: Uint8Array;
}

function noArrivals(cells: number): Pick<LineLook, "arrives" | "arrivesFrom"> {
  return { arrives: new Int8Array(cells).fill(-1), arrivesFrom: new Uint8Array(cells) };
}

/**
 * Path's pieces of line, as {@link pieces} gives Pairs', and `done`, the
 * numbers whose line reaches the number before them and the one after (or
 * only one of those, for the 1 and the highest). A piece is broken where it
 * closes a loop or passes two numbers one after the other that are not one
 * apart. Along an unbroken piece, a square's color is that of the line from
 * the number behind it, the one it passed last going up: on a number's own
 * square, that number, but for the half of its line that arrives from the
 * number before. Before a piece's first number it is the line into that
 * number, and on a piece with only one number, whose way up the piece does
 * not yet show, every square takes that number's.
 */
function onePathPieces(state: PathState, edges: Uint8Array): LineLook {
  const { ends } = state;
  const g = squareEdges(state.w, state.h);
  const last = Math.max(...ends);
  const linked = (i: number): number[] => {
    const out: number[] = [];
    for (let k = 0; k < 4; k++) {
      const e = g.around[i * 4 + k];
      if (e >= 0 && edges[e] === LINE) out.push(across(g, e, i));
    }
    return out;
  };
  const broken = new Uint8Array(g.edgeCount);
  const reach = new Uint8Array(g.cells);
  const done = new Set<number>();
  const { arrives, arrivesFrom } = noArrivals(g.cells);
  const seen = new Uint8Array(g.cells);
  for (let start = 0; start < g.cells; start++) {
    if (seen[start]) continue;
    const piece = pieceThrough(g, (e) => edges[e] === LINE, start);
    for (const i of piece) seen[i] = 1;
    // A piece with no square at its end is a loop; one with a square of
    // three lines, which no move makes, is broken too.
    const end = piece.find((i) => linked(i).length < 2);
    const walk: number[] = [];
    if (end !== undefined && piece.every((i) => linked(i).length <= 2))
      for (let at = end, prev = -1; walk.length < piece.length; ) {
        walk.push(at);
        const next = linked(at).find((j) => j !== prev);
        if (next === undefined) break;
        [prev, at] = [at, next];
      }
    const numbers = walk.map((i) => ends[i]).filter((v) => v !== NO_END);
    const ordered = numbers.every(
      (v, k) => k === 0 || Math.abs(v - numbers[k - 1]) === 1,
    );
    if (walk.length < piece.length || !ordered) {
      for (const i of piece)
        for (let k = 0; k < 4; k++) {
          const e = g.around[i * 4 + k];
          if (e >= 0 && edges[e] === LINE) broken[e] = 1;
        }
      continue;
    }
    if (numbers.length === 0) continue;
    if (numbers.length > 1 && numbers[0] > numbers[1]) {
      walk.reverse();
      numbers.reverse();
    }
    let behind = numbers.length > 1 ? Math.max(1, numbers[0] - 1) : numbers[0];
    walk.forEach((i, t) => {
      if (ends[i] !== NO_END) {
        // The half of its line that comes up from the number before is that
        // stretch's, which only shows once the piece has two numbers.
        if (t > 0 && numbers.length > 1) {
          const e = edgeBetween(g, i, walk[t - 1]);
          arrives[i] = sideOf(g, e, i);
          arrivesFrom[i] = behind;
        }
        behind = ends[i];
      }
      reach[i] = behind;
    });
    const has = new Set(numbers);
    for (const n of numbers)
      if ((n === 1 || has.has(n - 1)) && (n === last || has.has(n + 1))) done.add(n);
  }
  return { broken, reach, done, arrives, arrivesFrom };
}

/** The numbers whose two squares a line joins, with nothing broken on it. */
function doneNumbers(state: PathState, edges: Uint8Array): Set<number> {
  const { ends } = state;
  const g = squareEdges(state.w, state.h);
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
