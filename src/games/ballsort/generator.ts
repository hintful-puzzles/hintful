/**
 * Ball Sort's generator: shuffle every ball into the full tubes, leave the
 * spare tubes empty, and keep the deal only where the search sorts it.
 *
 * Difficulty is the board's (`add-ball-sort` design D3): with two empty
 * tubes every shuffle measured could be sorted, and with one most cannot, so
 * the search is the whole of the gate.
 */

import { shuffle } from "../../engine/board/shuffle.ts";
import { drawRejected } from "../../engine/deal-census.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { Reach } from "./solver.ts";
import {
  type BallsortParams,
  type BallsortState,
  encodeDesc,
  isSorted,
} from "./state.ts";

/** A shuffle, or null where it deals a tube already sorted or one the search
 * cannot sort. */
function draw(p: BallsortParams, rng: RandomState): BallsortState | null {
  const w = p.colors + p.spare;
  const h = p.capacity;
  const balls: number[] = [];
  for (let c = 1; c <= p.colors; c++) for (let k = 0; k < h; k++) balls.push(c);
  shuffle(balls, rng);
  const ball = new Int32Array(w * h);
  balls.forEach((v, i) => {
    const t = Math.floor(i / h);
    ball[(i % h) * w + t] = v;
  });
  const s: BallsortState = { w, h, colors: p.colors, ball };
  for (let t = 0; t < p.colors; t++) {
    if (isSorted(s, t)) return drawRejected("ballsort: a tube dealt already sorted");
  }
  const reach = Reach.of(s);
  if (reach === null)
    return drawRejected("ballsort: more positions than the search reaches");
  if (reach.distance(s) === null) return drawRejected("ballsort: a deal nothing sorts");
  return s;
}

export function newDesc(p: BallsortParams, rng: RandomState): { desc: string } {
  const attempt = retryLimit("ballsort: a deal the search sorts");
  for (;;) {
    attempt();
    const s = draw(p, rng);
    if (s !== null) return { desc: encodeDesc(s) };
  }
}
