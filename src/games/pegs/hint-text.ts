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
  type Sentence,
  sentence,
  unshaped,
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

/** A whole jump other than the step's own, drawn across its three squares: a
 * rival, or one of the jumps that can still finish. Keyed by both ends,
 * because one peg can have a jump that finishes and another that loses. */
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
/** The move, mid-sentence. */
const lower = (m: Marked): Narration => phrase`jump ${thisPeg(m)} into ${theHole(m)}`;
const theVictim = (p: number): Narration => mark.the("outline", PEG, [p], "peg");
/** The rival jump, named as this peg's own when it is the same peg jumping
 * another way. The move answering it is one choice among the peg's other
 * jumps and every other peg's, none of which the hint has judged. */
const theRival = (m: Marked, r: Marked): Narration =>
  m.from === r.from
    ? phrase`${thisPeg(m)}'s ${mark.as("stripes", JUMP, [r], "striped jump")}`
    : mark.the("stripes", JUMP, [r], "jump");
/** A danger the rival `r` brings, and the move as one way to answer it. When
 * the rival is this peg's own, the look has already named the peg, so the move
 * names only its hole. */
const answer = (look: Narration, how: string, m: Marked, r: Marked): Sentence =>
  sentence({
    look,
    move: m.from === r.from ? phrase`jump into ${theHole(m)}` : lower(m),
    relation: { kind: "answers", how },
  });
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
 * the move is offered as one of them, even when the danger is this peg's own
 * other jump, since the peg's further jumps and every other peg's were never
 * judged. Only `only`, where every rival was proved lost, says the move is
 * forced.
 */
export const say = {
  /** A rival jump leaves `victim` frozen at once; after this jump it is not,
   * since a line that finishes starts with it. */
  trap: (m: Marked, rival: Marked, victim: number): Sentence =>
    answer(
      phrase`${theRival(m, rival)} would cut off ${theVictim(victim)}`,
      "One way to save it",
      m,
      rival,
    ),

  /** After a rival jump, every next jump leaves `victim` frozen. */
  trapSoon: (m: Marked, rival: Marked, victim: number): Sentence =>
    answer(
      phrase`After ${theRival(m, rival)}, any next jump cuts off ${theVictim(victim)}`,
      "One way to save it",
      m,
      rival,
    ),

  /** Every rival was searched to the end and none can finish. */
  only: (m: Marked): Sentence =>
    sentence({
      look: phrase`No other jump can still finish`,
      move: lower(m),
      relation: { kind: "forced", rivals: "lost" },
    }),

  /** Every rival was settled: `goods` can finish, the rest cannot. The
   * offered jump carries an arrow too, being one of them. */
  onlyThese: (m: Marked, goods: readonly Marked[]): Sentence =>
    sentence({
      look: phrase`Only ${arrows([m, ...goods])} can still finish`,
      move: lower(m),
      relation: { kind: "oneOf" },
    }),

  /** `goods` can finish, at least one rival cannot, and some were not settled. */
  alsoThese: (m: Marked, goods: readonly Marked[]): Sentence =>
    sentence({
      look: phrase`${arrows([m, ...goods])} can still finish; some others cannot`,
      move: lower(m),
      relation: { kind: "oneOf" },
    }),

  /** Every jump from here can still finish. */
  anyJump: (m: Marked): Sentence =>
    sentence({
      look: phrase`Every jump can still finish with one peg`,
      move: lower(m),
      relation: { kind: "oneOf" },
    }),

  /** The jump that leaves one peg. */
  last: (m: Marked): Sentence =>
    sentence({
      move: lower(m),
      relation: { kind: "effect", effect: phrase`that finishes with one peg` },
    }),

  /** Nothing settled about the rivals worth saying. That this jump can still
   * finish goes without saying: the hint offers no other kind. */
  plain: (m: Marked): Sentence =>
    unshaped(phrase`Jump ${thisPeg(m)} into ${theHole(m)}.`, "bare"),

  /** `lone` has no peg beside it now, and this jump lands beside it; the
   * board shows which jump that is, so the words leave the move to its ring. */
  joins: (_m: Marked, lone: number): Sentence =>
    sentence({
      look: phrase`${theVictim(lone)} is stranded, with no peg beside it`,
      move: mark.move("go back for it"),
      relation: { kind: "answers", how: "One way to save it" },
    }),

  /** A rival would strand `lone`, where this jump keeps a peg beside it. */
  leavesAlone: (m: Marked, rival: Marked, lone: number): Sentence =>
    answer(
      phrase`${theRival(m, rival)} would strand ${theVictim(lone)}`,
      "One way to keep a peg beside it",
      m,
      rival,
    ),

  /** The first jump of a package. */
  packageStart: (m: Marked, p: Package): Sentence =>
    sentence({
      look: phrase`${count(p.jumps)} jumps clear ${theShape(p)} and change nothing else`,
      move: lower(m),
      relation: { kind: "sequence", at: "first" },
    }),

  /** A jump inside a package. */
  packageNext: (m: Marked, p: Package): Sentence =>
    sentence({
      look: phrase`to clear ${theShape(p)}`,
      move: lower(m),
      relation: { kind: "sequence", at: "next" },
    }),

  /** The jump that finishes a package. */
  packageEnd: (m: Marked, p: Package): Sentence =>
    sentence({
      look: phrase`to clear ${theShape(p)}`,
      move: lower(m),
      relation: { kind: "sequence", at: "last" },
    }),
};
