/**
 * A clue at the board drawn as a row of counts beneath it (`play.counts`,
 * Undead's totals of each monster): each record its value's piece, then its
 * count, the row as wide as the board and its right margin, as upstream
 * undead.c's `calculate_count_layout` fits its counts to the board. A press
 * on a record places its value, as its key does. How a count reads is the
 * player's preference where the description declares one
 * (`play.countStyle`): the total, how many are left to place, or both
 * against what is placed. Where the row lies and what it says, for the
 * renderer, the input and the canvas.
 *
 * The row's other parts: the site that draws it, `render/sites/counts.ts`,
 * and the compiler's check of `play.counts`, `describe/fill/play.ts`.
 */

import type { Rect } from "../contract/types.ts";
import { type FieldClue, type FillBoard, isFieldClue } from "./board.ts";
import type { FillPlay, FillUi } from "./play.ts";

/** A record's piece, in tiles across and down. */
const PIECE = 2 / 3;
/** The tiles between a record's piece and its count. */
const PAD = 0.1;
/** The tiles between two records. */
const SPACE = 1 / 3;
/** A count's largest font, in tiles, and a digit's width in its font's. */
const EM = 0.5;
const DIGIT = 0.6;
/** The tiles the row takes down the canvas: its own, and a quarter below. */
export const COUNTS_HEIGHT = 1.25;

/** How a count may read, upstream's order, which the preference's choices
 * keep: the total; how many are placed past it, negative while some are
 * left; placed over total; and left to place over total. */
export const COUNT_STYLES = [
  "Total",
  "Remaining",
  "Placed/Total",
  "Left/Total",
] as const;
const TOTAL = 0;
const REMAINING = 1;
const PLACED_TOTAL = 2;
/** Upstream's default where the player may choose. */
const LEFT_TOTAL = 3;

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

/** How the counts of a board of `play` read for a player whose Ui is `ui`:
 * the total where the description declares no preference. */
export const countStyleOf = (play: FillPlay, ui: FillUi): number =>
  play.countStyle === undefined ? TOTAL : (ui.countStyle ?? LEFT_TOTAL);

/** The tiles across the row beneath a board `w` wide: the board's, and its
 * right margin's. */
export const countsAcross = (w: number): number => w + 1;

/** One record of the row: the value its piece shows, its count, and how
 * many of the value the board holds. */
export interface CountRecord {
  readonly value: number;
  readonly count: number;
  readonly placed: number;
}

/** The records of board `b`'s clue `counted`, in the order dealt. */
export function countRecords<C>(b: FillBoard<C>, counted: CountedKind): CountRecord[] {
  const clue = b.dealt[counted.kind as keyof C] as unknown as FieldClue;
  if (!isFieldClue(clue))
    throw new Error(`play counts: ${counted.kind} is no clue at the board`);
  const fields = Object.keys(clue).filter((f) => f !== "n" && f !== counted.field);
  const values = clue[counted.field] as readonly number[];
  const counts = clue[fields[0]] as readonly number[];
  return values.map((value, i) => ({
    value,
    count: counts[i],
    placed: b.values.reduce((n, v) => (v === value ? n + 1 : n), 0),
  }));
}

/** A signed number, with a minus sign, not a hyphen. */
const signed = (n: number): string => (n < 0 ? `−${-n}` : String(n));

/** What record `r` reads in style `style`. */
export function countText(style: number, r: CountRecord): string {
  if (style === REMAINING) return signed(r.placed - r.count);
  if (style === PLACED_TOTAL) return `${r.placed}/${r.count}`;
  if (style === LEFT_TOTAL) return `${signed(r.count - r.placed)}/${r.count}`;
  return String(r.count);
}

/** The digits' widths a count of style `style` takes, its totals `digits`
 * long; a slash or a sign is about half a digit's, upstream's measure. */
const widthOf = (style: number, digits: number): number =>
  style === REMAINING
    ? 1 + digits
    : style === PLACED_TOTAL
      ? 2 * digits + 0.5
      : style === LEFT_TOTAL
        ? 2 * digits + 1.5
        : digits;

/** Where a row of `records` lies, in tiles from its left: each record's
 * left, the count's box after its piece, and the font each style's count
 * is drawn in, each record as wide as the widest style needs so that the
 * row lies the same whichever the player chooses. */
export interface CountsLayout {
  readonly lefts: readonly number[];
  readonly text: number;
  readonly font: (style: number) => number;
}

/** The layout of `records` in a row `across` tiles wide. */
export function countsLayout(
  records: readonly CountRecord[],
  across: number,
): CountsLayout {
  const n = records.length;
  const digits = String(Math.max(0, ...records.map((r) => r.count))).length;
  const widest = widthOf(LEFT_TOTAL, digits);
  const fixed = n * (PIECE + PAD) + Math.max(0, n - 1) * SPACE;
  const font = Math.min(EM, (across - fixed) / Math.max(1, n * widest * DIGIT));
  const text = widest * DIGIT * font;
  const record = PIECE + PAD + text;
  const used = n * record + Math.max(0, n - 1) * SPACE;
  const start = Math.max(0, (across - used) / 2);
  return {
    lefts: records.map((_, i) => start + i * (record + SPACE)),
    text,
    font: (style) => Math.min(EM, text / (widthOf(style, digits) * DIGIT)),
  };
}

/** Where record `i` of a row laid out `lay` whose top left is `(x, y)`
 * draws its piece and its count, at tile size `ts`. */
export function countBoxes(
  lay: CountsLayout,
  x: number,
  y: number,
  i: number,
  ts: number,
): { readonly piece: Rect; readonly count: Rect } {
  const left = x + Math.round(lay.lefts[i] * ts);
  const size = Math.round(PIECE * ts);
  return {
    piece: { x: left, y: y + Math.floor((ts - size) / 2), w: size, h: size },
    count: {
      x: left + Math.round((PIECE + PAD) * ts),
      y,
      w: Math.ceil(lay.text * ts),
      h: ts,
    },
  };
}

/** The record of a row laid out `lay` whose top left is `(x, y)` that a
 * press at `(px, py)` lands on, or `-1`. */
export function countPressed(
  lay: CountsLayout,
  x: number,
  y: number,
  ts: number,
  px: number,
  py: number,
): number {
  if (py < y || py >= y + ts) return -1;
  for (let i = 0; i < lay.lefts.length; i++) {
    const { piece, count } = countBoxes(lay, x, y, i, ts);
    if (px >= piece.x && px < count.x + count.w) return i;
  }
  return -1;
}
