/**
 * Skeleton's explained hint: the compiled ladder (`solver.ts`) walked from the
 * player's own marks, a step a firing, built by the engine from what
 * `skeleton.description.yaml` says of a firing
 * (`engine/described-firing-hint.ts`; docs/hints.md § "Recording the
 * deduction").
 *
 * Every fact a step rests on is a number or a mark the player has made: the
 * ladder reads nothing else.
 */

import {
  describedFiringHint,
  type FiringHint,
} from "../../engine/described-firing-hint.ts";
import type { Point } from "../../engine/types.ts";
import { sentences } from "./hint-text.ts";
import type { SaysById } from "./skeleton.compiled.ts";
import { hintWalk, type SkeletonBoard, type SkeletonRung } from "./solver.ts";
import {
  BLANK,
  executeMove,
  type SkeletonMark,
  type SkeletonMove,
  type SkeletonState,
} from "./state.ts";

/** A square a step marks and the mark it asks. */
export interface SkeletonTarget extends Point {
  value: SkeletonMark;
}

/** What a step decides: its squares, each with the mark it asks. */
export type SkeletonHint = FiringHint<SkeletonTarget>;

const described = describedFiringHint<
  SkeletonState,
  SkeletonMove,
  SkeletonTarget,
  SaysById,
  SkeletonRung,
  SkeletonHint
>({
  name: "skeleton hint",
  walk: (state: SkeletonBoard) => hintWalk(state, 0),
  plan: 24,
  width: (s) => s.w,
  size: (s) => s.w * s.h,
  valueAt: (s, cell) => (s.grid[cell] === BLANK ? 0 : s.grid[cell]),
  execute: executeMove,
  foreign: (m) => m.kind !== "mark",
  target: (at, n) => ({ ...at, value: n as SkeletonMark }),
  want: (t) => t.value,
  move: (targets, state) => ({
    kind: "mark",
    cells: targets.map((t) => ({ index: t.y * state.w + t.x, mark: t.value })),
  }),
  say: sentences,
});

export const { hint: skeletonHint, hintKeepTrack: skeletonKeepTrack } = described;
export const skeletonRefreshHintStep = described.refreshHintStep;
