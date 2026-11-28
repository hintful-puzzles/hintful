/**
 * A fill game's edit: values set on cells and marks set on cells, in flat
 * lists so a save holds it as it is. Every move of a board of buttons is one,
 * and Solve, Clear and Reveal are on every board; a board of numbers types
 * and takes notes by the note-taking cell's moves too (`notes.ts`).
 */

import { rejectMove } from "../contract/assert-never.ts";
import type { Partition } from "../solve/describe-runtime.ts";
import { type FillBoard, type FillModule, spaceOf } from "./board.ts";

export interface Edit {
  /** Cell, value, cell, value, ...: 0 empties the cell. */
  readonly set?: readonly number[];
  /** Cell, element, ...: the element the cell's mark names, `-1` to clear
   * it. */
  readonly mark?: readonly number[];
}

/**
 * `move` as an edit, or refused as `context`'s: a move from a save is read
 * back as whatever it was written as, and one with a field an edit lacks, or
 * a list that is not one of numbers, came from no build of this game.
 */
export function editOf(move: unknown, context: string): Edit {
  if (!isEdit(move)) rejectMove(move, context);
  return move;
}

function isEdit(move: unknown): move is Edit {
  return (
    typeof move === "object" &&
    move !== null &&
    Object.entries(move).every(
      ([k, v]) =>
        (k === "set" || k === "mark") &&
        Array.isArray(v) &&
        v.length % 2 === 0 &&
        v.every((x) => typeof x === "number"),
    )
  );
}

/** The parts a board's module plays whole (`play.whole`), each cell's part
 * and what its other squares take, or `null` where it plays none. */
function wholeOf<C>(
  module: FillModule<C>,
  board: FillBoard<C>,
): (Pick<Partition, "cells" | "of"> & { others(d: number): number }) | null {
  const part = module.play?.whole?.part;
  const others = module.wholeOthers;
  if (part === undefined || others === undefined) return null;
  const { cells, of } = board.dealt[part as keyof C] as unknown as Partition;
  return { cells, of, others };
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
  // A value placed on a cell takes the place of its notes.
  const pencil = board.pencil?.slice() ?? null;
  const put = (c: number, v: number) => {
    values[c] = v;
    if (pencil !== null && v !== 0) pencil[c] = 0;
  };
  const whole = wholeOf(module, board);
  for (let i = 0; i < set.length; i += 2) {
    const c = cellOf(set[i]);
    if (board.fixed[c]) throw new Error(`edit: cell ${c} is fixed`);
    const v = set[i + 1];
    put(c, v);
    if (whole === null) continue;
    for (const p of whole.cells[whole.of[c]] ?? [])
      if (p !== c && !board.fixed[p]) put(p, v === 0 ? 0 : whole.others(v));
  }
  const marks = edit.mark ?? [];
  for (let i = 0; i < marks.length; i += 2) mark[cellOf(marks[i])] = marks[i + 1];
  const { markWhile } = module;
  if (markWhile !== undefined) {
    const sp = spaceOf(module, board);
    for (let c = 0; c < n; c++)
      if (mark[c] >= 0 && !markWhile(values, sp, board.dealt, c)) mark[c] = -1;
  }
  return { ...board, values, mark, pencil };
}
