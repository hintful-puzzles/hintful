/**
 * A dealt partition divided at random into small parts, apart from the
 * answer (`deal.divide`): upstream keen.c's cages, which its clues are then
 * dealt on. Each cell in a random order is joined, at the odds `pairs`, to the
 * first of its neighbors in that order still alone; then each cell left alone
 * is joined to the first of its neighbors' parts under `most` cells.
 *
 * It is not `engine/generate/divide.ts`'s `mergeNeighbors` under a largest
 * size, which deals parts at that size: Keen's difference and quotient sit on
 * two cells, so the pairs are laid first and most parts stay pairs.
 */

import { Dsf } from "../board/dsf.ts";
import { shuffle } from "../board/shuffle.ts";
import { type RandomState, randomUpto } from "../random/index.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import type { FillDivide } from "./game-id.ts";

/** The resolution the odds of a pair are drawn at. */
const CHANCE = 1 << 20;

/** Each cell's part, numbered in the order the parts' first cells come;
 * `null` where a cell was left alone, which the deal draws again. */
export function dividePartition(
  divide: FillDivide,
  sp: GridSpace,
  rs: RandomState,
): Int32Array | null {
  const n = sp.cells.length;
  const order = Array.from(sp.cells);
  shuffle(order, rs);
  const rank = new Int32Array(n);
  for (const [i, c] of order.entries()) rank[c] = i;
  const alone = new Uint8Array(n).fill(1);
  const dsf = new Dsf(n);
  /** The neighbor of `c` that `ok` takes and comes first in the order, or
   * -1. */
  const first = (c: number, ok: (o: number) => boolean): number => {
    let best = -1;
    for (const o of sp.adj4[c])
      if (ok(o) && (best < 0 || rank[o] < rank[best])) best = o;
    return best;
  };
  const odds = Math.round(divide.pairs * CHANCE);
  for (const c of sp.cells) {
    if (!alone[c]) continue;
    const o = first(c, (x) => alone[x] === 1);
    if (o >= 0 && randomUpto(rs, CHANCE) < odds) {
      alone[c] = alone[o] = 0;
      dsf.merge(c, o);
    }
  }
  for (const c of sp.cells) {
    if (!alone[c]) continue;
    const o = first(c, (x) => dsf.size(x) < divide.most);
    if (o < 0) return null;
    alone[c] = alone[o] = 0;
    dsf.merge(c, o);
  }
  const part = new Int32Array(n).fill(-1);
  let parts = 0;
  for (const c of sp.cells) {
    const root = dsf.canonify(c);
    if (part[root] < 0) part[root] = parts++;
    part[c] = part[root];
  }
  return part;
}
