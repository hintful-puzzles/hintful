/**
 * How often a deduction ladder's hint plan leaves the work its latest step did
 * while a firing that continued it was available — the guard for
 * `singleFirings`' `continuing`, beside `plan-continuity.ts`, which reads a
 * candidate plan.
 *
 * A ladder's elements are the game's own (a cell, a clue, a line's number), so
 * no reading from outside the game can say what continues; this reads each
 * plan through the technique's own `available()` lists, and judges continuity
 * by its own rule rather than the frontier's:
 *
 * - **a position** is a firing after the first that wrote anything keyed;
 * - **a continuable position** is one where, before it was taken, some
 *   technique the driver would ask offered a firing reading what the latest
 *   keyed firing wrote;
 * - **an avoidable jump** is a firing at a continuable position that reads
 *   none of it.
 *
 * The share is of continuable positions, not of jumps: a ladder whose
 * bookkeeping must run dry first (Tracks) jumps where nothing could continue
 * far more often than anywhere else, and a share of jumps would drown a
 * frontier planted off.
 *
 * So it shares the game's keys and nothing else: a frontier that stops
 * preferring continuity, a depth or tiebreak that drifts, or a game that sets
 * `continuing` but offers one firing a rung fails it; a key that names the
 * wrong thing does not, and is for the game's own plan tests.
 *
 * It reaches the ladder by spying on `singleFirings`, so it sees every driver a
 * hint builds, and calls each `available()` once more per step; the spy is the
 * caller's to restore.
 *
 * Dev/test-only.
 */
import { vi } from "vitest";
import type {
  DeductionTechnique,
  LadderCandidate,
  SingleFiringOptions,
} from "../deduction-fixpoint.ts";
import * as fixpoint from "../deduction-fixpoint.ts";
import type { AnyGame } from "./enrollment.ts";

export interface LadderContinuity {
  /** Drivers built with `continuing` while the plan was made. */
  continuing: number;
  /** Positions measured: keyed firings after a plan's first. */
  positions: number;
  /** Positions where an available firing read what the latest keyed firing
   * wrote: where the plan could continue. */
  continuable: number;
  /** Positions whose firing reads nothing the latest keyed firing wrote. */
  jumps: number;
  /** Of those, the ones where an available firing did read it: of the
   * continuable positions, the ones the plan left. */
  avoidable: number;
}

const meets = (reads: readonly number[], wrote: ReadonlySet<number>): boolean =>
  reads.some((i) => wrote.has(i));

/**
 * Spy on `singleFirings` so that every continuing driver built until the
 * returned `restore` is called adds what it measures to the returned tally.
 */
function measureLadderContinuity(): {
  tally: LadderContinuity;
  restore(): void;
} {
  const real = fixpoint.singleFirings;
  const tally: LadderContinuity = {
    continuing: 0,
    positions: 0,
    continuable: 0,
    jumps: 0,
    avoidable: 0,
  };
  const spy = vi.spyOn(fixpoint, "singleFirings").mockImplementation((opts) => {
    if (!opts.continuing) return real(opts);
    tally.continuing++;
    return measured(real, opts, tally);
  });
  return { tally, restore: () => spy.mockRestore() };
}

function measured(
  real: typeof fixpoint.singleFirings,
  opts: SingleFiringOptions,
  tally: LadderContinuity,
): fixpoint.SingleFirings {
  const admitted = opts.techniques.filter(
    (t) => opts.maxTier === undefined || t.tier <= opts.maxTier,
  );
  let wrote: Set<number> | null = null;
  let taken: { reads: readonly number[]; writes: readonly number[] } | null = null;
  const wrap = (t: DeductionTechnique): DeductionTechnique => {
    const { available } = t;
    if (!available) return t;
    return {
      ...t,
      available: () => {
        const offered = available();
        if (offered === "contradiction") return offered;
        return offered.map(
          (c): LadderCandidate => ({
            reads: () => c.reads(),
            writes: () => c.writes(),
            take: () => {
              const reads = c.reads();
              c.take();
              taken = { reads, writes: c.writes() };
            },
          }),
        );
      },
    };
  };
  // Whether any admitted technique offers a firing reading `from`, asked rung
  // by rung so a dear rung is reached only when the cheaper ones offer none.
  const continuable = (from: ReadonlySet<number>): boolean => {
    let offeredBefore = false;
    let prerequisiteBefore = false;
    // The tier of the first rung with a firing: nothing harder is taken for
    // continuing.
    let ceiling = Number.POSITIVE_INFINITY;
    for (const t of admitted) {
      // A fallback offers nothing while a rung before it has something, nor
      // any rung while a prerequisite before it does.
      if ((t.fallback && offeredBefore) || prerequisiteBefore || t.tier > ceiling)
        continue;
      // As the driver asks: a game clears its recorder here, and a firing
      // that records nothing would otherwise read as the last one's.
      opts.beforeTechnique?.(t);
      const offered = t.available?.();
      if (offered === undefined || offered === "contradiction") continue;
      if (offered.some((c) => meets(c.reads(), from))) return true;
      if (offered.length > 0) {
        if (!offeredBefore) ceiling = t.tier;
        offeredBefore = true;
        if (t.prerequisite) prerequisiteBefore = true;
      }
    }
    return false;
  };
  const driver = real({ ...opts, techniques: opts.techniques.map(wrap) });
  return {
    next() {
      // Asked before the driver runs, of the board the choice is made on; a
      // settled board offers nothing, and the driver will say so.
      const could = wrote !== null && !opts.settled?.() && continuable(wrote);
      taken = null;
      const fired = driver.next();
      // A firing whose take this wrapper did not see (none offered, or the
      // driver stopped) is no position.
      const t = taken as { reads: readonly number[]; writes: readonly number[] } | null;
      if (fired === null || t === null || t.writes.length === 0) return fired;
      if (wrote !== null) {
        tally.positions++;
        if (could) tally.continuable++;
        if (!meets(t.reads, wrote)) {
          tally.jumps++;
          if (could) tally.avoidable++;
        }
      }
      wrote = new Set(t.writes);
      return fired;
    },
    impossible: () => driver.impossible(),
  };
}

/** The plan `game.hint` gives for `state`, measured. */
export function ladderContinuity(
  game: AnyGame,
  state: unknown,
  ui?: object,
): LadderContinuity {
  const { tally, restore } = measureLadderContinuity();
  try {
    game.hint?.(state, undefined, ui);
  } finally {
    restore();
  }
  return tally;
}
