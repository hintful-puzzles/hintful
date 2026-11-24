/** The `digits` segment: a kind's clues at cells as digits between runs of
 * cells without one, and beside them the kinds its letters and numbers stand
 * for. */

import {
  DESC_MALFORMED,
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
} from "../../contract/desc-error.ts";
import { isDigit } from "../../game-id/decimal.ts";
import type { DescReader } from "../../game-id/desc-reader.ts";
import { encodeRunLength } from "../../game-id/run-length.ts";
import {
  type ClueList,
  clueList,
  type GridSpace,
  inHexagon,
  type Partition,
} from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import { type ClueMax, type FillDeal, partitionOfKind } from "../game-id.ts";
import { type Decoding, maxOf, type SegmentKind } from "./segment.ts";

export type DigitsSegment = {
  readonly digits: string;
  readonly apart?: string;
  /** Written before the segment, which is written only where a clue of the
   * kind is dealt (Towers' givens after `,`), unless `always`. */
  readonly before?: string;
  /** The segment behind `before` is written with no clue dealt too, as its
   * blanks (Seismic's `,zj`). */
  readonly always?: true;
  /** A one-valued kind at cells written in the stream as its capital
   * letter, by the letter. */
  readonly letters?: Readonly<Record<string, string>>;
  /** By letter, a kind at cells whose digit may follow the letter, on its
   * cell (Sticks' numbered block, `B2`). */
  readonly after?: Readonly<Record<string, string>>;
  /** By number, a one-valued kind at cells written as that number in place
   * of one of the segment's own (Bricks' unknown number, `7`). */
  readonly also?: Readonly<Record<string, string>>;
};

/** Each of `kinds` a digits segment marks, with the cells it holds before
 * the desc is read: a hexagon's outside kind holds every cell `written`
 * leaves out, and every other kind none. */
function markedStart(
  deal: FillDeal,
  sp: GridSpace,
  written: readonly number[],
  kinds: readonly string[],
): Map<string, number[]> {
  const out = new Map<string, number[]>(kinds.map((k) => [k, []]));
  const outside = deal.hexagon?.outside;
  if (outside === undefined) return out;
  const on = new Set(written);
  out.set(
    outside,
    sp.cells.filter((c) => !on.has(c)),
  );
  return out;
}

/** The cells a desc writes, in the space's order: every one, or a
 * hexagon's alone. */
function boardCells(deal: FillDeal, sp: GridSpace): readonly number[] {
  if (deal.hexagon === undefined) return sp.cells;
  return sp.cells.filter((c) => inHexagon(sp.w, sp.h, c % sp.w, Math.floor(c / sp.w)));
}

/** A clue list at parts as a list at cells, each clue at its part's first
 * cell (Solo's Killer totals); none on a board without the partition. */
function atFirstCells(
  list: ClueList,
  parts: Partition | null,
  sp: GridSpace,
): ClueList {
  const n = sp.cells.length;
  if (parts === null) return clueList([], [], n);
  const byCell = Array.from(
    list.at,
    (r, k) => [parts.cells[r][0], list.v[k]] as const,
  ).sort((a, b) => a[0] - b[0]);
  return clueList(
    byCell.map(([c]) => c),
    byCell.map(([, v]) => v),
    n,
  );
}

/** A clue list at cells, each in one part, as the list at those parts: one
 * clue a part, where `null` holds which part has none or two. */
function atParts(list: ClueList, parts: Partition): ClueList | null {
  const v = new Array<number>(parts.parts.length).fill(-1);
  for (let k = 0; k < list.at.length; k++) {
    const r = parts.of[list.at[k]];
    if (v[r] >= 0) return null;
    v[r] = list.v[k];
  }
  if (v.some((x) => x < 0)) return null;
  return clueList(parts.parts, v, parts.parts.length);
}

/**
 * A `digits` segment's clues, by kind: its own kind's, and each kind its
 * letters, the numbers after them and its `also` numbers stand for. A digit
 * is one cell's clue, a letter a run of 1 to 26 without one; the last run is
 * written, so the cells end with the segment. With `apart`, a clue is a whole
 * number, and `apart` is between two with no run between them, exactly
 * there. Behind its `before`, the segment is read only where the mark is.
 * A clue's most may read a partition read before it, in `cl` (Seismic's
 * given, at most its area's size).
 */
function readDigits<C extends Clues<C>>(
  r: DescReader,
  deal: FillDeal,
  sp: GridSpace,
  clueMax: ClueMax<C>,
  seg: DigitsSegment,
  cl: Partial<C>,
): Map<string, ClueList> {
  const kind = seg.digits as keyof C;
  const all = sp.cells.length;
  const out = new Map<string, ClueList>();
  if (seg.before !== undefined && !r.accept(seg.before)) {
    out.set(seg.digits, clueList([], [], all));
    return out;
  }
  const least = deal.least?.[seg.digits] ?? 0;
  const cells = boardCells(deal, sp);
  const n = cells.length;
  const at: number[] = [];
  const v: number[] = [];
  const letters = seg.letters ?? {};
  const also = seg.also ?? {};
  const markedAt = markedStart(deal, sp, cells, [
    ...Object.values(letters),
    ...Object.values(also),
  ]);
  // The largest number the segment reads: its own kind's, or one that
  // stands for another kind.
  const topAlso = Math.max(-1, ...Object.keys(also).map(Number));
  const after = seg.after ?? {};
  const numberedAt = new Map<string, { at: number[]; v: number[] }>(
    Object.values(after).map((k) => [k, { at: [], v: [] }]),
  );
  const isRun = (x: string) => x >= "a" && x <= "z";
  const isLetter = (x: string) => x in letters;
  // Whether the cell before was written, so a clue here has no run before it.
  let afterClue = false;
  for (let pos = 0; pos < n; ) {
    if (r.peekIs(isRun)) {
      pos += r.char().charCodeAt(0) - 96;
      if (pos > n) r.fail(DESC_TOO_LONG);
      afterClue = false;
      continue;
    }
    const c = cells[pos];
    if (r.peekIs(isLetter)) {
      const letter = r.char();
      markedAt.get(letters[letter])?.push(c);
      const k = after[letter];
      if (k !== undefined && r.peekIs(isDigit)) {
        const value = Number(r.char());
        if (value > maxOf(clueMax, k as keyof C, sp, c, cl)) r.fail(DESC_OUT_OF_RANGE);
        const got = numberedAt.get(k);
        got?.at.push(c);
        got?.v.push(value);
      }
      pos++;
      afterClue = true;
      continue;
    }
    const max = Math.max(maxOf(clueMax, kind, sp, c, cl), topAlso);
    let value: number;
    if (seg.apart === undefined) {
      value = Number(r.char(isDigit));
      if (value < least || value > max) r.fail(DESC_OUT_OF_RANGE);
    } else {
      if (afterClue) r.expect(seg.apart);
      value = r.int(least, max);
    }
    pos++;
    afterClue = true;
    const other = also[String(value)];
    if (other !== undefined) {
      markedAt.get(other)?.push(c);
      continue;
    }
    if (value > maxOf(clueMax, kind, sp, c, cl)) r.fail(DESC_OUT_OF_RANGE);
    at.push(c);
    v.push(value);
  }
  out.set(seg.digits, clueList(at, v, all));
  for (const [k, got] of numberedAt) out.set(k, clueList(got.at, got.v, all));
  for (const [k, marked] of markedAt) {
    const sorted = marked.toSorted((a, b) => a - b);
    out.set(
      k,
      clueList(
        sorted,
        sorted.map(() => 0),
        all,
      ),
    );
  }
  return out;
}

export const digits: SegmentKind<DigitsSegment> = {
  encode(seg, { deal, sp, dealt, listOf }) {
    // A kind at parts is written at each part's first cell.
    const own = listOf(seg.digits);
    const list =
      deal.universes[seg.digits] !== "parts"
        ? own
        : atFirstCells(
            own,
            (dealt[partitionOfKind(deal, seg.digits) as keyof typeof dealt] as
              | Partition
              | undefined) ?? null,
            sp,
          );
    // Behind its mark, the segment is written only where it holds a clue,
    // unless it is always written.
    if (seg.before !== undefined && seg.always !== true && list.at.length === 0)
      return "";
    const cells = boardCells(deal, sp);
    const marked = Object.entries(seg.letters ?? {}).map(
      ([letter, kind]) => [letter, listOf(kind)] as const,
    );
    const after = new Map(
      Object.entries(seg.after ?? {}).map(([letter, kind]) => [letter, listOf(kind)]),
    );
    const also = Object.entries(seg.also ?? {}).map(
      ([number, kind]) => [number, listOf(kind)] as const,
    );
    const letterAt = (c: number): string | null =>
      marked.find(([, l]) => l.valueAt[c] >= 0)?.[0] ?? null;
    /** The number cell `c` is written as: its own clue's, or another kind's
     * that is written as a number. */
    const numberAt = (c: number): string | null =>
      list.valueAt[c] >= 0
        ? String(list.valueAt[c])
        : (also.find(([, l]) => l.valueAt[c] >= 0)?.[0] ?? null);
    // The board cell before each, `-1` for the first: a cell off the board
    // is never written, and ends a run of letters (upstream bricks.c).
    const before = new Int32Array(sp.cells.length).fill(-1);
    const onBoard = new Uint8Array(sp.cells.length);
    cells.forEach((c, i) => {
      onBoard[c] = 1;
      if (i > 0) before[c] = cells[i - 1];
    });
    // A number straight after a written cell has no run before it, so
    // `apart` there.
    const apart = (c: number): string =>
      seg.apart !== undefined &&
      before[c] >= 0 &&
      (numberAt(before[c]) !== null || letterAt(before[c]) !== null)
        ? seg.apart
        : "";
    return (
      (seg.before ?? "") +
      encodeRunLength(
        sp.cells.length,
        (c) => {
          if (onBoard[c] === 0) return "";
          const number = numberAt(c);
          if (number !== null) return apart(c) + number;
          const letter = letterAt(c);
          const n = letter === null ? -1 : (after.get(letter)?.valueAt[c] ?? -1);
          return letter === null ? null : n >= 0 ? letter + String(n) : letter;
        },
        { keepTrailingBlanks: true },
      )
    );
  },
  decode<C extends Clues<C>>(seg: DigitsSegment, cx: Decoding<C>) {
    const { r, deal, sp, clueMax, out } = cx;
    const kind = seg.digits as keyof C;
    if (deal.universes[seg.digits] !== "parts") {
      for (const [k, list] of readDigits(r, deal, sp, clueMax, seg, out as Partial<C>))
        out[k as keyof C] = list;
      return;
    }
    // A part's clue, written at one of its cells, on a board that deals the
    // partition (Solo's Killer totals, upstream reading one anywhere in its
    // cage); read at most its part's largest.
    const parts = out[partitionOfKind(deal, seg.digits) as keyof C] as
      | Partition
      | undefined;
    if (parts === undefined) {
      out[kind] = clueList([], [], 0);
      return;
    }
    const atCell: ClueMax<C> = {
      [kind]: (s: GridSpace, c: number, cl: C) =>
        maxOf(clueMax, kind, s, parts.of[c], cl),
    } as ClueMax<C>;
    const cells = readDigits(r, deal, sp, atCell, seg, out as Partial<C>).get(
      seg.digits,
    );
    const list = cells === undefined ? null : atParts(cells, parts);
    if (list === null) r.fail(DESC_MALFORMED);
    out[kind] = list as ClueList;
  },
};
