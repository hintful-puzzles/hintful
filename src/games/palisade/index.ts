/**
 * Palisade — native TS port of `palisade.c` (Nikoli's "Five Cells").
 * Numeric clues count the walls around a cell; the player draws walls
 * so the grid divides into connected regions of exactly `k` cells, each
 * clue equal to its cell's wall count.
 *
 * Input picks the edge nearest the click (left toggles wall, right toggles
 * no-wall mark), and there is a half-grid keyboard cursor.
 */

import { searchTierContract, solveFromAnswer } from "../../engine/answer-search.ts";
import {
  BORDER,
  BORDER_MASK,
  borderGridVerbs,
  clearBorderEdges,
  DISABLED,
  revealBorderEdge,
} from "../../engine/border-grid.ts";
import {
  BORDER_RING_LEGEND,
  borderHintJourney,
  borderHintKeepTrack,
  borderStepEdge,
  type ForcedBorderEdge,
} from "../../engine/border-grid-hint.ts";
import type {
  Game,
  HintResult,
  HintStep,
  HintTrackVerdict,
  UiUpdate,
} from "../../engine/game.ts";
import { hintFinishes } from "../../engine/hint-finishes.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { edgeContinuation } from "../../engine/hint-text.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { newCursor } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { interpretTargetVerbs, verbClicks } from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { newDesc } from "./generator.ts";
import { say } from "./hint-text.ts";
import {
  colors,
  computeSize,
  newDrawState,
  type PalisadeDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  answerOf,
  hintFirings,
  isSolved,
  type PalisadeFiring,
  type PalisadeRule,
  palisadeLadderIds,
  solveToBorders,
} from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  menu,
  newState,
  type PalisadeHint,
  type PalisadeMistake,
  type PalisadeMove,
  type PalisadeParams,
  type PalisadeState,
  type PalisadeUi,
  paramConfig,
  status,
  textFormat,
  validateParams,
} from "./state.ts";

function newUi(_state: PalisadeState): PalisadeUi {
  return { cursor: newCursor(1, 1) };
}

// --- input -----------------------------------------------------------------

const targetVerbs = borderGridVerbs<
  PalisadeState,
  PalisadeUi,
  PalisadeDrawState,
  PalisadeMove
>((edits) => ({ type: "edges", edits }));

function interpretMove(
  state: PalisadeState,
  ui: PalisadeUi,
  ds: PalisadeDrawState,
  p: Point,
  rawButton: number,
): PalisadeMove | null | UiUpdate {
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

// --- mistakes --------------------------------------------------------------

/** Every edge the player has decided against the board's one answer, which
 * the search found at either tier. Nothing is flagged where it did not prove
 * there is exactly one. */
function findMistakes(state: PalisadeState): readonly PalisadeMistake[] {
  const answer = answerOf(state);
  if (answer.kind !== "one") return [];
  const sol = answer.solution;
  const { w, h, borders } = state;
  const out: PalisadeMistake[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      for (let dir = 0; dir < 4; dir++) {
        const b = BORDER(dir);
        const solWall = sol[i] & b;
        if (borders[i] & b && !solWall) out.push({ x, y, dir });
        else if (borders[i] & DISABLED(b) && solWall) out.push({ x, y, dir });
      }
    }
  }
  return out;
}

// --- hint ------------------------------------------------------------------

/** The first leg's sentence for a firing; later legs continue it, pointing
 * back to the evidence the first named. The words, and why each reads as it
 * does, are [`hint-text.ts`](./hint-text.ts)'s. */
function explain(
  f: PalisadeFiring,
  clues: Int8Array,
  w: number,
  k: number,
  leg: number,
  left: readonly ForcedBorderEdge[],
): Sentence {
  const at = (i: number): Point => ({ x: i % w, y: Math.floor(i / w) });
  const cells = (sqs: readonly number[]): Point[] => sqs.map(at);
  const multi = f.edges.length > 1;
  switch (f.kind) {
    case "cluesVersusRegionSize": {
      const [a, b] = f.clues;
      if (leg > 0)
        return edgeContinuation(left, say.basis.outlined(cells(f.clues), "clue"));
      return say.cluesVersusRegionSize(cells(f.clues), clues[a], clues[b], k, left);
    }
    case "numberExhausted":
      if (leg > 0)
        return edgeContinuation(left, say.basis.clue(at(f.clue), clues[f.clue]));
      return say.numberExhausted(at(f.clue), clues[f.clue], left, multi);
    case "notTooBig": {
      const both = [...f.a, ...f.b];
      if (leg > 0)
        return edgeContinuation(left, say.basis.outlined(cells(both), "region"));
      return say.notTooBig(cells(both), both.length, k, left);
    }
    case "notTooSmall":
      if (leg > 0) return edgeContinuation(left, say.basis.region(cells(f.region)));
      return say.notTooSmall(cells(f.region), f.region.length, k, left, multi);
    case "noDanglingEdges":
      if (leg > 0)
        return edgeContinuation(
          left,
          say.basis.outlined(cells(f.corner), ["corner", "corner"]),
        );
      return say.noDanglingEdges(cells(f.corner), left);
    case "equivalentEdges":
      if (leg > 0) return edgeContinuation(left, say.basis.region(cells(f.region)));
      return say.equivalentEdges(cells(f.region), clues[f.clue], left, multi);
    case "inside":
      if (leg > 0) return edgeContinuation(left, say.basis.region(cells(f.region)));
      return say.inside(cells(f.region), left);
  }
}

/** The hint's rungs: the ladder's techniques, in its order. */
const PALISADE_RUNGS = palisadeLadderIds;
type PalisadeRung = PalisadeRule;

/**
 * The deduction from the player's own marks to the end, as one journey per
 * firing. Refuses only when the deduction has nothing left to set, which on
 * an Unreasonable board is before the end.
 */
function hint(
  state: PalisadeState,
): HintResult<PalisadeMove, PalisadeHint, PalisadeRung> {
  const walk = hintFirings(
    state,
    state.clues,
    state.borders,
    stepBudget("palisade hint"),
  );
  const { plan } = deduceHintPlan<Uint8Array, PalisadeFiring, boolean>({
    board: walk.borders,
    status: (borders) => isSolved(state, state.clues, borders),
    incomplete: false,
    next: () => walk.next(),
  });
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };

  const steps = plan.flatMap((f) =>
    borderHintJourney<PalisadeMove, PalisadeRung>(
      f.kind,
      f.edges,
      // The one region a sentence is about is striped (docs/hints-marks.md
      // § "Hatch the line the sentence names"); a clue, a corner or the two
      // regions a join would merge are outlined. The words say which.
      (leg, left) => explain(f, state.clues, state.w, state.k, leg, left),
      (edits): PalisadeMove => ({ type: "edges", edits }),
    ),
  );
  return { ok: true, steps };
}

// --- Game object -----------------------------------------------------------

function hintKeepTrack(
  m: PalisadeMove,
  step: HintStep<PalisadeMove, PalisadeHint>,
  state: PalisadeState,
): HintTrackVerdict {
  return borderHintKeepTrack(
    m.type === "edges" ? m.edits : null,
    step,
    state.w,
    state.borders,
  );
}

export const palisadeGame: Game<
  PalisadeParams,
  PalisadeState,
  PalisadeMove,
  PalisadeUi,
  PalisadeDrawState,
  PalisadeMistake,
  PalisadeHint,
  PalisadeRung
> = {
  id: "palisade",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  status,

  solve: (orig, _curr) =>
    solveFromAnswer(answerOf(orig), (sol) => ({
      type: "solve",
      borders: Array.from(sol, (b) => (b & BORDER_MASK) | DISABLED(~b & BORDER_MASK)),
    })),
  // Easy is what the ladder finishes and the hint, which walks the same
  // ladder from the player's edges, finishes too.
  difficulty: searchTierContract<PalisadeParams, PalisadeState>({
    newState,
    deductionFinishes: (state) =>
      solveToBorders(state, state.clues) !== null && hintFinishes(palisadeGame, state),
    answerOf,
  }),

  findMistakes,
  clearMistakes: (state, mistakes) => {
    const edits = clearBorderEdges(state, mistakes);
    return edits.length > 0 ? [{ type: "edges", edits }] : [];
  },
  revealOne: (state, solved) => {
    const edits = revealBorderEdge(state, solved);
    return edits === null ? null : { type: "edges", edits };
  },
  hint,
  hintMarks: {
    roles: {
      ring: BORDER_RING_LEGEND,
      outline:
        'what the step reasons from, inside its squares: the clue it counts, the two clues either side of an edge, the four squares meeting at "this corner", or the two regions a join would merge.',
      stripes:
        'the one region the sentence is about: "this region", or "the same region" two edges both border.',
    },
  },
  hintRungs: PALISADE_RUNGS,
  hintKeepTrack,
  hintGesture: (s, ui, ds, m, step) => {
    if (m.type !== "edges") throw new Error("palisade: a hint only sets edges");
    return verbClicks(targetVerbs, { executeMove, hintKeepTrack }, s, ui, ds, step, [
      borderStepEdge(m.edits),
    ]);
  },

  textFormat,
  statusbarText: (s) => `Region size: ${s.k}`,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(palisadeGame);
