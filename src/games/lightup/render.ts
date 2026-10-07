/**
 * Light Up rendering: a per-tile diffed loop over a packed display-flag word
 * per cell (docs/games/rendering.md § "The tile cache and the diff key"), on
 * the collection's quiet surface. A wall is a solid black block with its clue
 * (red when provably wrong); an open square is the cell surface, washed yellow
 * when lit; a bulb is a white disc (red when lit by another bulb); the
 * impossible-mark is the ruled-out dot; and the completion flash blinks the
 * lit squares to the lifted surface.
 */

import { BLACK, WHITE, YELLOW_WASH } from "../../engine/color/colors.ts";
import {
  CURSOR,
  cellSurface,
  ERROR,
  givenSurface,
  HINT_ACTION,
  HINT_BLACKREF,
  HINT_EVIDENCE_WASH,
  HINT_WHITEREF,
  RULED_OUT,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawRectCorners, drawRectOutline, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { drawMarkSides, MARK_ALL } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { drawRuledOutDot } from "../../engine/piece.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import type { LightupHint, LightupMistake } from "./index.ts";
import {
  F_BLACK,
  F_IMPOSSIBLE,
  F_LIGHT,
  F_NUMBERED,
  idx,
  type LightupMove,
  type LightupState,
  type LightupUi,
  numberWrong,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 32;
export const FLASH_TIME = 0.3;

// --- palette -------------------------------------------------------------------

export const COL_BACKGROUND = 0;
export const COL_GRID = 1; // the line between two cells, and the frame
export const COL_BLACK = 2;
export const COL_LIGHT = 3; // white: bulbs and clue digits
export const COL_LIT = 4; // yellow lit-square fill
export const COL_ERROR = 5;
export const COL_CURSOR = 6;
// Fork hint colors. The digit of a driving clue recolors COL_HINT (the
// Pattern clue↔move tie).
export const COL_HINT = 7; // forced cell(s), blue fill (highlight only)
export const COL_HINT_CELL = 8; // evidence: the shade on a *dark* square
export const COL_HINT_LITERF = 9; // cited lit/bulb premise (green ring)
export const COL_HINT_DARKREF = 10; // the unlit square a deduction is about (pink ring)
/** The player's "no light here" dot. Its own slot rather than upstream's wall
 * `COL_BLACK`, which stays black in both schemes and sank into a dark board. */
export const COL_RULED_OUT = 11;
export const COL_CELL = 12; // the surface of an open square no bulb lights
/** What a lit square blinks to in the completion flash: a lifted surface,
 * which is a step off the yellow in both schemes. */
export const COL_FLASH = 13;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_FLASH] = givenSurface(defaultBackground);
  // Pinned: a wall *is* black and a bulb *is* white, in either scheme.
  out[COL_BLACK] = BLACK;
  out[COL_LIGHT] = WHITE;
  // The **wash** step, not plain yellow: a lit square is a large fill under
  // bulbs and digits and must read as *the board, lit*, not as an object on it.
  // Plain yellow is a near-board tint under a light scheme and a bright patch
  // under a dark one.
  out[COL_LIT] = YELLOW_WASH;
  // The full red, not its wash: it is a clue's digit on a black wall and the
  // disc of a bulb another bulb lights, and the wash is as dark as the wall
  // in the dark scheme.
  out[COL_ERROR] = ERROR;
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_CELL] = HINT_EVIDENCE_WASH;
  out[COL_HINT_LITERF] = HINT_BLACKREF;
  // The unlit square is the *empty* reference cell, so it takes the white-ref
  // premise color (Pattern's and Singles' empty reference is the same pink).
  out[COL_HINT_DARKREF] = HINT_WHITEREF;
  out[COL_RULED_OUT] = RULED_OUT;
  return out;
}

// --- geometry -----------------------------------------------------------------

export const border = (ts: number): number => Math.floor(ts / 2);
export const coord = (v: number, ts: number): number => v * ts + border(ts);

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
const DF_FLASH = 128;
const DF_IMPOSSIBLE = 256;
/** Fork addition: this cell contradicts the unique solution (Check & Save). */
const DF_WRONG = 512;
/** Fork addition: the show-lit-blobs pref, in the key so a toggle repaints. */
const DF_BLOBS_PREF = 1024;
// Fork additions: the displayed hint step, in the key so hint changes repaint.
const DF_HINT_TARGET = 2048; // forced cell — blue COL_HINT fill
const DF_HINT_AREA = 4096; // evidence — shade when dark, green ring when lit
const DF_HINT_DARKREF = 8192; // the unlit square the deduction is about — pink ring
const DF_HINT_CLUE = 16384; // driving clue — digit recolored

export interface LightupDrawState {
  started: boolean;
  tileSize: number;
  crad: number;
  cache: Int32Array;
}

export function newDrawState(state: LightupState, tileSize: number): LightupDrawState {
  return {
    started: false,
    tileSize,
    crad: Math.floor((3 * (tileSize - 1)) / 8),
    cache: new Int32Array(state.w * state.h).fill(-1),
  };
}

// --- per-tile flags + draw -------------------------------------------------------

function tileFlags(
  state: LightupState,
  ui: LightupUi,
  x: number,
  y: number,
  flashing: boolean,
): number {
  const i = idx(x, y, state.w);
  const flags = state.flags[i];
  const lights = state.lights[i];
  let ret = 0;

  if (flashing) ret |= DF_FLASH;
  if (ui.cursor.visible && x === ui.cursor.x && y === ui.cursor.y) ret |= DF_CURSOR;

  if (flags & F_BLACK) {
    ret |= DF_BLACK;
    if (flags & F_NUMBERED) {
      if (numberWrong(state, x, y)) ret |= DF_NUMBERWRONG;
      ret |= DF_NUMBERED;
    }
  } else {
    if (lights > 0) ret |= DF_LIT;
    if (flags & F_LIGHT) {
      ret |= DF_LIGHT;
      if (lights > 1) ret |= DF_OVERLAP;
    }
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
  const dsFlags = ds.cache[idx(x, y, state.w)];
  const dx = coord(x, ts);
  const dy = coord(y, ts);
  const lit = dsFlags & DF_FLASH ? COL_FLASH : COL_LIT;
  // An open square's surface, inside the grid line on its top and left. The
  // lines on its other two sides are its neighbors', or the frame's.
  const box = { x: dx + 1, y: dy + 1, w: ts - 1, h: ts - 1 };
  /** A doubled inset ring. */
  const ring = (color: number): void => {
    drawRectOutline(dr, dx + 1, dy + 1, ts - 1, ts - 1, color);
    drawRectOutline(dr, dx + 2, dy + 2, ts - 3, ts - 3, color);
  };

  if (dsFlags & DF_BLACK) {
    // The whole tile, grid lines included, so a run of walls is one block.
    dr.drawRect({ x: dx, y: dy, w: ts, h: ts }, COL_BLACK);
    if (dsFlags & DF_NUMBERED) {
      // A hint's driving clue recolors its digit COL_HINT (the Pattern
      // clue↔move tie; the light COL_HINT_CELL would be unreadable as a
      // cue — nearly white on black). A provably-wrong clue stays red.
      const ccol =
        dsFlags & DF_NUMBERWRONG
          ? COL_ERROR
          : dsFlags & DF_HINT_CLUE
            ? COL_HINT
            : COL_LIGHT;
      // The clue value never changes over the game, so it is not part of
      // the diff key (upstream's observation).
      dr.drawText(
        { x: dx + Math.floor(ts / 2), y: dy + Math.floor(ts / 2) },
        glyphFont(Math.floor((ts * 3) / 5)),
        ccol,
        String(state.lights[idx(x, y, state.w)]),
      );
    }
  } else {
    // Hint roles (fork): the target is **ringed** COL_HINT, so a light or blob
    // already on it stays visible. A *dark* evidence square is shaded
    // COL_HINT_CELL, which keeps its premise (not lit: the shade is not
    // yellow); a *lit* one's premise is the yellow itself, so it keeps its
    // fill and takes a ring instead.
    const fill =
      dsFlags & DF_HINT_AREA && !(dsFlags & DF_LIT)
        ? COL_HINT_CELL
        : dsFlags & DF_LIT
          ? lit
          : COL_CELL;
    dr.drawRect({ x: dx, y: dy, w: ts, h: ts }, COL_GRID);
    dr.drawRect(box, fill);
    if (dsFlags & DF_HINT_TARGET) {
      drawMarkSides(
        dr,
        { box, outer: 0, inner: Math.max(2, ts >> 4) },
        MARK_ALL,
        COL_HINT,
      );
    }
    if (dsFlags & DF_HINT_AREA && dsFlags & DF_LIT) ring(COL_HINT_LITERF);
    if (dsFlags & DF_HINT_DARKREF) ring(COL_HINT_DARKREF);
    if (dsFlags & DF_LIGHT) {
      const lcol = dsFlags & DF_OVERLAP ? COL_ERROR : COL_LIGHT;
      dr.drawCircle(
        { x: dx + Math.floor(ts / 2), y: dy + Math.floor(ts / 2) },
        ds.crad,
        lcol,
        COL_BLACK,
      );
    } else if (
      dsFlags & DF_IMPOSSIBLE &&
      (!(dsFlags & DF_LIT) || ui.drawBlobsWhenLit)
    ) {
      drawRuledOutDot(dr, box, COL_RULED_OUT);
    }
  }

  // Check & Save: this cell contradicts the unique solution (fork divergence;
  // upstream has no mistake overlay).
  if (dsFlags & DF_WRONG) ring(COL_ERROR);

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
  _prev: LightupState | null,
  state: LightupState,
  _dir: number,
  ui: LightupUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<LightupMove, LightupHint>,
  mistakes?: readonly LightupMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h } = state;

  // Per-cell hint-role bits for the displayed step (fork addition).
  const hintBits = new Map<number, number>();
  const add = (cells: readonly Point[], bit: number): void => {
    for (const c of cells) {
      const i = idx(c.x, c.y, w);
      hintBits.set(i, (hintBits.get(i) ?? 0) | bit);
    }
  };
  // The evidence is all outlined, in one of three glyphs: the dark square's
  // double ring, the clue's recolored digit, or the rest of the set's shade
  // or ring. The step's highlights say which outlined square is which.
  const marks = stepMarks(hint);
  const hl = hint?.highlights;
  add(marks.of("ring", CELL), DF_HINT_TARGET);
  const is = (c: Point, p?: Point): boolean =>
    p !== undefined && c.x === p.x && c.y === p.y;
  for (const c of marks.of("outline", CELL)) {
    const bit = is(c, hl?.dark)
      ? DF_HINT_DARKREF
      : is(c, hl?.clue)
        ? DF_HINT_CLUE
        : DF_HINT_AREA;
    add([c], bit);
  }

  const flashing = flashTime > 0 && Math.floor((flashTime * 3) / FLASH_TIME) !== 1;

  if (!ds.started) {
    // One line wide, like the grid: its top and left lie under the first
    // row's and column's own lines, its right and bottom close the last.
    drawRectOutline(dr, coord(0, ts), coord(0, ts), ts * w + 1, ts * h + 1, COL_GRID);
    ds.started = true;
  }

  const wrong = mistakes?.length
    ? new Set(mistakes.map((m) => idx(m.x, m.y, w)))
    : null;

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const i = idx(x, y, w);
      let df = tileFlags(state, ui, x, y, flashing);
      if (wrong?.has(i)) df |= DF_WRONG;
      if (ui.drawBlobsWhenLit) df |= DF_BLOBS_PREF;
      df |= hintBits.get(i) ?? 0;
      if (ds.cache[i] !== df) {
        ds.cache[i] = df;
        tileRedraw(dr, ds, state, ui, x, y);
      }
    }
  }
}
