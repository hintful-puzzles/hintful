/**
 * Types and pure state helpers for Mathrax — the state/codec parts of
 * `puzzles/unreleased/mathrax.c` (© 2019 Lennard Sprong).
 *
 * A board is an `o × o` Latin square of digits `1..o`. Clues sit on the
 * `(o−1) × (o−1)` interior grid *intersections*, each constraining the four
 * cells around it: an arithmetic clue means the operation gives the same result
 * on both diagonal pairs (`topleft ∘ botright == topright ∘ botleft`) and shows
 * that result; `=` means each diagonal pair is equal; `E`/`O` mean all four
 * digits are even / odd.
 *
 * **Two bitmask conventions, deliberately.** The solver's candidate masks
 * (`solver.ts`) keep upstream's `BIT(d) = 1 << (d−1)`, because they decide the
 * solver's verdict and so the generated description
 * (docs/games/solver-and-generator.md § "Solver-gated generation"). The player's
 * pencil marks use the Latin-family `1 << n` (bits `1..o`), which
 * `engine/candidate-hint.ts` reads. Marks never reach the desc or a save (the
 * save replays moves), so the divergence is free.
 */

import type { CandidateReading } from "../../engine/candidate-hint.ts";
import { digitValue, parseLeadingInt } from "../../engine/decimal.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  type DescError,
  type DescParse,
  descValue,
  descVerdict,
} from "../../engine/desc-error.ts";
import { type DescReader, readDesc } from "../../engine/desc-reader.ts";
import { tierNames } from "../../engine/difficulty.ts";
import { type GridCursor, newCursor } from "../../engine/pointer.ts";
import type { Point } from "../../engine/types.ts";

// --- difficulty ------------------------------------------------------------

export type MathraxDiff = "easy" | "normal" | "tricky" | "recursive";

export const DIFF_EASY = 0;
export const DIFF_NORMAL = 1;
export const DIFF_TRICKY = 2;
export const DIFF_RECURSIVE = 3;

/** Upstream `mathrax_diffchars`, indexed by level. */
const DIFF_CHARS = "entr";
// The top tier reads `Unreasonable`, not upstream's `Recursive`: it is the tier
// that may require guessing, and the collection has one word for that. Its
// character stays `r`, so game IDs and saved games are unaffected.
export const DIFF_NAMES = tierNames(4, { search: true });
const DIFFS: MathraxDiff[] = ["easy", "normal", "tricky", "recursive"];

export function diffToLevel(d: MathraxDiff): number {
  const i = DIFFS.indexOf(d);
  return i < 0 ? DIFF_EASY : i;
}
export function diffFromLevel(level: number): MathraxDiff {
  return DIFFS[level] ?? "easy";
}
/** The tier index of `d`, or -1 for a letter `decodeParams` did not know: the
 * difficulty item reads this, so its choice check refuses that letter. */
export function diffLevel(d: MathraxDiff): number {
  return DIFFS.indexOf(d);
}
function diffChar(d: MathraxDiff): string {
  return DIFF_CHARS[diffToLevel(d)];
}

// --- clues -----------------------------------------------------------------
// A clue is one packed number: the low three bits hold the type, the rest the
// clue's number (upstream `CLUENUM`/`SET_CLUENUM`). Equality is encoded as
// `CLUE_SUB` with number 0, which is also how `mathraxOptions` deduces it
// (|a − b| == 0 ⇒ a == b) — so there is no separate equality arm anywhere.
// Type 0 is no clue.

export const CLUE_ADD = 1;
export const CLUE_SUB = 2;
export const CLUE_MUL = 3;
export const CLUE_DIV = 4;
export const CLUE_EVN = 5;
export const CLUE_ODD = 6;
const CLUEMASK = 7;

export function clueType(clue: number): number {
  return clue & CLUEMASK;
}
export function clueNum(clue: number): number {
  return clue >>> 3;
}
export function setClueNum(n: number): number {
  return n << 3;
}

const MINUS_SIGN = "−";
const TIMES_SIGN = "×";
const DIVIDE_SIGN = "÷";

/**
 * The clue's label as the board draws it (upstream `mathrax_clue_label`); a
 * subtraction clue of 0 is the equality clue, which reads `=`.
 *
 * Here rather than in `render.ts` because the hint's sentences name a clue by
 * what the player can see (docs/games/hints.md § "Name elements by what the
 * player can see"), so the renderer and the narration must print it the same
 * way or the sentence points at nothing.
 */
export function clueLabel(clue: number): string {
  const n = clueNum(clue);
  switch (clueType(clue)) {
    case CLUE_ADD:
      return `${n}+`;
    case CLUE_SUB:
      return n ? `${n}${MINUS_SIGN}` : "=";
    case CLUE_MUL:
      return `${n}${TIMES_SIGN}`;
    case CLUE_DIV:
      return `${n}${DIVIDE_SIGN}`;
    case CLUE_EVN:
      return "E";
    case CLUE_ODD:
      return "O";
    default:
      return "";
  }
}

/** Whether `clue` constrains all four cells around its intersection (`E`/`O`)
 * rather than the diagonal pair through it. The hint's sentence and its evidence
 * area both split on this, so the question is asked in one place. */
export function clueIsParity(clue: number): boolean {
  const t = clueType(clue);
  return t === CLUE_EVN || t === CLUE_ODD;
}

/** The four cells around interior intersection `(cx, cy)`, top-left first. */
export function clueCells(cx: number, cy: number): Point[] {
  return [
    { x: cx, y: cy },
    { x: cx + 1, y: cy },
    { x: cx, y: cy + 1 },
    { x: cx + 1, y: cy + 1 },
  ];
}

/** The cell diagonally across intersection `(cx, cy)` from `cell`, which is one
 * of the four {@link clueCells}: an arithmetic clue constrains exactly this
 * pair, so it is what a hint shades beside the cell it acts on. */
export function clueOpposite(cx: number, cy: number, cell: Point): Point {
  return { x: 2 * cx + 1 - cell.x, y: 2 * cy + 1 - cell.y };
}

// --- clue-type options (which clue kinds the generator may emit) ------------

export const OPTION_ADD = 1;
export const OPTION_SUB = 2;
export const OPTION_MUL = 4;
export const OPTION_DIV = 8;
export const OPTION_EQL = 16;
export const OPTION_ODD = 32;
export const OPTIONSMASK = 63;

/** The clue-type option bits in upstream's fixed encode/decode order. */
const OPTION_LETTERS: ReadonlyArray<{ bit: number; letter: string }> = [
  { bit: OPTION_ADD, letter: "A" },
  { bit: OPTION_SUB, letter: "S" },
  { bit: OPTION_MUL, letter: "M" },
  { bit: OPTION_DIV, letter: "D" },
  { bit: OPTION_EQL, letter: "E" },
  { bit: OPTION_ODD, letter: "O" },
];

// --- cell flags ------------------------------------------------------------

/** A given: the player may not change it. */
export const F_IMMUTABLE = 0x01;
/** This digit is duplicated in its row or column. */
export const FE_COUNT = 0x02;
export const FE_TOPLEFT = 0x04;
export const FE_TOPRIGHT = 0x08;
export const FE_BOTLEFT = 0x10;
export const FE_BOTRIGHT = 0x20;
export const FE_ERRORMASK = 0x3e;

// --- params ----------------------------------------------------------------

export interface MathraxParams {
  /** Grid order (`o × o`, digits `1..o`). */
  o: number;
  diff: MathraxDiff;
  /** Bitmask of the enabled clue types (`OPTION_*`). */
  options: number;
}

export function defaultParams(): MathraxParams {
  return { o: 5, diff: "easy", options: OPTIONSMASK };
}

export function encodeParams(p: MathraxParams, full: boolean): string {
  let s = String(p.o);
  if (full) {
    s += `d${diffChar(p.diff)}`;
    // An empty letter set means "all", so the full set is written as nothing.
    if (p.options !== OPTIONSMASK) {
      for (const { bit, letter } of OPTION_LETTERS) if (p.options & bit) s += letter;
    }
  }
  return s;
}

export function decodeParams(s: string): MathraxParams {
  const p = defaultParams();
  p.options = 0;
  const o = parseLeadingInt(s, 0);
  p.o = o.value;
  let i = o.next;
  if (s[i] === "d") {
    i++;
    // An unrecognized (or missing) letter leaves the difficulty invalid, which
    // the difficulty item then refuses (`diffLevel`) — faithful to
    // `decode_params`.
    const idx = i < s.length ? DIFF_CHARS.indexOf(s[i]) : -1;
    p.diff = idx >= 0 ? diffFromLevel(idx) : ("invalid" as MathraxDiff);
    if (i < s.length) i++;
  }
  // Each letter is tested once, in order — so they must appear in `A S M D E O`
  // order to all be read (upstream's six sequential `if`s).
  for (const { bit, letter } of OPTION_LETTERS) {
    if (s[i] === letter) {
      p.options |= bit;
      i++;
    }
  }
  if (!p.options) p.options = OPTIONSMASK;
  return p;
}

export function validateParams(p: MathraxParams, full: boolean): string | null {
  if (full && !p.options) return "At least one clue type must be enabled";
  // A 3x3 grid has only four intersections, and two of its four tiers have
  // nothing to grade with: over 3,000 candidate boards each, none needed Normal
  // (Easy always sufficed) and none needed the top tier (Tricky always did).
  // Tricky binds on roughly one board in ten. Refusing beats a difficulty that
  // silently yields another; a saved game or game ID still loads, because `full`
  // is false there. The message uses the menu's tier names.
  if (full && p.o === 3 && (p.diff === "normal" || p.diff === "recursive")) {
    return `Size 3 has no ${DIFF_NAMES[DIFF_NORMAL]} or ${DIFF_NAMES[DIFF_RECURSIVE]} puzzles; use ${DIFF_NAMES[DIFF_EASY]} or ${DIFF_NAMES[DIFF_TRICKY]}`;
  }
  return null;
}

// --- state -----------------------------------------------------------------

export interface MathraxState {
  params: MathraxParams;
  /** `o²` working digits (0 = blank). */
  grid: Uint8Array;
  /** `o²` per-cell flags: {@link F_IMMUTABLE} plus the live `FE_*` error bits,
   * which {@link mathraxValidate} recomputes after every `set` and `solve` move
   * (upstream, too, keeps them on the state for `game_redraw` to read). */
  flags: Uint8Array;
  /** `o²` pencil-mark bitmaps, bit `n` = candidate `n` (see the module note). */
  pencil: Int32Array;
  /** `(o−1)²` packed clues at the interior intersections. Immutable after load,
   * shared by reference across cloned states. */
  clues: Int32Array;
}

export function cloneState(s: MathraxState): MathraxState {
  return {
    params: s.params,
    grid: s.grid.slice(),
    flags: s.flags.slice(),
    pencil: s.pencil.slice(),
    clues: s.clues, // immutable, shared
  };
}

/** Validated on a copy of the flags, which `mathraxValidate` rewrites. */
export function status(s: MathraxState): "solved" | "ongoing" {
  const { o } = s.params;
  return mathraxValidate(o, s.grid, s.clues, s.flags.slice()) === STATUS_COMPLETE
    ? "solved"
    : "ongoing";
}

// --- desc codec ------------------------------------------------------------

/** Each clue type's description letter, indexed by type. */
const CLUE_LETTERS = ["", "A", "S", "M", "D", "E", "O"];

/** One clue's description text: its letter, plus the number for arithmetic. */
function clueText(clue: number): string {
  const type = clueType(clue);
  // A typeless clue is unreachable; upstream writes a blank for it "just to be safe".
  const letter = CLUE_LETTERS[type] || "a";
  return type >= CLUE_ADD && type <= CLUE_DIV ? letter + clueNum(clue) : letter;
}

/** Upstream's run-length form of the first `n` values: `text` of each nonzero
 * value, and a run of zeros as one letter `a`..`z` (1..26). */
function runLength(
  values: ArrayLike<number>,
  n: number,
  text: (v: number) => string,
): string {
  let out = "";
  let run = 0;
  for (let i = 0; i < n; i++) {
    if (values[i] === 0) {
      if (run === 26) {
        out += "z";
        run = 0;
      }
      run++;
    } else {
      if (run) out += String.fromCharCode(96 + run);
      run = 0;
      out += text(values[i]);
    }
  }
  if (run) out += String.fromCharCode(96 + run);
  return out;
}

/**
 * Encode a board as the two comma-separated run-length parts upstream's
 * `new_game_desc` emits: the `o²` grid givens (a digit is its own character),
 * then the `(o−1)²` clues (`A`/`S`/`M`/`D` + number, `E`/`O`; `S0` is equality).
 */
export function encodeDesc(o: number, grid: Uint8Array, clues: Int32Array): string {
  return [
    runLength(grid, o * o, String),
    runLength(clues, (o - 1) * (o - 1), clueText),
  ].join(",");
}

interface LoadResult {
  grid: Uint8Array;
  flags: Uint8Array;
  clues: Int32Array;
}

/** `a`..`z`: a run of 1..26 empty entries. */
function isRunLetter(c: string): boolean {
  return c >= "a" && c <= "z";
}

/** A grid given's character: `1`..`9` (the board's own bound comes after). */
function isGivenDigit(c: string): boolean {
  const d = digitValue(c);
  return d !== null && d >= 1;
}

function isClueLetter(c: string): boolean {
  return CLUE_LETTERS.indexOf(c) > 0;
}

/**
 * The numbers an arithmetic clue of `type` can show on an `o × o` board: a sum
 * or product of two digits, a difference (`0` the equality clue), or a whole
 * quotient other than 1.
 */
function clueNumRange(type: number, o: number): [number, number] {
  if (type === CLUE_ADD) return [2, 2 * o];
  if (type === CLUE_SUB) return [0, o - 1];
  if (type === CLUE_MUL) return [1, o * o];
  return [2, o];
}

/** Read a run letter of at most `room` entries, or nothing; how many it covers. */
function readRun(r: DescReader, room: number): number {
  if (!r.peekIs(isRunLetter)) return 0;
  const run = r.char().charCodeAt(0) - 96;
  if (run > room) r.fail(DESC_TOO_LONG);
  return run;
}

/**
 * Read a description, which is exactly what {@link encodeDesc} writes: the
 * `o²` grid givens, a `,`, then the `(o−1)²` clues, each part covering its
 * entries exactly and a letter `a`..`z` standing for a run of empty ones.
 * Every number is held to what the board can show.
 */
function parseDesc(p: MathraxParams, desc: string): DescParse<LoadResult> {
  const o = p.o;
  const s = o * o;
  const cs = (o - 1) * (o - 1);
  return readDesc(desc, (r) => {
    const grid = new Uint8Array(s);
    const flags = new Uint8Array(s);
    const clues = new Int32Array(cs);

    for (let pos = 0; pos < s; ) {
      if (r.peek() === ",") r.fail(DESC_TOO_SHORT);
      const run = readRun(r, s - pos);
      if (run) {
        pos += run;
        continue;
      }
      const d = digitValue(r.char(isGivenDigit)) ?? 0;
      if (d > o) r.fail(DESC_OUT_OF_RANGE);
      flags[pos] |= F_IMMUTABLE;
      grid[pos++] = d;
    }
    // Another given where the `,` belongs is a grid with one too many.
    if (r.peekIs((c) => isRunLetter(c) || isGivenDigit(c))) r.fail(DESC_TOO_LONG);
    r.expect(",");

    for (let pos = 0; pos < cs; ) {
      const run = readRun(r, cs - pos);
      if (run) {
        pos += run;
        continue;
      }
      const type = CLUE_LETTERS.indexOf(r.char(isClueLetter));
      const n = type <= CLUE_DIV ? r.int(...clueNumRange(type, o)) : 0;
      clues[pos++] = type | setClueNum(n);
    }
    r.end();
    return { grid, flags, clues };
  });
}

export function validateDesc(p: MathraxParams, desc: string): DescError | null {
  return descVerdict(parseDesc(p, desc));
}

export function newState(p: MathraxParams, desc: string): MathraxState {
  const { grid, flags, clues } = descValue(parseDesc(p, desc));
  return {
    params: p,
    grid,
    flags,
    pencil: new Int32Array(p.o * p.o),
    clues,
  };
}

// --- live validity ---------------------------------------------------------

export const STATUS_COMPLETE = 0;
export const STATUS_UNFINISHED = 1;
export const STATUS_INVALID = 2;

/** Upstream `BIT(d)` — the *solver-side* convention, bit `d − 1`. Used by
 * {@link mathraxOptions} / {@link mathraxValidate} and `solver.ts` only; the
 * player's pencil marks use `1 << n` (see the module note). */
export function bitOf(d: number): number {
  return 1 << (d - 1);
}

/** "No constraint": upstream's `~0`, every bit set. Not masked to
 * `(1 << o) − 1`: the `simple` early return below hands it straight back, and a
 * different value could change a solver verdict and so the description
 * (docs/games/solver-and-generator.md § "Solver-gated generation"). */
const ALL_DIGITS = ~0;

/**
 * The digits this cell may hold given `clue` at one of its corners and `mark`,
 * the candidate mask of the cell diagonally opposite (upstream
 * `mathrax_options`). Arithmetic clues enumerate every `(a, b)` pair satisfying
 * the operation; `E`/`O` return the fixed even/odd masks; equality arrives as
 * `CLUE_SUB` with number 0, so `|a − b| == 0` handles it.
 *
 * `simple` is the Easy-difficulty gate: only read an arithmetic clue when the
 * opposite cell is *confirmed* (a single candidate bit).
 *
 * Shared with {@link mathraxValidate}, which is why it lives here rather than in
 * `solver.ts` — a clue's admissible digits are the clue's meaning.
 */
export function mathraxOptions(clue: number, mark: number, simple: boolean): number {
  const type = clueType(clue);
  switch (type) {
    case CLUE_ADD:
    case CLUE_SUB:
    case CLUE_MUL:
    case CLUE_DIV: {
      if (simple && mark & (mark - 1)) return ALL_DIGITS;

      const cnum = clueNum(clue);
      let ret = 0;
      // Upstream enumerates 1..9 regardless of the grid order; the caller's
      // candidate mask is what bounds the result.
      for (let a = 1; a <= 9; a++) {
        if (!(mark & bitOf(a))) continue;
        for (let b = 1; b <= 9; b++) {
          const hi = Math.max(a, b);
          const lo = Math.min(a, b);
          if (
            (type === CLUE_ADD && a + b === cnum) ||
            (type === CLUE_SUB && Math.abs(a - b) === cnum) ||
            (type === CLUE_MUL && a * b === cnum) ||
            (type === CLUE_DIV && ((hi / lo) | 0) === cnum && hi % lo === 0)
          ) {
            ret |= bitOf(b);
          }
        }
      }
      return ret;
    }
    case CLUE_EVN:
      return 0xaa; // 2, 4, 6, 8
    case CLUE_ODD:
      return 0x155; // 1, 3, 5, 7, 9
    default:
      return ALL_DIGITS;
  }
}

/**
 * Recompute every cell's `FE_*` error bits in place and report whether the board
 * is complete, unfinished, or self-contradictory (upstream
 * `mathrax_validate_game`). A cell is flagged `FE_COUNT` when its digit repeats
 * in its row or column, and `FE_TOPLEFT`/… when the clue at that corner admits
 * no pairing between this cell and the one diagonally opposite it.
 *
 * Upstream's `is_solver` mode (read a blank cell's marks instead of "any digit")
 * is never used by the shipped game, so it is not ported.
 */
export function mathraxValidate(
  o: number,
  grid: Uint8Array,
  clues: Int32Array,
  flags: Uint8Array,
): number {
  const co = o - 1;
  const maxbits = (1 << o) - 1;
  let ret = STATUS_COMPLETE;

  // Row/column occurrence counts: `counts[(d−1)·o + y]` for rows, offset by o²
  // for columns.
  const counts = new Int32Array(o * o * 2);
  for (let x = 0; x < o; x++) {
    for (let y = 0; y < o; y++) {
      flags[y * o + x] &= ~FE_ERRORMASK;
      const d = grid[y * o + x];
      if (!d) continue;
      counts[(d - 1) * o + y]++;
      counts[(d - 1) * o + o * o + x]++;
    }
  }

  for (let y = 0; y < o; y++) {
    for (let x = 0; x < o; x++) {
      const i = y * o + x;
      const d = grid[i];
      const bits = d ? bitOf(d) : maxbits;

      if (!d) {
        if (ret === STATUS_COMPLETE) ret = STATUS_UNFINISHED;
      } else if (counts[(d - 1) * o + y] > 1 || counts[(d - 1) * o + o * o + x] > 1) {
        flags[i] |= FE_COUNT;
      }

      // Flag `bit` when the clue at index `clue` admits no pairing between this
      // cell and the cell `(ox, oy)` diagonally across its intersection.
      const corner = (clue: number, ox: number, oy: number, bit: number): void => {
        const other = grid[oy * o + ox];
        const opts = mathraxOptions(clues[clue], other ? bitOf(other) : maxbits, false);
        if (!(opts & bits)) flags[i] |= bit;
      };
      if (y < co && x < co) corner(y * co + x, x + 1, y + 1, FE_BOTRIGHT);
      if (y > 0 && x < co) corner((y - 1) * co + x, x + 1, y - 1, FE_TOPRIGHT);
      if (y < co && x > 0) corner(y * co + x - 1, x - 1, y + 1, FE_BOTLEFT);
      if (y > 0 && x > 0) corner((y - 1) * co + x - 1, x - 1, y - 1, FE_TOPLEFT);

      if (flags[i] & FE_ERRORMASK) ret = STATUS_INVALID;
    }
  }

  return ret;
}

// --- moves -----------------------------------------------------------------

export type MathraxMove =
  /** Enter (or pencil-toggle) digit `n` at `(x, y)`; `n = 0` clears.
   * `autoElim` (the auto-pencil preference, baked in at `interpretMove` time so
   * `executeMove` stays pure) also strikes `n` from the pencil marks of the rest
   * of the cell's row and column. */
  | {
      type: "set";
      x: number;
      y: number;
      n: number;
      pencil: boolean;
      autoElim?: boolean;
    }
  /** Fill every empty cell's pencil marks (the `M` key / mark-all button). */
  | { type: "pencilAll" }
  /** Strike the listed pencil candidates atomically (the adaptive second press
   * of mark-all, and a future hint's elimination step); idempotent. */
  | { type: "pencilStrike"; marks: { x: number; y: number; n: number }[] }
  /** Write the listed pencil candidates, `pencilStrike`'s mirror: a hint's note
   * step. */
  | { type: "pencilAdd"; marks: { x: number; y: number; n: number }[] }
  /** Auto-solve: write the solution into every non-given cell. */
  | { type: "solve"; grid: number[] };

// --- ui --------------------------------------------------------------------

export interface MathraxUi {
  /** Highlighted cell. */
  cursor: GridCursor;
  /** The highlight was last moved by the keyboard (so a digit entry keeps it). */
  cursorFromKeyboard: boolean;
  /** The highlight is in pencil-mark mode. */
  pencilMode: boolean;
  /** Preference (default off, the family's): entering a number strikes it from
   * the pencil marks of the rest of its row and column. The hint reads it too —
   * when it is on, a placement's trivial culls are folded into the placement
   * instead of taught as their own step. */
  autoPencil: boolean;
  /** Preference (default on, fork addition): right-click toggles a *sticky*
   * pencil mode rather than selecting one cell for one mark. */
  pencilSticky: boolean;
  /** Preference (default on): keep the mouse highlight after a pencil change. */
  pencilKeepHighlight: boolean;
  /** Preference: how a hint pencils (`CandidateReading`). */
  candidateReading: CandidateReading;
}

export function newUi(_state: MathraxState): MathraxUi {
  return {
    cursor: newCursor(),
    cursorFromKeyboard: false,
    pencilMode: false,
    autoPencil: false,
    pencilSticky: true,
    pencilKeepHighlight: true,
    // Not the convention: a clue reads the cell across it, and the rest is
    // singles, so a plan writes notes into under half the cells and is
    // shorter than penciling in every candidate first below Tricky.
    candidateReading: "implicit",
  };
}
