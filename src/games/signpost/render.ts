/**
 * Signpost renderer — imperative per-tile draw with a packed-word cache,
 * a blitter-backed drag sprite, and the spin win-flash (upstream
 * `game_redraw` / `tile_redraw` / `game_colours`).
 *
 * A square with no chain is the quiet cell surface, a square whose number the
 * puzzle fixed is the lifted surface of a given, and every other square takes
 * its chain's color, with the thin surface grid between squares.
 */

import { BLUE_BOLD, PURPLE } from "../../engine/color/colors.ts";
import {
  cellSurface,
  ERROR,
  givenSurface,
  HELD,
  HINT_ACTION,
  HINT_EVIDENCE,
  INK,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import {
  SIGNPOST_NUMBER_SET_MID,
  SIGNPOST_ON_REGION_FAINT,
  SIGNPOST_ON_REGION_MID,
  SIGNPOST_REGION_BACKGROUNDS,
  signpostArrowDim,
  signpostWashedRegion,
} from "../../engine/color/palette-games.ts";
import { drawRectCorners, drawRectOutline } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { drawMarkSides, MARK_ALL } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import type { Color, Point } from "../../engine/types.ts";
import type { SignpostHint } from "./hint.ts";
import { ARROW } from "./hint-marks.ts";
import { dragReleaseMove, executeMove } from "./moves.ts";
import {
  FLAG_ERROR,
  FLAG_IMMUTABLE,
  isPointing,
  type SignpostDrawState,
  type SignpostMistake,
  type SignpostMove,
  type SignpostState,
  type SignpostUi,
  whichDir,
} from "./state.ts";

// --- color indices ----------------------------------------------------

const COL_BACKGROUND = 0;
/** The surface of a square that is in no chain yet. */
const COL_CELL = 1;
/** The lifted surface of a square whose number the puzzle fixed. */
const COL_GIVEN = 2;
const COL_GRID = 3;
const COL_CURSOR = 4;
const COL_ERROR = 5;
const COL_DRAG_ORIGIN = 6;
const COL_ARROW = 7;
const COL_ARROW_BG_DIM = 8;
const COL_NUMBER = 9;
const COL_NUMBER_SET = 10;
const COL_NUMBER_SET_MID = 11;
const NBACKGROUNDS = 16;
const COL_B0 = 12;
const COL_M0 = COL_B0 + 1 * NBACKGROUNDS;
const COL_D0 = COL_B0 + 2 * NBACKGROUNDS;
const COL_X0 = COL_B0 + 3 * NBACKGROUNDS;
/** The hint's ring and its arrow: what the step decides. */
export const COL_HINT = COL_X0 + NBACKGROUNDS;
/** The outline on a square the hint reasons from. */
export const COL_HINT_CELL = COL_HINT + 1;

/** The board's pixel origin (NARROW_BORDERS). Exported so `interpretMove` and
 * `computeSize` read the same number the painter does — one function, both
 * callers ([`docs/games/mechanics.md`](../../../docs/games/mechanics.md)). */
export const BORDER = 1;
/** Win-flash duration, shared with `solvedFlash` for the same reason. */
export const FLASH_SPIN = 0.7;
const TWO_PI = 2 * Math.PI;

// --- per-tile flags ---------------------------------------------------

const F_CUR = 0x001;
const F_DRAG_SRC = 0x002;
const F_ERROR = 0x004;
const F_IMMUTABLE = 0x008;
const F_ARROW_POINT = 0x010;
const F_ARROW_INPOINT = 0x020;
const F_DIM = 0x040;
/** The displayed hint links from this square's arrow. */
const F_HINT_ARROW = 0x080;
/** The displayed hint links into this square: ringed. */
const F_HINT_RING = 0x100;
/** This square is on the line the hint's sentence names: striped. */
const F_HINT_LINE = 0x200;
/** The hint reasons from this square: outlined. */
const F_HINT_OUTLINE = 0x400;

// --- palette ----------------------------------------------------------

/**
 * Port of `game_colours`: 12 named colors + four 16-entry ramps. Every value
 * is a token (the arithmetic that does not involve the host background lives
 * in `palette-games.ts`); what is left here is which slot each one occupies.
 */
export function buildPalette(background: Color): Color[] {
  const ret: Color[] = new Array(COL_HINT_CELL + 1);

  ret[COL_BACKGROUND] = background;
  ret[COL_CELL] = cellSurface(background);
  ret[COL_GIVEN] = givenSurface(background);

  ret[COL_NUMBER] = INK;
  ret[COL_ARROW] = INK;
  // Purple, because Signpost has spent the usual two: green is the arrow you
  // are dragging from (and a region wash), blue the fixed numbers.
  ret[COL_CURSOR] = PURPLE;
  ret[COL_GRID] = surfaceGrid(background);
  // **This square's number is fixed** — a clue you were given, or one the
  // chain has forced, as opposed to one still floating.
  ret[COL_NUMBER_SET] = BLUE_BOLD;
  ret[COL_NUMBER_SET_MID] = SIGNPOST_NUMBER_SET_MID;
  ret[COL_ERROR] = ERROR;
  ret[COL_DRAG_ORIGIN] = HELD;
  // A tenth off the surface the chainless square is painted in.
  ret[COL_ARROW_BG_DIM] = signpostArrowDim(cellSurface(background));
  ret[COL_HINT] = HINT_ACTION;
  ret[COL_HINT_CELL] = HINT_EVIDENCE;

  for (let c = 0; c < NBACKGROUNDS; c++) {
    ret[COL_B0 + c] = SIGNPOST_REGION_BACKGROUNDS[c];
    ret[COL_M0 + c] = SIGNPOST_ON_REGION_MID[c];
    ret[COL_D0 + c] = SIGNPOST_ON_REGION_FAINT[c];
    ret[COL_X0 + c] = signpostWashedRegion(background, SIGNPOST_REGION_BACKGROUNDS[c]);
  }
  return ret;
}

// --- primitive helpers ------------------------------------------------

/** An arrow centered on (cx,cy), pointing `ang` radians clockwise from up. */
function drawArrow(
  dr: GameDrawing,
  cx: number,
  cy: number,
  sz: number,
  ang: number,
  color: number,
): void {
  const s = Math.sin(ang);
  const c = Math.cos(ang);
  const xdx3 = Math.round(sz * (c / 3 + 1)) - sz;
  const xdy3 = Math.round(sz * (s / 3 + 1)) - sz;
  const xdx = Math.round(sz * (c + 1)) - sz;
  const xdy = Math.round(sz * (s + 1)) - sz;
  const ydx = -xdy;
  const ydy = xdx;

  const coords: Point[] = [
    { x: cx - ydx, y: cy - ydy },
    { x: cx + xdx, y: cy + xdy },
    { x: cx + xdx3, y: cy + xdy3 },
    { x: cx + xdx3 + ydx, y: cy + xdy3 + ydy },
    { x: cx - xdx3 + ydx, y: cy - xdy3 + ydy },
    { x: cx - xdx3, y: cy - xdy3 },
    { x: cx - xdx, y: cy - xdy },
  ];
  dr.drawPolygon(coords, color, color);
}

function drawStar(
  dr: GameDrawing,
  cx: number,
  cy: number,
  rad: number,
  npoints: number,
  color: number,
  angleOffset: number,
): void {
  const coords: Point[] = [];
  for (let n = 0; n < npoints * 2; n++) {
    const a = (TWO_PI * n) / (npoints * 2) + angleOffset;
    const r = n % 2 ? rad / 2 : rad;
    coords.push({
      x: cx + Math.round(r * Math.sin(a)),
      y: cy + Math.round(-r * Math.cos(a)),
    });
  }
  dr.drawPolygon(coords, color, color);
}

function num2col(n: number, num: number): number {
  const set = Math.floor(num / (n + 1));
  if (num <= 0 || set === 0) return COL_B0;
  return COL_B0 + 1 + ((set - 1) % 15);
}

// --- tile drawing -----------------------------------------------------

function dim(bg: number): number {
  return bg === COL_CELL ? COL_ARROW_BG_DIM : bg + COL_D0 - COL_B0;
}
function mid(bg: number): number {
  return bg + COL_M0 - COL_B0;
}
function dimbg(bg: number): number {
  return bg + COL_X0 - COL_B0;
}

/** A cell's number as displayed: the real number, or its color set's
 * letters plus the offset into it ("b+3"). */
function numString(n: number, num: number): string {
  const set = Math.floor(num / (n + 1));
  if (num <= 0 || set === 0) return String(num);
  const rem = num % (n + 1);
  const suffix = rem !== 0 ? `+${rem}` : "";
  let letters = "";
  let s = set;
  do {
    s--;
    letters = String.fromCharCode((s % 26) + 97) + letters;
    s = Math.floor(s / 26);
  } while (s);
  return letters + suffix;
}

function tileRedraw(
  dr: GameDrawing,
  ds: SignpostDrawState,
  tx: number,
  ty: number,
  dir: number,
  num: number,
  f: number,
  angleOffset: number,
): void {
  const ts = ds.tileSize;
  const n = ds.n;
  const cb = Math.floor(ts / 16);
  const empty = num === 0 && !(f & F_ARROW_POINT) && !(f & F_ARROW_INPOINT);

  const setcol = empty ? COL_CELL : num2col(n, num);

  let arrowcol: number;
  if (f & F_HINT_ARROW) arrowcol = COL_HINT;
  else if (f & F_DRAG_SRC) arrowcol = COL_DRAG_ORIGIN;
  else if (f & F_DIM) arrowcol = dim(setcol);
  else if (f & F_ARROW_POINT) arrowcol = mid(setcol);
  else arrowcol = COL_ARROW;

  let textcol: number;
  if (f & F_ERROR && !(f & F_IMMUTABLE)) {
    textcol = COL_ERROR;
  } else {
    // A given's number is read against its lifted surface, which the faint
    // strengths made for a region's fill do not clear in the dark scheme: it
    // steps down once while a drag dims the board, and never when linked.
    if (f & F_IMMUTABLE) {
      textcol = f & F_DIM ? COL_NUMBER_SET_MID : COL_NUMBER_SET;
    } else if (f & F_DIM) {
      textcol = dim(setcol);
    } else if ((f & F_ARROW_POINT || num === n) && (f & F_ARROW_INPOINT || num === 1)) {
      textcol = mid(setcol);
    } else {
      textcol = COL_NUMBER;
    }
  }

  const sarrowcol = f & F_DIM ? dim(setcol) : COL_ARROW;

  // The square's surface. A given keeps its lift while a drag dims the rest,
  // since who put the number there does not change with the player's focus.
  dr.drawRect(
    { x: tx, y: ty, w: ts, h: ts },
    empty || !(f & (F_IMMUTABLE | F_DIM))
      ? setcol
      : f & F_IMMUTABLE
        ? COL_GIVEN
        : dimbg(setcol),
  );
  // The grid line this square shares with its upper and left neighbors; the
  // frame closes the first row and column.
  if (ty > BORDER) dr.drawRect({ x: tx, y: ty, w: ts, h: 1 }, COL_GRID);
  if (tx > BORDER) dr.drawRect({ x: tx, y: ty, w: 1, h: ts }, COL_GRID);
  // The line a hint's sentence names, under everything the square shows.
  if (f & F_HINT_LINE)
    dr.drawHatch({ x: tx, y: ty, w: ts, h: ts }, COL_HINT, hatchPeriod(ts));

  // Large outward-pointing arrow (or star for the final immutable cell).
  const asz = Math.floor((7 * ts) / 32);
  const acx = tx + Math.floor(ts / 2) + asz;
  const acy = ty + Math.floor(ts / 2) + asz;
  if (num === n && f & F_IMMUTABLE) {
    drawStar(dr, acx, acy, asz, 5, arrowcol, angleOffset);
  } else {
    drawArrow(dr, acx, acy, asz, (TWO_PI * dir) / 8 + angleOffset, arrowcol);
  }
  if (f & F_CUR) drawRectCorners(dr, acx, acy, asz + 1, COL_CURSOR);

  // Predecessor dot: cell needs a predecessor and doesn't have one.
  const dcx = tx + Math.floor(ts / 2) - asz;
  const dcy = ty + Math.floor(ts / 2) + asz;
  if (!(f & F_ARROW_INPOINT) && num !== 1) {
    dr.drawCircle({ x: dcx, y: dcy }, Math.floor(asz / 4), sarrowcol, sarrowcol);
  }

  // Number / set text.
  if (!empty) {
    const p = numString(n, num);
    const textsz = Math.min(2 * asz, Math.floor((ts - 2 * cb) / p.length));
    dr.drawText(
      { x: tx + cb, y: ty + Math.floor(ts / 4) },
      { align: "left", baseline: "mathematical", fontType: "variable", size: textsz },
      textcol,
      p,
    );
  }

  // The hint's ring and outline, on the square's own border. The squares tile
  // exactly, so the band is inside the box and the square repaints it away
  // when its flags change; the number starts `cb` in, clear of the band.
  if (f & (F_HINT_RING | F_HINT_OUTLINE)) {
    const band = {
      box: { x: tx, y: ty, w: ts, h: ts },
      outer: 0,
      inner: Math.max(2, cb >> 1),
    };
    drawMarkSides(dr, band, MARK_ALL, f & F_HINT_RING ? COL_HINT : COL_HINT_CELL);
  }

  dr.drawUpdate({ x: tx, y: ty, w: ts, h: ts });
}

// --- drag indicator ---------------------------------------------------

function drawDragIndicator(
  dr: GameDrawing,
  ds: SignpostDrawState,
  s: SignpostState,
  ui: SignpostUi,
  validDrag: boolean,
): void {
  const ts = ds.tileSize;
  const w = ds.w;
  const asz = Math.floor((7 * ts) / 32);
  const fx = Math.floor((ui.dx - BORDER) / ts);
  const fy = Math.floor((ui.dy - BORDER) / ts);
  let ang: number;

  const inGrid = fx >= 0 && fx < s.w && fy >= 0 && fy < s.h;
  if (validDrag && inGrid) {
    const dir = ui.dragIsFrom ? s.dirs[ui.sy * w + ui.sx] : s.dirs[fy * w + fx];
    ang = (TWO_PI * dir) / 8;
  } else {
    const ox = ui.sx * ts + BORDER + Math.floor(ts / 2);
    const oy = ui.sy * ts + BORDER + Math.floor(ts / 2);
    const xdiff = Math.abs(ox - ui.dx);
    const ydiff = Math.abs(oy - ui.dy);
    if (xdiff === 0) {
      ang = oy > ui.dy ? 0 : Math.PI;
    } else if (ydiff === 0) {
      ang = ox > ui.dx ? (3 * Math.PI) / 2 : Math.PI / 2;
    } else {
      let tana: number;
      let offset: number;
      if (ui.dx > ox && ui.dy < oy) {
        tana = xdiff / ydiff;
        offset = 0;
      } else if (ui.dx > ox && ui.dy > oy) {
        tana = ydiff / xdiff;
        offset = Math.PI / 2;
      } else if (ui.dx < ox && ui.dy > oy) {
        tana = xdiff / ydiff;
        offset = Math.PI;
      } else {
        tana = ydiff / xdiff;
        offset = (3 * Math.PI) / 2;
      }
      ang = Math.atan(tana) + offset;
    }
    if (!ui.dragIsFrom) ang += Math.PI; // point to the origin, not away
  }
  drawArrow(dr, ui.dx, ui.dy, asz, ang, COL_ARROW);
}

// --- main redraw ------------------------------------------------------

export function redrawSignpost(
  dr: GameDrawing,
  ds: SignpostDrawState,
  _prev: SignpostState | null,
  state: SignpostState,
  _dir: number,
  ui: SignpostUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<SignpostMove, SignpostHint>,
  mistakes?: readonly SignpostMistake[],
): void {
  const ts = ds.tileSize;
  const w = state.w;

  let force = false;
  let angleOffset = 0;
  if (flashTime > 0) angleOffset = TWO_PI * (flashTime / FLASH_SPIN);
  if (angleOffset !== ds.angleOffset) {
    ds.angleOffset = angleOffset;
    force = true;
  }

  // Erase the drag sprite drawn last frame.
  if (ds.dragging) {
    if (ds.dragBackground) {
      dr.blitterLoad(ds.dragBackground, { x: ds.dragX, y: ds.dragY });
      dr.drawUpdate({ x: ds.dragX, y: ds.dragY, w: ts, h: ts });
    }
    ds.dragging = false;
  }

  // If an in-progress drag would make a valid move, reflect it (the C
  // "postdrop" preview): render the state that release would produce.
  let renderState = state;
  let postdropValid = false;
  if (ui.dragging) {
    const x = Math.floor((ui.dx - BORDER) / ts);
    const y = Math.floor((ui.dy - BORDER) / ts);
    const move = dragReleaseMove(state, ui, x, y);
    if (move) {
      renderState = executeMove(state, move);
      postdropValid = true;
    }
  }

  if (!ds.started) {
    const aw = ts * state.w;
    const ah = ts * state.h;
    // The grid frame (upstream `game_redraw` first-draw block).
    drawRectOutline(dr, BORDER - 1, BORDER - 1, aw + 2, ah + 2, COL_GRID);
  }

  const mistakeSet = mistakes?.length ? new Set(mistakes.map((m) => m.index)) : null;
  const hintFlags = new Map<number, number>();
  const marks = stepMarks(hint);
  const add = (flag: number) => (p: Point) => {
    const i = p.y * w + p.x;
    hintFlags.set(i, (hintFlags.get(i) ?? 0) | flag);
  };
  marks.of("stripes", CELL).forEach(add(F_HINT_LINE));
  marks.of("outline", CELL).forEach(add(F_HINT_OUTLINE));
  marks.of("ring", ARROW).forEach(add(F_HINT_ARROW));
  marks.of("ring", CELL).forEach(add(F_HINT_RING));

  for (let x = 0; x < state.w; x++) {
    for (let y = 0; y < state.h; y++) {
      const i = y * w + x;
      let f = 0;
      let dirp = -1;

      if (ui.cursor.visible && x === ui.cursor.x && y === ui.cursor.y) f |= F_CUR;

      if (ui.dragging) {
        if (x === ui.sx && y === ui.sy) {
          f |= F_DRAG_SRC;
        } else if (ui.dragIsFrom) {
          if (!isPointing(renderState, ui.sx, ui.sy, x, y)) f |= F_DIM;
        } else if (!isPointing(renderState, x, y, ui.sx, ui.sy)) {
          f |= F_DIM;
        }
      }

      if (
        renderState.impossible ||
        renderState.nums[i] < 0 ||
        renderState.flags[i] & FLAG_ERROR ||
        mistakeSet?.has(i)
      ) {
        f |= F_ERROR;
      }
      if (renderState.flags[i] & FLAG_IMMUTABLE) f |= F_IMMUTABLE;
      f |= hintFlags.get(i) ?? 0;
      if (renderState.next[i] !== -1) f |= F_ARROW_POINT;
      if (renderState.prev[i] !== -1) {
        f |= F_ARROW_INPOINT;
        dirp = whichDir(
          x,
          y,
          renderState.prev[i] % w,
          Math.floor(renderState.prev[i] / w),
        );
      }

      if (
        renderState.nums[i] !== ds.nums[i] ||
        f !== ds.cache[i] ||
        dirp !== ds.dirp[i] ||
        force ||
        !ds.started
      ) {
        const sign = ui.gearMode ? 1 - 2 * ((x ^ y) & 1) : 1;
        tileRedraw(
          dr,
          ds,
          BORDER + x * ts,
          BORDER + y * ts,
          state.dirs[i],
          renderState.nums[i],
          f,
          sign * angleOffset,
        );
        ds.nums[i] = renderState.nums[i];
        ds.cache[i] = f;
        ds.dirp[i] = dirp;
      }
    }
  }

  // Draw the dragging sprite.
  if (ui.dragging) {
    if (!ds.dragBackground) ds.dragBackground = dr.blitterNew({ w: ts, h: ts });
    ds.dragging = true;
    ds.dragX = ui.dx - Math.floor(ts / 2);
    ds.dragY = ui.dy - Math.floor(ts / 2);
    dr.blitterSave(ds.dragBackground, { x: ds.dragX, y: ds.dragY });
    drawDragIndicator(dr, ds, state, ui, postdropValid);
  }

  if (!ds.started) ds.started = true;
}
