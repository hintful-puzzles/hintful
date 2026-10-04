/**
 * Flip's renderer: the two-faced tiles, the diagonal marks that show which
 * neighbors a click will flip, the cursor ring, the win flash and the hint's
 * marks.
 */

import { WHITE } from "../../engine/color/colors.ts";
import {
  CURSOR,
  GRID_MID,
  HINT_ACTION,
  HINT_EVIDENCE,
} from "../../engine/color/palette.ts";
import { flipWrongFace } from "../../engine/color/palette-games.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { drawMarkSides, type MarkBand, MarkOutlines } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import type { FlipMove, FlipParams, FlipState, FlipUi } from "./state.ts";

export interface FlipDrawState {
  started: boolean;
  tileSize: number;
  /** Per-cell render cache: the bits `drawTile` last drew (the grid's, plus 4
   * for the cursor, the hint marks' sides from {@link MARK_SHIFT} up, and
   * {@link STRIPED}); -1 = never drawn, {@link ANIMATING} mid-flip. */
  tiles: Int32Array;
}

/** The cache entry of a tile mid-flip, which repaints on every frame. */
const ANIMATING = 255;
/** Where a tile's hint mark sides (`MarkOutlines.packed`) sit in its cache
 * entry, above {@link ANIMATING}. */
const MARK_SHIFT = 8;
/** A square the hint's words stripe, above the byte of mark sides. */
const STRIPED = 1 << 16;

// Color palette indices (upstream's enum).
const COL_BACKGROUND = 0;
const COL_WRONG = 1;
const COL_RIGHT = 2;
const COL_GRID = 3;
const COL_DIAG = 4;
const COL_CURSOR = 5;
export const COL_HINT = 6; // the square to press, ringed; what else it flips, striped
export const COL_HINT_CELL = 7; // the dark squares the press is for: outlined
const NCOLORS = 8;

export const PREFERRED_TILE_SIZE = 48;
export const ANIM_TIME = 0.25;
export const FLASH_FRAME = 0.07;

/** The board's pixel origin: half a tile on every side. `interpretMove` reads it
 * too, so input and drawing cannot disagree. */
export function border(tileSize: number): number {
  return tileSize >> 1;
}

export function newDrawState(s: FlipState, tileSize: number): FlipDrawState {
  return {
    started: false,
    tileSize,
    tiles: new Int32Array(s.w * s.h).fill(-1),
  };
}

export function colors(defaultBackground: Color): Color[] {
  const bg = defaultBackground;
  const ret: Color[] = new Array(NCOLORS);
  ret[COL_BACKGROUND] = bg;
  ret[COL_WRONG] = flipWrongFace(bg);
  // A lit square *is* light, in either scheme: the goal is to light them all.
  ret[COL_RIGHT] = WHITE;
  // The mid step, not the dark one: the diagonal marks sit on both the
  // paper face and the dark face, and only a mid gray shows on each.
  ret[COL_GRID] = GRID_MID;
  ret[COL_DIAG] = ret[COL_GRID];
  ret[COL_CURSOR] = CURSOR;
  ret[COL_HINT] = HINT_ACTION;
  ret[COL_HINT_CELL] = HINT_EVIDENCE;
  return ret;
}

export function computeSize(p: FlipParams, tileSize: number): Size {
  const b = border(tileSize);
  return {
    w: tileSize * p.w + 2 * b,
    h: tileSize * p.h + 2 * b,
  };
}

export function redraw(
  dr: GameDrawing,
  ds: FlipDrawState,
  prev: FlipState | null,
  s: FlipState,
  _dir: number,
  ui: FlipUi,
  animTime: number,
  flashTime: number,
  hint?: HintStep<FlipMove>,
): void {
  const { w, h } = s;
  const wh = w * h;
  const tile = ds.tileSize;
  const b = border(tile);

  if (!ds.started) {
    for (let i = 0; i <= w; i++) {
      dr.drawLine(
        { x: i * tile + b, y: b },
        { x: i * tile + b, y: h * tile + b },
        COL_GRID,
        1,
      );
    }
    for (let i = 0; i <= h; i++) {
      dr.drawLine(
        { x: b, y: i * tile + b },
        { x: w * tile + b, y: i * tile + b },
        COL_GRID,
        1,
      );
    }
    ds.started = true;
  }

  const flashFrame = flashTime ? Math.floor(flashTime / FLASH_FRAME) : -1;
  const progress = animTime / ANIM_TIME;
  // A light that changed since `prev` is mid-flip, keyed 255 so it redraws every
  // frame; with animTime 0 the final state is drawn and `prev` is irrelevant.
  const animating = animTime > 0 && prev != null;

  const named = stepMarks(hint);
  const marks = new MarkOutlines(named.of("ring", CELL), named.of("outline", CELL), {});
  const striped = new Set(named.of("stripes", CELL).map((p) => p.y * w + p.x));

  for (let i = 0; i < wh; i++) {
    const x = i % w;
    const y = (i / w) | 0;
    let v = s.grid[i];
    if (flashFrame >= 0) {
      const fx = (((w + 1) / 2) | 0) - Math.min(x + 1, w - x);
      const fy = (((h + 1) / 2) | 0) - Math.min(y + 1, h - y);
      const fd = Math.max(fx, fy);
      if (fd === flashFrame) v |= 1;
      else if (fd === flashFrame - 1) v &= ~1;
    }
    if (ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y) v |= 4;

    const flipping = animating && prev !== null && s.grid[i] !== prev.grid[i];
    const stripes = striped.has(i);
    const drawn =
      (stripes ? STRIPED : 0) |
      (marks.packed(x, y) << MARK_SHIFT) |
      (flipping ? ANIMATING : v);
    if (flipping || ds.tiles[i] !== drawn) {
      drawTile(dr, ds, s, x, y, v, flipping, progress, marks, stripes);
      ds.tiles[i] = drawn;
    }
  }
}

function drawTile(
  dr: GameDrawing,
  ds: FlipDrawState,
  s: FlipState,
  x: number,
  y: number,
  v: number,
  anim: boolean,
  progress: number,
  marks: MarkOutlines,
  stripes: boolean,
): void {
  const { w, h } = s;
  const wh = w * h;
  const ts = ds.tileSize;
  const bx = x * ts + border(ts);
  const by = y * ts + border(ts);
  const dcol = v & 4 ? COL_CURSOR : COL_DIAG;

  dr.clip({ x: bx + 1, y: by + 1, w: ts - 1, h: ts - 1 });
  dr.drawRect(
    { x: bx + 1, y: by + 1, w: ts - 1, h: ts - 1 },
    anim ? COL_BACKGROUND : v & 1 ? COL_WRONG : COL_RIGHT,
  );

  if (anim) {
    const at = Math.floor(ts * progress);
    const coords: Point[] = [
      { x: bx + ts, y: by },
      { x: bx + at, y: by + at },
      { x: bx, y: by + ts },
      { x: bx + ts - at, y: by + ts - at },
    ];
    let color = v & 1 ? COL_WRONG : COL_RIGHT;
    if (progress < 0.5) color = COL_WRONG + COL_RIGHT - color;
    dr.drawPolygon(coords, color, COL_GRID);
  }

  // Under the diagram, which is drawn over the bands and stays readable.
  if (stripes)
    dr.drawHatch(
      { x: bx + 1, y: by + 1, w: ts - 1, h: ts - 1 },
      COL_HINT,
      hatchPeriod(ts),
    );

  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (!s.matrix[(y * w + x) * wh + i * w + j]) continue;
      const ox = j - x;
      const oy = i - y;
      const td = Math.max(1, (ts / 16) | 0);
      const cx = bx + ((ts / 2) | 0) + (2 * ox - 1) * td;
      const cy = by + ((ts / 2) | 0) + (2 * oy - 1) * td;
      if (ox === 0 && oy === 0) {
        dr.drawRect({ x: cx, y: cy, w: 2 * td + 1, h: 2 * td + 1 }, dcol);
      } else {
        dr.drawLine({ x: cx, y: cy }, { x: cx + 2 * td, y: cy }, dcol, 1);
        dr.drawLine(
          { x: cx, y: cy + 2 * td },
          { x: cx + 2 * td, y: cy + 2 * td },
          dcol,
          1,
        );
        dr.drawLine({ x: cx, y: cy }, { x: cx, y: cy + 2 * td }, dcol, 1);
        dr.drawLine(
          { x: cx + 2 * td, y: cy },
          { x: cx + 2 * td, y: cy + 2 * td },
          dcol,
          1,
        );
      }
    }
  }

  // The hint's marks, on the tile's own edge and clear of the diagram in its
  // middle. The ring last, so it wins a square that is both.
  const band: MarkBand = {
    box: { x: bx + 1, y: by + 1, w: ts - 1, h: ts - 1 },
    outer: 0,
    inner: Math.max(2, ts >> 4),
  };
  drawMarkSides(dr, band, marks.evidenceSides(x, y), COL_HINT_CELL);
  drawMarkSides(dr, band, marks.targetSides(x, y), COL_HINT);

  dr.unclip();
  dr.drawUpdate({ x: bx + 1, y: by + 1, w: ts - 1, h: ts - 1 });
}
