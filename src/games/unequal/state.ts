/**
 * Unequal's own: its clue, a greater-than sign between two cells, flagged at
 * its greater end, and its params. The board, its codec and the moves are the
 * shared edge-clue Latin square's (`engine/edge-clue-latin/state.ts`).
 */

import { noSuchTier } from "../../engine/difficulty.ts";
import {
  type ClueKind,
  DIFF_NAMES,
  DIFF_RECURSIVE,
  DIFF_SET,
  type Difficulty,
  decodeParams as decodeEdgeClueParams,
  diffToLevel,
  type EdgeClueParams,
  F_ADJ_DOWN,
  F_ADJ_LEFT,
  F_ADJ_RIGHT,
  F_ADJ_UP,
} from "../../engine/edge-clue-latin/state.ts";
import type { PresetBoards } from "../../engine/game.ts";
import { drawSigns } from "./render.ts";
import { signLadder } from "./solver.ts";

/** A sign: the cell it is flagged at holds the greater number. */
export const SIGNS: ClueKind = {
  game: "unequal",
  holds: (a, b) => a > b,
  complete: false,
  bothEnds: false,
  ladder: signLadder,
  drawClues: drawSigns,
  glyph: (flags, o, x, y, side) => {
    const i = y * o + x;
    if (side === "right") {
      if (flags[i] & F_ADJ_RIGHT) return ">";
      return flags[i + 1] & F_ADJ_LEFT ? "<" : " ";
    }
    if (flags[i] & F_ADJ_DOWN) return "v";
    return flags[i + o] & F_ADJ_UP ? "^" : " ";
  },
};

/**
 * A small board at the lower tiers and a large one at the upper. Every cell
 * deals in a fraction of a second: 6x6 is left to the Custom dialog only to
 * keep the menu short.
 */
export const menu: PresetBoards<EdgeClueParams> = {
  boards: [
    { order: 4, diff: "trivial" },
    { order: 5, diff: "trivial" },
    { order: 7, diff: "trivial" },
  ],
  tiers: ({ order }) => {
    const span = (first: Difficulty, last: Difficulty) =>
      [diffToLevel(first), diffToLevel(last)] as const;
    if (order === 4) return span("trivial", "trivial");
    return order === 5 ? span("trivial", "extreme") : span("tricky", "recursive");
  },
};

export function defaultParams(): EdgeClueParams {
  return { order: 4, diff: "easy" };
}

export function decodeParams(s: string): EdgeClueParams {
  return decodeEdgeClueParams(s, defaultParams());
}

export function validateParams(p: EdgeClueParams, full: boolean): string | null {
  const level = diffToLevel(p.diff);
  // Measured 2026-10-05: of 400,000 boards the generator built at Tricky, the
  // tier below solved every one. A 3x3 at Hard needs a wing, and of 400,000
  // built at Unreasonable the wing solved every one (2026-10-28).
  if (full && p.order === 3 && (level === DIFF_SET || level === DIFF_RECURSIVE))
    return noSuchTier("3x3 puzzle", DIFF_NAMES[level]);
  return null;
}
