/**
 * Range's hint: the game's compiled ladder (`solver.ts`), walked from the
 * player's own marks and said a square at a time, the steps built by the
 * engine from what `range.description.yaml` says of a firing. Each step decides
 * one square, by the rule it would break the other way: a shaded square beside
 * it, a number's count already seen or overrun, a number that must see along
 * the run to it, or the clear squares cut in two.
 */

import {
  describedFiringHint,
  type FiringHint,
} from "../../engine/described-firing-hint.ts";
import type { Point } from "../../engine/types.ts";
import { sentences } from "./hint-text.ts";
import type { SaysById } from "./range.compiled.ts";
import { hintWalk, type RangeRung } from "./solver.ts";
import { BLACK, executeMove, type RangeMove, type RangeState, WHITE } from "./state.ts";

/** What the description reads a square as holding: shaded or clear. */
const SHADED = 1;
const CLEAR = 2;

/** A square a step decides and the value it asks, as the description reads
 * it. */
export interface RangeTarget extends Point {
  value: number;
}

/** What a step decides: the square, with its value. */
export type RangeHint = FiringHint<RangeTarget>;

const described = describedFiringHint<
  RangeState,
  RangeMove,
  RangeTarget,
  SaysById,
  RangeRung,
  RangeHint
>({
  name: "range hint",
  walk: hintWalk,
  // Every technique decides a square to a step, the evidence being that
  // square's own.
  each: ["besideShaded", "capped", "reach", "cut"],
  width: (s) => s.w,
  size: (s) => s.w * s.h,
  // A numbered square is clear, and an undecided one holds none.
  valueAt: (s, cell) => {
    const v = s.grid[cell];
    return v === BLACK ? SHADED : v === WHITE || v > 0 ? CLEAR : 0;
  },
  execute: executeMove,
  foreign: (m) => m.solve === true,
  target: (at, n) => ({ ...at, value: n }),
  want: (t) => t.value,
  move: (targets) => ({
    sets: targets.map((t) => ({
      r: t.y,
      c: t.x,
      value: t.value === SHADED ? "black" : "white",
    })),
  }),
  say: sentences,
});

export const { hint: rangeHint, hintKeepTrack: rangeKeepTrack } = described;
export const rangeRefreshHintStep = described.refreshHintStep;
