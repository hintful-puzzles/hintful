/**
 * What a square must be near: the one premise model under every Ascent hint
 * reading.
 *
 * A missing number `n` must be within `d` steps of number `m` when they are `d`
 * apart in the sequence. Where `m` stands is either a square on the board (it
 * is placed) or, in Edges mode, somewhere on its arrow's line. The run
 * techniques in [`hint.ts`](./hint.ts) read only the first kind, since a board
 * without arrows gives a missing number no line; the Edges techniques in
 * [`hint-edges.ts`](./hint-edges.ts) read both. A placed-only premise list
 * over a board without arrows is exactly straight reach.
 */

import type { AscentState } from "./state.ts";
import {
  CELL_NONE,
  fromNumberEdge,
  isBorderCell,
  isEdgeValid,
  isNumberEdge,
  NUMBER_EMPTY,
  stepDistance,
  updatePositions,
} from "./state.ts";

/** The shape of an arrow's line, as a sentence names it. */
export type LineKind = "row" | "column" | "diagonal";

/** Number `m`, `d` places from the number measured, placed at `cell`. */
export interface Placed {
  m: number;
  d: number;
  cell: number;
  arrow: null;
}

/** Number `m`, `d` places away and missing, somewhere on `arrow`'s line. */
export interface OnLine {
  m: number;
  d: number;
  cell: null;
  arrow: number;
}

/** What a number's square must be within `d` steps of. */
export type Premise = Placed | OnLine;

/** Where every number stands, where each has its arrow, and the empty squares. */
export interface Board {
  state: AscentState;
  positions: Int32Array;
  /** The border square holding each number's arrow, -1 when it has none. */
  arrows: Int32Array;
  empty: number[];
}

export function readBoard(state: AscentState): Board {
  const s = state.w * state.h;
  const positions = new Int32Array(s);
  updatePositions(positions, state.grid, s);
  const arrows = new Int32Array(state.last + 1).fill(-1);
  const empty: number[] = [];
  state.grid.forEach((v, i) => {
    if (isNumberEdge(v)) arrows[fromNumberEdge(v)] = i;
    else if (v === NUMBER_EMPTY) empty.push(i);
  });
  return { state, positions, arrows, empty };
}

/** The squares inside the border along the line `arrow` points. */
export function lineSquares(state: AscentState, arrow: number): number[] {
  const { w, h } = state;
  const out: number[] = [];
  for (let i = 0; i < w * h; i++)
    if (!isBorderCell(i, w, h) && isEdgeValid(arrow, i, w, h)) out.push(i);
  return out;
}

export function lineKind(state: AscentState, arrow: number): LineKind {
  const { w, h } = state;
  const r = Math.trunc(arrow / w);
  const c = arrow % w;
  if (r > 0 && r < h - 1) return "row";
  if (c > 0 && c < w - 1) return "column";
  return "diagonal";
}

/**
 * Every premise on `n`, below it first: walking the sequence away from `n` on
 * each side, each missing number with an arrow, up to and including the first
 * placed number.
 */
export function premisesOf(b: Board, n: number): Premise[] {
  const out: Premise[] = [];
  const { last } = b.state;
  for (const dir of [-1, 1]) {
    for (let m = n + dir, d = 1; m >= 0 && m <= last; m += dir, d++) {
      const cell = b.positions[m];
      if (cell !== CELL_NONE) {
        out.push({ m, d, cell, arrow: null });
        break;
      }
      if (b.arrows[m] >= 0) out.push({ m, d, cell: null, arrow: b.arrows[m] });
    }
  }
  return out;
}

/** Whether `sq` satisfies `p`: within `p.d` steps of its square, or of an
 * empty square on its line. */
export function allows(b: Board, p: Premise, sq: number): boolean {
  const { w, h, mode } = b.state;
  if (p.cell !== null) return stepDistance(sq, p.cell, w, mode) <= p.d;
  return b.empty.some(
    (e) => isEdgeValid(p.arrow, e, w, h) && stepDistance(sq, e, w, mode) <= p.d,
  );
}

/** The empty squares on `arrow`'s line, or all of them when `arrow` is -1. */
export function squaresOnLine(b: Board, arrow: number): number[] {
  if (arrow < 0) return b.empty;
  const { w, h } = b.state;
  return b.empty.filter((e) => isEdgeValid(arrow, e, w, h));
}

/**
 * The empty squares on `arrow`'s line (any, when it is -1) that satisfy every
 * premise: a step's reasons restated from the board alone, so a test can check
 * they single out the square it fills.
 */
export function squaresMeeting(
  b: Board,
  arrow: number,
  premises: readonly Premise[],
): number[] {
  return squaresOnLine(b, arrow).filter((sq) =>
    premises.every((p) => allows(b, p, sq)),
  );
}
