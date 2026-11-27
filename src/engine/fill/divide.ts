/**
 * A dealt partition divided at random apart from the answer
 * (`deal.divide`), which a deal lays its clues on or searches its answer
 * under; or the answer itself, as the walls between its parts
 * (`sample.walls`). Three ways:
 *
 * - Into small parts, upstream keen.c's cages. Each cell in a random order
 *   is joined, at the odds `pairs`, to the first of its neighbors in that
 *   order still alone; then each cell left alone is joined to the first of
 *   its neighbors' parts under `most` cells. It is not
 *   `engine/generate/divide.ts`'s `mergeNeighbors` under a largest size,
 *   which deals parts at that size: Keen's difference and quotient sit on
 *   two cells, so the pairs are laid first and most parts stay pairs.
 * - A part at a time, each grown to a size drawn from a list
 *   (`growToSize`): Seismic's areas, dealt before any number is.
 * - Into parts of one size that tile the board (`divvyRectangle`, upstream
 *   divvy.c): Solo's jigsaw blocks.
 */

import { Dsf } from "../board/dsf.ts";
import { shuffle } from "../board/shuffle.ts";
import { growToSize } from "../generate/divide.ts";
import { divvyRectangle } from "../generate/divvy.ts";
import { type RandomState, randomUpto } from "../random/index.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import type { FillDivision } from "./game-id.ts";

/** The resolution the odds of a pair are drawn at. */
const CHANCE = 1 << 20;

/** Each cell's part, numbered in the order the parts' first cells come;
 * `null` where a cell was left alone, which the deal draws again. `sizes`
 * are the board's sizes beyond the grid's, which a list of sizes may be
 * chosen by. */
export function dividePartition(
  divide: FillDivision,
  sp: GridSpace,
  sizes: Readonly<Record<string, number>>,
  rs: RandomState,
): Int32Array | null {
  const n = sp.cells.length;
  if ("equal" in divide) {
    if (n !== sp.w * sp.h) throw new Error("divide: a board with holes tiled");
    return numbered(
      divvyRectangle(sp.w, sp.h, equalSize(divide, sp, sizes), rs),
      sp.cells,
    );
  }
  if ("sizes" in divide) {
    // Grown over the whole grid: a board of every cell.
    if (n !== sp.w * sp.h) throw new Error("divide: sizes grown on a board with holes");
    const { by } = divide;
    const list =
      divide.sizes[by === undefined ? 0 : (sizes[by.size] ?? by.min) - by.min];
    if (list === undefined) throw new Error("divide: no list of sizes for the board");
    return numbered(
      growToSize(sp, rs, () => list[randomUpto(rs, list.length)]),
      sp.cells,
    );
  }
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
  return numbered(dsf, sp.cells);
}

/** The cells of each part a division into equal parts deals on the board
 * `sp` of the sizes `sizes`: a number, `w` the board's width, or a size. */
export function equalSize(
  divide: { readonly equal: number | string },
  sp: { readonly w: number },
  sizes: Readonly<Record<string, number>>,
): number {
  const { equal } = divide;
  if (typeof equal === "number") return equal;
  const k = equal === "w" ? sp.w : sizes[equal];
  if (k === undefined) throw new Error(`divide: no size ${equal} on the board`);
  return k;
}

/** Each of `cells`' part in `dsf`, numbered in the order of the parts'
 * first cells. */
function numbered(dsf: Dsf, cells: readonly number[]): Int32Array {
  const part = new Int32Array(cells.length).fill(-1);
  let parts = 0;
  for (const c of cells) {
    const root = dsf.canonify(c);
    if (part[root] < 0) part[root] = parts++;
    part[c] = part[root];
  }
  return part;
}
