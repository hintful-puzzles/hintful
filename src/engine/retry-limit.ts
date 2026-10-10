/**
 * Bounded "generate until it works" retries.
 *
 * WHY EVERY SUCH LOOP NEEDS A BOUND. Generators under `src/games/` are purely
 * synchronous, so a retry loop that never succeeds owns its thread outright:
 * `testTimeout` is a `setTimeout` on the blocked loop and cannot fire, and
 * vitest's pool shutdown is IPC-driven, so the worker never reads "exit"
 * either. Kill the parent and that worker reparents to init and spins a core
 * for ever (see `scripts/reap-orphaned-workers.sh`, which reaps the ones that
 * still escape). A bound turns "hangs the machine" into "throws" —
 * which is what the `testing` determinism requirement asks for: a finite
 * iteration cap rather than probabilistic termination inside a timeout.
 *
 * WHY THERE ARE TWO BOUNDS, AND WHICH ONE A LOOP IS UNDER. How long a player
 * waits to be told that a size has no board should not depend on the game or
 * the size, and a count of tries cannot say that: 10,000 tries are a twentieth
 * of a second on a sparse Bridges board and two minutes on a wide Map. So the
 * app's deal arms a deadline ({@link underDealDeadline}), and while one is
 * armed a guard given no count gives up when it passes and not before. A
 * generator called directly (a test, a census) arms nothing, and the same
 * guard counts {@link MAX_REGENERATE} tries: that is deterministic, where a
 * clock would fail a test for the load on the machine.
 *
 * So a generator states no budget for its deal. A count is passed only where
 * the number is part of the algorithm and not of anyone's patience: a stage
 * that hands over to the next when it is spent (Loopy's boards on one patch),
 * or a maximum the board itself sets (Boats' `w * h + 1` clues). Such a guard
 * counts whether or not a deadline is armed, and gives up at the deadline too.
 *
 * WHY NEITHER BOUND CAN MOVE A GENERATED BOARD. Exhaustion throws rather than
 * returning a fallback, so a bound can end a deal and can never choose its
 * board: a seed that deals a board under both bounds deals the same one.
 *
 * WHY A CAP IS NOT ALWAYS THE ANSWER. It converts a hang into a run-out, which
 * the engine answers with a sentence (`generate` in `deal.ts`): right where no
 * board is to be found, wrong for a rare-but-legal seed. Where the algorithm
 * already has a natural recovery path, prefer *recovering* into it and let an
 * outer `retryLimit` bound the recovery; `games/net`'s `shuffle` reshuffles on
 * a stalled tie rather than throwing, for exactly this reason.
 *
 * WHY A GUARD RATHER THAN A `for…of` ITERATOR. An iterator would put the bound
 * in the loop header, but `for…of` is a loop TypeScript believes can *complete*,
 * so every generator that returns from inside its retry loop would need a
 * trailing unreachable `throw` to satisfy control-flow analysis. `for (;;)` and
 * `while (true)` are understood to never complete, and a guard also drops
 * straight into `do…while` and rejection-sampling loops without reshaping them.
 */

/** The tries a guard given no count allows where no deadline is armed. A
 * board rarer than this is one the app deals and a direct call does not
 * ({@link underDealTries}). */
export const MAX_REGENERATE = 10_000;

/** Thrown when a retry loop exhausts its bound, so callers and tests can tell
 * "the generator gave up" from an ordinary bug. `max` is the tries it made. */
export class RetryLimitExceeded extends Error {
  constructor(
    readonly label: string,
    readonly max: number,
    at = "",
  ) {
    super(`${label}: gave up after ${max} attempts${at}`);
    this.name = "RetryLimitExceeded";
  }
}

/** When the deal under way gives up, on `performance.now()`'s clock, or
 * `null` where no deal armed one. One a thread, as a generator owns its
 * thread until it returns. */
let deadline: number | null = null;

/**
 * Run `deal` with every retry guard under it giving up `ms` from now. For the
 * app's own deal (`generate` in `deal.ts`) and nothing else: a caller that
 * must get the same answer on a loaded machine arms no deadline.
 */
export function underDealDeadline<T>(ms: number, deal: () => T): T {
  const outer = deadline;
  deadline = performance.now() + ms;
  try {
    return deal();
  } finally {
    deadline = outer;
  }
}

/** The tries a guard given no count allows where no deadline is armed. */
let unarmedTries = MAX_REGENERATE;

/**
 * Run `deal` with a guard given no count allowing `tries`, in place of
 * {@link MAX_REGENERATE}. For a test that deals a board it knows to be rare:
 * the app's deal finds such a board because its deadline counts no tries, and
 * a test that armed a deadline to find it would fail on a loaded machine.
 */
export function underDealTries<T>(tries: number, deal: () => T): T {
  const outer = unarmedTries;
  unarmedTries = tries;
  try {
    return deal();
  } finally {
    unarmedTries = outer;
  }
}

/**
 * Returns a guard to call once per attempt, at the top of a retry loop. It
 * throws {@link RetryLimitExceeded} when the bound is spent:
 *
 * ```ts
 * const attempt = retryLimit("tents: generation");
 * while (true) {
 *   attempt();
 *   …
 *   if (good) break;
 * }
 * ```
 *
 * One guard per loop; nested or sibling loops each take their own, so a label
 * names exactly one thing when it fires.
 *
 * @param label identifies the loop in the message (e.g. `"net: shuffle"`)
 * @param max   the tries the algorithm allows, where it has such a number of
 *              its own (the module header says which loops do). Left out, the
 *              bound is the engine's.
 */
export function retryLimit(label: string, max?: number): () => void {
  let attempts = 0;
  return () => {
    attempts++;
    if (deadline !== null) {
      if (performance.now() > deadline)
        throw new RetryLimitExceeded(label, attempts - 1, ", at the deal's deadline");
      if (max === undefined) return;
    }
    const allowed = max ?? unarmedTries;
    if (attempts > allowed) throw new RetryLimitExceeded(label, allowed);
  };
}
