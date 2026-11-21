/**
 * Clusters' solver: the ladder `clusters.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/solve/cell-marks.ts` and
 * `ladder-runtime.ts`), with the walk a hint takes over it; the answer check
 * its rules compile to, and where a board breaks them; and the search for a
 * board's answers over the ladder.
 *
 * Easy's techniques each refute one color of one square by the rule it would
 * break at once, at the square or at a tile beside it. Normal's read two
 * tiles' counts over the squares both touch. Upstream's Normal ran the Easy
 * fixpoint from a supposed color, a Search, which the count replaced on
 * 2026-10-28; a board that needs it is Unreasonable, and the search for its
 * answer is {@link answerSearch}. The generator is solver-gated, so this
 * ladder's verdict on every board it tries decides which puzzles exist.
 */

import type { RulesOf } from "../../engine/contract/rules.ts";
import { type Answer, searchAnswers } from "../../engine/solve/answer-search.ts";
import { CellMarks } from "../../engine/solve/cell-marks.ts";
import { cluesWhere, describedSpace } from "../../engine/solve/describe-runtime.ts";
import { describedRules } from "../../engine/solve/described-rules.ts";
import {
  describedLadder,
  type LadderEntry,
  ladderTechniques,
  runLadder,
  TIERS as SCALE,
} from "../../engine/solve/ladder-runtime.ts";
import * as clusters from "../../generated/games/clusters/clusters.compiled.ts";
import {
  type ClustersState,
  COLMASK,
  DIFF_NORMAL,
  F_COLOR_0,
  F_COLOR_1,
  F_SINGLE,
} from "./state.ts";

export const COMPLETE = 0;
export const UNFINISHED = 1;
export const INVALID = 2;
export type ClustersStatus = typeof COMPLETE | typeof UNFINISHED | typeof INVALID;

// --- where the board breaks its rules ----------------------------------------

/** Every tile that breaks a rule (`rules`), in reading order: a tile that
 * can no longer touch two of its own color, and a dot that can no longer
 * touch exactly one. For `findMistakes` and the live-error renderer. */
export function findErrors(grid: Uint8Array, w: number, h: number): number[] {
  const state = { w, h, grid };
  const dots = dealtOf(grid).dot.at;
  const at = new Set<number>();
  for (const v of rules.violations(state, rules.grid(state)))
    at.add(v.clue >= 0 ? dots[v.clue] : v.at[0]);
  return [...at].sort((a, b) => a - b);
}

/** Whether `grid` breaks a rule, is unfinished, or is complete. */
export function clustersStatus(grid: Uint8Array, w: number, h: number): ClustersStatus {
  if (findErrors(grid, w, h).length > 0) return INVALID;
  if (grid.some((tile) => (tile & COLMASK) === 0)) return UNFINISHED;
  return isAnswer(grid, w, h) ? COMPLETE : INVALID;
}

// --- the described ladder ------------------------------------------------------

/** The kinds of step a hint can be, which the description's `says` names:
 * a refutation by the rule the refuted color breaks (at the square or at the
 * tile beside it: no room for its color, too little room, or a dot that has
 * its one), then Normal's two readings of a pair of tiles' counts. */
export const CLUSTERS_RUNGS = clusters.SAYS_KINDS;
export type ClustersRung = (typeof CLUSTERS_RUNGS)[number];

/** The board's dots as the description reads them: where each is and its
 * color. */
function dealtOf(grid: Uint8Array): clusters.Dealt {
  return {
    dot: cluesWhere(
      grid,
      (tile) => (tile & F_SINGLE) !== 0,
      (tile) => tile & COLMASK,
    ),
  };
}

/** The values a square may hold: either color. */
const DOMAIN = (1 << F_COLOR_0) | (1 << F_COLOR_1);

/** The marks the ladder reads, on `colors`, each square's color or 0. */
function marksOf(colors: Uint8Array, w: number, h: number): CellMarks {
  const m = new CellMarks(describedSpace(clusters.units, w, h), DOMAIN, colors);
  m.seed(colors);
  return m;
}

/** The board as its rules read it: each square's color, or 0. */
export const rules: RulesOf<ClustersState> = describedRules(clusters, {
  grid: (s) => s.grid.map((tile) => tile & COLMASK),
  size: (s) => [s.w, s.h],
  deals: (s) => [dealtOf(s.grid)],
});

/** Whether every square of `grid` holds a color and the rules hold of them,
 * by the rules the description compiles to. */
export function isAnswer(grid: Uint8Array, w: number, h: number): boolean {
  return clusters.isAnswer(
    grid.map((tile) => tile & COLMASK),
    describedSpace(clusters.units, w, h),
    dealtOf(grid),
  );
}

/** How a run of the ladder over `colors` ended. */
function verdictOf(
  impossible: boolean,
  colors: Uint8Array,
  grid: Uint8Array,
  w: number,
  h: number,
): ClustersStatus {
  if (impossible) return INVALID;
  if (colors.includes(0)) return UNFINISHED;
  return isAnswer(grid, w, h) ? COMPLETE : INVALID;
}

/**
 * Run the ladder to a fixpoint capped at tier `maxdiff`, coloring `grid`'s
 * empty squares in place, and say how it ended: COMPLETE where it solved the
 * board, INVALID on a contradiction, UNFINISHED where it stopped short.
 */
export function solveGame(
  grid: Uint8Array,
  w: number,
  h: number,
  maxdiff: number,
): ClustersStatus {
  const colors = grid.map((tile) => tile & COLMASK);
  const m = marksOf(colors, w, h);
  const { entries } = describedLadder(clusters, dealtOf(grid));
  const impossible = runLadder(
    m,
    ladderTechniques(m, entries, { [SCALE]: maxdiff }, {}),
  );
  for (let i = 0; i < grid.length; i++) if (grid[i] === 0) grid[i] = colors[i];
  return verdictOf(impossible, colors, grid, w, h);
}

/** How many positions {@link answerSearch} may try. Lowering it refuses
 * boards in saved games: those of Unreasonable, and those dealt at Normal
 * before 2026-10-28, which may need the supposition Normal then had. Of 90 of
 * those, dealt at 7x7, 6x8 and 9x9, 74 do, and each took at most 25 positions
 * (2026-10-28). */
const ANSWER_BUDGET = 5000;

/**
 * The answers of the board `givens` holds, counted to two by trial and error
 * over the whole ladder: where it stops, an empty square is tried in each
 * color and the ladder run again. The answer is the board's tiles.
 */
export function answerSearch(
  givens: Uint8Array,
  w: number,
  h: number,
  budget = ANSWER_BUDGET,
): Answer<Uint8Array> {
  return searchAnswers<Uint8Array, Uint8Array>({
    start: givens.slice(),
    deduce: (grid) => {
      const status = solveGame(grid, w, h, DIFF_NORMAL);
      if (status === COMPLETE) return "solved";
      return status === INVALID ? "contradiction" : "stuck";
    },
    assume: (grid) => {
      const i = grid.indexOf(0);
      return [F_COLOR_0, F_COLOR_1].map((fill) => {
        const copy = grid.slice();
        copy[i] = fill;
        return copy;
      });
    },
    solution: (grid) => grid.slice(),
    budget,
  });
}

// --- the hint's walk ----------------------------------------------------------

/**
 * What a hint walks from the player's grid: the marks over the squares they
 * have colored, and the ladder's techniques (every tier: a plan on a board
 * that stalls is an Unreasonable board's, whose steps up to the stall are
 * deductions all the same). A firing is taken one at a time, the one that
 * carries on from the squares the last colored (`ladderWalk`).
 */
export function hintWalk(state: { grid: Uint8Array; w: number; h: number }): {
  marks: CellMarks;
  entries: readonly LadderEntry[];
} {
  const colors = state.grid.map((tile) => tile & COLMASK);
  return {
    marks: marksOf(colors, state.w, state.h),
    entries: describedLadder(clusters, dealtOf(state.grid)).entries,
  };
}
