/**
 * A clue at the board whose records are lists, drawn as a list beneath it
 * (`play.list`, Crossing's numbers): each record its members' glyphs, in
 * columns as many rows deep as fit the board's width, struck once its
 * meaning holds of the board as placed. Where each record lies, for the
 * renderer and the canvas; a hint marks a record at its point beneath the
 * grid (`recordPoint`), which the list's site draws the mark round.
 *
 * The list's other parts: the site that draws it, `render/sites/record-list.ts`,
 * and the compiler's `recordHolds`, `describe/fill/play.ts`.
 */

import type { Point } from "../contract/types.ts";
import { type FieldClue, type FillBoard, isFieldClue } from "./board.ts";
import type { FillPlay } from "./play.ts";

/** The tiles the list's rows take down, upstream crossing.c's panel. */
const PANEL = 2.8;
/** The tiles the list takes down the canvas: its rows, and room below the
 * last for its digits' descent and a ring. */
export const LIST_HEIGHT = 3;
/** A row's pitch over its font, and a digit's width in its font's. */
const LEADING = 1.4;
const DIGIT = 0.6;
/** Bounds upstream's growing of the rows, which stops once each column holds
 * one record. */
const MAX_ROWS = 1000;

/** The clue at the board `play` draws as a list, or `null`. */
export const listedOf = (play: FillPlay): string | null => play.list ?? null;

/** The members of each record of board `b`'s clue `kind`, in the order
 * dealt. */
export function listRecords<C>(
  b: FillBoard<C>,
  kind: string,
): readonly ArrayLike<number>[] {
  const clue = b.dealt[kind as keyof C] as unknown as FieldClue;
  if (!isFieldClue(clue)) throw new Error(`play list: ${kind} is no clue at the board`);
  const [field] = Object.keys(clue).filter((f) => f !== "n");
  return clue[field] as readonly ArrayLike<number>[];
}

/** Where one record lies, in tiles from the list's top left: its text's
 * left and baseline, and how wide it is. */
export interface ListSlot {
  readonly x: number;
  readonly y: number;
  readonly w: number;
}

/** The list's font and row pitch, in tiles, and each record's slot. */
export interface ListLayout {
  readonly font: number;
  readonly row: number;
  readonly slots: readonly ListSlot[];
}

/**
 * The layout of records `lengths` long, a member a glyph, across `across`
 * tiles: upstream `draw_numbers`' loop, which grows the rows, and shrinks the
 * font, until the widest record of each column fits, then spreads the slack
 * between the columns.
 */
export function listLayout(lengths: readonly number[], across: number): ListLayout {
  const count = lengths.length;
  if (count === 0) return { font: 0, row: 0, slots: [] };
  let rows = 4;
  let space = 0.8;
  let font = 0;
  for (let guard = 0; guard < MAX_ROWS; guard++) {
    font = PANEL / rows / LEADING;
    // In fonts: each column as wide as its last record, the longest of a
    // list held sorted by length.
    let text = -space;
    for (let i = rows - 1; i < count + rows - 1; i += rows)
      text += lengths[Math.min(i, count - 1)] * DIGIT + space;
    if (font * text <= across) {
      if (count > rows) space += (across / font - text) / (Math.ceil(count / rows) - 1);
      break;
    }
    // A row more would make the text smaller than shrinking it here does.
    if (across / text > PANEL / (rows + 1) / LEADING) {
      font = across / text;
      break;
    }
    rows++;
  }
  const row = PANEL / rows;
  const slots: ListSlot[] = [];
  let x = -space * font;
  let y = 0;
  let last = 0;
  for (let i = 0; i < count; i++) {
    if (i % rows === 0) {
      x += (last * DIGIT + space) * font;
      y = row;
    }
    last = lengths[i];
    slots.push({ x, y, w: last * DIGIT * font });
    y += row;
  }
  return { font, row, slots };
}

/** The point beneath a `h` high board's grid that a hint marks record `k`
 * of a clue at the board at: off the grid and every slot. */
export const recordPoint = (h: number, k: number): Point => ({ x: k, y: h + 1 });

/** The record whose point is `p` beneath a `h` high board, or `-1`. */
export const recordAt = (h: number, p: Point): number =>
  p.y === h + 1 && p.x >= 0 ? p.x : -1;
