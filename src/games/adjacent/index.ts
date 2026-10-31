/**
 * Adjacent — the Adjacent mode of `unequal.c`, a game of its own. Fill an
 * `order × order` grid so every row and column holds each number `1..order`
 * once, with a bar between two neighbors exactly where their numbers differ by
 * one. The board, its input and its drawing are the shared edge-clue Latin
 * square's (`engine/edge-clue-latin/`), which Unequal plays too; what is
 * Adjacent's is its bar.
 */

import { MAX_CANDIDATE_VALUE } from "../../engine/candidate-bits.ts";
import {
  type CandidatePlanPrefs,
  candidateGesture,
  candidateHint,
  keepCandidateHintTrack,
  type Mark,
  refreshCandidateHintStep,
} from "../../engine/candidate-hint.ts";
import {
  LATIN_RUNGS,
  type PlanRung,
  runLatinCandidatePlan,
  valuesOf,
} from "../../engine/candidate-plan.ts";
import { difficultyItem } from "../../engine/difficulty.ts";
import { newEdgeClueDesc } from "../../engine/edge-clue-latin/generator.ts";
import { edgeClueVocab } from "../../engine/edge-clue-latin/hint-text.ts";
import {
  changedState,
  type EdgeClueMistake,
  edgeClueDifficulty,
  edgeClueKeys,
  executeMove,
  findMistakes,
  interpretMove,
  markAll,
  solve,
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
import { recordEdgeClueDeductions } from "../../engine/edge-clue-latin/solver.ts";
import {
  DIFF_EXTREME,
  DIFF_NAMES,
  diffFromLevel,
  diffToLevel,
  type EdgeClueMove,
  type EdgeClueParams,
  type EdgeClueState,
  type EdgeClueUi,
  encodeParams,
  newState,
  newUi,
  status,
  textFormat,
} from "../../engine/edge-clue-latin/state.ts";
import type {
  Game,
  HintResult,
  HintStep,
  HintTrackVerdict,
} from "../../engine/game.ts";
import {
  latinPremise,
  narrateLatinReason,
  type Premise,
} from "../../engine/hint-text.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { numberItem, squareSize } from "../../engine/params.ts";
import {
  autoPencilPref,
  candidateReadingPref,
  pencilKeepHighlightPref,
  stickyPencilPref,
} from "../../engine/pencil-prefs.ts";
import { registerGame } from "../../engine/registry.ts";
import { SQUARE_GRID } from "../../engine/sections.ts";
import { say } from "./hint-text.ts";
import type { HintOp, HintReason } from "./solver.ts";
import { BARS, decodeParams, defaultParams, menu, validateParams } from "./state.ts";

// --- hint ------------------------------------------------------------------

/** Why a strike is forced (docs/hints.md § "Writing the narration"):
 * indication, then reasoning, which the walk concludes with the move it makes.
 * `ns` is the struck value list; `o` is the grid order. The words, and how they
 * read at the value extremes, are [`hint-text.ts`](./hint-text.ts)'s. */
function premise(reason: HintReason, marks: readonly Mark[], o: number): Premise {
  const ns = valuesOf(marks);
  // A bar deduction outlines the struck cell *and* the cell across the bar, or
  // across where none is, so the player sees the pair.
  const pair = (r: { ox: number; oy: number }) => ({
    at: { x: marks[0].x, y: marks[0].y },
    other: { x: r.ox, y: r.oy },
  });
  switch (reason.kind) {
    case "adjacent":
      return { premise: say.adjacent(pair(reason), reason.bar, reason.v, o) };
    case "adjacentSet":
      return { premise: say.adjacentSet(pair(reason), reason.bar, ns, o) };
    // The generic Latin arms (dup / set) read identically to Keen's
    // — narrated once, shared.
    default:
      return latinPremise(reason, marks, edgeClueVocab(o));
  }
}

/** Why a placement is forced: always a generic single, since no bar places. */
function narrate(reason: HintReason, m: Mark, o: number): Sentence {
  switch (reason.kind) {
    case "adjacent":
    case "adjacentSet":
      throw new Error(`a ${reason.kind} deduction strikes`);
    default:
      return narrateLatinReason(reason, m, o, edgeClueVocab(o));
  }
}

/** Every rung an Adjacent step can be: the Latin family's, and the kinds of
 * `BarReason`. */
export const ADJACENT_RUNGS = [...LATIN_RUNGS, "adjacent", "adjacentSet"] as const;
export type AdjacentRung = (typeof ADJACENT_RUNGS)[number];

/** Build the hint plan by walking a working copy of the board the way a person
 * solves it (`runLatinCandidatePlan`), under the player's two pencil
 * preferences. */
function buildSteps(
  state: EdgeClueState,
  { autoClean, reading }: CandidatePlanPrefs,
): HintStep<EdgeClueMove, EdgeClueHint, AdjacentRung>[] {
  const o = state.order;
  const steps: HintStep<EdgeClueMove, EdgeClueHint, PlanRung<HintReason>>[] = [];
  const wGrid = Int8Array.from(state.grid);
  const maxdiff = Math.min(diffToLevel(state.diff), DIFF_EXTREME);
  runLatinCandidatePlan<EdgeClueMove, EdgeClueHint, HintOp, HintReason>({
    w: o,
    steps,
    grid: wGrid,
    pencil: Int32Array.from(state.pencil),
    autoClean,
    reading,
    label: "adjacent hint plan",
    record: () =>
      recordEdgeClueDeductions(
        o,
        BARS,
        state.clueFlags,
        Uint8Array.from(wGrid),
        maxdiff,
      ) as HintOp[],
    placeWords: (m, reason) => ({ words: narrate(reason, m, o) }),
    strikeWords: (marks, reason) => premise(reason, marks, o),
    // The narration names a cell's relationship to its neighbor, so a firing is
    // one leg per cell: a bar's two ends are two legs.
    strikeAxis: (op) => op.y * o + op.x,
    notes: { noun: "number", placedVerb: "standing", value: edgeClueVocab(o).value },
  });
  return steps;
}

function hint(
  state: EdgeClueState,
  _aux?: string,
  ui?: EdgeClueUi,
): HintResult<EdgeClueMove, EdgeClueHint, AdjacentRung> {
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

export const adjacentGame: Game<
  EdgeClueParams,
  EdgeClueState,
  EdgeClueMove,
  EdgeClueUi,
  EdgeClueDrawState,
  EdgeClueMistake,
  EdgeClueHint,
  AdjacentRung
> = {
  id: "adjacent",
  markAll,

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig: [
    numberItem<EdgeClueParams>("size", "Size", "order", {
      doc: "Width and height of the grid, which is also the largest number in it. Above 9, the numbers are written 0 to 9 and then A, B, C and so on, so each still takes one character. Tricky or above needs a size of at least 5.",
      // One more would not fit a candidate mask (`engine/candidate-bits.ts`).
      bounds: { min: 3, max: MAX_CANDIDATE_VALUE },
      label: { slot: "size", words: squareSize("order") },
    }),
    difficultyItem(DIFF_NAMES, {
      get: (p: EdgeClueParams) => diffToLevel(p.diff),
      set: (p: EdgeClueParams, tier: number) => {
        p.diff = diffFromLevel(tier);
      },
    }),
  ],

  newDesc: (p, rng) => newEdgeClueDesc(BARS, p, rng),
  newState: (p, desc) => newState(BARS, p, desc),
  newUi,
  changedState,

  interpretMove,
  executeMove,
  status,
  notApplicable: { transposeParams: SQUARE_GRID },

  solve,
  difficulty: edgeClueDifficulty(BARS),
  hint,
  hintRungs: ADJACENT_RUNGS,
  hintMarks: {
    roles: {
      ring: "the cell the step fills in with a number.",
      strike: "the pencil marks the step crosses out.",
      outline:
        'what the step reasons from: the two cells either side of a bar, or of no bar at all (the one whose marks are struck, and "its neighbor"), the cells that already account for the numbers being crossed out, the number just placed, or "the middle cell" a step weighs and the cells it reads.',
      stripes:
        'the row or column the sentence names: "in this row". Or the several it names together, such as "these 2 columns", where one number fits only the outlined cells.',
    },
  },
  hintKeepTrack,
  // The middle of a cell, clear of the gaps a press there would read as a
  // clue's spent flag.
  hintGesture: (s, ui, ds, m) => {
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
  refreshHintStep,
  findMistakes,
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

  animLength: () => 0,
};

registerGame(adjacentGame);
