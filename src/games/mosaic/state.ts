/**
 * Mosaic state, params and desc codec (the state half of upstream's
 * `mosaic.c`). A Fill-a-Pix-style puzzle: each clue counts the marked cells
 * of its 3×3 neighborhood, itself included.
 */

import { assertNever } from "../../engine/assert-never.ts";
import { digitValue, parseLeadingInt } from "../../engine/decimal.ts";
import {
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  type DescParse,
  descBadCharacter,
  descValue,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import type { PresetMenu } from "../../engine/game.ts";
import { parseDimensions } from "../../engine/params.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { encodeRunLength, scanRunLength } from "../../engine/run-length.ts";
import type { GameStatus, Point } from "../../engine/types.ts";

// --- cell-state flags (upstream `enum cell_state`) ----------------------

// The low two bits are the player's mark; SOLVED/ERROR are derived
// overlays on clue cells. The toggle cycle `(mark + steps) % 3` and the
// paint guard `mark === 0` rely on this encoding.
export const STATE_UNMARKED = 0;
export const STATE_MARKED = 1;
export const STATE_BLANK = 2;
export const STATE_SOLVED = 4;
export const STATE_ERROR = 8;
/** Mask of the two mark bits; also the modulus of the toggle cycle. */
export const STATE_MARK_MASK = STATE_BLANK | STATE_MARKED;

export const MAX_TILES = 10000;
const DEFAULT_SIZE = 10;
const DEFAULT_AGGRESSIVENESS = true;

// --- types --------------------------------------------------------------

export interface MosaicParams {
  width: number;
  height: number;
  /** Hide every clue that can be hidden (slower generation, harder board). */
  aggressive: boolean;
}

/** The immutable clue board, shared by reference across every state of
 * one game (upstream's `board_state`). `clues[i]` is `0..9` for a shown
 * clue, `-1` for none. */
export interface MosaicBoard {
  readonly width: number;
  readonly height: number;
  readonly clues: Int8Array;
}

export interface MosaicState {
  readonly width: number;
  readonly height: number;
  readonly board: MosaicBoard;
  /** Per-cell mark + overlay flags (STATE_*). Cloned per move. */
  readonly cells: Uint8Array;
}

/** `paint` sets the still-unmarked cells of `paintRun(x, y, srcX, srcY)`
 * to `paintState` (upstream's `d`/`e` moves, which it executes
 * identically). `solve` carries the hex-packed marked-cell bitmap that
 * upstream's `solve_game` emits. */
export type MosaicMove =
  | { type: "toggle"; x: number; y: number; double: boolean }
  | {
      type: "paint";
      x: number;
      y: number;
      srcX: number;
      srcY: number;
      paintState: number;
    }
  | { type: "solve"; solution: string }
  /** A hint step's squares, all given `mark` (shaded or clear). The pointer
   * makes it one square at a time, with toggles. */
  | { type: "fill"; cells: number[]; mark: number };

export interface MosaicUi {
  cursor: GridCursor;
}

/** A determined cell whose mark contradicts the deduced solution. */
export type MosaicMistake = Point;

// --- params -------------------------------------------------------------

export function defaultParams(): MosaicParams {
  return {
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
    aggressive: DEFAULT_AGGRESSIVENESS,
  };
}

export function presets(): PresetMenu<MosaicParams> {
  const sizes = [3, 5, 10, 15, 25, 50];
  return {
    title: "Size",
    submenu: sizes.map((n) => ({
      // 50×50 aggressive generation is too slow; upstream turns it off.
      params: { width: n, height: n, aggressive: n < 50 },
    })),
  };
}

export function encodeParams(p: MosaicParams, full: boolean): string {
  let s = `${p.width}x${p.height}`;
  if (full && p.aggressive !== DEFAULT_AGGRESSIVENESS) {
    s += `h${p.aggressive ? 1 : 0}`;
  }
  return s;
}

export function decodeParams(s: string): MosaicParams {
  const ret = defaultParams();
  const dims = parseDimensions(s);
  ret.width = dims.w;
  ret.height = dims.h;
  const i = dims.next;
  if (s[i] === "h") ret.aggressive = parseLeadingInt(s, i + 1).value !== 0;
  return ret;
}

export function validateParams(p: MosaicParams, _full: boolean): string | null {
  if (p.height > MAX_TILES / p.width)
    return `Width times height must be at most ${MAX_TILES}.`;
  return null;
}

// --- desc codec -----------------------------------------------------------

/** Encode a clue board as upstream's run-length desc: a digit per shown
 * clue, a letter `a`-`z` per run of 1-26 hidden cells. The trailing run is
 * kept, because {@link parseDesc} wants exactly `width × height` cells. */
export function encodeBoard(board: MosaicBoard): string {
  return encodeRunLength(
    board.clues.length,
    (i) => (board.clues[i] >= 0 ? String(board.clues[i]) : null),
    { keepTrailingBlanks: true },
  );
}

/** Each cell's clue, `-1` where it is hidden. */
function parseDesc(p: MosaicParams, desc: string): DescParse<Int8Array> {
  const size = p.width * p.height;
  return readDesc(desc, (r) => {
    const clues = new Int8Array(size).fill(-1);
    let loc = 0;
    for (const tok of scanRunLength(r.rest())) {
      if ("blanks" in tok) {
        loc += tok.blanks;
        continue;
      }
      const clue = digitValue(tok.value);
      if (clue === null) return r.fail(descBadCharacter(tok.value));
      clues[loc++] = clue;
    }
    if (loc < size) r.fail(DESC_TOO_SHORT);
    if (loc > size) r.fail(DESC_TOO_LONG);
    return clues;
  });
}

export function newState(p: MosaicParams, desc: string): MosaicState {
  const size = p.width * p.height;
  const clues = descValue(parseDesc(p, desc));
  const board: MosaicBoard = Object.freeze({
    width: p.width,
    height: p.height,
    clues,
  });
  return {
    width: p.width,
    height: p.height,
    board,
    cells: new Uint8Array(size),
  };
}

// --- neighborhood counting ----------------------------------------------

/** Count the marked / blank / total cells of the 3×3 neighborhood of
 * (x,y), clipped to the board (upstream `count_around_state`). */
export function countAround(
  width: number,
  height: number,
  cells: Uint8Array,
  x: number,
  y: number,
): { marked: number; blank: number; total: number } {
  let marked = 0;
  let blank = 0;
  let total = 0;
  for (let j = Math.max(0, y - 1); j <= Math.min(height - 1, y + 1); j++) {
    for (let i = Math.max(0, x - 1); i <= Math.min(width - 1, x + 1); i++) {
      total++;
      const v = cells[j * width + i];
      if (v & STATE_BLANK) blank++;
      else if (v & STATE_MARKED) marked++;
    }
  }
  return { marked, blank, total };
}

/** Re-derive the SOLVED/ERROR overlay of every shown clue in the 3×3
 * neighborhood of a just-changed cell (upstream
 * `update_board_state_around`). Mutates `cells` in place — callers pass
 * the already-cloned next state's array. */
function updateBoardStateAround(
  state: { width: number; height: number; board: MosaicBoard },
  cells: Uint8Array,
  x: number,
  y: number,
): void {
  const { width, height, board } = state;
  for (let j = Math.max(0, y - 1); j <= Math.min(height - 1, y + 1); j++) {
    for (let i = Math.max(0, x - 1); i <= Math.min(width - 1, x + 1); i++) {
      const pos = j * width + i;
      const clue = board.clues[pos];
      if (clue < 0) continue;
      const { marked, blank, total } = countAround(width, height, cells, i, j);
      const mark = cells[pos] & STATE_MARK_MASK;
      if (clue === marked && total - marked - blank === 0) {
        cells[pos] = mark | STATE_SOLVED;
      } else if (clue < marked || clue > total - blank) {
        cells[pos] = mark | STATE_ERROR;
      } else {
        cells[pos] = mark;
      }
    }
  }
}

/** Shown clues not yet satisfied with every neighbor decided, read off the
 * marks rather than the SOLVED overlay, so it says what the board shows
 * however the board was reached. 0 means the board is complete. */
export function cluesLeft(state: MosaicState): number {
  const { width, height, board, cells } = state;
  let left = 0;
  for (let pos = 0; pos < board.clues.length; pos++) {
    const clue = board.clues[pos];
    if (clue < 0) continue;
    const x = pos % width;
    const y = Math.floor(pos / width);
    const { marked, blank, total } = countAround(width, height, cells, x, y);
    if (clue !== marked || total - marked - blank !== 0) left++;
  }
  return left;
}

// --- moves ----------------------------------------------------------------

/** The straight run of cells from (x,y) toward the anchor (srcX,srcY),
 * anchor excluded: the click that set the anchor already painted it. A
 * pair that is not vertically aligned walks the row. */
function paintRun(x: number, y: number, srcX: number, srcY: number): Point[] {
  const vertical = srcX === x && srcY !== y;
  const dx = vertical ? 0 : Math.sign(srcX - x);
  const dy = vertical ? Math.sign(srcY - y) : 0;
  const length = vertical ? Math.abs(srcY - y) : Math.abs(srcX - x);
  return Array.from({ length }, (_, i) => ({ x: x + dx * i, y: y + dy * i }));
}

export function executeMove(state: MosaicState, move: MosaicMove): MosaicState {
  const { width, height } = state;
  const size = width * height;
  const cells = Uint8Array.from(state.cells);

  if (move.type === "solve") {
    // Apply the hex-packed marked-cell bitmap, MSB first.
    let loc = 0;
    for (let i = 0; i + 1 < move.solution.length && loc < size; i += 2) {
      let byte = Number.parseInt(move.solution.slice(i, i + 2), 16);
      if (Number.isNaN(byte)) throw new Error("Bad solve bitmap");
      for (let bit = 0; bit < 8 && loc < size; bit++) {
        cells[loc] = (byte & 0x80 ? STATE_MARKED : STATE_BLANK) | STATE_SOLVED;
        byte = (byte << 1) & 0xff;
        loc++;
      }
    }
    if (loc < size) throw new Error("Bad solve bitmap");
    return { ...state, cells };
  }

  const inBounds = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < width && y < height;

  if (move.type === "toggle") {
    if (!inBounds(move.x, move.y)) throw new Error("Toggle out of bounds");
    const pos = move.y * width + move.x;
    // Strip any SOLVED/ERROR overlay, then cycle the mark.
    cells[pos] =
      ((cells[pos] & STATE_MARK_MASK) + (move.double ? 2 : 1)) % STATE_MARK_MASK;
    updateBoardStateAround(state, cells, move.x, move.y);
  } else if (move.type === "paint") {
    if (!inBounds(move.x, move.y)) throw new Error("Paint out of bounds");
    for (const { x, y } of paintRun(move.x, move.y, move.srcX, move.srcY)) {
      if (!inBounds(x, y)) throw new Error("Paint out of bounds");
      const pos = y * width + x;
      if ((cells[pos] & STATE_MARK_MASK) === 0) {
        cells[pos] = move.paintState;
        updateBoardStateAround(state, cells, x, y);
      }
    }
  } else if (move.type === "fill") {
    for (const pos of move.cells) {
      if (pos < 0 || pos >= size) throw new Error("Fill out of bounds");
      cells[pos] = move.mark;
      updateBoardStateAround(state, cells, pos % width, Math.floor(pos / width));
    }
  } else {
    return assertNever(move, "mosaic: executeMove");
  }

  return { ...state, cells };
}

// --- status / text ----------------------------------------------------------

export function status(state: MosaicState): GameStatus {
  return cluesLeft(state) === 0 ? "solved" : "ongoing";
}

export function statusbarText(state: MosaicState, _ui: MosaicUi): string {
  const left = cluesLeft(state);
  return left ? `Clues left: ${left}` : "";
}

export function textFormat(state: MosaicState): string {
  const { width, height, board } = state;
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let row = "";
    for (let x = 0; x < width; x++) {
      const clue = board.clues[y * width + x];
      row += clue >= 0 ? `|${clue}|` : "| |";
    }
    lines.push(row);
  }
  return `${lines.join("\n")}\n`;
}
