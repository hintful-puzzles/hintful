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
import { noSuchTier } from "../../engine/difficulty.ts";
import {
  AREA_TOO_LARGE,
  endParams,
  formatG,
  parseLeadingFloat,
} from "../../engine/params.ts";
import type { GridCursor, GridDrag } from "../../engine/pointer.ts";
import { type Ruleset, rulesetItem } from "../../engine/ruleset.ts";
import type { Rect } from "../../engine/types.ts";

/** The two puzzles, indexed by `mode`. */
export const MODE_RECT = 0;
export const MODE_PATCHES = 1;

const RULESETS: readonly Ruleset[] = [
  {
    name: "Rectangles",
    rule: "Every clue is a number, and its rectangle has that many squares.",
  },
  {
    name: "Patches",
    rule: "A clue may name a shape, and has a number of squares or a question mark.",
  },
];

/** What a clue says of its rectangle's shape, by `shapes`. */
export const SHAPE_ANY = 0;
export const SHAPE_SQUARE = 1;
export const SHAPE_TALL = 2;
const SHAPE_WIDE = 3;

/** A clue's size in `grid` where the clue shows none. */
export const HIDDEN = -1;

/** Whether a `rw × rh` rectangle is one a clue of `shape` and `size` asks
 * for. */
export function clueAllows(
  shape: number,
  size: number,
  rw: number,
  rh: number,
): boolean {
  if (size !== HIDDEN && rw * rh !== size) return false;
  if (shape === SHAPE_SQUARE) return rw === rh;
  if (shape === SHAPE_TALL) return rh > rw;
  if (shape === SHAPE_WIDE) return rw > rh;
  return true;
}

/** The shape a `rw × rh` rectangle is. */
export const shapeOf = (rw: number, rh: number): number =>
  rw === rh ? SHAPE_SQUARE : rh > rw ? SHAPE_TALL : SHAPE_WIDE;

/**
 * Each `[width, height]` a clue of `shape` and `size` allows, by width and
 * then height. A clue with a size gives each width that divides it, however
 * large; one without gives every rectangle of `w × h` or less.
 */
export function clueDimensions(
  shape: number,
  size: number,
  w: number,
  h: number,
): [number, number][] {
  const out: [number, number][] = [];
  if (size !== HIDDEN) {
    for (let rw = 1; rw <= size; rw++)
      if (size % rw === 0 && clueAllows(shape, size, rw, size / rw))
        out.push([rw, size / rw]);
    return out;
  }
  for (let rw = 1; rw <= w; rw++)
    for (let rh = 1; rh <= h; rh++)
      if (clueAllows(shape, size, rw, rh)) out.push([rw, rh]);
  return out;
}

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
  /** {@link MODE_RECT} or {@link MODE_PATCHES}. */
  mode: number;
}

/** A player action; upstream's move strings `R x,y,w,h` / `E x,y,w,h` /
 * `H x,y` / `V x,y` / `S…`. */
export type RectMove =
  | { type: "rect"; erasing: boolean; x: number; y: number; w: number; h: number }
  | { type: "edge"; edge: "h" | "v"; x: number; y: number }
  /** A drawn rectangle made `to`: a drag from one of its squares
   * (`resizeEdges`). */
  | { type: "resize"; from: Rect; to: Rect }
  /** The full solution edges (from `solve`/`aux`), applied wholesale. The two
   * strings are `'0'`/`'1'` bit runs in upstream's `S` order (vedge for x≥1
   * row-major, then hedge for y≥1 row-major). */
  | { type: "solve"; vedge: string; hedge: string };

export interface RectState {
  readonly w: number;
  readonly h: number;
  /** The clues' sizes, row-major: `0` where there is no clue, {@link HIDDEN}
   * where one shows none. Immutable after `newState`. */
  readonly grid: Int32Array;
  /** Each clue's `SHAPE_*`: {@link SHAPE_ANY} off the clues, and on every
   * clue of a Rectangles board. */
  readonly shapes: Uint8Array;
  /** Vertical edges (left side of each cell), `w*h`, value 0/1. */
  readonly vedge: Uint8Array;
  /** Horizontal edges (top of each cell), `w*h`, value 0/1. */
  readonly hedge: Uint8Array;
  /** The rectangles the player drew, by a drag or a resize, oldest first:
   * what they mean by a rectangle, where a box their lines happen to close is
   * not one (`readClaims`). One a later move broke is still listed, and is
   * read as nothing. */
  readonly drawn: readonly Rect[];
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
  /** The drawn rectangle a drag resizes, and the square it was pressed on,
   * or null where the drag draws a rectangle of its own. */
  resizing: { from: Rect; x: number; y: number } | null;
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
  /** Per-cell tone of the win flash last drawn, beside the word, which is
   * full. */
  tone: Uint8Array;
  /** Per-cell key of the hint rings last drawn through it: a ring reaches
   * past its element, so no side bits in the word can say which it was. */
  rings: string[];
  /** Per-cell key of the line colors last drawn round it (`render.ts`),
   * beside the word, which has no room for them. */
  tints: Int32Array;
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

const board = (w: number, h = w, mode = MODE_RECT): RectParams => ({
  w,
  h,
  expandfactor: 0,
  diff: DIFF_EASY,
  mode,
});

export function defaultParams(): RectParams {
  return board(7);
}

/** Upstream's seven sizes, every other one made an upright board of about
 * its area. */
export const BOARDS: readonly RectParams[] = [
  board(7),
  board(8, 10),
  board(11),
  board(12, 14),
  board(15),
  board(15, 19),
  board(19),
  // Three sizes at two tiers fill the menu, upright ones among them as on
  // Rectangles' own.
  board(7, 7, MODE_PATCHES),
  board(6, 8, MODE_PATCHES),
  board(9, 12, MODE_PATCHES),
];

/** The Custom dialog's game mode field. */
export const rulesetField = rulesetItem<RectParams>(RULESETS, "mode");

/** The Custom dialog's difficulty field, which the codec writes as well. */
export const tierItem = searchTierItem<RectParams>(
  "diff",
  "An Easy puzzle can be finished one forced rectangle or line at a time: there is always a number with one rectangle left, or a line every rectangle left agrees on. An Unreasonable one has a single solution that those steps stop short of, so somewhere you have to try a rectangle and see what follows. The Hint button stops where the forced steps do.",
);

// Last, in the full form only. Upstream's IDs lack it, and without one a
// board is Easy, the only kind upstream deals with its checks on.
const tierSegment = searchTierSegment([tierItem]);

export function encodeParams(p: RectParams, full: boolean): string {
  // A `p` for Patches; Rectangles writes nothing, as its strings always have.
  let s = `${p.w}x${p.h}${p.mode === MODE_PATCHES ? "p" : ""}`;
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
  if (s[i] === "p") {
    p.mode = MODE_PATCHES;
    i++;
  }
  if (s[i] === "e") {
    const factor = parseLeadingFloat(s, i + 1);
    // Stored as a C `float`, so round to single precision.
    p.expandfactor = Math.fround(factor.value);
    i = factor.next;
  }
  // Upstream's trailing `a` asks for a board with no promised single answer.
  // Every board dealt here has one, so the letter is read past.
  if (s[i] === "a") i++;
  endParams(s, tierSegment.decode(s, i, p));
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
  // Two wide from 2×9 the tier exists and is dealt, though seldom: measured
  // 2026-10-10, 32 of the 1,396,400 boards of 2×9 with no 1 on them have it,
  // none came in 400,000 draws there or at 2×10, one in 78,000 at 2×11 and
  // one in 7,400 at 2×12.
  return null;
}

/* ----------------------------------------------------------------------
 * Description codec (run-length: a–z gaps, `_` separators, decimal numbers,
 * and Patches' shape letters).
 */

const CODE_A = "a".charCodeAt(0);

/** A clue's letter in the desc, by `SHAPE_*`: a plain clue writes `A` only
 * where it has no number, so a Rectangles desc has no letter at all. */
const SHAPE_LETTERS = "ASTW";

/** The clues of a board: sizes and shapes, row-major, as `RectState` holds
 * them. */
export interface RectClues {
  readonly grid: Int32Array;
  readonly shapes: Uint8Array;
}

/** Encode the clues (row-major, 0 = no clue) into the desc. Without
 * `shapes`, every clue is plain, and the desc is upstream's. */
export function encodeNumbers(
  numbers: ArrayLike<number>,
  area: number,
  shapes?: ArrayLike<number>,
): string {
  let out = "";
  let run = 0;
  let afterClue = false;
  for (let i = 0; i <= area; i++) {
    const n = i < area ? numbers[i] : -1;
    if (n === 0) {
      run++;
      continue;
    }
    while (run > 0) {
      const gap = Math.min(run, 26);
      out += String.fromCharCode(CODE_A - 1 + gap);
      run -= gap;
      afterClue = false;
    }
    if (i === area) break;
    const shape = shapes?.[i] ?? SHAPE_ANY;
    const letter = shape !== SHAPE_ANY || n === HIDDEN ? SHAPE_LETTERS[shape] : "";
    // A number straight after a clue would read as part of it; a letter
    // starts a clue of its own.
    if (!letter && afterClue) out += "_";
    out += letter + (n === HIDDEN ? "" : String(n));
    afterClue = true;
  }
  return out;
}

/** Whether `c` is a run letter: `a`–`z` for 1–26 empty squares. */
function isRunLetter(c: string): boolean {
  return c >= "a" && c <= "z";
}

const isShapeLetter = (c: string): boolean => SHAPE_LETTERS.includes(c);

/**
 * Read the clues {@link encodeNumbers} writes, row-major with `0` for an
 * empty square: run letters and clues, a `_` exactly between a clue and a
 * bare number straight after it. A clue is a shape letter, a number, or a
 * letter and then a number;
 * a number is a rectangle's area, so it lies in `1..w*h`. Only Patches has
 * shape letters.
 */
export function parseDesc(p: RectParams, desc: string): DescParse<RectClues> {
  const area = p.w * p.h;
  return readDesc(desc, (r) => {
    const grid = new Int32Array(area);
    const shapes = new Uint8Array(area);
    let i = 0;
    let afterClue = false;
    while (i < area) {
      if (r.peekIs(isRunLetter)) {
        i += r.char().charCodeAt(0) - CODE_A + 1;
        if (i > area) r.fail(DESC_TOO_LONG);
        afterClue = false;
      } else if (p.mode === MODE_PATCHES && r.peekIs(isShapeLetter)) {
        shapes[i] = SHAPE_LETTERS.indexOf(r.char());
        grid[i++] = r.peekIs(isDigit) ? r.int(1, area) : HIDDEN;
        afterClue = true;
      } else {
        if (afterClue) r.expect("_");
        grid[i++] = r.int(1, area);
        afterClue = true;
      }
    }
    r.end();
    return { grid, shapes };
  });
}
