/**
 * Every sentence Pegs' hint speaks.
 *
 * Which sentence a jump gets is `hint.ts`'s to decide, from what it has checked
 * about the jump; this file decides only how it reads.
 */

import type { HintMarkLegend } from "../../engine/game.ts";
import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
} from "../../engine/hint-words.ts";

/** A peg, by its grid index. */
export const PEG: MarkKind<number> = { name: "peg", key: String };

/** An empty hole, by its grid index. */
export const HOLE: MarkKind<number> = { name: "hole", key: String };

/** The jump a step makes: the peg that jumps and the hole it lands in. */
export interface Marked {
  readonly from: number;
  readonly to: number;
}

/** What each mark means here, as the help's list of marks gives it. */
export const HINT_MARKS: HintMarkLegend = {
  roles: {
    ring: "the jump to make: the peg that jumps, and the hole it lands in.",
    outline:
      "a peg that some other jump would cut off for good, so that no peg could ever reach it again: *the outlined peg*, in the hint's words.",
  },
};

/** "1 peg", "12 pegs": numerals throughout, as the refusal counts them. */
const pegsPhrase = (n: number): string => `${n} peg${n === 1 ? "" : "s"}`;

const thisPeg = (m: Marked): Narration => mark.this("ring", PEG, [m.from], "peg");
const theHole = (m: Marked): Narration => mark.the("ring", HOLE, [m.to], "hole");

export const say = {
  /** Every other jump was searched to the end and none can finish. */
  only: (m: Marked): Narration =>
    phrase`Jump ${thisPeg(m)} into ${theHole(m)}: it is the only jump from here that can still finish with one peg.`,

  /** Some other jump would leave `cut` frozen. */
  strands: (m: Marked, cut: number): Narration =>
    phrase`Jump ${thisPeg(m)} into ${theHole(m)}. Other jumps here would cut off ${mark.the("outline", PEG, [cut], "peg")}, where no peg could reach it.`,

  /** The same peg jumped in the step before. */
  again: (m: Marked): Narration =>
    phrase`Keep going with ${thisPeg(m)}: jump it on into ${theHole(m)}.`,

  /** Nothing to say but the jump and what it leaves. */
  plain: (m: Marked, left: number): Narration =>
    phrase`Jump ${thisPeg(m)} into ${theHole(m)}, taking the peg between: ${pegsPhrase(left)} left.`,
};
