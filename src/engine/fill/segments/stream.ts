/** The run-letter stream, an `id:` entry holding `digits`, `codes` or both:
 * a clue an element, between runs of 1 to 26 elements without one written
 * `a` to `z`. The segment's own kind (`digits`) is written as its number,
 * or as the board draws it (`glyphs`); every other kind by its code
 * (`codes`, `code-said.ts`). Upstream's Mosaic, Light Up, Range, Bricks,
 * Sticks, Mathrax, Boats and Salad write theirs so, and each one's
 * difference is a property here. */

import {
  DESC_MALFORMED,
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
} from "../../contract/desc-error.ts";
import { isDigit } from "../../game-id/decimal.ts";
import type { DescReader } from "../../game-id/desc-reader.ts";
import {
  type ClueList,
  clueList,
  type GridSpace,
  inHexagon,
  type Partition,
} from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import {
  type ClueMax,
  type FillDeal,
  partitionOfKind,
  type Universe,
} from "../game-id.ts";
import type { ValueGlyphs } from "../glyphs.ts";
import { type CodeSaid, codeSaid, isNumberCode } from "./code-said.ts";
import { type Decoding, maxOf, type SegmentKind, universeOf } from "./segment.ts";

export type StreamSegment = {
  /** The kind written as its number: a digit, or with `apart` a whole
   * number. A kind at parts is written at each part's first cell, alone in
   * its segment (Solo's Killer totals). */
  readonly digits?: string;
  /** By code, what each writes (`code-said.ts`). A code that is a number
   * stands in place of one of `digits`' own, past its largest (Bricks'
   * `7`). */
  readonly codes?: Readonly<Record<string, string>>;
  /** Between two numbers with no run between them (Range's `_`). */
  readonly apart?: string;
  /** Written before the segment, which is written only where a clue of its
   * kinds is dealt (Towers' givens after `,`), unless `always`. */
  readonly before?: string;
  /** The segment behind `before` is written with no clue dealt too, as its
   * blanks (Seismic's `,zj`). */
  readonly always?: true;
  /** A last run is left off, but for its whole 26s (upstream Boats'). */
  readonly lastRun?: false;
  /** Written after the segment, wherever it is written (Salad's `,`). */
  readonly after?: string;
  /** `digits`' number written as the board draws it, one character (Salad's
   * letters, numerals and `X`). */
  readonly glyphs?: true;
  /** On slots, the sides in the order written (Salad's top, left, bottom,
   * right), each side's slots in the space's order. */
  readonly sides?: readonly Side[];
};

/** A side of the board, whose slots are beyond its lines' ends. */
type Side = "top" | "bottom" | "left" | "right";

/** The elements of place `u` in the order the segment writes them: the
 * space's, or on slots its sides in the order `sides` gives. */
function streamOrder(
  sp: GridSpace,
  u: Universe,
  sides?: readonly Side[],
): readonly number[] {
  if (sides === undefined) return sp[u];
  if (u !== "slots") throw new Error("id: sides, on a stream not at slots");
  const { w, h } = sp;
  // The space numbers them above each column, below each, left of each row
  // and right of each.
  const first: Record<Side, number> = {
    top: 0,
    bottom: w,
    left: 2 * w,
    right: 2 * w + h,
  };
  const count: Record<Side, number> = { top: w, bottom: w, left: h, right: h };
  return sides.flatMap((s) => Array.from({ length: count[s] }, (_, i) => first[s] + i));
}

/** How the segment's own number is written and read: as the board's glyph
 * where it writes glyphs, else in decimal. */
interface NumberText {
  readonly write: (v: number) => string;
  /** The value of glyph `c`, of at most `max`, or `null`. */
  readonly read: ((c: string, max: number) => number | null) | null;
}

/** The segment's own number's text, the board's glyphs `glyphs`. */
function numberTextOf(seg: StreamSegment, glyphs: ValueGlyphs | null): NumberText {
  if (seg.glyphs !== true) return { write: String, read: null };
  if (glyphs === null) throw new Error("id: glyphs, on a board that draws none");
  return {
    write: (v) => {
      const g = glyphs.draw(v);
      if (g.length !== 1 || (g >= "a" && g <= "z") || seg.codes?.[g] !== undefined)
        throw new Error(
          `id: the glyph ${g} is no one character apart from a run or code`,
        );
      return g;
    },
    read: (c, max) => {
      for (let v = 1; v <= max; v++) if (glyphs.draw(v) === c) return v;
      return null;
    },
  };
}

/** A code, with what it stands for. */
type Code = CodeSaid & { readonly code: string };

/** A segment's codes: those a clue is read by, the longest first as they
 * are read, and those standing in place of a number, by the number; none
 * of a kind in `off`, which the board is not dealt. */
function codesOf(
  seg: StreamSegment,
  off: ReadonlySet<string> = new Set(),
): {
  readonly read: readonly Code[];
  readonly numbers: ReadonlyMap<number, Code>;
} {
  const all = Object.entries(seg.codes ?? {})
    .map(([code, said]) => ({ code, ...codeSaid(said) }))
    .filter((c) => !off.has(c.kind));
  return {
    read: all
      .filter((c) => !isNumberCode(c.code))
      .sort((a, b) => b.code.length - a.code.length),
    numbers: new Map(
      all.filter((c) => isNumberCode(c.code)).map((c) => [Number(c.code), c]),
    ),
  };
}

/** Every kind a segment writes: its own, its codes', and those whose
 * number may follow a code. */
const kindsOf = (seg: StreamSegment): string[] => [
  ...new Set([
    ...(seg.digits === undefined ? [] : [seg.digits]),
    ...Object.values(seg.codes ?? {}).flatMap((s) => {
      const { kind, follows } = codeSaid(s);
      return follows === null ? [kind] : [kind, follows];
    }),
  ]),
];

/** The place the segment's elements are: its own kind's, a kind at parts
 * written at cells, or else its codes' one place. */
function placeOf(deal: FillDeal, seg: StreamSegment): Universe {
  if (seg.digits !== undefined)
    return deal.universes[seg.digits] === "parts"
      ? "cells"
      : universeOf(deal, seg.digits);
  const [first] = Object.values(seg.codes ?? {});
  if (first === undefined) throw new Error("id: a stream that writes no kind");
  return universeOf(deal, codeSaid(first).kind);
}

/** Whether element `e` of place `u` is on the board: every one, but a cell
 * outside a hexagon, which is never written. */
const onBoardOf =
  (deal: FillDeal, sp: GridSpace, u: Universe) =>
  (e: number): boolean =>
    u !== "cells" ||
    deal.hexagon === undefined ||
    inHexagon(sp.w, sp.h, e % sp.w, Math.floor(e / sp.w));

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

/** Clue lists being read, by kind. */
class Read {
  private readonly got = new Map<string, { at: number[]; v: number[] }>();
  constructor(kinds: readonly string[]) {
    for (const k of kinds) this.got.set(k, { at: [], v: [] });
  }
  push(kind: string, at: number, v: number): void {
    const got = this.got.get(kind);
    if (got === undefined) throw new Error(`id: the stream reads no ${kind}`);
    got.at.push(at);
    got.v.push(v);
  }
  /** Each kind's clues, in its elements' order, of `n` elements. */
  lists(n: number): Map<string, ClueList> {
    const out = new Map<string, ClueList>();
    for (const [k, { at, v }] of this.got) {
      const order = at.map((_, i) => i).sort((a, b) => at[a] - at[b]);
      out.set(
        k,
        clueList(
          order.map((i) => at[i]),
          order.map((i) => v[i]),
          n,
        ),
      );
    }
    return out;
  }
}

/**
 * A stream segment's clues, by kind. A run letter skips 1 to 26 elements; a
 * code is a clue on the next, its number after it where it stands for a
 * kind alone, and where it names a kind after it, a digit there that kind's
 * clue on the same element; and a number is the segment's own kind's, or
 * the kind a number code stands for. A number is one digit, unless the
 * segment has `apart`, which then stands between two numbers with no run
 * between them, or has no kind of its own. The elements end with the
 * segment, or with `lastRun: false` where nothing more is read. Behind its
 * `before`, the segment is read only where the mark is. A clue's most may
 * read a partition read before it, in `cl` (Seismic's given, at most its
 * area's size).
 */
function readStream<C extends Clues<C>>(
  r: DescReader,
  deal: FillDeal,
  sp: GridSpace,
  clueMax: ClueMax<C>,
  seg: StreamSegment,
  cl: Partial<C>,
  off: ReadonlySet<string>,
  text: NumberText,
): Map<string, ClueList> {
  const u = placeOf(deal, seg);
  const all = sp[u].length;
  if (seg.before !== undefined && !r.accept(seg.before))
    return new Read(kindsOf(seg)).lists(all);
  const onBoard = onBoardOf(deal, sp, u);
  const elements = streamOrder(sp, u, seg.sides).filter(onBoard);
  // A hexagon's outside kind, a one-valued marker, holds every cell the
  // stream leaves out.
  const outside = u === "cells" ? (deal.hexagon?.outside ?? null) : null;
  const read = new Read([...kindsOf(seg), ...(outside === null ? [] : [outside])]);
  if (outside !== null)
    for (const c of sp.cells) if (!onBoard(c)) read.push(outside, c, 0);
  const codes = codesOf(seg, off);
  // A kind the board is not dealt is read nowhere.
  const own =
    seg.digits === undefined || off.has(seg.digits)
      ? undefined
      : (seg.digits as keyof C);
  const whole = seg.apart !== undefined || own === undefined;
  /** A number of kind `kind` at `e`, of at most `max`. */
  const number = (
    kind: string,
    e: number,
    max = maxOf(clueMax, kind as keyof C, sp, e, cl),
  ) => {
    const least = deal.least?.[kind] ?? 0;
    if (whole) return r.int(least, max);
    const v = Number(r.char(isDigit));
    if (v < least || v > max) r.fail(DESC_OUT_OF_RANGE);
    return v;
  };
  const topNumberCode = Math.max(-1, ...codes.numbers.keys());
  const isRun = (x: string) => x >= "a" && x <= "z";
  // Whether the element before was written, so a number here has no run
  // before it.
  let afterClue = false;
  for (let pos = 0; pos < elements.length; ) {
    if (r.peekIs(isRun)) {
      pos += r.char().charCodeAt(0) - 96;
      if (pos > elements.length) r.fail(DESC_TOO_LONG);
      afterClue = false;
      continue;
    }
    const e = elements[pos];
    const code = codes.read.find((c) => r.accept(c.code));
    if (code !== undefined) {
      read.push(code.kind, e, code.value ?? number(code.kind, e));
      if (code.follows !== null && r.peekIs(isDigit))
        read.push(code.follows, e, number(code.follows, e));
      pos++;
      afterClue = true;
      continue;
    }
    const { read: glyph } = text;
    if (own !== undefined && glyph !== null) {
      // A glyph is one character, a value of the kind's at its element.
      const max = maxOf(clueMax, own, sp, e, cl);
      if (r.peekIs((x) => glyph(x, max) !== null)) {
        read.push(String(own), e, glyph(r.char(), max) as number);
        pos++;
        continue;
      }
    }
    const startsNumber = (x: string) =>
      glyph === null && (isDigit(x) || (afterClue && x === seg.apart));
    if (own === undefined || !r.peekIs(startsNumber)) {
      if (seg.lastRun === false) break;
      // Refused: a character no code begins with, or the end of the desc.
      r.char(() => false);
      continue;
    }
    if (afterClue && seg.apart !== undefined) r.expect(seg.apart);
    const ownMax = maxOf(clueMax, own, sp, e, cl);
    const v = number(String(own), e, Math.max(ownMax, topNumberCode));
    pos++;
    afterClue = true;
    const stands = codes.numbers.get(v);
    if (stands !== undefined) {
      read.push(stands.kind, e, stands.value ?? 0);
      continue;
    }
    if (v > ownMax) r.fail(DESC_OUT_OF_RANGE);
    read.push(String(own), e, v);
  }
  if (seg.after !== undefined) r.expect(seg.after);
  return read.lists(all);
}

export const stream: SegmentKind<StreamSegment> = {
  encode(seg, { deal, sp, dealt, listOf, glyphs }) {
    const u = placeOf(deal, seg);
    const text = numberTextOf(seg, glyphs);
    // A kind at parts is written at each part's first cell.
    const own =
      seg.digits === undefined
        ? null
        : deal.universes[seg.digits] !== "parts"
          ? listOf(seg.digits)
          : atFirstCells(
              listOf(seg.digits),
              (dealt[partitionOfKind(deal, seg.digits) as keyof typeof dealt] as
                | Partition
                | undefined) ?? null,
              sp,
            );
    const codes = codesOf(seg);
    const read = codes.read.map((c) => ({
      ...c,
      list: listOf(c.kind),
      follows: c.follows === null ? null : listOf(c.follows),
    }));
    const numbers = [...codes.numbers].map(([n, c]) => [n, listOf(c.kind)] as const);
    // Behind its mark, the segment is written only where it holds a clue,
    // unless it is always written.
    if (
      seg.before !== undefined &&
      seg.always !== true &&
      (own?.at.length ?? 0) === 0 &&
      read.every((c) => c.list.at.length === 0) &&
      numbers.every(([, l]) => l.at.length === 0)
    )
      return "";
    /** What element `e` is written as, apart from a mark before it; `null`
     * where it holds no clue. */
    const clueAt = (e: number): { s: string; number: boolean } | null => {
      const v = own?.valueAt[e] ?? -1;
      if (v >= 0) return { s: text.write(v), number: true };
      const n = numbers.find(([, l]) => l.valueAt[e] >= 0)?.[0];
      if (n !== undefined) return { s: String(n), number: true };
      const here = read.filter((c) => c.list.valueAt[e] >= 0);
      const kinds = new Set(here.map((c) => c.kind));
      if (kinds.size > 1) throw new Error(`id: element ${e} holds ${kinds.size} clues`);
      if (here.length === 0) return null;
      const value = here[0].list.valueAt[e];
      const code =
        here.find((c) => c.value === value) ?? here.find((c) => c.value === null);
      if (code === undefined)
        throw new Error(`id: no code writes ${here[0].kind} ${value}`);
      const after = code.follows?.valueAt[e] ?? -1;
      return {
        s:
          code.code +
          (code.value === null ? String(value) : "") +
          (after >= 0 ? String(after) : ""),
        number: false,
      };
    };
    const onBoard = onBoardOf(deal, sp, u);
    let out = seg.before ?? "";
    let run = 0;
    const flush = (): void => {
      while (run > 0) {
        const chunk = Math.min(run, 26);
        out += String.fromCharCode(96 + chunk);
        run -= chunk;
      }
    };
    // Whether the element before was written, so a number here has no run
    // before it, and `apart` is written there.
    let afterClue = false;
    for (const e of streamOrder(sp, u, seg.sides)) {
      // A cell off the board is never written, and ends a run of letters
      // (upstream bricks.c).
      if (!onBoard(e)) {
        flush();
        continue;
      }
      const clue = clueAt(e);
      if (clue === null) {
        run++;
        afterClue = false;
        continue;
      }
      flush();
      if (clue.number && afterClue && seg.apart !== undefined) out += seg.apart;
      out += clue.s;
      afterClue = true;
    }
    if (seg.lastRun !== false) flush();
    else for (; run >= 26; run -= 26) out += "z";
    return out + (seg.after ?? "");
  },
  decode<C extends Clues<C>>(seg: StreamSegment, cx: Decoding<C>) {
    const { r, deal, sp, clueMax, out } = cx;
    const text = numberTextOf(seg, cx.glyphs);
    if (seg.digits === undefined || deal.universes[seg.digits] !== "parts") {
      for (const [k, list] of readStream(
        r,
        deal,
        sp,
        clueMax,
        seg,
        out as Partial<C>,
        cx.off,
        text,
      ))
        out[k as keyof C] = list;
      return;
    }
    // A part's clue, written at one of its cells, on a board that deals the
    // partition (Solo's Killer totals, upstream reading one anywhere in its
    // cage); read at most its part's largest.
    const kind = seg.digits as keyof C;
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
    const cells = readStream(
      r,
      deal,
      sp,
      atCell,
      seg,
      out as Partial<C>,
      cx.off,
      text,
    ).get(seg.digits);
    const list = cells === undefined ? null : atParts(cells, parts);
    if (list === null) r.fail(DESC_MALFORMED);
    out[kind] = list as ClueList;
  },
};
