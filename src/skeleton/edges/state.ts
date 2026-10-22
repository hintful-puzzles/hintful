/**
 * Skeleton's state, params, move and ui types, and its desc codec.
 *
 * The board is the walls, which the desc gives and play never changes, and a
 * mark on every edge between two squares that share a side: nothing yet, a
 * line, or a cross saying no line goes there. A move only writes edges.
 */

import { assertNever } from "../../engine/assert-never.ts";
import { type DescParse, descValue } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { difficultyItem, tierNames } from "../../engine/difficulty.ts";
import type { ParamConfigItem, PresetMenu } from "../../engine/game.ts";
import {
  CROSS,
  type EdgeChange,
  type EdgeMark,
  LINE,
  type LineDrawingUi,
} from "../../engine/line-drawing.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { choice, dims, paramsCodec } from "../../engine/params-codec.ts";
import { presetGrid } from "../../engine/preset-grid.ts";
import { DOWN, RIGHT, squareEdges } from "../../engine/square-edges.ts";
import { encodeWallRuns, readWallRuns } from "../../engine/wall-runs.ts";

// --- difficulty -------------------------------------------------------------

/** Every line follows from one square at a time. */
export const DIFF_EASY = 0;
/** Needs a line or a cross supposed, and followed until the board breaks. */
export const DIFF_NORMAL = 1;

const DIFF_NAMES: readonly string[] = tierNames(2);

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
  /** 1 on each edge with a wall, indexed as `engine/square-edges.ts` numbers
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
    doc: "<p><em>Easy</em> puzzles can be finished one square at a time.</p><p><em>Normal</em> puzzles also need you to suppose a line or a cross and follow it until something breaks.</p>",
  }),
];

const BOARDS: SkeletonParams[] = [
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

/** The walls, as `engine/wall-runs.ts` writes a list of them. */
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
  let out = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      out += "+";
      if (x < w - 1) out += join(g.around[i * 4 + RIGHT], "-");
    }
    out += "\n";
    if (y === h - 1) break;
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      out += join(g.around[i * 4 + DOWN], "|");
      if (x < w - 1) out += " ";
    }
    out += "\n";
  }
  return out;
}
