/**
 * Dealing a board, apart from playing one. The midend deals the board a player
 * is waiting for, and the app deals the next one ahead in a second worker, so
 * that a type whose boards take seconds to find is waited for once. Both come
 * through {@link generate}.
 */

import type { Game } from "./game.ts";
import { paramsError } from "./params.ts";
import { type RandomState, randomNew } from "./random/index.ts";
import { RetryLimitExceeded } from "./retry-limit.ts";
import type { DealtBoard, EncodedParams } from "./types.ts";

/** A random 128-bit seed string for a fresh game (upstream seeds from system
 * entropy; `random.ts` makes the id reproducible from it). */
export function freshSeed(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

/**
 * What `game.newDesc` deals at `params`, or `null` where it ran its retry
 * budget out. A run-out is an answer and not a fault: the tier may be rare at
 * this size, or absent where nobody has counted. Any other error propagates.
 */
export function generate<Params>(
  game: { newDesc(p: Params, rng: RandomState): { desc: string; aux?: string } },
  params: Params,
  rng: RandomState,
): { desc: string; aux?: string } | null {
  try {
    return game.newDesc(params, rng);
  } catch (e) {
    if (e instanceof RetryLimitExceeded) return null;
    throw e;
  }
}

/**
 * A fresh board at `params`, which are in their full encoding, for the app to
 * keep until the next New game. `null` where the generator found none, and
 * where the game refuses to deal these params at all: a board that arrived by
 * its desc may leave the type on a size whose tier has no board, and nobody is
 * waiting here to be told so.
 */
export function dealBoard<Params>(
  game: Pick<
    Game<Params, unknown, unknown, unknown, unknown>,
    "decodeParams" | "paramConfig" | "validateParams" | "newDesc"
  >,
  params: EncodedParams,
): DealtBoard | null {
  const decoded = game.decodeParams(params);
  if (paramsError(game, decoded, true) !== null) return null;
  const dealt = generate(game, decoded, randomNew(freshSeed()));
  return dealt && { params, desc: dealt.desc, aux: dealt.aux ?? null };
}
