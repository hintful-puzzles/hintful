/**
 * Clusters' hint: the game's compiled ladder (`solver.ts`), walked from the
 * player's own colors and said a square at a time, the steps built by the
 * engine from what `clusters.description.yaml` says of a firing. Each step
 * decides the color of one square, by showing that the other color would break
 * a rule: at once (Easy), or by the counts of two tiles (Normal). It reasons
 * from the dots and the squares the player has colored, so it carries on from
 * wherever they are.
 *
 * The tiles a step reasons from, each framed thin, are the words' outline
 * marks (`render.ts`): no premise needs a highlight of its own, since every
 * tile the rules read sits orthogonally beside the target or those tiles, so it
 * is already in view.
 */

import {
  describedFiringHint,
  type FiringHint,
} from "../../engine/described-firing-hint.ts";
import type { Point } from "../../engine/types.ts";
import type { SaysById } from "./clusters.compiled.ts";
import { sentences } from "./hint-text.ts";
import { type ClustersRung, hintWalk } from "./solver.ts";
import {
  type ClustersFill,
  type ClustersMove,
  type ClustersState,
  COLMASK,
  executeMove,
} from "./state.ts";

/** A square a step colors and the color it asks. */
export interface ClustersTarget extends Point {
  value: ClustersFill;
}

/** What a step decides: the square, with its color. */
export type ClustersHint = FiringHint<ClustersTarget>;

const described = describedFiringHint<
  ClustersState,
  ClustersMove,
  ClustersTarget,
  SaysById,
  ClustersRung,
  ClustersHint
>({
  name: "clusters hint",
  walk: hintWalk,
  width: (s) => s.w,
  size: (s) => s.w * s.h,
  valueAt: (s, cell) => s.grid[cell] & COLMASK,
  execute: executeMove,
  foreign: (m) => m.kind === "solve",
  target: (at, n) => ({ ...at, value: n as ClustersFill }),
  want: (t) => t.value,
  move: (targets, state) => ({
    kind: "paint",
    cells: targets.map((t) => ({ index: t.y * state.w + t.x, fill: t.value })),
  }),
  each: ["countFull", "countShort"],
  say: sentences,
});

export const { hint: clustersHint, hintKeepTrack: clustersKeepTrack } = described;
export const clustersRefreshHintStep = described.refreshHintStep;
