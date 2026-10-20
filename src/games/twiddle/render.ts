/**
 * Twiddle rendering: beveled numbered tiles, the block rotation animation with
 * each tile's bevel edges recolored through the turn, the cursor region
 * outline, and the win flash on a tile's face. Port of upstream `game_redraw` /
 * `draw_tile` / `rotate` / `highlight_colour`.
 */

import {
  CURSOR,
  cellSurface,
  FLASH,
  FLASH_LEAD,
  givenSurface,
  HINT_OUTLINE,
  HINT_RING,
  INK,
} from "../../engine/color/palette.ts";
import {
  twiddleGentleHighlight,
  twiddleGentleLowlight,
} from "../../engine/color/palette-games.ts";
import { drawRecessedBorder, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { coord as coordE } from "../../engine/geometry.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import type { Color, Point, Rect, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, winSlot } from "../../engine/win-wave.ts";
import { BLOCK, LIFTED, TILE } from "./hint-text.ts";
import type { TwiddleMove, TwiddleState, TwiddleUi } from "./state.ts";

// --- constants --------------------------------------------------------

export const PREFERRED_TILE_SIZE = 48;
export const ANIM_PER_BLKSIZE_UNIT = 0.13;

const HIGHLIGHT_WIDTH_DIV = 20;

// --- color indices ---------------------------------------------------

export const COL_BACKGROUND = 0;
export const COL_TEXT = 1;
export const COL_HIGHLIGHT = 2;
export const COL_HIGHLIGHT_GENTLE = 3;
export const COL_LOWLIGHT = 4;
export const COL_LOWLIGHT_GENTLE = 5;
export const COL_HIGHCURSOR = 6;
export const COL_LOWCURSOR = 7;
/** A tile's face: the lifted surface, so the object the player moves stands
 * off the well it turns in, in both schemes. */
export const COL_TILE = 8;
/** The well: what a turning block uncovers. */
export const COL_WELL = 9;
/** The face of a tile the win flash is on. */
export const COL_FLASH = 10;
/** The face of a tile the win flash's leading edge is on. */
export const COL_FLASH_LEAD = 11;
/** The hint's ring: the block to turn. */
export const COL_HINT = 12;
/** The hint's outline: the tile it serves, and the square a run brings it to. */
export const COL_HINT_EVIDENCE = 13;
/** The dot at every block's pivot: the cursor's color, which marks where a
 * click acts. */
export const COL_PIVOT = 14;
export const NCOLORS = 15;

// --- cursor edge flags ------------------------------------------------

const CUR_TOP = 1;
const CUR_RIGHT = 2;
const CUR_BOTTOM = 4;
const CUR_LEFT = 8;
/** Beside the four side bits, which carry the hint's ring: the outline. */
const MARK_OUTLINE = 16;
/** And the stripes: a finished tile a run lifts out, or that comes back. */
const MARK_STRIPES = 32;

// --- geometry ---------------------------------------------------------

export function border(ts: number): number {
  return Math.floor(ts / 2);
}

export function coord(pos: number, ts: number): number {
  return coordE(pos, ts, border(ts));
}

function highlightWidth(ts: number): number {
  return Math.max(1, Math.floor(ts / HIGHLIGHT_WIDTH_DIV));
}

export function computeSize(p: Size, ts: number): Size {
  const b = border(ts);
  return { w: ts * p.w + 2 * b, h: ts * p.h + 2 * b };
}

/** Animation duration for a rotation of an `n×n` block. */
export function animLength(n: number): number {
  return ANIM_PER_BLKSIZE_UNIT * Math.sqrt(n - 1);
}

// --- draw state -------------------------------------------------------

export interface TwiddleDrawState {
  started: boolean;
  /** Per-cell cache of the win flash's tone on the tile, above its two bits
   * the hint's six mark bits, above those the four sides of a cursor or hover
   * outline, and above those the packed `number*4 + orient`; `-1` forces a
   * redraw (unknown, or inside the animating block). */
  cache: Int32Array;
  tileSize: number;
}

export function newDrawState(state: TwiddleState, tileSize: number): TwiddleDrawState {
  return {
    started: false,
    cache: new Int32Array(state.w * state.h).fill(-1),
    tileSize,
  };
}

// --- rotation ---------------------------------------------------------

/** The block turning mid-animation. */
interface Rotation {
  /** The block's pixel rect, which each of its tiles is clipped to. */
  block: Rect;
  /** The center of rotation. */
  ox: number;
  oy: number;
  cos: number;
  sin: number;
  leftColor: number;
  rightColor: number;
  topColor: number;
  bottomColor: number;
}

/** Rotate a point about the rotation center, rounding to nearest; the
 * identity when `rot` is null. */
function rotate(px: number, py: number, rot: Rotation | null): Point {
  if (!rot) return { x: px, y: py };
  const xf = px - rot.ox;
  const yf = py - rot.oy;
  const xf2 = rot.cos * xf + rot.sin * yf;
  const yf2 = -rot.sin * xf + rot.cos * yf;
  return { x: Math.round(xf2 + rot.ox), y: Math.round(yf2 + rot.oy) };
}

/** Upstream `highlight_colour`: the bevel color of an edge facing `angle`
 * radians, in 32 steps round the circle, so the four sides of a turning tile
 * recolor smoothly. Lit facing up and left, shaded facing down and right,
 * gentle in between. */
function highlightColor(angle: number): number {
  const step = Math.floor((angle + 2 * Math.PI) / (Math.PI / 16)) & 31;
  if (step >= 7 && step <= 16) return COL_HIGHLIGHT;
  if (step >= 4 && step <= 19) return COL_HIGHLIGHT_GENTLE;
  if (step >= 1 && step <= 22) return COL_LOWLIGHT_GENTLE;
  return COL_LOWLIGHT;
}

// --- tile drawing -----------------------------------------------------

function drawTile(
  dr: GameDrawing,
  ts: number,
  hw: number,
  orientable: boolean,
  px: number,
  py: number,
  num: number,
  orient: number,
  face: number,
  rot: Rotation | null,
  cedges: number,
  marks: number,
): void {
  if (rot) dr.clip(rot.block);

  // The four bevel edges, each a triangle from a pair of corners to the
  // center. During a rotation they all differ in color.
  const center = rotate(px + ts / 2, py + ts / 2, rot);
  const c00 = rotate(px, py, rot);
  const c10 = rotate(px + ts - 1, py, rot);
  const c11 = rotate(px + ts - 1, py + ts - 1, rot);
  const c01 = rotate(px, py + ts - 1, rot);

  // Right side.
  const right = rot ? rot.rightColor : COL_LOWLIGHT;
  dr.drawPolygon([c11, c10, center], right, right);
  // Bottom side.
  const bottom = rot ? rot.bottomColor : COL_LOWLIGHT;
  dr.drawPolygon([c11, c01, center], bottom, bottom);
  // Left side.
  const left = rot ? rot.leftColor : COL_HIGHLIGHT;
  dr.drawPolygon([c00, c01, center], left, left);
  // Top side.
  const top = rot ? rot.topColor : COL_HIGHLIGHT;
  dr.drawPolygon([c00, c10, center], top, top);

  // The blank center area.
  if (rot) {
    dr.drawPolygon(
      [
        rotate(px + hw, py + hw, rot),
        rotate(px + hw, py + ts - 1 - hw, rot),
        rotate(px + ts - 1 - hw, py + ts - 1 - hw, rot),
        rotate(px + ts - 1 - hw, py + hw, rot),
      ],
      face,
      face,
    );
  } else {
    dr.drawRect({ x: px + hw, y: py + hw, w: ts - 2 * hw, h: ts - 2 * hw }, face);
  }

  // Orientation triangle.
  if (orientable) {
    let xdx: number;
    let xdy: number;
    let ydx: number;
    let ydy: number;
    switch (orient & 3) {
      case 1:
        xdx = 0;
        xdy = -1;
        ydx = 1;
        ydy = 0;
        break;
      case 2:
        xdx = -1;
        xdy = 0;
        ydx = 0;
        ydy = -1;
        break;
      case 3:
        xdx = 0;
        xdy = 1;
        ydx = -1;
        ydy = 0;
        break;
      default: // 0
        xdx = 1;
        xdy = 0;
        ydx = 0;
        ydy = 1;
        break;
    }
    const cx = px + ts / 2;
    const cy = py + ts / 2;
    const displ = ts / 2 - hw - 2;
    const displ2 = ts / 3 - hw;
    dr.drawPolygon(
      [
        rotate(cx - displ * xdx + displ2 * ydx, cy - displ * xdy + displ2 * ydy, rot),
        rotate(cx + displ * xdx + displ2 * ydx, cy + displ * xdy + displ2 * ydy, rot),
        rotate(cx - displ * ydx, cy - displ * ydy, rot),
      ],
      COL_LOWLIGHT_GENTLE,
      COL_LOWLIGHT_GENTLE,
    );
  }

  // Stripes across the face, under the number so it stays legible. A mark
  // names the cell a tile ends a turn on, so it stands still while the tile
  // turns into it.
  if (marks & MARK_STRIPES)
    dr.drawHatch(
      { x: px + hw, y: py + hw, w: ts - 2 * hw, h: ts - 2 * hw },
      hatchPeriod(ts),
    );

  dr.drawText(center, glyphFont(ts / 3), COL_TEXT, String(num));

  const band = (r: Rect, c: number) => dr.drawRect(r, c);
  // The block the keyboard cursor is on, or the mouse would turn: a band on
  // the bevel of the block's outer edge, the hint's ring in the cursor color,
  // so either reads as one thing and neither as a move made.
  if (cedges) {
    if (cedges & CUR_TOP) band({ x: px, y: py, w: ts, h: hw }, COL_HIGHCURSOR);
    if (cedges & CUR_LEFT) band({ x: px, y: py, w: hw, h: ts }, COL_HIGHCURSOR);
    if (cedges & CUR_BOTTOM)
      band({ x: px, y: py + ts - hw, w: ts, h: hw }, COL_LOWCURSOR);
    if (cedges & CUR_RIGHT)
      band({ x: px + ts - hw, y: py, w: hw, h: ts }, COL_LOWCURSOR);
  }

  // The hint's marks sit on the bevel, never on the number: the ring on the
  // sides of the block's outer edge, the outline just inside the bevel.
  if (marks) {
    if (marks & CUR_TOP) band({ x: px, y: py, w: ts, h: hw }, COL_HINT);
    if (marks & CUR_BOTTOM) band({ x: px, y: py + ts - hw, w: ts, h: hw }, COL_HINT);
    if (marks & CUR_LEFT) band({ x: px, y: py, w: hw, h: ts }, COL_HINT);
    if (marks & CUR_RIGHT) band({ x: px + ts - hw, y: py, w: hw, h: ts }, COL_HINT);
    if (marks & MARK_OUTLINE) {
      const i = hw;
      const s = ts - 2 * hw;
      band({ x: px + i, y: py + i, w: s, h: hw }, COL_HINT_EVIDENCE);
      band({ x: px + i, y: py + i + s - hw, w: s, h: hw }, COL_HINT_EVIDENCE);
      band({ x: px + i, y: py + i, w: hw, h: s }, COL_HINT_EVIDENCE);
      band({ x: px + i + s - hw, y: py + i, w: hw, h: s }, COL_HINT_EVIDENCE);
    }
  }

  if (rot) dr.unclip();
  dr.drawUpdate({ x: px, y: py, w: ts, h: ts });
}

// --- redraw -----------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: TwiddleDrawState,
  prev: TwiddleState | null,
  state: TwiddleState,
  dir: number,
  ui: TwiddleUi,
  animTime: number,
  flash: Flash,
  activeHint?: HintStep<TwiddleMove>,
): void {
  const ts = ds.tileSize;
  const { w, h, n } = state;
  const hw = highlightWidth(ts);

  const hinted = stepMarks(activeHint);
  const ringed = hinted.of("ring", BLOCK)[0] ?? null;
  const outlined = new Set(hinted.of("outline", TILE));
  const stripedCells = new Set(hinted.of("stripes", LIFTED));
  /** The hint's mark bits on a cell. */
  const marksAt = (tx: number, ty: number): number => {
    let m = outlined.has(ty * w + tx) ? MARK_OUTLINE : 0;
    if (stripedCells.has(ty * w + tx)) m |= MARK_STRIPES;
    if (ringed) {
      const inX = tx >= ringed.x && tx < ringed.x + n;
      const inY = ty >= ringed.y && ty < ringed.y + n;
      if (inX && inY) {
        if (ty === ringed.y) m |= CUR_TOP;
        if (ty === ringed.y + n - 1) m |= CUR_BOTTOM;
        if (tx === ringed.x) m |= CUR_LEFT;
        if (tx === ringed.x + n - 1) m |= CUR_RIGHT;
      }
    }
    return m;
  };

  // The blocks outlined in the cursor color: the keyboard cursor's, and the
  // one the mouse would turn.
  const outlinedBlocks = [
    ...(ui.cursor.visible ? [{ x: ui.cursor.x, y: ui.cursor.y }] : []),
    ...(ui.hoverBlock ? [ui.hoverBlock] : []),
  ];
  const cursorAt = (tx: number, ty: number): number => {
    let e = 0;
    for (const b of outlinedBlocks) {
      if (tx < b.x || tx >= b.x + n || ty < b.y || ty >= b.y + n) continue;
      if (tx === b.x) e |= CUR_LEFT;
      if (ty === b.y) e |= CUR_TOP;
      if (tx === b.x + n - 1) e |= CUR_RIGHT;
      if (ty === b.y + n - 1) e |= CUR_BOTTOM;
    }
    return e;
  };

  if (!ds.started) {
    drawRecessedBorder(
      dr,
      {
        left: coord(0, ts) - hw,
        top: coord(0, ts) - hw,
        right: coord(w, ts) + hw - 1,
        bottom: coord(h, ts) + hw - 1,
      },
      ts,
      COL_HIGHLIGHT,
      COL_LOWLIGHT,
    );
    ds.started = true;
  }

  // Set up the rotation parameters if we're animating, and clear the
  // rotated region to the well first.
  let rot: Rotation | null = null;
  let lastx = -1;
  let lasty = -1;
  if (prev) {
    let lastr: number;
    if (dir > 0) {
      lastx = state.lastX;
      lasty = state.lastY;
      lastr = state.lastR;
    } else {
      lastx = prev.lastX;
      lasty = prev.lastY;
      lastr = -prev.lastR;
    }
    if (lastx >= 0 && lasty >= 0) {
      const animMax = animLength(n);
      const cw = ts * n;
      const block = { x: coord(lastx, ts), y: coord(lasty, ts), w: cw, h: cw };
      const angle = -(Math.PI / 2) * lastr * (1 - animTime / animMax);
      rot = {
        block,
        ox: block.x + cw / 2,
        oy: block.y + cw / 2,
        cos: Math.cos(angle),
        sin: Math.sin(angle),
        leftColor: highlightColor(Math.PI + angle),
        rightColor: highlightColor(angle),
        topColor: highlightColor(Math.PI / 2 + angle),
        bottomColor: highlightColor(-Math.PI / 2 + angle),
      };
      dr.drawRect(block, COL_WELL);
    }
  }

  for (let i = 0; i < w * h; i++) {
    const tx = i % w;
    const ty = Math.floor(i / w);

    // -1 ("always redraw") for cells inside the animating block.
    const inBlock =
      rot !== null && tx >= lastx && tx < lastx + n && ty >= lasty && ty < lasty + n;
    const lit = flash.win(sweepStep(tx, ty));
    const marks = marksAt(tx, ty);
    const cedges = cursorAt(tx, ty);
    const t = inBlock
      ? -1
      : ((((((state.numbers[i] * 4 + state.orient[i]) << 4) | cedges) << 6) | marks) <<
          2) |
        lit;

    if (ds.cache[i] !== t || t === -1) {
      const x = coord(tx, ts);
      const y = coord(ty, ts);

      drawTile(
        dr,
        ts,
        hw,
        state.orientable,
        x,
        y,
        state.numbers[i],
        state.orient[i],
        lit ? winSlot(lit, COL_FLASH, COL_FLASH_LEAD) : COL_TILE,
        // A tile outside the turning block draws unrotated, even mid-turn
        // (the win flash can repaint it while a new move animates).
        inBlock ? rot : null,
        cedges,
        marks,
      );
      ds.cache[i] = t;
    }
  }

  // A dot at every block's pivot, so each square shows which blocks hold it.
  // Drawn over the tiles every frame: a tile repaints for its own reasons and
  // a dot on a grid corner spans four, and a pivot stands still while its
  // block turns about it. An even block's pivot is a grid corner, in the gap
  // between tiles; an odd block's is its center square, where the dot sits
  // below the number.
  const r = Math.max(2, Math.round(ts / 26));
  const odd = n % 2 === 1;
  for (let by = 0; by <= h - n; by++)
    for (let bx = 0; bx <= w - n; bx++) {
      const px = coord(bx, ts) + (n * ts) / 2;
      const py = coord(by, ts) + (n * ts) / 2 + (odd ? ts * 0.32 : 0);
      dr.drawCircle({ x: px, y: py }, r, COL_PIVOT, COL_PIVOT);
      dr.drawUpdate({ x: px - r, y: py - r, w: 2 * r + 1, h: 2 * r + 1 });
    }
}

// --- palette ----------------------------------------------------------

function clampColor(c: Color): Color {
  return [
    Math.max(0, Math.min(1, c[0])),
    Math.max(0, Math.min(1, c[1])),
    Math.max(0, Math.min(1, c[2])),
  ];
}

/** Build the Twiddle palette from a base background + highlight/lowlight
 * (the gentle bevels and the cursor). */
export function buildColors(bg: Color, hi: Color, lo: Color): Color[] {
  const out: Color[] = new Array(NCOLORS);
  out[COL_BACKGROUND] = bg;
  out[COL_TEXT] = INK;
  out[COL_HIGHLIGHT] = hi;
  out[COL_HIGHLIGHT_GENTLE] = clampColor(twiddleGentleHighlight(bg));
  out[COL_LOWLIGHT] = lo;
  out[COL_LOWLIGHT_GENTLE] = clampColor(twiddleGentleLowlight(bg));
  // The cursor is the *outline* of the bevel triangles along the block's
  // edges, over their ordinary fill — a line, so one authored color serves
  // both the lit and the shaded sides. Two slots survive because the dark-mode
  // swap table keys them by index.
  out[COL_HIGHCURSOR] = CURSOR;
  out[COL_LOWCURSOR] = CURSOR;
  out[COL_TILE] = givenSurface(bg);
  out[COL_WELL] = cellSurface(bg);
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  out[COL_HINT] = HINT_RING;
  out[COL_HINT_EVIDENCE] = HINT_OUTLINE;
  out[COL_PIVOT] = CURSOR;
  return out;
}
