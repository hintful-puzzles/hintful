import type { HintMarkLegend } from "../../engine/contract/game.ts";
import { type MarkKind, whole } from "../../engine/contract/hint-words.ts";

/** A peg, by its grid index. */
export const PEG: MarkKind<number> = { name: "peg", key: String };

/** An empty hole, by its grid index. */
export const HOLE: MarkKind<number> = { name: "hole", key: String };

/** A jump: the peg that jumps and the hole it lands in, by grid index. */
export interface Marked {
  readonly from: number;
  readonly to: number;
}

/** A whole jump other than the step's own, drawn across its three squares: a
 * rival, or one of the jumps that can still finish. Keyed by both ends,
 * because one peg can have a jump that finishes and another that loses. */
export const JUMP: MarkKind<Marked> = {
  name: "jump",
  key: (j) => `${j.from}>${j.to}`,
};

/** The pegs a package clears, named as one shape. */
export const SHAPE = whole(PEG);

/** What each mark means here, as the help's list of marks gives it. */
export const HINT_MARKS: HintMarkLegend = {
  roles: {
    ring: "the jump to make: the peg that jumps, and the hole it lands in.",
    outline:
      "a peg that is already cut off for good, when there is no hint to give; a peg that is stranded, with no peg beside it, or that another jump would strand or cut off for good (*the outlined peg*); or, as arrows, the jumps that can still finish with one peg, the ringed one among them (*the jumps with arrows*).",
    stripes:
      "another jump that would strand a peg or cut it off (*the striped jump*), or the pegs a short run of jumps clears while every other peg ends where it began (*the striped row*, *column* or *block*).",
  },
};
