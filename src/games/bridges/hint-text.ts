/**
 * Every sentence the Bridges hint speaks, and every word inside one.
 *
 * The deduction decides *which* sentence and *with what values*
 * ([`hint.ts`](./hint.ts)'s `narrate`); this file decides only how it reads, so
 * a wording pass happens here and nowhere else. Values arrive as the board
 * means them (a clue, a count of neighbors, the size of a group), never as
 * words: the plural, the "both" at two and the singular arms are this file's to
 * choose.
 *
 * Each sentence runs indication, reasoning, conclusion, with the conclusion in
 * the necessity voice (docs/games/hints.md § "Writing the narration"). An
 * island is named by its clue digit, which is the one thing about it the player
 * can read off the board, and the island the sentence is about is the one the
 * hint recolors. A *bridge* has no name at all, so every sentence points at one
 * by direction from its island ("this way", "there"), which the drawn hint bar
 * or cross shows.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the bridges, crosses and limits the step decides
 * are the ring, and the island the sentence is about, the islands it counts
 * and the bridges between them are outlined.
 */

import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
} from "../../engine/hint-words.ts";
import type { BridgesSpan } from "./solver.ts";

const spanKey = (s: BridgesSpan): string => {
  const a = `${s.x1},${s.y1}`;
  const b = `${s.x2},${s.y2}`;
  return a < b ? `${a}-${b}` : `${b}-${a}`;
};

/** A span between two islands, the same from either end. */
export const SPAN: MarkKind<BridgesSpan> = { name: "span", key: spanKey };

/** An island, or a bridge span the argument counts. One kind for both, so
 * "these 3 islands" can name a group with the bridges that link it. */
export type Piece = { x: number; y: number } | BridgesSpan;

export const PIECE: MarkKind<Piece> = {
  name: "piece",
  key: (p) => ("x1" in p ? spanKey(p) : `${p.x},${p.y}`),
};

/** What a step marks: the spans it decides, the island the sentence is about
 * (null when it names none), and the islands and bridges it counts. */
export interface Marked {
  targets: readonly BridgesSpan[];
  focus: { x: number; y: number } | null;
  islands: readonly { x: number; y: number }[];
  spans: readonly BridgesSpan[];
}

const plural = (n: number, one: string, many: string): string => (n === 1 ? one : many);

/** Bridge counts as words: a limit is at most one less than the most bridges
 * the Custom dialog offers, and the count one past it at most that many. */
const WORDS = ["none", "one", "two", "three", "four"];

/** "This 5", the island the sentence is about. */
const thisClue = (m: Marked, clue: number, tail = ""): Narration =>
  mark.as("outline", PIECE, m.focus ? [m.focus] : [], `this ${clue}${tail}`);

/** The spans the step decides, in whatever words point at them. */
const decided = (m: Marked, words: string): Narration =>
  mark.as("ring", SPAN, m.targets, words);

/** The islands the argument counts, in whatever words name them. */
const counted = (m: Marked, words: string): Narration =>
  mark.as("outline", PIECE, m.islands, words);

/** The trial a limiting argument makes: one bridge past what it allows. */
const tooMany = (limit: number): string =>
  limit === 0
    ? "A bridge"
    : `${WORDS[limit + 1].replace(/^./, (c) => c.toUpperCase())} bridges`;

/** Its conclusion. At none it is the no-line the player crosses out, and
 * above it the "at most" mark they write with the same gesture. */
const limited = (m: Marked, limit: number): Narration =>
  limit === 0
    ? phrase`${decided(m, "this way")} must be blocked`
    : phrase`at most ${WORDS[limit]} can run ${decided(m, "this way")}`;

export const say = {
  /** An island `missing` bridges short of its clue with room for exactly that
   * many. `clue` names it; the picture draws every bridge the move adds, and
   * they total `missing`. */
  exactSpace: (clue: number, missing: number, m: Marked): Narration =>
    missing === 1
      ? phrase`${thisClue(m, clue).capitalized()} still needs one more bridge and has room for exactly one, so it must be drawn ${decided(m, "there")}.`
      : phrase`${thisClue(m, clue).capitalized()} still needs ${missing} more bridges and has room for exactly ${missing}, so ${decided(m, "every one")} must be drawn.`,

  /**
   * An island whose clue exceeds what all but one of its `neighbors` could
   * carry, so none of them can be left out.
   *
   * The one-neighbor arm is not a degenerate reading of the same sentence: with
   * a single neighbor the count argument is vacuous and the real reason is that
   * there is nowhere else for a bridge to go.
   */
  everyNeighbor: (clue: number, neighbors: number, m: Marked): Narration => {
    const island = thisClue(m, clue).capitalized();
    if (neighbors === 1) {
      return phrase`${island} has just ${counted(m, "one neighbor")} left to reach, so at least ${decided(m, "one bridge")} must run to it.`;
    }
    if (neighbors === 2) {
      return phrase`${island} needs more bridges than ${counted(m, "either neighbor")} could carry alone, so both must take ${decided(m, "at least one")}.`;
    }
    return phrase`${island} needs more bridges than any ${neighbors - 1} of ${counted(m, `its ${neighbors} neighbors`)} could carry, so each must take ${decided(m, "one")}.`;
  },

  wouldCloseLoop: (m: Marked): Narration =>
    phrase`${mark.this("outline", PIECE, m.islands, "island").capitalized()} are already linked by ${mark.the("outline", PIECE, m.spans, "bridge")}, so one more ${decided(m, "this way")} would close a loop: it must be blocked.`,

  /** An island that can draw at most `elsewhere` bridges anywhere but this way. */
  needsThisWay: (clue: number, elsewhere: number, m: Marked): Narration =>
    elsewhere === 0
      ? phrase`${thisClue(m, clue, "'s").capitalized()} ${counted(m, "other neighbors")} can take no bridges at all, so every bridge it needs must run ${decided(m, "this way")}.`
      : phrase`${thisClue(m, clue).capitalized()} can take at most ${elsewhere} ${plural(elsewhere, "bridge", "bridges")} from ${counted(m, "its other neighbors")}, so one must run ${decided(m, "this way")}.`,

  /** One bridge more than `limit` here would complete a group of `group`
   * islands, all satisfied and cut off from the rest. The picture outlines
   * exactly `group` islands, and the bridges already linking them, which the
   * words name with them. */
  wouldSealGroup: (group: number, limit: number, m: Marked): Narration =>
    phrase`${tooMany(limit)} here would shut ${mark.as("outline", PIECE, [...m.islands, ...m.spans], `these ${group} islands`)} into a finished group of their own, so ${limited(m, limit)}.`,

  /** One bridge more than `limit` here leaves some island unable to reach its
   * clue: `self` when that island is the one the bridge would start from,
   * where "the outlined island" would point at the recolored one instead. */
  wouldStarve: (clue: number, self: boolean, limit: number, m: Marked): Narration =>
    self
      ? phrase`${tooMany(limit)} here would leave ${thisClue(m, clue, " itself")} unable to reach its count, so ${limited(m, limit)}.`
      : phrase`${tooMany(limit)} here would leave ${counted(m, "the outlined island")} unable to reach its own count, so ${limited(m, limit)}.`,

  /** Filling every other direction to its limit would seal off a finished
   * group, so this direction cannot be the empty one. The group is its islands
   * and the bridges linking them. */
  mustReachOut: (clue: number, m: Marked): Narration =>
    phrase`Filling ${thisClue(m, clue, "'s")} other links as far as they go would seal off ${mark.as("outline", PIECE, [...m.islands, ...m.spans], "the outlined group")}, so a bridge must run ${decided(m, "this way")}.`,
};
