/**
 * Sticks' hint: the game's compiled ladder (`solver.ts`), walked from the
 * player's own lines and said a square at a time, the steps built by the
 * engine from what `sticks.description.yaml` says of a firing. Each step rules
 * one orientation out of a square, by the number it would break; a number that
 * rules out several squares says its reason once, and its later squares'
 * steps continue the first.
 */

import type { Point } from "../../engine/contract/types.ts";
import {
  describedFiringHint,
  type FiringHint,
} from "../../engine/described-firing-hint.ts";
import {
  SAYS_EACH,
  SAYS_LEGS,
  type SaysById,
  STATED,
} from "../../generated/games/sticks/sticks.compiled.ts";
import { hintWalk, type SticksRung } from "./solver.ts";
import {
  executeMove,
  F_HOR,
  F_VER,
  type SticksMove,
  type SticksState,
} from "./state.ts";

/** What the description reads a square as holding: a line across, or up and
 * down. */
const ACROSS = 1;
const DOWN = 2;

/** A square a step decides and the orientation it asks, as the description
 * reads it. */
export interface SticksTarget extends Point {
  value: number;
}

/** What a step decides: the square, with its orientation, which the render
 * draws as the bar the ring holds. */
export type SticksHint = FiringHint<SticksTarget>;

const described = describedFiringHint<
  SticksState,
  SticksMove,
  SticksTarget,
  SaysById,
  SticksRung,
  SticksHint
>({
  name: "sticks hint",
  walk: hintWalk,
  // Every technique decides a square to a step, the evidence being that
  // square's own; a number's later squares continue the first.
  each: SAYS_EACH,
  legs: SAYS_LEGS,
  // A square's own line is the whole of what it asks: the lines the others
  // follow with are not shown.
  consequences: false,
  width: (s) => s.w,
  size: (s) => s.w * s.h,
  valueAt: (s, cell) =>
    s.grid[cell] & F_HOR ? ACROSS : s.grid[cell] & F_VER ? DOWN : 0,
  execute: executeMove,
  foreign: (m) => m.kind === "solve",
  target: (at, n) => ({ ...at, value: n }),
  want: (t) => t.value,
  move: (targets, state) => ({
    kind: "set",
    changes: targets.map((t) => ({
      index: t.y * state.w + t.x,
      line: t.value === ACROSS ? "hor" : "ver",
    })),
  }),
  stated: STATED,
  // A square is named by its number where it has one ("this 2").
  shows: (s, at) => s.numbers[at.y * s.w + at.x],
  say: {},
});

export const sticksHint = described.hint;
