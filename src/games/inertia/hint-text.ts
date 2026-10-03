/**
 * Every sentence Inertia's hint speaks, and the words inside them.
 *
 * Which sentence a move gets is `hint.ts`'s `narrate` to decide, from what it
 * has checked about the move; this file decides only how it reads. Every
 * sentence states only what was checked — see `narrate` for which check backs
 * which branch.
 *
 * The refusals are not here: they are held to one list by `hint-refusal.ts`
 * and its test, and a game-specific one (the dead ball) is a named exception
 * there.
 */

import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Relation,
  type Sentence,
  sentence,
} from "../../engine/hint-words.ts";
import type { SlidePath } from "./state.ts";

/** The arrow on the ball, by the direction it points. */
export const ARROW: MarkKind<number> = { name: "arrow", key: String };

/** A gem, by its square. */
export const GEM: MarkKind<number> = { name: "gem", key: String };

/** What a step marks: the direction the arrow on the ball points, and the gem
 * the leg is going for. */
export interface Marked {
  dir: number;
  goal: number;
}

const DIR_NAMES = [
  "north",
  "north-east",
  "east",
  "south-east",
  "south",
  "south-west",
  "west",
  "north-west",
] as const;

const NUMBER_WORDS = ["no", "a", "two", "three", "four", "five", "six"] as const;

/** "a gem", "three gems". */
const gemsPhrase = (n: number): string =>
  n === 1 ? "a gem" : `${NUMBER_WORDS[n] ?? n} gems`;

/** What brings the ball to a halt — the rule the whole game turns on, so the
 * collecting narration always names it. */
function stopClause(stopper: SlidePath["stopper"]): string {
  return stopper === "stop"
    ? "the stop square at the end catches you"
    : "the wall at the end brings you up short";
}

/** Why this is the only move: every other way is walled off, or runs onto a
 * mine. */
export interface Only {
  readonly why: "mines" | "walls";
  /** What `judgeRivals` made of the other directions, which says "so". */
  readonly relation: Relation;
}

/** "slide north", pointing at the arrow on the ball. */
const slideWay = (m: Marked): Narration =>
  mark.as("ring", ARROW, [m.dir], `slide ${DIR_NAMES[m.dir]}`);

/** The gem the leg is going for: circled, and an outline in role, since it is
 * what the step works toward rather than what it decides. */
const theGem = (m: Marked): Narration => mark.the("outline", GEM, [m.goal], "gem");

/** Why the slide is the ball's only move (`onlyMove` checked every other
 * direction). */
const onlyBecause = (only: Only): Narration =>
  only.why === "mines"
    ? phrase`every other way you can go runs you onto a mine`
    : phrase`walls block every other direction`;

export const say = {
  /** The leg's payoff: the slide sweeps up the goal gem, after `extras`
   * others on the way, and stops against `stopper`. */
  collect: (
    m: Marked,
    extras: number,
    only: Only | null,
    stopper: SlidePath["stopper"],
  ): Sentence => {
    const sweep = extras
      ? phrase`it sweeps up ${gemsPhrase(extras)} and then ${theGem(m)}`
      : phrase`it sweeps up ${theGem(m)}`;
    if (only) {
      return sentence({
        look: onlyBecause(only),
        move: slideWay(m),
        relation: { kind: "effect", effect: sweep },
      });
    }
    return sentence({
      move: slideWay(m),
      relation: {
        kind: "effect",
        effect: phrase`${sweep}, and ${stopClause(stopper)}`,
      },
    });
  },

  // A move that collects nothing says what it is *for*. `onlyMove` judged
  // every other direction lost, and its relation says so.
  /** The only move the ball has, collecting nothing. */
  forced: (m: Marked, only: Only): Sentence =>
    sentence({
      aim: theGem(m),
      look: onlyBecause(only),
      move: slideWay(m),
      relation: only.relation,
    }),

  // The slide starts the plan's leg to the same gem, and `nextLeg` keeps only a
  // leg after which every gem is still reachable, so the slide answers the
  // stranding with a safe way to the gem; it may not be the only one.
  /** Sliding `grab` would take the gem but strand `stranded` others. */
  strands: (m: Marked, grab: number, stranded: number): Sentence =>
    sentence({
      look: phrase`Sliding ${DIR_NAMES[grab]} grabs ${theGem(m)}, but you can't pick where you stop and it strands ${gemsPhrase(stranded)}`,
      move: slideWay(m),
      relation: { kind: "answers", how: "One safe way" },
    }),

  // The route declines a grab it could take. Which side the ball comes at a
  // gem from decides where it fetches up, so this is a real trade-off — but we
  // have not proved the grab is a trap, so we don't say it is.
  declined: (m: Marked): Sentence =>
    sentence({
      aim: theGem(m),
      look: phrase`you could grab it from here, but the route comes at it from another side`,
      move: slideWay(m),
      relation: { kind: "serves" },
    }),

  /** No slide reaches the gem yet; `oneMore` when the plan's next slide does. */
  positioning: (m: Marked, oneMore: boolean): Sentence =>
    sentence({
      aim: theGem(m),
      look: phrase`no slide from here reaches it`,
      move: slideWay(m),
      relation: {
        kind: "effect",
        effect: oneMore
          ? phrase`one more slide sweeps it up`
          : phrase`it works the ball round toward it`,
      },
    }),
};
