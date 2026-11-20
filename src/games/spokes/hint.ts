/**
 * Spokes' explained hint: the firings of the ladder
 * [`spokes.description.yaml`](./spokes.description.yaml) states, one at a time,
 * which `engine/described-edge-hint.ts` walks. This file turns a firing into its
 * journey (a leg for each spoke it decides). What a Check's trial breaks is
 * the description's (`breaks`, said by `{broke}`).
 */

import type { HintResult, MoveVerdict } from "../../engine/contract/game.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/contract/hint-refusal.ts";
import { PLACE } from "../../engine/describe-runtime.ts";
import { describedEdgeHint, type Fired } from "../../engine/described-edge-hint.ts";
import { STATED } from "../../generated/games/spokes/spokes.compiled.ts";
import { HUB, SPOKE, type Spoke } from "./kinds.ts";
import {
  type SpokesRung,
  type SpokesSays,
  type SpokesWalkContext,
  spokesAnswer,
  spokesWalk,
  UNUSED,
  unusedDecided,
} from "./solver.ts";
import {
  canonicalEdge,
  DIFF_TRICKY,
  type SpokesMove,
  type SpokesSpokeRef,
  type SpokesState,
} from "./state.ts";

/**
 * What a Spokes hint leg is about; its marks are the ones its words name.
 * `spokes` are the spokes the firing still forces from this leg on (the earlier
 * legs', once followed, are real lines or marks, and the renderer tints only a
 * spoke that is still EMPTY), each with what the step sets it to: a ringed
 * `SPOKE_LINE` spoke is drawn as a line inside its ring ("draw this"), a
 * `SPOKE_MARKED` one as a ring round its rim dot ("rule this out"), so the
 * picture never claims a different action than the words. `evidence` are the
 * hubs whose clue or lines are the argument. The whole deduction stays visible
 * while its legs are followed one at a time. `w` is the grid width, which a
 * spoke's canonical end is taken in.
 */
export interface SpokesHint {
  spokes: SpokesSpokeRef[];
  evidence: number[];
  w: number;
}

const spokeOf = (sp: SpokesSpokeRef, w: number): Spoke =>
  canonicalEdge(sp.index, sp.dir, w);

/** A firing's journey: a leg for each spoke it decides, each showing the
 * spokes still to settle, so whichever leg is asked for shows what is left of
 * the deduction. */
function stepOf(
  fired: Fired<SpokesSays[keyof SpokesSays], SpokesWalkContext>,
  state: SpokesState,
): { move: SpokesMove; highlights: SpokesHint; marked: SpokesHint }[] {
  const firing = fired.ctx.firing(fired.taken);
  return firing.forced.map((sp, leg) => {
    const highlights: SpokesHint = {
      spokes: firing.forced.slice(leg),
      evidence: firing.evidenceHubs,
      w: state.w,
    };
    return { move: { kind: "set", ...sp }, highlights, marked: highlights };
  });
}

const { plan: spokesPlan, judgeMove: judgePlan } = describedEdgeHint<
  SpokesState,
  SpokesMove,
  SpokesHint,
  SpokesHint,
  SpokesWalkContext,
  SpokesSays,
  SpokesRung,
  Spoke,
  number
>({
  name: "spokes hint",
  walk: (state) => spokesWalk(state),
  // Up to Normal: the search beneath is not a deduction.
  tiers: { lowest: () => DIFF_TRICKY, count: DIFF_TRICKY + 1 },
  done: (_marks, ctx) => ctx.complete(),
  holds: (marks, ctx, f) =>
    f.kind === PLACE && f.value === UNUSED && unusedDecided(marks, ctx, f.at),
  reads: (taken, ctx) => ctx.reads(taken),
  step: stepOf,
  stated: STATED,
  // A step's references are drawn on the hubs it outlines and the spokes it
  // decides, which a leg still has to settle.
  elements: { kind: HUB, at: (index) => index },
  ringKind: SPOKE,
  ringNoun: "spoke",
  ring: (hl) => hl.spokes.map((sp) => spokeOf(sp, hl.w)),
});

/** The deduction from the player's lines to the end. A board with several
 * answers has no forced deduction to teach. */
export function spokesHint(
  state: SpokesState,
): HintResult<SpokesMove, SpokesHint, SpokesRung> {
  if (spokesAnswer(state).kind !== "one")
    return { ok: false, error: PUZZLE_NOT_REASONABLE };
  return spokesPlan(state);
}

/** What Check & save says of the last move, where the hint has a deduction
 * to teach. */
export function spokesJudgeMove(
  before: SpokesState,
  after: SpokesState,
): MoveVerdict | null {
  return spokesAnswer(before).kind === "one" ? judgePlan(before, after) : null;
}
