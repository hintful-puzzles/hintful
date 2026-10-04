/**
 * Rendering for Mines (`game_redraw` + `draw_tile`, mines.c:2976/3119).
 *
 * The palette is index-for-index with the C `enum`. Geometry uses the web
 * build's `NARROW_BORDERS` variant (see {@link borderFor}), since that is what
 * the browser actually showed.
 *
 * The two ui-derived overlays — the mouse-down highlight radius and the "too
 * many flags" wrong-number tint — are folded into each tile's cache value `v`
 * (exactly as the C does), so they live *in* the diff key and repaint/clear on
 * their own frames (docs/games/rendering.md § "Prove the overlay repaints"). The
 * paint-twice test in `mines.test.ts` guards that.
 */

import { drawRaisedTile, drawRecessedBorder, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { coord } from "../../engine/geometry.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { drawMarkSides, MARK_ALL } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { MinesHint } from "./hint.ts";
import {
  around,
  COVERED,
  FLAG,
  KILLED,
  type MinesMove,
  type MinesState,
  type MinesUi,
  QUERY,
} from "./state.ts";

// --- palette (upstream enum order, mines.c:24) -------------------------
export const COL_BACKGROUND = 0;
export const COL_BACKGROUND2 = 1;
export const COL_1 = 2;
export const COL_2 = 3;
export const COL_3 = 4;
export const COL_4 = 5;
export const COL_5 = 6;
export const COL_6 = 7;
export const COL_7 = 8;
export const COL_8 = 9;
export const COL_MINE = 10;
export const COL_BANG = 11;
export const COL_FLAG = 12;
export const COL_FLAGBASE = 13;
export const COL_QUERY = 14;
export const COL_HIGHLIGHT = 15;
export const COL_LOWLIGHT = 16;
export const COL_WRONGNUMBER = 17;
export const COL_CURSOR = 18;
/** What a hint step decides: the ring on its border. */
export const COL_HINT = 19;
/** What a hint step reasons from: the outline on its border. */
export const COL_HINT_EVIDENCE = 20;
export const NCOLORS = 21;

export const PREFERRED_TILE_SIZE = 20;
export const FLASH_FRAME = 0.13;

/** A covered square's tile value when it shows the "start here" cross. */
const START = -4;

/** The web build defines `NARROW_BORDERS`, so `BORDER = max(ts*3/20, 1)`
 * (mines.c:37) — not the desktop default of `ts*3/2`. */
export function borderFor(tileSize: number): number {
  return Math.max(Math.floor((tileSize * 3) / 20), 1);
}

export interface MinesDrawState {
  w: number;
  h: number;
  tileSize: number;
  started: boolean;
  /** Per-tile cache of the last-drawn value `v` with the tile's hint marks
   * packed above it ({@link packTile}; -1 = never drawn). */
  grid: Int32Array;
  /** Last-drawn flash background color index (-1 = undecided). */
  bg: number;
  /** Last-drawn cursor cell (-1,-1 = none), for the cursor-moved repaint. */
  curX: number;
  curY: number;
}

export function newDrawState(s: MinesState, tileSize: number): MinesDrawState {
  return {
    w: s.w,
    h: s.h,
    tileSize,
    started: false,
    grid: new Int32Array(s.w * s.h).fill(-1),
    bg: -1,
    curX: -1,
    curY: -1,
  };
}

export function computeSize(
  p: { w: number; h: number },
  tileSize: number,
): { w: number; h: number } {
  const border = borderFor(tileSize);
  return { w: border * 2 + tileSize * p.w, h: border * 2 + tileSize * p.h };
}

// --- one tile (upstream draw_tile, mines.c:2976) -----------------------

function setcoord(
  coords: number[],
  n: number,
  x: number,
  y: number,
  ts: number,
  dx: number,
  dy: number,
): void {
  coords[n * 2 + 0] = x + Math.trunc(ts * dx);
  coords[n * 2 + 1] = y + Math.trunc(ts * dy);
}

function poly(flat: number[], count: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < count; i++) pts.push({ x: flat[i * 2], y: flat[i * 2 + 1] });
  return pts;
}

/** A tile's part in the displayed hint. */
const MARK_RING = 1;
const MARK_OUTLINE = 2;
const MARK_STRIPES = 4;
/** A flag the check found on a square with no mine. */
const MARK_MISTAKE = 8;

/** The draw cache's key: the tile's value `v` (which reaches 66, and -24 when
 * pressed) with its hint marks above it. */
function packTile(v: number, marks: number): number {
  return (v + 128) | (marks << 8);
}

/** Stripes across the tile's face, under its glyph. */
function drawStripes(
  dr: GameDrawing,
  ts: number,
  x: number,
  y: number,
  marks: number,
): void {
  if (marks & MARK_STRIPES)
    dr.drawHatch(
      { x: x + 1, y: y + 1, w: ts - 2, h: ts - 2 },
      COL_HINT,
      hatchPeriod(ts),
    );
}

/** A ring, an outline or a mistake's frame on the tile's border, over
 * everything it draws. The check refuses a hint while it finds a mistake, so a
 * frame never shares a tile with a hint's mark. */
function drawBand(
  dr: GameDrawing,
  ts: number,
  x: number,
  y: number,
  marks: number,
): void {
  const band = { box: { x, y, w: ts, h: ts }, outer: 0, inner: Math.max(2, ts >> 3) };
  if (marks & MARK_RING) drawMarkSides(dr, band, MARK_ALL, COL_HINT);
  else if (marks & MARK_OUTLINE) drawMarkSides(dr, band, MARK_ALL, COL_HINT_EVIDENCE);
  else if (marks & MARK_MISTAKE) drawMarkSides(dr, band, MARK_ALL, COL_BANG);
}

function drawTile(
  dr: GameDrawing,
  ts: number,
  x: number,
  y: number,
  v: number,
  bg: number,
  marks: number,
): void {
  if (v < 0) {
    const coords: number[] = [];
    if (v === -22 || v === -23 || v === -24) {
      v += 20;
      // Highlighted (pressed): flat fill, no bevel.
      dr.drawRect({ x, y, w: ts, h: ts }, bg === COL_BACKGROUND ? COL_BACKGROUND2 : bg);
      dr.drawLine({ x, y }, { x: x + ts - 1, y }, COL_LOWLIGHT, 1);
      dr.drawLine({ x, y }, { x, y: y + ts - 1 }, COL_LOWLIGHT, 1);
    } else {
      // Raised (covered) tile.
      drawRaisedTile(dr, { x, y, w: ts, h: ts }, ts, bg, COL_HIGHLIGHT, COL_LOWLIGHT);
    }
    drawStripes(dr, ts, x, y, marks);

    if (v === FLAG) {
      setcoord(coords, 0, x, y, ts, 0.6, 0.35);
      setcoord(coords, 1, x, y, ts, 0.6, 0.7);
      setcoord(coords, 2, x, y, ts, 0.8, 0.8);
      setcoord(coords, 3, x, y, ts, 0.25, 0.8);
      setcoord(coords, 4, x, y, ts, 0.55, 0.7);
      setcoord(coords, 5, x, y, ts, 0.55, 0.35);
      dr.drawPolygon(poly(coords, 6), COL_FLAGBASE, COL_FLAGBASE);
      setcoord(coords, 0, x, y, ts, 0.6, 0.2);
      setcoord(coords, 1, x, y, ts, 0.6, 0.5);
      setcoord(coords, 2, x, y, ts, 0.2, 0.35);
      dr.drawPolygon(poly(coords, 3), COL_FLAG, COL_FLAG);
    } else if (v === QUERY) {
      // A question mark (this frontend never sets one, but be faithful).
      dr.drawText(
        { x: x + Math.floor(ts / 2), y: y + Math.floor(ts / 2) },
        glyphFont(Math.floor((ts * 6) / 8)),
        COL_QUERY,
        "?",
      );
    } else if (v === START) {
      // The 'click here' cross marking the safe first-click location.
      const c0 = Math.floor(ts / 4);
      const c1 = ts - 1 - c0;
      dr.drawLine({ x: x + c0, y: y + c0 }, { x: x + c1, y: y + c1 }, COL_MINE, 1);
      dr.drawLine({ x: x + c0, y: y + c1 }, { x: x + c1, y: y + c0 }, COL_MINE, 1);
    }
  } else {
    // Open tile. `v | 32` is the too-many-flags wrong-number tint.
    let bgcol = bg;
    if (v & 32) {
      bgcol = COL_WRONGNUMBER;
      v &= ~32;
    }
    dr.drawRect(
      { x, y, w: ts, h: ts },
      v === KILLED ? COL_BANG : bgcol === COL_BACKGROUND ? COL_BACKGROUND2 : bgcol,
    );
    dr.drawLine({ x, y }, { x: x + ts - 1, y }, COL_LOWLIGHT, 1);
    dr.drawLine({ x, y }, { x, y: y + ts - 1 }, COL_LOWLIGHT, 1);
    drawStripes(dr, ts, x, y, marks);

    if (v > 0 && v <= 8) {
      dr.drawText(
        { x: x + Math.floor(ts / 2), y: y + Math.floor(ts / 2) },
        glyphFont(Math.floor((ts * 7) / 8)),
        COL_1 - 1 + v,
        String(v),
      );
    } else if (v === KILLED) {
      const cx = x + Math.floor(ts / 2);
      const cy = y + Math.floor(ts / 2);
      const r = Math.floor(ts / 2) - 3;
      dr.drawCircle({ x: cx, y: cy }, Math.floor((5 * r) / 6), COL_MINE, COL_MINE);
      dr.drawRect(
        {
          x: cx - Math.floor(r / 6),
          y: cy - r,
          w: 2 * Math.floor(r / 6) + 1,
          h: 2 * r + 1,
        },
        COL_MINE,
      );
      dr.drawRect(
        {
          x: cx - r,
          y: cy - Math.floor(r / 6),
          w: 2 * r + 1,
          h: 2 * Math.floor(r / 6) + 1,
        },
        COL_MINE,
      );
      dr.drawRect(
        {
          x: cx - Math.floor(r / 3),
          y: cy - Math.floor(r / 3),
          w: Math.floor(r / 3),
          h: Math.floor(r / 4),
        },
        COL_HIGHLIGHT,
      );
    }
  }

  drawBand(dr, ts, x, y, marks);
  dr.drawUpdate({ x, y, w: ts, h: ts });
}

// --- full redraw (upstream game_redraw, mines.c:3119) ------------------

export function redraw(
  dr: GameDrawing,
  ds: MinesDrawState,
  _prev: MinesState | null,
  s: MinesState,
  _dir: number,
  ui: MinesUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<MinesMove, MinesHint>,
  mistakes?: readonly Point[],
): void {
  const ts = ds.tileSize;
  const border = borderFor(ts);
  const cx0 = (x: number) => coord(x, ts, border);

  // Every hint mark comes from the step's words, and from nowhere else.
  const words = stepMarks(hint);
  const keys = (role: "ring" | "outline" | "stripes"): Set<string> =>
    new Set(words.of(role, CELL).map((p) => `${p.x},${p.y}`));
  const ring = keys("ring");
  const outline = keys("outline");
  const stripes = keys("stripes");
  const wrong = new Set((mistakes ?? []).map((p) => `${p.x},${p.y}`));

  let bg: number;
  if (flashTime) {
    const frame = Math.floor(flashTime / FLASH_FRAME);
    if (frame % 2) bg = ui.flashIsDeath ? COL_BACKGROUND : COL_LOWLIGHT;
    else bg = ui.flashIsDeath ? COL_BANG : COL_HIGHLIGHT;
  } else {
    bg = COL_BACKGROUND;
  }

  if (!ds.started) {
    // Recessed area framing the whole puzzle.
    const ohw = Math.max(border - 1, 1); // upstream's OUTER_HIGHLIGHT_WIDTH
    drawRecessedBorder(
      dr,
      {
        left: cx0(0) - ohw,
        top: cx0(0) - ohw,
        right: cx0(s.w) + ohw - 1,
        bottom: cx0(s.h) + ohw - 1,
      },
      ts,
      COL_HIGHLIGHT,
      COL_LOWLIGHT,
    );
    ds.started = true;
  }

  const cursorX = ui.cursor.visible ? ui.cursor.x : -1;
  const cursorY = ui.cursor.visible ? ui.cursor.y : -1;
  const cmoved = cursorX !== ds.curX || cursorY !== ds.curY;

  for (let y = 0; y < ds.h; y++) {
    for (let x = 0; x < ds.w; x++) {
      let v = s.grid[y * ds.w + x];

      if (v >= 0 && v <= 8) {
        // Too many flags around a number: tint it.
        const near = around(ds.w, ds.h, x, y);
        if (near.filter((q) => s.grid[q.y * ds.w + q.x] === FLAG).length > v) v |= 32;
      }

      if (v === COVERED && x === s.layout.startx && y === s.layout.starty) v = START;

      if (
        (v === COVERED || v === QUERY || v === START) &&
        Math.abs(x - ui.hx) <= ui.hradius &&
        Math.abs(y - ui.hy) <= ui.hradius
      ) {
        v -= 20;
      }

      const cc =
        cmoved &&
        ((x === cursorX && y === cursorY) || (x === ds.curX && y === ds.curY));

      const key = `${x},${y}`;
      const marks =
        (ring.has(key) ? MARK_RING : 0) |
        (outline.has(key) ? MARK_OUTLINE : 0) |
        (stripes.has(key) ? MARK_STRIPES : 0) |
        (wrong.has(key) ? MARK_MISTAKE : 0);
      const packed = packTile(v, marks);
      if (ds.grid[y * ds.w + x] !== packed || bg !== ds.bg || cc) {
        drawTile(
          dr,
          ts,
          cx0(x),
          cx0(y),
          v,
          x === cursorX && y === cursorY ? COL_CURSOR : bg,
          marks,
        );
        ds.grid[y * ds.w + x] = packed;
      }
    }
  }
  ds.bg = bg;
  ds.curX = cursorX;
  ds.curY = cursorY;
}
