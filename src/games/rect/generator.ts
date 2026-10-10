/**
 * Rectangles board generator (`new_game_desc`), ported byte-faithfully so that
 * for a given seed and params the produced desc and `aux` match the C output
 * exactly (the differential's guard).
 *
 * The shape, transliterated from upstream:
 *  1. Build a *base* grid at `size / (1 + expandfactor)` by repeatedly picking a
 *     random uncovered square and a random rectangle covering it (`enumRects` +
 *     `placeRect`), leaving occasional singletons.
 *  2. Remove each singleton by extending a neighbor (or, in the four-2×2 case,
 *     dropping a 3×3 over it).
 *  3. Stretch the base grid to full size in two passes — expand rows, transpose,
 *     expand rows again, transpose back — distributing the extra rows randomly.
 *  4. Enumerate the rectangles, and run the solver to winnow the number
 *     placements to a unique solution; place one number per rectangle.
 *  5. Encode `aux` (the solution edges) and the run-length desc.
 *
 * The grid holds, per cell, the flat top-left index of the rectangle covering it
 * (`y*w + x`), or `-1` (empty) / `-2` (known singleton) during construction.
 */

import { DIFF_EASY } from "../../engine/answer-search.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import type { Point, Rect } from "../../engine/types.ts";
import { rungsFinish } from "./hint.ts";
import { newState } from "./moves.ts";
import {
  firstTwoAnswers,
  type NumberData,
  rectSolver,
  SOLVE_UNIQUE,
  solverFinishes,
} from "./solver.ts";
import { encodeNumbers, type RectParams } from "./state.ts";

/**
 * Count (when `pick` is undefined) or select the `pick`-th of the possible
 * rectangles covering `(sx, sy)` in the current base grid. Upstream
 * `enum_rects`. `scratch` is a reused `2*w` buffer (top rows, then bottom rows).
 */
function enumRects(
  w: number,
  h: number,
  grid: Int32Array,
  sx: number,
  sy: number,
  scratch: Int32Array,
  pick?: number,
): number | Rect {
  const maxarea = Math.max(2, Math.floor((w * h) / 6));
  const top = scratch.subarray(0, w);
  const bottom = scratch.subarray(w);

  // Region within which any rectangle containing (sx,sy) must fall.
  for (let dy = -1; dy <= 1; dy += 2) {
    const bound = dy === -1 ? top : bottom;
    for (let dx = -1; dx <= 1; dx += 2) {
      for (let x = sx; x >= 0 && x < w; x += dx) {
        bound[x] = -2 * h * dy;
        for (let y = sy; y >= 0 && y < h; y += dy) {
          if (grid[y * w + x] === -1 && (x === sx || dy * y <= dy * bound[x - dx])) {
            bound[x] = y;
          } else break;
        }
      }
    }
  }

  // Largest rectangle actually placeable, to bound the enumeration.
  let realmaxarea = 0;
  for (let x = 0; x < w; x++) {
    const rh = bottom[x] - top[x] + 1;
    if (rh <= 0) continue;
    const dx = x > sx ? -1 : 1;
    let x2 = x;
    for (; x2 >= 0 && x2 < w; x2 += dx)
      if (bottom[x2] < bottom[x] || top[x2] > top[x]) break;
    const rw = Math.abs(x2 - x);
    if (realmaxarea < rw * rh) realmaxarea = rw * rh;
  }
  if (realmaxarea > maxarea) realmaxarea = maxarea;

  // Rectangles spanning the whole grid are boring; bound rw/rh below full size.
  let mw = w - 1;
  if (mw < 3) mw++;
  let mh = h - 1;
  if (mh < 3) mh++;

  let index = 0;
  for (let rw = 1; rw <= mw; rw++)
    for (let rh = 1; rh <= mh; rh++) {
      if (rw * rh > realmaxarea) continue;
      if (rw * rh === 1) continue;
      for (let x = Math.max(sx - rw + 1, 0); x <= Math.min(sx, w - rw); x++)
        for (let y = Math.max(sy - rh + 1, 0); y <= Math.min(sy, h - rh); y++) {
          if (
            top[x] <= y &&
            top[x + rw - 1] <= y &&
            bottom[x] >= y + rh - 1 &&
            bottom[x + rw - 1] >= y + rh - 1
          ) {
            if (pick !== undefined && index === pick) {
              return { x, y, w: rw, h: rh };
            }
            index++;
          }
        }
    }

  return index;
}

function placeRect(w: number, grid: Int32Array, r: Rect): void {
  const idx = r.y * w + r.x;
  for (let x = r.x; x < r.x + r.w; x++)
    for (let y = r.y; y < r.y + r.h; y++) grid[y * w + x] = idx;
}

function findRect(w: number, h: number, grid: Int32Array, x: number, y: number): Rect {
  const idx = grid[y * w + x];
  if (idx < 0) return { x, y, w: 1, h: 1 };
  const ty = Math.floor(idx / w);
  const tx = idx % w;
  let rw = 1;
  while (tx + rw < w && grid[ty * w + (tx + rw)] === idx) rw++;
  let rh = 1;
  while (ty + rh < h && grid[(ty + rh) * w + tx] === idx) rh++;
  return { x: tx, y: ty, w: rw, h: rh };
}

/**
 * A division of the grid into rectangles, and each rectangle as the solver
 * takes it before its number is placed: every square of it a candidate.
 * Steps 1 to 3 of the file comment, and the start of 4.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: rectangle placement, merging and stretching, transliterated.
function division(
  params: RectParams,
  rs: RandomState,
): { grid: Int32Array; nd: NumberData[] } {
  const { expandfactor } = params;
  let { w: pw, h: ph } = params;
  {
    // Base-grid dimensions. C computes `(float)size / (1.0F + expandfactor)` in
    // single precision then casts to int, so round through `Math.fround`.
    const denom = Math.fround(1 + expandfactor);
    // Two squares a side at least, or the one a strip has: upstream leaves a
    // strip's at none when there is an expansion factor, and never returns.
    let p2w = Math.max(Math.trunc(Math.fround(pw / denom)), Math.min(pw, 2));
    let p2h = Math.max(Math.trunc(Math.fround(ph / denom)), Math.min(ph, 2));

    let grid = new Int32Array(p2w * p2h).fill(-1);
    const scratch = new Int32Array(2 * p2w);
    let nsquares = p2w * p2h;

    // Place random rectangles until the grid is full.
    while (nsquares > 0) {
      // The `square`-th uncovered square, counting row-major.
      let square = randomUpto(rs, nsquares);
      let i = 0;
      while (grid[i] !== -1 || square-- > 0) i++;
      const x = i % p2w;
      const y = Math.floor(i / p2w);

      const n = enumRects(p2w, p2h, grid, x, y, scratch) as number;
      if (!n) {
        grid[i] = -2;
        nsquares--;
      } else {
        const pick = randomUpto(rs, n);
        const r = enumRects(p2w, p2h, grid, x, y, scratch, pick) as Rect;
        placeRect(p2w, grid, r);
        nsquares -= r.w * r.h;
      }
    }

    // Deal with singletons: merge each into a neighbor, which gives up the row
    // or column the singleton extends (r2), keeping the rest (r1).
    for (let x = 0; x < p2w; x++) {
      for (let y = 0; y < p2h; y++) {
        if (grid[y * p2w + x] >= 0) continue;
        const dirs: number[] = [];
        if (x < p2w - 1) {
          const r = findRect(p2w, p2h, grid, x + 1, y);
          if ((r.w * r.h > 2 && (r.y === y || r.y + r.h - 1 === y)) || r.h === 1)
            dirs.push(1); // right
        }
        if (y > 0) {
          const r = findRect(p2w, p2h, grid, x, y - 1);
          if ((r.w * r.h > 2 && (r.x === x || r.x + r.w - 1 === x)) || r.w === 1)
            dirs.push(2); // up
        }
        if (x > 0) {
          const r = findRect(p2w, p2h, grid, x - 1, y);
          if ((r.w * r.h > 2 && (r.y === y || r.y + r.h - 1 === y)) || r.h === 1)
            dirs.push(4); // left
        }
        if (y < p2h - 1) {
          const r = findRect(p2w, p2h, grid, x, y + 1);
          if ((r.w * r.h > 2 && (r.x === x || r.x + r.w - 1 === x)) || r.w === 1)
            dirs.push(8); // down
        }

        if (dirs.length === 0) {
          // Four size-2 rectangles surround the singleton: replace with a 3×3.
          placeRect(p2w, grid, { x: x - 1, y: y - 1, w: 3, h: 3 });
          continue;
        }
        const dir = dirs[randomUpto(rs, dirs.length)];
        let r1: Rect;
        let r2: Rect;
        if (dir === 1) {
          r1 = findRect(p2w, p2h, grid, x + 1, y);
          r2 = { x, y, w: 1 + r1.w, h: 1 };
          if (r1.y === y) r1.y++;
          r1.h--;
        } else if (dir === 2) {
          r1 = findRect(p2w, p2h, grid, x, y - 1);
          r2 = { x, y: r1.y, w: 1, h: 1 + r1.h };
          if (r1.x === x) r1.x++;
          r1.w--;
        } else if (dir === 4) {
          r1 = findRect(p2w, p2h, grid, x - 1, y);
          r2 = { x: r1.x, y, w: 1 + r1.w, h: 1 };
          if (r1.y === y) r1.y++;
          r1.h--;
        } else {
          r1 = findRect(p2w, p2h, grid, x, y + 1);
          r2 = { x, y, w: 1, h: 1 + r1.h };
          if (r1.x === x) r1.x++;
          r1.w--;
        }
        if (r1.h > 0 && r1.w > 0) placeRect(p2w, grid, r1);
        placeRect(p2w, grid, r2);
      }
    }

    // Extend to the full size: expand rows, transpose, expand rows, transpose.
    for (let i = 0; i < 2; i++) {
      const p3w = p2w;
      const p3h = ph;
      const grid2 = new Int32Array(p2w * ph);
      const expand = new Int32Array(Math.max(0, p2h - 1));
      const where = new Int32Array(p2w);
      for (let y = p2h; y < ph; y++) expand[randomUpto(rs, p2h - 1)]++;

      let y2 = 0;
      let y2last = 0;
      for (let y = 0; y < p2h; y++) {
        // Copy row y of grid into row y2 of grid2.
        for (let x = 0; x < p2w; x++) {
          const val = grid[y * p2w + x];
          if (
            Math.floor(val / p2w) === y &&
            (y2 === 0 || Math.floor(grid2[(y2 - 1) * p3w + x] / p3w) < y2last)
          ) {
            grid2[y2 * p3w + x] = y2 * p3w + (val % p2w);
          } else {
            grid2[y2 * p3w + x] = grid2[(y2 - 1) * p3w + x];
          }
        }

        if (++y2 === p3h) break;
        y2last = y2;

        // Decide where each coincident edge goes among the invented rows.
        let yx = -1;
        for (let x = 0; x < p2w; x++) {
          if (grid[y * p2w + x] !== grid[(y + 1) * p2w + x]) {
            if (
              x === 0 ||
              (grid[y * p2w + (x - 1)] !== grid[y * p2w + x] &&
                grid[(y + 1) * p2w + (x - 1)] !== grid[(y + 1) * p2w + x])
            ) {
              yx = randomUpto(rs, expand[y] + 1);
            }
            // else reuse previous yx
          } else {
            yx = -1;
          }
          where[x] = yx;
        }

        for (let yy = 0; yy < expand[y]; yy++) {
          for (let x = 0; x < p2w; x++) {
            if (yy === where[x]) {
              grid2[y2 * p3w + x] = y2 * p3w + (grid[(y + 1) * p2w + x] % p2w);
            } else {
              grid2[y2 * p3w + x] = grid2[(y2 - 1) * p3w + x];
            }
          }
          y2++;
        }
      }

      // Transpose.
      p2w = p3h;
      p2h = p3w;
      grid = new Int32Array(p2w * p2h);
      for (let x = 0; x < p2w; x++)
        for (let y = 0; y < p2h; y++) {
          const v = grid2[x * p3w + y];
          grid[y * p2w + x] = (v % p3w) * p2w + Math.floor(v / p3w);
        }
      [pw, ph] = [ph, pw];
    }

    // One number per rectangle, found at its top-left square; every square of
    // the rectangle starts as a candidate position.
    const nd: NumberData[] = [];
    for (let y = 0; y < ph; y++) {
      for (let x = 0; x < pw; x++) {
        if (grid[y * pw + x] !== y * pw + x) continue;
        const r = findRect(pw, ph, grid, x, y);
        const points: Point[] = [];
        for (let j = 0; j < r.h; j++)
          for (let k = 0; k < r.w; k++) points.push({ x: k + r.x, y: j + r.y });
        nd.push({ area: r.w * r.h, npoints: r.w * r.h, points });
      }
    }

    return { grid, nd };
  }
}

const sameRect = (a: Rect, b: Rect): boolean =>
  a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

/** The solution's edges as Solve replays them: vedge for x≥1 row-major, then
 * hedge for y≥1. */
function auxOf(w: number, h: number, grid: Int32Array): string {
  let aux = "S";
  for (let y = 0; y < h; y++)
    for (let x = 1; x < w; x++)
      aux += grid[y * w + x] !== grid[y * w + (x - 1)] ? "1" : "0";
  for (let y = 1; y < h; y++)
    for (let x = 0; x < w; x++)
      aux += grid[y * w + x] !== grid[(y - 1) * w + x] ? "1" : "0";
  return aux;
}

/**
 * The positions the search may try on a candidate for an Unreasonable board
 * before the draw is thrown away, far under the 2,000 a pasted board is
 * allowed.
 *
 * Measured 2026-10-10 on twelve boards at each menu size: a dealt board needs
 * a median of 3 positions, 6 at 7×7, and 9 at most. No search ran out in two
 * million made on draws of nineteen shapes from 2×9 to 70×70.
 */
const DEAL_BUDGET = 30;

/**
 * The numbers an Unreasonable deal may move on one draw before it throws the
 * draw away. Nothing says the moves end: one takes an answer away and may
 * make another.
 *
 * Measured 2026-10-10 over those two million searches: a draw took 59 moves
 * at most on 2×12, 43 on every other shape that is dealt, and 124 on 2×11,
 * which is not.
 */
const MAX_NUMBERS_MOVED = 200;

/** An Easy board, upstream's only kind made stricter: its numbers placed by
 * the solver so that it settles every rectangle, and kept if the hint
 * finishes it too. `null` when this division did not give one. */
function easyBoard(
  params: RectParams,
  rs: RandomState,
  grid: Int32Array,
  nd: NumberData[],
): { desc: string; aux: string } | null {
  const { w, h } = params;
  // give up and go round again
  if (rectSolver(w, h, nd, null, null, rs) !== SOLVE_UNIQUE) return null;

  const numbers = new Int32Array(w * h);
  for (const { area, npoints, points } of nd) {
    const p = points[randomUpto(rs, npoints)];
    numbers[p.y * w + p.x] = area;
  }

  const desc = encodeNumbers(numbers, w * h);
  // A board the hint could not finish would leave a player it had helped
  // stranded with a refusal that blames the board's difficulty, which Easy
  // does not excuse. Deal again.
  if (!rungsFinish(newState(params, desc))) return null;
  return { desc, aux: auxOf(w, h, grid) };
}

/**
 * An Unreasonable board: each number on a square of its rectangle at random,
 * with none of the solver's steering, then moved until the division is the
 * only answer, and kept where the solver and the hint both stop short.
 * `null` when this division did not give one.
 *
 * Four draws in five have a second answer as their numbers fall. The search
 * hands that answer over, some number's rectangle in it is not the one dealt,
 * and the number moves to a square of its own rectangle that the other leaves
 * out: the dealt division is still an answer and that one is not. Measured
 * 2026-10-10, a board then takes 100 to 400 draws at every size, where
 * throwing such a draw away took 1,000 at 15×15, 1,400 at 19×19 and 4,000 at
 * 30×30, past what a deal is allowed.
 *
 * It is not an Easy board with its numbers moved. Measured the same day,
 * moving each number about its rectangle while the search still proved one
 * answer took two to four times as long as throwing draws away did.
 */
function unreasonableBoard(
  params: RectParams,
  rs: RandomState,
  grid: Int32Array,
  nd: NumberData[],
): { desc: string; aux: string } | null {
  const { w, h } = params;
  // Each rectangle as dealt, the square its number is on, and the rectangle
  // each square is in.
  const dealt: Rect[] = [];
  const at: number[] = [];
  const within = new Int32Array(w * h);
  const numbers = new Int32Array(w * h);
  for (const { area, npoints, points } of nd) {
    const first = points[0];
    const last = points[npoints - 1];
    for (const p of points) within[p.y * w + p.x] = dealt.length;
    dealt.push({
      x: first.x,
      y: first.y,
      w: last.x - first.x + 1,
      h: last.y - first.y + 1,
    });
    const p = points[randomUpto(rs, npoints)];
    at.push(p.y * w + p.x);
    numbers[p.y * w + p.x] = area;
  }

  let alone = false;
  for (let moved = 0; moved <= MAX_NUMBERS_MOVED; moved++) {
    const answers = firstTwoAnswers(w, h, numbers, DEAL_BUDGET);
    if (answers === null) return null;
    // An answer lists its rectangles in the reading order of the numbers.
    const holders: number[] = [];
    for (let i = 0; i < w * h; i++) if (numbers[i]) holders.push(within[i]);
    const strayed = answers
      .map((answer) =>
        answer.flatMap((rect, i) =>
          sameRect(rect, dealt[holders[i]]) ? [] : [{ k: holders[i], rect }],
        ),
      )
      .find((astray) => astray.length > 0);
    // The division as dealt is an answer, so with no other it is the only one.
    if (!strayed) {
      alone = true;
      break;
    }
    const { k, rect } = strayed[randomUpto(rs, strayed.length)];
    const outside = nd[k].points.filter(
      (p) =>
        !(
          p.x >= rect.x &&
          p.x < rect.x + rect.w &&
          p.y >= rect.y &&
          p.y < rect.y + rect.h
        ),
    );
    const to = outside[randomUpto(rs, outside.length)];
    numbers[at[k]] = 0;
    at[k] = to.y * w + to.x;
    numbers[at[k]] = nd[k].area;
  }
  if (!alone) return null;
  // Most boards mended to one answer are ones the solver settles.
  if (solverFinishes(w, h, numbers)) return null;
  const desc = encodeNumbers(numbers, w * h);
  // The hint knows placements the solver does not rule out, and a board it
  // finishes needs no trial and error.
  if (rungsFinish(newState(params, desc))) return null;
  return { desc, aux: auxOf(w, h, grid) };
}

/**
 * A small Unreasonable board is rare, and a draw of it is cheap. Measured
 * 2026-10-10, mean draws for a board over ten deals: 10,500 at 4×4, 7,400 at
 * 2×12, 6,100 at 3×5, 2,800 at 2×40. A board of 4×5 or more that is not a
 * strip takes 100 to 400 at every size tried, up to 70×70.
 */
export function newDesc(
  params: RectParams,
  rs: RandomState,
): { desc: string; aux: string } {
  const attempt = retryLimit(`rect: generation (${params.w}x${params.h})`);
  for (;;) {
    attempt();
    const { grid, nd } = division(params, rs);
    const board =
      params.diff === DIFF_EASY
        ? easyBoard(params, rs, grid, nd)
        : unreasonableBoard(params, rs, grid, nd);
    if (board) return board;
  }
}
