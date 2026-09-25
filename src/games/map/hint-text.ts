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
   * A forcing chain, as the case split it is: region 1 is `color` or `other`;
   * if `other`, each numbered region forces the next until region `last` is
   * driven to `color`. This region touches region 1 and region `last`, so one of
   * its neighbors is `color` either way.
   *
   * Map's own sentence rather than `narrateForcingChain`, which is written for
   * a line: its "this cell's row already has it" and "cross out" become
   * "touches" and one of three moves here, so two of its three clauses would
   * differ (docs/games/hints.md § "Candidate-elimination games": extract when
   * only the vocabulary differs, decline when an arm's shape does).
   */
  chain: (color: number, other: number, last: number, c: Conclusion): string =>
    `Region 1 can only be ${colorName(color)} or ${colorName(other)}. If ${colorName(other)}, each numbered region has two colors left and forces the next, until region ${last} is ${colorName(color)}. This region touches regions 1 and ${last}, so ${conclude(c, `it can't be ${colorName(color)}`)}.`,
} as const;
