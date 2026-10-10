/**
 * Types and pure state helpers for Rectangles (`rect.c`).
 *
 * The board is a `w × h` grid of numbers (0 = empty) which the player divides
 * into rectangles by drawing edges. Two edge grids, kept verbatim from
 * upstream:
 *  - `vedge(x,y)` — a vertical edge on the **left** of cell `(x,y)` (between
 *    `x-1` and `x`); meaningful for `x ∈ [1, w-1]`.
 *  - `hedge(x,y)` — a horizontal edge on the **top** of cell `(x,y)` (between
 *    `y-1` and `y`); meaningful for `y ∈ [1, h-1]`.
 * Edge values are 0 (none) or 1 (a wall). The render also uses 2/3 for the
 * transient drag preview, but those never live in state.
 */

import {
  DIFF_EASY,
  DIFF_UNREASONABLE,
  SEARCH_TIER_NAMES,
  searchTierItem,
  searchTierSegment,
} from "../../engine/answer-search.ts";
import { isDigit, parseLeadingInt } from "../../engine/decimal.ts";
import { DESC_TOO_LONG, type DescParse } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { noSuchTier, tooRareToDeal } from "../../engine/difficulty.ts";
import { AREA_TOO_LARGE, atof, formatG } from "../../engine/params.ts";
import type { GridCursor, GridDrag } from "../../engine/pointer.ts";

export interface RectParams {
  w: number;
  h: number;
  /** C `float`: base grid is generated at `size / (1 + expandfactor)` then
   * stretched. Default 0 (all presets). A byte-match float hazard, so encoded
   * `%g` and decoded `atof`. */
  expandfactor: number;
  /** `DIFF_EASY`, a board the solver and the hint finish, or
   * `DIFF_UNREASONABLE`, one with a single answer that they do not reach.
   * Generation-time only. */
  diff: number;
}

/** A player action; upstream's move strings `R x,y,w,h` / `E x,y,w,h` /
 * `H x,y` / `V x,y` / `S…`. */
export type RectMove =
  | { type: "rect"; erasing: boolean; x: number; y: number; w: number; h: number }
  | { type: "edge"; edge: "h" | "v"; x: number; y: number }
  /** The full solution edges (from `solve`/`aux`), applied wholesale. The two
   * strings are `'0'`/`'1'` bit runs in upstream's `S` order (vedge for x≥1
   * row-major, then hedge for y≥1 row-major). */
  | { type: "solve"; vedge: string; hedge: string };

export interface RectState {
  readonly w: number;
  readonly h: number;
  /** The numbers, row-major (`0` = empty). Immutable after `newState`. */
  readonly grid: Int32Array;
  /** Vertical edges (left side of each cell), `w*h`, value 0/1. */
  readonly vedge: Uint8Array;
  /** Horizontal edges (top of each cell), `w*h`, value 0/1. */
  readonly hedge: Uint8Array;
  /** Per-cell correctness overlay (1 = part of a valid rectangle), `w*h`.
   * Recomputed after every move; drives the gray fill + completion. */
  readonly correct: Uint8Array;
}

/** Persisted cursor/drag UI (not history). Mirrors upstream `game_ui`. */
export interface RectUi {
  /** The drag's anchor and current position, in **half-grid** coordinates
   * (0..2w, 0..2h) — Rect's own space, because its rectangles are edge-aligned.
   * `GridDrag` has no opinion about the unit. */
  drag: GridDrag;
  /** Set once a drag has moved off its start point (so a returning drag is
   * still a drag, not a click). Distinct from `drag.live`: a press is live
   * immediately, but has not yet *dragged*, which is what keeps a bare click on
   * an edge from committing a 1×1 rectangle. */
  dragged: boolean;
  /** True while erasing interior edges (right-drag). */
  erasing: boolean;
  /** The current drag box, cell coords, or -1. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cursor: GridCursor;
  cursorDragging: boolean;
}

export interface RectDrawState {
  started: boolean;
  tileSize: number;
  w: number;
  h: number;
  /** Per-cell packed cache word (see render.ts). `-1` = force repaint. */
  visible: Int32Array;
}

/** A flagged edge that the unique solution does not contain. */
export interface RectMistake {
  edge: "h" | "v";
  x: number;
  y: number;
}

/* ----------------------------------------------------------------------
 * Params.
 */

const board = (side: number): RectParams => ({
  w: side,
  h: side,
  expandfactor: 0,
  diff: DIFF_EASY,
});

export function defaultParams(): RectParams {
  return board(7);
}

/** Upstream's seven sizes. */
export const BOARDS: readonly RectParams[] = [7, 9, 11, 13, 15, 17, 19].map(board);

/** The Custom dialog's difficulty field, which the codec writes as well. */
export const tierItem = searchTierItem<RectParams>(
  "diff",
  "An Easy puzzle can be finished one forced rectangle or line at a time: there is always a number with one rectangle left, or a line every rectangle left agrees on. An Unreasonable one has a single solution that those steps stop short of, so somewhere you have to try a rectangle and see what follows. The Hint button stops where the forced steps do.",
);

// Last, in the full form only. Upstream's IDs lack it, and without one a
// board is Easy, the only kind upstream deals with its checks on.
const tierSegment = searchTierSegment([tierItem]);

export function encodeParams(p: RectParams, full: boolean): string {
  let s = `${p.w}x${p.h}`;
  if (full && p.expandfactor) s += `e${formatG(p.expandfactor)}`;
  return s + tierSegment.encode(p, full);
}

export function decodeParams(s: string): RectParams {
  const p = defaultParams();
  const w = parseLeadingInt(s, 0);
  p.w = p.h = w.value;
  let i = w.next;
  if (s[i] === "x") {
    const h = parseLeadingInt(s, i + 1);
    p.h = h.value;
    i = h.next;
  }
  if (s[i] === "e") {
    i++;
    const start = i;
    while (i < s.length && (s[i] === "." || isDigit(s[i]))) i++;
    // Stored as a C `float`, so round to single precision.
    p.expandfactor = Math.fround(atof(s.slice(start, i)));
  }
  // Upstream's trailing `a` asks for a board with no promised single answer.
  // Every board dealt here has one, so the letter is read past.
  if (s[i] === "a") i++;
  tierSegment.decode(s, i, p);
  return p;
}

export function validateParams(p: RectParams, full: boolean): string | null {
  if (p.w > 1_000_000 / p.h) return AREA_TOO_LARGE;
  if (p.w * p.h < 2) return "Grid area must be greater than one.";
  if (full && p.diff === DIFF_UNREASONABLE) return unreasonableRefusal(p);
  return null;
}

function unreasonableRefusal(p: RectParams): string | null {
  const tier = SEARCH_TIER_NAMES[DIFF_UNREASONABLE] as string;
  const short = Math.min(p.w, p.h);
  const long = Math.max(p.w, p.h);
  // On a strip the first number's rectangle starts at the end and is as long
  // as its number, and so on along it: the solver settles every one. On the
  // rest every division and every place for its numbers was tried
  // (`rect-tier.test.ts`), and the hint finishes each board with one answer.
  const none = short === 1 || (short === 2 && long <= 8) || (short === 3 && long <= 4);
  if (none) return noSuchTier(`${p.w}x${p.h} puzzle`, tier);
  // Every board two wide found with the tier has a rectangle of four squares
  // or more, and the generator draws none of more than a sixth of the board:
  // under 24 squares a 4 is left to a single square merged into a 3. Measured 2026-10-10: 32 of the 1,396,400
  // boards of 2×9 with no 1 on them have the tier, and none came in 400,000
  // draws there or at 2×10; one came in 78,000 at 2×11 and in 7,400 at 2×12.
  if (short === 2 && long <= 11) return tooRareToDeal(`${p.w}x${p.h} puzzles`, tier);
  return null;
}

/* ----------------------------------------------------------------------
 * Description codec (run-length: a–z gaps, `_` separators, decimal numbers).
 */

const CODE_A = "a".charCodeAt(0);

/** Encode a numbers array (row-major, 0 = empty) into the upstream desc. */
export function encodeNumbers(numbers: ArrayLike<number>, area: number): string {
  let out = "";
  let run = 0;
  for (let i = 0; i <= area; i++) {
    const n = i < area ? numbers[i] : -1;
    if (n === 0) {
      run++;
    } else {
      if (run) {
        while (run > 0) {
          const gap = Math.min(run, 26);
          out += String.fromCharCode(CODE_A - 1 + gap);
          run -= gap;
        }
      } else if (out.length > 0 && n > 0) {
        // No unnecessary `_` before a number at the very top-left.
        out += "_";
      }
      if (n > 0) out += String(n);
      run = 0;
    }
  }
  return out;
}

/** Whether `c` is a run letter: `a`–`z` for 1–26 empty squares. */
function isRunLetter(c: string): boolean {
  return c >= "a" && c <= "z";
}

/**
 * Read the numbers {@link encodeNumbers} writes, row-major with `0` for an
 * empty square: numbers, run letters, and a `_` exactly between two adjacent
 * numbers. A number is a rectangle's area, so it lies in `1..w*h`.
 */
export function parseDesc(p: RectParams, desc: string): DescParse<Int32Array> {
  const area = p.w * p.h;
  return readDesc(desc, (r) => {
    const grid = new Int32Array(area);
    let i = 0;
    let afterNumber = false;
    while (i < area) {
      if (r.peekIs(isRunLetter)) {
        i += r.char().charCodeAt(0) - CODE_A + 1;
        if (i > area) r.fail(DESC_TOO_LONG);
        afterNumber = false;
      } else {
        if (afterNumber) r.expect("_");
        grid[i++] = r.int(1, area);
        afterNumber = true;
      }
    }
    r.end();
    return grid;
  });
}
