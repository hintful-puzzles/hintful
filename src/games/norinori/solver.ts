/**
 * Norinori's deductions: the ladder `norinori.description.yaml` states,
 * compiled, on the engine's marks and runner (`engine/ladder-runtime.ts`),
 * and the answer check its rules compile to.
 *
 * {@link solveNorinori} runs the ladder to a fixpoint, which is how the
 * generator grades a board and how Solve and the mistake check find the
 * answer. {@link hintWalk} hands the engine the ladder to take one firing at
 * a time, and the hint narrates each (docs/solver-and-generator.md § "One
 * engine, two projections").
 *
 * Every technique only ever decides a square the rules force, so a board the
 * ladder finishes has exactly one answer.
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import { describedSpace, partition } from "../../engine/describe-runtime.ts";
import type { DifficultyVerdict } from "../../engine/difficulty.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  type LadderEntry,
  ladderTechniques,
  runLadder,
  TIERS as SCALE,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import * as norinori from "../../generated/games/norinori/norinori.compiled.ts";
import { BLANK, CROSSED, DIFF_TRICKY, type NorinoriMark, SHADED } from "./state.ts";

/** The rungs, easiest first: the techniques whose firings a hint says. */
export const NORINORI_RUNGS = norinori.SAYS_KINDS;
export type NorinoriRung = (typeof NORINORI_RUNGS)[number];

/** The board the ladder works on: the regions, and a grid of
 * {@link NorinoriMark}s it writes as it goes. */
export interface NorinoriBoard {
  w: number;
  h: number;
  regions: Int32Array;
  grid: Uint8Array;
}

/** Each region's squares, in reading order. */
export function areasOf(regions: Int32Array): number[][] {
  const areas: number[][] = [];
  regions.forEach((r, i) => {
    areas[r] ??= [];
    areas[r].push(i);
  });
  return areas;
}

/** The board's regions as the description reads them. */
function dealtOf(board: NorinoriBoard): norinori.Dealt {
  return { region: partition(areasOf(board.regions), board.grid.length) };
}

/** The ladder over the regions `dealt` deals. */
function norinoriLadder(dealt: norinori.Dealt): Ladder {
  return describedLadder(norinori, {
    domino: uncluedRung(norinori.domino),
    partner: uncluedRung(norinori.partner),
    between: uncluedRung(norinori.between),
    alone: uncluedRung(norinori.alone),
    claimed: compiledRung(norinori.claimed, dealt),
    fullRegion: compiledRung(norinori.fullRegion, dealt),
    exactRegion: compiledRung(norinori.exactRegion, dealt),
    neededRegion: compiledRung(norinori.neededRegion, dealt),
    blocked: compiledRung(norinori.blocked, dealt),
    crowded: compiledRung(norinori.crowded, dealt),
  });
}

/** The values a square may hold: shaded or clear. */
const DOMAIN = (1 << SHADED) | (1 << CROSSED);

/** The marks the ladder reads, on `board.grid` itself. */
function marksOf(board: NorinoriBoard): CellMarks {
  const m = new CellMarks(
    describedSpace(norinori.units, board.w, board.h),
    DOMAIN,
    board.grid,
  );
  m.seed(board.grid);
  return m;
}

/** Whether every region holds two shaded squares and every shaded square
 * one shaded neighbor, by the rules the description compiles to. A blank
 * square counts as clear, so a player need mark nothing clear to finish. */
export function isComplete(board: NorinoriBoard): boolean {
  return norinori.isAnswer(
    board.grid.map((m) => (m === SHADED ? SHADED : CROSSED)),
    describedSpace(norinori.units, board.w, board.h),
    dealtOf(board),
  );
}

/**
 * Solve in place with the ladder capped at tier `cap`, and say how it ended.
 * `firings` takes a count of each rung's firings, for a census.
 */
export function solveNorinori(
  board: NorinoriBoard,
  cap: number,
  firings?: FiringTally,
): DifficultyVerdict {
  const m = marksOf(board);
  const { entries } = norinoriLadder(dealtOf(board));
  const impossible = runLadder(m, ladderTechniques(m, entries, { [SCALE]: cap }, {}), {
    firings,
  });
  if (impossible) return "impossible";
  if (board.grid.includes(BLANK)) return "unsolved";
  return isComplete(board) ? "solved" : "impossible";
}

/** The answer to a board's regions, or `null` where the ladder does not
 * reach one. */
export function answerOf(
  w: number,
  h: number,
  regions: Int32Array,
): readonly NorinoriMark[] | null {
  const board: NorinoriBoard = { w, h, regions, grid: new Uint8Array(w * h) };
  if (solveNorinori(board, DIFF_TRICKY) !== "solved") return null;
  return Array.from(board.grid, (m) => m as NorinoriMark);
}

/**
 * What the hint walks: the player's marks on a copy of the board, and the
 * ladder (every tier: a board that arrives by its ID carries no tier, and the
 * ladder tries its easier techniques first). The engine takes one firing at a
 * time from it, the one that carries on from the squares the last decided
 * (`engine/described-firing-hint.ts`).
 */
export function hintWalk(state: NorinoriBoard): {
  marks: CellMarks;
  entries: readonly LadderEntry[];
} {
  const board: NorinoriBoard = { ...state, grid: state.grid.slice() };
  return { marks: marksOf(board), entries: norinoriLadder(dealtOf(board)).entries };
}
