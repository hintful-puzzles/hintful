/**
 * Wordtrail's explained hint: the solver's compiled ladder walked one firing
 * at a time from the player's own lines and crosses (`wordtrailWalk`), and
 * each firing turned into a step (docs/hints.md § "Recording the
 * deduction"). The sentences are
 * [`wordtrail.description.yaml`](./wordtrail.description.yaml)'s.
 *
 * Every fact a step rests on is a line or a cross on the board, read against
 * the trails that spell a word: the ladder reads nothing else.
 */

import { describedEdgeHint } from "../../engine/described-edge-hint.ts";
import { EDGE, trackEdgeStep } from "../../engine/edge-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { Point } from "../../engine/types.ts";
import {
  STATED,
  type SuppliedById,
} from "../../generated/games/wordtrail/wordtrail.compiled.ts";
import {
  type WordtrailRung,
  type WordtrailSays,
  type WordtrailWalkContext,
  wordtrailWalk,
} from "./solver.ts";
import {
  DIFF_NORMAL,
  executeMove,
  type WordtrailMove,
  type WordtrailState,
} from "./state.ts";
import { letterChar } from "./trails.ts";

/** A step draws nothing beyond its words' marks and the move it asks for. */
export type WordtrailHighlights = Record<string, never>;

/** The edges a firing decides, as the game numbers them. */
interface Fired {
  edges: number[];
}

/** The words trails spell, by their clue indices, in capitals as the board
 * draws its letters, alphabetical. */
const spelled = (state: WordtrailState, trails: readonly number[]): string[] =>
  trails
    .map((k) =>
      state.trails[k]
        .map((i) => letterChar(state.letters[i]))
        .join("")
        .toUpperCase(),
    )
    .sort();

/** The plan from the player's lines and crosses. */
export const { hint: wordtrailHint, judgeMove: wordtrailJudgeMove } = describedEdgeHint<
  WordtrailState,
  WordtrailMove,
  WordtrailHighlights,
  Fired,
  WordtrailWalkContext,
  WordtrailSays,
  WordtrailRung,
  number,
  Point,
  SuppliedById
>({
  name: "wordtrail hint",
  walk: (state) => wordtrailWalk(state),
  // The whole ladder, from the Easy rungs up.
  tiers: { lowest: () => DIFF_NORMAL, count: DIFF_NORMAL + 1 },
  done: (_marks, ctx) => ctx.complete(),
  step: ({ taken, ctx }) => {
    const changes = ctx.decided(taken);
    return [
      {
        move: { kind: "edges", changes },
        highlights: {},
        marked: { edges: changes.map((c) => c.edge) },
      },
    ];
  },
  stated: STATED,
  // The words the firing's trails spell, as the board writes its letters.
  supplied: {
    onlyWord: (_marked, state, { trails }) => ({
      terms: { trailWords: spelled(state, trails) },
    }),
    onlyLength: (_marked, state, { trails }) => ({
      terms: { trailWords: spelled(state, trails) },
    }),
  },
  ringKind: EDGE,
  ring: ({ edges }) => edges,
  width: (state) => state.w,
});

/** Judge a move against the step on show by what it did to the edges, which
 * a solve never makes a step of. */
export function wordtrailKeepTrack(
  move: WordtrailMove,
  step: HintStep<WordtrailMove>,
  state: WordtrailState,
): HintTrackVerdict {
  if (move.kind !== "edges" || step.move.kind !== "edges") return "off";
  return trackEdgeStep(
    step,
    step.move.changes,
    state.edges,
    executeMove(state, move).edges,
    (changes): WordtrailMove => ({ kind: "edges", changes }),
  );
}
