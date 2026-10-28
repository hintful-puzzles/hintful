/**
 * Path's state, params, move and ui types, and its desc codec.
 *
 * The board is the numbers and the walls, which the desc gives and play
 * never changes, and a mark on every edge between two squares that share a
 * side: nothing yet, a line, or a cross saying no line goes there. A wall's
 * edge holds a cross no move clears. A move only writes edges, so a player
 * can lay a piece of a path before it reaches either of its numbers.
 *
 * Two puzzles are played on the board, Path and Pairs (`engine/ruleset.ts`).
 * They differ in how many lines a numbered square takes, which
 * {@link PathPuzzle.takes} holds, and in which pieces of line may meet,
 * which is the solver's.
 */

import { searchTiers } from "../../engine/answer-search.ts";
import { assertNever } from "../../engine/assert-never.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_REPEATED,
  DESC_TOO_LONG,
  DESC_UNPAIRED,
  type DescParse,
  descValue,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { noSuchTier } from "../../engine/difficulty.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/game.ts";
import {
  CROSS,
  type EdgeChange,
  type EdgeMark,
  LINE,
  type LineDrawingUi,
} from "../../engine/line-drawing.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { choice, dims, letters, paramsCodec } from "../../engine/params-codec.ts";
import { RULESET_KW, type Ruleset, rulesetItem } from "../../engine/ruleset.ts";
import { DOWN, RIGHT, squareEdges } from "../../engine/square-edges.ts";
import { encodeWallRuns, readWallRuns } from "../../engine/wall-runs.ts";

// --- difficulty -------------------------------------------------------------

/** The tiers: three the ladder finishes, then Unreasonable, which a search
 * proves has one answer. Unreasonable came with the ladder's Checks
 * (2026-10-28), so that a board dealt before them, which may need the
 * lookahead they replaced, still opens. */
export const TIERS = searchTiers(3);

/** Every line follows from one square, or from the numbers a line would join. */
export const DIFF_EASY = 0;
/** Needs a line, or a square's two lines, seen to break the board at once. */
export const DIFF_NORMAL = 1;
/** Needs every way a square could take its two lines weighed. */
export const DIFF_TRICKY = 2;
/** Has one answer the ladder does not reach. */
export const DIFF_UNREASONABLE = TIERS.unreasonable;

const DIFF_NAMES = TIERS.names;

/** The `d<char>` params suffix, by tier. */
const DIFF_CHARS = "entu";

/** `ends[i]` for a square without a number. */
export const NO_END = 0;

/** The highest number a desc may give, so that a number fits the byte
 * `ends` keeps it in. A Pairs board cannot reach it (every pair takes at
 * least two squares), and the Path generator deals far fewer. */
export const MAX_NUMBER = 255;

// --- rulesets ---------------------------------------------------------------

export const MODE_PATH = 0;
export const MODE_PAIRS = 1;

/** The two puzzles, indexed by `MODE_*`: Path, the game's one-line puzzle
 * after its name, first (owner, 2026-10-23). */
const RULESETS: Ruleset[] = [
  {
    name: "Path",
    rule: "The numbers run from 1 up, each on one square. Draw one line from the 1 to the highest number that passes the numbers in order, so the 1 and the highest number take one line and every other square two.",
  },
  {
    name: "Pairs",
    rule: "Every number is on two squares. Join each pair of like numbers with a line of its own, so a numbered square takes one line.",
  },
];

// --- types ------------------------------------------------------------------

export interface PathParams {
  w: number;
  h: number;
  /** {@link DIFF_EASY}, {@link DIFF_NORMAL} or {@link DIFF_TRICKY}. */
  diff: number;
  /** {@link MODE_PAIRS} or {@link MODE_PATH}. */
  mode: number;
}

/** What the desc gives, which play never changes. Shared between states. */
export interface PathPuzzle {
  readonly w: number;
  readonly h: number;
  /** {@link MODE_PAIRS} or {@link MODE_PATH}. */
  readonly mode: number;
  /** The number on each square, 1 up, or {@link NO_END}. */
  readonly ends: Uint8Array;
  /** How many lines each square takes. */
  readonly takes: Uint8Array;
  /** 1 on each edge the desc walls off, indexed as `engine/square-edges.ts`
   * numbers them. */
  readonly walls: Uint8Array;
}

export interface PathState extends PathPuzzle {
  /** An {@link EdgeMark} per edge, indexed as `engine/square-edges.ts`
   * numbers them. A wall's edge is a cross. */
  edges: Uint8Array;
}

/** A move sets edges to marks: the edges a drag or a key changed, or every
 * edge for a solve. */
export type PathMove =
  | { kind: "edges"; changes: readonly EdgeChange[] }
  | { kind: "solve"; edges: readonly EdgeMark[] };

export type PathUi = LineDrawingUi;

// --- the puzzle -------------------------------------------------------------

/** How many lines each square takes: two through a square without a number.
 * In Pairs one from a number; in Path one from the 1 and the highest number,
 * where the line ends, and two through every other number. */
function takesOf(mode: number, ends: Uint8Array): Uint8Array {
  const last = Math.max(...ends);
  return ends.map((v) => {
    if (v === NO_END) return 2;
    return mode === MODE_PATH && v !== 1 && v !== last ? 2 : 1;
  });
}

/** The puzzle of a board of `p`'s shape and ruleset with these numbers and
 * walls. */
export function puzzleOf(
  p: Pick<PathParams, "w" | "h" | "mode">,
  ends: Uint8Array,
  walls: Uint8Array = new Uint8Array(squareEdges(p.w, p.h).edgeCount),
): PathPuzzle {
  return { w: p.w, h: p.h, mode: p.mode, ends, takes: takesOf(p.mode, ends), walls };
}

/** The edges of `puzzle` before any move: a cross on each wall. */
export function startEdges(puzzle: PathPuzzle): Uint8Array {
  return puzzle.walls.map((wall) => (wall ? CROSS : 0));
}

// --- params -----------------------------------------------------------------

/** The "Custom type…" form, and the fields the codec below reads and writes. */
export const paramConfig: ParamConfigItem<PathParams>[] = [
  ...dimensionParamConfig<PathParams>({
    doc: "Size of the grid in squares.",
    bounds: { min: 3 },
  }),
  TIERS.item(
    "diff",
    "<p><em>Easy</em> puzzles can be finished one square at a time: a square with only as many open edges as the lines it still needs takes a line on each.</p><p><em>Normal</em> puzzles also need you to see that a line, or a square's two lines, would break the board at once.</p><p><em>Tricky</em> puzzles need you to weigh every way a square with four open edges could take its two lines.</p><p><em>Unreasonable</em> puzzles have one answer, but may need you to try a line and follow it to see where it leads.</p>",
  ),
  rulesetItem<PathParams>(RULESETS, "mode"),
];

const BOARDS: PathParams[] = [
  { w: 6, h: 6, diff: DIFF_EASY, mode: MODE_PATH },
  { w: 6, h: 9, diff: DIFF_EASY, mode: MODE_PATH },
  { w: 7, h: 9, diff: DIFF_EASY, mode: MODE_PATH },
  { w: 5, h: 5, diff: DIFF_EASY, mode: MODE_PAIRS },
  { w: 7, h: 7, diff: DIFF_EASY, mode: MODE_PAIRS },
  { w: 8, h: 12, diff: DIFF_EASY, mode: MODE_PAIRS },
  { w: 10, h: 15, diff: DIFF_EASY, mode: MODE_PAIRS },
];

/** Normal, so that the first board needs both rungs and its hint draws every
 * mark the legend lists: the board the cross-game guards deal is this one. */
export function defaultParams(): PathParams {
  return { w: 7, h: 7, diff: DIFF_NORMAL, mode: MODE_PATH };
}

/** No Tricky Pairs 5x5 on the menu: its boards keep three pairs, and take a
 * median 0.8 s and at worst 1.9 s to find (16 deals, 2026-10-28). Path's
 * Tricky is on the menu at 7x9 only, which leaves the menu as long as a menu
 * may be; at 6x6 and 7x7 it deals in at most 0.5 s (2026-10-28). */
export const menu: PresetBoards<PathParams> = {
  boards: BOARDS,
  tiers: (p) => {
    // Unreasonable is the Custom dialog's alone, for the same length.
    const short = p.mode === MODE_PATH ? p.w !== 7 || p.h !== 9 : p.w === 5;
    return [DIFF_EASY, short ? DIFF_NORMAL : DIFF_TRICKY];
  },
};

/** `WxH`, a `z` for Path (Pairs writes nothing), then the generator-only
 * tier letter. Pairs was the game's only puzzle, so its strings carry no
 * letter, and Path was first dealt as "Zip": both are kept so every link and
 * save still opens. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  letters(paramConfig, RULESET_KW, ["z", ""]),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
]);

/**
 * The refusal for a board too small to need the tier asked for, or `null`.
 *
 * Proved again 2026-10-28, after Normal's and Tricky's rungs became Checks,
 * by grading every way to lay paths of two squares or more on each board and
 * counting the answers of each numbering: no 3x3 Pairs board is Normal,
 * Tricky or Unreasonable. Up to 4x5, every Tricky board has a path of two
 * squares, a straight run of four or a path that touches itself, none of
 * which the generator lays, and so does every Normal board on 3x4 and 3x5
 * and every Unreasonable one up to 4x4. A 4x4 has 26 Normal boards the
 * generator may lay, and a 4x5 eight Unreasonable ones, and both are left to
 * it.
 */
function absentTier(p: PathParams): string | null {
  if (p.mode !== MODE_PAIRS) return null;
  const tier = DIFF_NAMES[p.diff] ?? "";
  const what = `${p.w}x${p.h} puzzle`;
  const [short, long] = [Math.min(p.w, p.h), Math.max(p.w, p.h)];
  if (p.diff === DIFF_TRICKY && short <= 4 && long <= 5) return noSuchTier(what, tier);
  const narrow = short === 3 && long <= 5;
  if (p.diff === DIFF_NORMAL && narrow) return noSuchTier(what, tier);
  const small = narrow || (short === 4 && long === 4);
  if (p.diff === DIFF_UNREASONABLE && small) return noSuchTier(what, tier);
  return null;
}

export function validateParams(p: PathParams, full: boolean): string | null {
  if (p.w < 3 || p.h < 3) return "Width and height must both be at least three.";
  if (p.w * p.h > 400) return "Width times height must be at most 400.";
  return full ? absentTier(p) : null;
}

// --- desc -------------------------------------------------------------------

/** Separates two numbers on squares side by side in reading order. */
const SEPARATOR = "_";

/** Separates the numbers from the walls. */
const WALLS = ",";

const isRunLetter = (c: string): boolean => c >= "a" && c <= "z";

/** The numbers in reading order, each a decimal with {@link SEPARATOR}
 * between two that touch, and each run of squares without one a letter: `a`
 * for one square up to `z` for 26. Then, where there are walls, a comma and
 * the edges as a list of walls and gaps (`engine/wall-runs.ts`), whose order
 * is `engine/square-edges.ts`'s. */
export function encodeDesc(ends: Uint8Array, walls?: Uint8Array): string {
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
  if (walls?.includes(1)) out += WALLS + encodeWallRuns(walls);
  return out;
}

function parseDesc(p: PathParams, desc: string): DescParse<PathPuzzle> {
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
        ends[k++] = r.int(1, MAX_NUMBER);
        afterNumber = true;
      }
    }
    const edgeCount = squareEdges(p.w, p.h).edgeCount;
    let walls: Uint8Array = new Uint8Array(edgeCount);
    if (r.peekIs((c) => c === WALLS)) {
      r.expect(WALLS);
      walls = readWallRuns(r, edgeCount);
    }
    r.end();
    const count = new Map<number, number>();
    for (const v of ends) if (v !== NO_END) count.set(v, (count.get(v) ?? 0) + 1);
    // The numbers run from 1 with no gap: a Pairs number names its pair's
    // color, and a Path line passes every number in order.
    if (count.size === 0) r.fail(DESC_OUT_OF_RANGE);
    for (const v of count.keys()) if (v > count.size) r.fail(DESC_OUT_OF_RANGE);
    if (p.mode === MODE_PATH) {
      for (const n of count.values()) if (n !== 1) r.fail(DESC_REPEATED);
      // A line has two ends.
      if (count.size < 2) r.fail(DESC_OUT_OF_RANGE);
    } else {
      for (const n of count.values()) if (n !== 2) r.fail(DESC_UNPAIRED);
    }
    return puzzleOf(p, ends, walls);
  });
}

export function newState(p: PathParams, desc: string): PathState {
  const puzzle = descValue(parseDesc(p, desc));
  return { ...puzzle, edges: startEdges(puzzle) };
}

function cloneState(s: PathState): PathState {
  return { ...s, edges: s.edges.slice() };
}

/** A move's board. Pure: `s` is left as it was. No move changes a wall. */
export function executeMove(s: PathState, move: PathMove): PathState {
  const next = cloneState(s);
  if (move.kind === "solve") {
    next.edges.set(move.edges);
  } else if (move.kind === "edges") {
    for (const { edge, mark } of move.changes)
      if (!s.walls[edge]) next.edges[edge] = mark;
  } else {
    return assertNever(move, "path: executeMove");
  }
  return next;
}

// --- text format ------------------------------------------------------------

/** The numbers on a grid of `+`, with `-` and `|` for lines, `x` for crosses
 * and `#` for walls between them. */
export function textFormat(s: PathState): string {
  const { w, h, ends, edges, walls } = s;
  const g = squareEdges(w, h);
  const width = ends.some((v) => v > 9) ? String(Math.max(...ends)).length : 1;
  const cell = (i: number): string =>
    (ends[i] === NO_END ? "+" : String(ends[i])).padStart(width, " ");
  const join = (e: number, line: string): string =>
    walls[e] ? "#" : edges[e] === LINE ? line : edges[e] === CROSS ? "x" : " ";
  let out = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      out += cell(i);
      if (x < w - 1) out += join(g.around[i * 4 + RIGHT], "-");
    }
    out += "\n";
    if (y === h - 1) break;
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      out += join(g.around[i * 4 + DOWN], "|").padStart(width, " ");
      if (x < w - 1) out += " ";
    }
    out += "\n";
  }
  return out;
}
