/**
 * The edge-clue Latin square: the board Unequal and Adjacent share, from the
 * state/codec parts of `unequal.c`.
 *
 * A board is an `order × order` Latin square of numbers `1..order`. Between some
 * pairs of orthogonally adjacent cells sit *clues*, and what a clue says is the
 * game's {@link ClueKind}: Unequal's greater-than sign, Adjacent's bar. Each cell
 * holds an optional given number (`immutable`, shared by reference) and the
 * player's working number (`grid`) or pencil-mark bitmap (`pencil`). The
 * clues live in `clueFlags` (immutable); the player can gray out a clue they
 * have used (the `spent` flags, mutable).
 */

import type { CandidateReading } from "../candidate-hint.ts";
import { parseLeadingInt } from "../decimal.ts";
import {
  DESC_CONTRADICTORY,
  DESC_OUT_OF_RANGE,
  type DescParse,
  descValue,
} from "../desc-error.ts";
import { readDesc } from "../desc-reader.ts";
import { tierNames } from "../difficulty.ts";
import type { GameDrawing } from "../game.ts";
import type { LatinLadder } from "../latin.ts";
import { endParams, paramsLetter } from "../params.ts";
import { digitOf, type GridCursor, isEraseKey, newCursor } from "../pointer.ts";

// --- the clue kind -----------------------------------------------------------

/** One gap's clue as plain text: the gap right of cell `(x, y)` or below it. */
export type GapSide = "right" | "down";

/**
 * Everything the two games do differently below their `Game` objects: what a
 * clue says, how it is flagged and dealt, the ladder its description compiles
 * to, and how it is drawn.
 */
export interface ClueKind {
  /** The game's id, which the shared code's errors name. */
  game: string;
  /** Whether the clue flagged at a cell holding `a`, toward a neighbor holding
   * `b`, is true of them. */
  holds(a: number, b: number): boolean;
  /** Every true clue is dealt, so a missing one says it does not hold. */
  complete: boolean;
  /** A clue is flagged from both its cells, rather than from the one it
   * starts at. */
  bothEnds: boolean;
  /** The techniques the game's description places at each tier, over this
   * board's clues. */
  ladder(o: number, flags: Int32Array): LatinLadder;
  /** Draw the clues in the gaps the cell at `(ox, oy)` owns, from its composed
   * flag word `f` (clue, error and spent bits). */
  drawClues(dr: GameDrawing, ts: number, ox: number, oy: number, f: number): void;
  /** The gap's one character in `textFormat`. */
  glyph(flags: Int32Array, o: number, x: number, y: number, side: GapSide): string;
}

/** Whether filled neighbors `a` and `b` break the clue between them, `flagged`
 * saying whether the clue is dealt toward `b` at `a`'s cell. */
export function breaksClue(
  kind: ClueKind,
  flagged: boolean,
  a: number,
  b: number,
): boolean {
  if (flagged) return !kind.holds(a, b);
  return kind.complete && kind.holds(a, b);
}

// --- difficulty ------------------------------------------------------------

export type Difficulty = "trivial" | "easy" | "tricky" | "extreme" | "recursive";

const DIFF_EASY = 1;
export const DIFF_SET = 2;
export const DIFF_EXTREME = 3;
export const DIFF_RECURSIVE = 4;

// unequal_diffchars, indexed by level.
const DIFF_CHARS = "tekxr";
// The top tier is `Unreasonable`, not upstream's `Recursive`: it is the tier
// that may require guessing. Its character stays `r`.
export const DIFF_NAMES = tierNames(5, { search: true });
const DIFFS: Difficulty[] = ["trivial", "easy", "tricky", "extreme", "recursive"];

export function diffToLevel(d: Difficulty): number {
  const i = DIFFS.indexOf(d);
  return i < 0 ? DIFF_EASY : i;
}
export function diffFromLevel(level: number): Difficulty {
  return DIFFS[level] ?? "easy";
}
function diffChar(d: Difficulty): string {
  return DIFF_CHARS[diffToLevel(d)];
}

// --- flag bits (upstream F_*) ----------------------------------------------

export const F_ADJ_UP = 2;
export const F_ADJ_RIGHT = 4;
export const F_ADJ_DOWN = 8;
export const F_ADJ_LEFT = 16;
export const F_ERROR = 32;
export const F_ERROR_UP = 64;
export const F_ERROR_RIGHT = 128;
export const F_ERROR_DOWN = 256;
export const F_ERROR_LEFT = 512;
export const F_SPENT_UP = 1024;
export const F_SPENT_RIGHT = 2048;
export const F_SPENT_DOWN = 4096;
export const F_SPENT_LEFT = 8192;

/** `ADJ_TO_SPENT(F_ADJ_*) = F_ADJ_* << 9`. */
export function adjToSpent(f: number): number {
  return f << 9;
}

/**
 * The four orthogonal directions, in upstream `adjthan[]` order (up, right,
 * down, left). `f` is the clue flag toward the neighbor; `fo` the reciprocal
 * flag on the neighbor; `fe` the error flag; `dx`/`dy` the step.
 */
export const ADJTHAN: ReadonlyArray<{
  f: number;
  fo: number;
  fe: number;
  dx: number;
  dy: number;
}> = [
  { f: F_ADJ_UP, fo: F_ADJ_DOWN, fe: F_ERROR_UP, dx: 0, dy: -1 },
  { f: F_ADJ_RIGHT, fo: F_ADJ_LEFT, fe: F_ERROR_RIGHT, dx: 1, dy: 0 },
  { f: F_ADJ_DOWN, fo: F_ADJ_UP, fe: F_ERROR_DOWN, dx: 0, dy: 1 },
  { f: F_ADJ_LEFT, fo: F_ADJ_RIGHT, fe: F_ERROR_LEFT, dx: -1, dy: 0 },
];

// --- params ----------------------------------------------------------------

export interface EdgeClueParams {
  order: number;
  diff: Difficulty;
}

export function encodeParams(p: EdgeClueParams, full: boolean): string {
  let s = String(p.order);
  if (full) s += `d${diffChar(p.diff)}`;
  return s;
}

/** `{order}d{c}`, each part optional; what is missing is `defaults`'. */
export function decodeParams(s: string, defaults: EdgeClueParams): EdgeClueParams {
  const p = { ...defaults };
  const order = parseLeadingInt(s, 0);
  if (order.next > 0) p.order = order.value;
  let i = order.next;
  if (s[i] === "d") {
    p.diff = diffFromLevel(paramsLetter(s, i + 1, DIFF_CHARS));
    i += 2;
  }
  endParams(s, i);
  return p;
}

// --- number <-> character (upstream's n2c / c2n) ---------------------------
//
// A display-and-input codec, not a desc alphabet: it takes the puzzle's order,
// shifts its digits above order 9, maps 0 to a space and reads keypresses. The
// names `n2c`/`c2n` are `engine/desc-alphabet.ts`'s and are reserved for it.

/** Render number `n` (1..order) as its display character. `0` → space. */
export function displayChar(n: number, order: number): string {
  if (n === 0) return " ";
  if (order < 10) {
    if (n < 10) return String(n);
  } else {
    if (n < 11) return String(n - 1);
    const m = n - 11;
    if (m <= 26) return String.fromCharCode(65 + m);
  }
  return "?";
}

/** Parse a key/character to a number, or `-1` if not a digit. `' '`/backspace →
 * 0. Mirrors upstream `c2n` (includes keypresses for `interpretMove`). */
export function charValue(c: number, order: number): number {
  if (c < 0 || c > 0xff) return -1;
  if (c === 32 || isEraseKey(c)) return 0;
  // Above order 9 the digits shift up by one: `'0'` is 1 and `'9'` is 10.
  const digit = digitOf(c);
  if (digit !== null) return order < 10 ? digit : digit + 1;
  if (order >= 10) {
    if (c >= 65 && c <= 90) return c - 65 + 11;
    if (c >= 97 && c <= 122) return c - 97 + 11;
  }
  return -1;
}

// --- state -----------------------------------------------------------------

export interface EdgeClueState {
  order: number;
  /** What a clue says; the game's, shared by reference. */
  kind: ClueKind;
  diff: Difficulty;
  /** `order²` given numbers (0 = blank); immutable, shared by reference. */
  immutable: Int8Array;
  /** `order²` clue flags (`F_ADJ_*`); immutable, shared by reference. */
  clueFlags: Int32Array;
  /** `order²` working numbers (0 = blank); cloned per move. */
  grid: Int8Array;
  /** `order²` pencil-mark bitmaps (bit `1<<n` = mark `n`); cloned per move. */
  pencil: Int32Array;
  /** `order²` struck-clue ("spent") flags (`F_SPENT_*`); cloned per move. */
  spent: Int32Array;
}

export function cloneState(s: EdgeClueState): EdgeClueState {
  return {
    order: s.order,
    kind: s.kind,
    diff: s.diff,
    immutable: s.immutable,
    clueFlags: s.clueFlags,
    grid: s.grid.slice(),
    pencil: s.pencil.slice(),
    spent: s.spent.slice(),
  };
}

// --- moves -----------------------------------------------------------------

export type EdgeClueMove =
  /** Enter (or pencil-toggle) number `n` at `(x, y)`; `n = 0` clears.
   * `autoElim` (auto-pencil mode, baked at move-creation time off the Ui
   * preference for deterministic replay) additionally strikes `n` from the
   * pencil marks of every other cell in the same row and column on a real
   * placement. */
  | {
      type: "set";
      x: number;
      y: number;
      n: number;
      pencil: boolean;
      autoElim?: boolean;
    }
  /** Toggle the struck-through ("spent") state of the clue at `(x, y)` in the
   * given direction (`flag` is the `F_SPENT_*` bit). */
  | { type: "spent"; x: number; y: number; flag: number }
  /** Fill in every pencil mark everywhere (the `M` key / fill-all button). */
  | { type: "pencilAll" }
  /** Strike (clear) the listed pencil candidates atomically — a hint's
   * single-firing elimination. Idempotent and resume-safe. */
  | { type: "pencilStrike"; marks: { x: number; y: number; n: number }[] }
  /** Write the listed pencil candidates, `pencilStrike`'s mirror: a hint's note
   * step. */
  | { type: "pencilAdd"; marks: { x: number; y: number; n: number }[] }
  /** Auto-solve to the given full grid. */
  | { type: "solve"; grid: number[] };

// --- ui --------------------------------------------------------------------

export interface EdgeClueUi {
  cursor: GridCursor;
  pencilMode: boolean;
  cursorFromKeyboard: boolean;
  /** Preference (default on): keep the mouse highlight after a pencil change. */
  pencilKeepHighlight: boolean;
  /** Preference (default on): right-click toggles a *sticky* pencil mode. */
  pencilSticky: boolean;
  /** Preference (default off): placing a number strikes it from the pencil marks
   * of every other cell in its row and column. */
  autoPencil: boolean;
  /** Preference: how a hint pencils (`CandidateReading`). */
  candidateReading: CandidateReading;
}

export function newUi(_state: EdgeClueState): EdgeClueUi {
  return {
    cursor: newCursor(),
    pencilMode: false,
    cursorFromKeyboard: false,
    pencilKeepHighlight: true,
    pencilSticky: true,
    // Off by default, so notes clear only via Mark-all or a hint unless the
    // player opts in.
    autoPencil: false,
    // Not the convention: a clue strikes from one cell at a time, and ending
    // each strike in what it leaves makes the plan shorter than penciling in
    // every candidate first, though it still notes most cells.
    candidateReading: "implicit",
  };
}

// --- desc codec ------------------------------------------------------------

/**
 * What the generator writes: for each cell, its given (`0` for none), its
 * direction letters each at most once in `ADJTHAN` order, and a comma. A flag
 * must not point off the grid, and whether its neighbor flags back is the
 * kind's `bothEnds`.
 */
function parseDesc(
  kind: ClueKind,
  p: EdgeClueParams,
  desc: string,
): DescParse<{ nums: Int8Array; flags: Int32Array }> {
  const o = p.order;
  const a = o * o;
  return readDesc(desc, (r) => {
    const nums = new Int8Array(a);
    const flags = new Int32Array(a);
    for (let i = 0; i < a; i++) {
      nums[i] = r.int(0, o);
      for (let d = 0; d < 4; d++) if (r.accept("URDL"[d])) flags[i] |= ADJTHAN[d].f;
      r.expect(",");
    }
    r.end();

    for (let y = 0; y < o; y++) {
      for (let x = 0; x < o; x++) {
        for (const dir of ADJTHAN) {
          if (!(flags[y * o + x] & dir.f)) continue;
          const nx = x + dir.dx;
          const ny = y + dir.dy;
          if (nx < 0 || ny < 0 || nx >= o || ny >= o) r.fail(DESC_OUT_OF_RANGE);
          const reciprocal = (flags[ny * o + nx] & dir.fo) !== 0;
          if (reciprocal !== kind.bothEnds) r.fail(DESC_CONTRADICTORY);
        }
      }
    }
    return { nums, flags };
  });
}

export function newState(
  kind: ClueKind,
  p: EdgeClueParams,
  desc: string,
): EdgeClueState {
  const o = p.order;
  const a = o * o;
  const { nums, flags } = descValue(parseDesc(kind, p, desc));

  return {
    order: o,
    kind,
    diff: p.diff,
    immutable: nums,
    clueFlags: flags,
    grid: nums.slice(),
    pencil: new Int32Array(a),
    spent: new Int32Array(a),
  };
}

// --- error checking (check_complete / check_num_error / check_num_adj) ------

/**
 * Check the grid for completion and (optionally) mark errors into `errFlags`
 * (an `order²` array of `F_ERROR | F_ERROR_*` bits per cell). Returns:
 *   `-1` wrong · `0` incomplete · `1` complete and correct.
 * Faithful to `check_complete` + `check_num_error` + `check_num_adj`.
 */
export function checkComplete(state: EdgeClueState, errFlags?: Int32Array): number {
  const o = state.order;
  const grid = state.grid;
  let ret = 1;

  if (errFlags) errFlags.fill(0);

  for (let x = 0; x < o; x++) {
    for (let y = 0; y < o; y++) {
      const i = y * o + x;
      const val = grid[i];
      if (val === 0) {
        ret = 0;
        continue;
      }

      // check_num_error: duplicates in the same row / column.
      let dup = false;
      for (let yy = 0; yy < o; yy++)
        if (yy !== y && grid[yy * o + x] === val) dup = true;
      for (let xx = 0; xx < o; xx++)
        if (xx !== x && grid[y * o + xx] === val) dup = true;
      if (dup) {
        ret = -1;
        if (errFlags) errFlags[i] |= F_ERROR;
      }

      // check_num_adj: clue violations toward filled neighbors.
      const f = state.clueFlags[i];
      for (let d = 0; d < 4; d++) {
        const nx = x + ADJTHAN[d].dx;
        const ny = y + ADJTHAN[d].dy;
        if (nx < 0 || nx >= o || ny < 0 || ny >= o) continue;
        const dn = grid[ny * o + nx];
        if (dn === 0) continue;
        if (breaksClue(state.kind, (f & ADJTHAN[d].f) !== 0, val, dn)) {
          ret = -1;
          if (errFlags) errFlags[i] |= ADJTHAN[d].fe;
        }
      }
    }
  }

  return ret;
}

// --- status / text ---------------------------------------------------------

export function status(s: EdgeClueState): "solved" | "ongoing" {
  return checkComplete(s) > 0 ? "solved" : "ongoing";
}

/** ASCII grid with inter-cell clue glyphs, matching `game_text_format`. */
export function textFormat(s: EdgeClueState): string {
  const o = s.order;
  const grid = s.grid;
  let out = "";

  for (let y = 0; y < o; y++) {
    for (let x = 0; x < o; x++) {
      const n = grid[y * o + x];
      out += n > 0 ? displayChar(n, o) : ".";
      if (x < o - 1) out += s.kind.glyph(s.clueFlags, o, x, y, "right");
    }
    out += "\n";

    if (y < o - 1) {
      for (let x = 0; x < o; x++) {
        out += s.kind.glyph(s.clueFlags, o, x, y, "down");
        if (x < o - 1) out += " ";
      }
      out += "\n";
    }
  }

  return out;
}
