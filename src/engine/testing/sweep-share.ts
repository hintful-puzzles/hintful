/**
 * Which share of a spread sweep this run walks.
 *
 * vitest gives a test file to one worker and runs its tests in turn, so a
 * cross-game sweep in one file takes as long as all its games together, however
 * many workers sit idle beside it. `vitest.config.ts` runs each file it lists in
 * `SPREAD` once per share, as projects of their own, and provides each run the
 * share it is; the file walks only the cases this module assigns to that share.
 * Outside those projects (no `provide`), the run is the whole sweep, so nothing
 * that reads a share can lose a case by being run some other way.
 *
 * **A case is assigned by its place in a list derived from the games**, never
 * by a list of games: the k-th case goes to share k mod the share count. The
 * shares together are the whole list, and none holds a case twice.
 *
 * Dev/test-only; never imported by production code.
 */
import { inject } from "vitest";

declare module "vitest" {
  interface ProvidedContext {
    sweepShare: SweepShare;
  }
}

/** One share of a spread sweep: the `index`-th of `of`, from 0. */
interface SweepShare {
  readonly index: number;
  readonly of: number;
}

/** The share this run walks; the whole sweep when no project provided one. */
const SWEEP_SHARE: SweepShare = inject("sweepShare") ?? { index: 0, of: 1 };

/** Whether this run is the first share, or the whole sweep: where a check that
 * walks nothing runs, so it runs once. */
export const FIRST_SHARE = SWEEP_SHARE.index === 0;

/** The items of `items` this share walks. */
export function ofThisShare<T>(items: readonly T[]): T[] {
  return items.filter((_, i) => i % SWEEP_SHARE.of === SWEEP_SHARE.index);
}

/** A floor on a count a whole sweep reaches, restated for one share of it: the
 * whole floor's part, rounded up. A sweep's vacuity floor sits well under its
 * true count, so each share, holding about its part of the cases, meets it. */
export function shareFloor(whole: number): number {
  return Math.ceil(whole / SWEEP_SHARE.of);
}
