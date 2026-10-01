/**
 * Salad — params, immutable state, the description codec and the move/UI types.
 *
 * Salad (© 2013 Lennard Sprong, `puzzles/unreleased/salad.c`) is a
 * **pseudo-Latin-square** puzzle: place each of `nums` symbols exactly once in
 * every row and column of an `order × order` grid, leaving the other
 * `order − nums` squares in each line empty. Two game modes share one
 * implementation:
 *
 * - **ABC End View** ({@link GAMEMODE_LETTERS}) — clues sit outside the grid,
 *   each naming the first symbol seen looking inward along that row/column.
 * - **Number Ball** ({@link GAMEMODE_NUMBERS}) — clues sit *inside* the grid: a
 *   **ball** (circle) marks a square that must hold a number, a **cross** marks
 *   one that must stay empty.
 *
 * **The `'X'`/`'O'` sentinels keep their character codes**, as upstream stores
 * them: one array holds both the symbols (`1..nums`, `nums ≤ 9`) and the two
 * markers, and the run-length desc codec is written against that mixed
 * alphabet. Re-encoding them would make the codec harder to audit.
 */

import type { NoteEncoding } from "../../engine/candidate-hint.ts";
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
import { type DescReader, readDesc } from "../../engine/desc-reader.ts";
import { difficultyItem, tierNames } from "../../engine/difficulty.ts";
import type { ParamConfigItem } from "../../engine/game.ts";
import { type RowColRegion, rowColRegions } from "../../engine/latin-hint.ts";
import { numberItem, squareSize } from "../../engine/params.ts";
import { choice, letters, num, paramsCodec, size } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { newCursor } from "../../engine/pointer.ts";

// --- difficulty ------------------------------------------------------------

/** Upstream `DIFF_EASY`, shown as **Easy**. */
export const DIFF_EASY = 0;
/** Upstream `DIFF_HARD`, shown as **Normal**. */
export const DIFF_HARD = 1;
const DIFFCOUNT = 2;

const DIFF_NAMES: readonly string[] = tierNames(2);
/** The difficulty letters `encodeParams` writes and `decodeParams` reads. */
const DIFF_CHARS = "ex";

/**
 * The pseudo-tier the Number Ball generator's quality check runs at: iterate
 * *only* the hole deductions (sync + count) and ask whether every hole can be
 * placed without entering a single number. A puzzle that passes is thrown away
 * as too easy. Upstream spells it `DIFF_EASY - 1`.
 */
export const DIFF_HOLESONLY = DIFF_EASY - 1;

// --- game mode -------------------------------------------------------------

export const GAMEMODE_LETTERS = 0;
export const GAMEMODE_NUMBERS = 1;

// --- cell sentinels --------------------------------------------------------

/** `LATINH_CROSS`: this square definitely holds no symbol. Upstream's `'X'`. */
export const CROSS = 88;
/** `LATINH_CIRCLE`: this square definitely holds a symbol. Upstream's `'O'`. */
export const CIRCLE = 79;

/** The keypad keys that write each marker. */
export const KEY_CROSS = "X".charCodeAt(0);
export const KEY_CIRCLE = "O".charCodeAt(0);

// --- params ----------------------------------------------------------------

export interface SaladParams {
  /** Grid side length. */
  order: number;
  /** How many distinct symbols appear in each row and column. */
  nums: number;
  /** {@link GAMEMODE_LETTERS} or {@link GAMEMODE_NUMBERS}. */
  mode: number;
  /** {@link DIFF_EASY} or {@link DIFF_HARD}. */
  diff: number;
}

export const PRESETS: readonly SaladParams[] = [
  { order: 4, nums: 3, mode: GAMEMODE_LETTERS, diff: DIFF_EASY },
  { order: 5, nums: 3, mode: GAMEMODE_LETTERS, diff: DIFF_EASY },
  { order: 5, nums: 3, mode: GAMEMODE_NUMBERS, diff: DIFF_EASY },
  { order: 5, nums: 4, mode: GAMEMODE_LETTERS, diff: DIFF_EASY },
  { order: 6, nums: 3, mode: GAMEMODE_NUMBERS, diff: DIFF_EASY },
  { order: 6, nums: 4, mode: GAMEMODE_LETTERS, diff: DIFF_EASY },
  { order: 6, nums: 4, mode: GAMEMODE_NUMBERS, diff: DIFF_EASY },
  { order: 7, nums: 4, mode: GAMEMODE_LETTERS, diff: DIFF_EASY },
  { order: 7, nums: 4, mode: GAMEMODE_NUMBERS, diff: DIFF_EASY },
  { order: 8, nums: 5, mode: GAMEMODE_LETTERS, diff: DIFF_EASY },
  { order: 8, nums: 5, mode: GAMEMODE_NUMBERS, diff: DIFF_EASY },
];

export function defaultParams(): SaladParams {
  return { ...PRESETS[0] };
}

/** The `A~C` / `1~3` symbol range a params label and the status bar show. */
export function symbolRange(p: SaladParams): string {
  return p.mode === GAMEMODE_LETTERS
    ? `A~${String.fromCharCode(64 + p.nums)}`
    : `1~${p.nums}`;
}

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<SaladParams>[] = [
  {
    kw: "game-mode",
    name: "Game Mode",
    type: "choices",
    choices: ["ABC End View", "Number Ball"],
    doc: "Switch between ABC End View and Number Ball mode.",
    label: {
      slot: "lead",
      words: (p) => (p.mode === GAMEMODE_LETTERS ? "Letters" : "Numbers"),
    },
    get: (p) => p.mode,
    set: (p, v) => {
      p.mode = v === GAMEMODE_NUMBERS ? GAMEMODE_NUMBERS : GAMEMODE_LETTERS;
    },
  },
  numberItem<SaladParams>("size", "Size (s*s)", "order", {
    doc: "Size of the grid in squares.",
    bounds: { min: 3 },
    label: { slot: "size", words: squareSize("order") },
  }),
  numberItem<SaladParams>("symbols", "Symbols", "nums", {
    doc: "The amount of different symbols that appear in each row.",
    bounds: { min: 2, max: 9 },
    label: { slot: "kind", words: symbolRange },
  }),
  difficultyItem(DIFF_NAMES, "diff", {
    doc: "A Normal puzzle always needs a technique the Easy level does not have, so the setting you choose is the difficulty you get. Normal Number Ball puzzles are rare, so one can take a few seconds to appear.",
  }),
];

/** Order, `n` and the symbol count, `L` or `B` for the mode, then the
 * generator-only difficulty letter. Upstream parks an unknown difficulty letter
 * out of range so that it is refused with a reason rather than silently
 * defaulted. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  size(paramConfig, "size"),
  num(paramConfig, "n", "symbols"),
  letters(paramConfig, "game-mode", ["L", "B"]),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, {
    full: true,
    invalid: DIFFCOUNT + 1,
  }),
]);

export function validateParams(p: SaladParams, _full: boolean): string | null {
  if (p.nums >= p.order) return "Symbols must be lower than the size.";
  return null;
}

// --- state -----------------------------------------------------------------

/**
 * The mutable board the solver and generator work on — exactly the part of
 * `game_state` they touch. {@link SaladState} satisfies it structurally, so a
 * cloned state can be handed straight to the solver.
 *
 * `grid` holds the working symbols in the `1..nums + 1` alphabet while the
 * solver runs: `nums + 1` is the cube's symbol for an empty square (see
 * `solver.ts`, `holeSymbol`), so a solved `grid` cell may be one past `nums`,
 * and every reader of a solved grid tests `<= nums`. Player entries are always
 * `1..nums`.
 */
export interface SaladBoard {
  readonly order: number;
  readonly nums: number;
  readonly mode: number;
  /** `order*4` border clues (0 = none): top row, left column, bottom, right. */
  readonly borderclues: Uint8Array;
  /** `order²` fixed clues: a symbol `1..nums`, {@link CROSS}, {@link CIRCLE}, or 0. */
  readonly gridclues: Uint8Array;
  /** `order²` working symbols (0 = blank). */
  readonly grid: Uint8Array;
  /** `order²` confirmed markers: 0, {@link CROSS} or {@link CIRCLE}. */
  readonly holes: Uint8Array;
}

export interface SaladState extends SaladBoard {
  readonly diff: number;
  /** `order²` pencil-mark bitmaps: bit `n−1` = symbol `n`, bit `nums` = the
   * "might be empty" X mark. */
  readonly pencil: Int32Array;
}

export function cloneState(s: SaladState): SaladState {
  return {
    order: s.order,
    nums: s.nums,
    mode: s.mode,
    diff: s.diff,
    borderclues: s.borderclues, // fixed, shared by reference
    gridclues: s.gridclues, // fixed, shared by reference
    grid: s.grid.slice(),
    holes: s.holes.slice(),
    pencil: s.pencil.slice(),
  };
}

/** A blank working board over the same fixed clues — upstream's
 * `memset(grid, 0); memset(holes, 0)` before each solver-gated attempt. */
export function scratchBoard(b: SaladBoard): SaladBoard {
  const o2 = b.order * b.order;
  return {
    order: b.order,
    nums: b.nums,
    mode: b.mode,
    borderclues: b.borderclues,
    gridclues: b.gridclues,
    grid: new Uint8Array(o2),
    holes: new Uint8Array(o2),
  };
}

// --- moves -----------------------------------------------------------------

/**
 * What a `set` / `pencil` move writes. A `number` is a symbol `1..nums`; the
 * three string tags are upstream's `'X'` / `'O'` / `'-'` move characters.
 */
export type SaladEntry = number | "cross" | "circle" | "clear";

/** One pencil mark a {@link SaladMove} strike clears: candidate `n` at
 * `(x, y)`, where `n` in `1..nums` is a symbol and `n === nums + 1` is the
 * "might be empty" X mark — so one formula, `1 << (n − 1)`, covers both. */
export interface SaladMark {
  x: number;
  y: number;
  n: number;
}

export type SaladMove =
  /** Upstream `R x,y,c` — a real entry (symbol, cross, circle or clear). */
  | { type: "set"; x: number; y: number; value: SaladEntry }
  /** Upstream `P x,y,c` — a pencil mark. `"circle"` is upstream's oddity: it
   * toggles the *real* circle marker without emptying the square. */
  | { type: "pencil"; x: number; y: number; value: SaladEntry }
  /** Fork addition, for the hint (docs/games/hints.md § "Persist, populate, and
   * the moves"): clear a list of pencil marks atomically. The per-square
   * `pencil` move is a *toggle*, so a re-applied strike would put the mark back;
   * this one only ever removes, which makes one deduction forcing several
   * strikes a single idempotent, resume-safe step. */
  | { type: "pencilStrike"; marks: SaladMark[] }
  /** Pencil in the candidates of every square that carries **no** mark yet —
   * the fill half of the adaptive Mark-all press, and the hint's opener.
   * Deliberately not the resetting `markAll` below, which would throw away
   * deductions the player has already penciled. */
  | { type: "pencilAll" }
  /** Upstream `M` — fill every empty square with all its candidate marks,
   * *resetting* any the player had narrowed. **Replay only**: no input emits
   * it, but a saved move log may contain it, so its behavior must not drift. */
  | { type: "markAll" }
  /** Upstream `S…` — the solved board, one entry per cell (0 = a hole). */
  | { type: "solve"; cells: number[] };

// --- the note representation ------------------------------------------------
//
// One definition of "how Salad's pencil marks are encoded", shared by the play
// path (the adaptive Mark-all press in `index.ts`) and the hint (`hint.ts`), so
// the two can never disagree about which bit is which candidate.

/**
 * Salad's projection onto the shared candidate helpers: candidate `n` sits at
 * bit `n − 1`, and the alphabet is `nums` symbols plus the "might be empty" X
 * mark at bit `nums` — **shorter than the grid order**, which is why the value
 * count has to be stated separately from the stride.
 */
export function saladNotes(nums: number): NoteEncoding {
  return { bit: (n) => 1 << (n - 1), values: nums + 1 };
}

/** A square's uniqueness regions: its row and its column, and nothing else
 * (Salad has no blocks). */
export function saladRegions(o: number): (x: number, y: number) => RowColRegion[] {
  return (x, y) => rowColRegions(x, y, o);
}

/**
 * Is there a square the player could pencil into that carries no mark yet? The
 * fill half of the adaptive Mark-all press, and the hint's populate latch.
 *
 * Note this is **not** the shared `anyEmptyLacksNotes`: a square marked
 * definitely-empty is blank *and* legitimately holds no notes for ever, so that
 * predicate would report "needs filling" on a finished board.
 */
export function needsPencilFill(b: {
  order: number;
  grid: Uint8Array;
  holes: Uint8Array;
  pencil: Int32Array;
}): boolean {
  for (let i = 0; i < b.order * b.order; i++) {
    if (b.grid[i] === 0 && b.holes[i] !== CROSS && b.pencil[i] === 0) return true;
  }
  return false;
}

// --- ui --------------------------------------------------------------------

export interface SaladUi {
  cursor: GridCursor;
  pencilMode: boolean;
  cursorFromKeyboard: boolean;
  /** Preference (default on, fork divergence): right-click toggles a *sticky*
   * pencil mode — once on, left-clicks keep entering pencil marks until
   * right-clicked again (mobile-style), instead of every left-click reverting
   * to real entry. Off ⇒ exactly upstream's per-click mode. */
  pencilSticky: boolean;
  /** Preference (default on): keep the mouse highlight after a pencil change. */
  pencilKeepHighlight: boolean;
}

export function newUi(_state: SaladState): SaladUi {
  return {
    cursor: newCursor(),
    pencilMode: false,
    cursorFromKeyboard: false,
    pencilSticky: true,
    pencilKeepHighlight: true,
  };
}

// --- desc codec ------------------------------------------------------------

/**
 * Upstream `salad_serialize`: a run of `k` blank entries becomes one lowercase
 * letter (`'a' - 1 + k`, flushed at 26 per run), a cross `X`, a circle `O`, and
 * a symbol `v` whatever `symbol(v)` writes: {@link letterChar} for border clues
 * (and for a letters-mode grid), a digit for a Number Ball grid.
 */
export function serialize(input: Uint8Array, symbol: (v: number) => string): string {
  let out = "";
  let run = 0;
  const flush = (): void => {
    if (run) out += String.fromCharCode(96 + run);
    run = 0;
  };
  for (const v of input) {
    if (v === 0) {
      if (run === 26) flush();
      run++;
      continue;
    }
    flush();
    if (v === CROSS) out += "X";
    else if (v === CIRCLE) out += "O";
    else out += symbol(v);
  }
  flush();
  return out;
}

/** `A`, `B`, … for symbol `v`: the border clues' alphabet in both modes, and
 * the grid's in ABC End View. `64` is `'A' - 1`. */
export function letterChar(v: number): string {
  return String.fromCharCode(64 + v);
}

/** Symbol `n` as the board shows it: `A`, `B`, … in ABC End View; `1`, `2`, …
 * in Number Ball. */
export function symbolChar(mode: number, n: number): string {
  return mode === GAMEMODE_LETTERS ? letterChar(n) : String(n);
}

interface Decoded {
  borderclues: Uint8Array;
  gridclues: Uint8Array;
  grid: Uint8Array;
  holes: Uint8Array;
}

/** `a`..`z`: a run of 1..26 blanks. */
function isRunLetter(c: string): boolean {
  return c >= "a" && c <= "z";
}

/** `A`..`I` as symbols `1..9`; the alphabet {@link letterChar} writes. */
function letterSymbol(c: string): number | null {
  const v = c.charCodeAt(0) - 64;
  return v >= 1 && v <= 9 ? v : null;
}

/** A Number Ball grid's characters: a digit symbol, or a cross or ball. */
function numbersGridValue(c: string): number | null {
  if (c === "X") return CROSS;
  if (c === "O") return CIRCLE;
  const d = digitValue(c);
  return d !== null && d >= 1 ? d : null;
}

/** An ABC End View grid's characters: a letter symbol, or a cross. Its writer
 * never places a ball. */
function lettersGridValue(c: string): number | null {
  return c === "X" ? CROSS : letterSymbol(c);
}

/**
 * Read one `serialize`d section of exactly `count` entries: `a`..`z` is a run
 * of blanks, and any other character must be one `value` maps to a symbol in
 * `1..nums` or a marker.
 */
function readSection(
  r: DescReader,
  count: number,
  nums: number,
  value: (c: string) => number | null,
): Uint8Array {
  const out = new Uint8Array(count);
  for (let pos = 0; pos < count; ) {
    const c = r.char();
    const run = isRunLetter(c) ? c.charCodeAt(0) - 96 : 0;
    if (run) {
      if (run > count - pos) r.fail(DESC_TOO_LONG);
      pos += run;
      continue;
    }
    const v = value(c);
    if (v === null) r.fail(descBadCharacter(c));
    if (v > nums && v !== CROSS && v !== CIRCLE) r.fail(DESC_OUT_OF_RANGE);
    out[pos++] = v;
  }
  return out;
}

/**
 * Upstream `load_game`, reading exactly what {@link serialize} writes. An ABC
 * End View description is `<border>,<grid>`, in letters; a Number Ball one is
 * `<grid>` alone, in digits, crosses and balls. Each section covers its
 * entries exactly.
 */
function parseDesc(p: SaladParams, desc: string): DescParse<Decoded> {
  const o2 = p.order * p.order;
  const abc = p.mode === GAMEMODE_LETTERS;
  return readDesc(desc, (r) => {
    let borderclues: Uint8Array = new Uint8Array(p.order * 4);
    if (abc) {
      borderclues = readSection(r, borderclues.length, p.nums, letterSymbol);
      // Another entry where the `,` belongs is a border with one too many.
      if (r.peekIs((c) => isRunLetter(c) || letterSymbol(c) !== null)) {
        r.fail(DESC_TOO_LONG);
      }
      r.expect(",");
    }
    const gridclues = readSection(
      r,
      o2,
      p.nums,
      abc ? lettersGridValue : numbersGridValue,
    );
    r.end();

    const grid = new Uint8Array(o2);
    const holes = new Uint8Array(o2);
    for (let i = 0; i < o2; i++) {
      const v = gridclues[i];
      if (v === CROSS || v === CIRCLE) holes[i] = v;
      else if (v) {
        grid[i] = v;
        holes[i] = CIRCLE;
      }
    }
    return { borderclues, gridclues, grid, holes };
  });
}

export function validateDesc(p: SaladParams, desc: string): DescError | null {
  return descVerdict(parseDesc(p, desc));
}

export function newState(p: SaladParams, desc: string): SaladState {
  return {
    order: p.order,
    nums: p.nums,
    mode: p.mode,
    diff: p.diff,
    ...descValue(parseDesc(p, desc)),
    pencil: new Int32Array(p.order * p.order),
  };
}

// --- completion ------------------------------------------------------------

/**
 * Upstream `latinholes_check`: every line holds exactly `order − nums` blanks
 * and each symbol exactly once, and no square marked definitely-filled is still
 * blank.
 */
export function latinholesCheck(b: SaladBoard): boolean {
  const o = b.order;
  const nums = b.nums;
  const rows = new Int32Array(o * nums);
  const cols = new Int32Array(o * nums);
  const hrows = new Int32Array(o);
  const hcols = new Int32Array(o);

  for (let x = 0; x < o; x++) {
    for (let y = 0; y < o; y++) {
      const d = b.grid[y * o + x];
      if (d === 0 && b.holes[y * o + x] === CIRCLE) return false;
      if (d === 0 || d > nums) {
        hrows[y]++;
        hcols[x]++;
      } else {
        rows[y * nums + d - 1]++;
        cols[x * nums + d - 1]++;
      }
    }
  }

  for (let i = 0; i < o; i++) {
    if (hrows[i] !== o - nums || hcols[i] !== o - nums) return false;
  }
  for (let i = 0; i < o * nums; i++) {
    if (rows[i] !== 1 || cols[i] !== 1) return false;
  }
  return true;
}

/**
 * Upstream `salad_scan_dir`: the first symbol met walking `si → ei` in steps of
 * `di`. With `direct` set the scan gives up (returns 0) at the first square
 * that is neither filled nor a known cross — i.e. "we cannot tell yet".
 */
export function scanDir(
  grid: Uint8Array,
  holes: Uint8Array | null,
  si: number,
  di: number,
  ei: number,
  direct: boolean,
): number {
  for (let i = si; i !== ei; i += di) {
    if (direct && grid[i] === 0 && holes?.[i] !== CROSS) return 0;
    if (grid[i] !== 0 && grid[i] !== CROSS) return grid[i];
  }
  return 0;
}

/**
 * The four `(start, step, end)` scans of border-clue line `i`, in upstream's
 * clue order: top, left, bottom, right. Shared by the solver, the generator,
 * the live error check and the completion test, so a scan can never drift
 * between them.
 */
export function borderScans(
  i: number,
  o: number,
): { start: number; step: number; end: number; clue: number }[] {
  const o2 = o * o;
  return [
    { start: i, step: o, end: o2 + i, clue: i },
    { start: i * o, step: 1, end: (i + 1) * o, clue: i + o },
    { start: o2 - o + i, step: -o, end: i - o, clue: i + o * 2 },
    { start: (i + 1) * o - 1, step: -1, end: i * o - 1, clue: i + o * 3 },
  ];
}

/** The single scan belonging to border clue `cd` — the inverse of the clue
 * numbering {@link borderScans} lays out (`cd % o` names the line, `cd / o` the
 * side, in the top / left / bottom / right order the clue array uses). The hint
 * reads its line of sight through this rather than re-deriving the geometry. */
export function borderScanFor(
  cd: number,
  o: number,
): { start: number; step: number; end: number; clue: number } {
  return borderScans(cd % o, o)[(cd / o) | 0];
}

const CLUE_SIDES = [
  { side: "top", axis: "column" },
  { side: "left", axis: "row" },
  { side: "bottom", axis: "column" },
  { side: "right", axis: "row" },
] as const;

/** Which side of the board clue `cd` sits on, and therefore which kind of line
 * it looks along. */
export function clueSide(cd: number, o: number): (typeof CLUE_SIDES)[number] {
  return CLUE_SIDES[(cd / o) | 0];
}

/** Upstream `salad_checkborders`: every border clue matches the first symbol
 * actually seen along its line. */
function checkBorders(b: SaladBoard): boolean {
  const o = b.order;
  for (let i = 0; i < o; i++) {
    for (const s of borderScans(i, o)) {
      const clue = b.borderclues[s.clue];
      if (!clue) continue;
      if (scanDir(b.grid, null, s.start, s.step, s.end, false) !== clue) return false;
    }
  }
  return true;
}

export function isComplete(b: SaladBoard): boolean {
  return latinholesCheck(b) && checkBorders(b);
}

// --- text format -----------------------------------------------------------

/** Upstream `game_text_format`: the board inside an ASCII box, with the four
 * rims of border clues outside it. */
export function textFormat(s: SaladState): string {
  const o = s.order;
  const lr = 8 + o * 2; // upstream's line length, including the newline
  const rows: string[][] = [];
  for (let i = 0; i < o + 4; i++) rows.push(new Array<string>(lr - 1).fill(" "));

  const put = (row: number, col: number, ch: string): void => {
    rows[row][col] = ch;
  };

  // Corners and the box.
  put(1, 2, "+");
  put(1, lr - 4, "+");
  put(o + 2, 2, "+");
  put(o + 2, lr - 4, "+");
  for (let i = 3; i < lr - 4; i++) {
    put(1, i, "-");
    put(o + 2, i, "-");
  }
  for (let i = 2; i < 2 + o; i++) {
    put(i, 2, "|");
    put(i, o * 2 + 4, "|");
  }

  // Grid contents.
  for (let i = 0; i < o; i++) {
    for (let j = 0; j < o; j++) {
      const d = s.grid[i * o + j];
      const hole = s.holes[i * o + j];
      let c: string;
      if (hole === CROSS) c = "x";
      else if (!d) c = hole === CIRCLE ? "O" : ".";
      else c = symbolChar(s.mode, d);
      put(i + 2, 2 * j + 4, c);
    }
  }

  // Border clues (always letters, as upstream prints them).
  for (let i = 0; i < o; i++) {
    if (s.borderclues[i]) put(0, i * 2 + 4, letterChar(s.borderclues[i]));
    if (s.borderclues[i + o]) put(i + 2, 0, letterChar(s.borderclues[i + o]));
    if (s.borderclues[i + o * 2])
      put(o + 3, i * 2 + 4, letterChar(s.borderclues[i + o * 2]));
    if (s.borderclues[i + o * 3])
      put(i + 2, lr - 2, letterChar(s.borderclues[i + o * 3]));
  }

  return `${rows.map((r) => r.join("")).join("\n")}\n`;
}
