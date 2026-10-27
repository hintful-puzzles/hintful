/**
 * Pearl (Masyu) state, params and the RLE desc codec.
 *
 * State is immutable: `lines` / `marks` / `errors` are per-move copies; the
 * `clues` grid is shared frozen (upstream's ref-counted `shared_state`).
 */

import {
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  type DescParse,
  descBadCharacter,
  descValue,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { difficultyItem, tierNames } from "../../engine/difficulty.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/game.ts";
import type { LineDrawingUi } from "../../engine/line-drawing.ts";
import { AREA_TOO_LARGE, dimensionParamConfig } from "../../engine/params.ts";
import { choice, dims, paramsCodec, unusedLetter } from "../../engine/params-codec.ts";
import { encodeRunLength, scanRunLength } from "../../engine/run-length.ts";
import { D, L, R, U } from "../../engine/square-edges.ts";

// --- clue kinds (upstream NOCLUE / CORNER=black / STRAIGHT=white) ----------
export const NOCLUE = 0;
export const CORNER = 1; // black pearl
export const STRAIGHT = 2; // white pearl

// --- square-state bitmasks (1 << <pair of directions>) --------------------
// Directions are `engine/square-edges.ts`'s bits, the ones `lines`, `marks`
// and a move's `l` are stored in.
export const BLANK = 0;
export const bLR = 1 << (L | R);
export const bUD = 1 << (U | D);
export const bLU = 1 << (L | U);
export const bLD = 1 << (L | D);
export const bRU = 1 << (R | U);
export const bRD = 1 << (R | D);
export const bBLANK = 1 << BLANK;

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
}

/** Every size at both tiers. The largest are where a deal's slowest of a dozen
 * stays near a second, measured 2026-10-27 (`npm run deal-walk` with the
 * cells named, slowest of twelve, Easy and Tricky): 10x10 0.3 and 0.4 s,
 * 10x12 1 and 1 s. Past 120 squares Easy leaves it first: 12x12 Easy took up
 * to 9 s and 10x14 Easy 10 s, as a large loop's full clue set rarely solves at
 * Easy, and those sizes are a Custom away. */
const BOARDS: readonly PearlParams[] = [
  { w: 6, h: 6, difficulty: DIFF_EASY },
  { w: 6, h: 8, difficulty: DIFF_EASY },
  { w: 8, h: 8, difficulty: DIFF_EASY },
  { w: 8, h: 10, difficulty: DIFF_EASY },
  { w: 10, h: 10, difficulty: DIFF_EASY },
  { w: 10, h: 12, difficulty: DIFF_EASY },
];

/** 8x8 Tricky, upstream's default. */
export function defaultParams(): PearlParams {
  return { w: 8, h: 8, difficulty: DIFF_TRICKY };
}

export const menu: PresetBoards<PearlParams> = { boards: BOARDS };

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<PearlParams>[] = [
  ...dimensionParamConfig<PearlParams>({
    doc: "Size of the grid in squares. The harder of the two difficulties needs one of them to be at least 6.",
    bounds: { min: 5 },
  }),
  difficultyItem(DIFF_NAMES, "difficulty"),
];

/** `WxH`, then the generator-only difficulty letter. A string without a
 * difficulty letter is Easy, as upstream reads it, rather than the default
 * preset's tier. Upstream's trailing `n` asks for a board nothing has checked;
 * every board dealt here is checked, so the letter is read and sets nothing. */
export const { encodeParams, decodeParams } = paramsCodec(
  () => ({ ...defaultParams(), difficulty: DIFF_EASY }),
  [
    dims(paramConfig),
    choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
    unusedLetter("n"),
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
 * {@link parseDesc} rejects a desc that does not cover the whole grid.
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

/** The line being drawn, the keyboard cursor, and the `appearance` preference
 * (`guiStyle`). None of it is serialized. */
export interface PearlUi extends LineDrawingUi {
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
