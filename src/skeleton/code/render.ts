/**
 * Skeleton's rendering: the rows of guesses, a tile a digit, and below them
 * the answer row, a slot a digit of the code, each showing the digits still
 * possible there. Each tile and slot repaints only when its packed key
 * changes (docs/rendering.md § "The tile cache and the diff key").
 *
 * A score is told by shape as well as color, so it reads without color: a
 * digit in place sits on a filled square, a digit elsewhere on a disc, and a
 * digit the code does not have on the bare surface, in faint ink.
 */

import {
  cellSurface,
  clueDoneColor,
  GOAL,
  INK,
  PAPER,
  PENCIL_BODY,
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
import type { Frame, GameDrawing } from "../../engine/contract/game.ts";
import { stepMarks } from "../../engine/contract/hint-words.ts";
import type { Color, Point, Rect, Size } from "../../engine/contract/types.ts";
import { glyphFont } from "../../engine/render/draw.ts";
import { hatchPeriod } from "../../engine/render/hatch.ts";
import {
  type PencilIndicatorCache,
  type PencilIndicatorStyle,
  pencilIndicatorBox,
  pencilIndicatorReach,
  repaintPencilIndicator,
} from "../../engine/render/pencil-indicator.ts";
import { textBox } from "../../engine/render/ring.ts";
import { TileCache } from "../../engine/render/tile-cache.ts";
import { sweepStep, type WinTone, winSlot } from "../../engine/render/win-wave.ts";
import { DIGIT, ROW, SQUARE } from "./hint-marks.ts";
import {
  ELSEWHERE,
  IN_PLACE,
  outcome,
  type SkeletonMistake,
  type SkeletonMove,
  type SkeletonParams,
  type SkeletonState,
  type SkeletonUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 40;

// --- palette ----------------------------------------------------------------

// The roles (`roles.ts`) are the engine's: `COL_ERROR` is the frame of a
// refused row, and of an answer slot ruling out its digit. The game's own
// colors start at `FIRST_GAME_SLOT`.
const COL_GRID = FIRST_GAME_SLOT;
const COL_CELL = FIRST_GAME_SLOT + 1;
const COL_TEXT = FIRST_GAME_SLOT + 2;
/** A digit the code does not have: faint, as a retired clue. */
const COL_ABSENT_TEXT = FIRST_GAME_SLOT + 3;
/** The square under a digit in place. */
export const COL_IN_PLACE = FIRST_GAME_SLOT + 4;
/** The disc under a digit elsewhere. */
const COL_ELSEWHERE = FIRST_GAME_SLOT + 5;
/** Ink on a digit in place, whose square is dark in both schemes. */
const COL_ON_IN_PLACE = FIRST_GAME_SLOT + 6;
const COL_PENCIL = FIRST_GAME_SLOT + 7;

export function colors(defaultBackground: Color): Color[] {
  const out = rolePalette(defaultBackground);
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_TEXT] = INK;
  out[COL_ABSENT_TEXT] = clueDoneColor(cellSurface(defaultBackground));
  out[COL_IN_PLACE] = SHADED;
  out[COL_ELSEWHERE] = GOAL;
  out[COL_ON_IN_PLACE] = PAPER;
  out[COL_PENCIL] = PENCIL_BODY;
  return out;
}

const PENCIL_STYLE: PencilIndicatorStyle = {
  background: COL_BACKGROUND,
  body: COL_PENCIL,
  ink: COL_TEXT,
};

// --- geometry ---------------------------------------------------------------

const gapOf = (ts: number): number => Math.max(2, Math.floor(ts / 8));
const pitchOf = (ts: number): number => ts + gapOf(ts);
/** The margin holds the notes-mode glyph in its top-right corner. */
const borderOf = (ts: number): number =>
  Math.max(Math.floor(ts / 2), pencilIndicatorReach(ts));
/** The space between the last row of guesses and the answer row. */
const answerGapOf = (ts: number): number => Math.floor(ts / 2);

type Layout = Pick<SkeletonParams, "len" | "nguesses">;

export function computeSize(p: Layout, ts: number): Size {
  const b = borderOf(ts);
  return {
    w: 2 * b + p.len * pitchOf(ts) - gapOf(ts),
    h: 2 * b + (p.nguesses + 1) * pitchOf(ts) - gapOf(ts) + answerGapOf(ts),
  };
}

/** The tile of slot `pos` in row `row` of the guesses. */
export function tileRect(ts: number, row: number, pos: number): Rect {
  const b = borderOf(ts);
  return { x: b + pos * pitchOf(ts), y: b + row * pitchOf(ts), w: ts, h: ts };
}

/** Answer slot `pos`, below the last row of guesses. */
export function answerRect(ts: number, p: Layout, pos: number): Rect {
  const above = tileRect(ts, p.nguesses, pos);
  return { ...above, y: above.y + answerGapOf(ts) };
}

/**
 * The box digit `d` of an answer slot sits in: three to a line, as pencil
 * marks, the lines centered in the slot, and inside the width of the cursor's
 * frame so the frame never crosses a digit.
 */
function digitBox(ts: number, slot: Rect, nsymbols: number, d: number): Rect {
  const inset = lineOf(ts) + 1;
  const side = (slot.w - 2 * inset) / 3;
  const lines = Math.ceil(nsymbols / 3);
  const top = slot.y + (slot.h - lines * side) / 2;
  return {
    x: Math.floor(slot.x + inset + side * ((d - 1) % 3)),
    y: Math.floor(top + side * Math.floor((d - 1) / 3)),
    w: Math.floor(side),
    h: Math.floor(side),
  };
}

/** The thickness of a cursor's or a refusal's frame. */
const lineOf = (ts: number): number => Math.max(2, ts >> 4);

const inside = (r: Rect, x: number, y: number): boolean =>
  x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

export const centerOf = (r: Rect): Point => ({
  x: r.x + Math.floor(r.w / 2),
  y: r.y + Math.floor(r.h / 2),
});

/** The working row's slot at `(x, y)`, or `-1`. */
export function workingSlotAt(
  s: SkeletonState,
  ts: number,
  x: number,
  y: number,
): number {
  for (let pos = 0; pos < s.params.len; pos++) {
    if (inside(tileRect(ts, s.rows.length, pos), x, y)) return pos;
  }
  return -1;
}

/** The answer slot at `(x, y)`, or `-1`. */
export function answerSlotAt(
  s: SkeletonState,
  ts: number,
  x: number,
  y: number,
): number {
  for (let pos = 0; pos < s.params.len; pos++) {
    if (inside(answerRect(ts, s.params, pos), x, y)) return pos;
  }
  return -1;
}

// --- draw state -------------------------------------------------------------

export interface SkeletonDrawState extends PencilIndicatorCache {
  tileSize: number;
  params: SkeletonParams;
  /** Each guess tile's key, row-major. */
  tiles: TileCache;
  /** Each answer slot's key: a second family of tiles, so a cache of its
   * own. */
  slots: TileCache;
}

export function newDrawState(
  state: SkeletonState,
  tileSize: number,
): SkeletonDrawState {
  const { len, nguesses } = state.params;
  return {
    tileSize,
    params: state.params,
    tiles: new TileCache(len * nguesses),
    slots: new TileCache(len),
    pencilModeShown: null,
  };
}

// --- a guess tile -----------------------------------------------------------

/** No score: a working or empty tile. */
const UNSCORED = 3;
const K_MARK = 4;
const F_CURSOR = 1 << 6;
/** The working row is ready, and the cursor is on its submit position. */
const F_SUBMIT = 1 << 7;
const K_TONE = 8;
/** The working row was sent and refused. */
const F_REFUSED = 1 << 10;
/** A hint's guess goes in the square: a ring. */
const F_RINGED = 1 << 11;
/** The row is the one a hint's sentence reads: stripes. */
const F_HATCHED = 1 << 12;

interface Tile {
  digit: number;
  mark: number;
  cursor: boolean;
  submit: boolean;
  refused: boolean;
  ringed: boolean;
  hatched: boolean;
  tone: WinTone;
}

const tileKey = (t: Tile): number =>
  t.digit |
  (t.mark << K_MARK) |
  (t.cursor ? F_CURSOR : 0) |
  (t.submit ? F_SUBMIT : 0) |
  (t.refused ? F_REFUSED : 0) |
  (t.ringed ? F_RINGED : 0) |
  (t.hatched ? F_HATCHED : 0) |
  (t.tone << K_TONE);

function frame(dr: GameDrawing, r: Rect, thickness: number, color: number): void {
  dr.drawRect({ x: r.x, y: r.y, w: r.w, h: thickness }, color);
  dr.drawRect({ x: r.x, y: r.y + r.h - thickness, w: r.w, h: thickness }, color);
  dr.drawRect({ x: r.x, y: r.y, w: thickness, h: r.h }, color);
  dr.drawRect({ x: r.x + r.w - thickness, y: r.y, w: thickness, h: r.h }, color);
}

/** The tile with half the gap round it, which a tile repaints as its own. */
function roomOf(ts: number, r: Rect): Rect {
  const gap = gapOf(ts);
  const half = Math.floor(gap / 2);
  return { x: r.x - half, y: r.y - half, w: r.w + gap, h: r.h + gap };
}

function drawTile(dr: GameDrawing, ts: number, r: Rect, t: Tile): void {
  const room = roomOf(ts, r);
  dr.drawRect(room, COL_BACKGROUND);
  if (t.hatched) dr.drawHatch(room, hatchPeriod(ts));
  dr.drawRect(r, COL_GRID);
  const surface = { x: r.x + 1, y: r.y + 1, w: r.w - 2, h: r.h - 2 };
  dr.drawRect(surface, t.tone ? winSlot(t.tone) : COL_CELL);

  let ink = COL_TEXT;
  if (t.mark === IN_PLACE && !t.tone) {
    dr.drawRect(surface, COL_IN_PLACE);
    ink = COL_ON_IN_PLACE;
  } else if (t.mark === ELSEWHERE) {
    dr.drawCircle(centerOf(r), Math.floor(ts * 0.42), COL_ELSEWHERE, COL_ELSEWHERE);
  } else if (t.mark !== UNSCORED && !t.tone) {
    ink = COL_ABSENT_TEXT;
  }
  const font = glyphFont(Math.floor(ts * 0.6));
  const text = String(t.digit);
  if (t.digit > 0) dr.drawText(centerOf(r), font, ink, text);
  if (t.ringed) {
    const enclose = t.digit > 0 ? [textBox(centerOf(r), font, text)] : [];
    dr.drawRing(r, { enclose, avoid: [] }, 1, { room });
  }
  const line = lineOf(ts);
  if (t.refused) frame(dr, room, line, COL_ERROR);
  else if (t.submit) frame(dr, room, line, COL_CURSOR);
  else if (t.cursor) frame(dr, r, line, COL_CURSOR);
  dr.drawUpdate(room);
}

// --- an answer slot ---------------------------------------------------------

/** Bits `1..9` are the digits ruled out; the same bits shifted, those ringed. */
const K_RINGED = 10;
const K_SHOWN = 20;
const A_CURSOR = 1 << 24;
const A_MISTAKE = 1 << 25;

interface Slot {
  ruledOut: number;
  ringed: number;
  /** The code's digit, shown once the game is over; `0` while it is hidden. */
  shown: number;
  cursor: boolean;
  mistake: boolean;
}

const slotKey = (a: Slot): number =>
  a.ruledOut |
  (a.ringed << K_RINGED) |
  (a.shown << K_SHOWN) |
  (a.cursor ? A_CURSOR : 0) |
  (a.mistake ? A_MISTAKE : 0);

function drawSlot(
  dr: GameDrawing,
  ts: number,
  r: Rect,
  nsymbols: number,
  a: Slot,
): void {
  const room = roomOf(ts, r);
  dr.drawRect(room, COL_BACKGROUND);
  dr.drawRect(r, COL_GRID);
  dr.drawRect({ x: r.x + 1, y: r.y + 1, w: r.w - 2, h: r.h - 2 }, COL_CELL);
  if (a.shown > 0) {
    dr.drawText(
      centerOf(r),
      glyphFont(Math.floor(ts * 0.6)),
      COL_TEXT,
      String(a.shown),
    );
  } else {
    const font = glyphFont(Math.floor(ts * 0.24));
    for (let d = 1; d <= nsymbols; d++) {
      const box = digitBox(ts, r, nsymbols, d);
      const at = centerOf(box);
      // A digit ruled out is gone, as a struck pencil mark is in every other
      // game; its ring, where a hint marks it, says where it was.
      if (!(a.ruledOut & (1 << d))) dr.drawText(at, font, COL_TEXT, String(d));
      if (a.ringed & (1 << d)) {
        const text = textBox(at, font, String(d));
        dr.drawRing(box, { enclose: [text], avoid: [] }, 1, { room: r });
      }
    }
  }
  const line = lineOf(ts);
  if (a.mistake) frame(dr, room, line, COL_ERROR);
  else if (a.cursor) frame(dr, r, line, COL_CURSOR);
  dr.drawUpdate(room);
}

// --- redraw -----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: SkeletonDrawState,
  frame: Frame<SkeletonState, SkeletonUi, SkeletonMove, unknown, SkeletonMistake>,
): void {
  const { state, ui, flash, hint, mistakes } = frame;
  const ts = ds.tileSize;
  const { len, nguesses, nsymbols } = state.params;
  const o = outcome(state);
  const working = o !== 0 ? -1 : state.rows.length;
  const winRow = o > 0 ? state.rows.length - 1 : -1;
  const marks = stepMarks(hint);
  const ringed = new Set(marks.of("ring", SQUARE));
  const hatched = new Set(marks.of("stripes", ROW));
  const digits = marks.of("ring", DIGIT);
  const onRow = ui.cursor.visible && !ui.pencilMode;

  for (let row = 0; row < nguesses; row++) {
    for (let pos = 0; pos < len; pos++) {
      const scored = state.rows[row];
      const onWorking = row === working;
      const tile: Tile = {
        digit: scored ? scored.digits[pos] : onWorking ? ui.entries[pos] : 0,
        mark: scored ? scored.marks[pos] : UNSCORED,
        cursor: onWorking && onRow && ui.cursor.x === pos,
        submit: onWorking && onRow && ui.ready && ui.cursor.x === len,
        refused: onWorking && ui.refused,
        ringed: onWorking && ringed.has(pos),
        hatched: hatched.has(row),
        tone: row === winRow ? flash.win(sweepStep(pos, 0)) : 0,
      };
      const i = row * len + pos;
      if (!ds.tiles.changed(i, tileKey(tile))) continue;
      drawTile(dr, ts, tileRect(ts, row, pos), tile);
    }
  }

  for (let pos = 0; pos < len; pos++) {
    let ringedBits = 0;
    for (const m of digits) if (m.pos === pos) ringedBits |= 1 << m.value;
    const slot: Slot = {
      ruledOut: o !== 0 ? 0 : state.ruledOut[pos],
      ringed: ringedBits,
      shown: o !== 0 ? state.code[pos] : 0,
      cursor: ui.pencilMode && ui.cursor.visible && ui.cursor.x === pos,
      mistake: (mistakes ?? []).some((m) => m.pos === pos),
    };
    if (!ds.slots.changed(pos, slotKey(slot))) continue;
    drawSlot(dr, ts, answerRect(ts, state.params, pos), nsymbols, slot);
  }

  const size = computeSize(state.params, ts);
  repaintPencilIndicator(
    dr,
    ds,
    ui.pencilMode,
    pencilIndicatorBox(size, ts),
    PENCIL_STYLE,
  );
}
