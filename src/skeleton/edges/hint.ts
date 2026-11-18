/**
 * Skeleton's explained hint: the solver's compiled ladder walked one firing
 * at a time from the player's own lines and crosses (`skeletonWalk`), and
 * each firing turned into a step (docs/hints.md § "Recording the
 * deduction"). The sentences are
 * [`skeleton.description.yaml`](./skeleton.description.yaml)'s; this file
 * supplies the terms they cannot know.
 *
 * Every fact a step rests on is a wall, a line or a cross on the board: the
 * ladder reads nothing else. The lines a Check tries are drawn thin where its
 * words outline them, and never played. What they break is the witness's
 * (the description's `breaks`, said by `{broke}`).
 */

import { describedEdgeHint } from "../../engine/described-edge-hint.ts";
import type { SuppliedHooks } from "../../engine/described-hint.ts";
import { EDGE, type ShapedEdge, trackEdgeStep } from "../../engine/edge-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { MarkKind } from "../../engine/hint-words.ts";
import { LINE } from "../../engine/line-drawing.ts";
import type { Point } from "../../engine/types.ts";
import {
  STATED,
  type SuppliedById,
} from "../../generated/skeleton/edges/skeleton.compiled.ts";
import {
  type SkeletonRung,
  type SkeletonSays,
  type SkeletonWalkContext,
  skeletonWalk,
} from "./solver.ts";
import {
  DIFF_NORMAL,
  executeMove,
  type SkeletonMove,
  type SkeletonState,
} from "./state.ts";

/** The edges a step tries lines on, as the board draws them. */
export interface SkeletonHighlights {
  tried: readonly ShapedEdge[];
}

/** What a step's words are told besides the technique's terms: the edges the
 * firing decides, as the game numbers them, and the edges a Check tries lines
 * on, none for a count. */
interface Fired {
  edges: number[];
  tried: number[];
}

/** What each technique's words hold that its binding does not. */
const SUPPLIED: SuppliedHooks<SuppliedById, Fired, SkeletonState> = {
  pairBreaks: ({ tried }) => ({ terms: { tried } }),
};

/** What a stated clause draws besides squares: the edges a Check tries. */
type Element = Point | number;
const TRIED = EDGE as unknown as MarkKind<Element>;

/** The plan from the player's lines and crosses. */
export const { hint: skeletonHint, judgeMove: skeletonJudgeMove } = describedEdgeHint<
  SkeletonState,
  SkeletonMove,
  SkeletonHighlights,
  Fired,
  SkeletonWalkContext,
  SkeletonSays,
  SkeletonRung,
  number,
  Element,
  SuppliedById
>({
  name: "skeleton hint",
  walk: (state) => skeletonWalk(state),
  // The whole ladder, from the Easy rung up.
  tiers: { lowest: () => DIFF_NORMAL, count: DIFF_NORMAL + 1 },
  done: (_marks, ctx) => ctx.complete(),
  step: ({ taken, says, ctx }) => {
    const edges = ctx.decided(taken);
    const tried =
      "first" in says.terms
        ? [says.terms.first, says.terms.second].map((e) => ctx.edgeOf(e))
        : [];
    return [
      {
        move: {
          kind: "edges",
          changes: edges.map((edge) => ({ edge, mark: ctx.markOf(taken) })),
        },
        highlights: { tried: tried.map((edge) => ({ edge, mark: LINE })) },
        marked: { edges, tried },
      },
    ];
  },
  stated: STATED,
  ringKind: EDGE,
  ring: ({ edges }) => edges,
  width: (state) => state.w,
  termKinds: { tried: TRIED },
  termAt: { tried: (edge) => edge },
  supplied: SUPPLIED,
});

/** Judge a move against the step on show by what it did to the edges, which
 * a solve never makes a step of. */
export function skeletonKeepTrack(
  move: SkeletonMove,
  step: HintStep<SkeletonMove>,
  state: SkeletonState,
): HintTrackVerdict {
  if (move.kind !== "edges" || step.move.kind !== "edges") return "off";
  return trackEdgeStep(
    step,
    step.move.changes,
    state.edges,
    executeMove(state, move).edges,
    (changes): SkeletonMove => ({ kind: "edges", changes }),
  );
}
