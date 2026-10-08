/**
 * Black Box — palette, geometry, and the imperative `redraw`, over a
 * per-tile cache (`ds.grid` mirrors each tile's displayed value, cursor and
 * flash flags included).
 *
 * Pieces on a quiet surface (`engine/piece.ts`): a square of the box is the
 * cell surface and a guessed ball is a disc on it. What is settled is lifted:
 * a square marked as known, which holds a cross where it has no ball, a laser
 * square once fired, and the whole box once revealed.
 */

import { GREEN, RED, TWO } from "../../engine/color/colors.ts";
import {
  cellSurface,
  ERROR,
  givenSurface,
  HINT_ACTION,
  HINT_EVIDENCE,
  INK,
  RULED_OUT,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import {
  drawRectCorners,
  drawRectOutline,
  drawThickRectOutline,
  glyphFont,
} from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { drawPiece, drawRuledOutCross, TWO_SHAPES } from "../../engine/piece.ts";
import type { Color, Point, Rect, Size } from "../../engine/types.ts";
import { BUTTON, LASER } from "./hint-text.ts";
import {
  BALL_GUESS,
  BALL_LOCK,
  type BlackboxParams,
  type BlackboxState,
  type BlackboxUi,
  canReveal,
  FLAG_CURSOR,
  gridIdx,
  LASER_EMPTY,
  LASER_FLAGMASK,
  LASER_FLASHED,
  LASER_HIT,
  LASER_OMITTED,
  LASER_REFLECT,
  LASER_WRONG,
  range2grid,
} from "./state.ts";

// --- color indices -------------------------------------------------------

export const COL_BACKGROUND = 0; // the board, and a laser square not fired yet
const COL_GRID = 1; // the line between two squares
export const COL_CELL = 2; // the surface of a square of the box
/** The surface of what is settled: a square marked as known, a fired laser
 * square, and every square of a revealed box. */
export const COL_SETTLED = 3;
export const COL_KNOWN = 4; // the cross in a square marked as known that has no ball
const COL_TEXT = 5;
const COL_FLASHTEXT = 6;
export const COL_BALL = 7;
export const COL_WRONG = 8;
export const COL_BUTTON = 9;
const COL_CURSOR = 10;
export const COL_HINT = 11;
export const COL_HINT_EVIDENCE = 12;
const NCOLORS = 13;

/** A ball is the pair's disc, in a color no mark drawn round it has spent. */
const PAIR_DISC = 1;

/** A tile the displayed hint step rings or outlines, in its cache word beside
 * the cursor's flag, so a mark coming or going repaints it. */
const HINT_RING = 1 << 17;
const HINT_OUTLINE = 1 << 18;
/** A square the check found wrong, in the same word, for the same reason. The
 * midend refuses a hint while the check finds anything, so its frame never
 * shares a square with a hint's mark. */
const MISTAKE = 1 << 19;

export const PREFERRED_TILE_SIZE = 32;
const FLASH_FRAME = 0.2;
const CUR_ANIM = 0.2;

// --- draw state -------------------------------------------------------

export interface BlackboxDrawState {
  tileSize: number;
  ballRadius: number;
  ringRadius: number;
  w: number;
  grid: Int32Array;
  started: boolean;
  reveal: boolean;
  isflash: boolean;
  flashLaserno: number;
}

export function newDrawState(s: BlackboxState, tileSize: number): BlackboxDrawState {
  return {
    tileSize,
    ballRadius: Math.floor((tileSize - 1) / 2),
    ringRadius: Math.floor((3 * tileSize) / 8),
    w: s.w,
    grid: new Int32Array((s.w + 2) * (s.h + 2)),
    started: false,
    reveal: false,
    isflash: false,
    flashLaserno: LASER_EMPTY,
  };
}

/** The board's pixel origin. Exported so `fromDraw` reads the same number the
 * painter does — one function, both callers
 * ([`docs/games/mechanics.md`](../../../docs/games/mechanics.md)). */
export function borderFor(tileSize: number): number {
  return Math.floor(tileSize / 2);
}

export function computeSize(p: BlackboxParams, tileSize: number): Size {
  const border = borderFor(tileSize);
  return {
    w: (p.w + 2) * tileSize + 2 * border,
    h: (p.h + 2) * tileSize + 2 * border,
  };
}

export function colors(defaultBackground: Color): Color[] {
  const bg = defaultBackground;
  const ret: Color[] = new Array(NCOLORS);
  ret[COL_BACKGROUND] = bg;
  ret[COL_GRID] = surfaceGrid(bg);
  ret[COL_CELL] = cellSurface(bg);
  // The lifted surface is the puzzle's word here as it is under a given: a
  // laser's result is what the box said, and a known square is closed to play.
  ret[COL_SETTLED] = givenSurface(bg);
  ret[COL_KNOWN] = RULED_OUT;
  ret[COL_BALL] = TWO[PAIR_DISC];
  ret[COL_WRONG] = ERROR;
  ret[COL_BUTTON] = GREEN;
  // Not `CURSOR`: green is spent on the reveal button and the fired laser's
  // text, and the cursor rings both.
  ret[COL_CURSOR] = RED;
  ret[COL_TEXT] = INK;
  // The laser you just fired, lit up for a beat — not the solved flash.
  ret[COL_FLASHTEXT] = GREEN;
  ret[COL_HINT] = HINT_ACTION;
  ret[COL_HINT_EVIDENCE] = HINT_EVIDENCE;
  return ret;
}

/** The hint's mark on a tile at `(dx, dy)`, at the edge of its surface and
 * inside its grid line, so a neighbor's repaint cannot cut it. */
function drawHintMark(
  dr: GameDrawing,
  ds: BlackboxDrawState,
  dx: number,
  dy: number,
  flags: number,
): void {
  const ts = ds.tileSize;
  const thick = Math.max(2, Math.floor(ts / 12));
  if (flags & HINT_OUTLINE)
    drawThickRectOutline(dr, dx + 1, dy + 1, ts - 1, ts - 1, thick, COL_HINT_EVIDENCE);
  if (flags & HINT_RING)
    drawThickRectOutline(dr, dx + 1, dy + 1, ts - 1, ts - 1, thick, COL_HINT);
  if (flags & MISTAKE)
    drawThickRectOutline(dr, dx + 1, dy + 1, ts - 1, ts - 1, thick, COL_WRONG);
}

/** Which tiles the displayed step's words ring or outline, by grid index. */
function hintFlags(
  state: BlackboxState,
  hint?: HintStep<unknown> | null,
): Map<number, number> {
  const out = new Map<number, number>();
  const marks = stepMarks(hint);
  const add = (x: number, y: number, flag: number): void => {
    const i = gridIdx(state.w, x, y);
    out.set(i, (out.get(i) ?? 0) | flag);
  };
  for (const p of marks.of("ring", CELL)) add(p.x, p.y, HINT_RING);
  for (const [role, flag] of [
    ["ring", HINT_RING],
    ["outline", HINT_OUTLINE],
  ] as const)
    for (const l of marks.of(role, LASER)) {
      const rc = range2grid(state.w, state.h, l);
      if (rc) add(rc.x, rc.y, flag);
    }
  if (marks.of("ring", BUTTON).length > 0) add(0, 0, HINT_RING);
  return out;
}

// --- small draw helpers -----------------------------------------------

const rect = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h });
const pt = (x: number, y: number): Point => ({ x, y });

function todraw(ds: BlackboxDrawState, x: number): number {
  return ds.tileSize * x + Math.floor(ds.tileSize / 2);
}

/** The surface of the tile at `(dx, dy)`, inside its grid line. */
const face = (ds: BlackboxDrawState, dx: number, dy: number): Rect =>
  rect(dx + 1, dy + 1, ds.tileSize - 1, ds.tileSize - 1);

/** A tile's grid line and its surface. The line is the tile's own on all four
 * sides, shared with each neighbor, so the box needs no frame. The caller
 * clips to the tile, line included: a tile repaints alone. */
function drawSurface(
  dr: GameDrawing,
  ds: BlackboxDrawState,
  dx: number,
  dy: number,
  surface: number,
): void {
  drawRectOutline(dr, dx, dy, ds.tileSize + 1, ds.tileSize + 1, COL_GRID);
  dr.drawRect(face(ds, dx, dy), surface);
}

/** The cursor's brackets, out at the tile's corners and clear of a ball. */
function drawCursor(
  dr: GameDrawing,
  ds: BlackboxDrawState,
  dx: number,
  dy: number,
): void {
  const ts = ds.tileSize;
  const half = Math.floor(ts / 2);
  drawRectCorners(dr, dx + half, dy + half, half - 3, COL_CURSOR, Math.max(2, ts >> 4));
}

// --- arena tile -------------------------------------------------------

function drawArenaTile(
  dr: GameDrawing,
  gs: BlackboxState,
  ds: BlackboxDrawState,
  ui: BlackboxUi,
  ax: number,
  ay: number,
  force: boolean,
  isflash: boolean,
  hint: number,
): void {
  const ts = ds.tileSize;
  const gx = ax + 1;
  const gy = ay + 1;
  let gsTile = gs.grid[gridIdx(gs.w, gx, gy)] | hint;
  const dsTile = ds.grid[gridIdx(ds.w, gx, gy)];
  const dx = todraw(ds, gx);
  const dy = todraw(ds, gy);

  if (ui.cursor.visible && ui.cursor.x === gx && ui.cursor.y === gy)
    gsTile |= FLAG_CURSOR;

  if (gsTile !== dsTile || gs.reveal !== ds.reveal || force) {
    const known = (gsTile & BALL_LOCK) !== 0;
    dr.clip(rect(dx, dy, ts + 1, ts + 1));
    drawSurface(dr, ds, dx, dy, gs.reveal || known ? COL_SETTLED : COL_CELL);

    // A reveal shows guesses that are the real balls, so only guesses are
    // drawn, and they blink out on the flash's beats.
    if (gsTile & BALL_GUESS) {
      if (!(gs.reveal && isflash))
        drawPiece(dr, face(ds, dx, dy), TWO_SHAPES[PAIR_DISC], COL_BALL);
    } else if (known && !gs.reveal) drawRuledOutCross(dr, face(ds, dx, dy), COL_KNOWN);

    if (gsTile & FLAG_CURSOR) drawCursor(dr, ds, dx, dy);
    drawHintMark(dr, ds, dx, dy, gsTile);

    dr.unclip();
    dr.drawUpdate(rect(dx, dy, ts + 1, ts + 1));
  }
  ds.grid[gridIdx(ds.w, gx, gy)] = gsTile;
}

// --- laser (firing-range) tile ----------------------------------------

function drawLaserTile(
  dr: GameDrawing,
  gs: BlackboxState,
  ds: BlackboxDrawState,
  ui: BlackboxUi,
  lno: number,
  force: boolean,
  hint: number,
): void {
  const ts = ds.tileSize;
  const rc = range2grid(gs.w, gs.h, lno);
  if (!rc) return;
  const { x: gx, y: gy } = rc;
  let gsTile = gs.grid[gridIdx(gs.w, gx, gy)];
  const dsTile = ds.grid[gridIdx(ds.w, gx, gy)];
  const dx = todraw(ds, gx);
  const dy = todraw(ds, gy);

  const wrong = gs.exits[lno] & LASER_WRONG;
  const omitted = gs.exits[lno] & LASER_OMITTED;
  const exitno = gs.exits[lno] & ~LASER_FLAGMASK;

  const reflect = gsTile & LASER_REFLECT;
  const hit = gsTile & LASER_HIT;
  const laserval = gsTile & ~LASER_FLAGMASK;

  if (lno === ds.flashLaserno) {
    gsTile |= LASER_FLASHED;
  } else if (!(gs.exits[lno] & (LASER_HIT | LASER_REFLECT))) {
    if (exitno === ds.flashLaserno) gsTile |= LASER_FLASHED;
  }
  const flash = (gsTile & LASER_FLASHED) !== 0;

  gsTile |= wrong | omitted | hint;
  if (ui.cursor.visible && ui.cursor.x === gx && ui.cursor.y === gy)
    gsTile |= FLAG_CURSOR;

  if (gsTile !== dsTile || force) {
    const fired =
      (gsTile &
        ~(LASER_WRONG | LASER_OMITTED | FLAG_CURSOR | HINT_RING | HINT_OUTLINE)) !==
      0;
    const surface = fired ? COL_SETTLED : COL_BACKGROUND;
    dr.clip(rect(dx, dy, ts + 1, ts + 1));
    drawSurface(dr, ds, dx, dy, surface);

    if (fired) {
      const tcol = flash ? COL_FLASHTEXT : omitted ? COL_WRONG : COL_TEXT;
      const str = reflect || hit ? (reflect ? "R" : "H") : String(laserval);

      if (wrong) {
        dr.drawCircle(
          pt(dx + Math.floor(ts / 2), dy + Math.floor(ts / 2)),
          ds.ringRadius,
          COL_WRONG,
          COL_WRONG,
        );
        dr.drawCircle(
          pt(dx + Math.floor(ts / 2), dy + Math.floor(ts / 2)),
          ds.ringRadius - Math.floor(ts / 16),
          surface,
          COL_WRONG,
        );
      }

      dr.drawText(
        pt(dx + Math.floor(ts / 2), dy + Math.floor(ts / 2)),
        glyphFont(Math.floor(ts / 2)),
        tcol,
        str,
      );
    }
    if (gsTile & FLAG_CURSOR) drawCursor(dr, ds, dx, dy);
    drawHintMark(dr, ds, dx, dy, gsTile);

    dr.unclip();
    dr.drawUpdate(rect(dx, dy, ts + 1, ts + 1));
  }
  ds.grid[gridIdx(ds.w, gx, gy)] = gsTile;
}

// --- full redraw ------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: BlackboxDrawState,
  _prev: BlackboxState | null,
  state: BlackboxState,
  _dir: number,
  ui: BlackboxUi,
  animTime: number,
  flashTime: number,
  hint?: HintStep<unknown> | null,
  mistakes?: readonly Point[],
): void {
  const ts = ds.tileSize;
  let isflash = false;
  let force = false;
  const marked = hintFlags(state, hint);
  for (const m of mistakes ?? []) {
    const i = gridIdx(state.w, m.x, m.y);
    marked.set(i, (marked.get(i) ?? 0) | MISTAKE);
  }
  const flagsAt = (x: number, y: number): number =>
    marked.get(gridIdx(state.w, x, y)) ?? 0;

  if (flashTime > 0) {
    const frame = Math.floor(flashTime / FLASH_FRAME);
    isflash = frame % 2 === 0;
  }

  if (!ds.started) {
    force = true;
    ds.started = true;
  }

  if (isflash !== ds.isflash) force = true;

  for (let x = 0; x < state.w; x++)
    for (let y = 0; y < state.h; y++)
      drawArenaTile(dr, state, ds, ui, x, y, force, isflash, flagsAt(x + 1, y + 1));

  // Which laser to highlight this frame.
  ds.flashLaserno = LASER_EMPTY;
  if (ui.flashLaser === 1) ds.flashLaserno = ui.flashLaserno;
  else if (ui.flashLaser === 2 && animTime > 0) ds.flashLaserno = ui.flashLaserno;

  for (let i = 0; i < 2 * (state.w + state.h); i++) {
    const rc = range2grid(state.w, state.h, i);
    drawLaserTile(dr, state, ds, ui, i, force, rc ? flagsAt(rc.x, rc.y) : 0);
  }

  // The reveal ("finish") button at (0,0), repainted whole every frame, so a
  // hint ring around it comes and goes with the step.
  const b0 = todraw(ds, 0);
  if (canReveal(state)) {
    const outline =
      ui.cursor.visible && ui.cursor.x === 0 && ui.cursor.y === 0
        ? COL_CURSOR
        : COL_TEXT;
    dr.clip(rect(b0 - 1, b0 - 1, ts + 1, ts + 1));
    // The square the no-button branch clears, and no wider: the laser squares
    // beside it own the grid line along its far edges.
    dr.drawRect(rect(b0 - 1, b0 - 1, ts, ts), COL_BACKGROUND);
    drawHintMark(dr, ds, b0 - 1, b0 - 1, flagsAt(0, 0));
    dr.drawCircle(
      pt(b0 + ds.ballRadius - 1, b0 + ds.ballRadius - 1),
      ds.ballRadius - 1,
      outline,
      outline,
    );
    dr.drawCircle(
      pt(b0 + ds.ballRadius - 1, b0 + ds.ballRadius - 1),
      ds.ballRadius - 3,
      COL_BUTTON,
      COL_BUTTON,
    );
    dr.unclip();
  } else {
    dr.drawRect(rect(b0 - 1, b0 - 1, ts, ts), COL_BACKGROUND);
  }
  dr.drawUpdate(rect(b0, b0, ts, ts));

  ds.reveal = state.reveal;
  ds.isflash = isflash;
}

// --- timing -----------------------------------------------------------

export function animLength(
  _a: BlackboxState,
  _b: BlackboxState,
  _dir: number,
  ui: BlackboxUi,
): number {
  return ui.flashLaser === 2 ? CUR_ANIM : 0;
}

export function flashLength(
  oldState: BlackboxState,
  newState: BlackboxState,
  _dir: number,
  _ui: BlackboxUi,
): number {
  return !oldState.reveal && newState.reveal ? 4 * FLASH_FRAME : 0;
}
