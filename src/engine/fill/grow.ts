/**
 * A dealt partition grown round a sampled answer (`deal.grow`): a part round
 * each cell of the answer's value, joined until each part holds `holds` of
 * them, some of the answer's pieces closed as parts of their own, and the
 * parts mended until the ladder finishes the board at the asked tier
 * (`engine/generate/mend-division.ts`). Norinori's, where the pieces are
 * dominoes and a region holds two shaded squares.
 */

import { shuffle } from "../board/shuffle.ts";
import { drawRejected } from "../contract/deal-census.ts";
import { growFromSeeds, mergeToCount, regionNumbers } from "../generate/divide.ts";
import { type MendJudge, mendDivision } from "../generate/mend-division.ts";
import { type RandomState, randomUpto } from "../random/index.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";

/** How a deal grows a dealt partition round its answer (`deal.grow`). */
export interface FillGrow {
  /** The partition's name in the description's `regions`. */
  readonly partition: string;
  /** The value each part holds `holds` cells of: the sample's. */
  readonly value: number;
  /** A closed piece: one of the answer's pieces of `holds` cells dealt as a
   * part of its own, one in `oneIn[tier]` of them, and at most one part in
   * `atMostOneIn`. None is closed where it is absent. */
  readonly closed?: { readonly oneIn: readonly number[]; readonly atMostOneIn: number };
}

/** What a grown partition's parts hold on a board: the compiled module's
 * `growBy`, since each may be a formula of the board's sizes (Star Battle's
 * `holds: stars`). */
export interface GrowSizes {
  readonly holds: number;
  /** The fewest cells a part is dealt with, but for a closed piece. */
  readonly smallest: number;
  /** How many parts a board has, where the rules fix it: a desc with another
   * count is refused. */
  readonly parts: number | null;
}

/**
 * Each cell's part, grown round the answer `g` for tier `tier` and mended
 * until `judge` of it is content; `null` where this draw came to nothing.
 * `judge` reads the parts as they stand, which the mend changes in place.
 * `spent` is as `mendDivision` has it.
 *
 * The closed pieces are spread apart, each the farthest from those before
 * it: the deductions on a blank board start only from them, so a part of the
 * board far from every one has nowhere to start and no mend gives it one.
 * Spread so rather than placed at random, a 10x10 Easy Norinori board dealt
 * in a median of 0.3 s against 0.7 (2026-11-16).
 */
export function growPartition(
  grow: FillGrow & GrowSizes,
  sp: GridSpace,
  g: ArrayLike<number>,
  tier: number,
  judge: (parts: Int32Array) => MendJudge<Uint8Array>,
  rs: RandomState,
  spent: { moves: number },
): Int32Array | null {
  const { w, h } = sp;
  const grid = { w, h };
  const seeds = sp.cells.filter((c) => g[c] === grow.value);
  if (seeds.length === 0 || seeds.length % grow.holds !== 0)
    return drawRejected("fill: no answer to grow a partition round");
  const pieces = piecesOf(sp, seeds).filter((p) => p.length === grow.holds);
  shuffle(pieces, rs);
  let closing = 0;
  if (grow.closed !== undefined) {
    const { oneIn, atMostOneIn } = grow.closed;
    for (const _ of pieces) if (randomUpto(rs, oneIn[tier] ?? 1) === 0) closing++;
    closing = Math.min(closing, Math.floor(seeds.length / grow.holds / atMostOneIn));
  }
  const closed = new Set<number>();
  const at = (c: number) => [c % w, Math.floor(c / w)] as const;
  const apart = (c: number): number => {
    let d = Number.POSITIVE_INFINITY;
    const [x, y] = at(c);
    for (const o of closed) {
      const [ox, oy] = at(o);
      d = Math.min(d, Math.abs(ox - x) + Math.abs(oy - y));
    }
    return d;
  };
  const chosen: (readonly number[])[] = [];
  while (chosen.length < closing) {
    let best: readonly number[] | null = null;
    for (const p of pieces)
      if (!chosen.includes(p) && (best === null || apart(p[0]) > apart(best[0])))
        best = p;
    if (best === null) break;
    chosen.push(best);
    for (const c of best) closed.add(c);
  }
  const open = seeds.filter((c) => !closed.has(c));
  if (open.length === 0) return drawRejected("fill: every piece closed");
  const grown = growFromSeeds(grid, open, rs, closed);
  if (grown === null) return null;
  for (const p of chosen) for (const c of p) grown.merge(p[0], c);
  // Each part joins its cells of the value up to `holds`; a closed piece
  // holds them already, so joins nothing.
  const joined = mergeToCount<number>(
    grid,
    rs,
    {
      from: grown,
      of: (c) => (closed.has(c) ? grow.holds : 1),
      join: (a, b) => (a + b > grow.holds ? null : a + b),
    },
    seeds.length / grow.holds,
  );
  if (joined === null) return null;
  const parts = regionNumbers(joined, w * h);
  const sizes = new Int32Array(seeds.length / grow.holds);
  for (const r of parts) sizes[r]++;
  if (parts.some((r, c) => !closed.has(c) && sizes[r] < grow.smallest))
    return drawRejected(`fill: a part under ${grow.smallest} cells`);
  const mended = mendDivision({
    grid,
    regions: parts,
    fixed: new Set(seeds),
    smallest: grow.smallest,
    judge: judge(parts),
    rng: rs,
    spent,
  });
  return mended ? parts : null;
}

/** The pieces the cells `held` make, each a connected run of them along a
 * side, in reading order. */
function piecesOf(sp: GridSpace, held: readonly number[]): number[][] {
  const mine = new Set(held);
  const seen = new Set<number>();
  const out: number[][] = [];
  for (const c of held) {
    if (seen.has(c)) continue;
    const piece = [c];
    seen.add(c);
    for (let i = 0; i < piece.length; i++)
      for (const d of sp.adj4[piece[i]])
        if (mine.has(d) && !seen.has(d)) {
          seen.add(d);
          piece.push(d);
        }
    out.push(piece.sort((a, b) => a - b));
  }
  return out;
}
