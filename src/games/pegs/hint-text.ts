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
      "a peg another jump would cut off for good, where no peg could ever reach it again (*the outlined peg*); or, as arrows, the other jumps that can still finish with one peg (*the jumps with arrows*).",
    stripes:
      "a jump that would cut a peg off (*the striped jump*), or the pegs a short run of jumps clears while every other peg ends where it began (*the striped row*, *column* or *block*).",
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
const theShape = (p: Package): Narration => mark.the("stripes", SHAPE, p.pegs, p.shape);
const arrows = (goods: readonly Marked[]): Narration =>
  mark.as("outline", JUMP, goods, (els) =>
    els.length > 1 ? "the jumps with arrows" : "the jump with an arrow",
  );
const count = (n: number): string => (n === 3 ? "Three" : "Six");

export const say = {
  /** A rival jump leaves `victim` frozen at once. */
  trap: (m: Marked, rival: Marked, victim: number): Narration =>
    phrase`${go(m)}. ${mark.the("stripes", JUMP, [rival], "jump").capitalized()} would cut off ${mark.the("outline", PEG, [victim], "peg")}, where no peg could reach it.`,

  /** After a rival jump, every next jump leaves `victim` frozen. */
  trapSoon: (m: Marked, rival: Marked, victim: number): Narration =>
    phrase`${go(m)}. After ${mark.the("stripes", JUMP, [rival], "jump")}, any jump you make next cuts off ${mark.the("outline", PEG, [victim], "peg")}.`,

  /** Every rival was searched to the end and none can finish. */
  only: (m: Marked): Narration =>
    phrase`${go(m)}: it is the only jump here that can still finish with one peg.`,

  /** Every rival was settled: `goods` can finish, the rest cannot. */
  onlyThese: (m: Marked, goods: readonly Marked[]): Narration =>
    phrase`${go(m)}. Only it and ${arrows(goods)} can still finish with one peg.`,

  /** `goods` can finish, at least one rival cannot, and some were not settled. */
  alsoThese: (m: Marked, goods: readonly Marked[]): Narration =>
    phrase`${go(m)}. ${arrows(goods).capitalized()} can also finish with one peg; some others cannot.`,

  /** Every jump from here can still finish. */
  anyJump: (m: Marked): Narration =>
    phrase`Every jump here can still finish with one peg, so jump ${thisPeg(m)} into ${theHole(m)}.`,

  /** The jump that leaves one peg. */
  last: (m: Marked): Narration => phrase`${go(m)} to finish with one peg.`,

  /** Nothing settled about the rivals: only that this jump can finish. */
  plain: (m: Marked): Narration =>
    phrase`${go(m)}: from there the board can still finish with one peg.`,

  /** The first jump of a package. */
  packageStart: (m: Marked, p: Package): Narration =>
    phrase`${count(p.jumps)} jumps clear ${theShape(p)} and leave every other peg where it was. ${go(m)}.`,

  /** A jump inside a package. */
  packageNext: (m: Marked, p: Package): Narration =>
    phrase`Then jump ${thisPeg(m)} into ${theHole(m)}, still clearing ${theShape(p)}.`,

  /** The jump that finishes a package. */
  packageEnd: (m: Marked, p: Package): Narration =>
    phrase`${go(m)} to finish clearing ${theShape(p)}.`,
};
