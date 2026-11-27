/**
 * A fill game's desc: the clues, by the segments the description's `id:`
 * lists, after cspuz's serializer combinators. Each segment kind is a module
 * of `segments/`, in {@link SEGMENT_KINDS} by each key that names it. Tents' `id:` keeps
 * upstream's grammar byte for byte, so its IDs and shared links do not change
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 8).
 */

import type { DescParse } from "../contract/desc-error.ts";
import { readDesc } from "../game-id/desc-reader.ts";
import {
  type ClueList,
  clueList,
  type GridSpace,
  type ListClues,
  type Partition,
} from "../solve/describe-runtime.ts";
import { type Clues, type FillModule, perValuesOf } from "./board.ts";
import type { ClueMax, FillDeal } from "./game-id.ts";
import { boardGlyphs, type ValueGlyphs } from "./glyphs.ts";
import type { GrowSizes } from "./grow.ts";
import { offKinds } from "./params/settings.ts";
import { blocks } from "./segments/blocks.ts";
import { cells } from "./segments/cells.ts";
import { dots } from "./segments/dots.ts";
import { lists } from "./segments/lists.ts";
import { numbers } from "./segments/numbers.ts";
import { parts } from "./segments/parts.ts";
import { records } from "./segments/records.ts";
import { runs } from "./segments/runs.ts";
import { placeCount, type SegmentKind } from "./segments/segment.ts";
import { stream } from "./segments/stream.ts";
import { walls } from "./segments/walls.ts";

/** Every segment kind, by the key an `id:` entry of it holds. The stream is
 * read by either of its two, since an entry of it may hold its own kind, its
 * codes, or both; they come last, as a `parts` entry holds `codes` too, and
 * a kind is read by the first of these keys its entry holds. */
const SEGMENT_KINDS = {
  blocks,
  cells,
  dots,
  lists,
  numbers,
  parts,
  records,
  runs,
  walls,
  codes: stream,
  digits: stream,
} as const;

type Kinds = typeof SEGMENT_KINDS;

/** The key naming a segment kind, which its entries hold. */
export type SegmentKey = keyof Kinds;

/** The `id:` entry of the segment kind `K`. */
export type SegmentOf<K extends SegmentKey> =
  Kinds[K] extends SegmentKind<infer S> ? S : never;

/** A segment of the desc: an entry of the description's `id:`. */
export type IdSegment = { [K in SegmentKey]: SegmentOf<K> }[SegmentKey];

const KEYS = Object.keys(SEGMENT_KINDS) as SegmentKey[];

/** The kind of segment `seg` is. */
function kindOf(seg: IdSegment): SegmentKind<IdSegment> {
  const key = KEYS.find((k) => k in seg);
  if (key === undefined)
    throw new Error(`id: no segment kind for ${JSON.stringify(seg)}`);
  // `key` is in `seg`, so `seg` is the kind's own entry.
  return SEGMENT_KINDS[key] as SegmentKind<IdSegment>;
}

/** The segments of the deal's `id` a board not dealt the kinds `off` writes:
 * each but one whose every kind is off (`FillDeal.idKinds`). */
const segmentsOn = (deal: FillDeal, off: ReadonlySet<string>): readonly IdSegment[] =>
  off.size === 0
    ? deal.id
    : deal.id.filter((_, i) => !(deal.idKinds?.[i] ?? []).every((k) => off.has(k)));

/** How a board of `module` on `sp` dealt `dealt` draws its values, where it
 * is a board of numbers; `null` on any other. */
export const glyphsIn = <C>(module: FillModule<C>, sp: GridSpace, dealt: C) =>
  module.play?.numbers === undefined ? null : boardGlyphs(module, sp, dealt);

/** The desc of the clues `dealt` on the space `sp` of a board of `module`,
 * by the deal's `id`. The sizes a ruleset chooses its kinds and glyphs by
 * are `dealt`'s, which holds each size the deal reads. */
export function encodeDesc<C extends Clues<C>>(
  module: FillModule<C>,
  deal: FillDeal,
  sp: GridSpace,
  dealt: C,
): string {
  const cx = {
    deal,
    sp,
    dealt,
    listOf: (kind: string): ClueList => dealt[kind as keyof C] as ClueList,
    values: perValuesOf(module, sp, dealt),
    glyphs: glyphsIn(module, sp, dealt),
  };
  const off = offKinds(deal, dealt as unknown as Readonly<Record<string, number>>);
  return segmentsOn(deal, off)
    .map((seg) => kindOf(seg).encode(seg, cx))
    .join("");
}

/** The clues `desc` deals, each number read within its kind's largest value
 * at its element. */
export function decodeDesc<C extends Clues<C>>(
  deal: FillDeal,
  sp: GridSpace,
  // Not read for `C`, which `ClueMax` cannot say: the caller's board says it.
  clueMax: ClueMax<NoInfer<C>>,
  desc: string,
  /** What the grown partition's parts hold on this board, where the deal
   * grows one. */
  grown: GrowSizes | null = null,
  /** The variations the board has on, which say whether it deals a
   * partition a variation deals. */
  variations: readonly string[] = [],
  /** The top of the board's domain, where a kind is one a value. */
  values = 0,
  /** The sizes the params give, which choose the kinds a ruleset deals and
   * which a clue's most may read. */
  sizes: Readonly<Record<string, number>> = {},
  /** How the board draws its values, where it is a board of numbers. */
  glyphs: ValueGlyphs | null = null,
): DescParse<C> {
  const off = offKinds(deal, sizes);
  // A kind's most reads the board's sizes beside the clues read before it
  // (Salad's letters, to `n`).
  const sized = Object.fromEntries(
    Object.entries(clueMax).map(([kind, max]) => [
      kind,
      (s: GridSpace, at: number, cl: C) =>
        (max as (s: GridSpace, at: number, cl: C) => number)(s, at, {
          ...sizes,
          ...cl,
        }),
    ]),
  ) as ClueMax<C>;
  return readDesc(desc, (r) => {
    const out: Partial<Record<keyof C, ClueList | ListClues | Partition>> = {};
    const cx = {
      r,
      deal,
      sp,
      clueMax: sized,
      out,
      grown,
      variations,
      values,
      off,
      glyphs,
    };
    for (const seg of segmentsOn(deal, off)) kindOf(seg).decode(seg, cx);
    // A kind the board is not dealt holds no clue.
    for (const k of off)
      out[k as keyof C] ??= clueList([], [], placeCount(deal, sp, k));
    r.end();
    // The compiler holds `id` to naming every kind once.
    return out as C;
  });
}
