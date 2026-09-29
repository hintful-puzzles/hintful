/**
 * Every sentence Range's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads. Every word that points at
 * the board is a reference to the mark it points at (`engine/hint-words.ts`):
 * the cell the step decides is ringed, the cells and the black square it
 * reasons from are outlined, the clue it counts from is redrawn in the action
 * color, and the run a `reach` sentence names is striped.
 *
 * **Every Range step shows a second mark**, so the sentence also ties the
 * ringed cell to it by the relation the rule guarantees, never a color name:
 *
 * - `satisfied` / `overrun` place the target at `1 + rl[RUN_WHITE][j]` steps
 *   from the clue — that is, the **first cell past the outlined run** in one of
 *   the clue's four directions (past the clue itself where the run is empty).
 * - `reach` stripes the whole path behind the target, so the target is the
 *   run's **far end**.
 * - `connect` outlines exactly the target's own non-black neighbors, so they
 *   are the cells **around it**.
 *
 * The clue is "this 5" rather than "clue 5" because a clue lies inside its own
 * line of sight, and that run can hold a second clue of the same value, so the
 * value alone does not say which (see `RangeHint.clue`).
 */

import {
  CELL,
  type MarkKind,
  mark,
  type Narration,
  phrase,
  pronoun,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** A clue's number, redrawn in the action color: an element apart from its
 * cell, whose outline is the line of sight's. */
export const CLUE: MarkKind<Point> = { name: "clue", key: (p) => `${p.x},${p.y}` };

/** What a step marks: the cell it decides, the cells and black squares it
 * reasons from, the run it names and the clue it counts from. */
export interface Marked {
  target: Point;
  area: readonly Point[];
  blacks: readonly Point[];
  run: readonly Point[];
  clue: Point | null;
}

const thisCell = (m: Marked): Narration => mark.this("ring", CELL, [m.target], "cell");
const theClue = (m: Marked, n: number): Narration =>
  mark.as("outline", CLUE, m.clue ? [m.clue] : [], `this ${n}`);

export const say = {
  adjacency: (m: Marked): Narration =>
    phrase`No two black squares may touch. ${thisCell(m).capitalized()} sits right next to ${mark.the("outline", CELL, m.blacks, "black square")}, so it must be white.`,

  // Read at the small extremes (docs/games/hints.md § "Sanity-read at the
  // degenerate extremes"): a 1 sees only its own cell, and "all 2 of" reads
  // wrong where "both" is the word — Salad's line counts say it the same way.
  /** The clue `n` already sees all its white cells. */
  satisfied: (m: Marked, n: number): Narration => {
    const seen =
      n === 1
        ? "its one white cell"
        : n === 2
          ? "both of its white cells"
          : `all ${n} of its white cells`;
    return phrase`${theClue(m, n).capitalized()} already sees ${mark.paren("outline", CELL, m.area, seen)}, so ${mark.as("ring", CELL, [m.target], `the cell just past ${pronoun(CELL, m.area)}`)} must be black.`;
  },

  overrun: (m: Marked, n: number): Narration =>
    phrase`${thisCell(m).capitalized()}, just past ${mark.the("outline", CELL, m.area, "cell")}, would let ${theClue(m, n)} see more than ${n} if white, so it must be black.`,

  reach: (m: Marked, n: number): Narration => {
    const along = phrase`along ${mark.the("stripes", whole(CELL), m.run, "run")} to ${mark.the("ring", CELL, [m.target], "cell")}, which must be white.`;
    return m.area.length > 0
      ? phrase`${theClue(m, n).capitalized()} needs more than ${mark.the("outline", CELL, m.area, "cell")}: it must see ${along}`
      : phrase`To see ${n}, ${theClue(m, n)} must see ${along}`;
  },

  // Both `ruleConnectedness` call sites record WHITE, so there is no
  // black-target sentence to write: a cut vertex of the white region is
  // forced *white*, never black.
  connect: (m: Marked): Narration =>
    phrase`Painting ${thisCell(m)} black would cut some of ${mark.the("outline", CELL, m.area, "cell")} around it off from the rest, so it must stay white.`,
};
