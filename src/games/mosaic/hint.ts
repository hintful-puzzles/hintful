/**
 * Mosaic's hint: the game's compiled ladder (`solver.ts`), walked from the
 * player's own marks and said a firing at a time, the steps built by the
 * engine from what `mosaic.description.yaml` says of a firing. An Easy board as
 * dealt always has a next step from one number alone; on any other board the
 * hint goes on to compare two numbers, and stops where that decides nothing
 * either.
 */

import {
  describedFiringHint,
  type FiringHint,
} from "../../engine/described-firing-hint.ts";
import type { Point } from "../../engine/types.ts";
import { sentences } from "./hint-text.ts";
import type { SaysById } from "./mosaic.compiled.ts";
import { hintWalk, type MosaicRung } from "./solver.ts";
import {
  executeMove,
  type MosaicMove,
  type MosaicState,
  STATE_MARK_MASK,
} from "./state.ts";

/** A square a step decides and the mark it asks: shaded or clear, as the
 * description reads a square (`STATE_MARKED`, `STATE_BLANK`). */
export interface MosaicTarget extends Point {
  value: number;
}

/** What a step decides: the squares, each with its mark. */
export type MosaicHint = FiringHint<MosaicTarget>;

const markAt = (state: MosaicState, cell: number): number =>
  state.cells[cell] & STATE_MARK_MASK;

const described = describedFiringHint<
  MosaicState,
  MosaicMove,
  MosaicTarget,
  SaysById,
  MosaicRung,
  MosaicHint
>({
  name: "mosaic hint",
  walk: hintWalk,
  // A player rarely follows more than a few steps before going their own way,
  // and the plan is asked for again then; each step reads every number on the
  // board, which on a large one is the cost of a hint.
  plan: 24,
  width: (s) => s.width,
  size: (s) => s.width * s.height,
  valueAt: markAt,
  execute: executeMove,
  foreign: (m) => m.type === "solve",
  target: (at, n) => ({ ...at, value: n }),
  want: (t) => t.value,
  // Every fact of a firing places the one mark its technique concludes.
  move: (targets, state) => ({
    type: "fill",
    cells: targets.map((t) => t.y * state.width + t.x),
    mark: targets[0].value,
  }),
  say: sentences,
});

export const { hint: mosaicHint, hintKeepTrack: mosaicKeepTrack } = described;
export const mosaicRefreshHintStep = described.refreshHintStep;
