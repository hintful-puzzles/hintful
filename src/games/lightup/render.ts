/**
 * Light Up rendering: a per-tile diffed loop over a packed display-flag word
 * per cell (docs/rendering.md § "The tile cache and the diff key"), on
 * the collection's quiet surface. A wall is a solid block (`wallFill`) with its clue
 * (red when provably wrong); an open square is the cell surface, washed yellow
 * when lit; a bulb is a white disc (red when lit by another bulb); the
 * impossible-mark is the ruled-out cross (red where nothing can light its
 * square); the red marks are where the rules break (`errorFlags`); and the
 * completion flash fills the open squares it is on with the flash color.
 */

import { BLACK, WHITE, YELLOW_WASH } from "../../engine/color/colors.ts";
import {
  cellSurface,
  ERROR_TEXT,
  RULED_OUT,
  surfaceGrid,
  wallFill,
} from "../../engine/color/palette.ts";
import {
  COL_CURSOR,
  COL_ERROR,
  COL_HINT_OUTLINE,
  FIRST_GAME_SLOT,
  rolePalette,
} from "../../engine/color/roles.ts";
import type { Frame, GameDrawing } from "../../engine/contract/game.ts";
import { stepMarks } from "../../engine/contract/hint-words.ts";
import type { Color, Size } from "../../engine/contract/types.ts";
import {
  drawRectCorners,
  drawRectOutline,
  glyphFont,
} from "../../engine/render/draw.ts";
import {
  drawCellRing,
  drawMarkSides,
  MARK_ALL,
} from "../../engine/render/hint-mark.ts";
import { liveErrors } from "../../engine/render/live-errors.ts";
import { OverlaySidecar } from "../../engine/render/overlay-sidecar.ts";
import { drawRuledOutCross } from "../../engine/render/piece.ts";
import { NOTHING_TO_CLEAR } from "../../engine/render/ring.ts";
import { TileCache } from "../../engine/render/tile-cache.ts";
import {
  type Flash,
  sweepStep,
  WIN_NONE,
  type WinTone,
  winSlot,
} from "../../engine/render/win-wave.ts";
import type { LightupHint, LightupMistake } from "./index.ts";
import { dealtOf, EVERY_SQUARE_LIT, NO_BULB_LIGHTS_ANOTHER, rules } from "./solver.ts";
import {
  F_BLACK,
  F_IMPOSSIBLE,
  F_LIGHT,
  F_NUMBERED,
  idx,
  type LightupMove,
  type LightupState,
  type LightupUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 32;

// --- palette -------------------------------------------------------------------

// The full red `COL_ERROR` is the badge under a wrong clue and the disc of a
// bulb another bulb lights; `COL_HINT_OUTLINE` also rings a hint's driving
// clue, on its wall.
export const COL_GRID = FIRST_GAME_SLOT; // the line between two cells, and the frame
export const COL_WALL = FIRST_GAME_SLOT + 1;
export const COL_LIGHT = FIRST_GAME_SLOT + 2; // white: bulbs and clue digits
export const COL_LIT = FIRST_GAME_SLOT + 3; // yellow lit-square fill
/** The player's "no light here" cross. */
export const COL_RULED_OUT = FIRST_GAME_SLOT + 4;
const COL_CELL = FIRST_GAME_SLOT + 5; // the surface of an open square no bulb lights
/** The line round a bulb. */
export const COL_BULB_RIM = FIRST_GAME_SLOT + 6;
/** A wrong clue's digit, on its badge. */
export const COL_ERROR_TEXT = FIRST_GAME_SLOT + 7;

export function colors(defaultBackground: Color): Color[] {
  const out = rolePalette(defaultBackground);
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_WALL] = wallFill(defaultBackground);
  // Pinned: a bulb *is* white with a black rim, in either scheme, and a clue
  // is that white on its wall.
  out[COL_LIGHT] = WHITE;
  out[COL_BULB_RIM] = BLACK;
  // The **wash** step, not plain yellow: a lit square is a large fill under
  // bulbs and digits and must read as *the board, lit*, not as an object on it.
  // Plain yellow is a near-board tint under a light scheme and a bright patch
  // under a dark one.
  out[COL_LIT] = YELLOW_WASH;
  out[COL_ERROR_TEXT] = ERROR_TEXT;
  out[COL_RULED_OUT] = RULED_OUT;
  return out;
}

// --- geometry -----------------------------------------------------------------

export const border = (ts: number): number => Math.floor(ts / 2);
const coord = (v: number, ts: number): number => v * ts + border(ts);

export function computeSize(p: { w: number; h: number }, ts: number): Size {
  return { w: p.w * ts + 2 * border(ts), h: p.h * ts + 2 * border(ts) };
}

// --- display flags (upstream DF_*) ---------------------------------------------

const DF_BLACK = 1;
const DF_NUMBERED = 2;
const DF_LIT = 4;
const DF_LIGHT = 8;
const DF_OVERLAP = 16;
const DF_CURSOR = 32;
const DF_NUMBERWRONG = 64;
/** A crossed square nothing can light any more. */
const DF_DARK = 128;
/** Bits 15–16: the tone of the completion flash on the square. */
const DF_WIN_SHIFT = 15;
const DF_IMPOSSIBLE = 256;
/** Fork addition: this cell contradicts the unique solution (Check & Save). */
const DF_WRONG = 512;
/** Fork addition: the show-lit-blobs pref, in the key so a toggle repaints. */
const DF_BLOBS_PREF = 1024;

export interface LightupDrawState {
  tileSize: number;
  crad: number;
  /** What each square shows, as its display flags, and the hint's marks. */
  tiles: TileCache;
  hint: OverlaySidecar;
}

export function newDrawState(state: LightupState, tileSize: number): LightupDrawState {
  const hint = new OverlaySidecar(state.w * state.h);
  return {
    tileSize,
    crad: Math.floor((3 * (tileSize - 1)) / 8),
    tiles: new TileCache(state.w * state.h, { overlays: [hint] }),
    hint,
  };
}

// --- per-tile flags + draw -------------------------------------------------------

/** Where the board breaks a rule, per square: `DF_OVERLAP` on a bulb another
 * lights, `DF_NUMBERWRONG` on a number that can no longer get its bulbs, and
 * `DF_DARK` on a cross nothing can light any more. */
function errorFlags(state: LightupState): Uint16Array {
  const live = liveErrors(rules, state);
  const out = new Uint16Array(state.w * state.h);
  const mark = (rule: string, df: number): void => {
    for (const at of live.byRule.get(rule) ?? []) for (const i of at) out[i] |= df;
  };
  mark(EVERY_SQUARE_LIT, DF_DARK);
  mark(NO_BULB_LIGHTS_ANOTHER, DF_OVERLAP);
  const { number } = dealtOf(state);
  for (const k of live.clues.get("number") ?? []) out[number.at[k]] |= DF_NUMBERWRONG;
  return out;
}

function tileFlags(
  state: LightupState,
  ui: LightupUi,
  x: number,
  y: number,
  flash: Flash,
  error: number,
): number {
  const i = idx(x, y, state.w);
  const flags = state.flags[i];
  let ret = error;

  if (ui.cursor.visible && x === ui.cursor.x && y === ui.cursor.y) ret |= DF_CURSOR;

  if (flags & F_BLACK) {
    ret |= DF_BLACK;
    if (flags & F_NUMBERED) ret |= DF_NUMBERED;
  } else {
    // Only an open square: a wall never lights.
    ret |= flash.win(sweepStep(x, y)) << DF_WIN_SHIFT;
    if (state.lights[i] > 0) ret |= DF_LIT;
    if (flags & F_LIGHT) ret |= DF_LIGHT;
    if (flags & F_IMPOSSIBLE) ret |= DF_IMPOSSIBLE;
  }
  return ret;
}

function tileRedraw(
  dr: GameDrawing,
  ds: LightupDrawState,
  state: LightupState,
  ui: LightupUi,
  x: number,
  y: number,
): void {
  const ts = ds.tileSize;
  const i = idx(x, y, state.w);
  const dsFlags = ds.tiles.shown(i);
  const sides = ds.hint.outlineSides(i);
  const dx = coord(x, ts);
  const dy = coord(y, ts);
  // An open square's surface, inside the grid line on its top and left. The
  // lines on its other two sides are its neighbors', or the frame's.
  const box = { x: dx + 1, y: dy + 1, w: ts - 1, h: ts - 1 };
  const band = { box, outer: 0, inner: Math.max(2, ts >> 4) };

  if (dsFlags & DF_BLACK) {
    // The whole tile, grid lines included, so a run of walls is one block.
    dr.drawRect({ x: dx, y: dy, w: ts, h: ts }, COL_WALL);
    if (dsFlags & DF_NUMBERED) {
      const center = { x: dx + Math.floor(ts / 2), y: dy + Math.floor(ts / 2) };
      // A provably-wrong clue is a badge: the error color as a digit is as
      // light as the wall in the dark scheme, and is told from it by hue alone.
      const wrong = (dsFlags & DF_NUMBERWRONG) !== 0;
      if (wrong) dr.drawCircle(center, Math.floor(ts * 0.34), COL_ERROR, COL_ERROR);
      // The clue value never changes over the game, so it is not part of
      // the diff key (upstream's observation).
      dr.drawText(
        center,
        glyphFont(Math.floor((ts * 3) / 5)),
        wrong ? COL_ERROR_TEXT : COL_LIGHT,
        String(state.lights[idx(x, y, state.w)]),
      );
    }
    if (sides !== 0) {
      // An outlined wall is a clue the step names, never part of an area of
      // squares, so it is a box of its own, inset from the wall's edge, and
      // keeps its white digit: no hint hue reads as a glyph on the wall's gray
      // in both schemes. The white line inside the box parts it from the wall.
      const m = Math.floor(ts / 12);
      const t = Math.max(2, Math.floor(ts / 10));
      const side = ts - 2 * m;
      drawMarkSides(
        dr,
        { box: { x: dx + m, y: dy + m, w: side, h: side }, outer: 0, inner: t },
        MARK_ALL,
        COL_HINT_OUTLINE,
      );
      drawRectOutline(
        dr,
        dx + m + t,
        dy + m + t,
        side - 2 * t,
        side - 2 * t,
        COL_LIGHT,
      );
    }
  } else {
    // Hint roles (fork): the target is **ringed**, so a light or blob
    // already on it stays visible. An evidence square is outlined
    // COL_HINT_OUTLINE and keeps its fill, which is its premise: lit or not.
    const tone = ((dsFlags >> DF_WIN_SHIFT) & 3) as WinTone;
    const fill =
      tone !== WIN_NONE ? winSlot(tone) : dsFlags & DF_LIT ? COL_LIT : COL_CELL;
    dr.drawRect({ x: dx, y: dy, w: ts, h: ts }, COL_GRID);
    dr.drawRect(box, fill);
    drawMarkSides(dr, band, sides, COL_HINT_OUTLINE);
    if (dsFlags & DF_LIGHT) {
      const lcol = dsFlags & DF_OVERLAP ? COL_ERROR : COL_LIGHT;
      dr.drawCircle(
        { x: dx + Math.floor(ts / 2), y: dy + Math.floor(ts / 2) },
        ds.crad,
        lcol,
        COL_BULB_RIM,
      );
    } else if (
      dsFlags & DF_IMPOSSIBLE &&
      (!(dsFlags & DF_LIT) || ui.drawBlobsWhenLit)
    ) {
      drawRuledOutCross(dr, box, dsFlags & DF_DARK ? COL_ERROR : COL_RULED_OUT);
    }
    // An open square shows no text, so its ring has none to keep clear of.
    if (ds.hint.ringed(i)) drawCellRing(dr, band, NOTHING_TO_CLEAR);
  }

  // Check & Save: this cell contradicts the unique solution (fork divergence;
  // upstream has no mistake overlay), a doubled inset frame.
  if (dsFlags & DF_WRONG) {
    drawRectOutline(dr, dx + 1, dy + 1, ts - 1, ts - 1, COL_ERROR);
    drawRectOutline(dr, dx + 2, dy + 2, ts - 3, ts - 3, COL_ERROR);
  }

  if (dsFlags & DF_CURSOR) {
    // Out at the corners of the tile, clear of a bulb.
    drawRectCorners(
      dr,
      dx + Math.floor(ts / 2),
      dy + Math.floor(ts / 2),
      Math.floor(ts / 2) - 2,
      COL_CURSOR,
      Math.max(2, ts >> 4),
    );
  }

  dr.drawUpdate({ x: dx, y: dy, w: ts, h: ts });
}

// --- redraw --------------------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: LightupDrawState,
  frame: Frame<LightupState, LightupUi, LightupMove, LightupHint, LightupMistake>,
): void {
  const { state, ui, flash, hint, mistakes } = frame;
  const ts = ds.tileSize;
  const { w, h } = state;

  ds.hint.pack(stepMarks(hint), (x, y) => idx(x, y, w));

  if (ds.tiles.firstFrame()) {
    // One line wide, like the grid: its top and left lie under the first
    // row's and column's own lines, its right and bottom close the last.
    drawRectOutline(dr, coord(0, ts), coord(0, ts), ts * w + 1, ts * h + 1, COL_GRID);
  }

  const wrong = mistakes?.length
    ? new Set(mistakes.map((m) => idx(m.x, m.y, w)))
    : null;
  const errors = errorFlags(state);

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const i = idx(x, y, w);
      let df = tileFlags(state, ui, x, y, flash, errors[i]);
      if (wrong?.has(i)) df |= DF_WRONG;
      if (ui.drawBlobsWhenLit) df |= DF_BLOBS_PREF;
      if (ds.tiles.changed(i, df)) tileRedraw(dr, ds, state, ui, x, y);
    }
  }
}
