/**
 * Unruly state, params and desc codec: the state half of `unruly.c`.
 *
 * A cell is `EMPTY`, `ONE` or `ZERO`, and as upstream, **`ONE` renders dark
 * ("black") and `ZERO` renders light ("white")** (see `render.ts`).
 */

import { assertNever } from "../../engine/assert-never.ts";
import { type DescParse, descValue } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { difficultyItem } from "../../engine/difficulty.ts";
import { readDotRuns, writeDotRuns } from "../../engine/dot-runs.ts";
import type { ParamConfigItem, PresetMenu } from "../../engine/game.ts";
import { modifierItem } from "../../engine/modifier.ts";
import { AREA_TOO_LARGE, dimensionParamConfig } from "../../engine/params.ts";
import { choice, dims, flag, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import type { GameStatus } from "../../engine/types.ts";
import {
  type Cell,
  DIFF_CHARS,
  DIFF_COUNT,
  DIFF_EASY,
  DIFF_NAMES,
  DIFF_NORMAL,
  DIFF_TRIVIAL,
  ONE,
  ZERO,
} from "./constants.ts";
import { isComplete } from "./solver.ts";

// --- types ---------------------------------------------------------------

export interface UnrulyParams {
  /** Full grid width (even, ≥ 6). */
  w2: number;
  /** Full grid height (even, ≥ 6). */
  h2: number;
  /** Forbid two identical rows / two identical columns. */
  unique: boolean;
  diff: number;
}

export interface UnrulyState {
  readonly w2: number;
  readonly h2: number;
  readonly unique: boolean;
  /** Per-cell value (EMPTY/ONE/ZERO), cloned per move. */
  readonly grid: Uint8Array;
  /** 1 where the cell is a fixed clue; shared by reference across a
   * game's states (upstream's refcounted `common->immutable`). */
  readonly immutable: Uint8Array;
}

/** A `place` sets one non-immutable cell (upstream `P{c},{x},{y}`); a
 * `solve` applies a full solution grid as a string of `'0'`/`'1'`
 * (upstream `S…`), kept a string so the move is JSON-save-safe. */
export type UnrulyMove =
  | { type: "place"; x: number; y: number; value: Cell }
  | { type: "solve"; grid: string };

export interface UnrulyUi {
  cursor: GridCursor;
}

/** A player-placed cell whose color contradicts the unique solution
 * (surfaced by Check & Save). */
export interface UnrulyMistake {
  x: number;
  y: number;
}

// --- params --------------------------------------------------------------

const PRESETS: UnrulyParams[] = [
  { w2: 8, h2: 8, unique: false, diff: DIFF_TRIVIAL },
  { w2: 8, h2: 8, unique: false, diff: DIFF_EASY },
  { w2: 8, h2: 8, unique: false, diff: DIFF_NORMAL },
  { w2: 10, h2: 10, unique: false, diff: DIFF_EASY },
  { w2: 10, h2: 10, unique: false, diff: DIFF_NORMAL },
  { w2: 14, h2: 14, unique: false, diff: DIFF_EASY },
  { w2: 14, h2: 14, unique: false, diff: DIFF_NORMAL },
];

export function defaultParams(): UnrulyParams {
  return { ...PRESETS[0] };
}

export function presets(): PresetMenu<UnrulyParams> {
  return {
    title: "Size",
    submenu: PRESETS.map((p) => ({ params: { ...p } })),
  };
}

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<UnrulyParams>[] = [
  // Upstream's `w2`/`h2` are the *full* grid extent, not halves, so the
  // fields are mapped rather than the game renamed.
  ...dimensionParamConfig<UnrulyParams>({
    fields: { w: "w2", h: "h2" },
    doc: "Size of the grid in squares. Both must be even.",
    bounds: { min: 6 },
  }),
  difficultyItem(DIFF_NAMES, "diff"),
  modifierItem<UnrulyParams>({
    kw: "unique-rows-and-columns",
    name: "Unique rows and columns",
    type: "boolean",
    when: true,
    words: "unique",
    slot: "tail",
    rule: "no two rows may be the same, and no two columns.",
    note: "There are only so many different rows of a given width, so this limits how tall the grid can be for its width, and the other way round: a grid 6 squares wide can be at most 14 high, and one 8 wide at most 34.",
    get: (p) => p.unique,
    set: (p, v) => {
      p.unique = v;
    },
  }),
];

/** `WxH`, the unique-rows letter, then the generator-only difficulty letter. A
 * missing or unknown difficulty letter leaves one `paramsError` rejects. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  flag(paramConfig, "u", "unique-rows-and-columns"),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, {
    full: true,
    invalid: DIFF_COUNT + 1,
  }),
]);

// The nth element gives the count of distinct valid Unruly rows of length
// 2n (n ones, n zeros, no three-in-a-row), for as long as it fits a signed
// 32-bit int. In unique-rows mode a 2n-wide puzzle's height ≤ A177790[n]
// and vice versa. OEIS A177790.
const A177790 = [
  1, 2, 6, 14, 34, 84, 208, 518, 1296, 3254, 8196, 20700, 52404, 132942, 337878, 860142,
  2192902, 5598144, 14308378, 36610970, 93770358, 240390602, 616787116, 1583765724,
];

export function validateParams(p: UnrulyParams, _full: boolean): string | null {
  if (p.w2 & 1 || p.h2 & 1) return "Width and height must both be even.";
  if (p.w2 > Number.MAX_SAFE_INTEGER / p.h2) {
    return AREA_TOO_LARGE;
  }
  if (p.unique) {
    if (p.w2 < 2 * A177790.length && p.h2 > A177790[p.w2 / 2]) {
      return "Puzzle is too tall for unique-rows mode.";
    }
    if (p.h2 < 2 * A177790.length && p.w2 > A177790[p.h2 / 2]) {
      return "Puzzle is too long for unique-rows mode.";
    }
  }
  return null;
}

// --- desc codec ----------------------------------------------------------
// The givens as `engine/dot-runs.ts` writes dots: a ZERO is lowercase, a ONE
// uppercase.

function parseDesc(
  p: UnrulyParams,
  desc: string,
): DescParse<{ grid: Uint8Array; immutable: Uint8Array }> {
  const s = p.w2 * p.h2;
  return readDesc(desc, (r) => {
    const grid = new Uint8Array(s); // all EMPTY
    const immutable = new Uint8Array(s);
    readDotRuns(r, s, (i, kind) => {
      grid[i] = kind === 1 ? ONE : ZERO;
      immutable[i] = 1;
    });
    return { grid, immutable };
  });
}

export function newState(p: UnrulyParams, desc: string): UnrulyState {
  const { grid, immutable } = descValue(parseDesc(p, desc));
  return {
    w2: p.w2,
    h2: p.h2,
    unique: p.unique,
    grid,
    immutable,
  };
}

/** Encode a filled-or-partial grid as the desc above. */
export function encodeGrid(grid: Uint8Array, s: number): string {
  return writeDotRuns(s, (i) => (grid[i] === ONE ? 1 : grid[i] === ZERO ? 0 : null));
}

// --- moves ---------------------------------------------------------------

export function executeMove(state: UnrulyState, move: UnrulyMove): UnrulyState {
  const { w2, h2 } = state;
  const s = w2 * h2;

  if (move.type === "solve") {
    if (move.grid.length !== s) throw new Error("Bad solve grid");
    const grid = new Uint8Array(s);
    for (let i = 0; i < s; i++) {
      const c = move.grid[i];
      if (c !== "0" && c !== "1") throw new Error("Bad solve grid");
      grid[i] = c === "1" ? ONE : ZERO;
    }
    return { ...state, grid };
  }
  if (move.type !== "place") return assertNever(move, "unruly: executeMove");

  const { x, y, value } = move;
  if (x < 0 || x >= w2 || y < 0 || y >= h2) throw new Error("Move out of bounds");
  const i = y * w2 + x;
  if (state.immutable[i]) throw new Error("Cannot edit an immutable cell");

  const next = { ...state, grid: Uint8Array.from(state.grid) };
  next.grid[i] = value;
  return next;
}

// --- status / text -------------------------------------------------------

export function status(state: UnrulyState): GameStatus {
  return isComplete(state) ? "solved" : "ongoing";
}

export function textFormat(state: UnrulyState): string {
  const { w2, h2, grid } = state;
  let out = "";
  for (let y = 0; y < h2; y++) {
    for (let x = 0; x < w2; x++) {
      const c = grid[y * w2 + x];
      out += `${c === ONE ? "1" : c === ZERO ? "0" : "."} `;
    }
    out += "\n";
  }
  return out;
}
