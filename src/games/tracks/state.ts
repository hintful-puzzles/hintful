/**
 * Tracks (Train Tracks) state, params, desc codec and the shared-edge board
 * model: the state half of the port of `tracks.c`.
 *
 * Lay a single continuous train track from an entrance on the left edge to an
 * exit on the bottom edge of a `w × h` grid, using only straight and curved
 * rails that neither cross nor form a loop, so every row/column clue counts
 * the number of track-bearing cells in it.
 *
 * The per-cell flag word keeps upstream's exact bit layout (an `Int32Array`
 * of `sflags`), so the solver's bit arithmetic is ported verbatim. Edges are
 * shared between neighboring cells: setting one cell's edge mirrors the bit
 * onto the adjacent cell, so the two never disagree.
 */

import { gridText } from "../../engine/board/grid-text.ts";
import {
  D,
  dirCount,
  dirX,
  dirY,
  L,
  opposite,
  R,
  U,
} from "../../engine/board/square-edges.ts";
import {
  DESC_TOO_LONG,
  type DescParse,
  descBadCharacter,
  descValue,
  puzzleDescError,
} from "../../engine/contract/desc-error.ts";
import { difficultyItem, noSuchTier } from "../../engine/contract/difficulty.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/contract/game.ts";
import {
  c2nUpper,
  n2cUpper,
  UPPER_ALPHABET_SIZE,
} from "../../engine/game-id/desc-alphabet.ts";
import { readDesc } from "../../engine/game-id/desc-reader.ts";
import { dimensionParamConfig } from "../../engine/game-id/params.ts";
import { choice, dims, flag, paramsCodec } from "../../engine/game-id/params-codec.ts";
import type { GridCursor, GridDrag } from "../../engine/input/pointer.ts";
import * as tracks from "../../generated/games/tracks/tracks.compiled.ts";

// --- difficulty (upstream's Easy, Tricky, Hard; named by the description) ---
export const DIFF_EASY = tracks.TIER.easy;
export const DIFF_NORMAL = tracks.TIER.normal;
export const DIFF_TRICKY = tracks.TIER.tricky;
export const DIFF_COUNT = tracks.tiers.length;
const DIFF_NAMES: readonly string[] = tracks.tiers;
const DIFF_CHARS = "eth"; // ENCODE chars, indexed by difficulty

// --- directions (`engine/board/square-edges.ts`'s bits, upstream's R/U/L/D) ------
export const ALLDIR = 15;
export const DIRS = [U, D, L, R] as const; // upstream dirs_const order

// --- square + edge flag bits (upstream layout) ----------------------------
export const S_TRACK = 1;
export const S_NOTRACK = 2;
export const S_CLUE = 8;
export const S_MARK = 16;
export const S_TRACK_SHIFT = 16;
export const S_NOTRACK_SHIFT = 20;

export const E_TRACK = 1;
export const E_NOTRACK = 2;

// --- types ----------------------------------------------------------------

export interface TracksParams {
  w: number;
  h: number;
  diff: number;
  /** Disallow consecutive 1-clues (upstream `single_ones`, default true). */
  singleOnes: boolean;
}

/** The shared, immutable clue-number + station data (upstream `struct
 * numbers`). `numbers` holds the `w` column clues then the `h` row clues;
 * `colS` is the exit column (bottom edge), `rowS` the entrance row (left
 * edge). */
export interface TracksNumbers {
  readonly numbers: Int32Array; // length w + h
  readonly rowS: number;
  readonly colS: number;
}

export interface TracksState {
  readonly w: number;
  readonly h: number;
  readonly diff: number;
  readonly singleOnes: boolean;
  /** Per-cell flag word, upstream layout; cloned per move. */
  readonly sflags: Int32Array;
  /** Shared clue numbers + stations. */
  readonly numbers: TracksNumbers;
}

/** One flag change: set/clear a track/no-track flag on a square or one of its
 * edges. A single drag or solve produces a list of these. */
export interface TracksOp {
  kind: "square" | "edge";
  x: number;
  y: number;
  /** For an edge op, the direction (R/U/L/D); ignored for a square op. */
  dir?: number;
  track: boolean; // true → track (S_TRACK/E_TRACK); false → no-track
  set: boolean; // true → set the flag; false → clear it
}

export type TracksMove = { ops: TracksOp[]; solve?: boolean };

export interface TracksUi {
  /** The drag's anchor and current cell, in grid coordinates. `live` is "a
   * press is down"; {@link TracksUi.painting} is the narrower thing Tracks
   * cares about. */
  drag: GridDrag;
  /** Whether the drag has **aligned to an axis and is laying track**. A press
   * starts a drag that is live but not yet painting: only once the pointer
   * reaches the anchor's own row or column does the paint begin. Not a second
   * spelling of `drag.live`. */
  painting: boolean;
  clearing: boolean;
  notrack: boolean;
  /** Whether the press went down in a square that carries track, so a left
   * drag from it lays segments and not square marks. */
  rails: boolean;
  clickx: number;
  clicky: number;
  /** Keyboard cursor over the half-size grid (0..2w, 0..2h). */
  cursor: GridCursor;
}

// --- a mutable working board (the solver/generator/executeMove subject) ----

/** The mutable board the solver and generator work on: upstream mutates the
 * `game_state` in place, so a close transliteration keeps a mutable holder. */
export interface Board {
  w: number;
  h: number;
  sflags: Int32Array;
  numbers: Int32Array; // length w + h
  rowS: number;
  colS: number;
}

export function blankBoard(w: number, h: number): Board {
  return {
    w,
    h,
    sflags: new Int32Array(w * h),
    numbers: new Int32Array(w + h),
    rowS: -1,
    colS: -1,
  };
}

/** A mutable working copy of a state's board (for the solver / findMistakes). */
export function stateToBoard(s: TracksState): Board {
  return {
    w: s.w,
    h: s.h,
    sflags: Int32Array.from(s.sflags),
    numbers: Int32Array.from(s.numbers.numbers),
    rowS: s.numbers.rowS,
    colS: s.numbers.colS,
  };
}

export const inGrid = (b: { w: number; h: number }, x: number, y: number): boolean =>
  x >= 0 && x < b.w && y >= 0 && y < b.h;

// --- shared-edge helpers (upstream S_E_*) ---------------------------------

const edgeShift = (eflag: number): number =>
  eflag === E_TRACK ? S_TRACK_SHIFT : S_NOTRACK_SHIFT;

/** The four directions in which a particular edge flag is set around a
 * square. */
export function sEDirs(b: Board, x: number, y: number, eflag: number): number {
  return (b.sflags[y * b.w + x] >> edgeShift(eflag)) & ALLDIR;
}

/** Count of a particular edge flag around a square. */
export function sECount(b: Board, x: number, y: number, eflag: number): number {
  return dirCount(sEDirs(b, x, y, eflag));
}

/** The two flags (E_TRACK / E_NOTRACK) set on a specific edge of a square. */
export function sEFlags(
  b: Pick<Board, "w" | "sflags">,
  x: number,
  y: number,
  d: number,
): number {
  const f = b.sflags[y * b.w + x];
  const t = f & (d << S_TRACK_SHIFT);
  const nt = f & (d << S_NOTRACK_SHIFT);
  return (t ? E_TRACK : 0) | (nt ? E_NOTRACK : 0);
}

/** Set a flag on a given edge of a square (and its shared neighbor edge). */
export function sESet(b: Board, x: number, y: number, d: number, eflag: number): void {
  const shift = edgeShift(eflag);
  b.sflags[y * b.w + x] |= d << shift;
  const ax = x + dirX(d);
  const ay = y + dirY(d);
  if (inGrid(b, ax, ay)) b.sflags[ay * b.w + ax] |= opposite(d) << shift;
}

/** Clear a flag on a given edge of a square (and its shared neighbor edge). */
export function sEClear(
  b: Board,
  x: number,
  y: number,
  d: number,
  eflag: number,
): void {
  const shift = edgeShift(eflag);
  b.sflags[y * b.w + x] &= ~(d << shift);
  const ax = x + dirX(d);
  const ay = y + dirY(d);
  if (inGrid(b, ax, ay)) b.sflags[ay * b.w + ax] &= ~(opposite(d) << shift);
}

// --- params ---------------------------------------------------------------

/** Five sizes, Hard at 10x10 and 15x15 only: every cell deals in well under a
 * second, and the cut is what keeps the list to twelve. */
export const menu: PresetBoards<TracksParams> = {
  boards: [
    [8, 8],
    [8, 10],
    [10, 10],
    [10, 15],
    [15, 15],
  ].map(([w, h]) => ({ w, h, diff: DIFF_EASY, singleOnes: true })),
  tiers: ({ w, h }) => (w === h && w >= 10 ? null : [DIFF_EASY, DIFF_NORMAL]),
};

export function defaultParams(): TracksParams {
  return { w: 8, h: 8, diff: DIFF_NORMAL, singleOnes: true };
}

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<TracksParams>[] = [
  ...dimensionParamConfig<TracksParams>({
    doc: "Size of the grid in squares. A 4x4 has only Easy puzzles.",
    // Generating anything under 4x4 runs into trouble (upstream).
    bounds: { min: 4 },
  }),
  difficultyItem(DIFF_NAMES, "diff"),
  {
    kw: "disallow-consecutive-1-clues",
    name: "Disallow consecutive 1 clues",
    type: "boolean",
    doc: "Read the clues along the top from left to right and then down the right-hand side. With this on, no two clues next to each other in that run are both 1, and neither the first nor the last of them is a 1. Every clue is at least 1 either way.",
    label: {
      slot: "tail",
      words: (p) => (p.singleOnes ? null : "allow adjacent 1’s"),
    },
    get: (p) => p.singleOnes,
    set: (p, v) => {
      p.singleOnes = v;
    },
  },
];

/** `WxH`, plus the generator-only difficulty letter. The `o` letter is written
 * when consecutive 1 clues are *allowed*, so its absence means "disallow". */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
  flag(paramConfig, "o", "disallow-consecutive-1-clues", {
    full: true,
    means: false,
  }),
]);

export function validateParams(p: TracksParams, full: boolean): string | null {
  // Measured 2026-10-05: none in 50,000 boards built at each tier above Easy.
  if (full && p.w === 4 && p.h === 4 && p.diff > DIFF_EASY)
    return noSuchTier("4x4 puzzle", DIFF_NAMES[p.diff]);
  return null;
}

// --- desc codec -----------------------------------------------------------
// Grid: run-length `a`–`z` gaps of 1–26 squares + one hex char per clue
// square (its two E_TRACK direction flags). Then a
// `,`-separated `S?<n>` list of the w column clues and h row clues.

const isRunLetter = (c: string): boolean => c >= "a" && c <= "z";

/** The direction flags a clue square's character stands for, `0`–`F`. */
function clueNibble(c: string): number | null {
  const nibble = c2nUpper(c);
  return nibble !== null && nibble < 16 ? nibble : null;
}

const ONE_ENTRANCE_AND_EXIT = puzzleDescError(
  "This game ID needs exactly one entrance and one exit for its track.",
);

const TRACK_OFF_THE_GRID = puzzleDescError(
  "This game ID has track leaving the grid somewhere other than A or B.",
);

function parseDesc(p: TracksParams, desc: string): DescParse<Board> {
  const { w, h } = p;
  const area = w * h;
  return readDesc(desc, (r) => {
    const b = blankBoard(w, h);
    let i = 0;
    while (i < area) {
      if (r.peekIs(isRunLetter)) {
        i += r.char().charCodeAt(0) - 96;
        if (i > area) r.fail(DESC_TOO_LONG);
        continue;
      }
      const c = r.char();
      const f = clueNibble(c) ?? r.fail(descBadCharacter(c));
      if (dirCount(f) !== 2)
        r.fail(
          puzzleDescError(
            "This game ID has a clue square whose track doesn't join exactly two of its sides.",
          ),
        );
      b.sflags[i] |= S_TRACK | S_CLUE;
      for (const d of DIRS) if (f & d) sESet(b, i % w, Math.floor(i / w), d, E_TRACK);
      i++;
    }
    for (let n = 0; n < w + h; n++) {
      r.expect(",");
      if (r.accept("S")) {
        if (n < w) {
          if (b.colS !== -1) r.fail(ONE_ENTRANCE_AND_EXIT);
          b.colS = n;
        } else {
          if (b.rowS !== -1) r.fail(ONE_ENTRANCE_AND_EXIT);
          b.rowS = n - w;
        }
      }
      // A column's count is of its h squares, a row's of its w.
      b.numbers[n] = r.int(0, n < w ? h : w);
    }
    r.end();
    if (b.colS === -1 || b.rowS === -1) r.fail(ONE_ENTRANCE_AND_EXIT);
    // The track leaves the grid at A and B alone; a rail off the rim anywhere
    // else is one no answer can hold, and the description, which has no edge
    // there, would read the square as finished without it.
    for (let i = 0; i < area; i++) {
      if (!(b.sflags[i] & S_CLUE)) continue;
      const x = i % w;
      const y = Math.floor(i / w);
      for (const d of DIRS) {
        if (!(sEFlags(b, x, y, d) & E_TRACK) || inGrid(b, x + dirX(d), y + dirY(d)))
          continue;
        const atA = x === 0 && y === b.rowS && d === L;
        const atB = y === h - 1 && x === b.colS && d === D;
        if (!atA && !atB) r.fail(TRACK_OFF_THE_GRID);
      }
    }
    return b;
  });
}

/** Encode a board's clue squares + numbers as the upstream desc. */
export function encodeDesc(b: Board): string {
  const { w, h } = b;
  let desc = "";
  for (let i = 0; i < w * h; i++) {
    if (b.sflags[i] & S_CLUE) {
      desc += n2cUpper(sEDirs(b, i % w, Math.floor(i / w), E_TRACK));
      continue;
    }
    // Extend the current run letter, or start a new run at `a`.
    const last = desc[desc.length - 1];
    if (last >= "a" && last < "z") {
      desc = desc.slice(0, -1) + String.fromCharCode(last.charCodeAt(0) + 1);
    } else {
      desc += "a";
    }
  }
  for (let x = 0; x < w; x++) {
    desc += `,${x === b.colS ? "S" : ""}${b.numbers[x]}`;
  }
  for (let y = 0; y < h; y++) {
    desc += `,${y === b.rowS ? "S" : ""}${b.numbers[y + w]}`;
  }
  return desc;
}

export function newState(p: TracksParams, desc: string): TracksState {
  const b = descValue(parseDesc(p, desc));
  return {
    w: p.w,
    h: p.h,
    diff: p.diff,
    singleOnes: p.singleOnes,
    sflags: b.sflags,
    numbers: { numbers: b.numbers, rowS: b.rowS, colS: b.colS },
  };
}

// --- the completion flash's route (upstream set_flash_data) ---------------

/**
 * How many squares along the track each square is, counted from the entrance,
 * and -1 off it, so the completion flash can travel the route.
 *
 * Read off the laid track when it is wanted, where upstream scales the count
 * into eight bits of the flag word as the board completes: that field holds
 * 256 places, and a longer track had none to tell its squares apart by. On a
 * board that is not solved the walk stops where the track from the entrance
 * does.
 */
export function trackOrder(b: Board): Int32Array {
  const { w } = b;
  const order = new Int32Array(w * b.h).fill(-1);
  let x = 0;
  let y = b.rowS;
  let d = R;
  for (let n = 0; inGrid(b, x, y) && order[y * w + x] < 0; n++) {
    order[y * w + x] = n;
    d = opposite(d); // the direction we just arrived from
    d = sEDirs(b, x, y, E_TRACK) & ~d; // the other track from here
    if (dirCount(d) !== 1) break;
    x += dirX(d);
    y += dirY(d);
  }
  return order;
}

// --- text format (upstream game_text_format) ------------------------------

export function textFormat(s: TracksState): string {
  const b = stateToBoard(s);
  const { w, h } = b;
  let out = "  ";
  // A count is bounded only by the grid, and past `Z` the alphabet has no
  // character for it, so the number is written out (upstream wrote the
  // punctuation after `Z`).
  const countChar = (n: number): string =>
    n < UPPER_ALPHABET_SIZE ? n2cUpper(n) : String(n);
  for (let x = 0; x < w; x++) out += `${countChar(b.numbers[x])} `;
  out += `\n +${"-".repeat(w * 2 - 1)}+\n`;
  out += gridText(
    w,
    h,
    (x, y) => {
      const f = sEDirs(b, x, y, E_TRACK);
      if (b.sflags[y * w + x] & S_CLUE) return "C";
      if (f === (L | U) || f === (R | D)) return "/";
      if (f === (L | D) || f === (R | U)) return "\\";
      if (f === (U | D)) return "|";
      if (f === (R | L)) return "-";
      return b.sflags[y * w + x] & S_NOTRACK ? "x" : " ";
    },
    {
      across: (x, y) => (sEDirs(b, x, y, E_TRACK) & R ? "-" : " "),
      between: {
        down: (x, y) => (sEDirs(b, x, y, E_TRACK) & D ? "|" : " "),
        middle: " ",
      },
      // The row the track enters by is marked A, and each row's count follows it.
      ends: (y, between) =>
        between
          ? [" |", "|"]
          : [y === b.rowS ? "A-" : " |", `|${countChar(b.numbers[w + y])}`],
    },
  );
  out += " +";
  for (let x = 0; x < w * 2 - 1; x++) out += x === b.colS * 2 ? "|" : "-";
  out += "+\n  ";
  for (let x = 0; x < w * 2 - 1; x++) out += x === b.colS * 2 ? "B" : " ";
  out += "\n";
  return out;
}
