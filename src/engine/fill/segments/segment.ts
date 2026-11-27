/**
 * What a kind of desc segment is (`desc.ts` runs them, in the order the
 * description's `id:` lists its segments): how it writes the clues it holds,
 * and how it reads them back. A segment kind is one module of this folder,
 * registered in `desc.ts` under each key its entries may be read by.
 */

import type { DescReader } from "../../game-id/desc-reader.ts";
import {
  type ClueList,
  type GridSpace,
  type ListClues,
  type Partition,
  partition,
  perElement,
  perPlace,
} from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import type { ClueMax, FillDeal, Universe } from "../game-id.ts";
import type { GrowSizes } from "../grow.ts";

/** What a segment writes from: the deal, the space, and the clues dealt. */
export interface Encoding<C> {
  readonly deal: FillDeal;
  readonly sp: GridSpace;
  readonly dealt: C;
  /** The clue list of kind `kind`. */
  listOf(kind: string): ClueList;
  /** The values an element holds a clue for, from 1, of a kind one a value
   * (`FillDeal.perValue`): the top of the board's domain. */
  readonly values: number;
}

/** What a segment reads into: `out`, the clues read so far, which a later
 * segment may read (a kind at parts, its partition's). */
export interface Decoding<C> {
  readonly r: DescReader;
  readonly deal: FillDeal;
  readonly sp: GridSpace;
  readonly clueMax: ClueMax<C>;
  readonly out: Partial<Record<keyof C, ClueList | ListClues | Partition>>;
  /** What the grown partition's parts hold on this board, where the deal
   * grows one. */
  readonly grown: GrowSizes | null;
  /** The variations the board has on. */
  readonly variations: readonly string[];
  /** As {@link Encoding.values}. */
  readonly values: number;
}

/** The places kind `kind` is written at, in the order a segment writes them
 * (`elements`), each element's values in turn where the kind is one a
 * value. */
export function placesOf(
  deal: FillDeal,
  sp: GridSpace,
  kind: string,
  values: number,
  order?: "columns",
): readonly number[] {
  const els = elements(sp, universeOf(deal, kind), order);
  if (deal.perValue?.includes(kind) !== true) return els;
  if (values < 1) throw new Error(`id: ${kind} is one a value, and the board has none`);
  return els.flatMap((e) =>
    Array.from({ length: values }, (_, d) => perPlace(e, d + 1)),
  );
}

/** The element a place of kind `kind` is at ({@link placesOf}). */
export const elementOf = (deal: FillDeal, kind: string, place: number): number =>
  deal.perValue?.includes(kind) === true ? perElement(place) : place;

/** How many places kind `kind` has on the space `sp`: its elements, or an
 * element's places a value where it is one a value. */
export function placeCount(deal: FillDeal, sp: GridSpace, kind: string): number {
  const n = sp[universeOf(deal, kind)].length;
  return deal.perValue?.includes(kind) === true ? perPlace(n, 0) : n;
}

/** A kind of desc segment, `S` its entry in the description's `id:`. */
export interface SegmentKind<S> {
  /** What `seg` writes of the clues dealt. */
  encode<C extends Clues<C>>(seg: S, cx: Encoding<C>): string;
  /** Reads `seg`'s clues into `cx.out`, failing the reader on a desc that
   * does not hold. */
  decode<C extends Clues<C>>(seg: S, cx: Decoding<C>): void;
}

/** The largest value of kind `kind` at element `at`, beside the clues `cl`
 * read so far; none are needed where the kind is not at a part. */
export const maxOf = <C>(
  clueMax: ClueMax<C>,
  kind: keyof C,
  sp: GridSpace,
  at: number,
  cl: Partial<C> = {},
) => {
  const max = clueMax[kind];
  if (max === undefined) throw new Error(`id: ${String(kind)} has no values`);
  // A kind not at a part reads nothing of `cl`; one at a part is read after
  // its partition (the compiler holds `parts` after it).
  return max(sp, at, cl as C);
};

/** The elements a kind sits at, in the order a segment writes them: a cell's
 * kind by rows or by columns, a line's kind the rows then the columns, or
 * the columns first. */
export function elements(
  sp: GridSpace,
  universe: Universe,
  order?: "columns",
): readonly number[] {
  const { w, h } = sp;
  if (order !== "columns") return sp[universe];
  if (universe === "edges" || universe === "slots" || universe === "corners")
    throw new Error(`id: a kind at ${universe} is written in their order`);
  if (universe === "lines") return [...sp.lines.slice(h), ...sp.lines.slice(0, h)];
  const out: number[] = [];
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) out.push(y * w + x);
  return out;
}

/** The space's elements kind `kind` sits at; a kind at parts is written by
 * a `parts` segment alone, which the compiler holds it to. */
export function universeOf(deal: FillDeal, kind: string): Universe {
  const u = deal.universes[kind];
  if (u === undefined) throw new Error(`id: no clue kind ${kind}`);
  if (u === "parts") throw new Error(`id: ${kind} sits at parts`);
  return u;
}

/** A partition from each cell's part, the parts numbered as `regionNumbers`
 * numbers them: in the order their first cells are met. */
export function partitionOf(parts: ArrayLike<number>): Partition {
  const cells: number[][] = [];
  for (let c = 0; c < parts.length; c++) {
    cells[parts[c]] ??= [];
    cells[parts[c]].push(c);
  }
  return partition(cells, parts.length);
}

/** Whether `parts`, read as the partition `name`, are as the deal divides
 * it: where it divides it into equal parts, every part as large as the
 * rest, and as large as the division says where the board's width says it
 * (a desc names no size). A partition divided otherwise, or not, holds. */
export function equalParts(
  deal: FillDeal,
  name: string,
  sp: GridSpace,
  parts: Partition,
): boolean {
  const divide = deal.divide?.find((d) => d.partition === name);
  if (divide === undefined || !("equal" in divide)) return true;
  const { equal } = divide;
  const k =
    typeof equal === "number" ? equal : equal === "w" ? sp.w : parts.cells[0].length;
  return parts.cells.every((cs) => cs.length === k);
}
