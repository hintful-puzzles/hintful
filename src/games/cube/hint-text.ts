/**
 * Every sentence Cube's hint speaks.
 *
 * Which sentence a roll gets is `hint.ts`'s `narrate` to decide, from what it
 * has checked about the roll; this file decides only how it reads. The rule
 * that a roll swaps paint between the square and the face that lands on it is
 * the help's, so no sentence restates it.
 */

import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
  unshaped,
} from "../../engine/hint-words.ts";

/** A grid square, by its index in the arena. */
export const SQUARE: MarkKind<number> = { name: "square", key: String };

/** The square a roll lands on, ringed: the step's action. */
const theRing = (dest: number): Narration => mark.the("ring", SQUARE, [dest], "square");

/** The painted square the leg is going to pick up, outlined: what the step
 * works toward rather than what it decides. */
const theGoal = (goal: number): Narration =>
  mark.the("outline", SQUARE, [goal], "square");

const rollOnto = (dest: number): Narration => phrase`roll onto ${theRing(dest)}`;

/** "1 painted square", "3 painted squares". */
const paintedSquares = (n: number): string =>
  `${n} painted square${n === 1 ? "" : "s"}`;

export const say = {
  /** The roll picks up the paint of the square it lands on, leaving `left`
   * painted squares on the arena. */
  collect: (dest: number, left: number): Sentence =>
    sentence({
      move: rollOnto(dest),
      relation: {
        kind: "effect",
        effect:
          left === 0
            ? phrase`a plain face picks up the last of the paint`
            : phrase`a plain face picks up its paint, leaving ${paintedSquares(left)}`,
      },
    }),

  /** The roll changes no paint on its way to the goal: a painted square, or
   * null where the leg goes on to put paint on the square it picks up, so
   * that nothing on the board is yet the goal. */
  travel: (dest: number, goal: number | null): Sentence =>
    goal === null
      ? unshaped(phrase`${rollOnto(dest)}.`.capitalized(), "bare")
      : sentence({
          aim: theGoal(goal),
          move: rollOnto(dest),
          relation: { kind: "serves" },
        }),

  /** The goal is one roll away, and that roll would land a painted face on it. */
  comeRound: (dest: number, goal: number): Sentence =>
    sentence({
      aim: theGoal(goal),
      look: phrase`a painted face would land on it from here`,
      move: rollOnto(dest),
      relation: { kind: "answers", how: "Instead" },
    }),

  // A roll that puts paint down names no goal: the square it leaves paint on
  // is often the one the leg goes on to pick up, which would be ringed and
  // outlined at once.

  /** No square can be picked up from here without putting paint down first,
   * and this roll puts some down. */
  forcedDrop: (dest: number): Sentence =>
    sentence({
      look: phrase`every way to pick paint up puts some down first`,
      move: rollOnto(dest),
      relation: {
        kind: "effect",
        effect: phrase`the face that lands leaves its paint`,
      },
    }),

  /** The roll puts paint down, though some square could be picked up without
   * doing so. `then` says what the plan does with that paint: picks it up with
   * another face, picks it up again, or leaves it past the plan's end. */
  drop: (dest: number, then: "another" | "later" | null): Sentence =>
    sentence({
      move: rollOnto(dest),
      relation: {
        kind: "effect",
        effect:
          then === "another"
            ? phrase`the face that lands leaves its paint, for another face to pick up`
            : then === "later"
              ? phrase`the face that lands leaves its paint, to pick up again later`
              : phrase`the face that lands leaves its paint`,
      },
    }),
};
