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

import { CELL, mark, type Narration, phrase } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { CellColor } from "./state.ts";

const thisCell = (target: Point): Narration =>
  mark.this("ring", CELL, [target], "cell");

const outlined = (cells: readonly Point[], words: string): Narration =>
  mark.as("outline", CELL, cells, words);

export const say = {
  three: (target: Point, evidence: readonly Point[]): Narration =>
    phrase`Shading ${thisCell(target)}, next to ${mark.the("outline", CELL, evidence, "shaded brick")}, would make three in a row, so it must stay clear.`,

  // An outlined cell below is an unshaded brick *or a clue* —
  // `validateGravity` masks a clue down to no color, so a clue supports
  // nothing. "Isn't a shaded brick" therefore says it better than "is not
  // shaded", which reads as a mark the player could go and place. An *empty*
  // cell below does not trigger the rule at all, so this branch never claims
  // anything about one. The brick-wall corners can leave a cell with only one
  // support, or — at the padded triangles — none to outline, hence three arms.
  unsupported: (target: Point, evidence: readonly Point[]): Narration =>
    evidence.length === 0
      ? phrase`Shading ${thisCell(target)} would leave it with no shaded brick beneath it to rest on, so it must stay clear.`
      : evidence.length === 1
        ? phrase`${mark.the("outline", CELL, evidence, "cell").capitalized()} below ${thisCell(target)} is all it could rest on, and it isn't a shaded brick, so it must stay clear.`
        : phrase`${mark.the("outline", CELL, evidence, "cell").capitalized()} below ${thisCell(target)} are all it could rest on, and neither is a shaded brick, so it must stay clear.`,

  // "More than its 0 shaded neighbors" is nonsense: a 0 allows none at all
  // (docs/games/hints.md § "Sanity-read at the degenerate extremes").
  /** Shading the target over-fills the outlined clue `n`. */
  overcount: (target: Point, clue: Point, n: number): Narration =>
    n === 0
      ? phrase`${outlined([clue], "The outlined 0")} beside ${thisCell(target)} allows no shaded neighbors at all, so it must stay clear.`
      : phrase`Shading ${thisCell(target)} would give ${outlined([clue], `the outlined ${n}`)} beside it more than its ${n} shaded neighbor${n === 1 ? "" : "s"}, so it must stay clear.`,

  strandSupport: (target: Point, above: Point): Narration =>
    phrase`${outlined([above], "The outlined shaded brick above")} rests only on ${thisCell(target)}; clearing it would strand that brick, so it must be shaded.`,

  /** Clearing the target leaves the outlined clue `n` unreachable. */
  undercount: (target: Point, clue: Point, n: number): Narration =>
    phrase`${outlined([clue], `The outlined ${n}`)} beside ${thisCell(target)} can't reach ${n} shaded neighbor${n === 1 ? "" : "s"} without it, so it must be shaded.`,

  // The direct rung's *unclassified* case: one color placed, one validator
  // call, the board breaks — but at a cell none of the four named arms
  // above matched. Nothing is followed: the break is right there, outlined.
  //
  // This is the one arm with **no** guaranteed relation — `errorCells`
  // reports wherever the validator flagged the break, which need not be
  // near the target — so the sentence says only where the break is. (The
  // sweep above never reached this arm at all: the four named reasons
  // classify every single-cell contradiction Bricks' validator can raise. It
  // stays because a classifier's default must.)
  /** The opposite of `forced` breaks the board at the `evidence` cells. */
  localBreak: (
    target: Point,
    forced: CellColor,
    evidence: readonly Point[],
  ): Narration => {
    const act = forced === "unshade" ? "Shading" : "Clearing";
    const end = forced === "unshade" ? "stay clear" : "be shaded";
    return evidence.length === 0
      ? phrase`${act} ${thisCell(target)} would break the board, so it must ${end}.`
      : phrase`${act} ${thisCell(target)} would break the board at ${mark.the("outline", CELL, evidence, "cell")}, so it must ${end}.`;
  },
};
