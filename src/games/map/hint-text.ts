/**
 * Every sentence Map's hint speaks (docs/hints.md § "The sentences live
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
 * the two it outlines, and a weighing names its regions by their places in
 * it, "the middle region" and "an outlined end".
 *
 * ## The conclusion says what the move does
 *
 * A step that decides a region's color says which. One that only narrows it
 * either removes dots the player has made or, on a region with no dots,
 * places dots for the colors left, because Map's dots mark what a region
 * *might* be (its help page). So each rule ends in one of three
 * {@link Conclusion}s, and the sentence names the one the move carries out.
 */

import type { ColorWord } from "../../engine/color/color-word.ts";
import { FOUR_NAMES } from "../../engine/color/colors.ts";
import {
  listOf,
  type MarkKind,
  mark,
  NARRATION_LIMIT,
  Narration,
  phrase,
  type Sentence,
  so,
  unshaped,
} from "../../engine/hint-words.ts";

/** A region of the map, as a mark: its band or its dashed line. */
export interface RegionMark {
  region: number;
}

export const REGION: MarkKind<RegionMark> = {
  name: "region",
  key: (r) => String(r.region),
};

/** "this region": the one the step decides, ringed. */
const thisRegion = (r: number): Narration =>
  mark.this("ring", REGION, [{ region: r }], "region");

/** A color index as its word. */
export const colorName = (c: number): ColorWord => FOUR_NAMES[c];

/** The colors in a four-bit mask, lowest first. */
export function colorsOf(mask: number): number[] {
  const out: number[] = [];
  for (let c = 0; c < 4; c++) if (mask & (1 << c)) out.push(c);
  return out;
}

const names = (mask: number): ColorWord[] => colorsOf(mask).map(colorName);
/** The colors in a mask, "a, b and c". */
const all = (mask: number): Narration => listOf(names(mask));
/** The colors in a mask as alternatives, "a, b or c". */
const either = (mask: number): Narration => listOf(names(mask), "or");

/** What a narrowing step does to its region, and so how its sentence ends:
 * - `place` — one color is left, and the step colors the region with it;
 * - `strike` — the region carries dots, and the step removes `struck`;
 * - `mark` — the region carries none, and the step dots the colors `left`. */
export type Conclusion =
  | { kind: "place"; color: number }
  | { kind: "strike"; struck: number }
  | { kind: "mark"; left: number };

/** A narrowing's conclusion, as the sentence's last parts: what the rule rules
 * out (`cannot`, "it can't be pink"), then what that leaves the move to do. A
 * placed color is the move itself; a strike or a dotting follows from the
 * color ruled out. */
function conclude(
  c: Conclusion,
  cannot: Narration,
): { readonly follows?: Narration; readonly move: Narration } {
  switch (c.kind) {
    case "place":
      return { move: phrase`${cannot} and must be ${colorName(c.color)}` };
    case "strike":
      return {
        follows: cannot,
        move: phrase`its ${all(c.struck)} ${names(c.struck).length > 1 ? "dots" : "dot"} must go`,
      };
    case "mark":
      return { follows: cannot, move: phrase`dot ${all(c.left)}` };
  }
}

export const say = {
  /** The populate reading's opening, the Mark-all press's fill. */
  fillAll: unshaped(
    Narration.plain(
      "Start by dotting all four colors into each blank region, so there is something to cross out.",
    ),
    "setup",
  ),

  /** The press's second half, which follows the fill in one journey. */
  cleanNeighbors: unshaped(
    Narration.plain(
      "Now clear the easy ones: remove from each blank region the dot of every color a neighbor already shows.",
    ),
    "setup",
  ),

  /** A region whose neighbors show every color but one, and which has no dots
   * to consult. `others` is the three colors its neighbors show. */
  touchesTheRest: (r: number, color: number, others: number): Sentence =>
    so({
      look: phrase`${thisRegion(r)} touches ${all(others)}`,
      move: phrase`it must be ${colorName(color)}`,
    }),

  /** A region the player has dotted with one color only. The dot shows its
   * color, so the sentence names it once, in the conclusion. */
  lastDot: (r: number, color: number): Sentence =>
    so({
      look: phrase`${thisRegion(r)} has a single dot`,
      move: phrase`it must be ${colorName(color)}`,
    }),

  /** A region whose other dots are all colors a neighbor already has. */
  deadDots: (r: number, color: number): Sentence =>
    so({
      look: phrase`${thisRegion(r)}'s other dots match its neighbors' colors`,
      move: phrase`it must be ${colorName(color)}`,
    }),

  /**
   * Two touching regions down to the same two colors, which they must then use
   * between them, both beside this region. `pair` is the two colors' mask.
   *
   * "Use both" is the premise the conclusion rests on, and it is stated rather
   * than left for the player to supply: without it, "so this region can't be
   * either" does not follow from "both can only be pink or teal" (the
   * `equivalentEdges` lesson, docs/hints.md § "Writing the narration"). Why
   * they use both, that they touch and each shows only those two dots, is left
   * to the board, which draws both.
   */
  pair: (
    r: number,
    regions: readonly RegionMark[],
    pair: number,
    c: Conclusion,
  ): Sentence =>
    so({
      look: phrase`${thisRegion(r).capitalized()} touches ${mark.as("outline", REGION, regions, "the outlined pair")}, which use both ${all(pair)}`,
      ...conclude(c, phrase`it can't be either`),
    }),

  /**
   * A weighed region, the middle one: each color it can take leaves one of
   * the ends with `color` alone, or, where `self`, is `color` itself, and
   * this region touches every one of them. Every way is read off the dots
   * the premise legs have put on the middle region and the ends, so the words
   * name the regions and the color, and leave the ways to the dots. "Beside"
   * becomes "by" where the sentence would run over, which only "it or" and a
   * conclusion dotting three colors together reach.
   */
  weigh: (
    r: number,
    middle: RegionMark,
    ends: readonly RegionMark[],
    color: number,
    self: boolean,
    c: Conclusion,
  ): Sentence => {
    const hue = colorName(color);
    const end = mark.as("outline", REGION, ends, "an end");
    const which = self ? phrase`it or ${end}` : end;
    const said = (beside: string) =>
      so({
        look: phrase`whatever ${mark.as("outline", REGION, [middle], "the middle region")} is, ${which} ${beside} ${thisRegion(r)} is ${hue}`.capitalized(),
        ...conclude(c, phrase`it can't be ${hue}`),
      });
    const told = said("beside");
    return told.text.length <= NARRATION_LIMIT ? told : said("by");
  },

  /**
   * One of a pair's or a weighing's regions, dotted with its colors before
   * the pair or weighing is stated, so "can only be yellow or teal" is on the
   * board. The region dotted is ringed and nothing else is marked: the pair or
   * weighing is what the leg is writing, not what it reasons from, and its
   * other regions' dots may not be on the board yet. `touched` and `two` are
   * masks.
   */
  premiseDot: (r: number, touched: number, two: number): Sentence =>
    so({
      look: phrase`${thisRegion(r)}'s neighbors show ${all(touched)}`,
      follows: phrase`it can only be ${either(two)}`,
      move: phrase`dot those`,
    }),

  /** The same, for a region whose dots include a color a neighbor already
   * shows. */
  premiseTrim: (r: number, two: number): Sentence =>
    so({
      look: phrase`${thisRegion(r)}'s other dots match its neighbors' colors`,
      move: phrase`it can only be ${either(two)}`,
    }),
} as const;
