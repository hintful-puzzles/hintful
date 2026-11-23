/**
 * Unequal — native TS port of `unequal.c`. Fill an `order × order` grid so every
 * row and column holds each number `1..order` once, subject to greater-than
 * signs between adjacent cells. The board, its input and its drawing are the
 * shared edge-clue Latin square's (`engine/edge-clue-latin/`), which Adjacent
 * plays too; what is Unequal's is its sign.
 */

import type {
  Game,
  HintResult,
  HintStep,
  HintTrackVerdict,
} from "../../engine/contract/game.ts";
import { CELL, type Sentence } from "../../engine/contract/hint-words.ts";
import { SQUARE_GRID } from "../../engine/contract/sections.ts";
import type { Point } from "../../engine/contract/types.ts";
import { newEdgeClueDesc } from "../../engine/edge-clue-latin/generator.ts";
import { edgeClueVocab } from "../../engine/edge-clue-latin/hint-text.ts";
import {
  changedState,
  clearMistakes,
  type EdgeClueMistake,
  edgeClueDifficulty,
  edgeClueKeys,
  executeMove,
  findMistakes,
  interpretMove,
  markAll,
  revealOne,
  solve,
  spentDrag,
} from "../../engine/edge-clue-latin/play.ts";
import {
  colors,
  computeSize,
  coord,
  type EdgeClueDrawState,
  type EdgeClueHint,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "../../engine/edge-clue-latin/render.ts";
import {
  DIFF_HARD,
  diffToLevel,
  displayChar,
  type EdgeClueMove,
  type EdgeClueParams,
  type EdgeClueState,
  type EdgeClueUi,
  newState,
  newUi,
  rules,
  status,
  textFormat,
} from "../../engine/edge-clue-latin/state.ts";
import {
  type CandidatePlanPrefs,
  candidateGesture,
  candidateHint,
  keepCandidateHintTrack,
  type Mark,
  refreshCandidateHintStep,
} from "../../engine/hint/candidate-hint.ts";
import { candidateJudge } from "../../engine/hint/candidate-judge.ts";
import {
  type CandidateRung,
  type Firing,
  LATIN_RUNGS,
  type PlanRung,
  runLatinCandidatePlan,
  strikesOf,
  techniqueRung,
} from "../../engine/hint/candidate-plan.ts";
import {
  latinPremise,
  narrateLatinReason,
  type Premise,
} from "../../engine/hint/hint-text.ts";
import {
  byCell,
  latinNotesLadder,
  latinStrikeRungs,
} from "../../engine/hint/latin-notes.ts";
import {
  autoPencilPref,
  candidateReadingPref,
  pencilKeepHighlightPref,
  stickyPencilPref,
} from "../../engine/hint/pencil-prefs.ts";
import { statedParts } from "../../engine/hint/stated.ts";
import { registerGame } from "../../engine/midend/registry.ts";
import type {
  Firing as LadderFiring,
  Said,
} from "../../engine/solve/ladder-runtime.ts";
import * as unequal from "../../generated/games/unequal/unequal.compiled.ts";
import type { HintReason } from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  menu,
  paramConfig,
  SIGNS,
  validateParams,
} from "./state.ts";

// --- hint ------------------------------------------------------------------

/** Why a strike is forced (docs/hints.md § "Writing the narration"):
 * indication, then reasoning, which the walk concludes with the move it makes.
 * `o` is the grid order. The words, and how they read at the value extremes,
 * are [`hint-text.ts`](../../engine/hint/hint-text.ts)'s. */
function premise(reason: HintReason, marks: readonly Mark[], o: number): Premise {
  switch (reason.kind) {
    case "greater":
    case "lesser":
      return { premise: reason.premise };
    // The generic Latin arms (dup / set) read identically to Keen's
    // — narrated once, shared.
    default:
      return latinPremise(reason, marks, edgeClueVocab(o, unequal.WORDS.cell));
  }
}

/** Why a placement is forced: always a generic single, since no sign places. */
function narrate(reason: HintReason, m: Mark, o: number): Sentence {
  switch (reason.kind) {
    case "greater":
    case "lesser":
      throw new Error(`a ${reason.kind} deduction strikes`);
    default:
      return narrateLatinReason(reason, m, o, edgeClueVocab(o, unequal.WORDS.cell));
  }
}

/** A sign firing as legs, a cell each, each with the premise the description
 * states for that end of the sign. */
function signLegs(
  f: LadderFiring,
  o: number,
): Firing<EdgeClueMove, EdgeClueHint, HintReason> {
  const { terms, facts } = (f.reasons[0] as Said<unequal.SignBinding, unequal.SignSays>)
    .says;
  const strikes = strikesOf(f, o);
  const at = (c: number): Point => ({ x: c % o, y: (c / o) | 0 });
  return byCell(strikes).map((strike) => {
    const fact = facts[strikes.indexOf(strike[0])];
    const { look } = statedParts(unequal.STATED.sign.fact[fact.wording], {
      kind: CELL,
      at,
      ring: [],
      marks: {},
      terms: { ...terms, ...fact.terms },
      value: (n) => displayChar(n, o),
    });
    if (look === undefined)
      throw new Error(`sign's wording ${fact.wording} states no look`);
    return {
      strike,
      reason: {
        kind: strike[0].y * o + strike[0].x === terms.big ? "greater" : "lesser",
        premise: look,
      },
    };
  });
}

/** Every rung an Unequal step can be: the Latin family's, and the kinds of
 * `UnequalReason`. */
export const UNEQUAL_RUNGS = [...LATIN_RUNGS, "greater", "lesser"] as const;
export type UnequalRung = (typeof UNEQUAL_RUNGS)[number];

/** Build the hint plan by walking a working copy of the board the way a person
 * solves it (`runLatinCandidatePlan`), under the player's two pencil
 * preferences. */
function buildSteps(
  state: EdgeClueState,
  { autoClean, reading, judging }: CandidatePlanPrefs,
): HintStep<EdgeClueMove, EdgeClueHint, UnequalRung>[] {
  const o = state.order;
  const steps: HintStep<EdgeClueMove, EdgeClueHint, PlanRung<HintReason>>[] = [];
  const wGrid = Int8Array.from(state.grid);
  const on = latinNotesLadder(
    SIGNS.ladder(o, state.clueFlags),
    o,
    wGrid,
    Math.min(diffToLevel(state.diff), DIFF_HARD),
  );
  type Rung = CandidateRung<EdgeClueMove, EdgeClueHint, HintReason>;
  const sign: Rung = techniqueRung(on, "sign", (f) => signLegs(f, o));
  runLatinCandidatePlan<EdgeClueMove, EdgeClueHint, HintReason>({
    w: o,
    steps,
    grid: wGrid,
    pencil: Int32Array.from(state.pencil),
    autoClean,
    reading,
    judging,
    label: "unequal hint plan",
    placeWords: (m, reason) => ({ words: narrate(reason, m, o) }),
    strikeWords: (marks, reason) => premise(reason, marks, o),
    // The narration names one cell's notes, and a sign's its relationship to
    // its neighbor, so a firing is a leg a cell: a sign's two ends are two.
    rungs: [
      sign,
      ...latinStrikeRungs<EdgeClueMove, EdgeClueHint, HintReason>(on, o, byCell),
    ],
    notes: {
      noun: "number",
      placedVerb: "standing",
      cell: unequal.WORDS.cell,
      value: edgeClueVocab(o, unequal.WORDS.cell).value,
    },
  });
  return steps;
}

function hint(
  state: EdgeClueState,
  _aux?: string,
  ui?: EdgeClueUi,
): HintResult<EdgeClueMove, EdgeClueHint, UnequalRung> {
  return candidateHint(state, ui ?? newUi(state), buildSteps);
}

/** Classify a player move against the displayed hint step (shared
 * candidate-elimination keep-track; `EdgeClueHint` is structurally
 * `CandidateHighlights`). */
function hintKeepTrack(
  m: EdgeClueMove,
  step: HintStep<EdgeClueMove, EdgeClueHint>,
  state: EdgeClueState,
): HintTrackVerdict {
  return keepCandidateHintTrack(m, step, state.pencil, state.order);
}

/** Re-validate a stored hint step against the current board before it is
 * (re-)displayed (shared "never show a stale step" guarantee). */
function refreshHintStep(
  step: HintStep<EdgeClueMove, EdgeClueHint>,
  state: EdgeClueState,
): HintStep<EdgeClueMove, EdgeClueHint> | null {
  return refreshCandidateHintStep(step, state.grid, state.pencil, state.order);
}

export const unequalGame: Game<
  EdgeClueParams,
  EdgeClueState,
  EdgeClueMove,
  EdgeClueUi,
  EdgeClueDrawState,
  EdgeClueMistake,
  EdgeClueHint,
  UnequalRung
> = {
  id: "unequal",
  markAll,

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig,

  newDesc: (p, rng) => newEdgeClueDesc(SIGNS, p, rng),
  newState: (p, desc) => newState(SIGNS, p, desc),
  newUi,
  changedState,

  interpretMove,
  doneClues: spentDrag(SIGNS),
  executeMove,
  status,
  notApplicable: { transposeParams: SQUARE_GRID },

  solve,
  rules,
  difficulty: edgeClueDifficulty(SIGNS),
  hint: {
    plan: hint,
    judgeMove: (before, after, ui) =>
      candidateJudge(before, after, ui ?? newUi(before), buildSteps, unequal.NAMES),
    rungs: UNEQUAL_RUNGS,
    marks: {
      roles: {
        ring: "the cell the step fills in with a number.",
        strike: "the pencil marks the step crosses out.",
        outline:
          'what the step reasons from: the two cells either side of a sign (the one whose marks are struck, and "the outlined smaller side" or "larger side" across it), the cells that already account for the numbers being crossed out, the number just placed, or "the middle cell" a step weighs and the cells it reads.',
        stripes:
          'the row or column the sentence names: "in this row". Or the several it names together, such as "these 2 columns", where one number fits only the outlined cells.',
      },
    },
    keepTrack: hintKeepTrack,
    // The middle of a cell, clear of the gaps a press there would read as a
    // clue's spent flag.
    gesture: (s, ui, ds, m) => {
      const ts = ds.tileSize;
      const mid = (v: number) => coord(v, ts) + ((ts / 2) | 0);
      const keys = edgeClueKeys(s.order);
      return candidateGesture(
        m,
        ui,
        (x, y) => ({ x: mid(x), y: mid(y) }),
        (n) => keys[n - 1].button,
        undefined,
        markAll(s),
      );
    },
    refreshStep: refreshHintStep,
  },
  findMistakes,
  clearMistakes,
  revealOne,
  requestKeys: (p) => edgeClueKeys(p.order),
  textFormat,

  prefs: [
    autoPencilPref<EdgeClueUi>(
      "When you place a number, remove it from pencil marks in its row and column",
    ),
    stickyPencilPref<EdgeClueUi>(),
    pencilKeepHighlightPref<EdgeClueUi>(),
    candidateReadingPref<EdgeClueUi>(),
  ],

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
};

registerGame(unequalGame);
