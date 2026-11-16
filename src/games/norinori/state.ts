/**
 * Norinori's state, params, move and ui types, and its desc codec.
 *
 * The board is two arrays, one entry per square in row-major order:
 * `regions`, which the desc gives and play never changes, and `grid`, which
 * is all a move writes.
 */

import { assertNever } from "../../engine/assert-never.ts";
import { DESC_MALFORMED, type DescParse, descValue } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { difficultyItem } from "../../engine/difficulty.ts";
import { regionNumbers } from "../../engine/divide.ts";
import { Dsf } from "../../engine/dsf.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/game.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { choice, dims, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { encodeRegionWalls, readRegionWalls } from "../../engine/wall-runs.ts";
import * as norinori from "../../generated/games/norinori/norinori.compiled.ts";

// --- difficulty -------------------------------------------------------------

/** Every step reads one domino, one square or one region. */
export const DIFF_EASY = 0;
/** Needs a region whose open squares cannot take its shaded squares without
 * one of them. */
export const DIFF_NORMAL = 1;
/** Needs a square tried shaded, and the squares that would leave clear. */
export const DIFF_TRICKY = 2;

const DIFF_NAMES: readonly string[] = norinori.tiers;

/** The `d<char>` params suffix, by tier. */
const DIFF_CHARS = "ent";

// --- squares ----------------------------------------------------------------

/** A square the player has not decided. */
export const BLANK = 0;
/** A square the player has shaded. */
export const SHADED = 1;
/** A square the player has marked as clear. */
export const CROSSED = 2;
export type NorinoriMark = typeof BLANK | typeof SHADED | typeof CROSSED;

// --- types ------------------------------------------------------------------

export interface NorinoriParams {
  w: number;
  h: number;
  /** A `DIFF_*` tier. */
  diff: number;
}

export interface NorinoriState {
  w: number;
  h: number;
  /** Each square's region, numbered from 0 in the order their first squares
   * are met reading the grid. Shared between states. */
  regions: Int32Array;
  /** A {@link NorinoriMark} per square. */
  grid: Uint8Array;
}

/** A move sets squares to marks: one for a click or a key, several for a
 * drag, every square for a solve. */
export type NorinoriMove =
  | { kind: "mark"; cells: ReadonlyArray<{ index: number; mark: NorinoriMark }> }
  | { kind: "solve"; grid: readonly NorinoriMark[] };

export interface NorinoriUi {
  cursor: GridCursor;
}

// --- params -----------------------------------------------------------------

/** The smallest side: a narrower grid seldom has room for a region that
 * does not hand its squares over at a glance. */
const MIN_SIDE = 4;

/** The most squares a grid may have. */
const MAX_AREA = 400;

/** The "Custom type…" form, and the fields the codec below reads and writes. */
export const paramConfig: ParamConfigItem<NorinoriParams>[] = [
  ...dimensionParamConfig<NorinoriParams>({
    doc: `Size of the grid in squares: each side at least ${MIN_SIDE}, and at most ${MAX_AREA} squares in all.`,
  }),
  difficultyItem(DIFF_NAMES, "diff", {
    doc: "<p><em>Easy</em> puzzles can be finished by looking at one domino, one square or one region at a time.</p><p><em>Normal</em> puzzles need a region whose open squares cannot hold its shaded squares without a certain one.</p><p><em>Tricky</em> puzzles need a square tried shaded, to see which squares that would leave clear.</p>",
  }),
];

const BOARDS: NorinoriParams[] = [
  { w: 6, h: 6, diff: DIFF_EASY },
  { w: 6, h: 8, diff: DIFF_EASY },
  { w: 8, h: 8, diff: DIFF_EASY },
];

export function defaultParams(): NorinoriParams {
  return { ...BOARDS[0] };
}

export const menu: PresetBoards<NorinoriParams> = {
  boards: BOARDS,
  // Measured 2026-11-16 with the deal walk, eight deals a cell on a loaded
  // machine: 6x6 deals in a median of 0.4 s at Easy, 2 at Normal and 4 at
  // Tricky (8 at worst), 8x6 Easy (as 6x8, its transpose) in 4 (8 at worst), and 8x8 Easy in 6 (14
  // at worst). An 8x8 board at
  // Normal took 9 to 13 seconds under vitest, at Tricky up to 43, and a 10x10
  // Easy one 3 to 37. Those are a Custom size's wait.
  tiers: (board) => (board.w * board.h > 36 ? [DIFF_EASY, DIFF_EASY] : null),
};

export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
]);

export function validateParams(p: NorinoriParams, _full: boolean): string | null {
  if (p.w < MIN_SIDE || p.h < MIN_SIDE)
    return `Width and height must both be at least ${MIN_SIDE}.`;
  if (p.w * p.h > MAX_AREA) return `Width times height must be at most ${MAX_AREA}.`;
  return null;
}

// --- desc -------------------------------------------------------------------

/** The regions, as the walls between them (`engine/wall-runs.ts`). */
export function encodeDesc(regions: Dsf, w: number, h: number): string {
  return encodeRegionWalls(regions, w, h);
}

function parseDesc(p: NorinoriParams, desc: string): DescParse<Int32Array> {
  return readDesc(desc, (r) => {
    const cells = p.w * p.h;
    const joined = new Dsf(cells);
    readRegionWalls(r, joined, p.w, p.h);
    r.end();
    const regions = regionNumbers(joined, cells);
    // A region of one square cannot hold two shaded squares.
    const sizes = new Int32Array(cells);
    for (const g of regions) sizes[g]++;
    if (regions.some((g) => sizes[g] < 2)) return r.fail(DESC_MALFORMED);
    return regions;
  });
}

export function newState(p: NorinoriParams, desc: string): NorinoriState {
  const regions = descValue(parseDesc(p, desc));
  return { w: p.w, h: p.h, regions, grid: new Uint8Array(p.w * p.h) };
}

function cloneState(s: NorinoriState): NorinoriState {
  return { ...s, grid: s.grid.slice() };
}

/** A move's board. Pure: `s` is left as it was. */
export function executeMove(s: NorinoriState, move: NorinoriMove): NorinoriState {
  const next = cloneState(s);
  if (move.kind === "solve") {
    next.grid.set(move.grid);
  } else if (move.kind === "mark") {
    for (const { index, mark } of move.cells) next.grid[index] = mark;
  } else {
    return assertNever(move, "norinori: executeMove");
  }
  return next;
}

// --- geometry ---------------------------------------------------------------

/** The squares sharing a side with square `i`, in reading order. */
export function neighbors(w: number, h: number, i: number): number[] {
  const x = i % w;
  const y = (i - x) / w;
  const out: number[] = [];
  if (y > 0) out.push(i - w);
  if (x > 0) out.push(i - 1);
  if (x < w - 1) out.push(i + 1);
  if (y < h - 1) out.push(i + w);
  return out;
}

// --- text format ------------------------------------------------------------

/** The letters the text form names the regions by, the alphabet over again
 * past 52. */
const REGION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Each square as its region's letter and its mark: `#` shaded, `x` clear. */
export function textFormat(s: NorinoriState): string {
  const { w, h, regions, grid } = s;
  let out = "";
  for (let y = 0; y < h; y++) {
    const row: string[] = [];
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const mark = grid[i] === SHADED ? "#" : grid[i] === CROSSED ? "x" : ".";
      row.push(REGION_LETTERS[regions[i] % REGION_LETTERS.length] + mark);
    }
    out += `${row.join(" ")}\n`;
  }
  return out;
}
