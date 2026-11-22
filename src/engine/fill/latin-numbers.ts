/**
 * The numbers of a deal's `latin` kind (Singles'): a Latin square's on every
 * cell, so no two cells of a row or a column share one, and then each cell
 * the answer holds `under` numbered again to repeat a number its row or
 * column keeps, as upstream's singles.c `new_game_desc` and `best_black_col`
 * deal them.
 */

import { shuffle } from "../board/shuffle.ts";
import type { RandomState } from "../random/index.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import { latinGenerateRect } from "../solve/latin.ts";

/**
 * Each cell's number, 1 to the longer side: a Latin square's where `g` does
 * not hold `under`, and where it does, a number that once laid there is the
 * second of its row and of its column, or failing one, the second of either.
 * A number single in both lines is preferred, since it takes a number the
 * clear cells would otherwise have to themselves.
 */
export function latinNumbers(
  g: ArrayLike<number>,
  sp: GridSpace,
  under: number,
  rs: RandomState,
): number[] {
  const { w, h } = sp;
  const o = Math.max(w, h);
  const nums = Array.from(latinGenerateRect(w, h, rs));
  // How many cells of each line keep each number: line * o + number - 1.
  const inRow = new Int32Array(h * o);
  const inCol = new Int32Array(w * o);
  for (const c of sp.cells) {
    if (g[c] === under) continue;
    inRow[Math.floor(c / w) * o + nums[c] - 1]++;
    inCol[(c % w) * o + nums[c] - 1]++;
  }
  const order = Array.from({ length: o }, (_, k) => k);
  for (const c of sp.cells) {
    if (g[c] !== under) continue;
    const row = Math.floor(c / w) * o;
    const col = (c % w) * o;
    shuffle(order, rs);
    const v =
      order.find((k) => inRow[row + k] === 1 && inCol[col + k] === 1) ??
      order.find((k) => inRow[row + k] !== 0 || inCol[col + k] !== 0);
    // A covered cell has a clear neighbor, whose number its row or column
    // keeps.
    if (v === undefined) throw new Error("latin numbers: no number to repeat");
    inRow[row + v]++;
    inCol[col + v]++;
    nums[c] = v + 1;
  }
  return nums;
}
