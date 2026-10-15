/**
 * Skeleton's state, params, move and ui types, and its desc codec.
 *
 * The board is two arrays, one entry per square in row-major order: `clues`,
 * which the desc gives and play never changes, and `grid`, which is all a
 * move writes.
 */

import { assertNever } from "../../engine/assert-never.ts";
import { digitValue, isDigit } from "../../engine/decimal.ts";
import {
  DESC_OUT_OF_RANGE,
  type DescParse,
  descValue,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { difficultyItem, tierNames } from "../../engine/difficulty.ts";
import type { ParamConfigItem, PresetMenu } from "../../engine/game.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { choice, dims, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { presetGrid } from "../../engine/preset-grid.ts";

// --- difficulty -------------------------------------------------------------

/** Every square follows from one number at a time. */
export const DIFF_EASY = 0;
/** Needs two numbers read together at least once. */
export const DIFF_NORMAL = 1;

const DIFF_NAMES: readonly string[] = tierNames(2);

/** The `d<char>` params suffix, by tier. */
const DIFF_CHARS = "en";

// --- squares ----------------------------------------------------------------

/** A square the player has not decided. */
export const BLANK = 0;
/** A square the player has filled. */
export const FILLED = 1;
/** A square the player has marked as staying empty. */
export const CROSSED = 2;
export type SkeletonMark = typeof BLANK | typeof FILLED | typeof CROSSED;

/** `clues[i]` for a square without a number. */
export const NO_CLUE = -1;

/** The most filled squares a number can count: one on each side. */
const MAX_CLUE = 4;

// --- types ------------------------------------------------------------------

export interface SkeletonParams {
  w: number;
  h: number;
  /** {@link DIFF_EASY} or {@link DIFF_NORMAL}. */
  diff: number;
}

export interface SkeletonState {
  w: number;
  h: number;
  /** The number on each square, or {@link NO_CLUE}. Shared between states. */
  clues: Int8Array;
  /** A {@link SkeletonMark} per square. A numbered square stays `BLANK`. */
  grid: Uint8Array;
}

/** A move sets squares to marks: one for a click or a key, every square for a
 * solve. */
export type SkeletonMove =
  | { kind: "mark"; cells: ReadonlyArray<{ index: number; mark: SkeletonMark }> }
  | { kind: "solve"; grid: readonly SkeletonMark[] };

export interface SkeletonUi {
  cursor: GridCursor;
}

// --- params -----------------------------------------------------------------

/** The "Custom type…" form, and the fields the codec below reads and writes. */
export const paramConfig: ParamConfigItem<SkeletonParams>[] = [
  ...dimensionParamConfig<SkeletonParams>({ doc: "Size of the grid in squares." }),
  difficultyItem(DIFF_NAMES, "diff", {
    doc: "<p><em>Easy</em> puzzles can be finished one number at a time.</p><p><em>Normal</em> puzzles need two numbers read together at least once.</p>",
  }),
];

const BOARDS: SkeletonParams[] = [
  { w: 5, h: 5, diff: DIFF_EASY },
  { w: 6, h: 6, diff: DIFF_EASY },
  { w: 8, h: 8, diff: DIFF_EASY },
];

/** Normal, so that the first board needs both rungs and its hint draws every
 * mark the legend lists: the board the cross-game guards deal is this one. */
export function defaultParams(): SkeletonParams {
  return { ...BOARDS[0], diff: DIFF_NORMAL };
}

export function presets(): PresetMenu<SkeletonParams> {
  return presetGrid(paramConfig, BOARDS);
}

export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
]);

export function validateParams(p: SkeletonParams, _full: boolean): string | null {
  if (p.w < 3 || p.h < 3) return "Width and height must both be at least three.";
  if (p.w * p.h > 400) return "Width times height must be at most 400.";
  return null;
}

// --- desc -------------------------------------------------------------------

/** How the desc writes a square without a number. */
const GAP = "_";

/** One character a square: its number, or {@link GAP}. */
export function encodeDesc(clues: Int8Array): string {
  return Array.from(clues, (c) => (c === NO_CLUE ? GAP : String(c))).join("");
}

function parseDesc(p: SkeletonParams, desc: string): DescParse<Int8Array> {
  return readDesc(desc, (r) => {
    const clues = new Int8Array(p.w * p.h);
    for (let i = 0; i < clues.length; i++) {
      if (r.accept(GAP)) {
        clues[i] = NO_CLUE;
        continue;
      }
      // One digit a square, so two numbers side by side are not read as one.
      const v = digitValue(r.char(isDigit));
      if (v === null || v > MAX_CLUE) return r.fail(DESC_OUT_OF_RANGE);
      clues[i] = v;
    }
    r.end();
    return clues;
  });
}

export function newState(p: SkeletonParams, desc: string): SkeletonState {
  const clues = descValue(parseDesc(p, desc));
  return { w: p.w, h: p.h, clues, grid: new Uint8Array(p.w * p.h) };
}

function cloneState(s: SkeletonState): SkeletonState {
  return { ...s, grid: s.grid.slice() };
}

/** A move's board. Pure: `s` is left as it was. */
export function executeMove(s: SkeletonState, move: SkeletonMove): SkeletonState {
  const next = cloneState(s);
  if (move.kind === "solve") {
    next.grid.set(move.grid);
  } else if (move.kind === "mark") {
    for (const { index, mark } of move.cells)
      if (next.clues[index] === NO_CLUE) next.grid[index] = mark;
  } else {
    return assertNever(move, "skeleton: executeMove");
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

export function textFormat(s: SkeletonState): string {
  const { w, h, clues, grid } = s;
  let out = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      out +=
        clues[i] !== NO_CLUE
          ? String(clues[i])
          : grid[i] === FILLED
            ? "#"
            : grid[i] === CROSSED
              ? "x"
              : ".";
    }
    out += "\n";
  }
  return out;
}
