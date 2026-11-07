/**
 * Upstream's Rectangles solver (`rect_solver`), which the generator runs on a
 * laid-out grid before any number is placed, to decide where each rectangle's
 * number may go. It copes with uncertainty about where the numbers sit: each
 * {@link NumberData} carries the squares its number may still take, and the
 * solver whittles both each rectangle's placements and each number's squares
 * until every rectangle has one placement, some rectangle has none, or it
 * stalls. Where the deductions stall it draws a placement at random and keeps
 * only the squares of the number it lies over that it holds, which is the
 * winnowing. A board is graded by the ladder, never by this.
 *
 * The draws are upstream's, so a seed lays out the board upstream's would:
 * the winnowing's `randomUpto(rs, count)` and the swap-with-end removal order,
 * which the overlap counts and so later deductions follow.
 */

import type { RandomState } from "../../engine/random/index.ts";
import { randomUpto } from "../../engine/random/index.ts";
import type { Point, Rect } from "../../engine/types.ts";
import { clueDimensions } from "./state.ts";

export interface NumberData {
  /** The rectangle's size. */
  area: number;
  /** What the clue says of its rectangle's shape, a `SHAPE_*`. */
  shape: number;
  npoints: number;
  /** Candidate positions; only the first `npoints` are live. Mutated in
   * place (swap-with-end) exactly as upstream. */
  points: Point[];
}

interface RectPositions {
  rects: Rect[];
  n: number;
}

function removeRectPlacement(
  w: number,
  h: number,
  rectpositions: RectPositions[],
  overlaps: Int32Array,
  reaching: Int32Array,
  rectnum: number,
  placement: number,
): void {
  const r = rectpositions[rectnum].rects[placement];
  for (let yy = 0; yy < r.h; yy++) {
    const y = yy + r.y;
    for (let xx = 0; xx < r.w; xx++) {
      const x = xx + r.x;
      const idx = (rectnum * h + y) * w + x;
      if (overlaps[idx] > 0 && --overlaps[idx] === 0) reaching[y * w + x]--;
    }
  }
  const n = rectpositions[rectnum].n;
  if (placement < n - 1) {
    const t = rectpositions[rectnum].rects[n - 1];
    rectpositions[rectnum].rects[n - 1] = rectpositions[rectnum].rects[placement];
    rectpositions[rectnum].rects[placement] = t;
  }
  rectpositions[rectnum].n--;
}

function removeNumberPlacement(
  w: number,
  number: NumberData,
  index: number,
  rectbyplace: Int32Array,
): void {
  rectbyplace[number.points[index].y * w + number.points[index].x] = -1;
  const n = number.npoints;
  if (index < n - 1) {
    const t = number.points[n - 1];
    number.points[n - 1] = number.points[index];
    number.points[index] = t;
  }
  number.npoints--;
}

/** Every placement of each rectangle that its clue allows, fits the grid and
 * holds one of its number's candidate squares. */
function allPlacements(w: number, h: number, numbers: NumberData[]): RectPositions[] {
  const rectpositions: RectPositions[] = [];
  for (const number of numbers) {
    let minx = w;
    let miny = h;
    let maxx = -1;
    let maxy = -1;
    for (let j = 0; j < number.npoints; j++) {
      const { x, y } = number.points[j];
      if (minx > x) minx = x;
      if (miny > y) miny = y;
      if (maxx < x) maxx = x;
      if (maxy < y) maxy = y;
    }
    const rlist: Rect[] = [];
    for (const [rw, rh] of clueDimensions(number.shape, number.area, w, h)) {
      if (rw > w || rh > h) continue;
      for (let y = miny - rh + 1; y <= maxy; y++) {
        if (y < 0 || y + rh > h) continue;
        for (let x = minx - rw + 1; x <= maxx; x++) {
          if (x < 0 || x + rw > w) continue;
          // Does this rectangle contain a candidate number placement?
          let j: number;
          for (j = 0; j < number.npoints; j++) {
            const p = number.points[j];
            if (p.x >= x && p.x < x + rw && p.y >= y && p.y < y + rh) break;
          }
          if (j < number.npoints) rlist.push({ x, y, w: rw, h: rh });
        }
      }
    }
    rectpositions.push({ rects: rlist, n: rlist.length });
  }
  return rectpositions;
}

/** A placement of one rectangle that lies over a square another's number
 * might be on. */
interface ForeignSquare {
  rect: number;
  placement: number;
  number: number;
}

/**
 * Count (when `pick` is undefined) or select the `pick`-th of the
 * {@link ForeignSquare}s, a placement at a time in reading order. The winnowing
 * draws one of them each time the deductions stall, hundreds of times a
 * board, so they are counted and not listed.
 */
function foreignSquares(
  w: number,
  rectpositions: RectPositions[],
  rectbyplace: Int32Array,
  pick?: number,
): number | ForeignSquare {
  let index = 0;
  for (let i = 0; i < rectpositions.length; i++)
    for (let j = 0; j < rectpositions[i].n; j++) {
      const r = rectpositions[i].rects[j];
      for (let y = r.y; y < r.y + r.h; y++)
        for (let x = r.x; x < r.x + r.w; x++) {
          const number = rectbyplace[y * w + x];
          if (number < 0 || number === i) continue;
          if (index === pick) return { rect: i, placement: j, number };
          index++;
        }
    }
  return index;
}

/**
 * Whittle the numbers' squares in place, `numbers` the rectangles of a laid
 * out grid each with every square of it, until every rectangle has one
 * placement left: true where it comes to that, false where some rectangle
 * has none or several left when the deductions and the draws run out.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: upstream's deduction loop; the branch structure IS the algorithm.
export function winnowNumbers(
  w: number,
  h: number,
  numbers: NumberData[],
  rs: RandomState,
): boolean {
  const nrects = numbers.length;
  const rectpositions = allPlacements(w, h, numbers);

  // Overlap counts: overlaps[(rect*h + y)*w + x].
  const overlaps = new Int32Array(nrects * w * h);
  // How many rectangles have a placement over each square not yet known,
  // which the square-focused elimination would otherwise count afresh for
  // every square on every pass.
  const reaching = new Int32Array(w * h);
  for (let i = 0; i < nrects; i++) {
    for (let j = 0; j < rectpositions[i].n; j++) {
      const r = rectpositions[i].rects[j];
      for (let yy = 0; yy < r.h; yy++)
        for (let xx = 0; xx < r.w; xx++) {
          const sq = (yy + r.y) * w + (xx + r.x);
          if (overlaps[i * w * h + sq]++ === 0) reaching[sq]++;
        }
    }
  }

  // Which rectangle a square is a candidate number placement for (or -1).
  const rectbyplace = new Int32Array(w * h).fill(-1);
  for (let i = 0; i < nrects; i++)
    for (let j = 0; j < numbers[i].npoints; j++) {
      const { x, y } = numbers[i].points[j];
      rectbyplace[y * w + x] = i;
    }

  // How many of each number's positions a placement lies over, kept at zero
  // between placements by clearing the entries `touched` lists: clearing and
  // reading every number's for every placement was most of a large deal.
  const workspace = new Int32Array(nrects);
  const touched = new Int32Array(nrects);

  // An inconsistency found mid-loop only breaks out: the verdict below is
  // read from the surviving placement counts, as upstream's `cleanup:` reads
  // it.
  deduction: for (;;) {
    let doneSomething = false;

    // Sole remaining number position → mark known.
    for (let i = 0; i < nrects; i++) {
      if (numbers[i].npoints === 1) {
        const { x, y } = numbers[i].points[0];
        if (overlaps[(i * h + y) * w + x] >= -1) {
          if (overlaps[(i * h + y) * w + x] <= 0) break deduction;
          for (let j = 0; j < nrects; j++) overlaps[(j * h + y) * w + x] = -1;
          overlaps[(i * h + y) * w + x] = -2;
        }
      }
    }

    // Intersection of all placements → mark known.
    for (let i = 0; i < nrects; i++) {
      let minx = 0;
      let miny = 0;
      let maxx = w;
      let maxy = h;
      for (let j = 0; j < rectpositions[i].n; j++) {
        const r = rectpositions[i].rects[j];
        if (minx < r.x) minx = r.x;
        if (miny < r.y) miny = r.y;
        if (maxx > r.x + r.w) maxx = r.x + r.w;
        if (maxy > r.y + r.h) maxy = r.y + r.h;
      }
      for (let yy = miny; yy < maxy; yy++)
        for (let xx = minx; xx < maxx; xx++)
          if (overlaps[(i * h + yy) * w + xx] >= -1) {
            if (overlaps[(i * h + yy) * w + xx] <= 0) break deduction;
            for (let j = 0; j < nrects; j++) overlaps[(j * h + yy) * w + xx] = -1;
            overlaps[(i * h + yy) * w + xx] = -2;
          }
    }

    // Rectangle-focused elimination.
    for (let i = 0; i < nrects; i++) {
      for (let j = 0; j < rectpositions[i].n; j++) {
        const r = rectpositions[i].rects[j];
        let del = false;
        let ntouched = 0;

        for (let yy = 0; yy < r.h; yy++) {
          const y = yy + r.y;
          for (let xx = 0; xx < r.w; xx++) {
            const x = xx + r.x;
            if (overlaps[(i * h + y) * w + x] === -1) del = true;
            const k = rectbyplace[y * w + x];
            if (k !== -1 && workspace[k]++ === 0) touched[ntouched++] = k;
          }
        }

        // A number always has a position left, so only one this placement
        // lies over can have them all inside it.
        if (!del) {
          for (let t = 0; t < ntouched; t++) {
            const k = touched[t];
            if (k !== i && workspace[k] === numbers[k].npoints) {
              del = true;
              break;
            }
          }
          if (!del && workspace[i] === 0) del = true;
        }
        for (let t = 0; t < ntouched; t++) workspace[touched[t]] = 0;

        if (del) {
          removeRectPlacement(w, h, rectpositions, overlaps, reaching, i, j);
          j--;
          doneSomething = true;
        }
      }
    }

    // Square-focused elimination.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // Known squares are <0 everywhere, so check rect 0's plane only.
        if (overlaps[y * w + x] < 0) continue;
        if (reaching[y * w + x] === 1) {
          let index = 0;
          while (overlaps[(index * h + y) * w + x] <= 0) index++;
          for (let j = 0; j < rectpositions[index].n; j++) {
            const r = rectpositions[index].rects[j];
            if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) continue;
            removeRectPlacement(w, h, rectpositions, overlaps, reaching, index, j);
            j--;
            doneSomething = true;
          }
        }
      }
    }

    if (doneSomething) continue;

    // Winnow the numbers' squares: a placement over another number's square
    // drawn at random, and that number kept to the squares it holds.
    const count = foreignSquares(w, rectpositions, rectbyplace) as number;
    if (count > 0) {
      const pick = randomUpto(rs, count);
      const found = foreignSquares(w, rectpositions, rectbyplace, pick);
      const { rect: i, placement: j, number: k } = found as ForeignSquare;
      const r = rectpositions[i].rects[j];
      for (let m = 0; m < numbers[k].npoints; m++) {
        const { x, y } = numbers[k].points[m];
        if (x < r.x || x >= r.x + r.w || y < r.y || y >= r.y + r.h) {
          removeNumberPlacement(w, numbers[k], m, rectbyplace);
          m--;
          doneSomething = true;
        }
      }
    }

    if (!doneSomething) break;
  }

  return rectpositions.every(({ n }) => n === 1);
}
