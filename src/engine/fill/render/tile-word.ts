/**
 * The four words a fill board's tile is keyed by, each bit at a fixed
 * position: a layer's bits are allocated here, never at run time, so a
 * change to what a tile shows is a change to this file's shape.
 */

import type { Rect } from "../../contract/types.ts";

// --- the tile's word: the value in the low byte, the layers above ----------
/** The cell was dealt its value: an undecided cell's surface is lifted under
 * it. */
export const FIXED = 1 << 8;
/** A rule breaks at the cell: its piece is drawn in error. */
export const ERR_AT = 1 << 9;
/** Two cells break a rule together across a side or a corner: one bit each,
 * clockwise from the top left corner. */
export const DIAMOND_SHIFT = 10;
export const MISTAKE = 1 << 18;
export const CURSOR = 1 << 19;
/** `L` has armed a link from the cursor's cell. */
export const ARMED = 1 << 20;
export const TONE_SHIFT = 21;
/** The links from this cell, a bit a direction (up, right, down, left). */
export const LINK_SHIFT = 23;
/** The links from this cell found to be mistakes. */
export const BAD_LINK_SHIFT = 27;

// --- the note word: a cell's notes, bit `v` a value's ----------------------
/** The selection on the cell takes notes: bit 0, which no value's note is. */
export const NOTES_MODE = 1;

// --- the hint's word -------------------------------------------------------
// The ring and outline sides (`MarkOutlines.packed`) in the low byte.
/** The cell lies on the line a step stripes. */
export const HINT_LINE = 1 << 8;
/** The link a step asks for from this cell, or on an answer on the edges the
 * edge it asks a value of on this side, a bit a direction: the ring round it
 * lies over the tile, which repaints when it moves. */
export const HINT_LINK_SHIFT = 9;
/** The sides of the outline of a number's cells a step reasons from, its
 * block, which lies inside the tile: each number's whole, so two that
 * overlap read as two blocks. */
export const BLOCK_SHIFT = 13;
/** The number on the cell is one a step reasons from: circled. */
export const HINT_NUMBER = 1 << 17;

// --- the line word: a rule broken along a line -----------------------------
/** A run the rules forbid passes through the cell: a bar along it, which
 * reaches half a tile toward each of its ends, a bit a direction (up, right,
 * down, left). */
export const RUN_SHIFT = 0;
/** The cell's row, or its column, is one of two or more the rules forbid
 * together: a bar across the whole line. */
export const ACROSS_ROW = 1 << 4;
export const ACROSS_COLUMN = 1 << 5;
/** The number on the cell is done: its cells are all decided, and agree. */
export const NUMBER_DONE = 1 << 6;
/** The number on the cell is broken: its cells can no longer agree. */
export const NUMBER_BROKEN = 1 << 7;
/** The side of a joining piece its other half is on (`JOIN_*`, `piece.ts`). */
export const JOIN_SHIFT = 8;
/** The cell is washed (`play.wash`): its surface takes the wash. */
export const WASHED = 1 << 12;
/** The cell is washed and the preference leaves its secondary piece out. */
export const WASH_HIDES = 1 << 13;
/** The cell's piece covers its number (`play.covers`) and the preference shows
 * it: it is drawn smaller, the piece staying what the cell holds. */
export const NUMBER_UNDER = 1 << 14;
/** The cell's running piece runs on, which way the board does not yet say
 * (`JOINED_OPEN`). */
export const SHAPE_OPEN = 1 << 15;
/** The clue at a part drawn on the cell, its part's first, broken; and
 * marked done by the player. */
export const LABEL_BROKEN = 1 << 16;
export const LABEL_DONE = 1 << 17;
/** On a board drawn raised (`play.numbers.raised`) in 3D: the board is, and
 * the cell's value is raised. */
export const THREE_D = 1 << 18;
export const RAISED = 1 << 19;
/** On a board with an empty square (`play.numbers.empty`): the cell is in a
 * ball, the clue's where `BALL_GIVEN`, else the player's (its notes lack the
 * empty square); and its notes are every other value, which the ball says
 * and none is drawn. */
export const BALL = 1 << 20;
export const BALL_GIVEN = 1 << 21;
export const BALL_BARE = 1 << 22;

// --- the edge word: on an answer on the edges, the tile's four sides --------
/** Side `d`'s value (up, right, down, left), {@link EDGE_VALUE_BITS} a side
 * from bit 0, 0 where the edge is open or the tile's side is the board's
 * rim. */
export const EDGE_VALUE_BITS = 2;
/** A rule breaks at side `d`'s edge: its mark is drawn in error. */
export const EDGE_ERR_SHIFT = 8;
/** Check & Save found side `d`'s edge wrong. */
export const EDGE_MISTAKE_SHIFT = 12;
/** The half-grid cursor (`edge-target.ts`) rests on side `d`'s edge. */
export const EDGE_CURSOR_SHIFT = 16;
/** The cursor rests on corner `k` of the tile, clockwise from the top left;
 * on its middle, the tile's word says so (`CURSOR`). */
export const CORNER_CURSOR_SHIFT = 20;

/** A cell's walls and fill, its inset partition's walls (`-1` where the
 * board has none) and the diagonals through it: what a board never
 * changes, so no tile's key holds it. */
export type CellPart = {
  readonly walls: number;
  readonly fill: number;
  readonly inset: number;
  readonly diagonal: number;
};

/** What a cell's tile is drawn from this frame, and whether it changed. */
export type TileWords = {
  readonly k: number;
  readonly hk: number;
  readonly lk: number;
  readonly nk: number;
  /** The edge word, 0 on an answer on the cells. */
  readonly ek: number;
  readonly n: number;
  readonly part: CellPart | null;
  readonly label: string | null;
  readonly anim: { readonly from: number; readonly frac: number } | null;
  readonly changed: boolean;
};

/** A raised value drawn over another tile than its own: its tile and its
 * words. */
export type RaisedAt = {
  readonly tile: Rect;
  readonly word: number;
  readonly hintWord: number;
  readonly noteWord: number;
};

/** The step to each of a cell's four sides, up, right, down, left. */
export const DIRS: readonly (readonly [number, number])[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/** The direction from cell `a` to its orthogonal neighbor `b`, or `-1`. */
export function dirTo(w: number, a: number, b: number): number {
  const dx = (b % w) - (a % w);
  const dy = Math.floor(b / w) - Math.floor(a / w);
  return DIRS.findIndex(([x, y]) => x === dx && y === dy);
}
