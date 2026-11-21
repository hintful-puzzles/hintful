/**
 * Adjacent's own: its clue, a bar between two cells whose numbers differ by
 * exactly one, every such bar dealt, and its params. The board, its codec and
 * the moves are the shared edge-clue Latin square's
 * (`engine/edge-clue-latin/state.ts`).
 */

import type { PresetBoards } from "../../engine/contract/game.ts";
import {
  type ClueKind,
  DIFF_TRICKY,
  type Difficulty,
  diffToLevel,
  type EdgeClueParams,
  edgeClueParams,
  F_ADJ_DOWN,
  F_ADJ_RIGHT,
} from "../../engine/edge-clue-latin/state.ts";
import { unusedLetter } from "../../engine/game-id/params-codec.ts";
import * as adjacent from "../../generated/games/adjacent/adjacent.compiled.ts";
import { drawBars } from "./render.ts";
import { barAnswer, barLadder } from "./solver.ts";

/** A bar: its two numbers differ by one. Every bar is dealt, so two
 * neighbors without one never do, and a bar is flagged from both its cells. */
export const BARS: ClueKind = {
  game: "adjacent",
  noun: "bar",
  holds: (a, b) => Math.abs(a - b) === 1,
  complete: true,
  bothEnds: true,
  ladder: barLadder,
  isAnswer: barAnswer,
  drawClues: drawBars,
  glyph: (flags, o, x, y, side) => {
    const i = y * o + x;
    if (side === "right") return flags[i] & F_ADJ_RIGHT ? "|" : " ";
    return flags[i] & F_ADJ_DOWN ? "-" : " ";
  },
};

/**
 * A small board at the lower tiers and a large one at the upper. Every cell
 * deals in a fraction of a second: 6x6 is left to the Custom dialog only to
 * keep the menu short.
 */
export const menu: PresetBoards<EdgeClueParams> = {
  boards: [
    { order: 5, diff: "trivial" },
    { order: 7, diff: "trivial" },
  ],
  tiers: ({ order }) => {
    const span = (first: Difficulty, last: Difficulty) =>
      [diffToLevel(first), diffToLevel(last)] as const;
    return order === 5 ? span("trivial", "extreme") : span("tricky", "recursive");
  },
};

/** 5x5 Normal: below 5, a board has no tier above Normal. */
export function defaultParams(): EdgeClueParams {
  return { order: 5, diff: "easy" };
}

export const { paramConfig, encodeParams, decodeParams } = edgeClueParams({
  tiers: adjacent.tiers,
  sizeDoc:
    "Width and height of the grid, which is also the largest number in it. Above 9, the numbers are written 0 to 9 and then A, B, C and so on, so each still takes one character. Tricky or above needs a size of at least 5.",
  defaults: defaultParams,
  // Upstream deals Adjacent as a mode of Unequal, writing an `a` after the
  // order, so its game IDs still open.
  afterOrder: [unusedLetter("a")],
});

export function validateParams(p: EdgeClueParams, _full: boolean): string | null {
  if (p.order < 5 && diffToLevel(p.diff) >= DIFF_TRICKY)
    return "Size must be at least 5 for puzzles of this difficulty.";
  return null;
}
