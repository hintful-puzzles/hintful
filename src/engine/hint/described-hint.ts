/**
 * What a described game's hint reads off its ladder's firings: what a firing
 * says, the technique it is of, the cells it fills and what its premise reads,
 * and the hooks a game writes for what its techniques declare `supplied`.
 * Nothing here is about a puzzle.
 */

import type { Said } from "../solve/ladder-runtime.ts";
import type { Taken } from "../solve/ladder-walk.ts";

/** A game's hooks for what its techniques declare `supplied`, one a technique
 * (`Supplied` is the compiled module's `SuppliedById`): each returns every
 * term and mark its technique declares, so one left out does not compile.
 * It is told the firing's stated terms (`Says`, the module's `SaysById`), for
 * what the game makes of a set the description states: the words Wordtrail's
 * trails spell. */
export type SuppliedHooks<Supplied, Marked, State, Says = unknown> = {
  readonly [K in keyof Supplied]: (
    marked: Marked,
    state: State,
    terms: K extends keyof Says
      ? Says[K] extends { terms: infer T }
        ? T
        : unknown
      : unknown,
  ) => Supplied[K];
};

/** What a hook returns, as the engine reads it whatever the technique. */
export interface SuppliedOf {
  terms?: object;
  marks?: { outline?: readonly number[]; stripes?: readonly number[] };
}

/**
 * The most steps a plan holds unless a game says otherwise: a UX bound, not a
 * correctness one. A player rarely follows more than a handful of steps before
 * going their own way, and the plan is recomputed then anyway; it also keeps a
 * hint cheap enough for the cross-game resume walk, which asks after every
 * move.
 */
export const DEFAULT_PLAN = 40;

/** What a firing says: recorded for each of its facts by a technique that
 * `says`; the first fact's is the firing's. */
export const spokenOf = <Y>(taken: Taken): Said<unknown, Y> =>
  taken.reasons[0] as Said<unknown, Y>;

/** The technique a firing is of: its entry's, unless the entry is a rung
 * that offers the firings of others ({@link keptRung}'s stamp). */
export const techniqueOf = (taken: Taken): string =>
  spokenOf<unknown>(taken).technique ?? taken.entry.id;

/** The cells of the facts a firing makes. */
export const filledBy = (taken: Taken): number[] => {
  const out: number[] = [];
  for (let i = 0; i < taken.facts.length; i += 3) out.push(taken.facts[i + 1]);
  return out;
};

/** What a firing's premise reads: the squares it outlines, those it draws
 * apart, those it decides, and what it says it reads beyond them. A line it
 * only hatches is not read. */
export const premiseOf = (taken: Taken): number[] => {
  type Marked = {
    outline?: readonly number[];
    strand?: readonly number[];
    reads?: readonly number[];
  };
  const { marks, facts } = spokenOf<{
    marks: Marked;
    facts?: readonly { marks: Marked }[];
  }>(taken).says;
  return [
    ...[marks, ...(facts ?? []).map((x) => x.marks)].flatMap((x) => [
      ...(x.reads ?? []),
      ...(x.outline ?? []),
      ...(x.strand ?? []),
    ]),
    ...filledBy(taken),
  ];
};
