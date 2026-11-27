/**
 * A selection on a board of numbers (`play.select`): a drag from the
 * selected cell selects a shape of cells, and a value typed goes into every
 * one of them as one move, as a typed cell takes it (upstream Group's
 * diagonal multifill). A given in the shape that already holds the value is
 * passed over, and one holding another refuses the value.
 */

import type { CandidateMove } from "../hint/candidate-hint.ts";
import type { FillBoard } from "./board.ts";
import type { SetCellsMove } from "./notes.ts";

/** A shape a drag selects, by the name a description gives it. */
export type SelectShape = "diagonal";

/** The cells of each shape from cell `(x0, y0)` to `(x1, y1)` of a board `w`
 * wide, the first first; none where the two make no such shape. */
const SHAPES: Readonly<
  Record<
    SelectShape,
    (x0: number, y0: number, x1: number, y1: number, w: number) => number[]
  >
> = {
  diagonal(x0, y0, x1, y1, w) {
    const n = Math.abs(x1 - x0);
    if (n === 0 || n !== Math.abs(y1 - y0)) return [];
    const dx = Math.sign(x1 - x0);
    const dy = Math.sign(y1 - y0);
    return Array.from({ length: n + 1 }, (_, i) => (y0 + i * dy) * w + x0 + i * dx);
  },
};

/** The cells `shape` selects from cell `from` to the cell the pointer is over,
 * `to`, on a board `w` wide: none where the pointer is off the board or makes
 * no such shape, the selection then being `from`'s cell alone. */
export function selectedCells(
  shape: SelectShape,
  w: number,
  from: number,
  to: number | null,
): number[] {
  if (to === null) return [];
  return SHAPES[shape](from % w, Math.floor(from / w), to % w, Math.floor(to / w), w);
}

/** The cells a value typed at cell `c` goes into: the selection, where it
 * is `c`'s, or `c` alone. */
export const typedCells = (c: number, selected?: readonly number[]): number[] =>
  selected !== undefined && selected.length > 1 && selected[0] === c
    ? [...selected]
    : [c];

/**
 * The move value `n` typed into `cells`, several of them, makes, `null`
 * where it is refused or `"same"` where it would change nothing: in
 * notes mode (`pencil`, `n > 0`) the note put on each open cell lacking it,
 * or taken off each where every one holds it; otherwise the value placed on
 * each open cell, and a given holding it passed over. A given holding
 * another value, a cell that cannot hold `n`, or a note on a filled cell
 * refuses it.
 */
export function selectionMove<C>(
  b: FillBoard<C>,
  cells: readonly number[],
  n: number,
  pencil: boolean,
  autoElim: boolean,
  holds: (c: number) => boolean,
): CandidateMove | SetCellsMove | "same" | null {
  if (n > 0 && !cells.every((c) => (b.fixed[c] && !pencil) || holds(c))) return null;
  const at = (c: number) => ({ x: c % b.w, y: Math.floor(c / b.w), n });
  if (pencil && n > 0) {
    if (cells.some((c) => b.fixed[c] || b.values[c] !== 0)) return null;
    const noted = (c: number) => ((b.pencil?.[c] ?? 0) & (1 << n)) !== 0;
    return cells.every(noted)
      ? { type: "pencilStrike", marks: cells.map(at) }
      : { type: "pencilAdd", marks: cells.filter((c) => !noted(c)).map(at) };
  }
  if (cells.some((c) => b.fixed[c] && b.values[c] !== n)) return null;
  const open = cells.filter((c) => !b.fixed[c]);
  if (open.every((c) => b.values[c] === n && (b.pencil?.[c] ?? 0) === 0)) return "same";
  return { type: "setCells", cells: open, n, ...(n > 0 ? { autoElim } : {}) };
}
