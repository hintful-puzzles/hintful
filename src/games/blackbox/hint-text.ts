/**
 * Every sentence Black Box's hint speaks.
 *
 * Which sentence a step gets is `hint.ts`'s to decide, from what it proved
 * about the box; this file decides only how it reads. A deduction is one fired
 * laser followed to the first square nothing has settled: one of the two things
 * that square could hold would send the laser somewhere it did not go, so the
 * square holds the other. Each sentence names the laser by the marks on its
 * ends, says where it went, and what the refuted content would make it do.
 *
 * The hint searches for a layout when no single laser settles a square, so a
 * deduction's "so" says its rival was judged and lost (`rivals: "lost"`): the
 * square's other content is the rival, and the laser refutes it.
 */

import type { HintMarkLegend } from "../../engine/game.ts";
import {
  CELL,
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** A square of the firing range around the box, by its laser number. */
export const LASER: MarkKind<number> = { name: "laser", key: String };

/** The corner button that checks the answer. */
export const BUTTON: MarkKind<"button"> = { name: "button", key: () => "button" };

/** What each mark means here, as the help's list of marks gives it. */
export const HINT_MARKS: HintMarkLegend = {
  roles: {
    ring: "what the step decides: the square to mark as known or to put a ball on or take one off, the laser to fire, or the button that checks your answer.",
    outline: "the ends of the fired laser the step reasons from.",
  },
};

/** How a fired laser came out, as the board shows it: a pair of numbers at its
 * two ends, an `H` or an `R` at its entry. */
export type Seen =
  | {
      readonly kind: "exit";
      readonly ends: readonly [number, number];
      readonly n: number;
    }
  | { readonly kind: "hit"; readonly entry: number }
  | { readonly kind: "reflect"; readonly entry: number };

/** What the laser would do with the square holding the refuted content. */
export type Would = "hit" | "reflect" | "exit";

/** A square the step settles, and whether it holds a ball. */
export interface Settled {
  readonly at: Point;
  readonly ball: boolean;
}

const thisSquare = (at: Point): Narration => mark.this("ring", CELL, [at], "square");

/** The supposition the laser refutes: the square holding what it does not. */
const supposing = (s: Settled): Narration =>
  s.ball ? phrase`with ${thisSquare(s.at)} empty` : phrase`with a ball here`;

/** What the square holds. Once the supposition has said "this square", "it"
 * refers back to it. */
const holds = (s: Settled): Narration =>
  s.ball ? phrase`it must hold a ball` : phrase`${thisSquare(s.at)} must be empty`;

function would(w: Would, seen: Seen["kind"]): string {
  if (w === "hit") return "stop dead";
  if (w === "reflect") return "come straight back";
  return seen === "reflect" ? "come out elsewhere" : "leave the box";
}

const decided = (look: Narration, move: Narration): Sentence =>
  sentence({ look, move, relation: { kind: "forced", rivals: "lost" } });

export const say = {
  /** A laser followed to the first square nothing settles, where the square's
   * other content would send it elsewhere. A pair's two ends are one ray's,
   * whichever end it is followed from, so the sentence speaks of a ray between
   * them rather than of the one fired. */
  ray: (seen: Seen, w: Would, s: Settled): Sentence => {
    if (seen.kind === "exit") {
      const ends = mark.as("outline", LASER, [...seen.ends], `The two ${seen.n}s`);
      return decided(
        phrase`${ends} are one ray's ends, but ${supposing(s)} no ray could run between them`,
        holds(s),
      );
    }
    const ray = mark.as(
      "outline",
      LASER,
      [seen.entry],
      seen.kind === "hit" ? "The ray marked H" : "The ray marked R",
    );
    const went = seen.kind === "hit" ? "hit a ball" : "came straight back";
    return decided(
      phrase`${ray} ${went}, but ${supposing(s)} it would ${would(w, seen.kind)}`,
      holds(s),
    );
  },

  /** The later leg of a settled square that took two moves to show: a ball
   * taken off before the square is marked known, or a known mark taken off
   * before the ball goes on. */
  again: (s: Settled, why: "ray" | "layout" | "count"): Sentence =>
    sentence({
      move: s.ball
        ? phrase`put a ball on ${thisSquare(s.at)}`
        : phrase`mark ${thisSquare(s.at)} as known`,
      relation: { kind: "again", basis: phrase`the same ${why}` },
    }),

  /** Nothing settles another square: fire a laser whose way through the box
   * still depends on squares nothing has settled. */
  fire: (laser: number, firedAny: boolean): Sentence =>
    sentence({
      look: firedAny
        ? phrase`The lasers fired so far settle no other square`
        : phrase`No laser is fired yet`,
      move: phrase`fire ${mark.this("ring", LASER, [laser], "laser")}`,
      relation: {
        kind: "effect",
        effect: phrase`nothing settled yet decides where it goes`,
      },
    }),

  /**
   * One move of a layout that sends every fired laser where it went, found by
   * trying once no single laser settles a square: the first leg names every
   * square the layout changes, and each leg makes one change.
   */
  layout: (
    at: Point,
    change: "ball" | "unball" | "unlock",
    leg: "only" | "first" | "next" | "last",
    all: readonly Point[],
  ): Sentence => {
    const here = thisSquare(at);
    if (leg === "only")
      return sentence({
        look: phrase`Every laser is fired, and none settles a square alone`,
        move:
          change === "ball"
            ? phrase`put a ball on ${here}`
            : phrase`take the ball off ${here}`,
        relation: {
          kind: "effect",
          effect: phrase`then every laser goes where it went`,
        },
      });
    const move =
      change === "ball"
        ? phrase`put a ball on ${here}`
        : change === "unball"
          ? phrase`take the ball off ${here}`
          : phrase`take the known mark off ${here}`;
    const ringed = mark.as("ring", CELL, all, (els) =>
      els.length === 1 ? "the ringed square" : "the ringed squares",
    );
    return sentence({
      ...(leg === "first"
        ? {
            look: phrase`Every laser is fired, and ${ringed} can be set so each goes where it went`,
          }
        : {}),
      move,
      relation: { kind: "sequence", at: leg },
    });
  },

  /** Every laser's way is settled by the balls found, but the board must hold
   * more: the rest sit where no laser can tell. */
  hidden: (more: number, at: Point): Sentence =>
    sentence({
      look: phrase`Every laser's way is settled, and ${more === 1 ? "1 more ball hides" : `${more} more balls hide`} on squares no laser reaches`,
      move: phrase`put a ball on ${thisSquare(at)}`,
      relation: { kind: "oneOf" },
    }),

  /** More balls are marked than the box can hold, and no laser needs the ones
   * on squares nothing settles. */
  extra: (most: number, at: Point): Sentence =>
    sentence({
      look: phrase`The box holds at most ${most} ${most === 1 ? "ball" : "balls"}, and no laser needs those on unsettled squares`,
      move: phrase`take the ball off ${thisSquare(at)}`,
      relation: { kind: "oneOf" },
    }),

  /** The balls on the board send every laser where it went. */
  done: (): Sentence =>
    sentence({
      move: mark.as("ring", BUTTON, ["button"], "check your answer"),
      relation: {
        kind: "effect",
        effect: phrase`the balls you have send every laser where it went`,
      },
    }),
};
