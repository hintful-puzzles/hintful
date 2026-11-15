/**
 * Separate's explained hint: the firings of the ladder
 * [`separate.description.yaml`](./separate.description.yaml) states, one at a
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
import { describedEdgeHint, type Fired } from "../../engine/described-edge-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { edgeContinuation } from "../../engine/hint-text.ts";
import { SAYS_KINDS, STATED } from "./separate.compiled.ts";
import {
  type SeparateSays,
  type SeparateWalkContext,
  separateWalk,
  WALL,
  wallsAreAnswer,
} from "./solver.ts";
import type { SeparateMove, SeparateState } from "./state.ts";

/** The hint's rungs: the kinds of the ladder's techniques. */
export const SEPARATE_RUNGS = SAYS_KINDS;
export type SeparateRung = (typeof SEPARATE_RUNGS)[number];

/** What a leg's sentence is told besides the firing's own: the edges it rings
 * (its own and the ones still to come). */
interface Leg {
  left: readonly ForcedBorderEdge[];
}

/** The journey of a firing: a leg for each edge it sets. */
function stepOf(
  fired: Fired<SeparateSays[keyof SeparateSays], SeparateWalkContext>,
): { move: SeparateMove; highlights: BorderHint; marked: Leg }[] {
  // The edges are named from the firing's first group.
  const { terms, marks } = fired.says;
  const edges = forcedEdgesOf(
    fired.ctx.sp,
    fired.taken.facts,
    "side" in terms ? terms.side : marks.stripes,
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
export const separateHint = describedEdgeHint<
  SeparateState,
  SeparateMove,
  BorderHint,
  Leg,
  SeparateWalkContext,
  SeparateSays,
  SeparateRung,
  ForcedBorderEdge
>({
  name: "separate hint",
  walk: (state) => separateWalk(state),
  tiers: { lowest: () => 0, count: 1 },
  done: wallsAreAnswer,
  step: stepOf,
  stated: STATED,
  ringKind: EDGE,
  ring: ({ left }) => left,
  later: edgeContinuation,
  width: (state) => state.w,
  // A letter is the value a clause names; its sizes are plain counts.
  value: (n) => String.fromCharCode(65 + n),
});

export function separateHintKeepTrack(
  m: SeparateMove,
  step: HintStep<SeparateMove, BorderHint>,
  state: SeparateState,
): HintTrackVerdict {
  return borderHintKeepTrack(
    m.type === "edges" ? m.edits : null,
    step,
    state.w,
    state.borders,
  );
}
