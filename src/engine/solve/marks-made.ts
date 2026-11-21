/**
 * The kinds of mark a fact changes, each the index of the marks' count of
 * the facts that changed it (`Marks.made`): the values placed, the
 * candidates (which a placement narrows too), the mark on the edges or
 * angles, the mark naming an element a cell, and the relation over the
 * edges. A module of its own because the compiler, which runs with its
 * types stripped, writes the indices into the code it compiles.
 */
export const MADE = {
  value: 0,
  cand: 1,
  edgeMark: 2,
  cellMark: 3,
  relation: 4,
} as const;
