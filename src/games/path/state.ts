/**
 * Path's state, params, move and ui types, the board's geometry, and its desc
 * codec.
 *
 * The board is the numbers, which the desc gives and play never changes, and
 * a mark on every edge between two squares that share a side: nothing yet, a
 * line, or a cross saying no line goes there. A move only writes edges, so a
 * player can lay a piece of a path before it reaches either of its numbers.
 */

import { assertNever } from "../../engine/assert-never.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_UNPAIRED,
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

/** Every line follows from one square, or from the numbers a line would join. */
export const DIFF_EASY = 0;
/** Needs a region of squares that a missing line would shut off. */
export const DIFF_NORMAL = 1;

const DIFF_NAMES: readonly string[] = tierNames(2);

/** The `d<char>` params suffix, by tier. */
const DIFF_CHARS = "en";

// --- edges ------------------------------------------------------------------

/** An edge the player has not decided. */
export const OPEN = 0;
/** An edge a path runs along. */
export const LINE = 1;
/** An edge the player has marked as having no line. */
export const CROSS = 2;
export type EdgeMark = typeof OPEN | typeof LINE | typeof CROSS;

/** `ends[i]` for a square without a number. */
export const NO_END = 0;

/** The most pairs a desc may number. More than the largest board can hold
 * (every pair takes at least two squares), so it bounds only what a typed
 * desc can ask a typed array to store. */
const MAX_PAIRS = 255;

// --- types ------------------------------------------------------------------

export interface PathParams {
  w: number;
  h: number;
  /** {@link DIFF_EASY} or {@link DIFF_NORMAL}. */
  diff: number;
}

export interface PathState {
  w: number;
  h: number;
  /** The number on each square, 1 up, or {@link NO_END}. Shared between
   * states. */
  ends: Uint8Array;
  /** An {@link EdgeMark} per edge, indexed as {@link Geometry} numbers them. */
  edges: Uint8Array;
}

/** A move sets edges to marks: the edges a drag or a key changed, or every
 * edge for a solve. */
export type PathMove =
  | { kind: "edges"; changes: ReadonlyArray<{ edge: number; mark: EdgeMark }> }
  | { kind: "solve"; edges: readonly EdgeMark[] };

/** A line being drawn: the squares it has passed through, in order. */
export interface PathDrag {
  cells: number[];
  /** Whether Enter began it, so that the arrows carry it on and Enter
   * finishes it. */
  keyboard: boolean;
  /** Where the press that began a pointer's drag landed, which says the edge
   * a press released where it began is aimed at. */
  at: { x: number; y: number } | null;
}

export interface PathUi {
  cursor: GridCursor;
  drag: PathDrag | null;
}

// --- geometry ---------------------------------------------------------------

/**
 * The edges of a `w × h` board. Edge `e` joins squares `a[e]` and `b[e]`, with
 * `a[e] < b[e]`: the horizontal edges come first, in reading order of their
 * left square, then the vertical ones in reading order of their upper square.
 * `around` holds each square's edges, four slots a square in the order up,
 * left, right, down, with `-1` past the board's side.
 */
export interface Geometry {
  w: number;
  h: number;
  cells: number;
  edgeCount: number;
  a: Int32Array;
  b: Int32Array;
  around: Int32Array;
}

const geometries = new Map<string, Geometry>();

export function geometry(w: number, h: number): Geometry {
  const key = `${w}x${h}`;
  const known = geometries.get(key);
  if (known) return known;
  const cells = w * h;
  const across = (w - 1) * h;
  const edgeCount = across + w * (h - 1);
  const a = new Int32Array(edgeCount);
  const b = new Int32Array(edgeCount);
  const around = new Int32Array(cells * 4).fill(-1);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w - 1; x++) {
      const e = y * (w - 1) + x;
      const i = y * w + x;
      a[e] = i;
      b[e] = i + 1;
      around[i * 4 + 2] = e;
      around[(i + 1) * 4 + 1] = e;
    }
  for (let i = 0; i < w * (h - 1); i++) {
    const e = across + i;
    a[e] = i;
    b[e] = i + w;
    around[i * 4 + 3] = e;
    around[(i + w) * 4] = e;
  }
  const made = { w, h, cells, edgeCount, a, b, around };
  geometries.set(key, made);
  return made;
}

/** The square across edge `e` from square `i`. */
export function across(g: Geometry, e: number, i: number): number {
  return g.a[e] === i ? g.b[e] : g.a[e];
}

/** The edge between squares `i` and `j`, or `-1` where they do not share a
 * side. */
export function edgeBetween(g: Geometry, i: number, j: number): number {
  for (let k = 0; k < 4; k++) {
    const e = g.around[i * 4 + k];
    if (e >= 0 && across(g, e, i) === j) return e;
  }
  return -1;
}

/** How many lines a square takes: one from a number, two through any other. */
export function degreeOf(ends: Uint8Array, i: number): number {
  return ends[i] === NO_END ? 2 : 1;
}

// --- params -----------------------------------------------------------------

/** The "Custom type…" form, and the fields the codec below reads and writes. */
export const paramConfig: ParamConfigItem<PathParams>[] = [
  ...dimensionParamConfig<PathParams>({
    doc: "Size of the grid in squares.",
    bounds: { min: 3 },
  }),
  difficultyItem(DIFF_NAMES, "diff", {
    doc: "<p><em>Easy</em> puzzles can be finished one square, or one pair of numbers, at a time.</p><p><em>Normal</em> puzzles also need you to spot squares that would be shut off from the numbers they need.</p>",
  }),
];

const BOARDS: PathParams[] = [
  { w: 5, h: 5, diff: DIFF_EASY },
  { w: 7, h: 7, diff: DIFF_EASY },
  { w: 9, h: 9, diff: DIFF_EASY },
];

/** Normal, so that the first board needs both rungs and its hint draws every
 * mark the legend lists: the board the cross-game guards deal is this one. */
export function defaultParams(): PathParams {
  return { ...BOARDS[1], diff: DIFF_NORMAL };
}

export function presets(): PresetMenu<PathParams> {
  return presetGrid(paramConfig, BOARDS);
}

export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
]);

export function validateParams(p: PathParams, _full: boolean): string | null {
  if (p.w < 3 || p.h < 3) return "Width and height must both be at least three.";
  if (p.w * p.h > 400) return "Width times height must be at most 400.";
  return null;
}

// --- desc -------------------------------------------------------------------

/** Separates two numbers on squares side by side in reading order. */
const SEPARATOR = "_";

const isRunLetter = (c: string): boolean => c >= "a" && c <= "z";

/** The numbers in reading order, each a decimal with {@link SEPARATOR}
 * between two that touch, and each run of squares without one a letter: `a`
 * for one square up to `z` for 26. */
export function encodeDesc(ends: Uint8Array): string {
  let out = "";
  let run = 0;
  let afterNumber = false;
  const flush = (): void => {
    while (run > 0) {
      const n = Math.min(run, 26);
      out += String.fromCharCode(96 + n);
      run -= n;
    }
  };
  for (const v of ends) {
    if (v === NO_END) {
      run++;
      continue;
    }
    if (run > 0) flush();
    else if (afterNumber) out += SEPARATOR;
    out += String(v);
    afterNumber = true;
  }
  flush();
  return out;
}

function parseDesc(p: PathParams, desc: string): DescParse<Uint8Array> {
  return readDesc(desc, (r) => {
    const ends = new Uint8Array(p.w * p.h);
    let k = 0;
    let afterNumber = false;
    while (k < ends.length) {
      if (r.peekIs(isRunLetter)) {
        k += r.char().charCodeAt(0) - 96;
        if (k > ends.length) r.fail(DESC_TOO_LONG);
        afterNumber = false;
      } else {
        if (afterNumber) r.expect(SEPARATOR);
        ends[k++] = r.int(1, MAX_PAIRS);
        afterNumber = true;
      }
    }
    r.end();
    const count = new Map<number, number>();
    for (const v of ends) if (v !== NO_END) count.set(v, (count.get(v) ?? 0) + 1);
    // The numbers run from 1 with no gap, so a number names its pair's color.
    if (count.size === 0) r.fail(DESC_OUT_OF_RANGE);
    for (const v of count.keys()) if (v > count.size) r.fail(DESC_OUT_OF_RANGE);
    for (const n of count.values()) if (n !== 2) r.fail(DESC_UNPAIRED);
    return ends;
  });
}

export function newState(p: PathParams, desc: string): PathState {
  const ends = descValue(parseDesc(p, desc));
  return { w: p.w, h: p.h, ends, edges: new Uint8Array(geometry(p.w, p.h).edgeCount) };
}

function cloneState(s: PathState): PathState {
  return { ...s, edges: s.edges.slice() };
}

/** A move's board. Pure: `s` is left as it was. */
export function executeMove(s: PathState, move: PathMove): PathState {
  const next = cloneState(s);
  if (move.kind === "solve") {
    next.edges.set(move.edges);
  } else if (move.kind === "edges") {
    for (const { edge, mark } of move.changes) next.edges[edge] = mark;
  } else {
    return assertNever(move, "path: executeMove");
  }
  return next;
}

// --- text format ------------------------------------------------------------

/** The numbers on a grid of `+`, with `-` and `|` for lines and `x` for
 * crosses between them. */
export function textFormat(s: PathState): string {
  const { w, h, ends, edges } = s;
  const g = geometry(w, h);
  const width = ends.some((v) => v > 9) ? 2 : 1;
  const cell = (i: number): string =>
    (ends[i] === NO_END ? "+" : String(ends[i])).padStart(width, " ");
  const join = (e: number, line: string): string =>
    edges[e] === LINE ? line : edges[e] === CROSS ? "x" : " ";
  let out = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      out += cell(i);
      if (x < w - 1) out += join(g.around[i * 4 + 2], "-");
    }
    out += "\n";
    if (y === h - 1) break;
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      out += join(g.around[i * 4 + 3], "|").padStart(width, " ");
      if (x < w - 1) out += " ";
    }
    out += "\n";
  }
  return out;
}
