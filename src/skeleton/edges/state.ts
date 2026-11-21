/**
 * Skeleton's state, params, move and ui types, and its desc codec.
 *
 * The board is the walls, which the desc gives and play never changes, and a
 * mark on every edge between two squares that share a side: nothing yet, a
 * line, or a cross saying no line goes there. A move only writes edges.
 */

import { gridText } from "../../engine/board/grid-text.ts";
import { DOWN, RIGHT, squareEdges } from "../../engine/board/square-edges.ts";
import { assertNever } from "../../engine/contract/assert-never.ts";
import { type DescParse, descValue } from "../../engine/contract/desc-error.ts";
import { difficultyItem } from "../../engine/contract/difficulty.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/contract/game.ts";
import { readDesc } from "../../engine/game-id/desc-reader.ts";
import { dimensionParamConfig } from "../../engine/game-id/params.ts";
import { choice, dims, paramsCodec } from "../../engine/game-id/params-codec.ts";
import { encodeWallRuns, readWallRuns } from "../../engine/game-id/wall-runs.ts";
import {
  CROSS,
  type EdgeChange,
  type EdgeMark,
  LINE,
  type LineDrawingUi,
} from "../../engine/mechanics/line-drawing.ts";
import * as skeleton from "../../generated/skeleton/edges/skeleton.compiled.ts";

// --- difficulty -------------------------------------------------------------

/** Every line follows from one square at a time. */
export const DIFF_EASY = 0;
/** Needs a line, or a square's two lines, seen to break the board at once. */
export const DIFF_NORMAL = 1;

const DIFF_NAMES: readonly string[] = skeleton.tiers;

/** The `d<char>` params suffix, by tier. */
const DIFF_CHARS = "en";

/** How many lines every square takes: the loop passes through each once. */
export const LINES_PER_SQUARE = 2;

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
  /** 1 on each edge with a wall, indexed as `engine/board/square-edges.ts` numbers
   * them. Shared between states. */
  walls: Uint8Array;
  /** An {@link EdgeMark} per edge. A walled edge stays open. */
  edges: Uint8Array;
}

/** A move sets edges to marks: the edges a drag or a key changed, or every
 * edge for a solve. */
export type SkeletonMove =
  | { kind: "edges"; changes: readonly EdgeChange[] }
  | { kind: "solve"; edges: readonly EdgeMark[] };

export type SkeletonUi = LineDrawingUi;

// --- params -----------------------------------------------------------------

/** The "Custom type…" form, and the fields the codec below reads and writes. */
export const paramConfig: ParamConfigItem<SkeletonParams>[] = [
  ...dimensionParamConfig<SkeletonParams>({
    doc: "Size of the grid in squares. Both must be even.",
    bounds: { min: 4 },
  }),
  difficultyItem(DIFF_NAMES, "diff", {
    doc: "<p><em>Easy</em> puzzles can be finished one square at a time.</p><p><em>Normal</em> puzzles also need you to see that a line, or a square's two lines, would break the board at once.</p>",
  }),
];

const BOARDS: SkeletonParams[] = [
  { w: 6, h: 6, diff: DIFF_EASY },
  { w: 6, h: 8, diff: DIFF_EASY },
];

/** Normal, so that the first board needs both rungs and its hint draws every
 * mark the legend lists: the board the cross-game guards deal is this one. */
export function defaultParams(): SkeletonParams {
  return { ...BOARDS[0], diff: DIFF_NORMAL };
}

export const menu: PresetBoards<SkeletonParams> = { boards: BOARDS };

export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
]);

export function validateParams(p: SkeletonParams, _full: boolean): string | null {
  if (p.w < 4 || p.h < 4) return "Width and height must both be at least four.";
  // The generator's loops are made of 2 × 2 blocks.
  if (p.w % 2 !== 0 || p.h % 2 !== 0) return "Width and height must both be even.";
  if (p.w * p.h > 400) return "Width times height must be at most 400.";
  // The generator found no 4 × 4 board that needs a supposition in 10,000
  // tries (2026-10-22).
  if (p.diff === DIFF_NORMAL && p.w * p.h < 24)
    return "A Normal board must be larger than four by four.";
  return null;
}

// --- desc -------------------------------------------------------------------

/** The walls, as `engine/game-id/wall-runs.ts` writes a list of them. */
export function encodeDesc(walls: Uint8Array): string {
  return encodeWallRuns(walls);
}

function parseDesc(p: SkeletonParams, desc: string): DescParse<Uint8Array> {
  return readDesc(desc, (r) => {
    const walls = readWallRuns(r, squareEdges(p.w, p.h).edgeCount);
    r.end();
    return walls;
  });
}

export function newState(p: SkeletonParams, desc: string): SkeletonState {
  const walls = descValue(parseDesc(p, desc));
  return { w: p.w, h: p.h, walls, edges: new Uint8Array(walls.length) };
}

function cloneState(s: SkeletonState): SkeletonState {
  return { ...s, edges: s.edges.slice() };
}

/** A move's board. Pure: `s` is left as it was. */
export function executeMove(s: SkeletonState, move: SkeletonMove): SkeletonState {
  const next = cloneState(s);
  if (move.kind === "solve") {
    next.edges.set(move.edges);
  } else if (move.kind === "edges") {
    for (const { edge, mark } of move.changes)
      if (!next.walls[edge]) next.edges[edge] = mark;
  } else {
    return assertNever(move, "skeleton: executeMove");
  }
  return next;
}

// --- text format ------------------------------------------------------------

/** The squares as `+`, with `-` and `|` for lines, `x` for crosses and `#`
 * for walls between them. */
export function textFormat(s: SkeletonState): string {
  const { w, h, walls, edges } = s;
  const g = squareEdges(w, h);
  const join = (e: number, line: string): string =>
    walls[e] ? "#" : edges[e] === LINE ? line : edges[e] === CROSS ? "x" : " ";
  return gridText(w, h, () => "+", {
    across: (x, y) => join(g.around[(y * w + x) * 4 + RIGHT], "-"),
    between: {
      down: (x, y) => join(g.around[(y * w + x) * 4 + DOWN], "|"),
      middle: " ",
    },
  });
}
