/**
 * Filling (Fillomino) state, params, and desc codec — the state half of
 * `filling.c`.
 *
 * A cell holds 0 (EMPTY) or 1..9. `clues[i] != 0` marks an immutable given
 * (shared by reference across a game's states, upstream's refcounted
 * `shared->clues`); a cell with `board[i] != 0` but `clues[i] == 0` is
 * player-filled. Region sizes never exceed 9 (the generator caps them).
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
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  type DescParse,
  descBadCharacter,
  descValue,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { noSuchTier } from "../../engine/difficulty.ts";
import { Dsf } from "../../engine/dsf.ts";
import type { ParamConfigItem, PresetMenu } from "../../engine/game.ts";
import { AREA_TOO_LARGE, dimensionParamConfig } from "../../engine/params.ts";
import { dims, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { presetGrid } from "../../engine/preset-grid.ts";
import { encodeRunLength, scanRunLength } from "../../engine/run-length.ts";
import type { GameStatus } from "../../engine/types.ts";

const EMPTY = 0;

/** Orthogonal neighbor offsets (upstream `dx`/`dy`). */
export const DX = [-1, 1, 0, 0] as const;
export const DY = [0, 0, -1, 1] as const;

// --- types ---------------------------------------------------------------

export interface FillingParams {
  w: number;
  h: number;
  /** `DIFF_EASY`, a board the solver's deductions finish, or
   * `DIFF_UNREASONABLE`, one with a single answer that they do not reach.
   * Generation-time only. */
  diff: number;
}

export interface FillingState {
  readonly w: number;
  readonly h: number;
  /** Immutable clue grid (0 = unclued); shared by reference. */
  readonly clues: Uint8Array;
  /** Mutable player grid (0 = empty), cloned per move. */
  readonly board: Uint8Array;
}

/** A `set` writes one value into every listed cell (upstream `"i,..._v"`);
 * a `solve` applies a full solution as a digit string (upstream `"s…"`). */
export type FillingMove =
  | { type: "set"; cells: number[]; value: number }
  | { type: "solve"; board: string };

export interface FillingUi {
  /** Currently-selected cell indices, or null for no selection. */
  sel: Set<number> | null;
  cursor: GridCursor;
  keydragging: boolean;
}

// --- params --------------------------------------------------------------

const board = (w: number, h: number): FillingParams => ({ w, h, diff: DIFF_EASY });

/** Upstream's three sizes. The menu offers each at both tiers. */
const BOARDS: readonly FillingParams[] = [board(7, 9), board(9, 13), board(13, 17)];

export function defaultParams(): FillingParams {
  return board(9, 13);
}

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<FillingParams>[] = [
  ...dimensionParamConfig<FillingParams>({
    doc: "Size of the grid in squares. A board of more than 300 squares is refused, because filling one with regions that obey the rule stops succeeding as the grid grows.",
    bounds: { min: 1 },
  }),
  searchTierItem(
    "diff",
    "An Easy puzzle can be finished one forced square at a time: some region can only grow one way, or some square has one number left. An Unreasonable one has a single solution that those steps stop short of, so somewhere you have to try a number in a square and see what follows. The Hint button stops where the forced squares do.",
  ),
];

export function presets(): PresetMenu<FillingParams> {
  return { title: "Size", ...presetGrid(paramConfig, BOARDS) };
}

/** `WxH[d<tier>]`, with upstream's square fallback: a bare `W` is a W×W
 * board. Upstream's IDs lack the tier: without one a board is Easy, the only
 * kind upstream deals. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  searchTierSegment(paramConfig),
]);

/**
 * The largest board dealt, in squares, at either tier. The generator fills a
 * board with regions by a draw it throws away whole when two equal regions
 * end up side by side with no merge left, and the share of draws that
 * survive falls steeply with the area. Upstream has no bound and draws for
 * ever.
 *
 * Measured 2026-10-10, draws for one fill: 15×15 48, 17×17 290, 15×20 500 |
 * 18×18 890, 20×20 2,800, and at 25×25 none in 200,000. Thin boards are
 * kinder (2×150 23, 5×60 89, 9×33 207) except a strip, 1×300, at 1,300. An
 * Easy board of 300 squares takes a third of a second and an Unreasonable
 * one a little over a second.
 */
const MAX_AREA = 300;

/**
 * The lengths of a board one square wide that has no Unreasonable puzzle:
 * every clue set of each has been tried, and wherever one has a single answer
 * the solver finishes it (`filling-tier.test.ts`). Every other board has the
 * tier. Lengths two and five do, and so does 2×2.
 */
const noUnreasonableStrip = (length: number): boolean =>
  length === 1 || length === 3 || length === 4;

export function validateParams(p: FillingParams, full: boolean): string | null {
  if (p.w > Number.MAX_SAFE_INTEGER / p.h) {
    return AREA_TOO_LARGE;
  }
  // Generation only: a board that arrives with its description is graded as
  // it loads, whatever its size and whatever tier its ID names.
  if (!full) return null;
  if (p.w * p.h > MAX_AREA)
    return `Width times height must be at most ${MAX_AREA}; larger boards cannot be generated.`;
  if (
    p.diff === DIFF_UNREASONABLE &&
    Math.min(p.w, p.h) === 1 &&
    noUnreasonableStrip(Math.max(p.w, p.h))
  )
    return noSuchTier(`${p.w}x${p.h} puzzle`, SEARCH_TIER_NAMES[DIFF_UNREASONABLE]);
  return null;
}

/** The largest number a board of this size holds: its longer side, nine at
 * most since a square takes one digit, and three on the boards too small to
 * have a longer side of three (upstream's case is 2×2, which needs a region of
 * three). No region is dealt larger, and no answer is looked for with one. */
export function largestNumber(w: number, h: number): number {
  return Math.min(Math.max(w, h, 3), 9);
}

// --- desc codec ----------------------------------------------------------
// Run-length: a lowercase letter 'a'..'z' advances past a run of 1..26 empty
// cells; a digit places a clue of that value. The decoded area is exactly w·h.

/** The clues, `EMPTY` where the desc has none. */
function parseDesc(p: FillingParams, desc: string): DescParse<Uint8Array> {
  const sz = p.w * p.h;
  // Upstream `validate_desc`'s bound on a clue; generated clues never exceed 9.
  // A `0` would be a second spelling of a blank, which {@link encodeDesc}
  // never writes.
  const m = Math.max(p.w, p.h, 3);
  return readDesc(desc, (r) => {
    const clues = new Uint8Array(sz); // all EMPTY
    let area = 0;
    for (const tok of scanRunLength(r.rest())) {
      if ("blanks" in tok) {
        area += tok.blanks;
      } else {
        const v = digitValue(tok.value);
        if (v === null) return r.fail(descBadCharacter(tok.value));
        if (v < 1 || v > m) r.fail(DESC_OUT_OF_RANGE);
        clues[area++] = v;
      }
      // Inside the loop, so an overlong desc is reported as such even when a
      // later character is also invalid.
      if (area > sz) r.fail(DESC_TOO_LONG);
    }
    if (area < sz) r.fail(DESC_TOO_SHORT);
    return clues;
  });
}

export function newState(p: FillingParams, desc: string): FillingState {
  const clues = descValue(parseDesc(p, desc));
  return {
    w: p.w,
    h: p.h,
    clues,
    board: Uint8Array.from(clues),
  };
}

/**
 * Encode a finished board as a desc — the inverse of {@link newState}.
 *
 * `keepTrailingBlanks` because {@link parseDesc} rejects a desc whose cells
 * do not add up to the whole grid ("Not enough data to fill grid"), so a board
 * ending in empties needs the run that reaches the last cell.
 */
export function encodeDesc(board: ArrayLike<number>, sz: number): string {
  return encodeRunLength(sz, (i) => (board[i] === EMPTY ? null : String(board[i])), {
    keepTrailingBlanks: true,
  });
}

// --- region DSF + completion --------------------------------------------

/** Disjoint-set of orthogonally-connected equal-valued cells. */
export function makeRegionDsf(board: ArrayLike<number>, w: number, h: number): Dsf {
  const dsf = new Dsf(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (x + 1 < w && board[i] === board[i + 1]) dsf.merge(i, i + 1);
      if (y + 1 < h && board[i] === board[i + w]) dsf.merge(i, i + w);
    }
  }
  return dsf;
}

/** Complete iff every cell's value equals the size of its region. (Empty
 * cells have value 0 but region size ≥ 1, so any empty cell fails.) */
export function isComplete(board: ArrayLike<number>, w: number, h: number): boolean {
  const dsf = makeRegionDsf(board, w, h);
  const sz = w * h;
  for (let i = 0; i < sz; i++) if (board[i] !== dsf.size(i)) return false;
  return true;
}

// --- moves ---------------------------------------------------------------

function cloneState(state: FillingState): FillingState {
  return { ...state, board: Uint8Array.from(state.board) };
}

export function executeMove(state: FillingState, move: FillingMove): FillingState {
  const { w, h } = state;
  const sz = w * h;

  if (move.type === "solve") {
    if (move.board.length !== sz) throw new Error("Bad solve board");
    const board = new Uint8Array(sz);
    for (let i = 0; i < sz; i++) {
      const v = digitValue(move.board[i]);
      if (v === null) throw new Error("Bad solve board");
      board[i] = v;
    }
    return { ...state, board };
  }
  if (move.type !== "set") return assertNever(move, "filling: executeMove");

  const { cells, value } = move;
  if (value < 0 || value > 9) throw new Error("Move value out of range");
  const next = cloneState(state);
  for (const c of cells) {
    if (c < 0 || c >= sz) throw new Error("Move cell out of bounds");
    next.board[c] = value;
  }
  return next;
}

// --- status / text -------------------------------------------------------

export function status(state: FillingState): GameStatus {
  return isComplete(state.board, state.w, state.h) ? "solved" : "ongoing";
}

/** Bordered ASCII grid (upstream `board_to_string`). */
export function textFormat(state: FillingState): string {
  const { w, h, board } = state;
  const sep = `+${"---+".repeat(w)}\n`;
  let out = sep;
  for (let y = 0; y < h; y++) {
    let row = "|";
    for (let x = 0; x < w; x++) {
      const v = board[y * w + x];
      row += v ? ` ${v} |` : "   |";
    }
    out += `${row}\n${sep}`;
  }
  return out;
}
