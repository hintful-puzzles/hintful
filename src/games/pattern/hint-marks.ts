/**
 * The marks Pattern's hint draws, as the engine's roles (`hint-words.ts`).
 *
 * A step reasons along one line, so the line and its clue are elements of their
 * own: the line is striped from its clue strip to its far end, and the clue's
 * numbers, redrawn in the action color, are evidence the sentence names ("this
 * row's run of 3"), so they are outlined whatever their glyph. Lines are numbered as the solver numbers them: columns `0..w-1`,
 * then rows `w..w+h-1`.
 */

import type { MarkKind } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** A row or column, clue strip included. */
export const LINE: MarkKind<number> = { name: "line", key: String };

/** A line's clue: the numbers beside it. */
export const CLUE: MarkKind<number> = { name: "clue", key: String };

export const cellAt = (i: number, w: number): Point => ({
  x: i % w,
  y: Math.floor(i / w),
});
