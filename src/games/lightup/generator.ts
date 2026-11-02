/**
 * Light Up board generation — port of the generator half of `lightup.c`
 * (`set_blacks` / `place_lights` / `place_numbers` / `puzzle_is_good` /
 * `strip_unused_nums` / `new_game_desc`).
 *
 * The RNG draws are upstream's, in its order. The solver draws none, but every
 * removal is gated on the ladder or the search, so a change to their power
 * changes which boards exist.
 */

import { dealUnreasonable } from "../../engine/answer-search.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { placeSymmetricBlacks } from "../../engine/symmetric-blacks.ts";
import type { Point } from "../../engine/types.ts";
import { deductionFinishes, searchAnswers } from "./solver.ts";
import {
  cloneState,
  emptyState,
  encodeDesc,
  F_BLACK,
  F_LIGHT,
  F_MARK,
  F_NUMBERED,
  getSurrounds,
  gridOverlap,
  idx,
  type LightupParams,
  type LightupState,
  litCells,
  setLight,
  TIERS,
} from "./state.ts";

/** Clear the board, then randomize the black squares over the
 * symmetry-reduced region and mirror/rotate it over the whole board
 * (upstream `clean_board` + `set_blacks`, via the shared engine helper). */
function setBlacks(state: LightupState, params: LightupParams, rs: RandomState): void {
  const { w } = state;
  state.flags.fill(0);
  state.lights.fill(0);
  state.nlights = 0;
  placeSymmetricBlacks({
    w,
    h: state.h,
    blackpc: params.blackpc,
    symm: params.symm,
    rs,
    isBlack: (x, y) => (state.flags[idx(x, y, w)] & F_BLACK) !== 0,
    setBlack: (x, y, black) => {
      if (black) state.flags[idx(x, y, w)] |= F_BLACK;
      else state.flags[idx(x, y, w)] &= ~F_BLACK;
    },
  });
}

/** Would removing the bulb at (x, y) leave some square it lights dark? */
function leavesDark(state: LightupState, x: number, y: number): boolean {
  for (const pt of litCells(state, x, y, true)) {
    if (state.lights[idx(pt.x, pt.y, state.w)] === 1) return true;
  }
  return false;
}

/**
 * Set up a random correct position (every open square lit, no bulb lit
 * by another) by filling the whole grid with bulbs and then removing
 * shadowed clusters in a random order (upstream `place_lights`).
 */
function placeLights(state: LightupState, rs: RandomState): void {
  const { w, h } = state;
  const numindices = Array.from({ length: w * h }, (_, i) => i);
  shuffle(numindices, rs);

  // Bulb on every open square (`setBlacks` has just cleared F_MARK).
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      if (!(state.flags[idx(x, y, w)] & F_BLACK)) setLight(state, x, y, true);
    }
  }

  const isBulb = (pt: Point): boolean =>
    (state.flags[idx(pt.x, pt.y, w)] & F_LIGHT) !== 0;
  for (const i of numindices) {
    if (!(state.flags[i] & F_LIGHT) || state.flags[i] & F_MARK) continue;
    const cells = [...litCells(state, i % w, Math.floor(i / w), false)];

    // If we're not lighting any bulbs ourself, don't remove anything.
    if (!cells.some(isBulb)) continue;

    // If removing the bulbs we light leaves nothing dark, remove them all.
    if (!cells.some((pt) => isBulb(pt) && leavesDark(state, pt.x, pt.y))) {
      for (const pt of cells) setLight(state, pt.x, pt.y, false);
      state.flags[i] |= F_MARK;
    }

    if (!gridOverlap(state)) return; // done
  }
  if (gridOverlap(state)) {
    throw new Error("place_lights failed to resolve overlapping lights!");
  }
}

/** Fill every black square with the count of adjacent bulbs. */
function placeNumbers(state: LightupState): void {
  const { w, h } = state;
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const i = idx(x, y, w);
      if (!(state.flags[i] & F_BLACK)) continue;
      let n = 0;
      for (const pt of getSurrounds(w, h, x, y)) {
        if (state.flags[idx(pt.x, pt.y, w)] & F_LIGHT) n++;
      }
      state.flags[i] |= F_NUMBERED;
      state.lights[i] = n;
    }
  }
}

/** Remove the clue numbers no reading of a count acted on. */
function stripUnusedNums(state: LightupState, used: ReadonlySet<number>): void {
  for (let i = 0; i < state.flags.length; i++) {
    if (state.flags[i] & F_NUMBERED && !used.has(i)) {
      state.flags[i] &= ~F_NUMBERED;
      state.lights[i] = 0;
    }
  }
}

/** Remove numbers one by one in the shuffled order, putting back each one
 * whose removal `keeps` refuses. */
function removeNumbers(
  state: LightupState,
  numindices: readonly number[],
  keeps: () => boolean,
): void {
  for (const i of numindices) {
    if (!(state.flags[i] & F_NUMBERED)) continue;
    const num = state.lights[i];
    state.lights[i] = 0;
    state.flags[i] &= ~F_NUMBERED;
    if (!keeps()) {
      state.lights[i] = num;
      state.flags[i] |= F_NUMBERED;
    }
  }
}

const MAX_GRIDGEN_TRIES = 20;

/**
 * Walls, bulbs and every number, drawn again and again: after each
 * `MAX_GRIDGEN_TRIES` layouts the share of walls goes up 5%, and at the top
 * starts over from what was asked, since a small board nine-tenths walls has
 * too few squares to need a tier above Easy (upstream `new_game_desc`'s ramp).
 */
function layouts(paramsIn: LightupParams, rs: RandomState): () => LightupState {
  const params = { ...paramsIn };
  let tries = 0;
  return () => {
    if (tries++ === MAX_GRIDGEN_TRIES) {
      tries = 1;
      params.blackpc = params.blackpc < 90 ? params.blackpc + 5 : paramsIn.blackpc;
    }
    const news = emptyState(params);
    setBlacks(news, params, rs);
    placeLights(news, rs);
    placeNumbers(news);
    return news;
  };
}

/**
 * A board the ladder finishes at `difficulty` and not below: the layout's
 * numbers, less those no count acted on, then less each the ladder can do
 * without. The rarest board measured, a 3x3 turned half round at Normal, is
 * found once in 600 rounds of the ramp or so.
 */
function deducedBoard(
  difficulty: number,
  draw: () => LightupState,
  numindices: readonly number[],
): LightupState {
  const attempt = retryLimit("lightup: generation");
  for (;;) {
    attempt();
    let news = draw();
    const used = new Set<number>();
    if (!deductionFinishes(news, difficulty, (c) => used.add(c))) continue;
    const copys = cloneState(news);
    stripUnusedNums(copys, used);
    if (deductionFinishes(copys, difficulty)) news = copys;
    removeNumbers(news, numindices, () => deductionFinishes(news, difficulty));
    // The stripped board must not fall to the tier below.
    if (difficulty > 0 && deductionFinishes(news, difficulty - 1)) continue;
    return news;
  }
}

/** Generate a puzzle at the params' tier (upstream `new_game_desc`, its
 * Unreasonable the engine's search). */
export function newLightupDesc(
  params: LightupParams,
  rs: RandomState,
): { desc: string } {
  // The number-removal order is shuffled once, as upstream.
  const numindices = Array.from({ length: params.w * params.h }, (_, i) => i);
  shuffle(numindices, rs);
  const draw = layouts(params, rs);
  const board =
    params.difficulty < TIERS.unreasonable
      ? deducedBoard(params.difficulty, draw, numindices)
      : dealUnreasonable<LightupState>({
          label: `lightup: Unreasonable generation (${params.w}x${params.h})`,
          draw,
          strip: (s, one) => removeNumbers(s, numindices, one),
          deduced: (s) => deductionFinishes(s, TIERS.unreasonable - 1),
          answer: (s, budget) => searchAnswers(s, budget),
        });
  return { desc: encodeDesc(board) };
}
