/**
 * A board of given params, dealt once per worker and shared by every
 * cross-game sweep that asks for it.
 *
 * **Dealing is where a sweep's time goes, not checking.** Measured 2026-10-08
 * over the six games that cost most: following a hint plan to the end of a
 * board took under 0.1 s on every preset but three, while dealing one took up
 * to 19.5 s (Group's 8x8 at Hard, which the Custom dialog offers and no preset
 * holds). Each sweep seeded its own deal from its own name, so about a dozen
 * guards each dealt that board afresh, and Group was 16% of the suite's test
 * time. The suite runs with `isolate: false`, so a module-level cache is one
 * per worker and every file in it reads the same boards.
 *
 * **What this gives up is that each guard used to see a different board of
 * the same params.** Nothing relied on that: a guard that needs a property to
 * hold across boards takes several with `n`, and one that needs a particular
 * board pins its description (docs/games/testing.md § "Pinning a hint's
 * positions"). What it buys beside the time is that a failure in one guard
 * names a board every other guard also walked.
 *
 * A deal that throws is kept and thrown again, because an ungenerable board
 * can be the dearest of all: the generator runs out its whole retry bound.
 *
 * Reads only the game it is handed, never the registry.
 *
 * Dev/test-only; never imported by production code.
 */
import { type RandomState, randomNew } from "../random/index.ts";
import { RetryLimitExceeded } from "../retry-limit.ts";

interface Dealing<Params> {
  encodeParams(p: Params, full: boolean): string;
  newDesc(p: Params, rng: RandomState): { desc: string; aux?: string };
}

type Deal = { board: { desc: string; aux?: string } } | { thrown: unknown };

const deals = new WeakMap<object, Map<string, Deal>>();

/**
 * The `n`th board of `params`: the same one for every caller in this worker.
 * Take `n` above zero only where a second board of the same params is what the
 * property needs.
 */
export function dealt<Params>(
  game: Dealing<Params>,
  params: Params,
  n = 0,
): { desc: string; aux?: string } {
  let ofGame = deals.get(game);
  if (ofGame === undefined) {
    ofGame = new Map();
    deals.set(game, ofGame);
  }
  const key = `${game.encodeParams(params, true)}#${n}`;
  let deal = ofGame.get(key);
  if (deal === undefined) {
    try {
      deal = { board: game.newDesc(params, randomNew(`dealt-${key}`)) };
    } catch (thrown) {
      deal = { thrown };
    }
    ofGame.set(key, deal);
  }
  if ("thrown" in deal) throw deal.thrown;
  return deal.board;
}

/** The part of a midend {@link beginDealt} drives. */
interface Beginning {
  setParams(params: string): string | null;
  dealParams(): string;
  newGame(
    fitTo?: undefined,
    kept?: { params: string; desc: string; aux: string | null } | null,
  ): string | null;
}

/**
 * Begin `midend` on the `n`th shared board of `params`, by the route New game
 * takes with a board dealt ahead: the generator's `aux` arrives with it, as it
 * does for a board the player was dealt. The refusal as the midend words it,
 * or `null`.
 */
export function beginDealt<Params>(
  midend: Beginning,
  game: Dealing<Params>,
  params: Params,
  n = 0,
): string | null {
  const encoded = game.encodeParams(params, true);
  const refused = midend.setParams(encoded);
  if (refused !== null) return refused;
  // A kept board at other params is dealt over in silence, from a fresh seed.
  if (midend.dealParams() !== encoded)
    throw new Error(`the midend deals ${midend.dealParams()}, not ${encoded}`);
  let board: { desc: string; aux?: string };
  try {
    board = dealt(game, params, n);
  } catch (e) {
    // The generator found no board, which the midend reports and does not throw.
    if (e instanceof RetryLimitExceeded) return e.message;
    throw e;
  }
  return midend.newGame(undefined, {
    params: encoded,
    desc: board.desc,
    aux: board.aux ?? null,
  });
}
