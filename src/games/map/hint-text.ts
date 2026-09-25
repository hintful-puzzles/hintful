/**
 * Every sentence Map's hint speaks (docs/games/hints.md § "The sentences live
 * in one file per game").
 *
 * ## A color is named by its word
 *
 * Map's values *are* its four colors, so a color's name is the value's name,
 * which is what a number puzzle's digit is (§ "Name a square by its value").
 * The words come from the palette (`FOUR_NAMES`, beside the fills), so the word
 * and the color cannot drift apart. This is not the rule against naming a
 * *hint's* colors in prose: those mean a role, and these are the answer.
 *
 * ## A region is named by its mark
 *
 * A region has no coordinates a player can read, and its number is behind a
 * preference that is off by default. So a sentence never names a region
 * outright: "this region" is the one the hint rings, "the outlined pair" are
 * the two it outlines, and a chain's regions are "region 1" to "region N" by
 * the numbers drawn on them.
 *
 * ## The conclusion says what the move does
 *
 * A step that decides a region's color says which. One that only narrows it
 * either removes dots the player has made or, on a region with no dots,
 * places dots for the colors left, because Map's dots mark what a region
 * *might* be (its help page). So each rule ends in one of three
 * {@link Conclusion}s, and the sentence names the one the move carries out.
 */

import { FOUR_NAMES } from "../../engine/color/colors.ts";
import { joinOr, joinWith } from "../../engine/hint-text.ts";

/** A color index as its word. */
export const colorName = (c: number): string => FOUR_NAMES[c];

/** The colors in a four-bit mask, lowest first. */
export function colorsOf(mask: number): number[] {
  const out: number[] = [];
  for (let c = 0; c < 4; c++) if (mask & (1 << c)) out.push(c);
  return out;
}

const names = (mask: number): string[] => colorsOf(mask).map(colorName);

/** The longest chain whose walk is listed region by region. */
const WALK_MAX = 5;

/** What a narrowing step does to its region, and so how its sentence ends:
 * - `place` — one color is left, and the step colors the region with it;
 * - `strike` — the region carries dots, and the step removes `struck`;
 * - `mark` — the region carries none, and the step dots the colors `left`. */
export type Conclusion =
  | { kind: "place"; color: number }
  | { kind: "strike"; struck: number }
  | { kind: "mark"; left: number };

/** A narrowing's conclusion: what the rule rules out (`cannot`, "it can't be
 * red"), then what that leaves the move to do. */
function conclude(c: Conclusion, cannot: string): string {
  switch (c.kind) {
    case "place":
      return `${cannot} and must be ${colorName(c.color)}`;
    case "strike": {
      const ns = names(c.struck);
      return `${cannot}: its ${joinWith(ns)} ${ns.length > 1 ? "dots" : "dot"} must go`;
    }
    case "mark":
      return `${cannot}: dot ${joinWith(names(c.left))}`;
  }
}

export const say = {
  /** A region whose neighbors show every color but one, and which has no dots
   * to consult. `others` is the three colors its neighbors show. */
  touchesTheRest: (color: number, others: number): string =>
    `This region touches ${joinWith(names(others))}, so it must be ${colorName(color)}.`,

  /** A region the player has dotted with one color only. */
  lastDot: (color: number): string =>
    `The only dot in this region is ${colorName(color)}, so it must be ${colorName(color)}.`,

  /** A region whose other dots are all colors a neighbor already has. */
  deadDots: (color: number): string =>
    `Its other dots match its neighbors' colors, so this region must be ${colorName(color)}.`,

  /**
   * Two touching regions down to the same two colors, which they must then use
   * between them, both beside this region. `pair` is the two colors' mask.
   *
   * "Use both" is the premise the conclusion rests on, and it is stated rather
   * than left for the player to supply: without it, "so this region can't be
   * either" does not follow from "both can only be red or teal" (the
   * `equivalentEdges` lesson, docs/games/hints.md § "Writing the narration").
   */
  pair: (pair: number, c: Conclusion): string =>
    `The outlined pair touch and can only be ${joinOr(names(pair))}, so they use both. This region touches both, so ${conclude(c, "it can't be either")}.`,

  /**
   * A forcing chain, as the case split it is, walked with its actual colors:
   * `forced` is what each numbered region is if region 1 isn't `color`, the
   * last being `color`. A rule ("each loses the color the one before it
   * takes") asked the player to run the walk themselves; the colors make it a
   * read (owner playtest, 2026-09-25). This region touches region 1 and the
   * last, so one of its neighbors is `color` either way.
   *
   * Map's own sentence rather than `narrateForcingChain`, which is written for
   * a line: its "this cell's row already has it" and "cross out" become
   * "touches" and one of three moves here, so two of its three clauses would
   * differ (docs/games/hints.md § "Candidate-elimination games": extract when
   * only the vocabulary differs, decline when an arm's shape does).
   */
  chain: (color: number, forced: readonly number[], c: Conclusion): string => {
    const last = forced.length;
    const red = colorName(color);
    // Past a handful of links a listed walk is no longer a glance (and an
    // eight-region one ran to 270 characters), so a long chain states the rule
    // its dots follow and names only where it ends.
    const walk =
      last <= WALK_MAX
        ? joinWith(forced.slice(1).map((f, i) => `region ${i + 2} is ${colorName(f)}`))
        : `each numbered region takes the dot the one before it leaves, down to region ${last} being ${red}`;
    return `If region 1 isn't ${red}, it's ${colorName(forced[0])}, so ${walk}. Either way region 1 or region ${last} is ${red}, and this region touches both, so ${conclude(c, `it can't be ${red}`)}.`;
  },

  /**
   * A forcing chain whose every region has a dot of the struck color, told as
   * the pattern a player sees in it rather than walked: the color can only
   * alternate down the chain (owner playtest, 2026-09-25). The chain always ends
   * on an even region in this shape, so "every other region" lands on `last`.
   */
  chainAlternates: (color: number, last: number, c: Conclusion): string => {
    const red = colorName(color);
    return `Every numbered region has a ${red} dot. If region 1 isn't ${red}, region 2 must be, and so on every other region to region ${last}. Either way region 1 or region ${last} is ${red}, and this region touches both, so ${conclude(c, `it can't be ${red}`)}.`;
  },

  /**
   * A chain's region, dotted with its two colors before the chain is followed:
   * its neighbors show the other two. `touched` and `two` are masks.
   */
  chainDot: (k: number, touched: number, two: number): string =>
    `Region ${k} touches ${joinWith(names(touched))}, so it can only be ${joinOr(names(two))}: dot those.`,

  /** The same, for a chain's region whose dots include colors a neighbor
   * already has. */
  chainTrim: (k: number, two: number): string =>
    `Region ${k}'s other dots match its neighbors' colors, so it can only be ${joinOr(names(two))}.`,
} as const;
