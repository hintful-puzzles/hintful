/**
 * Every sentence Pegs' hint speaks.
 *
 * Which sentence a jump gets is `hint.ts`'s to decide, from what it has checked
 * about the jump and its rivals; this file decides only how it reads.
 */

import type { HintMarkLegend } from "../../engine/game.ts";
import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
  whole,
} from "../../engine/hint-words.ts";

/** A peg, by its grid index. */
export const PEG: MarkKind<number> = { name: "peg", key: String };

/** An empty hole, by its grid index. */
export const HOLE: MarkKind<number> = { name: "hole", key: String };

/** A jump: the peg that jumps and the hole it lands in, by grid index. */
export interface Marked {
  readonly from: number;
  readonly to: number;
}

/** A whole jump, drawn across its three squares. Keyed by both ends, because
 * one peg can have a jump that finishes and another that loses. */
export const JUMP: MarkKind<Marked> = {
  name: "jump",
  key: (j) => `${j.from}>${j.to}`,
};

/** The pegs a package clears, named as one shape. */
const SHAPE = whole(PEG);

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

/** A shape a run of jumps clears, leaving every other peg where it began:
 * three in a line, by a peg that jumps in beside them and back out, or a block
 * of two by three. */
export interface Package {
  readonly pegs: readonly number[];
  readonly shape: "row" | "column" | "block";
  readonly jumps: number;
}

const thisPeg = (m: Marked): Narration => mark.this("ring", PEG, [m.from], "peg");
const theHole = (m: Marked): Narration => mark.the("ring", HOLE, [m.to], "hole");
const go = (m: Marked): Narration => phrase`Jump ${thisPeg(m)} into ${theHole(m)}`;
/** Words that ask for the move without spelling it out, where the board makes
 * it obvious: they name the rings on the whole jump. */
const theMove = (m: Marked, words: string): Narration =>
  mark.as("ring", JUMP, [m], words);
/** The move, mid-sentence. */
const lower = (m: Marked): Narration => phrase`jump ${thisPeg(m)} into ${theHole(m)}`;
const theRival = (r: Marked): Narration =>
  mark.the("stripes", JUMP, [r], "jump").capitalized();
const theVictim = (p: number): Narration => mark.the("outline", PEG, [p], "peg");
/** The rival is the same peg jumping another way, so the move is that peg's
 * other choice rather than a different peg's. */
const sameRival = (m: Marked, r: Marked): boolean => m.from === r.from;
/** "This peg's striped jump", opening a sentence or not. */
const ownRival = (m: Marked, r: Marked, opens = true): Narration => {
  const peg = opens ? thisPeg(m).capitalized() : thisPeg(m);
  return phrase`${peg}'s ${mark.as("stripes", JUMP, [r], "striped jump")}`;
};
const theShape = (p: Package): Narration => mark.the("stripes", SHAPE, p.pegs, p.shape);
const arrows = (goods: readonly Marked[]): Narration =>
  mark.as("outline", JUMP, goods, (els) =>
    els.length > 1 ? "the jumps with arrows" : "the jump with an arrow",
  );
const count = (n: number): string => (n === 3 ? "Three" : "Six");

/**
 * Every sentence runs from what to look at, through what follows from it, to
 * the move (docs/games/hints.md § "Lead with the indication"), and each part
 * says how it follows from the last: a danger is answered by a move that
 * answers it, never by a bare "instead". Where other jumps would do as well,
 * the move is offered as one of them; "so" concludes only a choice the
 * sentence has narrowed to one, such as a peg's other way to jump.
 */
export const say = {
  /** A rival jump leaves `victim` frozen at once; after this jump it is not,
   * since a line that finishes starts with it. */
  trap: (m: Marked, rival: Marked, victim: number): Narration =>
    sameRival(m, rival)
      ? phrase`${ownRival(m, rival)} would cut off ${theVictim(victim)}, so ${lower(m)} instead.`
      : phrase`${theRival(rival)} would cut off ${theVictim(victim)}. One way to save it: ${lower(m)}.`,

  /** After a rival jump, every next jump leaves `victim` frozen. */
  trapSoon: (m: Marked, rival: Marked, victim: number): Narration =>
    sameRival(m, rival)
      ? phrase`After ${ownRival(m, rival, false)}, any next jump cuts off ${theVictim(victim)}, so ${lower(m)} instead.`
      : phrase`After ${mark.the("stripes", JUMP, [rival], "jump")}, any next jump cuts off ${theVictim(victim)}. One way to save it: ${lower(m)}.`,

  /** Every rival was searched to the end and none can finish. */
  only: (m: Marked): Narration =>
    phrase`No other jump can still finish, so ${lower(m)}.`,

  /** Every rival was settled: `goods` can finish, the rest cannot. The
   * offered jump carries an arrow too, being one of them. */
  onlyThese: (m: Marked, goods: readonly Marked[]): Narration =>
    phrase`Only ${arrows([m, ...goods])} can still finish. One of them: ${lower(m)}.`,

  /** `goods` can finish, at least one rival cannot, and some were not settled. */
  alsoThese: (m: Marked, goods: readonly Marked[]): Narration =>
    phrase`${arrows([m, ...goods]).capitalized()} can still finish; some others cannot. One of them: ${lower(m)}.`,

  /** Every jump from here can still finish. */
  anyJump: (m: Marked): Narration =>
    phrase`Every jump can still finish with one peg. One of them: ${lower(m)}.`,

  /** The jump that leaves one peg. */
  last: (m: Marked): Narration => phrase`${go(m)} to finish with one peg.`,

  /** Nothing settled about the rivals worth saying. That this jump can still
   * finish goes without saying: the hint offers no other kind. */
  plain: (m: Marked): Narration => phrase`${go(m)}.`,

  /** `lone` has no peg beside it now, and this jump lands beside it. */
  joins: (m: Marked, lone: number): Narration =>
    phrase`${theVictim(lone).capitalized()} is stranded, with no peg beside it; ${theMove(m, "go back for it")}.`,

  /** A rival would strand `lone`, where this jump keeps a peg beside it. */
  leavesAlone: (m: Marked, rival: Marked, lone: number): Narration =>
    sameRival(m, rival)
      ? phrase`${ownRival(m, rival)} would strand ${theVictim(lone)}, so ${lower(m)} instead.`
      : phrase`${theRival(rival)} would strand ${theVictim(lone)}. One way to keep a peg beside it: ${lower(m)}.`,

  /** The first jump of a package. */
  packageStart: (m: Marked, p: Package): Narration =>
    phrase`${count(p.jumps)} jumps clear ${theShape(p)} and change nothing else. First, ${lower(m)}.`,

  /** A jump inside a package. */
  packageNext: (m: Marked, p: Package): Narration =>
    phrase`Next, to clear ${theShape(p)}, ${lower(m)}.`,

  /** The jump that finishes a package. */
  packageEnd: (m: Marked, p: Package): Narration =>
    phrase`Last, to clear ${theShape(p)}, ${lower(m)}.`,
};
