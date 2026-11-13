/**
 * Separate's explained hint: the firings of the ladder
 * [`separate.description.yaml`](./separate.description.yaml) states, one at a
 * time, which `engine/described-edge-hint.ts` walks. This file turns a firing
 * into its journey (a leg for each edge it sets, on the border grid's shared
 * step) and says which sentence a leg speaks; the words are
 * [`hint-text.ts`](./hint-text.ts)'s.
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
import { SAYS_KINDS } from "./separate.compiled.ts";
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

/**
 * The most steps a plan holds: a player rarely follows more than a handful
 * before going their own way, at which point the plan is recomputed.
 */
const PLAN_CAP = 40;

/** What a leg's sentence is told besides the firing's own: the leg it is and
 * the edges it rings (its own and the ones still to come). */
interface Leg {
  leg: number;
  left: readonly ForcedBorderEdge[];
  w: number;
}

/**
 * Which of a firing's regions a sentence stripes and which it outlines. Of
 * two, the first is striped unless it is the lone square of a mixed pair, which
 * the sentence names by its letter and so wants outlined; two lone squares are
 * both just letters, and both outlined.
 */
function evidence(
  id: string,
  a: readonly number[],
  b: readonly number[],
): { striped: readonly number[]; outlined: readonly number[] } {
  if (id !== "sharedLetter") return { striped: a, outlined: b };
  if (a.length === 1 && b.length === 1) return { striped: [], outlined: [...a, ...b] };
  return a.length === 1 && b.length > 1
    ? { striped: b, outlined: a }
    : { striped: a, outlined: b };
}

/** A leg's sentence: the firing's first leg speaks the technique's, and each
 * later leg points back at the regions the first named. */
function explain(
  id: "sharedLetter" | "walledApart" | "onlyWay",
  s: EdgeSpoken<SeparateSays[typeof id]>,
  { leg, left, w }: Leg,
): Sentence {
  const at = (sqs: readonly number[]): Point[] =>
    sqs.map((i) => ({ x: i % w, y: Math.floor(i / w) }));
  const { striped, outlined } = evidence(id, s.stripes, s.outline);
  const letter = "letter" in s.terms ? s.terms.letter : 0;
  if (leg > 0)
    return edgeContinuation(
      left,
      say.basis(at(striped), at(outlined), id === "sharedLetter" ? letter : 0),
    );
  switch (id) {
    case "sharedLetter":
      return say.sharedLetter(letter, at(striped), at(outlined), left);
    case "walledApart":
      return say.walledApart(at(striped), at(outlined), left);
    case "onlyWay":
      return say.onlyWay(
        at(s.stripes),
        "size" in s.terms ? s.terms.size : 0,
        letter,
        left,
      );
  }
}

/** Each technique's sentence, from what the firing says. */
const sentences: {
  [K in keyof SeparateSays]: (
    spoken: EdgeSpoken<SeparateSays[K]>,
    leg: Leg,
  ) => Sentence;
} = {
  sharedLetter: (s, leg) => explain("sharedLetter", s, leg),
  walledApart: (s, leg) => explain("walledApart", s, leg),
  onlyWay: (s, leg) => explain("onlyWay", s, leg),
};

/** The journey of a firing: a leg for each edge it sets. */
function stepOf(
  fired: Fired<SeparateSays[keyof SeparateSays], SeparateWalkContext>,
  state: SeparateState,
): { move: SeparateMove; highlights: BorderHint; marked: Leg }[] {
  // The edges are named from the firing's first group, the striped one.
  const edges = forcedEdgesOf(
    fired.ctx.sp,
    fired.taken.facts,
    fired.says.marks.stripes,
    WALL,
  );
  return edges.map((edge, leg) => ({
    move: { type: "edges", edits: borderEdgeEdits(edge) },
    highlights: edge,
    marked: { leg, left: edges.slice(leg), w: state.w },
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
  SeparateRung
>({
  name: "separate hint",
  walk: (state) => separateWalk(state),
  tiers: { lowest: () => 0, count: 1 },
  done: wallsAreAnswer,
  plan: PLAN_CAP,
  step: stepOf,
  say: sentences,
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
