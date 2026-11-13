/**
 * Every sentence Netslide's hint speaks, and the words inside them.
 *
 * Which tile a step is about, which way it goes and whether it arrives are
 * `hint.ts`'s `narrateStep` to decide; this file decides only how it reads.
 *
 * A step says three things, each of which the player can act on: the piece
 * (by its shape, ringed with the arrow to click), the way it slides (a word,
 * so the sentence is complete without the arrow), and what that does for it
 * (it arrives where it belongs, or it sets the tile up).
 *
 * What is *not* said: that a line never slides, or that only the other line
 * can shift the tile. That is a **rule of the game**, not a deduction about
 * this move: the board already shows it (no arrows are drawn beside the
 * source's row or column) and it belongs in the help text. A sentence about
 * what cannot be done guides nowhere, and its stripe on the fixed line is not
 * evidence for the move.
 *
 * Nor is there "the center": `cx` is `⌊w/2⌋`, so on an even-sized board the
 * source is visibly off-center and the player can see the claim is false.
 *
 * The move itself is *not* forced by logic — Netslide is a movement game — so
 * the conclusion is an imperative, never a modal of necessity.
 */

import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
} from "../../engine/hint-words.ts";
import { D, dirCount, L, R, U } from "../../engine/square-edges.ts";

/** The tile a step moves, by the cell it sits in; its mark includes the arrow
 * that slides it. */
export const TILE: MarkKind<number> = { name: "tile", key: String };

/** What a step marks: the tile (wired as `mask`), and the way it slides. */
export interface Marked {
  tile: number;
  mask: number;
  heading: "left" | "right" | "up" | "down";
}

/** A tile's name is its shape, which is the one thing about it the player can
 * see. There is no "tile 8" in Netslide, so the shape names the *kind* and the
 * board's mark says *which one*. */
function tileName(mask: number): string {
  const wires = dirCount(mask);
  if (wires === 1) return "loose end";
  if (wires === 3) return "T-piece";
  if (wires === 4) return "cross";
  return mask === (L | R) || mask === (U | D) ? "straight" : "corner";
}

const tile = (m: Marked, words: string): Narration =>
  mark.as("ring", TILE, [m.tile], words);
const thisTile = (m: Marked, lead = "this"): Narration =>
  tile(m, `${lead} ${tileName(m.mask)}`);

/** What a slide does: it arrives, or it only stages the tile, what
 * `HINT_SETTING_UP` says elsewhere. The planner chose the move among others as
 * good, so the sentence says what it does rather than that anything forces
 * it. */
const arrives = (home: boolean, where?: string): Narration =>
  !home
    ? phrase`that sets it up`
    : where
      ? phrase`it belongs ${where}`
      : phrase`that's where it belongs`;

export const say = {
  /** A later leg of the journey: it does not re-explain the why, since leg one
   * carried it and is still on screen, so it serves the same tile. */
  next: (m: Marked, home: boolean): Sentence =>
    sentence({
      aim: thisTile(m),
      move: phrase`slide it ${m.heading}${home ? ", where it belongs" : ""}`,
      relation: { kind: "serves" },
    }),

  // Stated, not argued: *why* the source is fixed is a rule, and rules live in
  // the help text. "Belongs beside the source" is itself the arrival, so the
  // arriving leg closes on it; a leg still on its way says so as its look and
  // closes on setting things up, so "belongs" is never said twice.
  besideSource: (m: Marked, home: boolean): Sentence =>
    home
      ? sentence({
          move: phrase`slide ${thisTile(m)} ${m.heading}`,
          relation: { kind: "effect", effect: arrives(true, "beside the source") },
        })
      : sentence({
          look: phrase`${thisTile(m)} belongs beside the source`,
          move: phrase`slide it ${m.heading}`,
          relation: { kind: "effect", effect: arrives(false) },
        }),

  /** The piece, the way it goes and what that does. A tile on a line that
   * never slides is said the same way: the line is not evidence for the move. */
  working: (m: Marked, home: boolean): Sentence =>
    sentence({
      move: phrase`slide ${thisTile(m)} ${m.heading}`,
      relation: { kind: "effect", effect: arrives(home) },
    }),
};
