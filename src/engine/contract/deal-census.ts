/**
 * What a deal's draws came to: each retry guard's tries, each draw thrown
 * away by the stage that threw it away, and how each mend of a division
 * ended. For the census of a generator being written (`npm run deal-walk`
 * with its cells named) and for the tests' count of what a file deals while
 * it loads (`testing/dealt.ts`).
 *
 * Counted only under {@link takingCensus} or {@link takeCensusInto}. Where
 * none is taken, as in every deal the app makes, each count is one test of a
 * `null`.
 */

/** How a mend that came right ends. */
export const MENDED = "mended";

/** How one mend of a division ended (`mend-division.ts`). */
export interface MendEnd {
  /** {@link MENDED}, or why it gave up. */
  readonly why: string;
  /** The fewest squares the judge's deductions left open on the way. */
  readonly open: number;
  /** The squares of the board. */
  readonly cells: number;
}

export interface DealCensus {
  /** The tries of each retry guard, by its label, in the order the guards
   * first tried: so the first is the deal's outermost loop. */
  readonly tries: Map<string, number>;
  /** The draws thrown away, by the stage that threw each away, in the order
   * the stages first did. */
  readonly rejected: Map<string, number>;
  /** Each mend, in the order made. */
  readonly mends: MendEnd[];
}

export function newDealCensus(): DealCensus {
  return { tries: new Map(), rejected: new Map(), mends: [] };
}

/** Where the deal under way is counted, or `null` where nothing counts. One a
 * thread, as a generator owns its thread until it returns. */
let census: DealCensus | null = null;

/**
 * Counts into `into` from now on, or stops counting; returns where the
 * counting went before. For a span no callback encloses: the test setup
 * counts what a test file deals while it loads.
 */
export function takeCensusInto(into: DealCensus | null): DealCensus | null {
  const before = census;
  census = into;
  return before;
}

/** Run `deal`, counting into `into` what it drew. */
export function takingCensus<T>(into: DealCensus, deal: () => T): T {
  const outer = census;
  census = into;
  try {
    return deal();
  } finally {
    census = outer;
  }
}

/** A retry guard tried once (`retry-limit.ts`). */
export function countTry(label: string): void {
  census?.tries.set(label, (census.tries.get(label) ?? 0) + 1);
}

/**
 * A draw was thrown away at `stage`, which names it for a person reading the
 * census: `"fill: a part under 3 cells"`. Returns `null`, so a draw that
 * comes to nothing says why in its return:
 *
 * ```ts
 * if (tooSmall) return drawRejected("fill: a part under 3 cells");
 * ```
 */
export function drawRejected(stage: string): null {
  census?.rejected.set(stage, (census.rejected.get(stage) ?? 0) + 1);
  return null;
}

/** A mend ended (`mend-division.ts`). */
export function countMend(end: MendEnd): void {
  census?.mends.push(end);
}
