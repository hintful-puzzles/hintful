/**
 * Every sentence Sokoban's hint speaks.
 *
 * Which sentence a push gets is `hint.ts`'s to decide, from what it has checked
 * about the push and its rivals; this file decides only how it reads.
 */

import type { HintMarkLegend } from "../../engine/game.ts";
import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Relation,
  type Sentence,
  sentence,
  unshaped,
} from "../../engine/hint-words.ts";
import type { Push } from "./solver.ts";

/** A barrel, by its grid index. */
export const BARREL: MarkKind<number> = { name: "barrel", key: String };

/** A push: the barrel and the way it goes, drawn on the barrel's square and
 * the square it is pushed into. Keyed by both, because one barrel can have a
 * push that finishes and another that loses. */
export const PUSH: MarkKind<Push> = {
  name: "push",
  key: (p) => `${p.barrel}>${p.dir}`,
};

/** What each mark means here, as the help's list of marks gives it. */
export const HINT_MARKS: HintMarkLegend = {
  roles: {
    ring: "the push to make: the barrel, and the square it is pushed into.",
    outline:
      "a barrel that can never reach a target (*the outlined barrel*); or, as arrows from the ringed barrel, the ways it can be pushed and still finish (*the arrows*).",
    stripes:
      "another way to push the ringed barrel that would leave a barrel stuck for good (*the striped push*).",
  },
};

/** Why a barrel can never reach a target: wedged in a corner, on a square no
 * push leads a target from, or jammed against walls and barrels so that it can
 * never move again. */
export type Stuck = "corner" | "dead" | "frozen";

const WAY = ["left", "up", "right", "down"] as const;

const thisBarrel = (p: Push): Narration => mark.this("ring", PUSH, [p], "barrel");
/** The move, mid-sentence. */
const pushIt = (p: Push): Narration => phrase`push ${thisBarrel(p)} ${WAY[p.dir]}`;
const theVictim = (c: number): Narration => mark.the("outline", BARREL, [c], "barrel");
const arrows = (goods: readonly Push[]): Narration =>
  mark.as("outline", PUSH, goods, (els) =>
    els.length > 1 ? "the arrows" : "the arrow",
  );

/** What a stuck barrel's square does to it, said of the barrel `it`. */
function fate(why: Stuck, it: Narration | string): Narration {
  if (why === "corner") return phrase`wedge ${it} in a corner it can never leave`;
  if (why === "dead") return phrase`leave ${it} where no push can bring it to a target`;
  return phrase`jam ${it} so it can never move`;
}

/**
 * Every sentence runs from what to look at to the move (docs/games/hints.md §
 * "Lead with the indication"), and says how the move follows: a danger is
 * answered by a move that avoids it, offered as one way, since the other pushes
 * were not all judged; only `only` and `alone`, where nothing else could
 * finish, say the push is forced, and their relation comes from the judging.
 */
export const say = {
  /**
   * This barrel pushed another way would be stuck for good: the barrel
   * itself, or `victim` frozen against it. The move is its other push, one way
   * among those not judged.
   */
  trap: (m: Push, rival: Push, why: Stuck, victim: number | null): Sentence => {
    const striped = mark.as("stripes", PUSH, [rival], "striped push");
    const it = victim !== null ? theVictim(victim) : "it";
    return sentence({
      look: phrase`${thisBarrel(m)}'s ${striped} would ${fate(why, it)}`,
      move: phrase`push it ${WAY[m.dir]}`,
      relation: { kind: "answers", how: "One way to avoid that" },
    });
  },

  /** Every other push of this barrel was searched to the end and none can
   * finish. The relation is the judging's own (`judgeRivals`), as it is for
   * the two below. */
  only: (m: Push, relation: Relation): Sentence =>
    sentence({
      look: phrase`No other push of ${thisBarrel(m)} can still finish`,
      move: phrase`push it ${WAY[m.dir]}`,
      relation,
    }),

  /** Every other push of this barrel was settled: `goods` can finish, the rest
   * cannot. The offered push carries an arrow too, being one of them. */
  onlyThese: (m: Push, goods: readonly Push[], relation: Relation): Sentence =>
    sentence({
      look: phrase`${thisBarrel(m)} can still finish only along ${arrows([m, ...goods])}`,
      move: phrase`push it ${WAY[m.dir]}`,
      relation,
    }),

  /** `goods` can finish, at least one other push cannot, and some were not
   * settled. */
  alsoThese: (m: Push, goods: readonly Push[], relation: Relation): Sentence =>
    sentence({
      look: phrase`${thisBarrel(m)} can still finish along ${arrows([m, ...goods])}, but not every way`,
      move: phrase`push it ${WAY[m.dir]}`,
      relation,
    }),

  /** The push puts its barrel on a target. */
  onTarget: (m: Push): Sentence =>
    sentence({
      move: pushIt(m),
      relation: { kind: "effect", effect: phrase`that puts it on a target` },
    }),

  /** Nothing settled about the rivals worth saying. That this push can still
   * finish goes without saying: the hint offers no other kind. */
  plain: (m: Push): Sentence =>
    unshaped(phrase`Push ${thisBarrel(m)} ${WAY[m.dir]}.`, "bare"),
};

/** A barrel off a target already stuck for good, as a refusal names it.
 * The refusal's own sentences are `hint.ts`'s, written where it refuses. */
export const stuckBarrel = theVictim;
