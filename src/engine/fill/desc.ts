/**
 * A fill game's desc: the clues, by the segments the description's `id:`
 * lists, after cspuz's serializer combinators. Each segment kind is a module
 * of `segments/`, in {@link SEGMENT_KINDS} by each key that names it. Tents' `id:` keeps
 * upstream's grammar byte for byte, so its IDs and shared links do not change
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 8).
 */

import type { DescParse } from "../contract/desc-error.ts";
import { readDesc } from "../game-id/desc-reader.ts";
import type {
  ClueList,
  GridSpace,
  ListClues,
  Partition,
} from "../solve/describe-runtime.ts";
import type { Clues } from "./board.ts";
import type { ClueMax, FillDeal } from "./game-id.ts";
import type { GrowSizes } from "./grow.ts";
import { blocks } from "./segments/blocks.ts";
import { cells } from "./segments/cells.ts";
import { dots } from "./segments/dots.ts";
import { lists } from "./segments/lists.ts";
import { numbers } from "./segments/numbers.ts";
import { parts } from "./segments/parts.ts";
import { records } from "./segments/records.ts";
import { runs } from "./segments/runs.ts";
import type { SegmentKind } from "./segments/segment.ts";
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

/** The desc of the clues `dealt`, by the deal's `id`; `values`, the top of
 * the board's domain, where a kind is one a value. */
export function encodeDesc<C extends Clues<C>>(
  deal: FillDeal,
  sp: GridSpace,
  dealt: C,
  values = 0,
): string {
  const cx = {
    deal,
    sp,
    dealt,
    listOf: (kind: string): ClueList => dealt[kind as keyof C] as ClueList,
    values,
  };
  return deal.id.map((seg) => kindOf(seg).encode(seg, cx)).join("");
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
): DescParse<C> {
  return readDesc(desc, (r) => {
    const out: Partial<Record<keyof C, ClueList | ListClues | Partition>> = {};
    const cx = { r, deal, sp, clueMax, out, grown, variations, values };
    for (const seg of deal.id) kindOf(seg).decode(seg, cx);
    r.end();
    // The compiler holds `id` to naming every kind once.
    return out as C;
  });
}
