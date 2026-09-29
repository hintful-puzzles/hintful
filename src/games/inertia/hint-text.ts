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

/** "a gem", "three gems": also what the stranded-ball refusal says. */
export const gemsPhrase = (n: number): string =>
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
type Only = "mines" | "walls";

/** "Slide north", pointing at the arrow on the ball. */
const slideWay = (m: Marked, verb = "Slide"): Narration =>
  mark.as("ring", ARROW, [m.dir], `${verb} ${DIR_NAMES[m.dir]}`);

/** The gem the leg is going for: circled, and an outline in role, since it is
 * what the step works toward rather than what it decides. */
const theGem = (m: Marked): Narration => mark.the("outline", GEM, [m.goal], "gem");

const working = (m: Marked): Narration => phrase`Working on ${theGem(m)}`;

export const say = {
  /** The leg's payoff: the slide sweeps up the goal gem, after `extras`
   * others on the way, and stops against `stopper`. */
  collect: (
    m: Marked,
    extras: number,
    only: Only | null,
    stopper: SlidePath["stopper"],
  ): Narration => {
    const sweep = extras
      ? phrase`it sweeps up ${gemsPhrase(extras)} and then ${theGem(m)}`
      : phrase`it sweeps up ${theGem(m)}`;
    if (only === "mines") {
      return phrase`${slideWay(m)}, the only way that doesn't run you onto a mine: ${sweep}.`;
    }
    if (only === "walls") {
      return phrase`${slideWay(m)}: ${sweep}, and walls block every other direction.`;
    }
    return phrase`${slideWay(m)}: ${sweep}, and ${stopClause(stopper)}.`;
  },

  // A move that collects nothing says what it is *for*.
  /** The only move the ball has, collecting nothing. */
  forced: (m: Marked, only: Only): Narration =>
    only === "mines"
      ? phrase`${working(m)}: ${slideWay(m, "slide")}, because every other direction you can set off in runs you onto a mine.`
      : phrase`${working(m)}: ${slideWay(m, "slide")}, because walls block every other direction.`,

  /** Sliding `grab` would take the gem but strand `stranded` others. */
  strands: (m: Marked, grab: number, stranded: number): Narration =>
    phrase`Sliding ${DIR_NAMES[grab]} grabs ${theGem(m)}, but you can't pick where you stop and it strands ${gemsPhrase(stranded)}: ${slideWay(m, "slide")}.`,

  // The route declines a grab it could take. Which side the ball comes at a
  // gem from decides where it fetches up, so this is a real trade-off — but we
  // have not proved the grab is a trap, so we don't say it is.
  declined: (m: Marked): Narration =>
    phrase`${working(m)}: ${slideWay(m, "slide")}. You could grab it from here, but the route comes at it from another side.`,

  /** No slide reaches the gem yet; `oneMore` when the plan's next slide does. */
  positioning: (m: Marked, oneMore: boolean): Narration =>
    oneMore
      ? phrase`${working(m)}: no slide from here reaches it. ${slideWay(m)}, and one more slide sweeps it up.`
      : phrase`${working(m)}: no slide from here reaches it. ${slideWay(m)} to work the ball round toward it.`,
};
