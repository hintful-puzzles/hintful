/**
 * Wordtrail's rendering: the letters on the grid with the player's lines
 * between them, and below the grid the list of the words' lengths, a box a
 * letter, filled as the player draws each word.
 *
 * The grid is a loop over the squares that repaints only the ones whose
 * packed key changed (docs/rendering.md § "The tile cache and the diff
 * key"). A square draws its own half of each of its four sides: the line
 * from its middle to the side and its half of a cross on the side. Its
 * letter sits on a disc over the lines, so a word reads as letters strung
 * on a line. The list has no tiles, and repaints whole when what it shows
 * changes (§ "A cue with no tile to live in").
 */

import {
  CURSOR,
  cellSurface,
  DRAG_ADD,
  DRAG_REMOVE,
  ERROR,
  FLASH,
  FLASH_LEAD,
  HINT_OUTLINE,
  INK,
  REGION_DONE,
  RULED_OUT,
  surfaceGrid,
  wallFill,
} from "../../engine/color/palette.ts";
import { drawRectCorners, glyphFont } from "../../engine/draw.ts";
import { Dsf } from "../../engine/dsf.ts";
import { drawEdgeHints, edgeHintWords, stepEdgeHints } from "../../engine/edge-hint.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { drawMarkSides, outlineSides } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import {
  CROSS,
  dragPreview,
  type EdgeMistake,
  LINE,
} from "../../engine/line-drawing.ts";
import { drawPathHead, drawPathStart } from "../../engine/path-arrow.ts";
import { NOTHING_TO_CLEAR } from "../../engine/ring.ts";
import {
  DX,
  DY,
  type EdgeLayout,
  edgeBetween,
  reverse,
  type SquareEdges,
  squareCenter,
  squareEdges,
} from "../../engine/square-edges.ts";
import type { Color, Point, Rect, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
import type { WordtrailHighlights } from "./hint.ts";
import { withChanges, wordtrailLines } from "./moves.ts";
import {
  LINE_BACK,
  type WordtrailMove,
  type WordtrailParams,
  type WordtrailState,
  type WordtrailUi,
} from "./state.ts";
import { letterChar } from "./trails.ts";

export const PREFERRED_TILE_SIZE = 48;

// --- palette ----------------------------------------------------------------

const COL_BACKGROUND = 0;
const COL_GRID = 1;
const COL_CELL = 2;
const COL_LINE = 3;
const COL_RULED_OUT = 4;
/** A dark square, which holds no letter. */
export const COL_DARK = 5;
/** A line that breaks a rule already: it closes a loop, or makes a trail
 * longer than any listed word. */
export const COL_ERROR = 6;
const COL_DRAG_ADD = 7;
const COL_DRAG_REMOVE = 8;
const COL_CURSOR = 9;
/** The letter a hint step reasons from, and the letters of the words it
 * finds. The edges it decides are ringed by the engine (`drawEdgeHints`). */
export const COL_HINT_EVIDENCE = 10;
const COL_FLASH = 11;
const COL_FLASH_LEAD = 12;
/** A trail of the player's that spells a word: settled, as a closed region
 * is. */
const COL_WORD = 13;
const COL_TEXT = 14;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_LINE] = INK;
  out[COL_RULED_OUT] = RULED_OUT;
  out[COL_DARK] = wallFill(defaultBackground);
  out[COL_ERROR] = ERROR;
  out[COL_DRAG_ADD] = DRAG_ADD;
  out[COL_DRAG_REMOVE] = DRAG_REMOVE;
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT_EVIDENCE] = HINT_OUTLINE;
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  out[COL_WORD] = REGION_DONE;
  out[COL_TEXT] = INK;
  return out;
}

// --- geometry ---------------------------------------------------------------

const border = (ts: number): number => Math.floor(ts / 4);

/** The height of the list of lengths below the grid. */
const listHeight = (ts: number): number => Math.floor(ts * 1.4);

export function computeSize(p: WordtrailParams, ts: number): Size {
  return {
    w: p.w * ts + 2 * border(ts) + 1,
    h: p.h * ts + 2 * border(ts) + 1 + listHeight(ts),
  };
}

/** The board's pixel layout, as `engine/square-edges.ts` aims at an edge in
 * it. */
export const layout = (ts: number): EdgeLayout => ({ tile: ts, border: border(ts) });

/** The middle of square `i`. */
export function centerOf(state: WordtrailState, ts: number, i: number): Point {
  return squareCenter(squareEdges(state.w, state.h), layout(ts), i);
}

// --- the words on the board ---------------------------------------------------

/** What the lines on the board make: each square's piece, the squares the
 * lines join it to, and the pieces that spell a word, by their squares in
 * reading order. */
interface Pieces {
  /** Each square's piece's root. */
  root: Int32Array;
  /** The roots of the pieces whose lines break a rule. */
  broken: Set<number>;
  /** The pieces that spell a word, by root, with the word. */
  words: Map<number, string>;
}

/** Whether `code` is a line, either way. */
const isLine = (code: number): boolean => code === LINE || code === LINE_BACK;

/** The square the line `code` on edge `e` runs from. */
const fromOf = (g: SquareEdges, e: number, code: number): number =>
  code === LINE_BACK ? g.b[e] : g.a[e];

/**
 * The pieces `edges` make. A piece spells a word where it is a trail of the
 * board, one of those that spell a word, its lines running the way the
 * trail reads; it is broken where its lines close a loop or it is longer
 * than every listed word.
 */
function piecesOf(state: WordtrailState, edges: Uint8Array): Pieces {
  const { w, h, letters, lengths, trails } = state;
  const g = squareEdges(w, h);
  const dsf = new Dsf(g.cells);
  for (let e = 0; e < g.edgeCount; e++) if (isLine(edges[e])) dsf.merge(g.a[e], g.b[e]);
  const root = new Int32Array(g.cells);
  const lines = new Int32Array(g.cells);
  for (let i = 0; i < g.cells; i++) root[i] = dsf.canonify(i);
  for (let e = 0; e < g.edgeCount; e++) if (isLine(edges[e])) lines[root[g.a[e]]]++;
  const longest = Math.max(...lengths);
  const broken = new Set<number>();
  for (let i = 0; i < g.cells; i++) {
    const r = root[i];
    if (r !== i) continue;
    if (lines[r] >= dsf.size(r) || dsf.size(r) > longest) broken.add(r);
  }
  const words = new Map<number, string>();
  for (const trail of trails) {
    const r = root[trail[0]];
    if (dsf.size(r) !== trail.length || lines[r] !== trail.length - 1) continue;
    // A trail is a piece where its squares are one piece of its length whose
    // lines are the trail's own, each running the way the trail reads.
    let own = true;
    for (let k = 0; own && k + 1 < trail.length; k++) {
      const a = trail[k];
      const b = trail[k + 1];
      if (root[a] !== r || root[b] !== r) own = false;
      else {
        const e = edgeBetween(g, a, b);
        own = isLine(edges[e]) && fromOf(g, e, edges[e]) === a;
      }
    }
    if (own) words.set(r, Array.from(trail, (i) => letterChar(letters[i])).join(""));
  }
  return { root, broken, words };
}

// --- draw state -------------------------------------------------------------

// Word 0, the square: the cursor, whether it is dark, whether its piece
// spells a word, whether the hint stripes it, the win flash's tone, the
// sides of the hint's outline it draws (`hint-mark.ts`'s side bits), and
// whether a word starts here.
const F_CURSOR = 1 << 0;
const F_DARK = 1 << 1;
const F_WORD = 1 << 2;
const F_STRIPES = 1 << 3;
const K_TONE = 4;
const K_OUTLINE = 6;
const F_START = 1 << 10;

// Word 1, the sides: eight bits a side, by direction.
const SIDE_BITS = 8;
// The side's mark in bits 0-1 (`LINE` for a line either way), then whether
// it is the board's rim, whether its line breaks a rule, whether Check &
// Save found it wrong, what the drag would do to it, and whether its line
// runs out of the square.
const S_RIM = 1 << 2;
const S_ERROR = 1 << 3;
const S_WRONG = 1 << 4;
const S_DRAG_ADD = 1 << 5;
const S_DRAG_REMOVE = 1 << 6;
const S_OUT = 1 << 7;

// Word 2, the hint on the sides: `edge-hint.ts`'s word. Word 3, the sides
// whose asked line runs out of the square, a bit a side.
const WORDS = 4;

export interface WordtrailDrawState {
  started: boolean;
  tileSize: number;
  /** What each square shows on the canvas, three words a square; -1 before
   * the first frame. */
  cache: Int32Array;
  /** What the list of lengths shows: each slot's word, or "" where none is
   * drawn yet. `null` before the first frame. */
  list: string | null;
}

export function newDrawState(
  state: WordtrailState,
  tileSize: number,
): WordtrailDrawState {
  return {
    started: false,
    tileSize,
    cache: new Int32Array(state.w * state.h * WORDS).fill(-1),
    list: null,
  };
}

// --- one square -------------------------------------------------------------

function drawTile(
  dr: GameDrawing,
  ds: WordtrailDrawState,
  state: WordtrailState,
  x: number,
  y: number,
  square: number,
  sides: number,
  hints: number,
  hintOut: number,
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
  const side = (k: number): number => (sides >>> (k * SIDE_BITS)) & 0xff;
  // The arrowhead of the line across side `k`, pointing out of the square
  // or into it. It sits across the side, so the square beside draws the
  // rest of it.
  const head = (k: number, out: boolean, color: number): void => {
    const there = { x: cx + DX[k] * ts, y: cy + DY[k] * ts };
    const here = { x: cx, y: cy };
    if (out) drawPathHead(dr, ts, here, there, color);
    else drawPathHead(dr, ts, there, here, color);
  };
  const body: Rect = { x: px + 1, y: py + 1, w: ts - 1, h: ts - 1 };

  // The square's own box: its top and left grid lines and its surface.
  dr.clip({ x: px, y: py, w: ts, h: ts });
  dr.drawRect({ x: px, y: py, w: ts, h: ts }, COL_GRID);
  if (square & F_DARK) {
    dr.drawRect(body, COL_DARK);
    dr.unclip();
    dr.drawUpdate({ x: px, y: py, w: ts, h: ts });
    return;
  }
  dr.drawRect(
    body,
    tone
      ? winSlot(tone, COL_FLASH, COL_FLASH_LEAD)
      : square & F_WORD
        ? COL_WORD
        : COL_CELL,
  );
  if (square & F_STRIPES) dr.drawHatch(body, hatchPeriod(ts));

  // The hint's outline, inside the square and under the lines and crosses
  // on its sides.
  drawMarkSides(
    dr,
    { box: body, outer: 0, inner: Math.max(2, ts >> 4) },
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

  // The lines, each from the middle to its side. Two that run straight
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

  // The step's edges, under the player's own: each asked one at the weight
  // of a laid line.
  const small = Math.max(2, Math.floor(ts / 8));
  const hintCross = Math.max(2, ts >> 4);
  drawEdgeHints(dr, hints, COL_HINT_EVIDENCE, {
    cross: (sides, ink) => {
      for (let k = 0; k < 4; k++) if (sides & (1 << k)) cross(k, ink, small, hintCross);
    },
    line: (sides, ink) => {
      const strokes: Stroke[] = [];
      for (let k = 0; k < 4; k++)
        if (sides & (1 << k)) strokes.push({ k, color: ink, weight: thick });
      for (const { from, to } of segmentsOf(strokes)) dr.drawLine(from, to, ink, thick);
      for (let k = 0; k < 4; k++)
        if (sides & (1 << k)) head(k, (hintOut & (1 << k)) !== 0, ink);
    },
    // A ring sits between the two letters, clear of both.
    ring: (d, shape) => {
      const m = sideEnd(d);
      const long = Math.floor(ts * (shape === "line" ? 0.5 : 0.6));
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
  for (const { k, color } of strokes)
    if ((side(k) & 3) === LINE) head(k, (side(k) & S_OUT) !== 0, color);

  // The letter, on a disc of the square's own surface over the lines, so
  // it reads whatever runs under it; a word's first letter ringed in the
  // ink of the line out of it.
  const letter = state.letters[y * state.w + x];
  const disc = Math.floor(ts * 0.3);
  const surface = tone
    ? winSlot(tone, COL_FLASH, COL_FLASH_LEAD)
    : square & F_WORD
      ? COL_WORD
      : COL_CELL;
  const out = strokes.find(({ k }) => side(k) & S_OUT);
  if (square & F_START && out)
    drawPathStart(dr, ts, { x: cx, y: cy }, disc, out.color, surface);
  else dr.drawCircle({ x: cx, y: cy }, disc, surface, surface);
  dr.drawText(
    { x: cx, y: cy },
    glyphFont(Math.floor(ts * 0.42)),
    COL_TEXT,
    letterChar(letter).toUpperCase(),
  );

  if (square & F_CURSOR)
    drawRectCorners(dr, cx, cy, half - 3, COL_CURSOR, Math.max(2, ts >> 4));

  dr.unclip();
  dr.drawUpdate({ x: px, y: py, w: ts, h: ts });
}

// --- the list of lengths ------------------------------------------------------

/** One slot of the list: a word's length, and its boxes' top left corner. */
interface Slot {
  length: number;
  at: Point;
}

/** Where the list's slots go: a box a letter, the slots in rows as few as
 * fit across the grid, the boxes as large as that allows. */
function listLayout(state: WordtrailState, ts: number): { box: number; slots: Slot[] } {
  const b = border(ts);
  const width = state.w * ts;
  const top = state.h * ts + 2 * b + 1;
  const height = listHeight(ts) - b;
  const most = Math.floor(ts * 0.5);
  for (let rows = 1; ; rows++) {
    const box = Math.min(most, Math.floor(height / (rows + (rows - 1) * 0.3)));
    const gap = Math.max(2, Math.floor(box * 0.5));
    // Lay the slots out a row at a time, each row's slots as long as fit.
    const laid: number[][] = [[]];
    let used = 0;
    for (const length of state.lengths) {
      const need = length * box + (used > 0 ? gap : 0);
      if (used + need > width && used > 0) {
        laid.push([]);
        used = 0;
      }
      laid[laid.length - 1].push(length);
      used += length * box + (used > 0 ? gap : 0);
    }
    if (laid.length <= rows || box <= 4) {
      const slots: Slot[] = [];
      const rowGap = Math.floor(box * 0.3);
      laid.forEach((row, r) => {
        const rowWidth = row.reduce((s, n) => s + n * box, 0) + (row.length - 1) * gap;
        let x = b + Math.floor((width - rowWidth) / 2);
        const y = top + r * (box + rowGap);
        for (const length of row) {
          slots.push({ length, at: { x, y } });
          x += length * box + gap;
        }
      });
      return { box, slots };
    }
  }
}

/** Each listed word's slot's word: the words spelled on the board, by
 * length, the first in reading order first; "" where none fills it. */
function listedWords(state: WordtrailState, pieces: Pieces): string[] {
  const byLength = new Map<number, string[]>();
  for (const [, word] of [...pieces.words].sort(([a], [b]) => a - b)) {
    const list = byLength.get(word.length) ?? [];
    list.push(word);
    byLength.set(word.length, list);
  }
  return state.lengths.map((n) => byLength.get(n)?.shift() ?? "");
}

function drawList(
  dr: GameDrawing,
  ds: WordtrailDrawState,
  state: WordtrailState,
  words: readonly string[],
): void {
  const ts = ds.tileSize;
  const b = border(ts);
  const area: Rect = {
    x: 0,
    y: state.h * ts + 2 * b + 1,
    w: state.w * ts + 2 * b + 1,
    h: listHeight(ts),
  };
  dr.drawRect(area, COL_BACKGROUND);
  const { box, slots } = listLayout(state, ts);
  slots.forEach(({ length, at }, s) => {
    const word = words[s];
    for (let k = 0; k < length; k++) {
      const r: Rect = { x: at.x + k * box, y: at.y, w: box, h: box };
      dr.drawRect(r, COL_GRID);
      dr.drawRect(
        { x: r.x + 1, y: r.y + 1, w: box - 2, h: box - 2 },
        word === "" ? COL_CELL : COL_WORD,
      );
      if (word !== "")
        dr.drawText(
          { x: r.x + box / 2, y: r.y + box / 2 },
          glyphFont(Math.floor(box * 0.6)),
          COL_TEXT,
          word[k].toUpperCase(),
        );
    }
  });
  dr.drawUpdate(area);
}

// --- redraw -----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: WordtrailDrawState,
  _prev: WordtrailState | null,
  state: WordtrailState,
  _dir: number,
  ui: WordtrailUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<WordtrailMove, WordtrailHighlights>,
  mistakes?: readonly EdgeMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h, letters } = state;
  const g = squareEdges(w, h);

  if (!ds.started) {
    // The grid's frame: each square draws its top and left lines, and this
    // the bottom and right ones, in the border where no square repaints.
    const b = border(ts);
    dr.drawRect({ x: b, y: b, w: w * ts + 1, h: h * ts + 1 }, COL_GRID);
    ds.started = true;
  }

  // What the board shows: the state, with the drag as it would be released.
  const drag = dragPreview(wordtrailLines, state, ui.drag);
  const edges = withChanges(state, drag);
  const dragged = new Map(drag.map((c) => [c.edge, c.mark]));
  const pieces = piecesOf(state, edges);
  const wrong = new Set(mistakes?.map((m) => m.edge));

  // The displayed step's marks, read from its words and from nowhere else:
  // the kinds read here are the kinds a sentence may name.
  const named = stepMarks(hint);
  const evidence = new Set(named.of("outline", CELL).map((c) => c.y * w + c.x));
  const striped = new Set(named.of("stripes", CELL).map((c) => c.y * w + c.x));
  const inEvidence = (x: number, y: number): boolean =>
    x >= 0 && x < w && y >= 0 && y < h && evidence.has(y * w + x);
  const asked = hint?.move.kind === "edges" ? hint.move.changes : [];
  const hintWords = edgeHintWords(g, stepEdgeHints(named, asked));
  // The square each asked line runs from, by its edge.
  const askedFrom = new Map(
    asked.flatMap((c) =>
      c.mark === LINE && c.from !== undefined ? [[c.edge, c.from]] : [],
    ),
  );

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const square =
        (ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y ? F_CURSOR : 0) |
        (letters[i] === 0 ? F_DARK : 0) |
        (pieces.words.has(pieces.root[i]) ? F_WORD : 0) |
        (striped.has(i) ? F_STRIPES : 0) |
        // The win flash sweeps the letters; a dark square never lights.
        (letters[i] === 0 ? 0 : flash.win(sweepStep(x, y)) << K_TONE) |
        (inEvidence(x, y) ? outlineSides(x, y, inEvidence) << K_OUTLINE : 0);
      let sides = 0;
      let hintOut = 0;
      let ins = 0;
      let outs = 0;
      const hints = hintWords[i];
      for (let k = 0; k < 4; k++) {
        const e = g.around[i * 4 + k];
        if (e < 0) {
          sides |= S_RIM << (k * SIDE_BITS);
          continue;
        }
        if (askedFrom.get(e) === i) hintOut |= 1 << k;
        const was = dragged.get(e);
        const line = isLine(edges[e]);
        const out = line && fromOf(g, e, edges[e]) === i;
        if (out) outs++;
        else if (line) ins++;
        const s =
          (line ? LINE : edges[e]) |
          (out ? S_OUT : 0) |
          (line && pieces.broken.has(pieces.root[i]) ? S_ERROR : 0) |
          (wrong.has(e) && was === undefined ? S_WRONG : 0) |
          (was === LINE ? S_DRAG_ADD : 0) |
          (was !== undefined && was !== LINE && isLine(state.edges[e])
            ? S_DRAG_REMOVE
            : 0);
        sides |= s << (k * SIDE_BITS);
      }
      const keyed = square | (outs > 0 && ins === 0 ? F_START : 0);
      const at = i * WORDS;
      if (
        ds.cache[at] === keyed &&
        ds.cache[at + 1] === sides &&
        ds.cache[at + 2] === hints &&
        ds.cache[at + 3] === hintOut
      )
        continue;
      drawTile(dr, ds, state, x, y, keyed, sides, hints, hintOut);
      ds.cache[at] = keyed;
      ds.cache[at + 1] = sides;
      ds.cache[at + 2] = hints;
      ds.cache[at + 3] = hintOut;
    }
  }

  const listed = listedWords(state, pieces);
  const key = listed.join(",");
  if (ds.list !== key) {
    drawList(dr, ds, state, listed);
    ds.list = key;
  }
}
