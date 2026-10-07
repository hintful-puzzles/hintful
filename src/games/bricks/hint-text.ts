/**
 * Every sentence Bricks' hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads: premise, contradiction,
 * conclusion in the necessity voice, naming the clue value when a clue is the
 * evidence.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the cell the step decides is ringed, and the cells
 * it reasons from (the reason's cells minus the target) are outlined, so a
 * sentence is written against what the player can see. The relations asserted
 * below are the ones the solver guarantees, checked against a sweep of ~55k
 * deductions over ~4,800 partial positions of the fixture boards: `shadeRun`
 * never leaves the target's row and is contiguous through it (so the target
 * *does* sit next to the outlined bricks, for runs of 3, 4 and 5 alike);
 * `classify*Trial` only ever names a clue found by walking `BRICKS_STEPS` from
 * the target (so it really is beside this cell); and `below`/`above` are the
 * brick-wall supports one row down/up.
 */

import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

const thisCell = (target: Point): Narration =>
  mark.this("ring", CELL, [target], "cell");

const outlined = (cells: readonly Point[], words: string): Narration =>
  mark.as("outline", CELL, cells, words);

const stayClear = phrase`it must stay clear`;
const beShaded = phrase`it must be shaded`;

export const say = {
  three: (target: Point, evidence: readonly Point[]): Sentence =>
    so({
      look: phrase`Shading ${thisCell(target)}, next to ${mark.the("outline", CELL, evidence, "shaded brick")}, would make three in a row`,
      move: stayClear,
    }),

  // An outlined cell below is an unshaded brick *or a clue* —
  // `validateGravity` masks a clue down to no color, so a clue supports
  // nothing. "Isn't a shaded brick" therefore says it better than "is not
  // shaded", which reads as a mark the player could go and place. An *empty*
  // cell below does not trigger the rule at all, so this branch never claims
  // anything about one. The brick-wall corners can leave a cell with only one
  // support, or — at the padded triangles — none to outline, hence three arms.
  unsupported: (target: Point, evidence: readonly Point[]): Sentence =>
    so({
      look:
        evidence.length === 0
          ? phrase`Shading ${thisCell(target)} would leave it with no shaded brick beneath it to rest on`
          : evidence.length === 1
            ? phrase`${mark.the("outline", CELL, evidence, "cell")} below ${thisCell(target)} is all it could rest on, and it isn't a shaded brick`
            : phrase`${mark.the("outline", CELL, evidence, "cell")} below ${thisCell(target)} are all it could rest on, and neither is a shaded brick`,
      move: stayClear,
    }),

  // "More than its 0 shaded neighbors" is nonsense: a 0 allows none at all
  // (docs/games/hints.md § "Sanity-read at the degenerate extremes").
  /** Shading the target over-fills the outlined clue `n`. */
  overcount: (target: Point, clue: Point, n: number): Sentence =>
    so({
      look:
        n === 0
          ? phrase`${outlined([clue], "The outlined 0")} beside ${thisCell(target)} allows no shaded neighbors at all`
          : phrase`Shading ${thisCell(target)} would give ${outlined([clue], `the outlined ${n}`)} beside it more than its ${n} shaded neighbor${n === 1 ? "" : "s"}`,
      move: stayClear,
    }),

  strandSupport: (target: Point, above: Point): Sentence =>
    so({
      look: phrase`${outlined([above], "The outlined shaded brick above")} rests only on ${thisCell(target)}; clearing it would strand that brick`,
      move: beShaded,
    }),

  /** Clearing the target leaves the outlined clue `n` unreachable. */
  undercount: (target: Point, clue: Point, n: number): Sentence =>
    so({
      look: phrase`${outlined([clue], `The outlined ${n}`)} beside ${thisCell(target)} can't reach ${n} shaded neighbor${n === 1 ? "" : "s"} without it`,
      move: beShaded,
    }),
};
