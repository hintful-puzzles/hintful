/**
 * A player's divider between two lines of a square board (`play.dividers`),
 * drawn as a wall across the board: on a board whose rows and columns stand
 * for the same things (upstream Group's elements), one divider rules the gap
 * between two rows and the gap between the same two columns. The board keeps,
 * for each line `a`, the line `b` its divider waits for, `-1` where it has
 * none, and draws it while `b` follows `a`. A press in the margin of line
 * labels between two labels toggles the divider there, and `|` and `-` the
 * one after the cursor's column or row.
 */

import type { Point } from "../contract/types.ts";
import { BOTTOM, LEFT, RIGHT, TOP } from "../render/region-walls.ts";
import type { FillBoard } from "./board.ts";

/** Toggles the divider after line `a`, which waits for line `b`. */
export interface DividerMove {
  readonly type: "divider";
  readonly a: number;
  readonly b: number;
}

/** `|`: the divider after the cursor's column. */
export const KEY_BAR = 0x7c;
/** `-`: the divider after the cursor's row. */
export const KEY_MINUS = 0x2d;

/** Whether `move` has a divider move's shape, as a save holds it. */
export function isDividerShaped(move: unknown): move is DividerMove {
  if (typeof move !== "object" || move === null) return false;
  const m = move as Partial<Record<keyof DividerMove, unknown>>;
  return m.type === "divider" && Number.isInteger(m.a) && Number.isInteger(m.b);
}

/** The board after `move`: its divider set where it was not, and taken away
 * where it was. A board that keeps none, or a line it lacks, was not built by
 * the engine, and throws. */
export function applyDivider<C>(board: FillBoard<C>, move: DividerMove): FillBoard<C> {
  const { dividers } = board;
  const lines = dividers?.length ?? 0;
  if (dividers === null || [move.a, move.b].some((l) => l < 0 || l >= lines))
    throw new Error(`divider: no lines ${move.a} and ${move.b}`);
  const next = dividers.slice();
  next[move.a] = next[move.a] === move.b ? -1 : move.b;
  return { ...board, dividers: next };
}

/** The line drawn after line `a`: the next, since a board in an order is
 * drawn and pressed as its view, each line at its place (`order.ts`). */
const following = (a: number): number => a + 1;

/** Whether a divider is drawn after line `a` of `board`. */
const ruledAfter = <C>(board: FillBoard<C>, a: number): boolean =>
  a >= 0 && board.dividers !== null && board.dividers[a] === following(a);

/** The divider move for the gap after line `a`, of a board `n` lines across. */
const gapAfter = (a: number, n: number): DividerMove | null =>
  a < 0 || a + 1 >= n ? null : { type: "divider", a, b: following(a) };

/** The sides of cell `(x, y)` a divider runs along, as `regionWalls` numbers
 * a wall's. */
export function dividerSides<C>(board: FillBoard<C>, x: number, y: number): number {
  if (board.dividers === null) return 0;
  return (
    (ruledAfter(board, y - 1) ? TOP : 0) |
    (ruledAfter(board, x - 1) ? LEFT : 0) |
    (ruledAfter(board, y) ? BOTTOM : 0) |
    (ruledAfter(board, x) ? RIGHT : 0)
  );
}

/** The divider move a press at `p` makes on a board whose first cell lies
 * `origin` in from the canvas's top and left, a cell every `pitch`: in the
 * margin of labels before the columns' or the rows' start, the gap between
 * two labels nearest the press, as upstream Group's; `null` elsewhere. */
export function dividerAt<C>(
  board: FillBoard<C>,
  origin: number,
  pitch: number,
  p: Point,
): DividerMove | null {
  const across = (v: number, n: number) => v >= origin && v < origin + n * pitch;
  const nearest = (v: number) => Math.round((v - origin) / pitch) - 1;
  if (p.y < origin && across(p.x, board.w)) return gapAfter(nearest(p.x), board.w);
  if (p.x < origin && across(p.y, board.h)) return gapAfter(nearest(p.y), board.h);
  return null;
}

/** The divider move key `button` makes from the cursor at `cursor`: `|` the
 * one after its column, `-` after its row; `null` for any other key, or past
 * the last line. */
export function dividerKeyed<C>(
  board: FillBoard<C>,
  cursor: Point,
  button: number,
): DividerMove | null {
  if (button === KEY_BAR) return gapAfter(cursor.x, board.w);
  if (button === KEY_MINUS) return gapAfter(cursor.y, board.h);
  return null;
}
