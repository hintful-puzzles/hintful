/**
 * Rectangles rendering — a faithful port of `game_redraw` / `draw_tile` from
 * `rect.c`, using the `NARROW_BORDERS` geometry the web build compiles
 * (`BORDER = 1`).
 *
 * The per-cell cache word packs exactly upstream's `visible[]` — the four edge
 * values (0/1/2/3) and four corner values (2 bits each) around the cell, plus
 * the `F_CORRECT` and `F_CURSOR` bits — into an `Int32Array`
 * (docs/rendering.md § "The tile cache and the diff key"). Four extra
 * bits carry the `findMistakes` wrong-edge overlay so it repaints and clears
 * through the same cache. The drag preview is drawn into a scratch copy of the
 * edges before the corner pass, so it too lives entirely in the word.
 *
 * The look is the collection's: squares on the quiet cell surface with a thin
 * grid, and the rectangles' edges, the board's outer edge among them, in ink.
 * Each clue takes one of the region fills, as LinkedIn's Patches colors its
 * clues: its square wears it, and so does a rectangle that the clue allows,
 * whole, once it is drawn.
 */

import { REGION_FILLS, REGION_LINES } from "../../engine/color/colors.ts";
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
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawRectCorners, drawRectOutline, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { drawMarkSides, outlineSides } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { regionFills } from "../../engine/region-fill.ts";
import { type RingClear, textBox } from "../../engine/ring.ts";
import type { Color, DrawTextOptions, Point, Rect, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
import type { RectHint } from "./hint.ts";
import { LINE, RECTANGLE } from "./hint-marks.ts";
import {
  type Claims,
  gridDrawRect,
  hrange,
  outlinedBoxAt,
  readClaims,
  resizeEdges,
  vrange,
} from "./moves.ts";
import {
  HIDDEN,
  type RectDrawState,
  type RectMistake,
  type RectMove,
  type RectParams,
  type RectState,
  type RectUi,
  SHAPE_ANY,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 24;
export const BORDER = 1;

// --- palette ---------------------------------------------------------------
export const COL_BACKGROUND = 0;
export const COL_LINE = 1;
export const COL_TEXT = 2;
export const COL_GRID = 3;
export const COL_DRAG = 4;
export const COL_DRAGERASE = 5;
export const COL_CURSOR = 6;
export const COL_MISTAKE = 7;
export const COL_HINT_CELL = 8;
export const COL_CELL = 9; // the surface of a square with no clue
/** The ground of a square the win flash is on: its body, and its leading
 * edge. */
export const COL_FLASH = 10;
export const COL_FLASH_LEAD = 11;
/** The first of the clues' fills, one for each of {@link FILLS}. */
export const COL_FILL = 12;
/** The first of the clues' line colors, indexed as {@link COL_FILL}. */
export const COL_EDGE_TINT = 16;

/** The first four region fills, as Star Battle takes them: the next four are
 * a step darker in the dark scheme, too near the plain cell they border
 * (`neighbor-contrast.test.ts`). */
const FILLS = REGION_FILLS.slice(0, 4);

export function colors(defaultBackground: Color): Color[] {
  const bg = defaultBackground;
  const out: Color[] = [];
  out[COL_BACKGROUND] = bg;
  out[COL_GRID] = surfaceGrid(bg);
  out[COL_CELL] = cellSurface(bg);
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  out[COL_DRAG] = DRAG_ADD;
  out[COL_DRAGERASE] = DRAG_REMOVE;
  FILLS.forEach((fill, k) => {
    out[COL_FILL + k] = fill;
    out[COL_EDGE_TINT + k] = REGION_LINES[k];
  });
  out[COL_LINE] = INK;
  out[COL_TEXT] = INK;
  out[COL_CURSOR] = CURSOR;
  out[COL_MISTAKE] = ERROR;
  out[COL_HINT_CELL] = HINT_OUTLINE;
  return out;
}

// --- cache-word bits -------------------------------------------------------
const F_CURSOR = 1 << 17;
const M_TOP = 1 << 18;
const M_BOTTOM = 1 << 19;
const M_LEFT = 1 << 20;
const M_RIGHT = 1 << 21;
/** The fill the square wears, one more than its index in {@link FILLS}, or
 * 0 for none: bits 22–25. */
const FILL_SHIFT = 22;
const FILL_MASK = 15;

/** Each clue's fill, as an index in {@link FILLS}, by its square: one
 * the board keeps, so it is worked out once for a board's clues. */
const clueFillCache = new WeakMap<Int32Array, Int32Array>();

/**
 * Each clue's fill, by its square. The fills color the board's division
 * into the squares nearest each clue, so that clues side by side differ. It
 * is not the answer's division: a fill must not say which clues' rectangles
 * meet.
 */
function clueFills(state: RectState): Int32Array {
  const cached = clueFillCache.get(state.grid);
  if (cached) return cached;
  const { w, h, grid } = state;
  const clues: number[] = [];
  for (let i = 0; i < grid.length; i++) if (grid[i]) clues.push(i);
  const out = new Int32Array(w * h).fill(-1);
  if (clues.length > 0) {
    const nearest = new Int32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      clues.forEach((c, k) => {
        const d =
          Math.abs((c % w) - (i % w)) + Math.abs(Math.floor(c / w) - Math.floor(i / w));
        if (d < bestDistance) [best, bestDistance] = [k, d];
      });
      nearest[i] = best;
    }
    const fills = regionFills(nearest, w, FILLS.length);
    clues.forEach((c, k) => {
      out[c] = fills[k];
    });
  }
  clueFillCache.set(state.grid, out);
  return out;
}

/** The line color index of each edge, by the edge grids' layout, and of each
 * corner, by its square's top left, or {@link UNTINTED}. */
interface Tints {
  readonly h: Int8Array;
  readonly v: Int8Array;
  readonly corner: Int8Array;
}

/**
 * Where a rectangle the player drew round a clue may still grow, its sides
 * take its clue's line color, so it reads as theirs to shape and not as
 * walls (`readClaims`). That holds where it meets another such rectangle,
 * filled as it is, maybe in the same color: the side between them must show,
 * and a wall's color there would say it is settled (the owner, 2026-10-31).
 * A side against a rectangle with its number is that one's wall, in ink. A
 * corner takes the color where every line that meets there has it. One
 * beyond mending is not tinted: its sides are red, as a broken rule's are.
 */
function lineTints(state: RectState, claims: Claims): Tints {
  const { w, h } = state;
  const fill = clueFills(state);
  const tints: Tints = {
    h: new Int8Array(w * h).fill(UNTINTED),
    v: new Int8Array(w * h).fill(UNTINTED),
    corner: new Int8Array(w * h).fill(UNTINTED),
  };
  /** Whether the square `(x, y)` is in a rectangle drawn to its number. */
  const settled = (x: number, y: number): boolean => {
    const c = x >= 0 && y >= 0 && x < w && y < h ? claims.owner[y * w + x] : -1;
    return c >= 0 && claims.boxes.get(c)?.final === true;
  };
  for (const [clue, { box, final, broken }] of claims.boxes) {
    if (final || broken) continue;
    const k = fill[clue];
    const tint = (a: Int8Array, lines: Uint8Array, i: number, x: number, y: number) => {
      if (lines[i] && !settled(x, y)) a[i] = k;
    };
    for (let x = box.x; x < box.x + box.w; x++) {
      if (hrange(w, h, x, box.y))
        tint(tints.h, state.hedge, box.y * w + x, x, box.y - 1);
      const b = box.y + box.h;
      if (hrange(w, h, x, b)) tint(tints.h, state.hedge, b * w + x, x, b);
    }
    for (let y = box.y; y < box.y + box.h; y++) {
      if (vrange(w, h, box.x, y))
        tint(tints.v, state.vedge, y * w + box.x, box.x - 1, y);
      const r = box.x + box.w;
      if (vrange(w, h, r, y)) tint(tints.v, state.vedge, y * w + r, r, y);
    }
  }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      // The lines that meet at the top-left corner of (x, y).
      const meeting: number[] = [];
      if (hrange(w, h, x - 1, y) && state.hedge[y * w + x - 1])
        meeting.push(tints.h[y * w + x - 1]);
      if (hrange(w, h, x, y) && state.hedge[y * w + x])
        meeting.push(tints.h[y * w + x]);
      if (vrange(w, h, x, y - 1) && state.vedge[(y - 1) * w + x])
        meeting.push(tints.v[(y - 1) * w + x]);
      if (vrange(w, h, x, y) && state.vedge[y * w + x])
        meeting.push(tints.v[y * w + x]);
      if (meeting.length > 0 && meeting.every((t) => t === meeting[0]))
        tints.corner[y * w + x] = meeting[0];
    }
  return tints;
}

/** The colors round square `(x, y)`, as {@link RectDrawState.tints} keys
 * them: its four sides and four corners, three bits each. */
function tintKey(tints: Tints, w: number, h: number, x: number, y: number): number {
  const at = (a: Int8Array, i: number, inside: boolean) => (inside ? a[i] + 1 : 0);
  const i = y * w + x;
  const parts = [
    at(tints.h, i, true),
    at(tints.h, i + w, y + 1 < h),
    at(tints.v, i, true),
    at(tints.v, i + 1, x + 1 < w),
    at(tints.corner, i, true),
    at(tints.corner, i + 1, x + 1 < w),
    at(tints.corner, i + w, y + 1 < h),
    at(tints.corner, i + w + 1, x + 1 < w && y + 1 < h),
  ];
  return parts.reduce((key, part, n) => key | (part << (3 * n)), 0);
}

/** The fill each square wears, by the same index, or -1: its clue's, if it
 * has one; over a rectangle the player drew round a clue, the clue's from
 * the moment it is drawn, as a patch (the owner, 2026-10-31); and over any
 * other rectangle the clue allows, the clue's on every square of it. */
function squareFills(state: RectState, claims: Claims): Int32Array {
  const { w, h, grid } = state;
  const clue = clueFills(state);
  const out = clue.slice();
  for (let i = 0; i < w * h; i++)
    if (claims.owner[i] >= 0) out[i] = clue[claims.owner[i]];
  const filled = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!state.correct[y * w + x] || filled[y * w + x]) continue;
      // A correct square is in a rectangle drawn round one clue.
      const box = outlinedBoxAt(state, x, y);
      if (!box) continue;
      let fill = -1;
      for (let yy = box.y; yy < box.y + box.h; yy++)
        for (let xx = box.x; xx < box.x + box.w; xx++)
          if (grid[yy * w + xx]) fill = clue[yy * w + xx];
      for (let yy = box.y; yy < box.y + box.h; yy++)
        for (let xx = box.x; xx < box.x + box.w; xx++) {
          out[yy * w + xx] = fill;
          filled[yy * w + xx] = 1;
        }
    }
  return out;
}
/** The hint's marks on the cell: the sides of its outline (bits 26–29), in
 * `hint-mark.ts`'s side bits, and whether it is striped. Its rings are keyed
 * apart (`RectDrawState.rings`). */
const OUTLINE_SHIFT = 26;
const F_STRIPES = 1 << 30;

const coord = (n: number, tile: number) => n * tile + BORDER;
const colorOf = (k: number) =>
  k === 1 ? COL_LINE : k === 2 ? COL_DRAG : COL_DRAGERASE;

export function computeSize(p: RectParams, tileSize: number): Size {
  return { w: p.w * tileSize + 2 * BORDER + 1, h: p.h * tileSize + 2 * BORDER + 1 };
}

export function newDrawState(state: RectState, tileSize: number): RectDrawState {
  return {
    started: false,
    tileSize,
    w: state.w,
    h: state.h,
    visible: new Int32Array(state.w * state.h).fill(-1),
    tone: new Uint8Array(state.w * state.h),
    rings: new Array<string>(state.w * state.h).fill(""),
    tints: new Int32Array(state.w * state.h).fill(-1),
  };
}

/** No tint: the line is ink. */
const UNTINTED = -1;

/**
 * The color a drawn edge or corner of value `v` takes: a line the player has
 * not settled in its clue's line color, `tint`, and every other as its value
 * says.
 */
const edgeColor = (v: number, tint: number): number =>
  v === 1 && tint !== UNTINTED ? COL_EDGE_TINT + tint : colorOf(v);

function drawTile(
  dr: GameDrawing,
  tile: number,
  state: RectState,
  x: number,
  y: number,
  hedge: Uint8Array,
  vedge: Uint8Array,
  corners: Uint8Array,
  bgflags: number,
  mistake: number,
  tone: WinTone,
  rings: readonly TileRing[],
  tints: Tints,
): void {
  const { w, h } = state;
  const cx = coord(x, tile);
  const cy = coord(y, tile);
  const rect = (rx: number, ry: number, rw: number, rh: number, c: number) =>
    dr.drawRect({ x: rx, y: ry, w: rw, h: rh } satisfies Rect, c);

  const num = state.grid[y * w + x];

  // A finished rectangle shades whole in its clue's fill, the clue's square
  // included; until then only the clue's square wears it.
  const fill = (bgflags >> FILL_SHIFT) & FILL_MASK;
  rect(cx, cy, tile + 1, tile + 1, COL_GRID);
  rect(
    cx + 1,
    cy + 1,
    tile - 1,
    tile - 1,
    tone
      ? winSlot(tone, COL_FLASH, COL_FLASH_LEAD)
      : fill
        ? COL_FILL + fill - 1
        : COL_CELL,
  );
  // The line or area the hint's sentence names, under the clue.
  if (bgflags & F_STRIPES)
    dr.drawHatch({ x: cx + 1, y: cy + 1, w: tile - 1, h: tile - 1 }, hatchPeriod(tile));

  if (num) {
    const { text, origin, options, frame } = clueInk(state, tile, x, y);
    if (frame)
      drawRectOutline(
        dr,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        COL_TEXT,
        frameThickness(tile),
      );
    dr.drawText(origin, options, COL_TEXT, text);
  }

  // Edges. A boundary edge (outside the grid) is always a solid black line.
  if (!hrange(w, h, x, y) || hedge[y * w + x])
    rect(
      cx,
      cy,
      tile + 1,
      2,
      mistake & M_TOP
        ? COL_MISTAKE
        : hrange(w, h, x, y)
          ? edgeColor(hedge[y * w + x], tints.h[y * w + x])
          : COL_LINE,
    );
  if (!hrange(w, h, x, y + 1) || hedge[(y + 1) * w + x])
    rect(
      cx,
      cy + tile - 1,
      tile + 1,
      2,
      mistake & M_BOTTOM
        ? COL_MISTAKE
        : hrange(w, h, x, y + 1)
          ? edgeColor(hedge[(y + 1) * w + x], tints.h[(y + 1) * w + x])
          : COL_LINE,
    );
  if (!vrange(w, h, x, y) || vedge[y * w + x])
    rect(
      cx,
      cy,
      2,
      tile + 1,
      mistake & M_LEFT
        ? COL_MISTAKE
        : vrange(w, h, x, y)
          ? edgeColor(vedge[y * w + x], tints.v[y * w + x])
          : COL_LINE,
    );
  if (!vrange(w, h, x + 1, y) || vedge[y * w + (x + 1)])
    rect(
      cx + tile - 1,
      cy,
      2,
      tile + 1,
      mistake & M_RIGHT
        ? COL_MISTAKE
        : vrange(w, h, x + 1, y)
          ? edgeColor(vedge[y * w + (x + 1)], tints.v[y * w + (x + 1)])
          : COL_LINE,
    );

  // Corners.
  const corner = (i: number) => edgeColor(corners[i], tints.corner[i]);
  if (corners[y * w + x]) rect(cx, cy, 2, 2, corner(y * w + x));
  if (x + 1 < w && corners[y * w + (x + 1)])
    rect(cx + tile - 1, cy, 2, 2, corner(y * w + (x + 1)));
  if (y + 1 < h && corners[(y + 1) * w + x])
    rect(cx, cy + tile - 1, 2, 2, corner((y + 1) * w + x));
  if (x + 1 < w && y + 1 < h && corners[(y + 1) * w + (x + 1)])
    rect(cx + tile - 1, cy + tile - 1, 2, 2, corner((y + 1) * w + (x + 1)));

  // The hint's outline, just inside the cell's own lines so it hides none,
  // and over it each ring that reaches the square, in its part of the ring:
  // every square a ring crosses draws the same one, clipped to itself.
  const t = ringThickness(tile);
  drawMarkSides(
    dr,
    {
      box: { x: cx + 2 + t, y: cy + 2 + t, w: tile - 3 - 2 * t, h: tile - 3 - 2 * t },
      outer: 0,
      inner: t,
    },
    (bgflags >> OUTLINE_SHIFT) & 15,
    COL_HINT_CELL,
  );
  for (const ring of rings) {
    dr.clip({ x: cx, y: cy, w: tile + 1, h: tile + 1 });
    dr.drawRing(ring.box, ring.clear, t, { room: ring.room, inside: ring.inside });
    dr.unclip();
  }

  // The keyboard cursor: brackets at the square's corners, clear of its number.
  if (bgflags & F_CURSOR)
    drawRectCorners(
      dr,
      cx + Math.floor(tile / 2),
      cy + Math.floor(tile / 2),
      Math.floor(tile / 2) - 3,
      COL_CURSOR,
      t,
    );

  dr.drawUpdate({ x: cx, y: cy, w: tile + 1, h: tile + 1 } satisfies Rect);
}

/** The displayed hint step's marks, as per-cell cache-word bits. */
function hintTileBits(
  w: number,
  h: number,
  hint?: HintStep<RectMove, RectHint>,
): Int32Array {
  const bits = new Int32Array(w * h);
  const marks = stepMarks(hint);
  const outlined = new Set(marks.of("outline", CELL).map((p: Point) => p.y * w + p.x));
  const isOutlined = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < w && y < h && outlined.has(y * w + x);
  for (const i of outlined)
    bits[i] |= outlineSides(i % w, Math.floor(i / w), isOutlined) << OUTLINE_SHIFT;
  for (const p of marks.of("stripes", CELL)) bits[p.y * w + p.x] |= F_STRIPES;
  return bits;
}

/** A ring a square draws its part of. */
interface TileRing {
  readonly box: Rect;
  readonly clear: RingClear;
  readonly room?: Rect;
  readonly inside?: (ink: number) => void;
}

const ringThickness = (tile: number): number => Math.max(2, Math.round(tile / 16));

/** A Patches shape's frame, as fractions of the room it has: wide and
 * high. */
const FRAME_SIZES: readonly (readonly [number, number])[] = [
  [0, 0],
  [0.9, 0.9],
  [0.7, 1],
  [1, 0.7],
];

/** A digit's width, as a share of its font size, which sets how large a
 * number fits inside a narrow frame. */
const DIGIT_WIDTH = 0.62;

/**
 * How the clue of the square at `(x, y)` is drawn, read by the drawing and
 * by the rings near it: its text, a number or `?`, and for a clue that names
 * a shape, the frame of that shape around the text, which is smaller to fit.
 * A frame keeps inside the band the hint's outline draws round a square
 * (`drawTile`), so an outlined clue shows all of its frame.
 */
function clueInk(
  state: RectState,
  tile: number,
  x: number,
  y: number,
): { text: string; origin: Point; options: DrawTextOptions; frame: Rect | null } {
  const i = y * state.w + x;
  const n = state.grid[i];
  const shape = state.shapes[i];
  const origin = {
    x: coord(x, tile) + Math.floor(tile / 2),
    y: coord(y, tile) + Math.floor(tile / 2),
  };
  const text = n === HIDDEN ? "?" : String(n);
  if (shape === SHAPE_ANY)
    return { text, origin, options: glyphFont(Math.floor(tile / 2)), frame: null };
  const room = tile - 2 * (3 + 2 * ringThickness(tile));
  const [fw, fh] = FRAME_SIZES[shape];
  const w = Math.round(room * fw);
  const h = Math.round(room * fh);
  const frame = {
    x: origin.x - Math.floor(w / 2),
    y: origin.y - Math.floor(h / 2),
    w,
    h,
  };
  const size = Math.floor(
    Math.min(tile * 0.4, h * 0.95, (w * 0.9) / (DIGIT_WIDTH * text.length)),
  );
  return { text, origin, options: glyphFont(size), frame };
}

const frameThickness = (tile: number): number => Math.max(1, Math.round(tile / 32));

/** The ink of the clue in the square at `(x, y)`, none off the board. */
function numberBoxes(state: RectState, tile: number, x: number, y: number): Rect[] {
  if (x < 0 || y < 0 || x >= state.w || y >= state.h) return [];
  if (!state.grid[y * state.w + x]) return [];
  const { text, origin, options, frame } = clueInk(state, tile, x, y);
  return [frame ?? textBox(origin, options, text)];
}

/** The displayed hint step's rings, by the squares that draw them: a
 * rectangle the step decides is ringed whole, round its number, and may reach
 * a square past its edge to round a corner the number sits in; a line it asks
 * for is a pill across the edge, with the line inside it, clear of the two
 * squares' numbers. */
function hintRings(
  dr: GameDrawing,
  state: RectState,
  tile: number,
  hint?: HintStep<RectMove, RectHint>,
): Map<number, TileRing[]> {
  const { w, h } = state;
  const out = new Map<number, TileRing[]>();
  const add = (x: number, y: number, ring: TileRing) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    out.set(i, [...(out.get(i) ?? []), ring]);
  };
  const marks = stepMarks(hint);
  for (const r of marks.of("ring", RECTANGLE)) {
    const x0 = Math.max(0, r.x - 1);
    const y0 = Math.max(0, r.y - 1);
    const x1 = Math.min(w, r.x + r.w + 1);
    const y1 = Math.min(h, r.y + r.h + 1);
    const enclose: Rect[] = [];
    const avoid: Rect[] = [];
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const within = x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
        (within ? enclose : avoid).push(...numberBoxes(state, tile, x, y));
      }
    const ring: TileRing = {
      box: {
        x: coord(r.x, tile) + 2,
        y: coord(r.y, tile) + 2,
        w: r.w * tile - 3,
        h: r.h * tile - 3,
      },
      clear: { enclose, avoid },
      // The squares that draw it, up to the pixels of their outer lines that
      // a square outside them also paints.
      room: {
        x: coord(x0, tile) + 1,
        y: coord(y0, tile) + 1,
        w: (x1 - x0) * tile - 1,
        h: (y1 - y0) * tile - 1,
      },
    };
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) add(x, y, ring);
  }
  const short = Math.floor(tile / 2);
  for (const e of marks.of("ring", LINE)) {
    const v = e.edge === "v";
    // The two squares the edge parts, and the line between them.
    const [ax, ay] = v ? [e.x - 1, e.y] : [e.x, e.y - 1];
    const lx = coord(e.x, tile);
    const ly = coord(e.y, tile);
    const line: Rect = v
      ? { x: lx, y: ly, w: 2, h: tile + 1 }
      : { x: lx, y: ly, w: tile + 1, h: 2 };
    const ring: TileRing = {
      box: v
        ? { x: lx + 1 - short / 2, y: ly + 2, w: short, h: tile - 3 }
        : { x: lx + 2, y: ly + 1 - short / 2, w: tile - 3, h: short },
      clear: {
        enclose: [],
        avoid: [
          ...numberBoxes(state, tile, ax, ay),
          ...numberBoxes(state, tile, e.x, e.y),
        ],
      },
      room: v
        ? { x: coord(ax, tile) + 2, y: ly + 2, w: 2 * tile - 3, h: tile - 3 }
        : { x: lx + 2, y: coord(ay, tile) + 2, w: tile - 3, h: 2 * tile - 3 },
      inside: (ink) => dr.drawRect(line, ink),
    };
    add(ax, ay, ring);
    add(e.x, e.y, ring);
  }
  return out;
}

export function redraw(
  dr: GameDrawing,
  ds: RectDrawState,
  _prev: RectState | null,
  state: RectState,
  _dir: number,
  ui: RectUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<RectMove, RectHint>,
  mistakes?: readonly RectMistake[],
): void {
  const { w, h } = state;
  const tile = ds.tileSize;
  const hintBits = hintTileBits(w, h, hint);
  const rings = hintRings(dr, state, tile, hint);

  // Apply the in-progress drag preview to scratch edge copies.
  let hedge = state.hedge;
  let vedge = state.vedge;
  // `drag.live` as well as `dragged`: the engine ends a live drag when the
  // board changes under it, and the preview must go with it.
  if (
    ui.drag.live &&
    ui.dragged &&
    ui.x1 >= 0 &&
    ui.y1 >= 0 &&
    ui.x2 >= 0 &&
    ui.y2 >= 0
  ) {
    hedge = state.hedge.slice();
    vedge = state.vedge.slice();
    const to = { x: ui.x1, y: ui.y1, w: ui.x2 - ui.x1, h: ui.y2 - ui.y1 };
    // A resize takes up the sides its move would in the erasing color.
    if (ui.resizing) resizeEdges(state, ui.resizing.from, to, hedge, vedge, 2, 3);
    else
      gridDrawRect(
        w,
        h,
        hedge,
        vedge,
        ui.erasing ? 3 : 2,
        true,
        true,
        ui.x1,
        ui.y1,
        ui.x2,
        ui.y2,
      );
  }

  // Corners: a corner pixel lights to the max value of the edges meeting it.
  const corners = new Uint8Array(w * h);
  for (let x = 0; x < w; x++)
    for (let y = 0; y < h; y++) {
      if (x > 0) {
        const e = vedge[y * w + x];
        if (corners[y * w + x] < e) corners[y * w + x] = e;
        if (y + 1 < h && corners[(y + 1) * w + x] < e) corners[(y + 1) * w + x] = e;
      }
      if (y > 0) {
        const e = hedge[y * w + x];
        if (corners[y * w + x] < e) corners[y * w + x] = e;
        if (x + 1 < w && corners[y * w + (x + 1)] < e) corners[y * w + (x + 1)] = e;
      }
    }

  const claims = readClaims(state);
  const fills = squareFills(state, claims);
  const tints = lineTints(state, claims);

  // Wrong-edge overlay from findMistakes, and the sides of a drawn rectangle
  // beyond mending, a broken rule shown live in the same red, as the
  // border-grid games show theirs (`engine/border-grid-render.ts`).
  const wrongH = new Uint8Array(w * h);
  const wrongV = new Uint8Array(w * h);
  if (mistakes) {
    for (const m of mistakes) {
      if (m.edge === "h") wrongH[m.y * w + m.x] = 1;
      else wrongV[m.y * w + m.x] = 1;
    }
  }
  for (const { box, broken } of claims.boxes.values()) {
    if (!broken) continue;
    for (let x = box.x; x < box.x + box.w; x++) {
      if (hrange(w, h, x, box.y)) wrongH[box.y * w + x] = 1;
      if (hrange(w, h, x, box.y + box.h)) wrongH[(box.y + box.h) * w + x] = 1;
    }
    for (let y = box.y; y < box.y + box.h; y++) {
      if (vrange(w, h, box.x, y)) wrongV[y * w + box.x] = 1;
      if (vrange(w, h, box.x + box.w, y)) wrongV[y * w + box.x + box.w] = 1;
    }
  }

  if (!ds.started) {
    dr.drawRect(
      {
        x: coord(0, tile) - 1,
        y: coord(0, tile) - 1,
        w: w * tile + 3,
        h: h * tile + 3,
      },
      COL_LINE,
    );
    ds.started = true;
    dr.drawUpdate({
      x: 0,
      y: 0,
      w: w * tile + 2 * BORDER + 1,
      h: h * tile + 2 * BORDER + 1,
    });
    ds.visible.fill(-1);
  }

  for (let x = 0; x < w; x++)
    for (let y = 0; y < h; y++) {
      let c = 0;
      if (hrange(w, h, x, y)) c |= hedge[y * w + x];
      if (hrange(w, h, x, y + 1)) c |= hedge[(y + 1) * w + x] << 2;
      if (vrange(w, h, x, y)) c |= vedge[y * w + x] << 4;
      if (vrange(w, h, x + 1, y)) c |= vedge[y * w + (x + 1)] << 6;
      c |= corners[y * w + x] << 8;
      if (x + 1 < w) c |= corners[y * w + (x + 1)] << 10;
      if (y + 1 < h) c |= corners[(y + 1) * w + x] << 12;
      if (x + 1 < w && y + 1 < h) c |= corners[(y + 1) * w + (x + 1)] << 14;
      c |= (fills[y * w + x] + 1) << FILL_SHIFT;
      const tone = flash.win(sweepStep(x, y));
      if (ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y) c |= F_CURSOR;

      let mistake = 0;
      if (wrongH[y * w + x]) mistake |= M_TOP;
      if (y + 1 < h && wrongH[(y + 1) * w + x]) mistake |= M_BOTTOM;
      if (wrongV[y * w + x]) mistake |= M_LEFT;
      if (x + 1 < w && wrongV[y * w + (x + 1)]) mistake |= M_RIGHT;
      c |= mistake;
      c |= hintBits[y * w + x];

      const tileRings = rings.get(y * w + x) ?? [];
      const ringKey = tileRings
        .map(({ box: b }) => `${b.x},${b.y},${b.w},${b.h}`)
        .join(" ");
      const tintsKey = tintKey(tints, w, h, x, y);
      if (
        ds.visible[y * w + x] !== c ||
        ds.tone[y * w + x] !== tone ||
        ds.rings[y * w + x] !== ringKey ||
        ds.tints[y * w + x] !== tintsKey
      ) {
        drawTile(
          dr,
          tile,
          state,
          x,
          y,
          hedge,
          vedge,
          corners,
          c,
          mistake,
          tone,
          tileRings,
          tints,
        );
        ds.visible[y * w + x] = c;
        ds.tone[y * w + x] = tone;
        ds.rings[y * w + x] = ringKey;
        ds.tints[y * w + x] = tintsKey;
      }
    }
}
