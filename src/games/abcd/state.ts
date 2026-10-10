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
import { noSuchTier, tooRareToDeal } from "../../engine/difficulty.ts";
import type { ParamConfigItem, PresetMenu } from "../../engine/game.ts";
import { modifierItem } from "../../engine/modifier.ts";
import { dimensionParamConfig, numberItem } from "../../engine/params.ts";
import { dims, flag, num, paramsCodec } from "../../engine/params-codec.ts";
import { type GridCursor, newCursor } from "../../engine/pointer.ts";
import { presetGrid } from "../../engine/preset-grid.ts";

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
const BOARDS: AbcdParams[] = [board(4, 4), board(5, 4), board(6, 4), board(7, 4)];

/** One board for each thing that is neither a size nor a tier: clues hidden,
 * the rule against diagonal touching (which needs five letters, so nothing
 * but a preset reaches it from the menu), and three letters. */
const VARIANTS: AbcdParams[] = [
  board(5, 4, { removenums: true }),
  board(6, 5, { diag: true }),
  board(7, 3),
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
    doc: "Size of the grid in squares (excluding the size of the numbers on the edge). How large a board can be depends on the number of letters, because each extra letter is another count every row and column has to satisfy: with three letters a board can reach about 130 squares, with four about 80, and from six letters up about 65. Long thin boards go much further, because a short row is almost settled by its own numbers, so anything up to about 160 squares is allowed when one side is under 6. Past those limits no puzzle with a single solution is likely to exist at all, so the game says so rather than searching for one.",
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

export function presets(): PresetMenu<AbcdParams> {
  return {
    title: "ABCD",
    ...presetGrid(paramConfig, BOARDS, { variants: VARIANTS }),
  };
}

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
 * The largest board area that generates in a tolerable time, per letter count
 * and diagonal mode, for a board whose *shorter* side is at least 6.
 *
 * Generation fills the grid at random and keeps the fill only if the solver
 * finds its edge clues uniquely solvable, so the acceptance rate — not any
 * bound in the algorithm — decides whether a board exists to be found. It falls
 * off a cliff: 9x9 n4 accepts 1 attempt in 18,586 (~1.2 s), while 10x10 n4
 * accepted **none in 454,144** (~30 s of trying). Upstream's author hit the same
 * wall and left it as a `TODO`, never having produced a 10x10 n4 board.
 *
 * The numbers are measured, not derived (the 139-configuration sweep is in
 * `bound-abcd-generable-sizes`' design), and the two obvious closed forms are
 * both WRONG:
 *
 *   - **Area alone cannot express it.** 10x10 n4 never generates; 2x50 n4, the
 *     same area, generates in 195 ms. Which is why the bound below applies only
 *     when both sides are >= 6, with a single generous area cap for the rest.
 *   - **Clue density cannot either.** 5x40 n4 and 8x10 n4 have the *same*
 *     `n(w+h)/wh`, and one is 859 ms while the other never generates at all.
 *
 * More letters make a board harder (each one is another count to satisfy), and
 * `diag` makes it markedly EASIER despite being an extra restriction: a more
 * constrained board is more deducible, so the solver reaches a unique solution
 * more often. 9x9 n5 never generates; with `diag` it takes 34 ms.
 *
 * Keyed `n * 2 + (diag ? 1 : 0)`; `diag` requires n >= 5 above.
 */
const MAX_GENERABLE_AREA = new Map<number, number>([
  [3 * 2, 130], // 11x11 296 ms, 10x12 965 ms | 12x12 6.0 s, 9x20 never
  [4 * 2, 82], //  9x9 1.2 s, 8x10 859 ms     | 6x14 2.9 s, 9x10 5.0 s, 10x10 never
  [5 * 2, 74], //  8x9 2.0 s, 8x8 286 ms      | 7x11 5.0 s, 8x10 never, 9x9 30 s
  [6 * 2, 68], //  8x8 500 ms                 | 6x12 5.0 s, 8x9 7.5 s, 9x9 never
  [7 * 2, 68], //  8x8 667 ms                 | 8x9 never
  [8 * 2, 68], //  8x8 581 ms                 | 8x9 7.5 s
  [9 * 2, 68], //  8x8 489 ms                 | 8x9 15 s
  [5 * 2 + 1, 110], // 10x10 735 ms           | 11x11 10 s
  [6 * 2 + 1, 90], //  9x9 2.0 s              | 10x10 never
  [7 * 2 + 1, 70], //  8x8 102 ms             | 9x9 5.0 s, 10x10 never
  [8 * 2 + 1, 70], //  8x8 104 ms             | 9x9 15 s
  [9 * 2 + 1, 70], //  8x8 77 ms              | 9x9 never
]);

/** Below this shorter side, a board is bounded by area alone. A short line is
 * nearly pinned by its own clues, so thin boards stay easy far past the area
 * where a squarer one dies: 2x50 n4 is 195 ms and 3x30 n4 is 199 ms, where
 * 10x10 n4 and 9x10 n4 are hopeless. 150 is the largest thin area measured
 * generable (5x30 n3, 2.5 s); 5x40 n4 at 200 never generates. */
const THIN_SIDE = 6;
const MAX_THIN_AREA = 160;

/**
 * The largest area an Unreasonable board is dealt at in about a second, keyed
 * as {@link MAX_GENERABLE_AREA} is. Its own table, since what bounds it is
 * different: a fill that the ladder stops short on is common at every size,
 * and what grows is the cost of the search that tells its one answer from
 * several, and the share with several. So it is tighter than the Easy bound
 * for three and four letters and looser nowhere, and a thin board is no
 * exception to it: with many letters a thin board is the slower one.
 *
 * Measured 2026-10-10, mean time for a board with every clue showing, at the
 * bound | past it. With clues hidden a deal is quicker, 0.6 s at the most.
 */
const MAX_UNREASONABLE_AREA = new Map<number, number>([
  [3 * 2, 100], // 10x10 1.2 s, 3x33 0.9 s  | 10x11 1.5 s, 3x40 none in 12 s
  [4 * 2, 64], //  8x8 1.0 s, 3x21 0.7 s    | 8x9 2.4 s, 4x20 4.0 s
  [5 * 2, 56], //  7x8 0.5 s, 5x11 0.4 s    | 8x8 5.0 s
  [6 * 2, 56], //  7x8 0.7 s, 4x14 0.7 s    | 8x8 3.8 s, 3x20 6.0 s
  [7 * 2, 56], //  7x8 0.6 s, 2x28 0.8 s
  [8 * 2, 56], //  7x8 1.0 s
  [9 * 2, 56], //  7x8 0.7 s, 4x14 1.0 s    | 8x8 3.8 s
  [5 * 2 + 1, 81], // 9x9 0.4 s             | 9x10 2.0 s, 10x10 4.0 s
  [6 * 2 + 1, 72], // 8x9 1.5 s, 8x8 0.2 s  | 9x9 6.0 s
  [7 * 2 + 1, 64], // 8x8 0.9 s             | 8x9 2.4 s
  [8 * 2 + 1, 64], // 8x8 0.8 s             | 8x9 12 s
  [9 * 2 + 1, 64], // 8x8 0.7 s             | 8x9 12 s
]);

/** A thin board under the rule against diagonal touching was timed as far as
 * this area, where the slowest took 0.2 s (4x14, seven letters). */
const MAX_THIN_DIAGONAL_AREA = 56;

/** Why no Unreasonable board of these params is dealt, or `null`. */
function unreasonableRefusal(p: AbcdParams, area: number): string | null {
  const tier = SEARCH_TIER_NAMES[DIFF_UNREASONABLE] as string;
  const short = Math.min(p.w, p.h);
  if (!p.removenums) {
    // Every fill of every board of up to nine squares has been tried, at each
    // number of letters and under both rules: where the ladder stops short, a
    // second answer fits (`abcd-tier.test.ts` keeps three and four letters).
    // Hidden clues are what give such a board one answer the ladder misses.
    if (area <= 9)
      return noSuchTier(`${p.w}x${p.h} puzzle with every clue showing`, tier);
    // None came of 240,000 fills at eight lengths from 15 to 28.
    if (p.diag && short === 2)
      return tooRareToDeal(
        "puzzles two squares wide with no diagonal touching and every clue showing",
        tier,
      );
  }
  const table = MAX_UNREASONABLE_AREA.get(p.n * 2 + (p.diag ? 1 : 0)) ?? 0;
  const max =
    p.diag && short < THIN_SIDE ? Math.min(table, MAX_THIN_DIAGONAL_AREA) : table;
  return area > max
    ? `${p.n} letters have no ${tier} ABCD puzzle on a board this big; keep the area to ${max} squares at most, or use fewer letters.`
    : null;
}

export function validateParams(p: AbcdParams, full: boolean): string | null {
  // Under 5 letters, diagonal mode can't avoid the no-touch rule in practice.
  if (p.n < 5 && p.diag)
    return "Letters must be at least 5 when diagonal touching is not allowed.";
  // Generation only: a shared game ID or a saved game is handed over rather
  // than searched for, so a described board outside the bound still opens.
  if (full) {
    const area = p.w * p.h;
    if (p.diff === DIFF_UNREASONABLE) return unreasonableRefusal(p, area);
    const thin = Math.min(p.w, p.h) < THIN_SIDE;
    const max = thin
      ? MAX_THIN_AREA
      : (MAX_GENERABLE_AREA.get(p.n * 2 + (p.diag ? 1 : 0)) ?? 0);
    if (area > max) {
      return thin
        ? `A board this long has no ABCD puzzle to find; keep the area under ${max} squares.`
        : `${p.n} letters have no ABCD puzzle on a board this big; keep the area under ${max} squares, or use fewer letters.`;
    }
  }
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
 * `game_can_format_as_text_now` (docs/games/mechanics.md § "Capability flags").
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
