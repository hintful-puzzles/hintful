/**
 * Types and pure state helpers for ABCD — the state/codec parts of
 * `unreleased/abcd.c` (Lennard Sprong, 2011).
 *
 * The *player state* is the grid of entered letters plus pencil marks; the
 * *puzzle data* is the `(w+h)·n` edge clue numbers. The clues never change
 * after `newState`, so every clone aliases the same `numbers` array and only
 * `grid` and `pencil` are copied per move.
 *
 * C uses one `clues[w·h·n]` array for two unrelated jobs, the player's pencil
 * marks and the solver's candidate cube. Here they are separate:
 * {@link AbcdState.pencil}, a per-cell bitmask like every other note-taking
 * game's, and a fresh cube local to {@link ./solver.ts}.
 */

import {
  DIFF_EASY,
  DIFF_UNREASONABLE,
  SEARCH_TIER_NAMES,
  searchTierItem,
  searchTierSegment,
} from "../../engine/answer-search.ts";
import {
  type CandidateReading,
  DEFAULT_CANDIDATE_READING,
} from "../../engine/candidate-hint.ts";
import { type DescParse, descValue } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { noSuchTier } from "../../engine/difficulty.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/game.ts";
import { modifierItem } from "../../engine/modifier.ts";
import { dimensionParamConfig, numberItem } from "../../engine/params.ts";
import { dims, flag, num, paramsCodec } from "../../engine/params-codec.ts";
import { type GridCursor, newCursor } from "../../engine/pointer.ts";

// --- constants -------------------------------------------------------------

/** An empty grid cell. Upstream's is 127 with letter `i` stored as `i`; here a
 * grid stores letter `i` (`0..n-1`, the index clues and moves use) as `i + 1`,
 * so an empty cell is 0 as it is in every other note-taking game, which the
 * shared candidate walk and the cross-game hint guards read. */
export const EMPTY = 0;
/** A hidden edge clue (upstream `NO_NUMBER = -1`). */
export const NO_NUMBER = -1;

// --- clue / cube indexing (upstream CUBOID / HOR_CLUE / VER_CLUE macros) ----

/** Candidate-cube / pencil-mark index for letter `i` at cell `(x, y)`. */
export function cuboid(x: number, y: number, i: number, n: number, w: number): number {
  return i + x * n + y * n * w;
}
/** The pencil-mask bit for letter `i` (`0..n-1`). */
export function letterBit(i: number): number {
  return 1 << i;
}
/** `numbers` index of the row-`y` clue counting letter `i`. */
export function horClue(y: number, i: number, n: number): number {
  return i + y * n;
}
/** `numbers` index of the column-`x` clue counting letter `i`. The `numbers`
 * array is the `h·n` row clues followed by the `w·n` column clues. */
export function verClue(x: number, i: number, n: number, h: number): number {
  return i + (x + h) * n;
}

// --- params ----------------------------------------------------------------

export interface AbcdParams {
  w: number;
  h: number;
  /** Number of distinct letters (`A`…). */
  n: number;
  /** Disallow diagonally-adjacent identical letters. */
  diag: boolean;
  /** Generate an incomplete clue set (harder). Generation-time only — absent
   * from a shared game ID (`encodeParams(_, false)`). */
  removenums: boolean;
  /** `DIFF_EASY`, a board the three techniques finish, or
   * `DIFF_UNREASONABLE`, one with a single answer that they do not reach.
   * Generation-time only, as `removenums` is. */
  diff: number;
}

const board = (w: number, n: number, rules: Partial<AbcdParams> = {}): AbcdParams => ({
  w,
  h: w,
  n,
  diag: false,
  removenums: false,
  diff: DIFF_EASY,
  ...rules,
});

/** The sizes the menu offers at both tiers. */
const BOARDS: AbcdParams[] = [
  board(4, 4),
  board(5, 4),
  board(5, 4, { h: 7 }),
  board(6, 4, { h: 8 }),
];

/** One board for each thing that is neither a size nor a tier: clues hidden,
 * the rule against diagonal touching (which needs five letters, so nothing
 * but a preset reaches it from the menu), and three letters. */
const VARIANTS: AbcdParams[] = [
  board(5, 4, { removenums: true }),
  board(6, 5, { diag: true }),
  board(6, 3, { h: 9 }),
];

/** Every shape of board on the menu, at Easy: what a census of the three
 * techniques or of the hint walks. */
export const EASY_PRESETS: readonly AbcdParams[] = [...BOARDS, ...VARIANTS];

export function defaultParams(): AbcdParams {
  return board(5, 4);
}

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<AbcdParams>[] = [
  // A width or height under 2 could break the solver.
  ...dimensionParamConfig<AbcdParams>({
    doc: "Size of the grid in squares (excluding the size of the numbers on the edge). A large board takes longer to find, the more so with more letters, because each extra letter is another count every row and column has to satisfy: with three letters a board of about 130 squares comes in seconds, with four about 80, and from six letters up about 65. Long thin boards go much further, because a short row is almost settled by its own numbers. Past those sizes the first board can take a minute or two to appear, or not be found at all.",
    bounds: { min: 2 },
  }),
  numberItem<AbcdParams>("letters", "Letters", "n", {
    doc: "The amount of different letters that can appear in the puzzle. Without diagonal touching there must be at least 5.",
    // 2-letter puzzles are dull and even×even 2-letter grids have no unique
    // solution. The ceiling avoids clashing with midend hotkeys and fits the
    // keypad.
    bounds: { min: 3, max: 9 },
    label: { slot: "tail", words: (p) => `${p.n} letters` },
  }),
  searchTierItem(
    "diff",
    "An Easy puzzle can be finished by the rules alone: there is always a number that settles a letter or rules one out. An Unreasonable one has a single solution that the numbers do not lead to step by step, so somewhere you have to try a letter and see what follows, and the Hint button stops where the rules do.",
  ),
  {
    kw: "remove-clues",
    name: "Remove clues",
    type: "boolean",
    doc: "When enabled, some of the number clues are hidden: as many as can go while the puzzle still has one solution at its difficulty. An Easy puzzle stays one the rules alone finish, with less to read them from.",
    label: { slot: "tail", words: (p) => (p.removenums ? "clues hidden" : null) },
    get: (p) => p.removenums,
    set: (p, v) => {
      p.removenums = v;
    },
  },
  modifierItem<AbcdParams>({
    // The option is the inverse of the stored flag, as upstream's is.
    kw: "allow-diagonal-touching",
    name: "Allow diagonal touching",
    type: "boolean",
    when: false,
    words: "no diagonal",
    slot: "tail",
    rule: "identical letters cannot be diagonally adjacent either.",
    note: "Counter-intuitively this <em>raises</em> the size limit described above rather than lowering it: the extra restriction gives you more to reason from, so larger boards still work out to a single solution.",
    get: (p) => !p.diag,
    set: (p, v) => {
      p.diag = !v;
    },
  }),
];

export const menu: PresetBoards<AbcdParams> = { boards: BOARDS, variants: VARIANTS };

/** `WxHn<letters>[D][R][d<tier>]`: a missing height is the width, missing
 * digits are 0, and the clue removal and the tier are generator-only. The tier
 * comes last and upstream's IDs lack it: without one a board is Easy, the
 * only kind upstream deals. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  num(paramConfig, "n", "letters"),
  flag(paramConfig, "D", "allow-diagonal-touching", { means: false }),
  flag(paramConfig, "R", "remove-clues", { full: true }),
  searchTierSegment(paramConfig),
]);

/**
 * Why no Unreasonable board of these params exists, or `null`. Every fill of
 * every board of up to nine squares has been tried, at each number of letters
 * and under both rules: where the ladder stops short, a second answer fits
 * (`abcd-tier.test.ts` keeps three and four letters). Hidden clues are what
 * give such a board one answer the ladder misses.
 */
function unreasonableRefusal(p: AbcdParams): string | null {
  if (p.removenums || p.w * p.h > 9) return null;
  const tier = SEARCH_TIER_NAMES[DIFF_UNREASONABLE] as string;
  return noSuchTier(`${p.w}x${p.h} puzzle with every clue showing`, tier);
}

export function validateParams(p: AbcdParams, full: boolean): string | null {
  // Under 5 letters, diagonal mode can't avoid the no-touch rule in practice.
  if (p.n < 5 && p.diag)
    return "Letters must be at least 5 when diagonal touching is not allowed.";
  // A large board is dealt however long it takes. Generation keeps a random
  // fill only where the solver finds its clues have one answer, and that
  // falls off fast as the board grows and as letters are added, but it does
  // not reach none: measured 2026-10-21 under the deal's deadline, an Easy
  // 10x10 of 4 letters was found on 5 deals of 12, where 454,144 tries had
  // found none, and Unreasonable took 12 s at 12x12 with 3 letters and 57 s
  // at 9x9 with 8 and no diagonal touching.
  if (full && p.diff === DIFF_UNREASONABLE) return unreasonableRefusal(p);
  return null;
}

// --- desc codec ------------------------------------------------------------

/**
 * The `(w+h)·n` clue numbers in `numbers`-array order, each followed by a comma,
 * a bare `-` for a hidden clue. As upstream's `validate_desc`, each number must
 * fit its axis (a row clue `≤ 1 + w/2`, a column clue `≤ 1 + h/2`).
 */
function parseDesc(p: AbcdParams, desc: string): DescParse<Int32Array> {
  const { w, h, n } = p;
  return readDesc(desc, (r) => {
    const numbers = new Int32Array((w + h) * n);
    for (let i = 0; i < numbers.length; i++) {
      // A clue which can't possibly fit its line is rejected; `i < h·n` is a row.
      const max = 1 + (((i < h * n ? w : h) / 2) | 0);
      numbers[i] = r.accept("-") ? NO_NUMBER : r.int(0, max);
      r.expect(",");
    }
    r.end();
    return numbers;
  });
}

// --- state -----------------------------------------------------------------

export interface AbcdState {
  params: AbcdParams;
  /** `w·h` entered letters, letter `i` as `i + 1`, or {@link EMPTY}; cloned
   * per move. */
  grid: Int8Array;
  /** `w·h` pencil marks, letter `i` at {@link letterBit}; cloned per move. */
  pencil: Int32Array;
  /** `(w+h)·n` immutable edge clues (`NO_NUMBER` for hidden); shared by
   * reference across every clone (never mutated after `newState`). */
  readonly numbers: Int32Array;
}

export function newState(p: AbcdParams, desc: string): AbcdState {
  const a = p.w * p.h;
  return {
    params: p,
    grid: new Int8Array(a),
    pencil: new Int32Array(a), // pencil marks start empty
    numbers: descValue(parseDesc(p, desc)),
  };
}

export function cloneState(s: AbcdState): AbcdState {
  return {
    params: s.params,
    grid: s.grid.slice(),
    pencil: s.pencil.slice(),
    numbers: s.numbers, // immutable, shared
  };
}

// --- win condition (abcd_validate_puzzle == 0) -----------------------------

/** Is the board solved: every clue met exactly, no two identical letters
 * touching, and every cell filled? */
export function isCompleted(state: AbcdState): boolean {
  return validatePuzzle(state.params, state.grid, state.numbers) === 0;
}

/**
 * The three-valued board validator (upstream `abcd_validate_puzzle`):
 * `-1` a definite contradiction (a clue overcrowded, or an adjacency
 * violation), `1` no contradiction but not yet complete, `0` solved.
 * Shared by the win check and the solver's final classification.
 */
export function validatePuzzle(
  p: AbcdParams,
  grid: Int8Array,
  numbers: Int32Array,
): -1 | 0 | 1 {
  const { w, h, diag } = p;

  // Clue violations: an overcrowded clue in either direction is a contradiction.
  const rows = validateClues(p, grid, numbers, true);
  if (rows === -1) return -1;
  const cols = validateClues(p, grid, numbers, false);
  if (cols === -1) return -1;

  // Adjacency violations.
  if (!validateAdjacency(grid, w, 0, 0, w - 1, h, 1, 0)) return -1;
  if (!validateAdjacency(grid, w, 0, 0, w, h - 1, 0, 1)) return -1;
  if (diag && !validateAdjacency(grid, w, 0, 0, w - 1, h - 1, 1, 1)) return -1;
  if (diag && !validateAdjacency(grid, w, 0, 1, w - 1, h, 1, -1)) return -1;

  // No contradiction, but a clue is still unsatisfied.
  if (rows === 1 || cols === 1) return 1;

  // Finally, every square must be entered.
  for (let i = 0; i < w * h; i++) if (grid[i] === EMPTY) return 1;
  return 0;
}

/** Upstream `abcd_validate_adjacency`: false if any cell in the rectangle
 * `[sx,ex)×[sy,ey)` shares its letter with cell `(x+dx, y+dy)`. */
function validateAdjacency(
  grid: Int8Array,
  w: number,
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  dx: number,
  dy: number,
): boolean {
  for (let x = sx; x < ex; x++) {
    for (let y = sy; y < ey; y++) {
      const g = grid[y * w + x];
      if (g !== EMPTY && g === grid[(y + dy) * w + (x + dx)]) return false;
    }
  }
  return true;
}

/** Upstream `abcd_validate_clues`: 1 if a clue is unsatisfied, -1 if a clue is
 * overcrowded, 0 if all satisfied — across every row (`horizontal`) or column. */
function validateClues(
  p: AbcdParams,
  grid: Int8Array,
  numbers: Int32Array,
  horizontal: boolean,
): -1 | 0 | 1 {
  const { w, h, n } = p;
  const amx = horizontal ? h : w;
  const bmx = horizontal ? w : h;
  let unsatisfied = false;
  for (let a = 0; a < amx; a++) {
    for (let i = 0; i < n; i++) {
      const clue = numbers[horizontal ? horClue(a, i, n) : verClue(a, i, n, h)];
      if (clue === NO_NUMBER) continue;
      let found = 0;
      for (let b = 0; b < bmx; b++) {
        if (grid[horizontal ? a * w + b : b * w + a] === i + 1) found++;
      }
      if (found > clue) return -1;
      if (found < clue) unsatisfied = true;
    }
  }
  return unsatisfied ? 1 : 0;
}

// --- moves -----------------------------------------------------------------

/** A move names letters by index (`0..n-1`), never by their grid encoding: the
 * move log is what a save replays. */
export type AbcdMove =
  /** Enter (`letter` = index) or clear (`letter` = null) an ink letter at `(x,y)`. */
  | { type: "enter"; x: number; y: number; letter: number | null }
  /** Toggle pencil mark `letter` at `(x,y)`. */
  | { type: "pencil"; x: number; y: number; letter: number }
  /** Fill every note-less empty cell with every letter — the first press of the
   * adaptive mark-all (the `M` key), shared with the Latin family. */
  | { type: "pencilAll" }
  /** Strike the listed candidate marks atomically — the adaptive mark-all's
   * subsequent presses (obvious eliminations only, never a re-fill), and a
   * hint's strikes. */
  | { type: "pencilStrike"; marks: { x: number; y: number; letter: number }[] }
  /** Write the listed candidate marks: a hint putting a note-less cell's
   * candidates on the board before a deduction reads them. */
  | { type: "pencilAdd"; marks: { x: number; y: number; letter: number }[] }
  /** Auto-solve: overwrite the grid with the canonical solution. */
  | { type: "solve"; grid: number[] };

// --- ui --------------------------------------------------------------------

export interface AbcdUi {
  cursor: GridCursor;
  /** The cursor is in pencil-mark mode. */
  pencilMode: boolean;
  /** The cursor came from the keyboard (so it survives an entry). */
  cursorFromKeyboard: boolean;
  /** Preference (default on, the collection's convention): right-click toggles
   * a *sticky* pencil mode, with an on-screen indicator, that stays on until
   * right-clicked again, rather than upstream's per-cell pencil select. */
  pencilSticky: boolean;
  /** Preference (default on): keep the mouse highlight after a pencil change. */
  pencilKeepHighlight: boolean;
  /** Preference: how a hint pencils (`CandidateReading`). */
  candidateReading: CandidateReading;
}

export function newUi(_state: AbcdState): AbcdUi {
  return {
    cursor: newCursor(),
    pencilMode: false,
    cursorFromKeyboard: false,
    pencilSticky: true,
    pencilKeepHighlight: true,
    candidateReading: DEFAULT_CANDIDATE_READING,
  };
}

export function status(s: AbcdState): "solved" | "ongoing" {
  return isCompleted(s) ? "solved" : "ongoing";
}

/**
 * ASCII rendering for the share-as-text panel (upstream `game_text_format`):
 * the `A…` letters in the top-left gutter, the edge clues on the top and left
 * borders, an outlined `w × h` grid of entered letters (`.` for empty), and a
 * `+`/`*` corner cue for the no-diagonal-touch mode. Returns `null` when a
 * clue could be two digits (`w ≥ 19` or `h ≥ 19`), which is upstream's
 * `game_can_format_as_text_now` (docs/mechanics.md § "Capability flags").
 */
export function textFormat(state: AbcdState): string | null {
  const { w, h, n } = state.params;
  if (w >= 19 || h >= 19) return null;
  const { grid, numbers } = state;

  const rw = (w + n) * 2 + 1; // row width, incl. the trailing newline column
  const rh = h + n + 2;
  const buf = new Array<string>(rw * rh).fill(" ");
  for (let i = 0; i < rh; i++) buf[rw * (i + 1) - 1] = "\n";

  const digit = (num: number): string => String(num);

  // Letters in the top-left corner.
  for (let i = 0; i < n; i++) {
    const c = String.fromCharCode(65 + i);
    buf[rw * (n - 1) + i * 2] = c; // horizontal
    buf[rw * i + (n - 1) * 2] = c; // vertical
  }
  // Top (column) clues.
  for (let x = 0; x < w; x++)
    for (let j = 0; j < n; j++) {
      const num = numbers[verClue(x, j, n, h)];
      if (num !== NO_NUMBER) buf[rw * j + n * 2 + x * 2] = digit(num);
    }
  // Left (row) clues.
  for (let y = 0; y < h; y++)
    for (let j = 0; j < n; j++) {
      const num = numbers[horClue(y, j, n)];
      if (num !== NO_NUMBER) buf[rw * (y + n + 1) + j * 2] = digit(num);
    }
  // Outline corners (a subtle diag-vs-orthogonal cue).
  const corner = state.params.diag ? "*" : "+";
  buf[rw * n + n * 2 - 1] = corner; // top-left
  buf[rw * (n + 1) - 2] = corner; // top-right
  buf[rw * (n + h + 1) + n * 2 - 1] = corner; // bottom-left
  buf[rw * (n + h + 2) - 2] = corner; // bottom-right
  // Horizontal borders.
  for (let i = 0; i < w * 2 - 1; i++) {
    buf[rw * n + n * 2 + i] = "-"; // top
    buf[rw * (n + h + 1) + n * 2 + i] = "-"; // bottom
  }
  // Vertical borders.
  for (let y = 0; y < h; y++) {
    buf[rw * (n + y + 1) + n * 2 - 1] = "|"; // left
    buf[rw * (n + y + 2) - 2] = "|"; // right
  }
  // The entered letters.
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const c = grid[y * w + x];
      buf[rw * (n + y + 1) + (n + x) * 2] =
        c !== EMPTY ? String.fromCharCode(64 + c) : ".";
    }

  return buf.join("");
}
