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
import {
  type MarkKind,
  mark,
  Narration,
  phrase,
  type Sentence,
  so,
  unshaped,
} from "../../engine/hint-words.ts";

/** A region of the map, as a mark: its band, its dashed line or its chain
 * number. `order` is a chain region's number, and not part of its identity. */
export interface RegionMark {
  region: number;
  order?: number;
}

export const REGION: MarkKind<RegionMark> = {
  name: "region",
  key: (r) => String(r.region),
};

/** "this region": the one the step decides, ringed. */
const thisRegion = (r: number): Narration =>
  mark.this("ring", REGION, [{ region: r }], "region");

/** "region k" of a chain, by the number drawn on it. */
const numbered = (chain: readonly RegionMark[], k: number, words = `region ${k}`) =>
  mark.as("outline", REGION, [chain[k - 1]], words);

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
export const WALK_MAX = 5;

/** What a narrowing step does to its region, and so how its sentence ends:
 * - `place` — one color is left, and the step colors the region with it;
 * - `strike` — the region carries dots, and the step removes `struck`;
 * - `mark` — the region carries none, and the step dots the colors `left`. */
export type Conclusion =
  | { kind: "place"; color: number }
  | { kind: "strike"; struck: number }
  | { kind: "mark"; left: number };

/** A narrowing's conclusion, as the sentence's last parts: what the rule rules
 * out (`cannot`, "it can't be red"), then what that leaves the move to do. A
 * placed color is the move itself; a strike or a dotting follows from the
 * color ruled out. */
function conclude(
  c: Conclusion,
  cannot: string,
): { readonly follows?: Narration; readonly move: Narration } {
  switch (c.kind) {
    case "place":
      return { move: phrase`${cannot} and must be ${colorName(c.color)}` };
    case "strike": {
      const ns = names(c.struck);
      return {
        follows: phrase`${cannot}`,
        move: phrase`its ${joinWith(ns)} ${ns.length > 1 ? "dots" : "dot"} must go`,
      };
    }
    case "mark":
      return {
        follows: phrase`${cannot}`,
        move: phrase`dot ${joinWith(names(c.left))}`,
      };
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
      look: phrase`${thisRegion(r)} touches ${joinWith(names(others))}`,
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
   * either" does not follow from "both can only be red or teal" (the
   * `equivalentEdges` lesson, docs/games/hints.md § "Writing the narration").
   */
  pair: (
    r: number,
    regions: readonly RegionMark[],
    pair: number,
    c: Conclusion,
  ): Sentence =>
    so({
      look: phrase`${mark.as("outline", REGION, regions, "The outlined pair")} touch and can only be ${joinOr(names(pair))}, so they use both. ${thisRegion(r).capitalized()} touches both`,
      ...conclude(c, "it can't be either"),
    }),

  /**
   * A forcing chain, as the case split it is, walked with its actual colors:
   * `forced` is what each numbered region is if region 1 isn't `color`, the
   * last being `color`. A rule ("each loses the color the one before it
   * takes") asked the player to run the walk themselves; the colors make it a
   * read (owner playtest, 2026-09-25). This region touches region 1 and the
   * last, so one of its neighbors is `color` either way.
   *
   * Map's own sentence rather than `forcingChainPremise`, which is written for
   * a line: its "this cell's row already has it" and the candidate walk's
   * conclusion become "touches" and one of three moves here, so two of its three clauses would
   * differ (docs/games/hints.md § "Candidate-elimination games": extract when
   * only the vocabulary differs, decline when an arm's shape does).
   */
  chain: (
    r: number,
    chain: readonly RegionMark[],
    color: number,
    forced: readonly number[],
    c: Conclusion,
  ): Sentence => {
    const last = forced.length;
    const red = colorName(color);
    const at = (k: number): Narration => numbered(chain, k);
    // Past a handful of links a listed walk is no longer a glance (and an
    // eight-region one ran to 270 characters), so a long chain states the rule
    // its dots follow and names only where it ends.
    const walk =
      last <= WALK_MAX
        ? joinNarrations(
            forced.slice(1).map((f, i) => phrase`${at(i + 2)} is ${colorName(f)}`),
          )
        : phrase`${mark.as("outline", REGION, chain, "each numbered region")} takes the dot the one before it leaves, down to ${at(last)} being ${red}`;
    return so({
      look: phrase`If ${at(1)} isn't ${red}, it's ${colorName(forced[0])}, so ${walk}. Either way ${at(1)} or ${at(last)} is ${red}, and ${thisRegion(r)} touches both`,
      ...conclude(c, `it can't be ${red}`),
    });
  },

  /**
   * A forcing chain whose every region has a dot of the struck color, told as
   * the pattern a player sees in it rather than walked: the color can only
   * alternate down the chain (owner playtest, 2026-09-25). The chain always ends
   * on an even region in this shape, so "every other region" lands on `last`.
   */
  chainAlternates: (
    r: number,
    chain: readonly RegionMark[],
    color: number,
    c: Conclusion,
  ): Sentence => {
    const red = colorName(color);
    const last = chain.length;
    const at = (k: number): Narration => numbered(chain, k);
    return so({
      look: phrase`${mark.as("outline", REGION, chain, "Every numbered region")} has a ${red} dot. If ${at(1)} isn't ${red}, ${at(2)} must be, and so on every other region to ${at(last)}. Either way ${at(1)} or ${at(last)} is ${red}, and ${thisRegion(r)} touches both`,
      ...conclude(c, `it can't be ${red}`),
    });
  },

  /**
   * One of a pair's regions, dotted with its two colors before the pair is
   * stated, so "both can only be yellow or teal" is on the board. The region
   * dotted is ringed and nothing else is marked: the pair is what the leg is
   * writing, not what it reasons from, and its other region's dots may not be
   * on the board yet.
   */
  pairDot: (r: number, touched: number, two: number): Sentence =>
    so({
      look: phrase`${thisRegion(r)}'s neighbors show ${joinWith(names(touched))}`,
      follows: phrase`it can only be ${joinOr(names(two))}`,
      move: phrase`dot those`,
    }),

  /** The same, for a pair's region whose dots include a color a neighbor
   * already shows. */
  pairTrim: (r: number, two: number): Sentence =>
    so({
      look: phrase`${thisRegion(r)}'s other dots match its neighbors' colors`,
      move: phrase`it can only be ${joinOr(names(two))}`,
    }),

  /**
   * A chain's region, the `k`th, dotted with its two colors before the chain is
   * followed: its neighbors show the other two. `touched` and `two` are masks;
   * `chain` is every region of it, numbered, this one included.
   */
  chainDot: (
    r: number,
    k: number,
    chain: readonly RegionMark[],
    touched: number,
    two: number,
  ): Sentence =>
    so({
      look: phrase`${regionK(r, k)} of ${theChain(chain)} touches ${joinWith(names(touched))}`,
      follows: phrase`it can only be ${joinOr(names(two))}`,
      move: phrase`dot those`,
    }),

  /** The same, for a chain's region whose dots include colors a neighbor
   * already has. */
  chainTrim: (
    r: number,
    k: number,
    chain: readonly RegionMark[],
    two: number,
  ): Sentence =>
    so({
      look: phrase`${regionK(r, k)} of ${theChain(chain)} has other dots that match its neighbors' colors`,
      move: phrase`it can only be ${joinOr(names(two))}`,
    }),
} as const;

/** "the numbered chain": every region of a chain, by the numbers on them. */
const theChain = (chain: readonly RegionMark[]): Narration =>
  mark.as("outline", REGION, chain, "the numbered chain");

/** "Region k": a chain's region the step decides, named by its number. */
const regionK = (r: number, k: number): Narration =>
  mark.as("ring", REGION, [{ region: r }], `Region ${k}`);

/** {@link joinWith} over narrations: "a, b and c". */
function joinNarrations(parts: readonly Narration[]): Narration {
  if (parts.length <= 1) return parts[0] ?? phrase``;
  const init = parts.slice(0, -1).reduce((acc, p) => phrase`${acc}, ${p}`);
  return phrase`${init} and ${parts[parts.length - 1]}`;
}
