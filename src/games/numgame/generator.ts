/**
 * Numgame's generator: draw the numbers as Countdown deals its cards, and pick
 * a target from 100 to 999 whose fewest operations are exactly the tier's.
 */

import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { Reach } from "./solver.ts";
import {
  encodeDesc,
  LARGE,
  type NumgameParams,
  OPS_AT_EASIEST,
  PLACES,
  SMALL,
} from "./state.ts";

/** Countdown's targets: any three-digit number. */
const LOWEST_TARGET = 100;
const HIGHEST_TARGET = 999;

/** `count` cards from `deck`, without replacement. */
function draw(deck: readonly number[], count: number, rng: RandomState): number[] {
  const cards = deck.slice();
  shuffle(cards, rng);
  return cards.slice(0, count);
}

/** The large numbers first, as Countdown lays out its cards. */
function deal(p: NumgameParams, rng: RandomState): number[] {
  const small = draw([...SMALL, ...SMALL], PLACES - p.large, rng);
  return [...draw(LARGE, p.large, rng), ...small];
}

export function newNumgameDesc(p: NumgameParams, rng: RandomState): { desc: string } {
  const ops = p.diff + OPS_AT_EASIEST;
  const attempt = retryLimit("numgame: generation");
  for (;;) {
    attempt();
    const dealt = deal(p, rng);
    const reach = new Reach(
      dealt,
      dealt.map((_, i) => i),
    );
    const targets: number[] = [];
    for (const [value, fewest] of reach.allValues())
      if (fewest === ops && value >= LOWEST_TARGET && value <= HIGHEST_TARGET)
        targets.push(value);
    if (targets.length === 0) continue;
    // Sorted, so the pick depends on the random state and not on the order
    // the solver happened to find the values in.
    targets.sort((x, y) => x - y);
    return { desc: encodeDesc(dealt, targets[randomUpto(rng, targets.length)]) };
  }
}
