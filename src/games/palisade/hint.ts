/**
 * Palisade's explained hint: the firings of the ladder
 * [`palisade.description.yaml`](./palisade.description.yaml) states, one at a
 * time, which `engine/described-edge-hint.ts` walks, and whose words the
 * description states. This file turns a firing into its journey: a leg for each
 * edge it sets, on the border grid's shared step.
 */

import {
  type BorderHint,
  borderEdgeEdits,
  borderHintKeepTrack,
  EDGE,
  type ForcedBorderEdge,
  forcedEdgesOf,
} from "../../engine/border-grid-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/contract/game.ts";
import { PLACE } from "../../engine/describe-runtime.ts";
import { describedEdgeHint, type Fired } from "../../engine/described-edge-hint.ts";
import { edgeContinuation } from "../../engine/hint-text.ts";
import {
  SAYS_KINDS,
  STATED,
} from "../../generated/games/palisade/palisade.compiled.ts";
import {
  type PalisadeSays,
  type PalisadeWalkContext,
  palisadeWalk,
  WALL,
  wallsAreAnswer,
} from "./solver.ts";
import type { PalisadeMove, PalisadeState } from "./state.ts";

/** The hint's rungs: the ladder's techniques, in its order. */
export const PALISADE_RUNGS = SAYS_KINDS;
export type PalisadeRung = (typeof PALISADE_RUNGS)[number];

/** What a leg's sentence is told besides the firing's own: the edges it rings
 * (its own and the ones still to come). */
interface Leg {
  left: readonly ForcedBorderEdge[];
}

/** The journey of a firing: a leg for each edge it sets, named from the
 * squares its `anchor` term gives. */
function stepOf(
  fired: Fired<PalisadeSays[keyof PalisadeSays], PalisadeWalkContext>,
): { move: PalisadeMove; highlights: BorderHint; marked: Leg }[] {
  const edges = forcedEdgesOf(
    fired.ctx.sp,
    fired.taken.facts,
    fired.says.terms.anchor,
    WALL,
  );
  return edges.map((edge, leg) => ({
    move: { type: "edges", edits: borderEdgeEdits(edge) },
    highlights: edge,
    marked: { left: edges.slice(leg) },
  }));
}

/**
 * The deduction from the player's own marks to the end, as one journey per
 * firing. Refuses only when the deduction has nothing left to set, which on an
 * Unreasonable board is before the end.
 */
export const { plan: palisadeHint, judgeMove: palisadeJudgeMove } = describedEdgeHint<
  PalisadeState,
  PalisadeMove,
  BorderHint,
  Leg,
  PalisadeWalkContext,
  PalisadeSays,
  PalisadeRung,
  ForcedBorderEdge
>({
  name: "palisade hint",
  walk: (state) => palisadeWalk(state),
  tiers: { lowest: () => 0, count: 1 },
  done: wallsAreAnswer,
  // No technique marks an edge inside a region once the walls close every
  // region, so a player's no-wall mark is decided then.
  holds: (marks, ctx, f) =>
    f.kind === PLACE && f.value !== WALL && wallsAreAnswer(marks, ctx),
  step: stepOf,
  stated: STATED,
  ringKind: EDGE,
  ringNoun: "edge",
  ring: ({ left }) => left,
  later: edgeContinuation,
  width: (state) => state.w,
});

export function palisadeHintKeepTrack(
  m: PalisadeMove,
  step: HintStep<PalisadeMove, BorderHint>,
  state: PalisadeState,
): HintTrackVerdict {
  return borderHintKeepTrack(
    m.type === "edges" ? m.edits : null,
    step,
    state.w,
    state.borders,
  );
}
