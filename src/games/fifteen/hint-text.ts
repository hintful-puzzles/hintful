/**
 * Every sentence Fifteen's hint speaks.
 *
 * Each step names the stable goal tile it is working toward home (the
 * engine's `workingOn`, shared with Sixteen) and then says what this slide does
 * for it. Which case a step is — and which tile is the goal — is `index.ts`'s
 * `narrateFifteenStep` to decide; this file decides only how it reads.
 *
 * The one mark is the tile to slide, which is what the step decides: ringed,
 * in the roles of `engine/hint-words.ts`, though it is drawn filled. The words
 * that point at it are a reference to it.
 */

import { workingOn } from "../../engine/hint-text.ts";
import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
} from "../../engine/hint-words.ts";

/** A tile, by its number, wherever it sits. */
export const TILE: MarkKind<number> = { name: "tile", key: (t) => `${t}` };

const slid = (tile: number, words: string): Narration =>
  mark.as("ring", TILE, [tile], words);

export const say = {
  /** The goal tile lands in its solved cell. */
  goalHome: (goal: number): Narration =>
    phrase`${workingOn(goal)}slide ${slid(goal, "it")} into place.`,

  /** The goal tile slides nearer its home. */
  goalCloser: (goal: number): Narration =>
    phrase`${workingOn(goal)}slide ${slid(goal, "it")} closer.`,

  /** The goal tile slides without getting nearer: the solver is routing the
   * gap round it. */
  goalReposition: (goal: number): Narration =>
    phrase`${workingOn(goal)}reposition ${slid(goal, "it")}.`,

  /** Another tile, displaced earlier in the rotation, lands in its own home. */
  tileHome: (goal: number, tile: number): Narration =>
    phrase`${workingOn(goal)}slide ${slid(tile, `tile ${tile}`)} into place.`,

  /** Any other slide clears the way. */
  outOfWay: (goal: number, tile: number): Narration =>
    phrase`${workingOn(goal)}slide ${slid(tile, `tile ${tile}`)} out of the way.`,
};
