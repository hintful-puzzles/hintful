/**
 * The souped-up Rectangles solver (`rect_solver`), ported faithfully.
 *
 * It is more than a plain solver: it copes with *uncertainty* about where the
 * numbers sit, because the generator runs it on a laid-out grid *before*
 * placing numbers, to decide where numbers must go for a unique solution. Each
 * `NumberData` carries a list of candidate positions (`points`); the solver
 * whittles both the per-rectangle placement lists and the per-number candidate
 * lists until every rectangle has exactly one placement (solved), some
 * rectangle has none (inconsistent), or progress stalls (ambiguous/hard).
 *
 * Used three ways: the generation uniqueness gate (numbers span a whole
 * rectangle, `rs` drives the winnowing), `solve` and `findMistakes` (each
 * number is a single fixed point, `rs` null). When `hedge`/`vedge` are given
 * and the solve is unique, the placed rectangle edges are written into them.
 *
 * The RNG draw order is byte-match surface (the generator's desc depends on it),
 * so the winnowing's `randomUpto(rs, nrpns)` and the swap-with-end removal order
 * (which the overlap counts, and hence later deductions, depend on) are
 * reproduced exactly.
 */

import {
  type Answer,
  answerCache,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { randomUpto } from "../../engine/random/index.ts";
import type { Point, Rect } from "../../engine/types.ts";
import type { RectState } from "./state.ts";

export interface NumberData {
  area: number;
  npoints: number;
  /** Candidate positions; only the first `npoints` are live. Mutated in
   * place (swap-with-end) exactly as upstream. */
  points: Point[];
}

interface RectPositions {
  rects: Rect[];
  n: number;
}

/** Solver verdicts. */
const SOLVE_INCONSISTENT = 0;
export const SOLVE_UNIQUE = 1;
const SOLVE_AMBIGUOUS = 2;

function removeRectPlacement(
  w: number,
  h: number,
  rectpositions: RectPositions[],
  overlaps: Int32Array,
  rectnum: number,
  placement: number,
): void {
  const r = rectpositions[rectnum].rects[placement];
  for (let yy = 0; yy < r.h; yy++) {
    const y = yy + r.y;
    for (let xx = 0; xx < r.w; xx++) {
      const x = xx + r.x;
      const idx = (rectnum * h + y) * w + x;
      if (overlaps[idx] > 0) overlaps[idx]--;
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

export function rectSolver(
  w: number,
  h: number,
  numbers: NumberData[],
  hedge: Uint8Array | null,
  vedge: Uint8Array | null,
  rs: RandomState | null,
): number {
  const rectpositions = allPlacements(w, h, numbers);
  const ret = narrowPlacements(w, h, numbers, rectpositions, rs).verdict;
  // The sole placement of a solved rectangle is written into the edge grids
  // when they were supplied, whatever the verdict (upstream's `cleanup:`).
  if (hedge && vedge)
    for (const { rects, n } of rectpositions)
      if (n === 1) drawRect(w, h, rects[0], hedge, vedge);
  return ret;
}

/* ----------------------------------------------------------------------
 * The answer: a search over the solver that counts a board's answers to two.
 */

/** A board's one answer: the edges of its rectangles. */
export interface RectSolution {
  readonly hedge: Uint8Array;
  readonly vedge: Uint8Array;
}
export type RectAnswer = Answer<RectSolution>;

/** A board's numbers as the solver takes them, each fixed where it is. */
function fixedNumbers(w: number, grid: ArrayLike<number>): NumberData[] {
  const numbers: NumberData[] = [];
  for (let i = 0; i < grid.length; i++)
    if (grid[i])
      numbers.push({
        area: grid[i],
        npoints: 1,
        points: [{ x: i % w, y: Math.floor(i / w) }],
      });
  return numbers;
}

/** Whether the solver alone settles every rectangle of a board. */
export function solverFinishes(w: number, h: number, grid: ArrayLike<number>): boolean {
  return rectSolver(w, h, fixedNumbers(w, grid), null, null, null) === SOLVE_UNIQUE;
}

/**
 * The positions the search may try before it gives up, which decides which
 * Unreasonable boards exist ({@link AnswerSearch.budget}): lowering it
 * refuses boards in saved games.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a board's answers up to two, by trial and error over the solver:
 * where it stops, take the first number with the fewest placements left and
 * assume each in turn. `grid` is the numbers, row-major, 0 where there is
 * none.
 */
export function searchAnswers(
  w: number,
  h: number,
  grid: ArrayLike<number>,
  budget: number = SEARCH_BUDGET,
): RectAnswer {
  const numbers = fixedNumbers(w, grid);
  // Rectangles that divide the grid have its area between them.
  if (numbers.reduce((sum, n) => sum + n.area, 0) !== w * h) return { kind: "none" };
  const covered = new Uint8Array(w * h);
  /** Whether the one placement each rectangle has left overlaps no other.
   * With the grid's area between them, they then cover it. This is what
   * makes "solved" a division checked and not one merely settled. No board
   * was found where it says no: the search agrees with a count that has no
   * solver in it on 450 boards of every kind with it taken out (2026-10-10). */
  const divides = (position: RectPositions[]): boolean => {
    covered.fill(0);
    for (const { rects } of position) {
      const r = rects[0];
      for (let y = r.y; y < r.y + r.h; y++)
        for (let x = r.x; x < r.x + r.w; x++) {
          if (covered[y * w + x]) return false;
          covered[y * w + x] = 1;
        }
    }
    return true;
  };
  return searchBoard<RectPositions[], RectSolution>({
    start: allPlacements(w, h, numbers),
    deduce(position) {
      // The verdict is upstream's, which the last rectangle decides and which
      // forgets that the deductions broke off, so both are asked for here.
      // Without `broke` the search calls boards with no answer solved.
      const { broke } = narrowPlacements(w, h, numbers, position, null);
      if (broke || position.some((p) => p.n <= 0)) return "contradiction";
      if (position.some((p) => p.n > 1)) return "stuck";
      return divides(position) ? "solved" : "contradiction";
    },
    assume(position) {
      let at = -1;
      for (let i = 0; i < position.length; i++)
        if (position[i].n > 1 && (at < 0 || position[i].n < position[at].n)) at = i;
      if (at < 0) return [];
      const held = position[at];
      return held.rects
        .slice(0, held.n)
        .map((placement) =>
          position.map((p, i) =>
            i === at
              ? { rects: [placement], n: 1 }
              : { rects: p.rects.slice(0, p.n), n: p.n },
          ),
        );
    },
    solution(position) {
      const hedge = new Uint8Array(w * h);
      const vedge = new Uint8Array(w * h);
      for (const { rects } of position) drawRect(w, h, rects[0], hedge, vedge);
      return { hedge, vedge };
    },
    budget,
  });
}

/** Keyed on a state's numbers, which every state of one game shares. */
const answers = answerCache<Int32Array, RectSolution>();

/** What a search of a state's numbers established about their answers. The
 * player's lines are not read. */
export function answerOf(state: RectState): RectAnswer {
  return answers(state.grid, () => searchAnswers(state.w, state.h, state.grid));
}

/** Draw the edges of `r` that are inside the grid into the edge grids. */
function drawRect(
  w: number,
  h: number,
  r: Rect,
  hedge: Uint8Array,
  vedge: Uint8Array,
): void {
  for (let y = 0; y < r.h; y++) {
    if (r.x > 0) vedge[(r.y + y) * w + r.x] = 1;
    if (r.x + r.w < w) vedge[(r.y + y) * w + (r.x + r.w)] = 1;
  }
  for (let x = 0; x < r.w; x++) {
    if (r.y > 0) hedge[r.y * w + (r.x + x)] = 1;
    if (r.y + r.h < h) hedge[(r.y + r.h) * w + (r.x + x)] = 1;
  }
}

/** Every placement of each number's rectangle that fits the grid and holds
 * one of the number's candidate positions: what the solver whittles down, and
 * a position of the answer search. */
function allPlacements(w: number, h: number, numbers: NumberData[]): RectPositions[] {
  const nrects = numbers.length;
  const rectpositions: RectPositions[] = [];
  for (let i = 0; i < nrects; i++) {
    const area = numbers[i].area;
    let minx = w;
    let miny = h;
    let maxx = -1;
    let maxy = -1;
    for (let j = 0; j < numbers[i].npoints; j++) {
      const px = numbers[i].points[j].x;
      const py = numbers[i].points[j].y;
      if (minx > px) minx = px;
      if (miny > py) miny = py;
      if (maxx < px) maxx = px;
      if (maxy < py) maxy = py;
    }

    const rlist: Rect[] = [];
    for (let rw = 1; rw <= area && rw <= w; rw++) {
      if (area % rw) continue;
      const rh = area / rw;
      if (rh > h) continue;

      for (let y = miny - rh + 1; y <= maxy; y++) {
        if (y < 0 || y + rh > h) continue;
        for (let x = minx - rw + 1; x <= maxx; x++) {
          if (x < 0 || x + rw > w) continue;
          // Does this rectangle contain a candidate number placement?
          let j: number;
          for (j = 0; j < numbers[i].npoints; j++)
            if (
              numbers[i].points[j].x >= x &&
              numbers[i].points[j].x < x + rw &&
              numbers[i].points[j].y >= y &&
              numbers[i].points[j].y < y + rh
            )
              break;
          if (j < numbers[i].npoints) rlist.push({ x, y, w: rw, h: rh });
        }
      }
    }
    rectpositions.push({ rects: rlist, n: rlist.length });
  }
  return rectpositions;
}

/**
 * The solver's deductions, run in place on `rectpositions`: the placements
 * each rectangle has left, which is {@link allPlacements} or fewer where some
 * are ruled out already. `broke` says the deductions met a square some
 * rectangle must cover and none can, which the verdict alone does not: it is
 * recomputed from the placement counts, as upstream's is.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: recursive rectangle placement with pruning; the branch structure IS the algorithm.
function narrowPlacements(
  w: number,
  h: number,
  numbers: NumberData[],
  rectpositions: RectPositions[],
  rs: RandomState | null,
): { verdict: number; broke: boolean } {
  const nrects = numbers.length;
  let broke = false;

  // Overlap counts: overlaps[(rect*h + y)*w + x].
  const overlaps = new Int32Array(nrects * w * h);
  for (let i = 0; i < nrects; i++) {
    for (let j = 0; j < rectpositions[i].n; j++) {
      const r = rectpositions[i].rects[j];
      for (let yy = 0; yy < r.h; yy++)
        for (let xx = 0; xx < r.w; xx++)
          overlaps[(i * h + (yy + r.y)) * w + (xx + r.x)]++;
    }
  }

  // Which rectangle a square is a candidate number placement for (or -1).
  const rectbyplace = new Int32Array(w * h).fill(-1);
  for (let i = 0; i < nrects; i++) {
    for (let j = 0; j < numbers[i].npoints; j++) {
      const x = numbers[i].points[j].x;
      const y = numbers[i].points[j].y;
      rectbyplace[y * w + x] = i;
    }
  }

  const workspace = new Int32Array(nrects);

  // Deduction loop. An inconsistency found mid-loop only breaks out: the
  // finalization below recomputes the verdict from the surviving placement
  // counts, as C's `cleanup:` label overwrites its mid-loop `ret = 0`.
  deduction: for (;;) {
    let doneSomething = false;

    // Sole remaining number position → mark known.
    for (let i = 0; i < nrects; i++) {
      if (numbers[i].npoints === 1) {
        const x = numbers[i].points[0].x;
        const y = numbers[i].points[0].y;
        if (overlaps[(i * h + y) * w + x] >= -1) {
          if (overlaps[(i * h + y) * w + x] <= 0) {
            broke = true;
            break deduction;
          }
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
            if (overlaps[(i * h + yy) * w + xx] <= 0) {
              broke = true;
              break deduction;
            }
            for (let j = 0; j < nrects; j++) overlaps[(j * h + yy) * w + xx] = -1;
            overlaps[(i * h + yy) * w + xx] = -2;
          }
    }

    // Rectangle-focused elimination.
    for (let i = 0; i < nrects; i++) {
      for (let j = 0; j < rectpositions[i].n; j++) {
        const r = rectpositions[i].rects[j];
        let del = false;
        for (let k = 0; k < nrects; k++) workspace[k] = 0;

        for (let yy = 0; yy < r.h; yy++) {
          const y = yy + r.y;
          for (let xx = 0; xx < r.w; xx++) {
            const x = xx + r.x;
            if (overlaps[(i * h + y) * w + x] === -1) del = true;
            if (rectbyplace[y * w + x] !== -1) workspace[rectbyplace[y * w + x]]++;
          }
        }

        if (!del) {
          for (let k = 0; k < nrects; k++)
            if (k !== i && workspace[k] === numbers[k].npoints) {
              del = true;
              break;
            }
          if (!del && workspace[i] === 0) del = true;
        }

        if (del) {
          removeRectPlacement(w, h, rectpositions, overlaps, i, j);
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
        let n = 0;
        let index = -1;
        for (let i = 0; i < nrects; i++)
          if (overlaps[(i * h + y) * w + x] > 0) {
            n++;
            index = i;
          }
        if (n === 1) {
          for (let j = 0; j < rectpositions[index].n; j++) {
            const r = rectpositions[index].rects[j];
            if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) continue;
            removeRectPlacement(w, h, rectpositions, overlaps, index, j);
            j--;
            doneSomething = true;
          }
        }
      }
    }

    if (doneSomething) continue;

    // Winnow number placements (generation only; deterministic solve stops).
    if (rs) {
      const rpns: Array<{ rect: number; placement: number; number: number }> = [];
      for (let i = 0; i < nrects; i++) {
        for (let j = 0; j < rectpositions[i].n; j++) {
          const r = rectpositions[i].rects[j];
          for (let yy = 0; yy < r.h; yy++) {
            const y = yy + r.y;
            for (let xx = 0; xx < r.w; xx++) {
              const x = xx + r.x;
              if (rectbyplace[y * w + x] >= 0 && rectbyplace[y * w + x] !== i) {
                rpns.push({ rect: i, placement: j, number: rectbyplace[y * w + x] });
              }
            }
          }
        }
      }

      if (rpns.length > 0) {
        const index = randomUpto(rs, rpns.length);
        const rpn = rpns[index];
        const i = rpn.rect;
        const j = rpn.placement;
        const k = rpn.number;
        const r = rectpositions[i].rects[j];
        for (let m = 0; m < numbers[k].npoints; m++) {
          const x = numbers[k].points[m].x;
          const y = numbers[k].points[m].y;
          if (x < r.x || x >= r.x + r.w || y < r.y || y >= r.y + r.h) {
            removeNumberPlacement(w, numbers[k], m, rectbyplace);
            m--;
            doneSomething = true;
          }
        }
      }
    }

    if (!doneSomething) break;
  }

  // Finalize (upstream's `cleanup:`): the verdict is recomputed purely from the
  // surviving placement counts. The last rectangle with none or several left
  // decides it, as in upstream's loop.
  let verdict = SOLVE_UNIQUE;
  for (let i = 0; i < nrects; i++) {
    if (rectpositions[i].n <= 0) verdict = SOLVE_INCONSISTENT;
    else if (rectpositions[i].n > 1) verdict = SOLVE_AMBIGUOUS;
  }
  return { verdict, broke };
}
