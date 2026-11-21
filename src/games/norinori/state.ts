/**
 * Norinori's state, params, move and ui types, and its desc codec.
 *
 * The board is two arrays, one entry per square in row-major order:
 * `regions`, which the desc gives and play never changes, and `grid`, which
 * is all a move writes.
 */

import { Dsf } from "../../engine/board/dsf.ts";
import { gridText } from "../../engine/board/grid-text.ts";
import { assertNever } from "../../engine/contract/assert-never.ts";
import {
  DESC_MALFORMED,
  type DescParse,
  descValue,
} from "../../engine/contract/desc-error.ts";
import { difficultyItem } from "../../engine/contract/difficulty.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/contract/game.ts";
import { readDesc } from "../../engine/game-id/desc-reader.ts";
import { dimensionParamConfig } from "../../engine/game-id/params.ts";
import { choice, dims, paramsCodec } from "../../engine/game-id/params-codec.ts";
import { encodeRegionWalls, readRegionWalls } from "../../engine/game-id/wall-runs.ts";
import { regionNumbers } from "../../engine/generate/divide.ts";
import type { GridCursor } from "../../engine/input/pointer.ts";
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
  { w: 8, h: 10, diff: DIFF_EASY },
  { w: 10, h: 10, diff: DIFF_EASY },
];

export function defaultParams(): NorinoriParams {
  return { ...BOARDS[0] };
}

// Every board at every tier; four sizes, half of them rectangles, fill a
// section's twelve lines. Measured 2026-11-16 with the deal walk, twenty
// deals a cell under vitest on a loaded machine: a 10x10 board deals in a
// median of 0.5 s at worst and 2 s at its slowest, and a 12x12 one, left as
// a Custom size, in 1 to 2 s and 9 at its slowest.
export const menu: PresetBoards<NorinoriParams> = { boards: BOARDS };

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

/** The regions, as the walls between them (`engine/game-id/wall-runs.ts`). */
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

/** The other half of the domino shaded square `i` is half of, or `null`:
 * the two are beside each other and beside no other shaded square. A run of
 * three is no domino. */
export function dominoPartner(s: NorinoriState, i: number): number | null {
  const shadedBeside = (k: number): number[] =>
    neighbors(s.w, s.h, k).filter((j) => s.grid[j] === SHADED);
  if (s.grid[i] !== SHADED) return null;
  const mine = shadedBeside(i);
  return mine.length === 1 && shadedBeside(mine[0]).length === 1 ? mine[0] : null;
}

// --- text format ------------------------------------------------------------

/** The letters the text form names the regions by, the alphabet over again
 * past 52. */
const REGION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Each square as its region's letter and its mark: `#` shaded, `x` clear. */
export function textFormat(s: NorinoriState): string {
  const { w, h, regions, grid } = s;
  return gridText(
    w,
    h,
    (x, y) => {
      const i = y * w + x;
      const mark = grid[i] === SHADED ? "#" : grid[i] === CROSSED ? "x" : ".";
      return REGION_LETTERS[regions[i] % REGION_LETTERS.length] + mark;
    },
    { across: " " },
  );
}
