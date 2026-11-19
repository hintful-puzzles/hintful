/**
 * Wordtrail's state, params, move and ui types, and its desc codec.
 *
 * The board is a letter on each square or a dark square, and the list of the
 * words' lengths, which the desc gives and play never changes, and a mark on
 * every edge between two squares that share a side: nothing yet, a line
 * (the two letters are one straight after the other in a word), or a cross
 * saying they are not. A move only writes edges.
 */

import { assertNever } from "../../engine/assert-never.ts";
import {
  DESC_OUT_OF_RANGE,
  type DescParse,
  descValue,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { difficultyItem } from "../../engine/difficulty.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/game.ts";
import {
  CROSS,
  type EdgeChange,
  type EdgeMark,
  LINE,
  type LineDrawingUi,
} from "../../engine/line-drawing.ts";
import { dimensionParamConfig, numberItem } from "../../engine/params.ts";
import { choice, dims, num, paramsCodec } from "../../engine/params-codec.ts";
import { DOWN, RIGHT, squareEdges } from "../../engine/square-edges.ts";
import { WORD_LENGTHS } from "../../engine/word-list/index.ts";
import * as wordtrail from "../../generated/games/wordtrail/wordtrail.compiled.ts";
import { letterChar, type Trail, trailsOf } from "./trails.ts";

/** The shortest and longest words the list holds. */
export const SHORTEST = WORD_LENGTHS[0];
export const LONGEST = WORD_LENGTHS[WORD_LENGTHS.length - 1];

// --- types ------------------------------------------------------------------

export interface WordtrailParams {
  w: number;
  h: number;
  /** How many words the board divides into. */
  words: number;
  /** {@link DIFF_EASY} or {@link DIFF_NORMAL}. */
  diff: number;
}

// --- difficulty -------------------------------------------------------------

/** Every line follows from one letter's trails at a time. */
export const DIFF_EASY = 0;
/** Needs the only trails of a length found over the whole board. */
export const DIFF_NORMAL = 1;

const DIFF_NAMES: readonly string[] = wordtrail.tiers;

/** The `d<char>` params suffix, by tier. */
const DIFF_CHARS = "en";

export interface WordtrailState {
  w: number;
  h: number;
  /** A letter a square, 1 for a to 26 for z, and 0 for a dark square.
   * Shared between states. */
  letters: Uint8Array;
  /** Each word's length, shortest first. Shared between states. */
  lengths: readonly number[];
  /** Every trail of the letters that spells a word of a listed length
   * (`trails.ts`). Shared between states. */
  trails: readonly Trail[];
  /** An {@link EdgeMark} per edge, indexed as `engine/square-edges.ts`
   * numbers them. An edge beside a dark square stays open. */
  edges: Uint8Array;
}

/** A move sets edges to marks: the edges a drag or a key changed, or every
 * edge for a solve. */
export type WordtrailMove =
  | { kind: "edges"; changes: readonly EdgeChange[] }
  | { kind: "solve"; edges: readonly EdgeMark[] };

export type WordtrailUi = LineDrawingUi;

// --- params -----------------------------------------------------------------

/** The "Custom type…" form, and the fields the codec below reads and writes. */
export const paramConfig: ParamConfigItem<WordtrailParams>[] = [
  ...dimensionParamConfig<WordtrailParams>({
    doc: "Size of the grid in squares.",
    bounds: { min: 2, max: 8 },
  }),
  numberItem<WordtrailParams>("words", "Words", "words", {
    doc: `How many words the letters divide into, each ${SHORTEST} to ${LONGEST} letters long. About a quarter of the squares are dark.`,
    bounds: { min: 1, max: 16 },
  }),
  difficultyItem(DIFF_NAMES, "diff", {
    doc: "<p><em>Easy</em> puzzles can be finished one letter at a time, from the words that fit through it.</p><p><em>Normal</em> puzzles also need you to find, somewhere on the board, the only words of some length that still fit.</p>",
  }),
];

const BOARDS: WordtrailParams[] = [
  { w: 4, h: 4, words: 3, diff: DIFF_EASY },
  { w: 4, h: 6, words: 4, diff: DIFF_EASY },
  { w: 5, h: 5, words: 4, diff: DIFF_EASY },
  { w: 5, h: 7, words: 5, diff: DIFF_EASY },
  { w: 7, h: 7, words: 6, diff: DIFF_EASY },
];

/** Normal, so that the board the cross-game guards deal needs every rung. */
export function defaultParams(): WordtrailParams {
  return { w: 5, h: 5, words: 4, diff: DIFF_NORMAL };
}

export const menu: PresetBoards<WordtrailParams> = { boards: BOARDS };

export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  num(paramConfig, "n", "words"),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
]);

/** The fewest and most letters a board of `p` holds: between about two
 * thirds and four fifths of its squares, and no more than its words can
 * spell. */
export function letterRange(p: WordtrailParams): { least: number; most: number } {
  const area = p.w * p.h;
  return {
    least: Math.max(Math.ceil(area * 0.6), SHORTEST * p.words),
    most: Math.min(Math.floor(area * 0.8), LONGEST * p.words),
  };
}

export function validateParams(p: WordtrailParams, _full: boolean): string | null {
  if (p.w < 2 || p.h < 2) return "Width and height must both be at least two.";
  if (p.w > 8 || p.h > 8) return "Width and height must both be at most eight.";
  if (p.words < 1) return "There must be at least one word.";
  const { least, most } = letterRange(p);
  if (least > most)
    return p.words * SHORTEST > Math.floor(p.w * p.h * 0.8)
      ? "Too many words for a grid this size."
      : "Too few words for a grid this size.";
  return null;
}

// --- desc -------------------------------------------------------------------

/** The board as the desc holds it. */
export interface Board {
  letters: Uint8Array;
  lengths: readonly number[];
}

/** The lengths, a digit each, shortest first; a comma; then the squares in
 * reading order, a letter each, and a run of dark squares as its count. */
export function encodeDesc({ letters, lengths }: Board): string {
  let grid = "";
  let dark = 0;
  for (const letter of letters) {
    if (letter === 0) {
      dark++;
      continue;
    }
    if (dark > 0) grid += String(dark);
    dark = 0;
    grid += letterChar(letter);
  }
  if (dark > 0) grid += String(dark);
  return `${[...lengths].sort((a, b) => a - b).join("")},${grid}`;
}

const isLength = (c: string): boolean =>
  c.length === 1 && c >= String(SHORTEST) && c <= String(LONGEST);
const isLetter = (c: string): boolean => c.length === 1 && c >= "a" && c <= "z";

function parseDesc(p: WordtrailParams, desc: string): DescParse<Board> {
  return readDesc(desc, (r) => {
    const lengths: number[] = [];
    while (!r.accept(",")) lengths.push(Number(r.char(isLength)));
    if (lengths.length === 0) r.fail(DESC_OUT_OF_RANGE);
    const letters = new Uint8Array(p.w * p.h);
    let at = 0;
    while (at < letters.length) {
      if (r.peekIs(isLetter)) {
        letters[at++] = r.char().charCodeAt(0) - 96;
      } else {
        // A run of dark squares, already zero.
        at += r.int(1, letters.length - at);
      }
    }
    r.end();
    const total = lengths.reduce((a, b) => a + b, 0);
    if (total !== letters.filter((l) => l !== 0).length) r.fail(DESC_OUT_OF_RANGE);
    return { letters, lengths: lengths.sort((a, b) => a - b) };
  });
}

export function newState(p: WordtrailParams, desc: string): WordtrailState {
  const { letters, lengths } = descValue(parseDesc(p, desc));
  return {
    w: p.w,
    h: p.h,
    letters,
    lengths,
    trails: trailsOf(p.w, p.h, letters, lengths),
    edges: new Uint8Array(squareEdges(p.w, p.h).edgeCount),
  };
}

/** Whether edge `e` lies beside a dark square, where no line can go. */
export function isDarkEdge(state: WordtrailState, e: number): boolean {
  const g = squareEdges(state.w, state.h);
  return state.letters[g.a[e]] === 0 || state.letters[g.b[e]] === 0;
}

function cloneState(s: WordtrailState): WordtrailState {
  return { ...s, edges: s.edges.slice() };
}

/** A move's board. Pure: `s` is left as it was. */
export function executeMove(s: WordtrailState, move: WordtrailMove): WordtrailState {
  const next = cloneState(s);
  if (move.kind === "solve") {
    next.edges.set(move.edges);
  } else if (move.kind === "edges") {
    for (const { edge, mark } of move.changes)
      if (!isDarkEdge(s, edge)) next.edges[edge] = mark;
  } else {
    return assertNever(move, "wordtrail: executeMove");
  }
  return next;
}

// --- text format ------------------------------------------------------------

/** The letters in capitals and `#` for a dark square, with `-` and `|` for
 * lines and `x` for crosses between them, and the lengths below. */
export function textFormat(s: WordtrailState): string {
  const { w, h, letters, edges } = s;
  const g = squareEdges(w, h);
  const join = (e: number, line: string): string =>
    edges[e] === LINE ? line : edges[e] === CROSS ? "x" : " ";
  let out = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      out += letters[i] === 0 ? "#" : letterChar(letters[i]).toUpperCase();
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
  return `${out}Words: ${s.lengths.join(", ")}\n`;
}
