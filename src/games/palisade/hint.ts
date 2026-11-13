/**
 * Palisade's explained hint: the firings of the ladder
 * [`palisade.description.yaml`](./palisade.description.yaml) states, one at a
 * time, which `engine/described-edge-hint.ts` walks. This file turns a firing
 * into its journey (a leg for each edge it sets, on the border grid's shared
 * step) and says which sentence a leg speaks; the words, and why each reads as
 * it does, are [`hint-text.ts`](./hint-text.ts)'s.
 */

import {
  type BorderHint,
  borderEdgeEdits,
  borderHintKeepTrack,
  type ForcedBorderEdge,
  forcedEdgesOf,
} from "../../engine/border-grid-hint.ts";
import {
  describedEdgeHint,
  type EdgeSpoken,
  type Fired,
} from "../../engine/described-edge-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { edgeContinuation } from "../../engine/hint-text.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import { SAYS_KINDS } from "./palisade.compiled.ts";
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

/**
 * The most steps a plan holds: a player rarely follows more than a handful
 * before going their own way, at which point the plan is recomputed.
 */
const PLAN_CAP = 40;

/** What a leg's sentence is told besides the firing's own: the leg it is, the
 * edges it rings (its own and the ones still to come), whether the firing sets
 * several, and the board's width. */
interface Leg {
  leg: number;
  left: readonly ForcedBorderEdge[];
  multi: boolean;
  w: number;
}

type Spoken<K extends keyof PalisadeSays> = EdgeSpoken<PalisadeSays[K]>;

/** The first leg's sentence for a firing; later legs continue it, pointing
 * back to the evidence the first named. */
const sentences: {
  [K in keyof PalisadeSays]: (spoken: Spoken<K>, leg: Leg) => Sentence;
} = {
  cluesVersusRegionSize: (s, { leg, left, w }) => {
    const cells = at(s.outline, w);
    if (leg > 0) return edgeContinuation(left, say.basis.outlined(cells, "clue"));
    return say.cluesVersusRegionSize(cells, s.terms.c, s.terms.d, s.terms.size, left);
  },
  numberExhausted: (s, { leg, left, multi, w }) => {
    const [clue] = at(s.outline, w);
    if (leg > 0) return edgeContinuation(left, say.basis.clue(clue, s.terms.clue));
    return say.numberExhausted(clue, s.terms.clue, left, multi);
  },
  notTooBig: (s, { leg, left, w }) => {
    const cells = at(s.outline, w);
    if (leg > 0) return edgeContinuation(left, say.basis.outlined(cells, "region"));
    return say.notTooBig(cells, s.terms.joined, s.terms.size, left);
  },
  notTooSmall: (s, { leg, left, multi, w }) => {
    const cells = at(s.stripes, w);
    if (leg > 0) return edgeContinuation(left, say.basis.region(cells));
    return say.notTooSmall(cells, s.terms.have, s.terms.size, left, multi);
  },
  noDanglingEdges: (s, { leg, left, w }) => {
    const cells = at(s.outline, w);
    if (leg > 0)
      return edgeContinuation(left, say.basis.outlined(cells, ["corner", "corner"]));
    return say.noDanglingEdges(cells, left);
  },
  equivalentEdges: (s, { leg, left, multi, w }) => {
    const cells = at(s.stripes, w);
    if (leg > 0) return edgeContinuation(left, say.basis.region(cells));
    return say.equivalentEdges(cells, s.terms.clue, left, multi);
  },
  inside: (s, { leg, left, w }) => {
    const cells = at(s.stripes, w);
    if (leg > 0) return edgeContinuation(left, say.basis.region(cells));
    return say.inside(cells, left);
  },
};

const at = (squares: readonly number[], w: number): Point[] =>
  squares.map((i) => ({ x: i % w, y: Math.floor(i / w) }));

/** The journey of a firing: a leg for each edge it sets, named from the
 * squares its `anchor` term gives. */
function stepOf(
  fired: Fired<PalisadeSays[keyof PalisadeSays], PalisadeWalkContext>,
  state: PalisadeState,
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
    marked: { leg, left: edges.slice(leg), multi: edges.length > 1, w: state.w },
  }));
}

/**
 * The deduction from the player's own marks to the end, as one journey per
 * firing. Refuses only when the deduction has nothing left to set, which on an
 * Unreasonable board is before the end.
 */
export const palisadeHint = describedEdgeHint<
  PalisadeState,
  PalisadeMove,
  BorderHint,
  Leg,
  PalisadeWalkContext,
  PalisadeSays,
  PalisadeRung
>({
  name: "palisade hint",
  walk: (state) => palisadeWalk(state),
  tiers: { lowest: () => 0, count: 1 },
  done: wallsAreAnswer,
  plan: PLAN_CAP,
  step: stepOf,
  say: sentences,
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
