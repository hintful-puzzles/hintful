/**
 * Bricks generator — port of `new_game_desc` (and its helpers
 * `bricks_fill_grid`, `bricks_build_numbers`, `bricks_remove_numbers`) in
 * `puzzles/unreleased/bricks.c`.
 *
 * The RNG draws, per outer attempt, are `fillGrid`'s conditional draws, then one
 * `shuffle` of the padded cell indices. The solver consumes no RNG, so the desc
 * is a pure function of the seed, and because every removal is gated on the
 * ladder or the search, a change to their power changes which boards exist.
 */

import { dealUnreasonable } from "../../engine/answer-search.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { deducedBricks, deductionFinishes, searchAnswers } from "./solver.ts";
import {
  applyBounds,
  BRICKS_STEPS,
  type BricksParams,
  COL_MASK,
  DIFF_EASY,
  encodeDesc,
  F_BOUND,
  F_EMPTY,
  F_SHADE,
  F_UNSHADE,
  gridSize,
  MAX_GENERABLE_DIFF,
} from "./state.ts";

const MINIMUM_SHADED = 0.4;

/** Fill the playable cells bottom-up with shade/unshade under the gravity +
 * no-three-run constraints (upstream `bricks_fill_grid`). The `randomUpto`
 * draw is conditional — it fires only when neither the run limit nor gravity
 * already forced an unshade — so the `||` short-circuit order is preserved. */
function fillGrid(grid: Uint16Array, w: number, h: number, rs: RandomState): void {
  for (let y = h - 1; y >= 0; y--) {
    let run = 0;
    for (let x = 0; x < w; x++) {
      const i1 = y * w + x;
      if (grid[i1] & F_BOUND) continue;

      const i2 = (y + 1) * w + x - 1;
      const i3 = (y + 1) * w + x;

      let n2 = x === 0 || y === h - 1 ? F_BOUND : grid[i2];
      if (!(n2 & F_BOUND)) n2 &= COL_MASK;
      let n3 = y === h - 1 ? F_BOUND : grid[i3];
      if (!(n3 & F_BOUND)) n3 &= COL_MASK;

      if (
        run === 2 ||
        (y !== h - 1 && n2 !== F_SHADE && n3 !== F_SHADE) ||
        randomUpto(rs, 3) === 0
      ) {
        grid[i1] = F_UNSHADE;
        run = 0;
      } else {
        grid[i1] = F_SHADE;
        run++;
      }
    }
  }
}

/** Replace every non-shaded playable cell with its shaded-neighbor count
 * (upstream `bricks_build_numbers`); returns the total shaded count. */
function buildNumbers(grid: Uint16Array, w: number, h: number): number {
  let total = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const n = grid[y * w + x];
      if (n === F_SHADE) total++;
      if (n === F_SHADE || n & F_BOUND) continue;

      let shade = 0;
      for (const [dx, dy] of BRICKS_STEPS) {
        const x2 = x + dx;
        const y2 = y + dy;
        if (x2 < 0 || x2 >= w || y2 < 0 || y2 >= h) continue;
        if ((grid[y2 * w + x2] & COL_MASK) === F_SHADE) shade++;
      }
      grid[y * w + x] = shade;
    }
  }
  return total;
}

/** Greedy clue minimization (upstream `bricks_remove_numbers`): one shuffle
 * of the padded cell indices, then blank each numbered cell in that order,
 * keeping the blank only while `keeps` still holds of what is left. */
function removeNumbers(grid: Uint16Array, rs: RandomState, keeps: () => boolean): void {
  const spaces = Array.from(grid, (_, i) => i);
  shuffle(spaces, rs);
  for (const i of spaces) {
    const temp = grid[i];
    if (temp & F_BOUND) continue;
    grid[i] = F_EMPTY;
    if (!keeps()) grid[i] = temp;
  }
}

/**
 * A random wall with a number on every clear square, or `null` where too few
 * squares are shaded. Each brick the ladder does not shade from those numbers
 * is numbered too, which exposes an ambiguity the numbers leave: re-numbering
 * can leave the brick above resting on nothing, a board with no answer, which
 * the caller's test throws away.
 */
function drawBoard(p: BricksParams, rs: RandomState): Uint16Array | null {
  const { w, h } = gridSize(p);
  const grid = new Uint16Array(w * h);
  applyBounds(w, h, grid);
  fillGrid(grid, w, h, rs);
  buildNumbers(grid, w, h);
  const shaded = deducedBricks({ w, h, grid });
  for (let i = 0; i < grid.length; i++)
    if (grid[i] & COL_MASK) grid[i] = shaded[i] ? F_SHADE : F_EMPTY;
  const total = buildNumbers(grid, w, h);
  // Upstream's float comparison.
  return Math.fround(total / (p.w * p.h)) < MINIMUM_SHADED ? null : grid;
}

/** An Easy board, upstream's kind: a wall the ladder finishes from its
 * numbers, with every number gone that it can do without. */
function easyBoard(p: BricksParams, rs: RandomState): Uint16Array {
  const { w, h } = gridSize(p);
  const finishes = (grid: Uint16Array): boolean => deductionFinishes({ w, h, grid });
  const attempt = retryLimit("bricks: generation attempts");
  for (;;) {
    attempt();
    const grid = drawBoard(p, rs);
    if (grid === null || !finishes(grid)) continue;
    removeNumbers(grid, rs, () => finishes(grid));
    return grid;
  }
}

/** An Unreasonable board: a wall stripped by the search where an Easy one
 * is stripped by the ladder. */
function unreasonableBoard(p: BricksParams, rs: RandomState): Uint16Array {
  const { w, h } = gridSize(p);
  return dealUnreasonable<Uint16Array>({
    label: `bricks: Unreasonable generation (${p.w}x${p.h})`,
    draw: () => drawBoard(p, rs),
    strip: (grid, one) => removeNumbers(grid, rs, one),
    deduced: (grid) => deductionFinishes({ w, h, grid }),
    answer: (grid, budget) => searchAnswers({ w, h, grid }, budget),
  });
}

export function newBricksDesc(p: BricksParams, rs: RandomState): { desc: string } {
  // `paramsError` refuses this combination, so reaching it means a caller
  // bypassed it. Fail immediately rather than let the gate reject every
  // candidate until the retry bound: a synchronous generator that cannot
  // succeed owns its thread outright (see `engine/retry-limit.ts`).
  if (p.diff > MAX_GENERABLE_DIFF) {
    throw new Error(
      `bricks: no board requires difficulty ${p.diff}; the generable maximum is ${MAX_GENERABLE_DIFF}`,
    );
  }
  const grid = p.diff === DIFF_EASY ? easyBoard(p, rs) : unreasonableBoard(p, rs);
  const { w, h } = gridSize(p);
  return { desc: encodeDesc(grid, w, h) };
}
