/**
 * Magnets rendering — faithful port of `game_redraw` / `draw_tile` /
 * `draw_tile_col` / `draw_sym` / `draw_num` in `magnets.c`. Rounded-corner
 * dominoes (borrowed from dominosa), `+`/`−` magnet symbols, a green neutral
 * cross, a blue not-neutral `?`, singleton black squares, and the `+`/`−` clue
 * counts on all four borders with the corner `+`/`−` symbols.
 *
 * Geometry is upstream's `NARROW_BORDERS` layout: the canvas is `(w+2) × (h+2)`
 * tiles, a one-tile clue margin each side and no border beyond it.
 *
 * The per-tile cache packs the cell value plus every overlay (set / error /
 * cursor / not-flags / flash / mistake) into one `Int32Array` word, so the
 * diff key covers every overlay (docs/games/rendering.md § "Overlay
 * sidecars"); the four-border clue colors diff parallel per-clue arrays.
 */

import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import { BLUE, GREEN, RED } from "../../engine/color/colors.ts";
import {
  clueDoneColor,
  ERROR,
  FLASH,
  HINT_ACTION,
  HINT_EVIDENCE,
  highlightWash,
  INK,
} from "../../engine/color/palette.ts";
import { drawThickRectOutline, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { drawMarkSides, type MarkBand, outlineSides } from "../../engine/hint-mark.ts";
import type { Color, Size } from "../../engine/types.ts";
import type { MagnetsHighlights } from "./hint.ts";
import {
  COLUMN,
  clueIndex,
  countRowcol,
  EMPTY,
  GS_ERROR,
  GS_NOTNEGATIVE,
  GS_NOTNEUTRAL,
  GS_NOTPOSITIVE,
  GS_SET,
  type MagnetsMistake,
  type MagnetsState,
  type MagnetsUi,
  NEGATIVE,
  NEUTRAL,
  POSITIVE,
  ROW,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 32;
export const FLASH_TIME = 0.7;

// --- palette (mirrors the magnets.c color enum index-for-index) ----------
export const COL_BACKGROUND = 0;
export const COL_HIGHLIGHT = 1;
export const COL_LOWLIGHT = 2;
export const COL_TEXT = 3;
export const COL_ERROR = 4;
export const COL_CURSOR = 5;
export const COL_DONE = 6;
export const COL_NEUTRAL = 7;
export const COL_NEGATIVE = 8;
export const COL_POSITIVE = 9;
export const COL_NOT = 10;
// Fork mistake overlay, appended past the upstream enum.
export const COL_MISTAKE = 11;
/** The hint's action ring. The collection's blue, although the `?` mark is
 * blue too: the ring is a band on a square's border and the `?` a glyph in its
 * middle, so the two never read as one shape, and a ring on a domino about to
 * be marked `?` agrees with the mark rather than contradicting it. */
export const COL_HINT = 12;
/** The hint's evidence outline. */
export const COL_HINT_CELL = 13;

export function colors(defaultBackground: Color): Color[] {
  const { background, lowlight } = mkhighlight(defaultBackground);
  const out: Color[] = [];
  out[COL_BACKGROUND] = background;
  // The slot's only use is the solved flash's tile fill; nothing bevels with it.
  out[COL_HIGHLIGHT] = FLASH;
  out[COL_LOWLIGHT] = lowlight;
  out[COL_TEXT] = INK;
  out[COL_ERROR] = ERROR;
  // The cursor is a tile *fill* under the tile's own content, so it is the
  // "you are here" wash Solo's family uses, not the green mark — which would
  // in any case vanish on a neutral tile, whose fill is green.
  out[COL_CURSOR] = highlightWash(background);
  out[COL_DONE] = clueDoneColor(background);
  out[COL_NEUTRAL] = GREEN;
  out[COL_NEGATIVE] = INK;
  out[COL_POSITIVE] = RED;
  out[COL_NOT] = BLUE;
  out[COL_MISTAKE] = ERROR;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_CELL] = HINT_EVIDENCE;
  return out;
}

// --- packed tile bits (DS_*; which in the low nibble) ---------------------
const DS_WHICH_MASK = 0xf;
const DS_ERROR = 0x10;
const DS_CURSOR = 0x20;
const DS_SET = 0x40;
const DS_NOTPOS = 0x80;
const DS_NOTNEG = 0x100;
const DS_NOTNEU = 0x200;
const DS_FLASH = 0x400;
const DS_MISTAKE = 0x800; // fork overlay
// The hint's marks, as the sides of this square each role draws: part of the
// diff key, so a square whose outline changes repaints and takes the old one
// with it (docs/games/hints.md § "Where the band goes, and who rubs it out").
const DS_HINT_TARGET_SHIFT = 12;
const DS_HINT_AREA_SHIFT = 16;
/** The square is on the line the hint's sentence calls "this row/column". */
const DS_HINT_LINE = 1 << 20;

// --- geometry ---------------------------------------------------------------
/** The board's pixel origin: the clue row and column take one whole tile.
 * Exported so `interpretMove` reads the same number the painter does. */
export const origin = (ts: number): number => ts;
const coord = (n: number, ts: number) => (n + 1) * ts;

export function computeSize(p: { w: number; h: number }, ts: number): Size {
  return { w: ts * (p.w + 2), h: ts * (p.h + 2) };
}

// --- draw state -----------------------------------------------------------

export interface MagnetsDrawState {
  started: boolean;
  tileSize: number;
  w: number;
  h: number;
  /** Last-drawn packed word per tile; −1 forces a draw. */
  what: Int32Array;
  /** Last-drawn color per column clue (3·w: [neutral,+,−]); −1 forces. */
  colwhat: Int32Array;
  /** Last-drawn color per row clue (3·h). */
  rowwhat: Int32Array;
}

export function newDrawState(state: MagnetsState, tileSize: number): MagnetsDrawState {
  return {
    started: false,
    tileSize,
    w: state.w,
    h: state.h,
    what: new Int32Array(state.wh).fill(-1),
    colwhat: new Int32Array(state.w * 3).fill(-1),
    rowwhat: new Int32Array(state.h * 3).fill(-1),
  };
}

// --- symbol / tile drawing ------------------------------------------------

function drawSym(
  dr: GameDrawing,
  ts: number,
  x: number,
  y: number,
  which: number,
  col: number,
): void {
  const cx = coord(x, ts);
  const cy = coord(y, ts);
  const ccx = cx + Math.floor(ts / 2);
  const ccy = cy + Math.floor(ts / 2);
  const roff = Math.floor(ts / 4);
  const rsz = 2 * roff + 1;
  const soff = Math.floor(ts / 16);
  const ssz = 2 * soff + 1;

  if (which === POSITIVE || which === NEGATIVE) {
    dr.drawRect({ x: ccx - roff, y: ccy - soff, w: rsz, h: ssz }, col);
    if (which === POSITIVE) {
      dr.drawRect({ x: ccx - soff, y: ccy - roff, w: ssz, h: rsz }, col);
    }
  } else if (col === COL_NOT) {
    dr.drawText({ x: ccx, y: ccy }, glyphFont(Math.floor((7 * ts) / 10)), col, "?");
  } else {
    dr.drawLine(
      { x: ccx - roff, y: ccy - roff },
      { x: ccx + roff, y: ccy + roff },
      col,
      1,
    );
    dr.drawLine(
      { x: ccx + roff, y: ccy - roff },
      { x: ccx - roff, y: ccy + roff },
      col,
      1,
    );
  }
}

const TYPE_L = 0;
const TYPE_R = 1;
const TYPE_T = 2;
const TYPE_B = 3;

/** Fill the domino covering `(x, y)` with `bg` (rounded outer corners), hatch
 * the square when it is on the hint's line, then draw its symbol in `fg` (skip
 * when `fg < 0`): the hatch goes between the two so the symbol stays whole.
 * NOT responsible for the tile background or draw_update. Upstream
 * draw_tile_col. */
function drawTileCol(
  dr: GameDrawing,
  ds: MagnetsDrawState,
  dominoes: Int32Array,
  x: number,
  y: number,
  which: number,
  bg: number,
  fg: number,
  perc: number,
  hatch: boolean,
): void {
  const ts = ds.tileSize;
  const cx = coord(x, ts);
  const cy = coord(y, ts);
  const gutter =
    Math.floor(ts / 16) + Math.floor(((100 - perc) * (7 * Math.floor(ts / 16))) / 100);
  const radius = Math.floor((perc * Math.floor(ts / 8)) / 100);
  const coffset = gutter + radius;

  const i = y * ds.w + x;
  const other = dominoes[i];
  const hatchSquare = () => {
    if (hatch) dr.drawHatch({ x: cx, y: cy, w: ts, h: ts }, COL_HINT, hatchPeriod(ts));
  };
  if (other === i) {
    hatchSquare();
    return;
  }
  let type = TYPE_B;
  if (other === i + 1) type = TYPE_L;
  else if (other === i - 1) type = TYPE_R;
  else if (other === i + ds.w) type = TYPE_T;

  const circ = (px: number, py: number) =>
    dr.drawCircle({ x: px, y: py }, radius, bg, bg);
  if (type === TYPE_L || type === TYPE_T) circ(cx + coffset, cy + coffset);
  if (type === TYPE_R || type === TYPE_T) circ(cx + ts - 1 - coffset, cy + coffset);
  if (type === TYPE_L || type === TYPE_B) circ(cx + coffset, cy + ts - 1 - coffset);
  if (type === TYPE_R || type === TYPE_B)
    circ(cx + ts - 1 - coffset, cy + ts - 1 - coffset);

  for (let k = 0; k < 2; k++) {
    let x1 = cx + (k ? gutter : coffset);
    let y1 = cy + (k ? coffset : gutter);
    let x2 = cx + ts - 1 - (k ? gutter : coffset);
    let y2 = cy + ts - 1 - (k ? coffset : gutter);
    if (type === TYPE_L) x2 = cx + ts;
    else if (type === TYPE_R) x1 = cx;
    else if (type === TYPE_T) y2 = cy + ts;
    else if (type === TYPE_B) y1 = cy;
    dr.drawRect({ x: x1, y: y1, w: x2 - x1 + 1, h: y2 - y1 + 1 }, bg);
  }

  hatchSquare();
  if (fg !== -1) drawSym(dr, ts, x, y, which, fg);
}

function drawTile(
  dr: GameDrawing,
  ds: MagnetsDrawState,
  dominoes: Int32Array,
  x: number,
  y: number,
  packed: number,
): void {
  const ts = ds.tileSize;
  const cx = coord(x, ts);
  const cy = coord(y, ts);
  let which = packed & DS_WHICH_MASK;
  const flags = packed & ~DS_WHICH_MASK;
  let perc = 100;

  dr.drawRect({ x: cx, y: cy, w: ts, h: ts }, COL_BACKGROUND);

  let bg: number;
  if (flags & DS_CURSOR) bg = COL_CURSOR;
  else if (which === POSITIVE) bg = COL_POSITIVE;
  else if (which === NEGATIVE) bg = COL_NEGATIVE;
  else if (flags & DS_SET) bg = COL_NEUTRAL;
  else bg = COL_LOWLIGHT;

  let fg: number;
  if (which === EMPTY && !(flags & DS_SET)) {
    let notwhich = -1;
    fg = -1;
    if (flags & DS_NOTPOS) notwhich = POSITIVE;
    if (flags & DS_NOTNEG) notwhich = NEGATIVE;
    if (flags & DS_NOTNEU) notwhich = NEUTRAL;
    if (notwhich !== -1) {
      which = notwhich;
      fg = COL_NOT;
    }
  } else {
    fg = flags & DS_ERROR ? COL_ERROR : flags & DS_CURSOR ? COL_TEXT : COL_BACKGROUND;
  }

  if (flags & DS_FLASH) {
    drawTileCol(dr, ds, dominoes, x, y, which, COL_HIGHLIGHT, -1, perc, false);
    perc = Math.floor((3 * perc) / 4);
  }
  drawTileCol(dr, ds, dominoes, x, y, which, bg, fg, perc, !!(flags & DS_HINT_LINE));

  // Fork findMistakes overlay: an inset red outline (distinct from symbol red).
  if (flags & DS_MISTAKE) {
    const thick = Math.max(1, Math.floor(ts / 16));
    const inset = Math.max(2, Math.floor(ts / 8));
    const sx = cx + inset;
    const sy = cy + inset;
    const span = ts - 2 * inset;
    drawThickRectOutline(dr, sx, sy, span, span, thick, COL_MISTAKE);
  }

  dr.drawUpdate({ x: cx, y: cy, w: ts, h: ts });
}

// --- clue numbers ---------------------------------------------------------

/** Added to a clue slot's drawn color when the slot is hatched: above every
 * palette index, so the two never collide in `colwhat`/`rowwhat`. */
const CLUE_HATCHED = 0x100;

/** A clue slot: its background, the hint's hatch when its line is hatched, and
 * the count unless it was stripped. A stripped slot still paints, since a hatch
 * can come and go on it. */
function drawNum(
  dr: GameDrawing,
  ds: MagnetsDrawState,
  rowcol: number,
  which: number,
  idx: number,
  col: number,
  num: number,
  hatched: boolean,
): void {
  const ts = ds.tileSize;
  const text = String(num);
  const tsz =
    text.length === 1
      ? Math.floor((7 * ts) / 10)
      : Math.floor((9 * ts) / 10 / text.length);

  let cx: number;
  let cy: number;
  if (rowcol === ROW) {
    cx = which === NEGATIVE ? ts * (ds.w + 1) : 0;
    cy = ts * (idx + 1);
  } else {
    cx = ts * (idx + 1);
    cy = which === NEGATIVE ? ts * (ds.h + 1) : 0;
  }

  dr.drawRect({ x: cx, y: cy, w: ts, h: ts }, COL_BACKGROUND);
  if (hatched) dr.drawHatch({ x: cx, y: cy, w: ts, h: ts }, COL_HINT, hatchPeriod(ts));
  if (num >= 0) {
    dr.drawText(
      { x: cx + Math.floor(ts / 2), y: cy + Math.floor(ts / 2) },
      glyphFont(tsz),
      col,
      text,
    );
  }
  dr.drawUpdate({ x: cx, y: cy, w: ts, h: ts });
}

function getCountColor(
  state: MagnetsState,
  rowcol: number,
  which: number,
  index: number,
  target: number,
  hinted: ReadonlySet<number>,
  reasons: ReadonlySet<number>,
): number {
  const { w, h } = state;
  const count = countRowcol(state, index, rowcol, which);
  if (
    count > target ||
    (count < target && countRowcol(state, index, rowcol, -1) === 0)
  ) {
    return COL_ERROR;
  }
  const idx =
    rowcol === COLUMN
      ? clueIndex(w, h, index, which === POSITIVE ? -1 : h)
      : clueIndex(w, h, which === POSITIVE ? -1 : w, index);
  // The clue a hint counts with takes the action color, tying the line the
  // sentence calls "this row" to its count (docs/games/hints.md § "Off-board
  // evidence").
  if (hinted.has(idx)) return COL_HINT;
  // A met line cited as a reason is evidence, and named in words by where it
  // is ("the column beside it"), never "this".
  if (reasons.has(idx)) return COL_HINT_CELL;
  if (state.countsDone[idx]) return COL_DONE;
  return COL_TEXT;
}

/**
 * Where a hint mark sits around square `(x, y)`: inside its own box, over the
 * gutter that rounds each domino off from the next, so the band sits beside
 * the domino rather than on it. A square whose marks change repaints itself and
 * takes the old ones with it.
 */
function markBand(ts: number, x: number, y: number): MarkBand {
  return {
    box: { x: coord(x, ts), y: coord(y, ts), w: ts, h: ts },
    outer: 0,
    inner: Math.max(2, ts >> 4),
  };
}

// --- redraw ---------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: MagnetsDrawState,
  state: MagnetsState,
  ui: MagnetsUi,
  flashTime: number,
  mistakes?: readonly MagnetsMistake[],
  hint?: HintStep<unknown, MagnetsHighlights>,
): void {
  const ts = ds.tileSize;
  const { w, h, grid, flags, common } = state;
  const { dominoes, colcount, rowcount } = common;

  const flash = Math.floor((flashTime * 5) / FLASH_TIME) % 2 !== 0;

  if (!ds.started) {
    // Corner +/− symbols.
    drawSym(dr, ts, -1, -1, POSITIVE, COL_TEXT);
    drawSym(dr, ts, w, h, NEGATIVE, COL_TEXT);
  }

  const mistakeSet = new Set<number>();
  if (mistakes) for (const m of mistakes) mistakeSet.add(m.y * w + m.x);

  const cx = ui.cursor.visible ? ui.cursor.x : -1;
  const cy = ui.cursor.visible ? ui.cursor.y : -1;

  // A domino the hint decides, or reasons from, is one ring around its squares
  // in that role: each square draws only the sides not shared with its partner.
  // The line the sentence counts is the hatch, so no outline has to trace it.
  const hintTargets = new Set(hint?.highlights?.targets);
  const area = new Set(hint?.highlights?.area);
  const hintedClues = new Set(hint?.highlights?.clues);
  const reasonClues = new Set(hint?.highlights?.reasonClues);
  const line = hint?.highlights?.line ?? null;
  const onLine = (roworcol: number, num: number): boolean =>
    line !== null && line.roworcol === roworcol && line.num === num;
  const inSet =
    (set: ReadonlySet<number>) =>
    (x: number, y: number): boolean =>
      x >= 0 && x < w && y >= 0 && y < h && set.has(y * w + x);
  const inTargets = inSet(hintTargets);
  const inArea = inSet(area);
  const marked: number[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      let c = grid[idx];
      // Each role joins a square only to its own partner, so two dominoes side
      // by side stay two shapes rather than one that is not on the board.
      const partnerIn =
        (inRole: (x: number, y: number) => boolean) => (nx: number, ny: number) =>
          inRole(nx, ny) && dominoes[idx] === ny * w + nx;
      const targetSides = hintTargets.has(idx)
        ? outlineSides(x, y, partnerIn(inTargets))
        : 0;
      const areaSides = area.has(idx) ? outlineSides(x, y, partnerIn(inArea)) : 0;
      if (targetSides || areaSides) marked.push(idx);
      c |= targetSides << DS_HINT_TARGET_SHIFT;
      c |= areaSides << DS_HINT_AREA_SHIFT;
      if (onLine(ROW, y) || onLine(COLUMN, x)) c |= DS_HINT_LINE;
      if (flags[idx] & GS_ERROR) c |= DS_ERROR;
      if (flags[idx] & GS_SET) c |= DS_SET;
      if (x === cx && y === cy) c |= DS_CURSOR;
      if (flash) c |= DS_FLASH;
      if (flags[idx] & GS_NOTPOSITIVE) c |= DS_NOTPOS;
      if (flags[idx] & GS_NOTNEGATIVE) c |= DS_NOTNEG;
      if (flags[idx] & GS_NOTNEUTRAL) c |= DS_NOTNEU;
      if (mistakeSet.has(idx)) c |= DS_MISTAKE;
      if (ds.what[idx] !== c) {
        drawTile(dr, ds, dominoes, x, y, c);
        ds.what[idx] = c;
      }
    }
  }

  // After every tile, and every frame: a domino's body reaches a pixel into
  // its partner's box, so a partner repainting for its own reasons can clip a
  // band it did not draw. The evidence first, so a side both roles want is the
  // target's.
  for (const role of [DS_HINT_AREA_SHIFT, DS_HINT_TARGET_SHIFT]) {
    for (const idx of marked) {
      const sides = (ds.what[idx] >> role) & 0xf;
      const color = role === DS_HINT_TARGET_SHIFT ? COL_HINT : COL_HINT_CELL;
      drawMarkSides(dr, markBand(ts, idx % w, Math.floor(idx / w)), sides, color);
    }
  }

  // Clue counts around the four borders.
  for (const which of [POSITIVE, NEGATIVE]) {
    for (const [rowcol, n, targets, drawn] of [
      [COLUMN, w, colcount, ds.colwhat],
      [ROW, h, rowcount, ds.rowwhat],
    ] as const) {
      for (let i = 0; i < n; i++) {
        const index = i * 3 + which;
        const color = getCountColor(
          state,
          rowcol,
          which,
          i,
          targets[index],
          hintedClues,
          reasonClues,
        );
        // The hatch runs on through the line's clue slots, so the strip ends at
        // the count it is read against. Part of the key, as a color is.
        const hatched = onLine(rowcol, i);
        const key = color + (hatched ? CLUE_HATCHED : 0);
        if (drawn[index] !== key) {
          drawNum(dr, ds, rowcol, which, i, color, targets[index], hatched);
          drawn[index] = key;
        }
      }
    }
  }

  ds.started = true;
}
