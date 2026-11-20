/**
 * Wordguess's rendering: the rows of guesses, a tile a letter. Each tile
 * repaints only when its packed key changes (docs/rendering.md § "The tile
 * cache and the diff key").
 *
 * A score is told by shape as well as color, so it reads without color: a
 * letter in place sits on a filled square, a letter elsewhere on a disc, and a
 * letter the answer has no copy of to spare on the bare surface, in faint ink.
 */

import {
  cellSurface,
  clueDoneColor,
  GOAL,
  INK,
  PAPER,
  SHADED,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import {
  COL_BACKGROUND,
  COL_CURSOR,
  COL_ERROR,
  FIRST_GAME_SLOT,
  rolePalette,
} from "../../engine/color/roles.ts";
import type { GameDrawing, HintStep } from "../../engine/contract/game.ts";
import { stepMarks } from "../../engine/contract/hint-words.ts";
import type { Color, Point, Rect, Size } from "../../engine/contract/types.ts";
import { glyphFont } from "../../engine/render/draw.ts";
import { textBox } from "../../engine/render/ring.ts";
import { TileCache } from "../../engine/render/tile-cache.ts";
import {
  type Flash,
  sweepStep,
  type WinTone,
  winSlot,
} from "../../engine/render/win-wave.ts";
import { SQUARE } from "./hint-marks.ts";
import {
  ELSEWHERE,
  IN_PLACE,
  letterOf,
  outcome,
  type WordguessMove,
  type WordguessParams,
  type WordguessState,
  type WordguessUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 40;

// --- palette ----------------------------------------------------------------

// The frame of a refused row is `COL_ERROR`.
const COL_GRID = FIRST_GAME_SLOT;
const COL_CELL = FIRST_GAME_SLOT + 1;
const COL_TEXT = FIRST_GAME_SLOT + 2;
/** A letter the answer has no copy of to spare: faint, as a retired clue. */
const COL_ABSENT_TEXT = FIRST_GAME_SLOT + 3;
/** The square under a letter in place: the pair's first member, a placed piece. */
export const COL_IN_PLACE = FIRST_GAME_SLOT + 4;
/** The disc under a letter elsewhere: the pair's second member. */
export const COL_ELSEWHERE = FIRST_GAME_SLOT + 5;
/** Ink on a letter in place, whose square is dark in both schemes. */
const COL_ON_IN_PLACE = FIRST_GAME_SLOT + 6;

export function colors(defaultBackground: Color): Color[] {
  const out = rolePalette(defaultBackground);
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_TEXT] = INK;
  out[COL_ABSENT_TEXT] = clueDoneColor(cellSurface(defaultBackground));
  out[COL_IN_PLACE] = SHADED;
  out[COL_ELSEWHERE] = GOAL;
  out[COL_ON_IN_PLACE] = PAPER;
  return out;
}

// --- geometry ---------------------------------------------------------------

const gapOf = (ts: number): number => Math.max(2, Math.floor(ts / 8));
const pitchOf = (ts: number): number => ts + gapOf(ts);
const borderOf = (ts: number): number => Math.floor(ts / 2);

type Layout = Pick<WordguessParams, "len" | "nguesses">;

export function computeSize(p: Layout, ts: number): Size {
  const b = borderOf(ts);
  return {
    w: 2 * b + p.len * pitchOf(ts) - gapOf(ts),
    h: 2 * b + p.nguesses * pitchOf(ts) - gapOf(ts),
  };
}

/** The tile of slot `pos` in row `row` of the guesses. */
export function tileRect(ts: number, row: number, pos: number): Rect {
  const b = borderOf(ts);
  return { x: b + pos * pitchOf(ts), y: b + row * pitchOf(ts), w: ts, h: ts };
}

const inside = (r: Rect, x: number, y: number): boolean =>
  x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

export const centerOf = (r: Rect): Point => ({
  x: r.x + Math.floor(r.w / 2),
  y: r.y + Math.floor(r.h / 2),
});

/** The working row's slot at `(x, y)`, or `-1`. */
export function workingSlotAt(
  s: WordguessState,
  ts: number,
  x: number,
  y: number,
): number {
  for (let pos = 0; pos < s.params.len; pos++) {
    if (inside(tileRect(ts, s.rows.length, pos), x, y)) return pos;
  }
  return -1;
}

// --- draw state -------------------------------------------------------------

export interface WordguessDrawState {
  tileSize: number;
  params: WordguessParams;
  /** What each guess tile shows, row-major. */
  tiles: TileCache;
}

export function newDrawState(
  state: WordguessState,
  tileSize: number,
): WordguessDrawState {
  const { len, nguesses } = state.params;
  return {
    tileSize,
    params: state.params,
    tiles: new TileCache(len * nguesses),
  };
}

// --- a guess tile -----------------------------------------------------------

/** No score: a working or empty tile. */
const UNSCORED = 3;
const K_MARK = 5;
const F_CURSOR = 1 << 7;
/** The working row is ready, and the cursor is on its submit position. */
const F_SUBMIT = 1 << 8;
const K_TONE = 9;
/** The working row was sent and refused. */
const F_REFUSED = 1 << 11;
/** A hint's guess goes in the square: a ring. */
const F_RINGED = 1 << 13;

interface Tile {
  letter: number;
  mark: number;
  cursor: boolean;
  submit: boolean;
  refused: boolean;
  ringed: boolean;
  tone: WinTone;
}

const tileKey = (t: Tile): number =>
  t.letter |
  (t.mark << K_MARK) |
  (t.cursor ? F_CURSOR : 0) |
  (t.submit ? F_SUBMIT : 0) |
  (t.refused ? F_REFUSED : 0) |
  (t.ringed ? F_RINGED : 0) |
  (t.tone << K_TONE);

function frame(dr: GameDrawing, r: Rect, thickness: number, color: number): void {
  dr.drawRect({ x: r.x, y: r.y, w: r.w, h: thickness }, color);
  dr.drawRect({ x: r.x, y: r.y + r.h - thickness, w: r.w, h: thickness }, color);
  dr.drawRect({ x: r.x, y: r.y, w: thickness, h: r.h }, color);
  dr.drawRect({ x: r.x + r.w - thickness, y: r.y, w: thickness, h: r.h }, color);
}

function drawTile(dr: GameDrawing, ts: number, r: Rect, t: Tile): void {
  const gap = gapOf(ts);
  const room = {
    x: r.x - Math.floor(gap / 2),
    y: r.y - Math.floor(gap / 2),
    w: r.w + gap,
    h: r.h + gap,
  };
  dr.drawRect(room, COL_BACKGROUND);
  dr.drawRect(r, COL_GRID);
  const surface = { x: r.x + 1, y: r.y + 1, w: r.w - 2, h: r.h - 2 };
  dr.drawRect(surface, t.tone ? winSlot(t.tone) : COL_CELL);

  let ink = COL_TEXT;
  if (t.mark === IN_PLACE && !t.tone) {
    dr.drawRect(surface, COL_IN_PLACE);
    ink = COL_ON_IN_PLACE;
  } else if (t.mark === ELSEWHERE) {
    const c = centerOf(r);
    dr.drawCircle(c, Math.floor(ts * 0.42), COL_ELSEWHERE, COL_ELSEWHERE);
  } else if (t.mark !== UNSCORED && !t.tone) {
    ink = COL_ABSENT_TEXT;
  }
  const font = glyphFont(Math.floor(ts * 0.6));
  const text = letterOf(t.letter).toUpperCase();
  if (t.letter > 0) dr.drawText(centerOf(r), font, ink, text);
  if (t.ringed) {
    const enclose = t.letter > 0 ? [textBox(centerOf(r), font, text)] : [];
    dr.drawRing(r, { enclose, avoid: [] }, 1, { room });
  }
  const line = Math.max(2, ts >> 4);
  if (t.refused) frame(dr, room, line, COL_ERROR);
  else if (t.submit) frame(dr, room, line, COL_CURSOR);
  else if (t.cursor) frame(dr, r, line, COL_CURSOR);
  dr.drawUpdate(room);
}

// --- redraw -----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: WordguessDrawState,
  _prev: WordguessState | null,
  state: WordguessState,
  _dir: number,
  ui: WordguessUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<WordguessMove>,
): void {
  const ts = ds.tileSize;
  const { len, nguesses } = state.params;
  const o = outcome(state);
  const working = o !== 0 ? -1 : state.rows.length;
  const winRow = o > 0 ? state.rows.length - 1 : -1;
  const ringed = new Set(stepMarks(hint).of("ring", SQUARE));

  for (let row = 0; row < nguesses; row++) {
    for (let pos = 0; pos < len; pos++) {
      const scored = state.rows[row];
      const onWorking = row === working;
      const tile: Tile = {
        letter: scored ? scored.letters[pos] : onWorking ? ui.entries[pos] : 0,
        mark: scored ? scored.marks[pos] : UNSCORED,
        cursor: onWorking && ui.cursor.visible && ui.cursor.x === pos,
        submit: onWorking && ui.cursor.visible && ui.ready && ui.cursor.x === len,
        refused: onWorking && ui.refused,
        ringed: onWorking && ringed.has(pos),
        tone: row === winRow ? flash.win(sweepStep(pos, 0)) : 0,
      };
      if (ds.tiles.changed(row * len + pos, tileKey(tile)))
        drawTile(dr, ts, tileRect(ts, row, pos), tile);
    }
  }
}
