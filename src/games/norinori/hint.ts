/**
 * Norinori's explained hint: the compiled ladder (`solver.ts`) walked from the
 * player's own marks, a step a firing, each built and worded by the engine
 * from what `norinori.description.yaml` says of it
 * (`engine/described-firing-hint.ts`; docs/hints.md § "Recording the
 * deduction").
 *
 * Every fact a step rests on is a region's border or a mark the player has
 * made: the ladder reads nothing else.
 */

import {
  describedFiringHint,
  type FiringHint,
} from "../../engine/described-firing-hint.ts";
import type { Point } from "../../engine/types.ts";
import {
  RULES_OUT,
  type SaysById,
  STATED,
} from "../../generated/games/norinori/norinori.compiled.ts";
import { hintWalk, type NorinoriRung } from "./solver.ts";
import {
  executeMove,
  type NorinoriMark,
  type NorinoriMove,
  type NorinoriState,
} from "./state.ts";

/** A square a step marks and the mark it asks. */
export interface NorinoriTarget extends Point {
  value: NorinoriMark;
}

/** What a step decides: its squares, each with the mark it asks. */
export type NorinoriHint = FiringHint<NorinoriTarget>;

const described = describedFiringHint<
  NorinoriState,
  NorinoriMove,
  NorinoriTarget,
  SaysById,
  NorinoriRung,
  NorinoriHint
>({
  name: "norinori hint",
  walk: hintWalk,
  rulesOut: RULES_OUT,
  width: (s) => s.w,
  size: (s) => s.w * s.h,
  valueAt: (s, cell) => s.grid[cell],
  execute: executeMove,
  foreign: (m) => m.kind !== "mark",
  target: (at, n) => ({ ...at, value: n as NorinoriMark }),
  want: (t) => t.value,
  move: (targets, state) => ({
    kind: "mark",
    cells: targets.map((t) => ({ index: t.y * state.w + t.x, mark: t.value })),
  }),
  stated: STATED,
  say: {},
});

export const {
  hint: norinoriHint,
  hintKeepTrack: norinoriKeepTrack,
  rulesOut: norinoriRulesOut,
} = described;
export const norinoriRefreshHintStep = described.refreshHintStep;
