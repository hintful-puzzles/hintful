/**
 * How many answers a Black Box board has, and how a board with one is dealt.
 * Its answers are the layouts that send every laser, fired or not, where its
 * real balls do. The game accepts any of them (`checkGuesses`), so a board with
 * more than one could not be checked against its balls, and is neither dealt nor
 * loaded.
 */

import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import type { Point } from "../../engine/types.ts";
import { layoutsUpTo2, OutOfReach } from "./hint.ts";
import {
  type BlackboxParams,
  type BlackboxState,
  cloneState,
  dealCount,
  encodeBalls,
  fireLaser,
  LASER_EMPTY,
  newState,
} from "./state.ts";

/** The steps the count may take before it settles nothing. Past it, a deal
 * builds again and a loaded board loads (design.md § "The ball limit"). */
const ANSWER_BUDGET = 20_000;

/** `state` with every laser fired at its real balls. */
function everyLaserFired(state: BlackboxState): BlackboxState {
  const all = cloneState(state);
  for (let i = 0; i < all.nlasers; i++)
    if (all.exits[i] === LASER_EMPTY) fireLaser(all, i);
  return all;
}

/** 1 when the board has one answer, 2 when it has several, `null` when the
 * count runs past its budget. */
export function answerCount(state: BlackboxState): 1 | 2 | null {
  try {
    return layoutsUpTo2(everyLaserFired(state), ANSWER_BUDGET) >= 2 ? 2 : 1;
  } catch (e) {
    if (e instanceof OutOfReach) return null;
    throw e;
  }
}

/**
 * Build a board with one answer a ball at a time: each ball goes on a random
 * free square where the board so far keeps one answer for its count, and the
 * last is judged against the params' whole range. `null` when no square of
 * `tries` keeps it.
 */
function buildDesc(p: BlackboxParams, rng: RandomState, tries = 30): string | null {
  const n = dealCount(p, rng);
  const taken = new Uint8Array(p.w * p.h);
  const balls: Point[] = [];
  while (balls.length < n) {
    let placed = false;
    for (let t = 0; t < tries && !placed; t++) {
      const free = p.w * p.h - balls.length;
      let pick = randomUpto(rng, free);
      let i = 0;
      while (taken[i] || pick-- > 0) i++;
      balls.push({ x: i % p.w, y: Math.floor(i / p.w) });
      const k = balls.length;
      const q = k === n ? p : { ...p, minballs: k, maxballs: k };
      if (answerCount(newState(q, encodeBalls(q, balls))) === 1) {
        taken[i] = 1;
        placed = true;
      } else balls.pop();
    }
    if (!placed) return null;
  }
  return encodeBalls(p, balls);
}

/** The most times one deal starts its board again. */
const MAX_BUILDS = 1_000;

/**
 * Deal a board with one answer, built a ball at a time ({@link buildDesc}).
 * Scattering the balls at once and keeping a board only when it came out with
 * one answer was measured against this: it skews a ranged preset toward its
 * fewest balls, since more balls hide more squares, and past about twelve
 * balls on 8×8 it found none (design.md § "Dealing a board with one answer").
 */
export function newDesc(p: BlackboxParams, rng: RandomState): { desc: string } {
  for (let tries = 0; tries < MAX_BUILDS; tries++) {
    const desc = buildDesc(p, rng);
    if (desc !== null) return { desc };
  }
  throw new Error(
    `blackbox: no board with one answer in ${MAX_BUILDS} builds at w${p.w}h${p.h}m${p.minballs}M${p.maxballs}`,
  );
}
