/**
 * Pearl (Masyu) state, params, direction algebra and the RLE desc codec.
 *
 * State is immutable: `lines` / `marks` / `errors` are per-move copies; the
 * `clues` grid is shared frozen (upstream's ref-counted `shared_state`).
 */

import {
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  type DescError,
  type DescParse,
  descBadCharacter,
  descValue,
  descVerdict,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { difficultyItem, tierNames } from "../../engine/difficulty.ts";
import type { ParamConfigItem, PresetMenu } from "../../engine/game.ts";
import { AREA_TOO_LARGE, dimensionParamConfig } from "../../engine/params.ts";
import { choice, dims, flag, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { encodeRunLength, scanRunLength } from "../../engine/run-length.ts";

// --- clue kinds (upstream NOCLUE / CORNER=black / STRAIGHT=white) ----------
export const NOCLUE = 0;
export const CORNER = 1; // black pearl
export const STRAIGHT = 2; // white pearl

// --- direction bits --------------------------------------------------------
export const R = 1;
export const U = 2;
export const L = 4;
export const D = 8;
export const BLANK = 0;

/** x-delta of a single direction bit (upstream `DX`). */
export function DX(d: number): number {
  return (d === R ? 1 : 0) - (d === L ? 1 : 0);
}
/** y-delta of a single direction bit (upstream `DY`; y grows downward). */
export function DY(d: number): number {
  return (d === D ? 1 : 0) - (d === U ? 1 : 0);
}
/** Opposite direction (upstream `F`). */
export function F(d: number): number {
  return ((d << 2) | (d >> 2)) & 0xf;
}
/** Clockwise-90 direction (upstream `C`). */
export function CW(d: number): number {
  return ((d << 3) | (d >> 1)) & 0xf;
}
/** Anticlockwise-90 direction (upstream `A`). */
export function ACW(d: number): number {
  return ((d << 1) | (d >> 3)) & 0xf;
}

// --- square-state bitmasks (1 << <pair of directions>) --------------------
export const bLR = 1 << (L | R);
export const bUD = 1 << (U | D);
export const bLU = 1 << (L | U);
export const bLD = 1 << (L | D);
export const bRU = 1 << (R | U);
export const bRD = 1 << (R | D);
export const bBLANK = 1 << BLANK;

// --- population count of the 4 direction bits -----------------------------
const NBITS_TABLE = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
/** Number of set direction bits in `l` (upstream `NBITS`). */
export function NBITS(l: number): number {
  return l < 0 || l > 15 ? 4 : NBITS_TABLE[l];
}

/** Error bit that flags a contradicted clue (upstream `ERROR_CLUE`), OR-ed
 * into `errors` alongside the four direction bits. */
export const ERROR_CLUE = 16;

// --- difficulty ------------------------------------------------------------
export const DIFF_EASY = 0;
export const DIFF_TRICKY = 1;
export const DIFF_COUNT = 2;
export const DIFF_NAMES: readonly string[] = tierNames(DIFF_COUNT);
/** Encoding chars for the `d<char>` param suffix (upstream `pearl_diffchars`). */
const DIFF_CHARS = "et";

// --- params ----------------------------------------------------------------
export interface PearlParams {
  w: number;
  h: number;
  difficulty: number;
  /** Allow an unsoluble board (upstream `nosolve`, default false). */
  nosolve: boolean;
}

const DEFAULT_PRESET = 3;
const PEARL_PRESETS: readonly PearlParams[] = [
  { w: 6, h: 6, difficulty: DIFF_EASY, nosolve: false },
  { w: 6, h: 6, difficulty: DIFF_TRICKY, nosolve: false },
  { w: 8, h: 8, difficulty: DIFF_EASY, nosolve: false },
  { w: 8, h: 8, difficulty: DIFF_TRICKY, nosolve: false },
  { w: 10, h: 10, difficulty: DIFF_EASY, nosolve: false },
  { w: 10, h: 10, difficulty: DIFF_TRICKY, nosolve: false },
  { w: 8, h: 12, difficulty: DIFF_EASY, nosolve: false },
  { w: 8, h: 12, difficulty: DIFF_TRICKY, nosolve: false },
];

export function defaultParams(): PearlParams {
  return { ...PEARL_PRESETS[DEFAULT_PRESET] };
}

export function presets(): PresetMenu<PearlParams> {
  return {
    title: "Pearl",
    submenu: PEARL_PRESETS.map((p) => ({ params: { ...p } })),
  };
}

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<PearlParams>[] = [
  ...dimensionParamConfig<PearlParams>({
    doc: "Size of the grid in squares. The harder of the two difficulties needs one of them to be at least 6.",
    bounds: { min: 5 },
  }),
  difficultyItem(DIFF_NAMES, "difficulty"),
  {
    kw: "allow-unsoluble",
    name: "Allow unsoluble",
    type: "boolean",
    doc: "Skip checking the puzzle at all: every pearl the generated loop allows is kept, and nothing makes sure the puzzle has only one solution or can be solved by reasoning. Such a board may have more than one loop that fits, and the difficulty setting has no effect on it.",
    label: { slot: "tail", words: (p) => (p.nosolve ? "ambiguous" : null) },
    get: (p) => p.nosolve,
    set: (p, v) => {
      p.nosolve = v;
    },
  },
];

/** `WxH`, then the generator-only difficulty letter and `n` for unsoluble. A
 * string without a difficulty letter is Easy, as upstream reads it, rather
 * than the default preset's tier. */
export const { encodeParams, decodeParams } = paramsCodec(
  () => ({ ...defaultParams(), difficulty: DIFF_EASY }),
  [
    dims(paramConfig),
    choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
    flag(paramConfig, "n", "allow-unsoluble", { full: true }),
  ],
);

export function validateParams(p: PearlParams, _full: boolean): string | null {
  if (p.w > Math.floor(0x7fffffff / p.h)) return AREA_TOO_LARGE;
  if (p.difficulty >= DIFF_TRICKY && p.w + p.h < 11)
    return `Width plus height must be at least 11 for ${DIFF_NAMES[DIFF_TRICKY]}.`;
  return null;
}

// --- desc codec ------------------------------------------------------------
/**
 * Run-length encode a clue grid: lowercase runs compress unclued cells, `B` is
 * a black pearl, `W` a white pearl. Trailing blanks are kept because
 * {@link validateDesc} rejects a desc that does not cover the whole grid.
 *
 * Upstream grows a run by incrementing the letter it already wrote, starting a
 * fresh `a` after `z`. That produces exactly the 26-cell chunks
 * {@link encodeRunLength} writes, which the frozen differential checks byte for
 * byte.
 */
export function encodeClues(clues: Uint8Array, sz: number): string {
  return encodeRunLength(
    sz,
    (i) => (clues[i] === NOCLUE ? null : clues[i] === CORNER ? "B" : "W"),
    { keepTrailingBlanks: true },
  );
}

/** Each cell's clue: `CORNER` for `B`, `STRAIGHT` for `W`, else `NOCLUE`. */
function parseDesc(p: PearlParams, desc: string): DescParse<Uint8Array> {
  const total = p.w * p.h;
  return readDesc(desc, (r) => {
    // NOCLUE is 0, so a blank run just advances past cells already holding it.
    const clues = new Uint8Array(total);
    let sizeSoFar = 0;
    for (const tok of scanRunLength(r.rest())) {
      if ("blanks" in tok) sizeSoFar += tok.blanks;
      else if (tok.value === "B") clues[sizeSoFar++] = CORNER;
      else if (tok.value === "W") clues[sizeSoFar++] = STRAIGHT;
      else r.fail(descBadCharacter(tok.value));
    }
    if (sizeSoFar > total) r.fail(DESC_TOO_LONG);
    if (sizeSoFar < total) r.fail(DESC_TOO_SHORT);
    return clues;
  });
}

export function validateDesc(p: PearlParams, desc: string): DescError | null {
  return descVerdict(parseDesc(p, desc));
}

// --- state -----------------------------------------------------------------
export interface PearlState {
  readonly w: number;
  readonly h: number;
  /** Immutable clue grid, shared by reference across states. */
  readonly clues: Uint8Array;
  /** Loop segments laid in each cell (R|U|L|D bits). */
  readonly lines: Uint8Array;
  /** No-line marks in each cell (R|U|L|D bits). */
  readonly marks: Uint8Array;
  /** Error flags per cell (R|U|L|D bits | ERROR_CLUE). */
  readonly errors: Uint8Array;
}

export function newState(p: PearlParams, desc: string): PearlState {
  const sz = p.w * p.h;
  const clues = descValue(parseDesc(p, desc));
  return {
    w: p.w,
    h: p.h,
    clues,
    lines: new Uint8Array(sz),
    marks: new Uint8Array(sz),
    errors: new Uint8Array(sz),
  };
}

/** True iff `(x, y)` is on the grid (upstream `INGRID`). */
export function inGrid(s: { w: number; h: number }, x: number, y: number): boolean {
  return x >= 0 && x < s.w && y >= 0 && y < s.h;
}

// --- moves -----------------------------------------------------------------
/** One edge/mark/solve/hint operation; a player action (drag, click, solve,
 * hint) commits an ordered list of these as a single move (upstream's
 * `;`-joined move tokens). */
export type PearlOp =
  | { kind: "line"; l: number; x: number; y: number } // 'L': lines |= l
  | { kind: "noline"; l: number; x: number; y: number } // 'N': lines &= ~l
  | { kind: "replace"; l: number; x: number; y: number } // 'R': lines = l, marks &= ~l
  | { kind: "flip"; l: number; x: number; y: number } // 'F': lines ^= l
  | { kind: "mark"; l: number; x: number; y: number } // 'M': marks ^= l
  | { kind: "solve" } // 'S'
  // 'H': upstream's in-place autosolve. No input makes it any more; it stays
  // so a saved game that used it still replays.
  | { kind: "hint" };

export interface PearlMove {
  ops: PearlOp[];
}

/** Transient interaction state (upstream `game_ui`). The drag path, keyboard
 * cursor, and the `appearance` preference (`guiStyle`). None of it is
 * serialized. */
export interface PearlUi {
  /** Drag path so far, as `y*w+x` coords (length w*h; only the first
   * `ndragcoords` entries are live). */
  dragcoords: number[];
  /** -1 = no drag; 0 = click, drag not yet confirmed; >0 = dragging. */
  ndragcoords: number;
  clickx: number;
  clicky: number;
  cursor: GridCursor;
  /** GUI_MASYU (0) or GUI_LOOPY (1); driven by the `appearance` pref. */
  guiStyle: number;
}

/** Text format for save/share (upstream `game_text_format`): pearls on a grid
 * of `+`, with `-` / `|` for lines and `x` for no-line marks between them. */
export function textFormat(state: PearlState): string {
  const { w, h, clues, lines, marks } = state;
  const cw = 4;
  const ch = 2;
  const rows = Array.from({ length: ch * (h - 1) + 1 }, () =>
    new Array<string>(cw * (w - 1) + 1).fill(" "),
  );
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const i = r * w + c;
      const x = c * cw;
      const y = r * ch;
      rows[y][x] = "+BW"[clues[i]];
      if (c < w - 1 && (lines[i] & R || lines[i + 1] & L))
        for (let k = 1; k < cw; k++) rows[y][x + k] = "-";
      if (r < h - 1 && (lines[i] & D || lines[i + w] & U))
        for (let k = 1; k < ch; k++) rows[y + k][x] = "|";
      if (c < w - 1 && (marks[i] & R || marks[i + 1] & L)) rows[y][x + (cw >> 1)] = "x";
      if (r < h - 1 && (marks[i] & D || marks[i + w] & U)) rows[y + (ch >> 1)][x] = "x";
    }
  }
  return rows.map((row) => `${row.join("")}\n`).join("");
}
