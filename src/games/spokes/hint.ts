/**
 * Spokes' explained hint: the firings of the ladder
 * [`spokes.description.yaml`](./spokes.description.yaml) states, one at a time,
 * which `engine/described-edge-hint.ts` walks. This file turns a firing into its
 * journey (a leg for each spoke it decides) and supplies what the description's
 * sentences cannot know: the hubs a Check's trial breaks.
 */

import { describedEdgeHint, type Fired } from "../../engine/described-edge-hint.ts";
import type { SuppliedHooks } from "../../engine/described-hint.ts";
import type { HintResult } from "../../engine/game.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import {
  STATED,
  type SuppliedById,
} from "../../generated/games/spokes/spokes.compiled.ts";
import { HUB, SPOKE, type Spoke } from "./kinds.ts";
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

/** What a leg's sentence is told: the firing, the leg it is, and what it shows. */
interface Leg {
  firing: SpokesFiring;
  leg: number;
  highlights: SpokesHint;
}

/** What a Check's trial breaks: the hubs it fills and breaks, outlined, and
 * the terms that name them. A hub the rule-out leaves no spare spoke is told
 * apart from a broken one of the same number by order. */
function trialBreaks(
  { firing: f, highlights }: Leg,
  state: SpokesState,
): SuppliedById["spareBreaks"] {
  const filled = f.filled ?? null;
  const broken = f.evidenceHubs.filter((h) => h !== filled);
  const number = (h: number): number => state.numbers[h];
  return {
    terms: {
      broken,
      many: broken.length > 1,
      bn: number(broken[0]),
      starved: f.breakKind === "starved",
      hasFilled: filled !== null,
      filled: filled ?? broken[0],
      fn: number(filled ?? broken[0]),
      same:
        filled !== null && broken.length === 1 && number(broken[0]) === number(filled),
    },
    marks: { outline: highlights.evidence },
  };
}

/** What a leg supplies that no firing's binding holds: the spokes a later leg
 * still decides, and what a Check's trial breaks. */
const SUPPLIED: SuppliedHooks<SuppliedById, Leg, SpokesState> = {
  lineBreaks: (leg, state) => {
    const { terms, marks } = trialBreaks(leg, state);
    const { broken, many, bn, starved } = terms;
    return { terms: { broken, many, bn, starved }, marks };
  },
  spareBreaks: trialBreaks,
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
  SpokesRung,
  Spoke,
  number,
  SuppliedById
>({
  name: "spokes hint",
  walk: (state) => spokesWalk(state),
  // Up to Normal: the search beneath is not a deduction.
  tiers: { lowest: () => DIFF_TRICKY, count: DIFF_TRICKY + 1 },
  done: (_marks, ctx) => ctx.complete(),
  reads: (taken, ctx) => ctx.reads(taken),
  step: stepOf,
  stated: STATED,
  // A step's references are drawn on the hubs it outlines and the spokes it
  // decides, which a leg still has to settle.
  elements: { kind: HUB, at: (index) => index },
  ringKind: SPOKE,
  ringNoun: "spoke",
  ring: ({ highlights: hl }) => hl.spokes.map((sp) => spokeOf(sp, hl.w)),
  supplied: SUPPLIED,
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
