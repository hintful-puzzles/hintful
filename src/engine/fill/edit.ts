/**
 * The one move of a fill game: values set on cells and marks set on cells,
 * in flat lists so a save holds it as it is. Solve is an edit too.
 */

import { type FillBoard, type FillModule, spaceOf } from "./board.ts";

export interface Edit {
  /** Cell, value, cell, value, ...: 0 empties the cell. */
  readonly set?: readonly number[];
  /** Cell, element, ...: the element the cell's mark names, `-1` to clear
   * it. */
  readonly mark?: readonly number[];
}

/**
 * The board after `edit`: its values, then its marks, then every mark whose
 * `while` the new values break dropped. A fixed cell, a cell off the board
 * or a mark on one breaks the edit, which throws: an edit the engine builds
 * never does, so one that does was not built by it.
 */
export function applyEdit<C>(
  module: FillModule<C>,
  board: FillBoard<C>,
  edit: Edit,
): FillBoard<C> {
  const n = board.values.length;
  const values = board.values.slice();
  const mark = board.mark.slice();
  const cellOf = (c: number): number => {
    if (!Number.isInteger(c) || c < 0 || c >= n) throw new Error(`edit: no cell ${c}`);
    return c;
  };
  const set = edit.set ?? [];
  for (let i = 0; i < set.length; i += 2) {
    const c = cellOf(set[i]);
    if (board.fixed[c]) throw new Error(`edit: cell ${c} is fixed`);
    values[c] = set[i + 1];
  }
  const marks = edit.mark ?? [];
  for (let i = 0; i < marks.length; i += 2) mark[cellOf(marks[i])] = marks[i + 1];
  const { markWhile } = module;
  if (markWhile !== undefined) {
    const sp = spaceOf(module, board);
    for (let c = 0; c < n; c++)
      if (mark[c] >= 0 && !markWhile(values, sp, board.dealt, c)) mark[c] = -1;
  }
  return { ...board, values, mark };
}
