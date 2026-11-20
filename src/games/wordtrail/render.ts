/**
 * Wordtrail's rendering: the letters on the grid with the player's lines
 * between them, and below the grid the list of the words' lengths, a box a
 * letter, filled as the player draws each word.
 *
 * The grid is a loop over the squares that repaints only the ones whose
 * packed key changed (docs/rendering.md § "The tile cache and the diff
 * key"). A square draws its own part of each of its four sides: of the
 * arrow across the side from its letter's disc to the next, and of a cross
 * on the side. The list has no tiles, and repaints whole when what it shows
 * changes (§ "A cue with no tile to live in").
 */

import { Dsf } from "../../engine/board/dsf.ts";
import {
  DX,
  DY,
  type EdgeLayout,
  edgeBetween,
  type SquareEdges,
  squareCenter,
  squareEdges,
} from "../../engine/board/square-edges.ts";
import { FREE, FREE_TEXT } from "../../engine/color/colors.ts";
import {
  cellSurface,
  DRAG_ADD,
  DRAG_REMOVE,
  GOAL,
  INK,
  RULED_OUT,
  surfaceGrid,
  wallFill,
} from "../../engine/color/palette.ts";
import {
  COL_BACKGROUND,
  COL_CURSOR,
  COL_ERROR,
  COL_HINT_OUTLINE,
  FIRST_GAME_SLOT,
  rolePalette,
} from "../../engine/color/roles.ts";
import type { GameDrawing, HintStep } from "../../engine/contract/game.ts";
import { CELL, stepMarks } from "../../engine/contract/hint-words.ts";
import type { Color, Point, Rect, Size } from "../../engine/contract/types.ts";
import { drawRectCorners, glyphFont } from "../../engine/draw.ts";
import { drawEdgeHints, edgeHintWords, stepEdgeHints } from "../../engine/edge-hint.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { drawMarkSides, outlineSides } from "../../engine/hint-mark.ts";
import {
  CROSS,
  dragPreview,
  type EdgeMistake,
  LINE,
} from "../../engine/line-drawing.ts";
import {
  drawPathArrow,
  drawPathStart,
  pathStrokeThickness,
} from "../../engine/path-arrow.ts";
import { NOTHING_TO_CLEAR } from "../../engine/ring.ts";
import { TileCache } from "../../engine/tile-cache.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
import type { WordtrailHighlights } from "./hint.ts";
import { withChanges, wordtrailLines } from "./moves.ts";
import { fittingTrails } from "./solver.ts";
import {
  LINE_BACK,
  type WordtrailMove,
  type WordtrailParams,
  type WordtrailState,
  type WordtrailUi,
} from "./state.ts";
import { letterChar, spell } from "./trails.ts";

export const PREFERRED_TILE_SIZE = 48;

// --- palette ----------------------------------------------------------------

// A line that breaks a rule already (it closes a loop, or makes a trail
// longer than any listed word) is `COL_ERROR`. The letter a hint step reasons
// from, and the letters of the words it finds, are `COL_HINT_OUTLINE`; the
// edges it decides are ringed by the engine (`drawEdgeHints`).
const COL_GRID = FIRST_GAME_SLOT;
const COL_CELL = FIRST_GAME_SLOT + 1;
const COL_LINE = FIRST_GAME_SLOT + 2;
const COL_RULED_OUT = FIRST_GAME_SLOT + 3;
/** A dark square, which holds no letter. */
export const COL_DARK = FIRST_GAME_SLOT + 4;
const COL_DRAG_ADD = FIRST_GAME_SLOT + 5;
const COL_DRAG_REMOVE = FIRST_GAME_SLOT + 6;
export const COL_TEXT = FIRST_GAME_SLOT + 7;
/** The first of the words' colors, which tell the words drawn apart, each
 * its own on the board and in the list (owner, 2026-11-19): the ten-color
 * set's first nine, as Path's pairs take them, since its gray reads as a
 * dark square. A board of more words than that takes them round again. */
const COL_HUE = FIRST_GAME_SLOT + 8;
export const HUES = 9;
/** The first of the letters on each word color's disc, a slot a color. */
export const COL_HUE_TEXT = COL_HUE + HUES;
/** The outline round the letters of the word the dictionary spotlights:
 * Dominosa's spotlight color, so a reference's spotlight reads alike. */
export const COL_SPOTLIGHT = COL_HUE_TEXT + HUES;

export function colors(defaultBackground: Color): Color[] {
  const out = rolePalette(defaultBackground);
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_LINE] = INK;
  out[COL_RULED_OUT] = RULED_OUT;
  out[COL_DARK] = wallFill(defaultBackground);
  out[COL_DRAG_ADD] = DRAG_ADD;
  out[COL_DRAG_REMOVE] = DRAG_REMOVE;
  out[COL_TEXT] = INK;
  for (let k = 0; k < HUES; k++) {
    out[COL_HUE + k] = FREE[k];
    out[COL_HUE_TEXT + k] = FREE_TEXT[k];
  }
  out[COL_SPOTLIGHT] = GOAL;
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

/** The board's pixel layout, as `engine/board/square-edges.ts` aims at an edge in
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

/** The squares of the trails spelling `word` that still fit. */
function spotlitSquares(state: WordtrailState, word: string): Set<number> {
  const out = new Set<number>();
  for (const k of fittingTrails(state))
    if (spell(state.letters, state.trails[k]) === word)
      for (const i of state.trails[k]) out.add(i);
  return out;
}

/** The words the drawn pieces spell, read the way their lines run. */
export const wordsDrawn = (state: WordtrailState): Set<string> =>
  new Set(piecesOf(state, state.edges).words.values());

// --- draw state -------------------------------------------------------------

// Word 0, the square: the cursor, whether it is dark, whether the hint
// stripes it, the win flash's tone, the sides of the hint's outline it draws
// (`hint-mark.ts`'s side bits), whether a word starts here, its word's
// color past `COL_HUE`, plus one, or 0 where its piece spells no word, and
// the sides of the dictionary's spotlight it draws.
const F_CURSOR = 1 << 0;
const F_DARK = 1 << 1;
const F_STRIPES = 1 << 3;
const K_TONE = 4;
const K_OUTLINE = 6;
const F_START = 1 << 10;
const K_HUE = 11;
const K_SPOT = 15;

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

export interface WordtrailDrawState {
  tileSize: number;
  /** What each square shows on the canvas, four words a square: the
   * square, its sides, the hint on the sides (`edge-hint.ts`'s word), and
   * the sides whose asked line runs out of the square, a bit a side. */
  tiles: TileCache;
  /** What the list of lengths shows: each slot's word, or "" where none is
   * drawn yet. `null` before the first frame. */
  list: string | null;
}

export function newDrawState(
  state: WordtrailState,
  tileSize: number,
): WordtrailDrawState {
  return {
    tileSize,
    tiles: new TileCache(state.w * state.h, { words: 4 }),
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
  const side = (k: number): number => (sides >>> (k * SIDE_BITS)) & 0xff;
  // The letter's disc, which the lines' arrows fill the gaps between.
  const disc = Math.floor(ts * 0.3);
  // The arrow of the line across side `k`, pointing out of the square or
  // into it. It crosses the side, so the square beside draws the rest of it.
  const arrow = (k: number, out: boolean, color: number): void => {
    const there = { x: cx + DX[k] * ts, y: cy + DY[k] * ts };
    const here = { x: cx, y: cy };
    if (out) drawPathArrow(dr, ts, here, there, color, disc);
    else drawPathArrow(dr, ts, there, here, color, disc);
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
  const surface = tone ? winSlot(tone) : COL_CELL;
  // The word's color, or -1 where the square's piece spells none.
  const hue = ((square >> K_HUE) & 0xf) - 1;
  dr.drawRect(body, surface);
  if (square & F_STRIPES) dr.drawHatch(body, hatchPeriod(ts));

  // The hint's outline, inside the square and under the lines and crosses
  // on its sides.
  drawMarkSides(
    dr,
    { box: body, outer: 0, inner: Math.max(2, ts >> 4) },
    (square >> K_OUTLINE) & 0xf,
    COL_HINT_OUTLINE,
  );
  // The dictionary's spotlight, inside where the hint's outline would be, so
  // a letter can wear both.
  const spotInset = Math.max(2, ts >> 4) + 2;
  drawMarkSides(
    dr,
    {
      box: {
        x: body.x + spotInset,
        y: body.y + spotInset,
        w: body.w - 2 * spotInset,
        h: body.h - 2 * spotInset,
      },
      outer: 0,
      inner: Math.max(2, ts >> 4),
    },
    (square >> K_SPOT) & 0xf,
    COL_SPOTLIGHT,
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

  // The step's edges, under the player's own: each asked line the arrow a
  // laid one would be.
  const small = Math.max(2, Math.floor(ts / 8));
  const hintCross = Math.max(2, ts >> 4);
  drawEdgeHints(dr, hints, COL_HINT_OUTLINE, {
    cross: (sides, ink) => {
      for (let k = 0; k < 4; k++) if (sides & (1 << k)) cross(k, ink, small, hintCross);
    },
    line: (sides, ink) => {
      for (let k = 0; k < 4; k++)
        if (sides & (1 << k)) arrow(k, (hintOut & (1 << k)) !== 0, ink);
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

  // Each line an arrow, in the drag's ink where the drag lays it; a line the
  // drag would lift has no direction left to show, so a plain stroke from
  // under the letter to the side.
  let outColor = -1;
  for (let k = 0; k < 4; k++) {
    const s = side(k);
    if ((s & 3) === LINE) {
      const color =
        s & S_DRAG_ADD
          ? COL_DRAG_ADD
          : s & S_WRONG || s & S_ERROR
            ? COL_ERROR
            : hue >= 0
              ? COL_HUE + hue
              : COL_LINE;
      arrow(k, (s & S_OUT) !== 0, color);
      if (s & S_OUT) outColor = color;
    } else if (s & S_DRAG_REMOVE)
      dr.drawLine(
        { x: cx, y: cy },
        sideEnd(k),
        COL_DRAG_REMOVE,
        pathStrokeThickness(ts),
      );
  }

  // The letter, on a disc over the lines, so it reads whatever runs under
  // it: the square's own surface, or its word's color. A word's first
  // letter is ringed in the ink of the line out of it, clear of a colored
  // disc by a stroke's width so the ring does not merge into it.
  const letter = state.letters[y * state.w + x];
  const center = { x: cx, y: cy };
  if (square & F_START && outColor >= 0)
    drawPathStart(
      dr,
      ts,
      center,
      hue >= 0 ? disc + pathStrokeThickness(ts) : disc,
      outColor,
      surface,
    );
  const fill = hue >= 0 ? COL_HUE + hue : surface;
  dr.drawCircle(center, disc, fill, fill);
  dr.drawText(
    center,
    glyphFont(Math.floor(ts * 0.42)),
    hue >= 0 ? COL_HUE_TEXT + hue : COL_TEXT,
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

/** Each listed word's slot's piece, by root: the words spelled on the board,
 * by length, the first in reading order first; -1 where none fills it. A
 * word's color is its slot's, so it is the same on the board and in the
 * list. */
function listedRoots(state: WordtrailState, pieces: Pieces): number[] {
  const byLength = new Map<number, number[]>();
  for (const [root, word] of [...pieces.words].sort(([a], [b]) => a - b)) {
    const list = byLength.get(word.length) ?? [];
    list.push(root);
    byLength.set(word.length, list);
  }
  return state.lengths.map((n) => byLength.get(n)?.shift() ?? -1);
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
    const hue = s % HUES;
    for (let k = 0; k < length; k++) {
      const r: Rect = { x: at.x + k * box, y: at.y, w: box, h: box };
      dr.drawRect(r, COL_GRID);
      dr.drawRect(
        { x: r.x + 1, y: r.y + 1, w: box - 2, h: box - 2 },
        word === "" ? COL_CELL : COL_HUE + hue,
      );
      if (word !== "")
        dr.drawText(
          { x: r.x + box / 2, y: r.y + box / 2 },
          glyphFont(Math.floor(box * 0.6)),
          COL_HUE_TEXT + hue,
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

  if (ds.tiles.firstFrame()) {
    // The grid's frame: each square draws its top and left lines, and this
    // the bottom and right ones, in the border where no square repaints.
    const b = border(ts);
    dr.drawRect({ x: b, y: b, w: w * ts + 1, h: h * ts + 1 }, COL_GRID);
  }

  // What the board shows: the state, with the drag as it would be released.
  const drag = dragPreview(wordtrailLines, state, ui.drag);
  const edges = withChanges(state, drag);
  const dragged = new Map(drag.map((c) => [c.edge, c.mark]));
  const pieces = piecesOf(state, edges);
  const wrong = new Set(mistakes?.map((m) => m.edge));
  const listed = listedRoots(state, pieces);
  const hueOf = new Map(
    listed.flatMap((root, s) => (root < 0 ? [] : [[root, s % HUES]])),
  );

  // The displayed step's marks, read from its words and from nowhere else:
  // the kinds read here are the kinds a sentence may name.
  const named = stepMarks(hint);
  const evidence = new Set(named.of("outline", CELL).map((c) => c.y * w + c.x));
  const striped = new Set(named.of("stripes", CELL).map((c) => c.y * w + c.x));
  const inEvidence = (x: number, y: number): boolean =>
    x >= 0 && x < w && y >= 0 && y < h && evidence.has(y * w + x);
  const spotlit =
    ui.spotlight === null ? new Set<number>() : spotlitSquares(state, ui.spotlight);
  const inSpotlight = (x: number, y: number): boolean =>
    x >= 0 && x < w && y >= 0 && y < h && spotlit.has(y * w + x);
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
        (((hueOf.get(pieces.root[i]) ?? -1) + 1) << K_HUE) |
        (striped.has(i) ? F_STRIPES : 0) |
        // The win flash sweeps the letters; a dark square never lights.
        (letters[i] === 0 ? 0 : flash.win(sweepStep(x, y)) << K_TONE) |
        (inEvidence(x, y) ? outlineSides(x, y, inEvidence) << K_OUTLINE : 0) |
        (inSpotlight(x, y) ? outlineSides(x, y, inSpotlight) << K_SPOT : 0);
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
      if (!ds.tiles.changed(i, keyed, sides, hints, hintOut)) continue;
      drawTile(dr, ds, state, x, y, keyed, sides, hints, hintOut);
    }
  }

  const words = listed.map((root) => pieces.words.get(root) ?? "");
  const key = words.join(",");
  if (ds.list !== key) {
    drawList(dr, ds, state, words);
    ds.list = key;
  }
}
