/**
 * Rendering for Mines: a per-tile diffed loop over two flat surfaces. A
 * covered square is the lifted surface and an opened one the plain cell
 * surface, with the grid's thin line between them; the count digits, the flag
 * and the mine are the color on the board. Geometry uses upstream's
 * `NARROW_BORDERS` variant (see {@link borderFor}).
 *
 * The two ui-derived overlays — the mouse-down highlight radius and the "too
 * many flags" wrong-number tint — are folded into each tile's cache value `v`
 * (exactly as the C does), so they live *in* the diff key and repaint/clear on
 * their own frames (docs/rendering.md § "Prove the overlay repaints"). The
 * paint-twice test in `mines.test.ts` guards that.
 */

import { coord } from "../../engine/board/geometry.ts";
import {
  BLACK,
  BLUE,
  BLUE_BOLD,
  GRAY,
  GREEN,
  PINK,
  RED,
  RED_BOLD,
  TEAL,
  WHITE,
} from "../../engine/color/colors.ts";
import {
  cellSurface,
  ERROR_WASH,
  givenSurface,
  INK,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import {
  COL_ERROR,
  COL_HINT_OUTLINE,
  FIRST_GAME_SLOT,
  rolePalette,
} from "../../engine/color/roles.ts";
import type { GameDrawing, HintStep } from "../../engine/contract/game.ts";
import { CELL, stepMarks } from "../../engine/contract/hint-words.ts";
import type { Color, DrawTextOptions, Point } from "../../engine/contract/types.ts";
import {
  drawRectCorners,
  drawRectOutline,
  glyphFont,
} from "../../engine/render/draw.ts";
import { hatchPeriod } from "../../engine/render/hatch.ts";
import { drawMarkSides, MARK_ALL } from "../../engine/render/hint-mark.ts";
import { NOTHING_TO_CLEAR, textBox } from "../../engine/render/ring.ts";
import { TileCache } from "../../engine/render/tile-cache.ts";
import { type Flash, sweepStep, winSlot } from "../../engine/render/win-wave.ts";
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

// --- palette -------------------------------------------------------------
// The mine the player trod on, and every square on a death flash's lit beats,
// is `COL_ERROR`.
const COL_GRID = FIRST_GAME_SLOT; // the line between two squares, and the frame
export const COL_OPEN = FIRST_GAME_SLOT + 1; // the surface of an opened square
export const COL_COVERED = FIRST_GAME_SLOT + 2; // the surface of a covered square
const COL_MINE = FIRST_GAME_SLOT + 3;
const COL_MINE_GLINT = FIRST_GAME_SLOT + 4;
const COL_FLAG = FIRST_GAME_SLOT + 5;
const COL_FLAGBASE = FIRST_GAME_SLOT + 6;
const COL_QUERY = FIRST_GAME_SLOT + 7;
const COL_WRONGNUMBER = FIRST_GAME_SLOT + 8;
/** The cursor, in its own color (see its assignment). */
const COL_PINK_CURSOR = FIRST_GAME_SLOT + 9;
/** The eight count digits: count `n` is `COL_COUNT + n - 1`. */
const COL_COUNT = FIRST_GAME_SLOT + 10;

export function colors(bg: Color): Color[] {
  const out = rolePalette(bg);
  out[COL_GRID] = surfaceGrid(bg);
  out[COL_OPEN] = cellSurface(bg);
  // The one place the lifted surface says "covered" and not "given": nothing
  // on this board is the puzzle's piece or the player's, and a covered
  // square has to stand off an opened one at a glance in both schemes.
  out[COL_COVERED] = givenSurface(bg);
  // A black mine with a white glint in either scheme: it is drawn on the
  // error color and never on a surface.
  out[COL_MINE] = BLACK;
  out[COL_MINE_GLINT] = WHITE;
  // Red because a flag is yours and deliberate, not because anything is
  // wrong — but the same red, which is what the collection has one of.
  out[COL_FLAG] = RED;
  out[COL_FLAGBASE] = INK;
  out[COL_QUERY] = INK;
  out[COL_WRONGNUMBER] = ERROR_WASH;
  // Pink, not the cursor role's green: it has to read on an opened square and
  // a covered one alike, and the count digits have the rest spoken for.
  out[COL_PINK_CURSOR] = PINK;
  // Upstream's count colors, and by now most players' expectation of what a
  // minesweeper looks like: 1 blue, 2 green, 3 red, 4 navy, 5 maroon, 6 teal.
  // The two dark ones are why the palette has a bold step at all — a wash is a
  // fill, and these are digits.
  [BLUE, GREEN, RED, BLUE_BOLD, RED_BOLD, TEAL, INK, GRAY].forEach((c, k) => {
    out[COL_COUNT + k] = c;
  });
  return out;
}

export const PREFERRED_TILE_SIZE = 20;
export const FLASH_FRAME = 0.13;

/** The web build defines `NARROW_BORDERS`, so `BORDER = max(ts*3/20, 1)`
 * (mines.c:37) — not the desktop default of `ts*3/2`. */
export function borderFor(tileSize: number): number {
  return Math.max(Math.floor((tileSize * 3) / 20), 1);
}

export interface MinesDrawState {
  w: number;
  h: number;
  tileSize: number;
  /** What each square shows: its value `v` with its hint marks, its flash
   * fill and the cursor packed above it ({@link packTile}). */
  tiles: TileCache;
}

export function newDrawState(s: MinesState, tileSize: number): MinesDrawState {
  return {
    w: s.w,
    h: s.h,
    tileSize,
    tiles: new TileCache(s.w * s.h),
  };
}

export function computeSize(
  p: { w: number; h: number },
  tileSize: number,
): { w: number; h: number } {
  const border = borderFor(tileSize);
  return { w: border * 2 + tileSize * p.w, h: border * 2 + tileSize * p.h };
}

// --- one tile ------------------------------------------------------------

/** No flash is filling the square this frame. */
const NO_WASH = -1;

/** The square's surface, inside the grid line along its top and left. */
const face = (ts: number, x: number, y: number) => ({
  x: x + 1,
  y: y + 1,
  w: ts - 1,
  h: ts - 1,
});

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
 * pressed) with its hint marks above it, its flash fill (a palette slot) above
 * those, and the cursor at the top. */
function packTile(v: number, marks: number, wash: number, cursor: boolean): number {
  return (v + 128) | (marks << 8) | ((wash - NO_WASH) << 12) | (cursor ? 1 << 24 : 0);
}

/** Stripes across the tile's face, under its glyph. */
function drawStripes(
  dr: GameDrawing,
  ts: number,
  x: number,
  y: number,
  marks: number,
): void {
  if (marks & MARK_STRIPES) dr.drawHatch(face(ts, x, y), hatchPeriod(ts));
}

/** The glyph a square of value `v` shows at (`x`, `y`): a count's digit, or
 * a query's mark; `null` for a square with none. */
function glyph(
  ts: number,
  x: number,
  y: number,
  v: number,
): { origin: Point; options: DrawTextOptions; text: string } | null {
  const origin = { x: x + Math.floor(ts / 2), y: y + Math.floor(ts / 2) };
  if (v === QUERY)
    return { origin, options: glyphFont(Math.floor((ts * 6) / 8)), text: "?" };
  if (v > 0 && v <= 8)
    return { origin, options: glyphFont(Math.floor((ts * 7) / 8)), text: String(v) };
  return null;
}

/** A ring, an outline or a mistake's frame at the edge of the tile's face, over
 * everything it draws. The check refuses a hint while it finds a mistake, so a
 * frame never shares a tile with a hint's mark. */
function drawBand(
  dr: GameDrawing,
  ts: number,
  x: number,
  y: number,
  v: number,
  marks: number,
): void {
  const band = { box: face(ts, x, y), outer: 0, inner: Math.max(2, ts >> 3) };
  if (marks & MARK_RING) {
    const g = glyph(ts, x, y, v);
    const clear = g
      ? { enclose: [textBox(g.origin, g.options, g.text)], avoid: [] }
      : NOTHING_TO_CLEAR;
    dr.drawRing(band.box, clear, band.inner);
  } else if (marks & MARK_OUTLINE) drawMarkSides(dr, band, MARK_ALL, COL_HINT_OUTLINE);
  else if (marks & MARK_MISTAKE) drawMarkSides(dr, band, MARK_ALL, COL_ERROR);
}

function drawTile(
  dr: GameDrawing,
  ts: number,
  x: number,
  y: number,
  v: number,
  /** The flash's fill for this square this frame, or {@link NO_WASH}. */
  wash: number,
  cursor: boolean,
  marks: number,
): void {
  // A square repaints alone, so nothing it draws may reach its neighbor: a
  // thick stroke at its edge is antialiased a pixel past it.
  dr.clip({ x, y, w: ts, h: ts });
  // The grid line along the top and left; the next square, or the frame,
  // closes the other two sides.
  dr.drawRect({ x, y, w: ts, h: ts }, COL_GRID);
  const fill = (surface: number): void =>
    dr.drawRect(face(ts, x, y), wash === NO_WASH ? surface : wash);

  if (v < 0) {
    const coords: number[] = [];
    if (v === -22 || v === -23 || v === -24) {
      v += 20;
      // Pressed: the surface it will have once opened.
      fill(COL_OPEN);
    } else {
      fill(COL_COVERED);
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
      const g = glyph(ts, x, y, v);
      if (g) dr.drawText(g.origin, g.options, COL_QUERY, g.text);
    }
  } else {
    // Open tile. `v | 32` is the too-many-flags wrong-number tint, and the
    // mine the player trod on keeps its red through a flash.
    const tinted = (v & 32) !== 0;
    v &= ~32;
    if (v === KILLED) dr.drawRect(face(ts, x, y), COL_ERROR);
    else fill(tinted ? COL_WRONGNUMBER : COL_OPEN);
    drawStripes(dr, ts, x, y, marks);

    const g = glyph(ts, x, y, v);
    if (g) {
      dr.drawText(g.origin, g.options, COL_COUNT - 1 + v, g.text);
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
        COL_MINE_GLINT,
      );
    }
  }

  // Corner brackets, so the square under the cursor still says whether it is
  // covered.
  if (cursor)
    drawRectCorners(
      dr,
      x + Math.floor(ts / 2),
      y + Math.floor(ts / 2),
      Math.floor(ts / 2) - 2,
      COL_PINK_CURSOR,
      Math.max(2, ts >> 4),
    );
  drawBand(dr, ts, x, y, v, marks);
  dr.unclip();
  dr.drawUpdate({ x, y, w: ts, h: ts });
}

// --- full redraw -----------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: MinesDrawState,
  _prev: MinesState | null,
  s: MinesState,
  _dir: number,
  ui: MinesUi,
  _animTime: number,
  flash: Flash,
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

  // On a death flash's lit beats every square takes the error color.
  const dead = flash.time > 0 && Math.floor(flash.time / FLASH_FRAME) % 2 === 0;

  if (ds.tiles.firstFrame()) {
    // The frame, no heavier than a grid line: each square draws the line along
    // its own top and left, and this closes the right and the bottom.
    drawRectOutline(dr, cx0(0), cx0(0), s.w * ts + 1, s.h * ts + 1, COL_GRID);
  }

  const cursorX = ui.cursor.visible ? ui.cursor.x : -1;
  const cursorY = ui.cursor.visible ? ui.cursor.y : -1;

  for (let y = 0; y < ds.h; y++) {
    for (let x = 0; x < ds.w; x++) {
      let v = s.grid[y * ds.w + x];

      if (v >= 0 && v <= 8) {
        // Too many flags around a number: tint it.
        const near = around(ds.w, ds.h, x, y);
        if (near.filter((q) => s.grid[q.y * ds.w + q.x] === FLAG).length > v) v |= 32;
      }

      if (
        (v === COVERED || v === QUERY) &&
        Math.abs(x - ui.hx) <= ui.hradius &&
        Math.abs(y - ui.hy) <= ui.hradius
      ) {
        v -= 20;
      }

      const key = `${x},${y}`;
      const marks =
        (ring.has(key) ? MARK_RING : 0) |
        (outline.has(key) ? MARK_OUTLINE : 0) |
        (stripes.has(key) ? MARK_STRIPES : 0) |
        (wrong.has(key) ? MARK_MISTAKE : 0);
      const tone = flash.win(sweepStep(x, y));
      const wash = dead ? COL_ERROR : tone ? winSlot(tone) : NO_WASH;
      const cursor = x === cursorX && y === cursorY;
      if (ds.tiles.changed(y * ds.w + x, packTile(v, marks, wash, cursor)))
        drawTile(dr, ts, cx0(x), cx0(y), v, wash, cursor, marks);
    }
  }
}
