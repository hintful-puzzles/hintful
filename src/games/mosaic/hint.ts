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
import { type SaysById, STATED } from "../../generated/games/mosaic/mosaic.compiled.ts";
import { BLOCK } from "./kinds.ts";
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
  width: (s) => s.width,
  size: (s) => s.width * s.height,
  valueAt: markAt,
  execute: executeMove,
  foreign: (m) => m.type === "solve",
  target: (at, n) => ({ ...at, value: n }),
  want: (t) => t.value,
  // A step's squares and their marks: one for all, but where a comparison
  // shades one number's squares and clears the other's.
  move: (targets, state) => {
    const marks = targets.map((t) => t.value);
    return {
      type: "fill",
      cells: targets.map((t) => t.y * state.width + t.x),
      mark: marks.every((n) => n === marks[0]) ? marks[0] : marks,
    };
  },
  stated: STATED,
  // A number is named apart from the squares of its block, which include its
  // own square; two named together are one reference.
  termKinds: { clue: BLOCK, other: BLOCK, pair: BLOCK },
  say: {},
});

export const mosaicHint = described.hint;
