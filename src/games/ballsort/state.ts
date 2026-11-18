/**
 * Ball Sort's state, params, move and ui types, and its desc codec.
 *
 * The board is the description's one layer, `ball`: a grid as wide as there
 * are tubes and as tall as a tube holds, in reading order, so a column is a
 * tube and its top row the tube's mouth. A slot holds a color from 1, or 0
 * where it is empty, and a tube's balls rest at its bottom.
 */

import { rejectMove } from "../../engine/assert-never.ts";
import { type DescParse, descValue, puzzleDescError } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { describedSpace } from "../../engine/describe-runtime.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/game.ts";
import { numberItem } from "../../engine/params.ts";
import { num, paramsCodec, size } from "../../engine/params-codec.ts";
import { type GridCursor, newCursor } from "../../engine/pointer.ts";
import type { GameStatus } from "../../engine/types.ts";
import * as ballsort from "../../generated/games/ballsort/ballsort.compiled.ts";

// --- types ------------------------------------------------------------------

export interface BallsortParams {
  /** How many colors, each as many balls as a tube holds. */
  colors: number;
  /** How many balls a tube holds. */
  capacity: number;
  /** How many tubes start empty, beside one a color. */
  spare: number;
}

export interface BallsortState {
  /** How many tubes: the grid's width. */
  readonly w: number;
  /** How many balls a tube holds: the grid's height. */
  readonly h: number;
  readonly colors: number;
  /** The description's `ball` layer: each slot's color, 0 where it is empty,
   * row 0 the tubes' mouths. */
  readonly ball: Int32Array;
}

/** A pour of the top run of one tube into another, by their indices. How many
 * balls go is the board's to say, so the move does not. */
export type BallsortPour = { type: "pour"; from: number; to: number };

/** Solve: the sorted board, each tube's color, 0 for one left empty. */
export type BallsortSolve = { type: "solve"; tubes: readonly number[] };

export type BallsortMove = BallsortPour | BallsortSolve;

export interface BallsortUi {
  /** The tube whose top run is picked up to pour, or null. */
  held: number | null;
  /** The keyboard cursor: `x` is the tube it is on, `y` always 0. */
  cursor: GridCursor;
  /** A press in progress: the tube it began on, where it was pressed, where
   * the pointer is, and whether it has moved off as a drag; null between
   * presses. */
  drag: {
    from: number;
    pressX: number;
    pressY: number;
    x: number;
    y: number;
    moved: boolean;
  } | null;
}

// --- params -----------------------------------------------------------------

/** The most colors a board deals: the palette's set of colors made to be
 * told apart (`FREE`), each drawn with a symbol of its own. */
export const MAX_COLORS = 10;

/** The "Custom type…" form, and the fields the codec below reads and writes. */
export const paramConfig: ParamConfigItem<BallsortParams>[] = [
  numberItem<BallsortParams>("colors", "Colors", "colors", {
    doc: "How many colors the balls come in. There is one full tube of balls for each color.",
    bounds: { min: 2, max: MAX_COLORS },
    label: { slot: "size", words: (p) => `${p.colors} colors` },
  }),
  numberItem<BallsortParams>("tube-size", "Balls per tube", "capacity", {
    doc: "How many balls a tube holds, which is also how many balls there are of each color.",
    bounds: { min: 2, max: 6 },
    label: {
      slot: "kind",
      words: (p) => (p.capacity === DEFAULT_CAPACITY ? null : `${p.capacity} per tube`),
    },
  }),
  numberItem<BallsortParams>("spare", "Empty tubes", "spare", {
    doc: "How many tubes start empty. With two there is room to dig for a color; with one, every pour has to be planned.",
    bounds: { min: 1, max: 3 },
    label: {
      slot: "tail",
      words: (p) => (p.spare === 1 ? "1 empty tube" : `${p.spare} empty tubes`),
    },
  }),
];

const DEFAULT_CAPACITY = 4;

const board = (colors: number, spare: number): BallsortParams => ({
  colors,
  capacity: DEFAULT_CAPACITY,
  spare,
});

export function defaultParams(): BallsortParams {
  return board(7, 2);
}

export const menu: PresetBoards<BallsortParams> = {
  boards: [board(4, 2), board(7, 2), board(9, 2), board(5, 1), board(7, 1)],
};

/** `<colors>h<capacity>e<spare>`: `7h4e2`. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  size(paramConfig, "colors"),
  num(paramConfig, "h", "tube-size"),
  num(paramConfig, "e", "spare"),
]);

/**
 * Refuses, for a deal only, a board the generator cannot deal in good time
 * (`add-ball-sort` design D3, measured 2026-11-18). With one empty tube few
 * shuffles can be sorted, and past 48 balls almost none; with three, the
 * positions a deal reaches near the search's budget past 30 balls. With two,
 * every size the dialog allows deals within a second.
 */
export function validateParams(p: BallsortParams, full: boolean): string | null {
  if (!full) return null;
  const balls = p.colors * p.capacity;
  if (p.spare === 1 && balls > MOST_BALLS_ONE_EMPTY)
    return `With one empty tube, a board can have at most ${MOST_BALLS_ONE_EMPTY} balls.`;
  if (p.spare === 3 && balls > MOST_BALLS_THREE_EMPTY)
    return `With three empty tubes, a board can have at most ${MOST_BALLS_THREE_EMPTY} balls.`;
  return null;
}

const MOST_BALLS_ONE_EMPTY = 48;
const MOST_BALLS_THREE_EMPTY = 30;

// --- desc -------------------------------------------------------------------

/** The letter of each color, from 1: `a` is color 1. */
const COLOR_LETTERS = "abcdefghij";

/** Where one tube's balls end and the next tube's begin. */
const TUBE_BREAK = ",";

/** Each tube's balls from the bottom up, a letter each, tubes split by
 * {@link TUBE_BREAK}: `abca,bcab,,` is two full tubes of four and two empty. */
export function encodeDesc(s: BallsortState): string {
  const tubes: string[] = [];
  for (let t = 0; t < s.w; t++) {
    let tube = "";
    for (let y = s.h - 1; y >= 0; y--) {
      const v = s.ball[y * s.w + t];
      if (v !== 0) tube += COLOR_LETTERS[v - 1];
    }
    tubes.push(tube);
  }
  return tubes.join(TUBE_BREAK);
}

function parseDesc(p: BallsortParams, desc: string): DescParse<Int32Array> {
  const w = p.colors + p.spare;
  const h = p.capacity;
  const letters = COLOR_LETTERS.slice(0, p.colors);
  return readDesc(desc, (r) => {
    const ball = new Int32Array(w * h);
    const counts = new Array<number>(p.colors + 1).fill(0);
    for (let t = 0; t < w; t++) {
      if (t > 0) r.expect(TUBE_BREAK);
      for (let y = h - 1; y >= 0; y--) {
        const c = r.peek();
        if (c === null || !letters.includes(c)) break;
        r.char();
        const v = letters.indexOf(c) + 1;
        ball[y * w + t] = v;
        counts[v]++;
      }
    }
    r.end();
    if (counts.some((n, v) => v > 0 && n !== h)) {
      r.fail(
        puzzleDescError(
          "This game ID does not have one tube's worth of balls of every color.",
        ),
      );
    }
    return ball;
  });
}

export function newState(p: BallsortParams, desc: string): BallsortState {
  return {
    w: p.colors + p.spare,
    h: p.capacity,
    colors: p.colors,
    ball: descValue(parseDesc(p, desc)),
  };
}

export function newUi(_s: BallsortState): BallsortUi {
  return { held: null, cursor: newCursor(0, 0), drag: null };
}

// --- tubes ------------------------------------------------------------------

/** How many balls tube `t` holds. */
export function heightOf(s: BallsortState, t: number): number {
  let n = 0;
  for (let y = s.h - 1; y >= 0 && s.ball[y * s.w + t] !== 0; y--) n++;
  return n;
}

/** The color on top of tube `t`, 0 for an empty tube. */
export function topColor(s: BallsortState, t: number): number {
  const n = heightOf(s, t);
  return n === 0 ? 0 : s.ball[(s.h - n) * s.w + t];
}

/** How many balls of the top color lie in an unbroken run at the top of
 * tube `t`. */
export function topRun(s: BallsortState, t: number): number {
  const n = heightOf(s, t);
  if (n === 0) return 0;
  const color = s.ball[(s.h - n) * s.w + t];
  let run = 0;
  for (let y = s.h - n; y < s.h && s.ball[y * s.w + t] === color; y++) run++;
  return run;
}

/** Whether tube `t` is full of one color. */
export function isSorted(s: BallsortState, t: number): boolean {
  return topRun(s, t) === s.h;
}

// --- rules ------------------------------------------------------------------

/** The description's rules on a board of this size. */
export function rulesOf(s: { readonly w: number; readonly h: number }) {
  return ballsort.rules(describedSpace(ballsort.units, s.w, s.h), {}, []);
}

/** A board's balls as the description's layer. */
export const positionOf = (s: BallsortState): ballsort.Position => ({ ball: s.ball });

/** `m` as the description's pour where the rules allow it on `s`, or null:
 * the top ball of one tube, and the lowest empty slot of another. */
export function legalPour(s: BallsortState, m: BallsortPour): ballsort.Move | null {
  const { w, h } = s;
  const tube = (t: number) => Number.isInteger(t) && t >= 0 && t < w;
  if (!tube(m.from) || !tube(m.to) || m.from === m.to) return null;
  const nf = heightOf(s, m.from);
  const nt = heightOf(s, m.to);
  if (nf === 0 || nt === h) return null;
  const pour: ballsort.Move = {
    move: "pour",
    f: (h - nf) * w + m.from,
    t: (h - nt - 1) * w + m.to,
  };
  return rulesOf(s).legal(positionOf(s), pour) ? pour : null;
}

/** The board after pour `m`, which must be legal. */
export function poured(s: BallsortState, m: BallsortPour): BallsortState {
  const pour = legalPour(s, m);
  if (pour === null) throw new Error("ballsort: an illegal pour");
  return { ...s, ball: rulesOf(s).play(positionOf(s), pour).ball };
}

/** Every pour `s` allows, in order of the tube poured from, then into. */
export function legalPours(s: BallsortState): BallsortPour[] {
  const out: BallsortPour[] = [];
  for (let from = 0; from < s.w; from++) {
    for (let to = 0; to < s.w; to++) {
      const m: BallsortPour = { type: "pour", from, to };
      if (legalPour(s, m) !== null) out.push(m);
    }
  }
  return out;
}

export function status(s: BallsortState): GameStatus {
  return rulesOf(s).finished(positionOf(s)) ? "solved" : "ongoing";
}

/** The sorted board with tube `t` full of `tubes[t]`, or empty where it is 0. */
export function sortedBoard(s: BallsortState, tubes: readonly number[]): BallsortState {
  if (tubes.length !== s.w) throw new Error("ballsort: a solve for another board");
  const ball = new Int32Array(s.w * s.h);
  tubes.forEach((v, t) => {
    if (!Number.isInteger(v) || v < 0 || v > s.colors) {
      throw new Error("ballsort: a solve with a color the board does not have");
    }
    for (let y = 0; y < s.h; y++) ball[y * s.w + t] = v;
  });
  return { ...s, ball };
}

// --- text format ------------------------------------------------------------

/** One row a slot, the mouths at the top; `.` an empty slot. */
export function textFormat(s: BallsortState): string {
  const rows: string[] = [];
  for (let y = 0; y < s.h; y++) {
    let row = "";
    for (let t = 0; t < s.w; t++) {
      const v = s.ball[y * s.w + t];
      row += v === 0 ? "." : COLOR_LETTERS[v - 1];
    }
    rows.push(row);
  }
  return rows.join("\n");
}

// --- move serialization ----------------------------------------------------

/** `P<from>,<to>` for a pour, `S<color>,…` for a solve. */
export function serializeMove(m: BallsortMove): unknown {
  if (m.type === "solve") return `S${m.tubes.join(",")}`;
  return `P${m.from},${m.to}`;
}

export function deserializeMove(raw: unknown): BallsortMove {
  const s = String(raw);
  const pour = s.match(/^P(\d+),(\d+)$/);
  if (pour) {
    return {
      type: "pour",
      from: Number.parseInt(pour[1], 10),
      to: Number.parseInt(pour[2], 10),
    };
  }
  const solve = s.match(/^S(\d+(?:,\d+)*)$/);
  // `raw` rather than `s`, which renders an object as "[object Object]".
  if (!solve) rejectMove(raw, "ballsort: deserializeMove");
  return {
    type: "solve",
    tubes: solve[1].split(",").map((n) => Number.parseInt(n, 10)),
  };
}
