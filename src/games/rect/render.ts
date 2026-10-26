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
 * grid, a number on the lifted surface of a given, and the rectangles' edges,
 * the board's outer edge among them, in ink.
 */

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
  REGION_DONE,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawRectCorners, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { drawMarkSides, outlineSides } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { type RingClear, textBox } from "../../engine/ring.ts";
import type { Color, DrawTextOptions, Point, Rect, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
import type { RectHint } from "./hint.ts";
import { LINE, RECTANGLE } from "./hint-marks.ts";
import { gridDrawRect, hrange, vrange } from "./moves.ts";
import type {
  RectDrawState,
  RectMistake,
  RectMove,
  RectParams,
  RectState,
  RectUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 24;
export const BORDER = 1;

// --- palette ---------------------------------------------------------------
export const COL_BACKGROUND = 0;
export const COL_CORRECT = 1;
export const COL_LINE = 2;
export const COL_TEXT = 3;
export const COL_GRID = 4;
export const COL_DRAG = 5;
export const COL_DRAGERASE = 6;
export const COL_CURSOR = 7;
export const COL_MISTAKE = 8;
export const COL_HINT_CELL = 9;
export const COL_CELL = 10; // the surface of a square with no number
export const COL_GIVEN = 11; // the lifted surface under a number
/** The ground of a square the win flash is on: its body, and its leading
 * edge. */
export const COL_FLASH = 12;
export const COL_FLASH_LEAD = 13;

export function colors(defaultBackground: Color): Color[] {
  const bg = defaultBackground;
  const out: Color[] = [];
  out[COL_BACKGROUND] = bg;
  out[COL_GRID] = surfaceGrid(bg);
  out[COL_CELL] = cellSurface(bg);
  out[COL_GIVEN] = givenSurface(bg);
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  out[COL_DRAG] = DRAG_ADD;
  out[COL_DRAGERASE] = DRAG_REMOVE;
  out[COL_CORRECT] = REGION_DONE;
  out[COL_LINE] = INK;
  out[COL_TEXT] = INK;
  out[COL_CURSOR] = CURSOR;
  out[COL_MISTAKE] = ERROR;
  out[COL_HINT_CELL] = HINT_OUTLINE;
  return out;
}

// --- cache-word bits -------------------------------------------------------
const F_CORRECT = 1 << 16;
const F_CURSOR = 1 << 17;
const M_TOP = 1 << 18;
const M_BOTTOM = 1 << 19;
const M_LEFT = 1 << 20;
const M_RIGHT = 1 << 21;
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
  };
}

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
): void {
  const { w, h } = state;
  const cx = coord(x, tile);
  const cy = coord(y, tile);
  const rect = (rx: number, ry: number, rw: number, rh: number, c: number) =>
    dr.drawRect({ x: rx, y: ry, w: rw, h: rh } satisfies Rect, c);

  const num = state.grid[y * w + x];

  // A finished rectangle shades whole, its number's square included; until
  // then the number sits on the lifted surface of a given.
  rect(cx, cy, tile + 1, tile + 1, COL_GRID);
  rect(
    cx + 1,
    cy + 1,
    tile - 1,
    tile - 1,
    tone
      ? winSlot(tone, COL_FLASH, COL_FLASH_LEAD)
      : bgflags & F_CORRECT
        ? COL_CORRECT
        : num
          ? COL_GIVEN
          : COL_CELL,
  );
  // The line or area the hint's sentence names, under the clue.
  if (bgflags & F_STRIPES)
    dr.drawHatch({ x: cx + 1, y: cy + 1, w: tile - 1, h: tile - 1 }, hatchPeriod(tile));

  if (num) {
    const { origin, options } = numberText(tile, x, y);
    dr.drawText(origin, options, COL_TEXT, String(num));
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
          ? colorOf(hedge[y * w + x])
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
          ? colorOf(hedge[(y + 1) * w + x])
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
          ? colorOf(vedge[y * w + x])
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
          ? colorOf(vedge[y * w + (x + 1)])
          : COL_LINE,
    );

  // Corners.
  if (corners[y * w + x]) rect(cx, cy, 2, 2, colorOf(corners[y * w + x]));
  if (x + 1 < w && corners[y * w + (x + 1)])
    rect(cx + tile - 1, cy, 2, 2, colorOf(corners[y * w + (x + 1)]));
  if (y + 1 < h && corners[(y + 1) * w + x])
    rect(cx, cy + tile - 1, 2, 2, colorOf(corners[(y + 1) * w + x]));
  if (x + 1 < w && y + 1 < h && corners[(y + 1) * w + (x + 1)])
    rect(cx + tile - 1, cy + tile - 1, 2, 2, colorOf(corners[(y + 1) * w + (x + 1)]));

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

/** Where the number of the square at `(x, y)` is written: read by the text
 * and by the rings near it. */
function numberText(
  tile: number,
  x: number,
  y: number,
): { origin: Point; options: DrawTextOptions } {
  return {
    origin: {
      x: coord(x, tile) + Math.floor(tile / 2),
      y: coord(y, tile) + Math.floor(tile / 2),
    },
    options: glyphFont(Math.floor(tile / 2)),
  };
}

/** The ink of the number in the square at `(x, y)`, none off the board. */
function numberBoxes(state: RectState, tile: number, x: number, y: number): Rect[] {
  if (x < 0 || y < 0 || x >= state.w || y >= state.h) return [];
  const num = state.grid[y * state.w + x];
  if (!num) return [];
  const { origin, options } = numberText(tile, x, y);
  return [textBox(origin, options, String(num))];
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

  // Wrong-edge overlay from findMistakes.
  const wrongH = new Uint8Array(w * h);
  const wrongV = new Uint8Array(w * h);
  if (mistakes) {
    for (const m of mistakes) {
      if (m.edge === "h") wrongH[m.y * w + m.x] = 1;
      else wrongV[m.y * w + m.x] = 1;
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
      if (state.correct[y * w + x]) c |= F_CORRECT;
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
      if (
        ds.visible[y * w + x] !== c ||
        ds.tone[y * w + x] !== tone ||
        ds.rings[y * w + x] !== ringKey
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
        );
        ds.visible[y * w + x] = c;
        ds.tone[y * w + x] = tone;
        ds.rings[y * w + x] = ringKey;
      }
    }
}
