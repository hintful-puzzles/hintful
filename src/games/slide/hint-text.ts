/**
 * Every sentence Slide's hint speaks.
 *
 * Which sentence a slide gets is `hint.ts`'s to decide, from what the plan
 * shows the slide is for; this file decides only how it reads.
 */

import type { HintMarkLegend } from "../../engine/game.ts";
import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** The squares of one block, or of the space a block moves into, named as one
 * thing: "the ringed block" over all its squares. */
export const BLOCK = whole(CELL);

/** What each mark means here, as the help's list of marks gives it. */
export const HINT_MARKS: HintMarkLegend = {
  roles: {
    ring: "the block to slide (*the ringed block*).",
    outline:
      "the block the slide makes room for: its own slide, which comes later, needs a square the ringed block is leaving (*the outlined block*).",
    stripes: "the squares the ringed block slides onto (*the striped space*).",
  },
};

/** One slide, as the words need it: the squares the block covers now, the
 * squares it will cover, and whether it is the key block. */
export interface Slid {
  readonly cells: readonly Point[];
  readonly into: readonly Point[];
  readonly key: boolean;
}

/** The move, mid-sentence: "slide the ringed block into the striped space". */
const slideIt = (m: Slid): Narration =>
  phrase`slide ${mark.the("ring", BLOCK, m.cells, m.key ? "key block" : "block")} into ${mark.the("stripes", BLOCK, m.into, "space")}`;

/**
 * Each sentence is the move and what it does (`effect`): no rule forces a
 * slide, every other slide can still finish too, and what makes this one
 * worth making is what the plan shows it is for (`add-slide-hint` design D2).
 */
export const say = {
  /** The slide leaves a square that `forBlock`'s later slide needs. */
  makesRoom: (m: Slid, forBlock: readonly Point[]): Sentence =>
    sentence({
      move: slideIt(m),
      relation: {
        kind: "effect",
        effect: phrase`that makes room for ${mark.the("outline", BLOCK, forBlock, "block")}`,
      },
    }),

  /** The slide leaves a square the key block's next slide needs. */
  makesRoomForKey: (m: Slid): Sentence =>
    sentence({
      move: slideIt(m),
      relation: { kind: "effect", effect: phrase`that makes room for the key block` },
    }),

  /** No later slide needs what this one leaves until the same block moves on
   * from where it lands: it stops part way. */
  movesOn: (m: Slid): Sentence =>
    sentence({
      move: slideIt(m),
      relation: { kind: "effect", effect: phrase`it moves on from there later` },
    }),

  /** A slide of the key block, with `left` moves still to make at the
   * fewest. */
  keyBlock: (m: Slid, left: number): Sentence =>
    sentence({
      move: slideIt(m),
      relation: {
        kind: "effect",
        effect: phrase`from there it can be out in ${left === 1 ? "1 move" : `${left} moves`}`,
      },
    }),

  /** The key block's last slide. */
  keyOut: (m: Slid): Sentence =>
    sentence({
      move: slideIt(m),
      relation: { kind: "effect", effect: phrase`that brings it onto the exit` },
    }),
};
