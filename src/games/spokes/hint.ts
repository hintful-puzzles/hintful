/**
 * Spokes' explained hint: the firings of the ladder
 * [`spokes.description.yaml`](./spokes.description.yaml) states, one at a time,
 * which `engine/described-edge-hint.ts` walks. This file turns a firing into its
 * journey (a leg for each spoke it decides) and says which sentence a leg
 * speaks; the words are [`hint-text.ts`](./hint-text.ts)'s, every claim of
 * which the compiled ladder has checked.
 */

import {
  describedEdgeHint,
  type EdgeSpoken,
  type Fired,
} from "../../engine/described-edge-hint.ts";
import type { HintResult } from "../../engine/game.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { type Hub, type Marked, type Spoke, say } from "./hint-text.ts";
import {
  type SpokesFiring,
  type SpokesRung,
  type SpokesSays,
  type SpokesWalkContext,
  spokesAnswer,
  spokesWalk,
} from "./solver.ts";
import {
  canonicalEdge,
  DIFF_TRICKY,
  type SpokesMove,
  type SpokesSpokeRef,
  type SpokesState,
} from "./state.ts";

/** How far ahead the plan is computed. A player rarely follows more than a
 * few steps before going their own way, and the plan is asked for again
 * then. */
const PLAN_CAP = 40;

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

const markedOf = (hl: SpokesHint): Marked => ({
  spokes: hl.spokes.map((sp) => spokeOf(sp, hl.w)),
  hubs: hl.evidence,
});

/** What a leg's sentence is told: the firing, the leg it is, and what it shows. */
interface Leg {
  firing: SpokesFiring;
  leg: number;
  highlights: SpokesHint;
}

/**
 * One crisp line for a player who knows the rules, premise then conclusion,
 * in the necessity voice (the hint quality bar); the later legs of a firing
 * continue it.
 */
function narrate(
  { firing: f, leg, highlights: hl }: Leg,
  state: SpokesState,
): Sentence {
  const m = markedOf(hl);
  if (leg > 0) return say.continuation(f.kind === "saturation", m);
  const hubOf = (index: number): Hub => ({ index, number: state.numbers[index] });
  switch (f.kind) {
    case "twoOnes":
      return say.twoOnes(m);
    case "saturation":
      return say.saturation(f.forced.length, m);
    case "exhaustion":
      return say.exhaustion(m);
    case "lineBreaks":
    case "spareBreaks": {
      const filled = f.filled ?? null;
      return say.breaks(
        f.kind === "lineBreaks",
        f.breakKind ?? "sealed",
        m,
        filled === null ? null : hubOf(filled),
        f.evidenceHubs.filter((h) => h !== filled).map(hubOf),
      );
    }
  }
}

/** Every technique's sentence is `narrate`'s for its firing. */
const sentence = (_spoken: unknown, leg: Leg, state: SpokesState): Sentence =>
  narrate(leg, state);

const sentences: {
  [K in keyof SpokesSays]: (
    spoken: EdgeSpoken<SpokesSays[K]>,
    leg: Leg,
    state: SpokesState,
  ) => Sentence;
} = {
  saturation: sentence,
  twoOnes: sentence,
  exhaustion: sentence,
  lineBreaks: sentence,
  spareBreaks: sentence,
};

/** A firing's journey: a leg for each spoke it decides, each showing the
 * spokes still to settle, so whichever leg is asked for shows what is left of
 * the deduction. */
function stepOf(
  fired: Fired<SpokesSays[keyof SpokesSays], SpokesWalkContext>,
  state: SpokesState,
): { move: SpokesMove; highlights: SpokesHint; marked: Leg }[] {
  const firing = fired.ctx.firing(fired.taken);
  return firing.forced.map((sp, leg) => {
    const highlights: SpokesHint = {
      spokes: firing.forced.slice(leg),
      evidence: firing.evidenceHubs,
      w: state.w,
    };
    return {
      move: { kind: "set", ...sp },
      highlights,
      marked: { firing, leg, highlights },
    };
  });
}

const spokesPlan = describedEdgeHint<
  SpokesState,
  SpokesMove,
  SpokesHint,
  Leg,
  SpokesWalkContext,
  SpokesSays,
  SpokesRung
>({
  name: "spokes hint",
  walk: (state) => spokesWalk(state),
  // Up to Normal: the search beneath is not a deduction.
  tiers: { lowest: () => DIFF_TRICKY, count: DIFF_TRICKY + 1 },
  done: (_marks, ctx) => ctx.complete(),
  plan: PLAN_CAP,
  reads: (taken, ctx) => ctx.reads(taken),
  step: stepOf,
  say: sentences,
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
