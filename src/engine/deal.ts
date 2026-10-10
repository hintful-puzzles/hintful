/**
 * Dealing a board, apart from playing one. The app deals in a second worker:
 * the next board ahead, so that a type whose boards take seconds to find is
 * waited for once, and the board a player is waiting for, so that the wait can
 * be stopped. The midend deals where it is handed no board. Both come through
 * {@link generate}.
 */

import type { Game } from "./game.ts";
import { paramsError } from "./params.ts";
import { type RandomState, randomNew } from "./random/index.ts";
import { RetryLimitExceeded, retryLimit, underDealDeadline } from "./retry-limit.ts";
import type { DealtBoard, EncodedParams } from "./types.ts";

/** A random 128-bit seed string for a fresh game (upstream seeds from system
 * entropy; `random.ts` makes the id reproducible from it). */
export function freshSeed(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

/**
 * The boards in a row that may come dealt already solved before the deal
 * gives up. Measured 2026-10-10 over 14,450 deals of every game's params
 * corpus: Rectangles on a base grid of 3x3 dealt one in twelve solved and
 * Netslide at 3x3 with one move one in 25, and no other game any.
 */
const MAX_DEALT_SOLVED = 20;

/**
 * How long a deal looks for a board before it answers that it found none, in
 * every game and at every size. `openspec/specs/engine-difficulty/spec.md`,
 * "A deal is bounded by one deadline, the same in every game", says what the
 * length is weighed against.
 */
const DEAL_DEADLINE_MS = 120_000;

/**
 * What `game.newDesc` deals at `params`, or `null` where it found no board
 * within `deadlineMs` or ran a count of its own out. That is an answer and not
 * a fault: the tier may be rare at this size, or absent where nobody has
 * counted. Any other error propagates.
 *
 * The deadline is armed here and nowhere else, so a generator called directly
 * is bounded by its counts alone (`retry-limit.ts`).
 *
 * A board that is solved as dealt is dealt again, from the same generator's
 * stream, so no game has to rule one out itself.
 */
export function generate<Params, State>(
  game: Pick<
    Game<Params, State, unknown, unknown, unknown>,
    "newDesc" | "newState" | "status"
  >,
  params: Params,
  rng: RandomState,
  deadlineMs: number = DEAL_DEADLINE_MS,
): { desc: string; aux?: string } | null {
  const attempt = retryLimit("deal: a board that is not solved", MAX_DEALT_SOLVED);
  try {
    return underDealDeadline(deadlineMs, () => {
      for (;;) {
        attempt();
        const dealt = game.newDesc(params, rng);
        if (game.status(game.newState(params, dealt.desc)) !== "solved") return dealt;
      }
    });
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
    | "decodeParams"
    | "paramConfig"
    | "validateParams"
    | "newDesc"
    | "newState"
    | "status"
  >,
  params: EncodedParams,
): DealtBoard | null {
  const decoded = game.decodeParams(params);
  if (paramsError(game, decoded, true) !== null) return null;
  const dealt = generate(game, decoded, randomNew(freshSeed()));
  return dealt && { params, desc: dealt.desc, aux: dealt.aux ?? null };
}
