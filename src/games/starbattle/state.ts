/**
 * Star Battle's state, params, move and ui types, and its desc codec.
 *
 * The board is square. It is two arrays, one entry per cell in row-major
 * order: `regions`, which the desc gives and play never changes, and `grid`,
 * which is all a move writes.
 */

import { assertNever } from "../../engine/assert-never.ts";
import { DESC_MALFORMED, type DescParse, descValue } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { difficultyItem, tierNames } from "../../engine/difficulty.ts";
import { regionNumbers } from "../../engine/divide.ts";
import { Dsf } from "../../engine/dsf.ts";
import type { ParamConfigItem, PresetMenu } from "../../engine/game.ts";
import { numberItem, squareSize } from "../../engine/params.ts";
import { choice, num, paramsCodec, size } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { presetGrid } from "../../engine/preset-grid.ts";
import { type Ruleset, rulesetItem } from "../../engine/ruleset.ts";
import { encodeRegionWalls, readRegionWalls } from "../../engine/wall-runs.ts";

// --- difficulty -------------------------------------------------------------

/** Every step reads one star, one row, column or region, or one row or
 * column against the regions in it. */
export const DIFF_EASY = 0;
/** Needs several rows or columns counted against the regions in them. */
export const DIFF_NORMAL = 1;
/** Needs a star tried in a square where it would complete a row, column or
 * region and leave another without room. */
export const DIFF_TRICKY = 2;

const DIFF_NAMES: readonly string[] = tierNames(3);

/** The `d<char>` params suffix, by tier. */
const DIFF_CHARS = "ent";

// --- cells ------------------------------------------------------------------

/** A cell the player has not decided. */
export const BLANK = 0;
/** A cell the player has put a star in. */
export const STAR = 1;
/** A cell the player has marked as holding no star. */
export const CROSSED = 2;
export type StarbattleMark = typeof BLANK | typeof STAR | typeof CROSSED;

// --- types ------------------------------------------------------------------

export interface StarbattleParams {
  /** The grid's width and height, and its number of regions. */
  size: number;
  /** The stars every row, column and region holds. */
  stars: number;
  /** A `DIFF_*` tier. */
  diff: number;
}

export interface StarbattleState {
  size: number;
  stars: number;
  /** Each cell's region, numbered from 0 in the order their first cells are
   * met reading the grid. Shared between states. */
  regions: Int32Array;
  /** A {@link StarbattleMark} per cell. */
  grid: Uint8Array;
}

/** A move sets cells to marks: one for a click or a key, every cell for a
 * solve. */
export type StarbattleMove =
  | { kind: "mark"; cells: ReadonlyArray<{ index: number; mark: StarbattleMark }> }
  | { kind: "solve"; grid: readonly StarbattleMark[] };

export interface StarbattleUi {
  cursor: GridCursor;
}

// --- params -----------------------------------------------------------------

/** The puzzles the board plays, by the stars to a row less one. */
const RULESETS: readonly Ruleset[] = [
  {
    name: "One star",
    rule: "Every row, column and region holds one star. This is the puzzle also known as <em>Queens</em>.",
  },
  {
    name: "Two stars",
    rule: "Every row, column and region holds two stars. This is the puzzle also known as <em>Two Not Touch</em>.",
  },
  {
    name: "Three stars",
    rule: "Every row, column and region holds three stars.",
  },
];

/** The stars to a row as the ruleset's place in {@link RULESETS}, which is
 * also what the params string's `s` reads and writes as the number itself. */
const starsField = {
  get: (p: StarbattleParams): number => p.stars,
  set: (p: StarbattleParams, stars: number): void => {
    p.stars = stars;
  },
};

/**
 * The smallest grid that has a board at each number of stars. Two rows next
 * to each other hold twice the stars and no two of those touch, so four
 * times the stars, less one, is the least width they fit in: no smaller grid
 * has any arrangement, and with two or three stars none does until one
 * wider than that.
 */
const MIN_SIZE: readonly number[] = [0, 4, 8, 12];

/** The letters the text form names the regions by, one a region. */
const REGION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** The largest grid, which has as many regions as there are letters to name
 * them by. No grid is refused for the time it takes to deal: measured
 * 2026-10-12, a 12x12 takes 2 to 14 seconds a board with one or two stars,
 * and a 14x14 with three takes 7. */
const MAX_SIZE = REGION_LETTERS.length;

const starsWords = (n: number): string => (n === 1 ? "1 star" : `${n} stars`);

/** The "Custom type…" form, and the fields the codec below reads and writes. */
export const paramConfig: ParamConfigItem<StarbattleParams>[] = [
  numberItem<StarbattleParams>("grid-size", "Grid size", "size", {
    doc: "Width and height of the grid, which is also how many regions it is divided into. It must be at least 4 with one star, 8 with two and 12 with three, and at most 26. A grid wider than 10 can take several seconds to appear, a much larger one minutes, and the harder puzzles longer.",
    bounds: { min: MIN_SIZE[1], max: MAX_SIZE },
    label: { slot: "size", words: squareSize("size") },
  }),
  rulesetItem<StarbattleParams>(RULESETS, {
    get: (p) => p.stars - 1,
    set: (p, index) => {
      p.stars = index + 1;
    },
  }),
  difficultyItem(DIFF_NAMES, "diff", {
    doc: "<p><em>Easy</em> puzzles can be finished by looking at one row, column or region at a time, or at one row or column and the regions in it.</p><p><em>Normal</em> puzzles need several rows or columns side by side counted against the regions in them.</p><p><em>Tricky</em> puzzles need a star tried in a square: it would complete its own row, column or region and leave another without room.</p>",
  }),
];

const BOARDS: StarbattleParams[] = [
  { size: 5, stars: 1, diff: DIFF_EASY },
  { size: 6, stars: 1, diff: DIFF_EASY },
  { size: 8, stars: 1, diff: DIFF_EASY },
  { size: 8, stars: 2, diff: DIFF_EASY },
  { size: 9, stars: 2, diff: DIFF_EASY },
  { size: 10, stars: 2, diff: DIFF_EASY },
  { size: 12, stars: 3, diff: DIFF_EASY },
];

export function defaultParams(): StarbattleParams {
  return { ...BOARDS[0] };
}

export function presets(): PresetMenu<StarbattleParams> {
  return presetGrid(paramConfig, BOARDS, {
    // Measured 2026-10-15, the 95th of 100 deals: a Tricky board of two
    // stars takes half a second at 9x9 and a second at 10x10, but 9 at 8x8,
    // where a board seldom needs it; three stars take two seconds at Normal.
    tiers: (board) => {
      if (board.stars === 1) return null;
      if (board.stars === 3) return [DIFF_EASY, DIFF_EASY];
      return [DIFF_EASY, board.size > 8 ? DIFF_TRICKY : DIFF_NORMAL];
    },
  });
}

export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  size(paramConfig, "grid-size"),
  num(paramConfig, "s", starsField),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
]);

export function validateParams(p: StarbattleParams, _full: boolean): string | null {
  const least = MIN_SIZE[p.stars];
  if (p.size < least)
    return `Grid size must be at least ${least} with ${starsWords(p.stars)} to a row.`;
  return null;
}

// --- desc -------------------------------------------------------------------

/** The regions, as the walls between them (`engine/wall-runs.ts`). */
export function encodeDesc(regions: Dsf, size: number): string {
  return encodeRegionWalls(regions, size, size);
}

function parseDesc(p: StarbattleParams, desc: string): DescParse<Int32Array> {
  return readDesc(desc, (r) => {
    const cells = p.size * p.size;
    const joined = new Dsf(cells);
    readRegionWalls(r, joined, p.size, p.size);
    r.end();
    const regions = regionNumbers(joined, cells);
    // A board has a region for each row: any other number of them cannot
    // each hold a row's stars.
    if (regions.reduce((a, b) => Math.max(a, b), 0) !== p.size - 1)
      return r.fail(DESC_MALFORMED);
    return regions;
  });
}

export function newState(p: StarbattleParams, desc: string): StarbattleState {
  const regions = descValue(parseDesc(p, desc));
  return {
    size: p.size,
    stars: p.stars,
    regions,
    grid: new Uint8Array(p.size * p.size),
  };
}

function cloneState(s: StarbattleState): StarbattleState {
  return { ...s, grid: s.grid.slice() };
}

/** A move's board. Pure: `s` is left as it was. */
export function executeMove(s: StarbattleState, move: StarbattleMove): StarbattleState {
  const next = cloneState(s);
  if (move.kind === "solve") {
    next.grid.set(move.grid);
  } else if (move.kind === "mark") {
    for (const { index, mark } of move.cells) next.grid[index] = mark;
  } else {
    return assertNever(move, "starbattle: executeMove");
  }
  return next;
}

// --- geometry ---------------------------------------------------------------

/** The cells that share a side or a corner with cell `i`, in reading order. */
export function touching(size: number, i: number): number[] {
  const x = i % size;
  const y = (i - x) / size;
  const out: number[] = [];
  for (let ny = Math.max(0, y - 1); ny <= Math.min(size - 1, y + 1); ny++)
    for (let nx = Math.max(0, x - 1); nx <= Math.min(size - 1, x + 1); nx++)
      if (nx !== x || ny !== y) out.push(ny * size + nx);
  return out;
}

/** Whether cells `a` and `b` share a side or a corner. */
export function touches(size: number, a: number, b: number): boolean {
  const dx = (a % size) - (b % size);
  const dy = Math.floor(a / size) - Math.floor(b / size);
  return a !== b && dx >= -1 && dx <= 1 && dy >= -1 && dy <= 1;
}

// --- text format ------------------------------------------------------------

/** Each cell as its region's letter and its mark: `*` a star, `x` a cross. */
export function textFormat(s: StarbattleState): string {
  const { size, regions, grid } = s;
  let out = "";
  for (let y = 0; y < size; y++) {
    const row: string[] = [];
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const mark = grid[i] === STAR ? "*" : grid[i] === CROSSED ? "x" : ".";
      row.push(REGION_LETTERS[regions[i]] + mark);
    }
    out += `${row.join(" ")}\n`;
  }
  return out;
}
