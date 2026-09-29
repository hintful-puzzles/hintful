/**
 * Every sentence Filling's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads. Kept terse and
 * number-light: the value is read off "the striped region of N" (or "a 1"), so
 * the target cells need no digit drawn in them. Every word that points at the
 * board is a reference to the mark it points at (`engine/hint-words.ts`): the
 * squares the step fills are ringed, the region the sentence is about is
 * striped, and the neighbors a lonely or eliminated square is pinned by are
 * outlined.
 */

import { CELL, mark, type Narration, phrase, whole } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** The cells a step marks: the ones it fills, the region it names (empty when
 * it names none) and the neighbors it reasons from (empty when none). */
export interface Marked {
  cells: readonly Point[];
  region: readonly Point[];
  evidence: readonly Point[];
}

const region = (m: Marked, n: number): Narration =>
  mark.the("stripes", whole(CELL), m.region, `region of ${n}`).capitalized();

export const say = {
  /** The region of `n` needs the ringed squares; `exact` when they complete
   * it. */
  growth: (n: number, exact: boolean, m: Marked): Narration =>
    exact
      ? phrase`${region(m, n)} fits exactly into ${mark.this("ring", CELL, m.cells, ["last square", "squares"])}.`
      : phrase`${region(m, n)} can't fully grow without ${mark.this("ring", CELL, m.cells, "square")}.`,

  blocked: (n: number, m: Marked): Narration =>
    phrase`${region(m, n)} has only ${mark.this("ring", CELL, m.cells, ["one empty square", "empty squares"])} to grow into.`,

  lonely: (m: Marked): Narration =>
    m.evidence.length > 0
      ? phrase`The region of ${mark.the("outline", CELL, m.evidence, "neighbor", "each")} can't grow to include ${mark.this("ring", CELL, m.cells, "square")}, so it can only be a 1.`
      : phrase`No neighboring region can grow to include ${mark.this("ring", CELL, m.cells, "square")}, so it can only be a 1.`,

  // "be N", not "be a N": the article trap ("a 8").
  bitmap: (n: number, m: Marked): Narration =>
    m.evidence.length > 0
      ? phrase`Every other number in ${mark.this("ring", CELL, m.cells, "square")} would match ${mark.as("outline", CELL, m.evidence, "an outlined neighbor")} or leave a region short of its size, so it must be ${n}.`
      : phrase`Every other number in ${mark.this("ring", CELL, m.cells, "square")} would touch an equal number or leave a region short of its size, so it must be ${n}.`,
};
