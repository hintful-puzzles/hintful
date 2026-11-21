/**
 * Sticks' solver: the ladder `sticks.description.yaml` states, compiled, on the
 * engine's marks and runner (`engine/solve/cell-marks.ts` and `ladder-runtime.ts`),
 * the answer check its rules compile to, and the search beneath the ladder.
 *
 * Every technique is upstream's one (`sticks_try`): suppose a line in a blank
 * square and see a number broken at once, so the square's line runs the other
 * way. The description states each way a number breaks as its own technique,
 * a `with` premise read on the marks with nothing propagated: a block with
 * too many lines or too few open sides, a line too long, a line carrying two
 * numbers, and a line left no room to reach its number.
 *
 * Beneath the ladder, a search by trial and error over it
 * ({@link searchAnswers}) counts a board's answers. It is what an
 * Unreasonable board is dealt by, and what Solve and the mistake check know
 * the answer from at either tier. The hint never runs it.
 */

import type { Dsf } from "../../engine/board/dsf.ts";
import type { RulesOf } from "../../engine/contract/rules.ts";
import { entryMistakes } from "../../engine/hint/entry-mistakes.ts";
import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers as searchBoard,
} from "../../engine/solve/answer-search.ts";
import { CellMarks } from "../../engine/solve/cell-marks.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
} from "../../engine/solve/describe-runtime.ts";
import { describedRules } from "../../engine/solve/described-rules.ts";
import {
  describedLadder,
  type Ladder,
  type LadderEntry,
  ladderTechniques,
  runLadder,
  TIERS,
} from "../../engine/solve/ladder-runtime.ts";
import * as sticks from "../../generated/games/sticks/sticks.compiled.ts";
import {
  F_BLOCK,
  F_HOR,
  F_VER,
  type SticksMistake,
  type SticksState,
} from "./state.ts";

/** The kinds of step a hint can be, which the description's `says` names. */
export const STICKS_RUNGS = sticks.SAYS_KINDS;
export type SticksRung = (typeof STICKS_RUNGS)[number];

/** What the description reads a square as holding: a line across, a line up
 * and down, or a block. */
const ACROSS = 1;
const DOWN = 2;
const BLOCK = 3;

/** A board as its blocks, lines and numbers: a state, or a board being dealt. */
interface Board {
  w: number;
  h: number;
  grid: Uint8Array;
  numbers: Int16Array;
}

/** The values the description reads off a grid of flag bytes. */
function valuesOf(grid: Uint8Array): Uint8Array {
  return grid.map((cell) =>
    cell & F_BLOCK ? BLOCK : cell & F_HOR ? ACROSS : cell & F_VER ? DOWN : 0,
  );
}

/** The board as the description deals it: its blocks, the numbers on its
 * lines and the numbers on its blocks. */
export function dealtOf({ w, h, grid, numbers }: Board): sticks.Dealt {
  const blocks: number[] = [];
  const lengths: number[] = [];
  const lengthValues: number[] = [];
  const joins: number[] = [];
  const joinValues: number[] = [];
  for (let c = 0; c < w * h; c++) {
    const block = (grid[c] & F_BLOCK) !== 0;
    if (block) blocks.push(c);
    if (numbers[c] === -1) continue;
    (block ? joins : lengths).push(c);
    (block ? joinValues : lengthValues).push(numbers[c]);
  }
  return {
    block: clueList(blocks, new Array<number>(blocks.length).fill(0), w * h),
    length: clueList(lengths, lengthValues, w * h),
    joins: clueList(joins, joinValues, w * h),
  };
}

/** The space a board's ladder runs on. */
function sticksSpace(w: number, h: number): GridSpace {
  return describedSpace(sticks.units, w, h);
}

/** The marks over `values`, every blank square open both ways. */
function sticksMarks(sp: GridSpace, dl: sticks.Dealt, values: Uint8Array): CellMarks {
  const m = new CellMarks(sp, ~0, values);
  // A square holds a line or a block, never both, so the seed cannot clash.
  m.seed(values, (c) => sticks.domainOf(sp, dl, c));
  return m;
}

/** Run the ladder on `m` to a fixpoint and say what it reached. */
function deduce(m: CellMarks, ladder: Ladder, dl: sticks.Dealt): Deduced {
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: 0 }, {});
  if (runLadder(m, techniques)) return "contradiction";
  if (m.grid.includes(0)) return "stuck";
  return sticks.isAnswer(m.grid, m.sp, dl) ? "solved" : "contradiction";
}

/** Whether the ladder alone finishes the board from its blocks and numbers.
 * The lines `grid` holds are not read. */
export function deductionFinishes(board: Board): boolean {
  const dl = dealtOf(board);
  const blocks = valuesOf(board.grid.map((cell) => cell & F_BLOCK));
  const m = sticksMarks(sticksSpace(board.w, board.h), dl, blocks);
  return deduce(m, describedLadder(sticks, dl), dl) === "solved";
}

/** The board as its rules read it: a line is its way, a block a block, an
 * open square undecided. */
export const rules: RulesOf<SticksState> = describedRules(sticks, {
  grid: (s) => valuesOf(s.grid),
  size: (s) => [s.w, s.h],
  deals: (s) => [dealtOf(s)],
});

/** Whether a state's lines are an answer to its board, by the rules the
 * description compiles to. */
export function isSolved(state: SticksState): boolean {
  return rules.isAnswer(state, rules.grid(state));
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a board's answers; the one answer is the
 * grid with every white square's line. */
export type SticksAnswer = Answer<Uint8Array>;

/**
 * The positions a search may try before it gives up, each one a blank square
 * assumed to hold a line one way and the deduction run from it.
 *
 * It decides which Unreasonable boards exist: a board that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a board's answers up to two, by trial and error over the ladder:
 * where it stops, take the first blank square and assume its line runs
 * across, and then up and down. `grid` is read for its blocks only.
 */
export function searchAnswers(
  board: Board,
  budget: number = SEARCH_BUDGET,
): SticksAnswer {
  const dl = dealtOf(board);
  const ladder = describedLadder(sticks, dl);
  const sp = sticksSpace(board.w, board.h);
  return searchBoard<CellMarks, Uint8Array>({
    start: sticksMarks(sp, dl, valuesOf(board.grid.map((cell) => cell & F_BLOCK))),
    deduce: (m) => deduce(m, ladder, dl),
    assume(m) {
      const at = m.grid.indexOf(0);
      if (at < 0) return [];
      return [ACROSS, DOWN].map((d) => {
        const sub = new CellMarks(sp, m.domain, m.grid.slice());
        sub.cands.set(m.cands);
        sub.place(at, d);
        return sub;
      });
    },
    solution: (m) =>
      Uint8Array.from(m.grid, (d) =>
        d === BLOCK ? F_BLOCK : d === ACROSS ? F_HOR : F_VER,
      ),
    budget,
  });
}

/** Keyed on a state's clues, which every state of a game shares. */
const answers = answerCache<Int16Array, Uint8Array>();

/** What a search of a state's blocks and clues established about their
 * answers. The player's lines are not read. */
export function answerOf(state: SticksState): SticksAnswer {
  return answers(state.numbers, () => searchAnswers(state));
}

// --- the hint's walk ---------------------------------------------------------

/**
 * What the hint walks: a state's lines as the description's marks and its
 * ladder, whose firings the hint says (`hint.ts`). The walk carries on from the
 * squares the last firing decided (`ladderWalk`), so a hint finishes the number
 * it is working on before it moves on.
 */
export function hintWalk(state: SticksState): {
  marks: CellMarks;
  entries: readonly LadderEntry[];
} {
  const dl = dealtOf(state);
  return {
    marks: sticksMarks(sticksSpace(state.w, state.h), dl, valuesOf(state.grid)),
    entries: describedLadder(sticks, dl).entries,
  };
}

/**
 * Flag every white cell whose placed line contradicts the board's one
 * answer, which the search found at either tier
 * (docs/solver-and-generator.md § "The solvable-game contract"). A
 * *missing* line is merely incomplete, never a mistake. Returns `[]` where
 * the search did not prove there is exactly one.
 */
export function findMistakes(state: SticksState): SticksMistake[] {
  const answer = answerOf(state);
  if (answer.kind !== "one") return [];
  const { grid } = state;
  // A square's mark is its stick's direction; the other flags are not the
  // player's answer.
  const stick = (flags: ArrayLike<number>) =>
    Array.from(flags, (f) => f & (F_HOR | F_VER));
  return entryMistakes(
    {
      answer: stick(answer.solution),
      entry: stick(grid),
      fixed: (i) => (grid[i] & F_BLOCK) !== 0,
    },
    (index) => ({ index }),
  );
}

// --- lines as segments -------------------------------------------------------

/** Merge adjacent same-orientation line cells into segments. */
export function sticksMakeDsf(grid: Uint8Array, w: number, h: number, dsf: Dsf): void {
  dsf.reinit();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (x < w - 1 && grid[i] & F_HOR && grid[i + 1] & F_HOR) dsf.merge(i, i + 1);
      if (y < h - 1 && grid[i] & F_VER && grid[i + w] & F_VER) dsf.merge(i, i + w);
    }
  }
}
