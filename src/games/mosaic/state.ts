/**
 * Mosaic state, params and desc codec (the state half of upstream's
 * `mosaic.c`). A Fill-a-Pix-style puzzle: each clue counts the marked cells
 * of its 3×3 neighborhood, itself included.
 */

import {
  DIFF_EASY,
  DIFF_UNREASONABLE,
  SEARCH_TIER_NAMES,
  searchTierItem,
  searchTierSegment,
} from "../../engine/answer-search.ts";
import { assertNever } from "../../engine/assert-never.ts";
import { digitValue } from "../../engine/decimal.ts";
import {
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  type DescParse,
  descBadCharacter,
  descValue,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import type { ParamConfigItem, PresetMenu } from "../../engine/game.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { dims, num, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { presetGrid } from "../../engine/preset-grid.ts";
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

const MAX_TILES = 10000;
const DEFAULT_SIZE = 10;
const DEFAULT_AGGRESSIVENESS = true;

// --- types --------------------------------------------------------------

export interface MosaicParams {
  width: number;
  height: number;
  /** Hide every clue that can be hidden (slower generation, harder board). */
  aggressive: boolean;
  /** `DIFF_EASY`, a board the one rule finishes, or `DIFF_UNREASONABLE`, one
   * with a single answer that it does not reach. Generation-time only, as
   * `aggressive` is. */
  diff: number;
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
  return board(DEFAULT_SIZE);
}

/** A square board at Easy. 50×50 aggressive generation is too slow; upstream
 * turns it off. */
function board(side: number): MosaicParams {
  return { width: side, height: side, aggressive: side < 50, diff: DIFF_EASY };
}

/** Upstream's six sizes. The menu offers each at both tiers. */
const BOARDS: readonly MosaicParams[] = [3, 5, 10, 15, 25, 50].map(board);

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<MosaicParams>[] = [
  ...dimensionParamConfig<MosaicParams>({
    fields: { w: "width", h: "height" },
    doc: `Size of the grid in squares. The grid may hold at most ${MAX_TILES} squares. A grid fewer than 20 squares across is refused past a length that depends on its width, because a long thin puzzle cannot be generated.`,
    bounds: { min: 3 },
  }),
  searchTierItem(
    "diff",
    "An Easy puzzle can be finished one number at a time: there is always a number that already has its shaded squares, or that needs every square it has left. An Unreasonable one has a single solution that those two steps stop short of, so somewhere you have to look further: by comparing two numbers whose blocks overlap, or by trying a square and seeing what follows. The Hint button stops where the two steps do.",
  ),
  {
    kw: "aggressive-generation",
    name: "Aggressive generation",
    type: "boolean",
    doc: "Every puzzle hides the clues the game never used while solving it. When on, the game also tries taking away each clue that remains, and keeps it away whenever the puzzle still has its one solution at its difficulty without it, so fewer numbers are shown, which usually makes the puzzle harder.",
    label: {
      slot: "tail",
      // Upstream recommends it off above about 30x30, and its presets follow.
      words: (p) =>
        p.aggressive === p.width * p.height < 30 * 30
          ? null
          : `${p.aggressive ? "slower" : "faster"} generation`,
    },
    get: (p) => p.aggressive,
    set: (p, v) => {
      p.aggressive = v;
    },
  },
];

export function presets(): PresetMenu<MosaicParams> {
  return { title: "Size", ...presetGrid(paramConfig, BOARDS) };
}

/** `WxH[h<0|1>][d<tier>]`, a bare `W` being square. The aggressiveness and
 * the tier are generator-only. Upstream writes `h` only where it differs
 * from the default, and its IDs lack the tier: without one a board is Easy,
 * the only kind upstream deals. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  num(
    paramConfig,
    "h",
    {
      get: (p) => (p.aggressive ? 1 : 0),
      set: (p, value) => {
        p.aggressive = value !== 0;
      },
    },
    { full: true, omitWhen: (p) => p.aggressive === DEFAULT_AGGRESSIVENESS },
  ),
  searchTierSegment(paramConfig),
]);

/**
 * The longest board dealt at each shorter side, keyed by the largest shorter
 * side the limit covers. A board is dealt from a random picture the one rule
 * finishes with every number showing, and on a long thin board the rule runs
 * dry somewhere along it: the share of pictures it finishes falls to nothing
 * well inside {@link MAX_TILES}. A board 20 or more across is dealt at any
 * length. Upstream has no such bound and draws for ever.
 *
 * Measured 2026-10-10, one picture in so many finished, at the bound | past
 * it: 3×22 770, 4×20 430 | 4×25 2,500, 4×30 20,000; 5×30 910 | 5×50 none in
 * 20,000; 7×40 410 | 7×60 3,000; 8×50 420 | 8×100 none in 8,000; 10×100
 * 1,200, 12×100 160 | 10×200 and 12×300 none; 15×200 180 | 15×600 none;
 * 20×500 83.
 */
const MAX_LONG_SIDE = new Map<number, number>([
  [4, 20],
  [5, 30],
  [7, 40],
  [9, 50],
  [14, 100],
  [19, 200],
]);

/** The longest side dealt on a board `short` squares across. */
function maxLongSide(short: number): number {
  for (const [upTo, long] of MAX_LONG_SIDE) if (short <= upTo) return long;
  return Number.POSITIVE_INFINITY;
}

/**
 * The largest Unreasonable board dealt with aggressive generation, in
 * squares. Hiding asks the search about every clue, which takes about five
 * times as long as an Easy board's: 0.5 s at 25×25, 1.2 s at 30×30 and 2.9 s
 * at 35×35 (measured 2026-10-10). Without aggressive generation hiding stops
 * at the first clue that matters and a 100×100 board takes 0.3 s.
 */
const MAX_AGGRESSIVE_UNREASONABLE = 900;

export function validateParams(p: MosaicParams, full: boolean): string | null {
  if (p.height > MAX_TILES / p.width)
    return `Width times height must be at most ${MAX_TILES}.`;
  // Generation only: a board that arrives with its description is not
  // searched for, so it opens at any shape.
  if (!full) return null;
  const short = Math.min(p.width, p.height);
  const long = maxLongSide(short);
  if (Math.max(p.width, p.height) > long)
    return `A board ${short} squares across can be at most ${long} long; a longer one cannot be generated.`;
  if (
    p.diff === DIFF_UNREASONABLE &&
    p.aggressive &&
    p.width * p.height > MAX_AGGRESSIVE_UNREASONABLE
  )
    return `With aggressive generation an ${SEARCH_TIER_NAMES[DIFF_UNREASONABLE]} puzzle can have at most ${MAX_AGGRESSIVE_UNREASONABLE} squares; turn aggressive generation off for a larger one.`;
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
