/**
 * Types, codec and pure board logic for Crossing — the state parts of
 * `unreleased/crossing.c` (Lennard Sprong, 2013).
 *
 * Crossing is *Nansuke* (Number Skeleton), a Nikoli number-crossword: a walled
 * grid plus a list of multi-digit numbers, and every open cell takes a digit
 * `1`–`9` so that each listed number appears **exactly once** when the grid's
 * maximal horizontal and vertical runs (length ≥ 2) are read left-to-right /
 * top-to-bottom.
 *
 * The *puzzle* (walls, the sorted number list, and the runs derived from the
 * walls) never changes after `newState`, so every cloned state aliases one
 * {@link CrossingPuzzle} by reference and a move copies only `grid` + `pencil`.
 * `Object.freeze` throws on a populated typed array, so `readonly` is the whole
 * guarantee.
 */

import {
  DIFF_EASY,
  searchTierItem,
  searchTierSegment,
} from "../../engine/answer-search.ts";
import { digitValue, isDigit } from "../../engine/decimal.ts";
import {
  DESC_CONTRADICTORY,
  DESC_OUT_OF_RANGE,
  DESC_REPEATED,
  DESC_TOO_LONG,
  type DescParse,
  descBadCharacter,
  descValue,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import type { ParamConfigItem, PresetMenu } from "../../engine/game.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { dims, flag, paramsCodec } from "../../engine/params-codec.ts";
import { type GridCursor, newCursor } from "../../engine/pointer.ts";
import { presetGrid } from "../../engine/preset-grid.ts";
import type { Point } from "../../engine/types.ts";

// --- params ----------------------------------------------------------------

export interface CrossingParams {
  w: number;
  h: number;
  /** Grow the walls 180°-rotationally symmetrically. */
  sym: boolean;
  /** `DIFF_EASY`, a board the solver's three deductions finish, or
   * `DIFF_UNREASONABLE`, one with a single answer that they do not reach.
   * Generation-time only, as `sym` is. */
  diff: number;
}

const board = (w: number, sym = false, h = w): CrossingParams => ({
  w,
  h,
  sym,
  diff: DIFF_EASY,
});

/**
 * The sizes the menu offers, the larger ones upright. Upstream ships 5×5,
 * 7×7 and 9×9. The rest are a fork addition: the solving aids make a small
 * board quick work, so the ladder runs up to 11×13.
 */
const BOARDS: CrossingParams[] = [
  board(5),
  board(7),
  board(7, false, 9),
  board(9, false, 11),
  board(11, false, 13),
];

/**
 * The symmetric boards, after the grid: one small, and the largest board there
 * is, at Easy.
 *
 * Symmetry is not just a flavor — it is what makes the full size *practical*.
 * Growing the walls in 180°-rotational pairs puts them down twice as fast, so
 * runs stay short and the duplicate-number rejection that dominates large
 * boards fires far less often: an Easy 15×15 takes 1.2 s plain and 0.3 s
 * symmetric. Neither is offered at Unreasonable, being past
 * {@link MENU_UNREASONABLE_AREA}.
 */
const VARIANTS: CrossingParams[] = [board(9, true), board(15, true)];

/** Every shape of board on the menu, at Easy: what a census of the solver or
 * of the hint walks. */
export const EASY_PRESETS: readonly CrossingParams[] = [...BOARDS, ...VARIANTS];

export function defaultParams(): CrossingParams {
  return board(5);
}

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<CrossingParams>[] = [
  ...dimensionParamConfig<CrossingParams>({
    doc: "Size of the grid in squares. A puzzle whose runs all read as distinct numbers grows rarer as the grid grows, so a board much larger than 15x15, or a long thin one, can take a minute or two to appear, or none is found.",
    bounds: { min: 2 },
  }),
  searchTierItem(
    "diff",
    "An Easy puzzle can be finished one step at a time: there is always a run whose remaining numbers agree on a digit, a square with one digit left, or a number that only one run can still take. An Unreasonable one has a single solution that none of these leads to, so somewhere you have to try a digit and see what follows. The Hint button stops where they do.",
  ),
  {
    kw: "symmetric-walls",
    name: "Symmetric walls",
    type: "boolean",
    doc: "When enabled, all walls form a rotationally symmetric pattern.",
    label: { slot: "kind", words: (p) => (p.sym ? "symmetric" : null) },
    get: (p) => p.sym,
    set: (p, v) => {
      p.sym = v;
    },
  },
];

export function presets(): PresetMenu<CrossingParams> {
  return {
    title: "Crossing",
    ...presetGrid(paramConfig, BOARDS, {
      tiers: (b) =>
        b.w * b.h > MENU_UNREASONABLE_AREA ? [DIFF_EASY, DIFF_EASY] : null,
      variants: VARIANTS,
    }),
  };
}

/** `WxH[S][d<tier>]`, a bare `W` being square; the symmetry and the tier are
 * generator-only. The tier comes last and upstream's IDs lack it: without one
 * a board is Easy, the only kind upstream deals. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  flag(paramConfig, "S", "symmetric-walls", { full: true }),
  searchTierSegment(paramConfig),
]);

/**
 * The largest area the preset menu offers an Unreasonable board at, which
 * keeps the menu quick: past it a board can take over a second to find
 * (measured 2026-10-27, the slowest of four 11×13 boards 1.4 s, and of four
 * 9×11 boards 0.3 s).
 */
const MENU_UNREASONABLE_AREA = 120;

/** What upstream's `validate_params` checks: at least one dimension ≥ 4 (a 3×3
 * board has no room for crossing runs).
 *
 * No size is refused for its rarity. An attempt is rejected whenever two runs
 * read as the same number, which grows likelier with the area, and a long
 * thin board has few crossings to break its runs up, so a large board takes
 * minutes or is not found; the deal's deadline answers that (`engine-difficulty`,
 * "A rare tier is dealt under the deadline"). Measured 2026-10-20 under it: an
 * Unreasonable 15×15 in 27 s, an Easy 2×55 in 56 s, and an Easy 2×58 gave up
 * on eight deals of twelve. */
export function validateParams(p: CrossingParams, _full: boolean): string | null {
  if (p.w < 4 && p.h < 4) return "Width or height must be at least 4.";
  return null;
}

// --- runs ------------------------------------------------------------------

/** A maximal horizontal or vertical strip of ≥ 2 open cells — the slots the
 * listed numbers are placed into. */
export interface CrossingRun {
  readonly horizontal: boolean;
  /** Cell indices in reading order (left→right / top→bottom). Upstream carries
   * a `len` and re-derives the start/stride with `crossing_iterate`; holding
   * the indices makes every consumer a plain `for…of`. */
  readonly cells: readonly number[];
}

/**
 * Upstream `crossing_collect_runs`: all horizontal runs (top-to-bottom, each
 * left-to-right) followed by all vertical runs (left-to-right, each
 * top-to-bottom). A run needs **two** consecutive open cells to start, so an
 * isolated 1×1 open cell belongs to no run at all — upstream's own generator
 * TODO admits those boards exist.
 *
 * The emission order is part of the byte-match surface: the generator reads one
 * number out of each run in this order before sorting.
 */
export function collectRuns(w: number, h: number, walls: Uint8Array): CrossingRun[] {
  const runs: CrossingRun[] = [];

  const scan = (horizontal: boolean): void => {
    const outer = horizontal ? h : w;
    const inner = horizontal ? w : h;
    const index = (a: number, b: number): number =>
      horizontal ? a * w + b : b * w + a;
    for (let a = 0; a < outer; a++) {
      let cells: number[] | null = null;
      for (let b = 0; b < inner; b++) {
        const i = index(a, b);
        if (walls[i]) {
          if (cells) {
            runs.push({ horizontal, cells });
            cells = null;
          }
          continue;
        }
        // Only start a run where a second open cell follows it.
        if (!cells) {
          if (b === inner - 1 || walls[index(a, b + 1)]) continue;
          cells = [];
        }
        cells.push(i);
      }
      if (cells) runs.push({ horizontal, cells });
    }
  };

  scan(true);
  scan(false);
  return runs;
}

// --- puzzle ----------------------------------------------------------------

/** The immutable puzzle every state of one game shares by reference. */
export interface CrossingPuzzle {
  readonly w: number;
  readonly h: number;
  /** `w·h` flags, 1 = wall (an unplayable black cell). */
  readonly walls: Uint8Array;
  /** The clue numbers, sorted by (length, then digit by digit) — upstream
   * `cmp_numbers`. The order is byte-match surface: it is the order the desc
   * emits and the solver walks. */
  readonly numbers: readonly CrossingNumber[];
  /** Runs derived from `walls` once (upstream recomputes them per solver, per
   * ui and per validate call). */
  readonly runs: readonly CrossingRun[];
  /** Per cell, the index into `runs` of the horizontal run through it, or -1.
   * Lets input answer "which number am I filling?" without searching. */
  readonly acrossRun: Int32Array;
  /** Per cell, the index into `runs` of the vertical run through it, or -1. */
  readonly downRun: Int32Array;
}

/** Which way the cursor advances after a digit is entered. */
export type CrossingDirection = "across" | "down";

/**
 * A clue number as its digits, most significant first. Digits, not a string:
 * the desc is the only place a number is text, and every consumer — the
 * solver's candidate bits, a placement, the ghost preview — wants the digit at
 * a position, so the codec turns the text into digits once on the way in.
 */
export type CrossingNumber = readonly number[];

/** Upstream `cmp_numbers`: shorter first, then digit by digit (which, for equal
 * lengths, is numeric order). */
export function compareNumbers(a: CrossingNumber, b: CrossingNumber): number {
  if (a.length !== b.length) return a.length - b.length;
  for (let k = 0; k < a.length; k++) if (a[k] !== b[k]) return a[k] - b[k];
  return 0;
}

export function makePuzzle(
  w: number,
  h: number,
  walls: Uint8Array,
  numbers: readonly CrossingNumber[],
): CrossingPuzzle {
  const runs = collectRuns(w, h, walls);
  const acrossRun = new Int32Array(w * h).fill(-1);
  const downRun = new Int32Array(w * h).fill(-1);
  for (let r = 0; r < runs.length; r++) {
    const map = runs[r].horizontal ? acrossRun : downRun;
    for (const i of runs[r].cells) map[i] = r;
  }
  return { w, h, walls, numbers, runs, acrossRun, downRun };
}

/** The run through `(x, y)` along `dir`, or `null` when there is none (a cell
 * can belong to a horizontal run, a vertical one, both, or — an isolated open
 * cell — neither). */
function runThrough(
  puzzle: CrossingPuzzle,
  x: number,
  y: number,
  dir: CrossingDirection,
): CrossingRun | null {
  const map = dir === "across" ? puzzle.acrossRun : puzzle.downRun;
  const r = map[y * puzzle.w + x];
  return r < 0 ? null : puzzle.runs[r];
}

/** The direction the player must mean at `(x, y)`: when the cell lies in only
 * one run there is no choice, so snap to it; otherwise keep their `dir`. */
export function snapDirection(
  puzzle: CrossingPuzzle,
  x: number,
  y: number,
  dir: CrossingDirection,
): CrossingDirection {
  const across = puzzle.acrossRun[y * puzzle.w + x] >= 0;
  const down = puzzle.downRun[y * puzzle.w + x] >= 0;
  if (across !== down) return across ? "across" : "down";
  return dir;
}

/** True when `(x, y)` lies in both a horizontal and a vertical run, so a
 * direction toggle there is meaningful. */
export function atCrossing(puzzle: CrossingPuzzle, x: number, y: number): boolean {
  const i = y * puzzle.w + x;
  return puzzle.acrossRun[i] >= 0 && puzzle.downRun[i] >= 0;
}

/** The next cell along `dir` **within the same run**, or `null` at its end. */
export function nextInRun(
  puzzle: CrossingPuzzle,
  x: number,
  y: number,
  dir: CrossingDirection,
): Point | null {
  const run = runThrough(puzzle, x, y, dir);
  if (!run) return null;
  const at = run.cells.indexOf(y * puzzle.w + x);
  if (at < 0 || at + 1 >= run.cells.length) return null;
  const next = run.cells[at + 1];
  return { x: next % puzzle.w, y: Math.floor(next / puzzle.w) };
}

// --- desc codec ------------------------------------------------------------

/**
 * The longest number the format admits. Upstream hard-codes this instead of
 * scanning the grid for its longest run (`// TODO actually scan area for
 * longest row`), which makes its `INVALID_MAXROW` branch unreachable — kept
 * as-is so a reader doesn't "restore" a check that was never there.
 */
export const MAX_NUMBER_LENGTH = 9;

const isRunLetter = (c: string): boolean => c >= "a" && c <= "z";

/**
 * Decode `<walls>,<num>,<num>,…`.
 *
 * The wall section is a run-length encoding in which a **decimal number** is a
 * run of that many *open* cells and a **letter** `a`–`z` a run of `1`–`26`
 * *wall* cells, a longer wall run being split into letters; the kinds
 * alternate over the row-major cell order. The number list is one number per
 * run, as its digits `1`–`9`, comma-separated, and is stored sorted (see
 * {@link compareNumbers}).
 */
function parseDesc(p: CrossingParams, desc: string): DescParse<CrossingPuzzle> {
  const { w, h } = p;
  const wh = w * h;
  return readDesc(desc, (r) => {
    const walls = new Uint8Array(wh);
    let i = 0;
    while (i < wh) {
      if (r.peekIs(isRunLetter)) {
        const run = r.char().charCodeAt(0) - 96;
        if (i + run > wh) r.fail(DESC_TOO_LONG);
        walls.fill(1, i, i + run);
        i += run;
      } else {
        i += r.int(1, wh);
        if (i > wh) r.fail(DESC_TOO_LONG);
      }
    }
    if (r.peekIs((c) => isDigit(c) || isRunLetter(c))) r.fail(DESC_TOO_LONG);
    r.expect(",");

    const numbers: CrossingNumber[] = [];
    const digit = (): number => {
      const c = r.char();
      const d = digitValue(c);
      if (d === null || d === 0) return r.fail(descBadCharacter(c));
      return d;
    };
    do {
      const number = [digit()];
      while (r.peekIs(isDigit)) number.push(digit());
      // A run needs two cells, and the format admits nine digits.
      if (number.length < 2 || number.length > MAX_NUMBER_LENGTH)
        r.fail(DESC_OUT_OF_RANGE);
      numbers.push(number);
    } while (r.accept(","));
    r.end();

    numbers.sort(compareNumbers);
    for (let k = 0; k < numbers.length - 1; k++) {
      if (compareNumbers(numbers[k], numbers[k + 1]) === 0) r.fail(DESC_REPEATED);
    }
    const puzzle = makePuzzle(w, h, walls, numbers);
    const runLengths = puzzle.runs.map((run) => run.cells.length).sort((a, b) => a - b);
    if (
      runLengths.length !== numbers.length ||
      runLengths.some((len, k) => len !== numbers[k].length)
    )
      r.fail(DESC_CONTRADICTORY);
    return puzzle;
  });
}

/** A wall run as letters, `z` (26) at a time, the way {@link parseDesc} reads
 * consecutive letters. */
function wallLetters(run: number): string {
  return (
    "z".repeat(Math.floor((run - 1) / 26)) + String.fromCharCode(97 + ((run - 1) % 26))
  );
}

/** The exact inverse of {@link parseDesc}'s wall section plus the `,`-joined
 * number list — upstream's `new_game_desc` tail, with wall runs over 26 split
 * where upstream would write a character past `z`. */
export function encodeDesc(
  w: number,
  h: number,
  walls: Uint8Array,
  numbers: readonly CrossingNumber[],
): string {
  let out = "";
  let wallRun = 0;
  let openRun = 0;
  for (let i = 0; i < w * h; i++) {
    if (walls[i] && openRun > 0) {
      out += String(openRun);
      openRun = 0;
    } else if (!walls[i] && wallRun > 0) {
      out += wallLetters(wallRun);
      wallRun = 0;
    }
    if (walls[i]) wallRun++;
    else openRun++;
  }
  if (openRun > 0) out += String(openRun);
  if (wallRun > 0) out += wallLetters(wallRun);

  // Upstream writes the ',' then every number with a trailing comma, then backs
  // up one character — so a (constructively unreachable) empty list yields no
  // separator at all.
  return numbers.length > 0
    ? `${out},${numbers.map((n) => n.join("")).join(",")}`
    : out;
}

// --- state -----------------------------------------------------------------

export interface CrossingState {
  readonly params: CrossingParams;
  /** The puzzle, shared by reference across every clone. */
  readonly puzzle: CrossingPuzzle;
  /** `w·h` entered digits, `0` = empty; cloned per move. */
  grid: Uint8Array;
  /** `w·h` pencil-mark bitmasks (bit `n-1` = digit `n`); cloned per move. */
  pencil: Int32Array;
}

export function newState(p: CrossingParams, desc: string): CrossingState {
  return {
    params: p,
    puzzle: descValue(parseDesc(p, desc)),
    grid: new Uint8Array(p.w * p.h),
    pencil: new Int32Array(p.w * p.h),
  };
}

export function cloneState(s: CrossingState): CrossingState {
  return {
    params: s.params,
    puzzle: s.puzzle,
    grid: s.grid.slice(),
    pencil: s.pencil.slice(),
  };
}

export function status(s: CrossingState): "solved" | "ongoing" {
  return validateBoard(s.puzzle, s.grid).status === "valid" ? "solved" : "ongoing";
}

// --- board validity --------------------------------------------------------

/** The three-valued board verdict (upstream's `STATUS_*` ints). */
export type SolveStatus = "valid" | "invalid" | "progress";

export interface ValidateResult {
  status: SolveStatus;
  /** Per **number** index: how many runs currently read as that number. */
  done: Int32Array;
  /** Per **run** index: the run is full but matches no listed number. */
  runErrs: Uint8Array;
}

/**
 * Upstream `crossing_validate`. For every run, find which listed numbers of the
 * run's length it currently reads as; a *full* run matching none is a definite
 * error, and a number claimed by more than one run likewise. `"valid"` means
 * every run is full and every number used exactly once.
 *
 * **Two upstream shapes preserved deliberately.**
 *
 * 1. `full` is computed *across* the numbers of matching length rather than per
 *    number, so a run whose length matches **no** number at all keeps
 *    `full = true` with `any = false` and is flagged — which is right (no
 *    number can ever go there) but is not what the code reads like.
 * 2. The completion re-scan indexes `done` by **run** index while the
 *    accumulation above indexes it by **number** index. Those coincide only
 *    because a solved Nansuke has exactly one number per run — which every
 *    generated board does. `done` is sized to hold both so that a hand-authored
 *    description with a mismatched count cannot read out of bounds (the C reads
 *    past its allocation there).
 */
export function validateBoard(
  puzzle: CrossingPuzzle,
  grid: Uint8Array,
): ValidateResult {
  const { numbers, runs } = puzzle;
  const done = new Int32Array(Math.max(numbers.length, runs.length));
  const runErrs = new Uint8Array(runs.length);
  let status: SolveStatus = "valid";

  for (let i = 0; i < runs.length; i++) {
    const cells = runs[i].cells;
    let any = false;
    let full = true;

    for (let l = 0; l < numbers.length; l++) {
      const num = numbers[l];
      if (num.length !== cells.length) continue;

      let match = true;
      for (let k = 0; k < cells.length; k++) {
        const digit = grid[cells[k]];
        if (digit === 0) full = false;
        if (digit !== num[k]) match = false;
      }

      if (match) {
        any = true;
        done[l]++;
      }
    }

    if (status === "valid" && !full) status = "progress";
    if (full && !any) {
      status = "invalid";
      runErrs[i] = 1;
    }
  }

  if (status !== "invalid") {
    for (let i = 0; i < runs.length; i++) {
      if (done[i] > 1) {
        status = "invalid";
        break;
      }
      if (done[i] === 0) status = "progress";
    }
  }

  return { status, done, runErrs };
}

// --- placing a whole number (the fork's number-list aid) --------------------

/**
 * Can listed number `l` still be written into `run`?
 *
 * Deliberately **pattern-matching only**: the number must be the run's length
 * and must agree with every digit already entered there. That is the scan a
 * player does by eye down the clue list — it uses nothing but their own
 * entries. Judging a number by whether it would leave the *crossing* runs
 * satisfiable is constraint propagation, i.e. the puzzle itself, and belongs to
 * a hint rather than to an input aid.
 */
export function numberFitsRun(
  puzzle: CrossingPuzzle,
  grid: Uint8Array,
  run: CrossingRun,
  l: number,
): boolean {
  const num = puzzle.numbers[l];
  if (num.length !== run.cells.length) return false;
  for (let k = 0; k < run.cells.length; k++) {
    const digit = grid[run.cells[k]];
    if (digit !== 0 && digit !== num[k]) return false;
  }
  return true;
}

/** For each listed number, the index of a run that currently reads exactly as
 * it, or -1 — i.e. "where have I already used this number?". A number placed in
 * one run is unavailable to any other (each appears exactly once). */
export function placedRuns(puzzle: CrossingPuzzle, grid: Uint8Array): Int32Array {
  const { numbers, runs } = puzzle;
  const at = new Int32Array(numbers.length).fill(-1);
  for (let r = 0; r < runs.length; r++) {
    const cells = runs[r].cells;
    for (let l = 0; l < numbers.length; l++) {
      if (at[l] >= 0) continue;
      const num = numbers[l];
      if (num.length !== cells.length) continue;
      let match = true;
      for (let k = 0; k < cells.length; k++) {
        if (grid[cells[k]] !== num[k]) {
          match = false;
          break;
        }
      }
      if (match) at[l] = r;
    }
  }
  return at;
}

/** Is listed number `l` available to `runIndex` — it fits, and it is not
 * already written into some *other* run? */
export function numberAvailableTo(
  puzzle: CrossingPuzzle,
  grid: Uint8Array,
  placed: Int32Array,
  runIndex: number,
  l: number,
): boolean {
  if (placed[l] >= 0 && placed[l] !== runIndex) return false;
  return numberFitsRun(puzzle, grid, puzzle.runs[runIndex], l);
}

/**
 * Which run through `(x, y)` should take listed number `l`, or -1?
 *
 * A number occupies a whole run, so its length usually settles the question by
 * itself. Where both runs through the cell admit it, **the one the board
 * already constrains wins**: agreeing with digits the player has entered is
 * evidence of what they meant, where a blank run admits every unused number of
 * its length and so is no evidence at all. Only a genuine tie — both runs
 * equally constrained — is settled by the current fill direction.
 *
 * Letting the fill direction decide first is the obvious rule, and it is wrong:
 * with `4_1` written across and the crossing down run still blank, clicking
 * clue `421` would write it *downwards* whenever the sticky direction is
 * "down", though the board plainly shows a nearly finished word that only `421`
 * completes.
 *
 * The renderer colors the clue list through this same function, so the color
 * a clue is written in always names the run a click would actually send it to.
 */
export function runForNumber(
  puzzle: CrossingPuzzle,
  grid: Uint8Array,
  placed: Int32Array,
  x: number,
  y: number,
  l: number,
  dir: CrossingDirection,
): number {
  const i = y * puzzle.w + x;
  const preferred = dir === "across" ? puzzle.acrossRun[i] : puzzle.downRun[i];
  const other = dir === "across" ? puzzle.downRun[i] : puzzle.acrossRun[i];
  const takes = (r: number): boolean =>
    r >= 0 && numberAvailableTo(puzzle, grid, placed, r, l);

  if (!takes(preferred)) return takes(other) ? other : -1;
  if (!takes(other)) return preferred;

  // Both admit it: how much of each run is already written decides.
  const entered = (r: number): number =>
    puzzle.runs[r].cells.filter((c) => grid[c] !== 0).length;
  return entered(other) > entered(preferred) ? other : preferred;
}

// --- moves and ui ----------------------------------------------------------

export type CrossingMove =
  /** Ink: place `digit` (or clear the cell when `null`) at `(x, y)`. */
  | { kind: "set"; x: number; y: number; digit: number | null }
  /** Note: toggle mark `digit`, or erase every mark when `null`. */
  | { kind: "pencil"; x: number; y: number; digit: number | null }
  /** Clear a list of notes atomically — the hint's rule-out move. A `pencil`
   * toggle is *one* candidate and is not idempotent (re-applying it would put
   * the note back), so one deduction ruling out several candidates needs a move
   * that only ever removes (docs/hints-candidates.md § "Persist, populate, and the moves"). Players produce it only by
   * following a hint; typing produces `pencil` toggles. */
  | { kind: "pencilStrike"; marks: readonly { x: number; y: number; n: number }[] }
  /** Add a list of notes atomically — the hint's move for writing the digits a
   * run leaves into a square with none. It only ever adds, for the reason
   * `pencilStrike` only ever removes, and players likewise produce it only by
   * following a hint. */
  | { kind: "pencilAdd"; marks: readonly { x: number; y: number; n: number }[] }
  /** Write listed number `number` into run `run` — the whole clue at once,
   * as one undo step (the fork's number-list placement aid). */
  | { kind: "place"; run: number; number: number }
  /** Auto-solve: overwrite every open cell from the solver's grid. */
  | { kind: "solve"; grid: readonly number[] };

export interface CrossingUi {
  /** Selected cell. */
  cursor: GridCursor;
  /** The selection takes pencil marks rather than ink. */
  pencilMode: boolean;
  /** The selection came from the keyboard, so it survives an entry. */
  cursorFromKeyboard: boolean;
  /** Which way an entered digit advances the selection. Sticky: the arrow keys
   * set it, a repeat click at a crossing toggles it, and selecting a cell that
   * lies in only one run snaps it to that run. */
  dir: CrossingDirection;
  /** The clue number currently picked up from the list (an index into
   * `puzzle.numbers`), or `null`. While one is held it is previewed in every
   * run that can still take it, and clicking such a run places it. */
  heldNumber: number | null;
  /** Preference (default on): color the clue list by where each clue could go
   * from the selected cell — its dimension's ink if it fits one of the two runs
   * through that cell, dimmed if it fits neither. Pure bookkeeping over the
   * player's own entries — see {@link numberFitsRun}. */
  fitHighlight: boolean;
  /** Preference (default on): wash the two runs through the selected cell on
   * the board, each in its dimension's hue. Independent of
   * {@link CrossingUi.fitHighlight} — some players want to know which clues are
   * live without the board being tinted, and vice versa. */
  highlightRuns: boolean;
  /** Preference (default on, a deliberate divergence — the game's own
   * documentation asks for it): entering a digit moves the selection to the next
   * cell of the run being filled, so a number can be typed straight in instead of
   * clicking every cell. */
  autoAdvance: boolean;
  /** Preference (default on, the fork's shared convention): right-click toggles
   * a *sticky* pencil mode that stays on until right-clicked again (a
   * CapsLock-style toggle with an on-screen indicator) rather than upstream's
   * per-cell pencil select. Matches Keen/Towers/Solo/ABCD/Mathrax/Unequal. */
  pencilSticky: boolean;
  /** Preference (default on): keep the mouse highlight after a pencil change. */
  pencilKeepHighlight: boolean;
}

export function newUi(_state: CrossingState): CrossingUi {
  return {
    cursor: newCursor(),
    pencilMode: false,
    cursorFromKeyboard: false,
    dir: "across",
    heldNumber: null,
    fitHighlight: true,
    highlightRuns: true,
    autoAdvance: true,
    pencilSticky: true,
    pencilKeepHighlight: true,
  };
}

// --- text format -----------------------------------------------------------

/**
 * ASCII rendering for the share-as-text panel (upstream `game_text_format`):
 * the grid with `#` for a wall, the entered digit, or `.` for an empty cell,
 * followed by the number list grouped by length.
 */
export function textFormat(state: CrossingState): string {
  const { w, h, walls, numbers } = state.puzzle;
  let out = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      out += walls[i] ? "#" : state.grid[i] ? String(state.grid[i]) : ".";
    }
    out += "\n";
  }

  // Upstream writes a sentinel character that the first length group backs over,
  // so each group header is preceded by exactly one newline and the list keeps a
  // trailing comma. Reproduced literally.
  out += "Q";
  let prevLen = 0;
  for (const num of numbers) {
    if (num.length !== prevLen) out = `${out.slice(0, -1)}\n${num.length}: `;
    prevLen = num.length;
    out += `${num},`;
  }
  return out;
}
