/**
 * Palisade — state, params, desc codec, completion test; the solver and
 * generator are `solver.ts`'s.
 *
 * Border encoding is upstream's `borderflag` byte kept verbatim: per cell, low
 * nibble bits 0..3 are walls on the U/R/D/L edges, high nibble bits 4..7 are
 * "no-wall" marks. An edge is three-valued (wall / no-wall-mark / unknown) and
 * shared between the two cells it separates, so every edit records both sides.
 */

import { assertNever } from "../../engine/assert-never.ts";
import type { BorderHint } from "../../engine/border-grid-hint.ts";
import { digitValue } from "../../engine/decimal.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  type DescError,
  type DescParse,
  descBadCharacter,
  descValue,
  descVerdict,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import type { ParamConfigItem, PresetMenu } from "../../engine/game.ts";
import {
  AREA_TOO_LARGE,
  dimensionParamConfig,
  numberItem,
} from "../../engine/params.ts";
import { dims, num, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { encodeRunLength, scanRunLength } from "../../engine/run-length.ts";
import type { GameStatus } from "../../engine/types.ts";

// The edge encoding, direction tables and bounds test are shared with Separate
// in `engine/border-grid.ts`. Import them from there, never through this file:
// a pass-through re-export is a second name for one thing.

import {
  BORDER,
  BORDER_D,
  BORDER_L,
  BORDER_MASK,
  BORDER_R,
  BORDER_U,
  type BorderEdit,
  buildDsf,
  DISABLED,
  DX,
  DY,
  initBorders,
  outOfBounds,
} from "../../engine/border-grid.ts";

/** Clue sentinel: no clue shown in this cell. */
export const EMPTY = -1;

const BITCOUNT = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4] as const;
/** Number of walls enabled in a border byte. */
export function bitcount(flags: number): number {
  return BITCOUNT[flags & BORDER_MASK];
}

// --- types ----------------------------------------------------------------

export interface PalisadeParams {
  w: number;
  h: number;
  k: number;
}

export interface PalisadeState {
  w: number;
  h: number;
  k: number;
  /** length w·h, `EMPTY` or 0..4. Shared (frozen) across cloned states. */
  clues: Int8Array;
  /** length w·h, the `borderflag` byte per cell. */
  borders: Uint8Array;
}

export type PalisadeMove =
  | { type: "edges"; edits: ReadonlyArray<BorderEdit> }
  | { type: "solve"; borders: number[] };

export interface PalisadeUi {
  /** Half-grid cursor coordinates: (0,0) is the top-left grid corner,
   * (1,1) the center of the top-left cell; odd/even distinguishes
   * center/edge/corner. Range [1, 2w-1] × [1, 2h-1]. */
  cursor: GridCursor;
}

export interface PalisadeMistake {
  x: number;
  y: number;
  /** Direction (0=U,1=R,2=D,3=L) of the offending edge. */
  dir: number;
}

/** A displayed hint step's highlight: the border grid's own. The cells Palisade
 * outlines are a clue, a clue pair, a corner or two regions a join would merge;
 * the region it hatches is the one "this region" / "the same region" names. */
export type PalisadeHint = BorderHint;

// --- params ---------------------------------------------------------------

const PRESETS: PalisadeParams[] = [
  { w: 5, h: 5, k: 5 },
  { w: 6, h: 8, k: 6 },
  { w: 8, h: 10, k: 8 },
  { w: 12, h: 15, k: 10 },
];

export function defaultParams(): PalisadeParams {
  return { ...PRESETS[0] };
}

export function presets(): PresetMenu<PalisadeParams> {
  return {
    title: "Size",
    submenu: PRESETS.map((p) => ({ params: { ...p } })),
  };
}

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<PalisadeParams>[] = [
  ...dimensionParamConfig<PalisadeParams>({
    doc: "Size of the grid in squares.",
    bounds: { min: 1 },
  }),
  numberItem<PalisadeParams>("region-size", "Region size", "k", {
    doc: "How many squares each region holds. It must divide the number of squares in the grid exactly, and be smaller than it. A size of 2 is allowed only on a grid one square wide or high.",
    bounds: { min: 1 },
    label: { slot: "tail", words: (p) => `regions of size ${p.k}` },
  }),
];

/** Upstream: `w = h = k = atoi(s)`, then optional `x<h>` and `n<k>` — so the
 * square fallback (no `x`) also seeds the region size from the width. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  num(paramConfig, "n", "region-size", {
    whenAbsent: (p) => {
      p.k = p.w;
    },
  }),
]);

export function validateParams(p: PalisadeParams, full: boolean): string | null {
  const { w, h, k } = p;
  if (w > 0x7fffffff / h) return AREA_TOO_LARGE;
  const wh = w * h;
  if (wh % k) return "Region size must divide grid area";
  if (!full) return null;
  if (k === wh) return "Region size must be less than the grid area";
  if (k === 2 && w !== 1 && h !== 1)
    return "Region size can't be two unless width or height is one";
  return null;
}

// --- borders --------------------------------------------------------------

/** Solved iff the walls divide the grid into components of exactly `k` cells,
 * every clue equals its wall count, and no wall lies within a component. */
export function isSolved(
  w: number,
  h: number,
  k: number,
  clues: Int8Array,
  borders: Uint8Array,
): boolean {
  const wh = w * h;
  const dsf = buildDsf(w, h, borders, true);

  for (let i = 0; i < wh; i++) {
    if (dsf.size(i) !== k) return false;
    if (clues[i] === EMPTY) continue;
    if (clues[i] !== bitcount(borders[i])) return false;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (x + 1 < w && borders[i] & BORDER_R && dsf.equivalent(i, i + 1)) return false;
      if (y + 1 < h && borders[i] & BORDER_D && dsf.equivalent(i, i + w)) return false;
    }
  }
  return true;
}

// --- desc codec -----------------------------------------------------------

/** Run-length encode the clue grid: digit per clue, letter run per
 * clueless gap (trailing gap dropped). */
export function encodeDesc(clues: Int8Array, wh: number): string {
  return encodeRunLength(wh, (i) => (clues[i] === EMPTY ? null : String(clues[i])));
}

/**
 * Each cell's clue, `EMPTY` where it has none. A desc may stop short of the
 * last cell, because {@link encodeDesc} drops the trailing run; one that runs
 * past it is refused.
 */
function parseDesc(p: PalisadeParams, desc: string): DescParse<Int8Array> {
  const wh = p.w * p.h;
  return readDesc(desc, (r) => {
    const clues = new Int8Array(wh).fill(EMPTY);
    let squares = 0;
    for (const tok of scanRunLength(r.rest())) {
      if ("blanks" in tok) {
        squares += tok.blanks;
        continue;
      }
      const clue = digitValue(tok.value);
      if (clue === null) return r.fail(descBadCharacter(tok.value));
      if (clue > 4) r.fail(DESC_OUT_OF_RANGE);
      clues[squares++] = clue;
    }
    if (squares > wh) r.fail(DESC_TOO_LONG);
    return clues;
  });
}

export function validateDesc(p: PalisadeParams, desc: string): DescError | null {
  return descVerdict(parseDesc(p, desc));
}

export function newState(p: PalisadeParams, desc: string): PalisadeState {
  const { w, h, k } = p;
  const clues = descValue(parseDesc(p, desc));
  return {
    w,
    h,
    k,
    clues,
    borders: initBorders(w, h),
  };
}

// --- move execution -------------------------------------------------------

export function executeMove(state: PalisadeState, move: PalisadeMove): PalisadeState {
  const { w, h } = state;
  const ret = { ...state, borders: state.borders.slice() };

  if (move.type === "solve") {
    if (move.borders.length !== w * h) throw new Error("palisade: bad solve move");
    ret.borders = Uint8Array.from(move.borders);
    return ret;
  }
  if (move.type !== "edges") return assertNever(move, "palisade: executeMove");

  for (const { x, y, flag } of move.edits) {
    if (outOfBounds(x, y, w, h)) throw new Error("palisade: move out of bounds");
    for (let dir = 0; dir < 4; dir++) {
      // No toggling the walls of the grid rim.
      if (flag & BORDER(dir) && outOfBounds(x + DX[dir], y + DY[dir], w, h))
        throw new Error("palisade: cannot toggle grid-rim wall");
    }
    ret.borders[y * w + x] ^= flag;
  }
  return ret;
}

export function status(state: PalisadeState): GameStatus {
  const { w, h, k, clues, borders } = state;
  return isSolved(w, h, k, clues, borders) ? "solved" : "ongoing";
}

// --- text format ----------------------------------------------------------

export function textFormat(state: PalisadeState): string {
  const { w, h, clues, borders } = state;
  const cw = 4;
  const ch = 2;
  const gw = cw * w + 2;
  const gh = ch * h + 1;
  const len = gw * gh;
  const board = new Array<string>(len).fill(" ");

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const cell = r * ch * gw + cw * c;
      const center = cell + (gw * ch) / 2 + cw / 2;
      const i = r * w + c;
      const clue = clues[i];

      if (clue !== EMPTY) board[center] = String(clue);
      board[cell] = "+";

      if (borders[i] & BORDER_U) {
        for (let j = 1; j < cw; j++) board[cell + j] = "-";
      } else if (borders[i] & DISABLED(BORDER_U)) {
        board[cell + cw / 2] = "x";
      }

      if (borders[i] & BORDER_L) board[cell + gw] = "|";
      else if (borders[i] & DISABLED(BORDER_L)) board[cell + gw] = "x";
    }
    for (let c = 0; c < ch; c++) {
      board[(r * ch + c) * gw + gw - 2] = c ? "|" : "+";
      board[(r * ch + c) * gw + gw - 1] = "\n";
    }
  }
  // Bottom rim: copy the first row's '+'/'-' pattern.
  for (let j = 0; j < gw; j++) board[len - gw + j] = board[j];
  return board.join("");
}
