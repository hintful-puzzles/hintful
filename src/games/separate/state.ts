/**
 * Separate — state, params, desc codec. A board is solved by the rules its
 * description compiles to (`solver.ts`'s `isSolved`).
 *
 * The wall model is Palisade's, adopted wholesale because the task (partition
 * the grid by drawing walls) is identical; what differs is the cell content (a
 * letter, not a wall-count clue) and the win condition (one of each letter per
 * region). The border byte is Palisade's `borderflag`: per cell, bits 0..3 are
 * walls on the U/R/D/L edges and bits 4..7 are "no-wall" marks.
 */

import { boxedGridText } from "../../engine/board/grid-text.ts";
import { assertNever } from "../../engine/contract/assert-never.ts";
import { type DescParse, descValue } from "../../engine/contract/desc-error.ts";
import { noSuchTier } from "../../engine/contract/difficulty.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/contract/game.ts";
import type { GameStatus } from "../../engine/contract/types.ts";
import { readDesc } from "../../engine/game-id/desc-reader.ts";
import { dimensionParamConfig, numberItem } from "../../engine/game-id/params.ts";
import { dims, num, paramsCodec } from "../../engine/game-id/params-codec.ts";
import type { GridCursor } from "../../engine/input/pointer.ts";
import {
  BORDER,
  BORDER_L,
  BORDER_U,
  type BorderEdit,
  DISABLED,
  DX,
  DY,
  initBorders,
  outOfBounds,
} from "../../engine/mechanics/border-grid.ts";
import {
  DIFF_EASY,
  DIFF_UNREASONABLE,
  searchTierItem,
  searchTierSegment,
} from "../../engine/solve/answer-search.ts";
import * as separate from "../../generated/games/separate/separate.compiled.ts";
import { isSolved } from "./solver.ts";

// --- types ----------------------------------------------------------------

export interface SeparateParams {
  w: number;
  h: number;
  k: number;
  /** `DIFF_EASY`, a board the solver's rungs finish, or `DIFF_UNREASONABLE`,
   * one with a single answer that they do not reach. Generation-time only. */
  diff: number;
}

/** What the solver reads of a board besides its letters: the grid and the
 * region size. A state and a params both are one. */
export type SeparateShape = Pick<SeparateParams, "w" | "h" | "k">;

export interface SeparateState {
  w: number;
  h: number;
  k: number;
  /** length w·h, letter index 0..k-1 per cell. Shared (frozen) across clones. */
  letters: Uint8Array;
  /** length w·h, the `borderflag` byte per cell. */
  borders: Uint8Array;
}

export type SeparateMove =
  | { type: "edges"; edits: readonly BorderEdit[] }
  | { type: "solve"; borders: number[] };

export interface SeparateUi {
  /** Half-grid cursor coordinates (Palisade's scheme): (0,0) is the top-left
   * grid corner, (1,1) the center of the top-left cell; odd/even distinguishes
   * center/edge/corner. Range [1, 2w-1] × [1, 2h-1]. */
  cursor: GridCursor;
}

export interface SeparateMistake {
  x: number;
  y: number;
  /** Direction (0=U,1=R,2=D,3=L) of the offending edge. */
  dir: number;
}

// --- params ---------------------------------------------------------------

const board = (w: number, h: number, k: number): SeparateParams => ({
  w,
  h,
  k,
  diff: DIFF_EASY,
});

/** The menu offers each board at both tiers. */
const BOARDS: readonly SeparateParams[] = [
  board(4, 4, 4),
  board(5, 5, 5),
  board(6, 7, 6),
  board(6, 8, 4),
];

export function defaultParams(): SeparateParams {
  return board(5, 5, 5);
}

export const menu: PresetBoards<SeparateParams> = { boards: BOARDS };

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<SeparateParams>[] = [
  ...dimensionParamConfig<SeparateParams>({
    doc: "Size of the grid in squares.",
    bounds: { min: 1 },
  }),
  numberItem<SeparateParams>("letters", "Letters", "k", {
    doc: "How many different letters the grid uses, which is also how many squares each region holds. It must divide the number of squares in the grid exactly, and a new puzzle needs at least 2 of them, fewer than the number of squares, and at most 26. With many letters on a large grid a puzzle is rare, and the first can take minutes to appear or not be found at all.",
    bounds: { min: 1 },
    label: { slot: "tail", words: (p) => `${p.k} letters` },
  }),
  searchTierItem(
    separate.tiers,
    "diff",
    "An Easy puzzle can be finished one forced edge at a time: there are always two neighbors that share a letter, or a region with only one square left to take. An Unreasonable one has a single solution that those steps stop short of, so somewhere you have to try joining two squares and see what follows. The Hint button stops where the forced edges do.",
  ),
];

/** Upstream: `w = h = k = atoi(s)`, then optional `x<h>` and `n<k>` — so the
 * square fallback (no `x`) also seeds the letter count from the width. The
 * tier comes last, in the full form only, and upstream's IDs lack it: without
 * one a board is Easy, the only kind upstream deals. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  num(paramConfig, "n", "letters", {
    whenAbsent: (p) => {
      p.k = p.w;
    },
  }),
  searchTierSegment(paramConfig),
]);

export function validateParams(p: SeparateParams, full: boolean): string | null {
  const { w, h, k } = p;
  const wh = w * h;
  if (wh % k) return "Number of letters must divide the grid area.";
  if (!full) return null;
  if (k > 26) return "Number of letters must be at most 26.";
  if (k === wh) return "Number of letters must be less than the grid area.";
  if (k === 1) return "Number of letters must be at least two.";
  // Many letters on a large grid are dealt however seldom: measured
  // 2026-10-10, the divisions tried for a board follow the squares times the
  // letters squared, and none was dealt in 100 seconds at 12x12 in twelves or
  // 20x20 in eights. The deal's deadline answers such a size.
  if (p.diff !== DIFF_UNREASONABLE) return null;
  // No board of these has one answer that the solver does not reach
  // (`separate-tier.test.ts` tries every fill of the small ones). A strip
  // divides one way. With two letters a region is an A beside a B, and where
  // such pairs fit one way only, some square has one neighbor left to take,
  // which is the `only-way` rung. A 3x2 board in threes is too small.
  const tooSmall = k === 3 && wh === 6;
  if (w === 1 || h === 1 || k === 2 || tooSmall)
    return noSuchTier(
      `${w}x${h} puzzle with ${k} letters`,
      separate.tiers[DIFF_UNREASONABLE] as string,
    );
  return null;
}

// --- desc codec -----------------------------------------------------------

const A = "A".charCodeAt(0);

/** The desc is simply the `w·h` letters, each `A + letters[i]`. */
export function encodeDesc(letters: Uint8Array, wh: number): string {
  let out = "";
  for (let i = 0; i < wh; i++) out += String.fromCharCode(A + letters[i]);
  return out;
}

function parseDesc(p: SeparateParams, desc: string): DescParse<Uint8Array> {
  const wh = p.w * p.h;
  const isLetter = (c: string) => {
    const v = c.charCodeAt(0) - A;
    return v >= 0 && v < p.k;
  };
  return readDesc(desc, (r) => {
    const letters = new Uint8Array(wh);
    for (let i = 0; i < wh; i++) letters[i] = r.char(isLetter).charCodeAt(0) - A;
    r.end();
    return letters;
  });
}

export function newState(p: SeparateParams, desc: string): SeparateState {
  const { w, h, k } = p;
  const letters = descValue(parseDesc(p, desc));
  return {
    w,
    h,
    k,
    letters,
    borders: initBorders(w, h),
  };
}

// --- move execution -------------------------------------------------------

export function executeMove(state: SeparateState, move: SeparateMove): SeparateState {
  const { w, h } = state;
  const ret: SeparateState = { ...state, borders: state.borders.slice() };

  if (move.type === "solve") {
    if (move.borders.length !== w * h) throw new Error("separate: bad solve move");
    ret.borders = Uint8Array.from(move.borders);
    return ret;
  }
  if (move.type !== "edges") return assertNever(move, "separate: executeMove");

  for (const { x, y, flag } of move.edits) {
    if (outOfBounds(x, y, w, h)) throw new Error("separate: move out of bounds");
    for (let dir = 0; dir < 4; dir++) {
      // No toggling the walls of the grid rim.
      if (flag & BORDER(dir) && outOfBounds(x + DX[dir], y + DY[dir], w, h))
        throw new Error("separate: cannot toggle grid-rim wall");
    }
    ret.borders[y * w + x] ^= flag;
  }
  return ret;
}

export function status(state: SeparateState): GameStatus {
  const { w, h, k, letters, borders } = state;
  return isSolved(w, h, k, letters, borders) ? "solved" : "ongoing";
}

// --- text format ----------------------------------------------------------

export function textFormat(state: SeparateState): string {
  const { w, h, letters, borders } = state;
  return boxedGridText(w, h, {
    corner: "+",
    // The bottom rim repeats the top row's edges (upstream).
    top: (x, y) => {
      const b = borders[(y === h ? 0 : y) * w + x];
      return b & BORDER_U ? "---" : b & DISABLED(BORDER_U) ? " x " : "   ";
    },
    left: (x, y) => {
      if (x === w) return "|";
      const b = borders[y * w + x];
      return b & BORDER_L ? "|" : b & DISABLED(BORDER_L) ? "x" : " ";
    },
    cell: (x, y) => ` ${String.fromCharCode(A + letters[y * w + x])} `,
  });
}
