/**
 * Every sentence Fifteen's hint speaks.
 *
 * Each step names the stable goal tile it is working toward home (the
 * sentence's aim, "Working on tile 3:") and then says what this slide does
 * for it. Which case a step is — and which tile is the goal — is `index.ts`'s
 * `narrateFifteenStep` to decide; this file decides only how it reads.
 *
 * The one mark is the tile to slide, which is what the step decides: ringed,
 * in the roles of `engine/hint-words.ts`, though it is drawn filled. The words
 * that point at it are a reference to it.
 */

import {
  type MarkKind,
  mark,
  Narration,
  phrase,
  type Sentence,
  sentence,
} from "../../engine/hint-words.ts";

/** A tile, by its number, wherever it sits. */
export const TILE: MarkKind<number> = { name: "tile", key: (t) => `${t}` };

const slid = (tile: number, words: string): Narration =>
  mark.as("ring", TILE, [tile], words);

/** The slide, toward the goal tile the plan is working on. */
const toward = (goal: number, move: Narration): Sentence =>
  sentence({
    aim: Narration.plain(`tile ${goal}`),
    move,
    relation: { kind: "serves" },
  });

export const say = {
  /** The goal tile lands in its solved cell. */
  goalHome: (goal: number): Sentence =>
    toward(goal, phrase`slide ${slid(goal, "it")} into place`),

  /** The goal tile slides nearer its home. */
  goalCloser: (goal: number): Sentence =>
    toward(goal, phrase`slide ${slid(goal, "it")} closer`),

  /** The goal tile slides one cell further from home. It lands where the
   * hole was, so the hole is left one cell nearer home than the tile:
   * what the slide does for the goal. */
  goalReposition: (goal: number): Sentence =>
    toward(
      goal,
      phrase`slide ${slid(goal, "it")} back a step, leaving the hole between it and its home`,
    ),

  /** Another tile, displaced earlier in the rotation, lands in its own home. */
  tileHome: (goal: number, tile: number): Sentence =>
    toward(goal, phrase`slide ${slid(tile, `tile ${tile}`)} into place`),

  /** Any other slide clears the way. */
  outOfWay: (goal: number, tile: number): Sentence =>
    toward(goal, phrase`slide ${slid(tile, `tile ${tile}`)} out of the way`),
};
