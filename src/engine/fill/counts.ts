/**
 * A clue at the board drawn as a row of counts beneath it (`play.counts`,
 * Undead's totals of each monster): each record its value's piece, a tile,
 * then its count, a tile, the records half a tile apart from the board's
 * left. A press on a record's piece or count places its value, as its key
 * does. Where the row lies, for the renderer, the input and the canvas.
 *
 * The row's other parts: the site that draws it, `render/sites/counts.ts`,
 * and the compiler's check of `play.counts`, `describe/fill/play.ts`.
 */

import type { Rect } from "../contract/types.ts";
import { type FieldClue, type FillBoard, isFieldClue } from "./board.ts";
import type { FillPlay } from "./play.ts";

/** The tiles a record takes: its piece, then its count. */
const RECORD = 2;
/** The tiles between two records. */
const SPACE = 0.5;
/** The tiles the row takes down the canvas: its own, and a quarter below. */
export const COUNTS_HEIGHT = 1.25;

/** A clue at the board drawn as counts: its kind, and the field whose value
 * each record's piece shows. */
export interface CountedKind {
  readonly kind: string;
  readonly field: string;
}

/** The clue at the board `play` draws as counts, or `null`. */
export function countedOf(play: FillPlay): CountedKind | null {
  const [entry, ...more] = Object.entries(play.counts ?? {});
  if (entry === undefined) return null;
  if (more.length > 0) throw new Error("play counts: one clue at the board a row");
  return { kind: entry[0], field: entry[1] };
}

/** The tiles across a row of `n` records. */
export const countsAcross = (n: number): number =>
  n === 0 ? 0 : n * RECORD + (n - 1) * SPACE;

/** One record of the row: the value its piece shows and its count. */
export interface CountRecord {
  readonly value: number;
  readonly count: number;
}

/** The records of board `b`'s clue `counted`, in the order dealt. */
export function countRecords<C>(b: FillBoard<C>, counted: CountedKind): CountRecord[] {
  const clue = b.dealt[counted.kind as keyof C] as unknown as FieldClue;
  if (!isFieldClue(clue))
    throw new Error(`play counts: ${counted.kind} is no clue at the board`);
  const fields = Object.keys(clue).filter((f) => f !== "n" && f !== counted.field);
  const values = clue[counted.field] as readonly number[];
  const counts = clue[fields[0]] as readonly number[];
  return values.map((value, i) => ({ value, count: counts[i] }));
}

/** Where record `i` of a row whose top left is `(x, y)` draws its piece and
 * its count, at tile size `ts`. */
export function countBoxes(
  x: number,
  y: number,
  i: number,
  ts: number,
): { readonly piece: Rect; readonly count: Rect } {
  const left = x + Math.round(i * (RECORD + SPACE) * ts);
  return {
    piece: { x: left, y, w: ts, h: ts },
    count: { x: left + ts, y, w: ts, h: ts },
  };
}

/** The record of a row of `n` whose top left is `(x, y)` that a press at
 * `(px, py)` lands on, or `-1`. */
export function countPressed(
  x: number,
  y: number,
  n: number,
  ts: number,
  px: number,
  py: number,
): number {
  if (py < y || py >= y + ts) return -1;
  for (let i = 0; i < n; i++) {
    const { piece } = countBoxes(x, y, i, ts);
    if (px >= piece.x && px < piece.x + RECORD * ts) return i;
  }
  return -1;
}
